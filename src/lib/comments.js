import { supabase } from "./supabaseClient";

function shapeComment(c, likesByComment, currentUserId) {
  const likers = likesByComment[c.id] || [];
  return {
    id: c.id,
    body: c.body,
    created_at: c.created_at,
    userId: c.user_id,
    username: c.profiles?.username || "Хэрэглэгч",
    parentId: c.parent_id,
    likeCount: likers.length,
    likedByMe: currentUserId ? likers.includes(currentUserId) : false,
  };
}

// One level of replies: top-level comments (newest first), each carrying a
// `replies` array (oldest first, natural conversation order).
export async function getComments(chapterId, currentUserId) {
  const { data, error } = await supabase
    .from("chapter_comments")
    .select("id, body, created_at, user_id, parent_id, profiles(username)")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const ids = data.map((c) => c.id);
  const likesByComment = {};
  if (ids.length > 0) {
    const { data: likes, error: likesErr } = await supabase
      .from("chapter_comment_likes")
      .select("comment_id, user_id")
      .in("comment_id", ids);
    if (likesErr) throw likesErr;
    likes.forEach((l) => {
      (likesByComment[l.comment_id] ??= []).push(l.user_id);
    });
  }

  const shaped = data.map((c) => shapeComment(c, likesByComment, currentUserId));
  const repliesByParent = {};
  shaped.filter((c) => c.parentId).forEach((r) => {
    (repliesByParent[r.parentId] ??= []).push(r);
  });

  return shaped
    .filter((c) => !c.parentId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((c) => ({ ...c, replies: repliesByParent[c.id] || [] }));
}

export async function addComment(chapterId, userId, body, parentId = null) {
  const { data, error } = await supabase
    .from("chapter_comments")
    .insert({ chapter_id: chapterId, user_id: userId, body, parent_id: parentId })
    .select("id, body, created_at, user_id, parent_id, profiles(username)")
    .single();
  if (error) throw error;
  return { ...shapeComment(data, {}, userId), replies: [] };
}

export async function toggleLike(commentId, userId, currentlyLiked) {
  if (currentlyLiked) {
    const { error } = await supabase
      .from("chapter_comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("chapter_comment_likes")
      .insert({ comment_id: commentId, user_id: userId });
    if (error) throw error;
  }
}

// For the Admin > Comments moderation view — every comment site-wide, most
// recent first, with enough context (series/chapter) to know what it's on.
// Shown as a flat list (replies included) since moderation doesn't need nesting.
export async function getAllComments(limit = 200) {
  const { data, error } = await supabase
    .from("chapter_comments")
    .select("id, body, created_at, profiles(username), chapters(chapter_number, series(id, title))")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    body: c.body,
    created_at: c.created_at,
    username: c.profiles?.username || "Хэрэглэгч",
    chapterNumber: c.chapters?.chapter_number,
    seriesId: c.chapters?.series?.id,
    seriesTitle: c.chapters?.series?.title || "—",
  }));
}

export async function deleteComment(id) {
  const { error } = await supabase.from("chapter_comments").delete().eq("id", id);
  if (error) throw error;
}
