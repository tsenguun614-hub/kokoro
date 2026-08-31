import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { baseCss, FONT_IMPORT } from "./sharedStyles";
import useWindowSize from "./useWindowSize";
import useAuth from "./lib/useAuth";
import { getProfile, signOut } from "./lib/auth";
import { getAllSeries, createSeries, updateSeriesRecord, setSeriesGenres, createChapterWithPages, deleteSeries as deleteSeriesApi, deleteChapter as deleteChapterApi, getChaptersForSeries, getAllImageUrls } from "./lib/series";
import { uploadCoverImage, uploadChapterPages, deleteCoverIfOwned, deleteFolder, compressImage, uploadFile, isOwnStorageUrl, pathFromPublicUrl } from "./lib/storage";
import { getGenres, createGenre, deleteGenre as deleteGenreApi } from "./lib/genres";
import { timeAgo, formatGenres } from "./lib/format";

function clampRating(val) {
  const n = Number(val);
  if (!Number.isFinite(n)) return 0;
  return Math.min(10, Math.max(0, n));
}

const css = `
  ${FONT_IMPORT}
  ${baseCss}

  .admin-input {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-family: 'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif;
    font-size: 13px; font-weight: 300;
    color: #f7f3ea; outline: none;
    transition: border-color 0.2s;
  }
  .admin-input:focus { border-color: rgba(201,168,76,0.5); }
  .admin-input::placeholder { color: rgba(247,243,234,0.2); }

  .admin-select {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-family: 'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif;
    font-size: 13px; font-weight: 300;
    color: #f7f3ea; outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .admin-select:focus { border-color: rgba(201,168,76,0.5); }

  .admin-textarea {
    width: 100%; padding: 11px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    font-family: 'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif;
    font-size: 13px; font-weight: 300;
    color: #f7f3ea; outline: none; resize: vertical;
    transition: border-color 0.2s;
    min-height: 100px;
  }
  .admin-textarea:focus { border-color: rgba(201,168,76,0.5); }

  .danger-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .danger-btn:hover { background: rgba(200,60,60,0.15) !important; border-color: rgba(200,60,60,0.4) !important; color: #e07070 !important; }

  .nav-item { cursor: pointer; transition: all 0.15s; border-radius: 6px; }
  .nav-item:hover { background: rgba(201,168,76,0.06) !important; }

  .series-row { transition: background 0.15s; }
  .series-row:hover { background: rgba(255,255,255,0.03) !important; }

  .upload-zone {
    border: 2px dashed rgba(201,168,76,0.2);
    border-radius: 8px; padding: 32px;
    text-align: center; cursor: pointer;
    transition: all 0.2s;
  }
  .upload-zone:hover {
    border-color: rgba(201,168,76,0.5);
    background: rgba(201,168,76,0.04);
  }

  .tab-btn { cursor: pointer; border: none; transition: all 0.2s; }
  .tab-btn:hover { color: #f7f3ea !important; }
`;

// ── ACCESS GATE ── (real Supabase auth + profiles.is_admin, enforced again server-side by RLS)
function AdminGate({ message, showSignIn }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", padding: "0 5%" }}>
      <div style={{ position: "fixed", top: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(100,60,160,0.1)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div className="fade-up" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "48px 40px", width: "100%", maxWidth: 380, boxShadow: "0 24px 80px rgba(0,0,0,0.5)", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23, margin: "0 auto 20px" }}>⬡</div>
        <h2 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 24, fontWeight: 700, color: "#f7f3ea", marginBottom: 6 }}>Admin Access</h2>
        <p style={{ fontSize: 13, color: "rgba(247,243,234,0.35)", fontWeight: 400, marginBottom: 28 }}>{message}</p>
        {showSignIn && (
          <button className="cta-btn" onClick={() => navigate("/auth")} style={{
            width: "100%", padding: "13px",
            background: "linear-gradient(135deg, #c9a84c, #8a6020)",
            color: "#080810", borderRadius: 6, fontSize: 14,
            fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase",
          }}>Нэвтрэх</button>
        )}
      </div>
    </div>
  );
}

// ── MAIN ADMIN ──
export default function Admin() {
  const navigate = useNavigate();
  const screenWidth = useWindowSize();
  const isMobile = screenWidth < 768;
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [series, setSeries] = useState([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [newGenreName, setNewGenreName] = useState("");
  const [activeTab, setActiveTab] = useState("series"); // series | chapter
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [recompress, setRecompress] = useState({ running: false, total: 0, done: 0, failed: 0, savedBytes: 0, origBytes: 0 });

  // New series form
  const [newSeries, setNewSeries] = useState({ title: "", genreIds: [], status: "Ongoing", rating: "", description: "", author: "", artist: "", coverUrl: "" });

  // New chapter form
  const [newChapter, setNewChapter] = useState({ seriesId: "", chapterNum: "", title: "", pages: "" });

  // File uploads
  const [coverFile, setCoverFile] = useState(null); // { file, previewUrl }
  const [pageFiles, setPageFiles] = useState([]); // [{ id, file, previewUrl, name }]
  const [uploadProgress, setUploadProgress] = useState(null); // "3 / 20" while uploading

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateSeries = (field, val) => setNewSeries(s => ({ ...s, [field]: val }));
  const updateChapter = (field, val) => setNewChapter(c => ({ ...c, [field]: val }));

  const toggleNewSeriesGenre = (id) => setNewSeries(s => ({
    ...s, genreIds: s.genreIds.includes(id) ? s.genreIds.filter(g => g !== id) : [...s.genreIds, id],
  }));

  const handleCoverFileSelected = (fileList) => {
    const file = fileList[0];
    if (!file) return;
    if (coverFile) URL.revokeObjectURL(coverFile.previewUrl);
    setCoverFile({ file, previewUrl: URL.createObjectURL(file) });
  };

  const clearCoverFile = () => {
    if (coverFile) URL.revokeObjectURL(coverFile.previewUrl);
    setCoverFile(null);
  };

  const handlePageFilesSelected = (fileList) => {
    const newOnes = [...fileList].map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));
    setPageFiles(prev => {
      const combined = [...prev, ...newOnes];
      // Natural sort so page2.jpg sorts before page10.jpg — matches typical scan naming.
      combined.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
      return combined;
    });
  };

  const removePageFile = (id) => {
    setPageFiles(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const clearPageFiles = () => {
    pageFiles.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setPageFiles([]);
  };

  // Edit an existing series
  const [editingSeries, setEditingSeries] = useState(null); // the series row being edited, or null
  const [editForm, setEditForm] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null); // { file, previewUrl }
  const [editChapters, setEditChapters] = useState([]);
  const [editChaptersLoading, setEditChaptersLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const updateEditForm = (field, val) => setEditForm(f => ({ ...f, [field]: val }));

  const toggleEditGenre = (id) => setEditForm(f => ({
    ...f, genreIds: f.genreIds.includes(id) ? f.genreIds.filter(g => g !== id) : [...f.genreIds, id],
  }));

  const openEditSeries = (s) => {
    setEditingSeries(s);
    setEditForm({
      title: s.title, genreIds: (s.genres || []).map(g => g.id), status: s.status, rating: s.rating ?? "",
      description: s.description || "", author: s.author || "", artist: s.artist || "",
    });
    setEditCoverFile(null);
    setEditChaptersLoading(true);
    getChaptersForSeries(s.id).then(setEditChapters).catch(() => setEditChapters([])).finally(() => setEditChaptersLoading(false));
  };

  const closeEditSeries = () => {
    if (editCoverFile) URL.revokeObjectURL(editCoverFile.previewUrl);
    setEditingSeries(null);
    setEditForm(null);
    setEditCoverFile(null);
    setEditChapters([]);
  };

  const handleEditCoverFileSelected = (fileList) => {
    const file = fileList[0];
    if (!file) return;
    if (editCoverFile) URL.revokeObjectURL(editCoverFile.previewUrl);
    setEditCoverFile({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title || editForm.genreIds.length === 0) { showNotif("Title and at least one genre are required", "error"); return; }
    setSavingEdit(true);
    try {
      let coverUrl = editingSeries.cover_url;
      if (editCoverFile) {
        setUploadProgress("Uploading cover...");
        coverUrl = await uploadCoverImage(editCoverFile.file);
        await deleteCoverIfOwned(editingSeries.cover_url);
      }
      const { genreIds, ...seriesFields } = editForm;
      await updateSeriesRecord(editingSeries.id, { ...seriesFields, rating: clampRating(editForm.rating), cover_url: coverUrl, updated_at: new Date().toISOString() });
      await setSeriesGenres(editingSeries.id, genreIds);
      showNotif(`"${editForm.title}" updated`);
      closeEditSeries();
      loadSeries();
    } catch (err) {
      showNotif(err.message, "error");
    } finally {
      setSavingEdit(false);
      setUploadProgress(null);
    }
  };

  const handleDeleteChapterInEdit = async (chapter) => {
    try {
      await deleteFolder(`chapters/${editingSeries.id}/${chapter.chapter_number}`);
      await deleteChapterApi(chapter.id);
      setEditChapters(prev => prev.filter(c => c.id !== chapter.id));
      loadSeries();
      showNotif(`Chapter ${chapter.chapter_number} deleted`, "error");
    } catch (err) {
      showNotif(err.message, "error");
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setProfileLoading(false); return; }
    getProfile(user.id).then(setProfile).catch(() => setProfile(null)).finally(() => setProfileLoading(false));
  }, [user, authLoading]);

  const isAdmin = profile?.is_admin === true;

  const loadSeries = useCallback(() => {
    setSeriesLoading(true);
    getAllSeries().then(setSeries).catch(() => showNotif("Failed to load series", "error")).finally(() => setSeriesLoading(false));
  }, []);

  const loadGenres = useCallback(() => {
    setGenresLoading(true);
    getGenres().then(setGenres).catch(() => showNotif("Failed to load genres", "error")).finally(() => setGenresLoading(false));
  }, []);

  useEffect(() => {
    if (isAdmin) { loadSeries(); loadGenres(); }
  }, [isAdmin, loadSeries, loadGenres]);

  const handleAddGenre = async () => {
    const name = newGenreName.trim();
    if (!name) return;
    try {
      await createGenre(name);
      setNewGenreName("");
      loadGenres();
      showNotif(`"${name}" added`);
    } catch (err) {
      showNotif(err.message, "error");
    }
  };

  const handleDeleteGenre = async (genre) => {
    try {
      await deleteGenreApi(genre.id);
      setGenres(prev => prev.filter(g => g.id !== genre.id));
      showNotif(`"${genre.name}" removed`, "error");
    } catch (err) {
      showNotif(err.message, "error");
    }
  };

  const handleAddSeries = async () => {
    if (!newSeries.title || newSeries.genreIds.length === 0) { showNotif("Title and at least one genre are required", "error"); return; }
    setSubmitting(true);
    try {
      let coverUrl = newSeries.coverUrl;
      if (coverFile) {
        setUploadProgress("Uploading cover...");
        coverUrl = await uploadCoverImage(coverFile.file);
      }
      const created = await createSeries({
        title: newSeries.title,
        status: newSeries.status,
        rating: clampRating(newSeries.rating),
        description: newSeries.description,
        author: newSeries.author,
        artist: newSeries.artist,
        cover_url: coverUrl || `https://picsum.photos/seed/${encodeURIComponent(newSeries.title)}/300/420`,
      });
      await setSeriesGenres(created.id, newSeries.genreIds);
      setNewSeries({ title: "", genreIds: [], status: "Ongoing", rating: "", description: "", author: "", artist: "", coverUrl: "" });
      clearCoverFile();
      showNotif(`"${newSeries.title}" added successfully`);
      loadSeries();
      setActiveNav("series");
    } catch (err) {
      showNotif(err.message, "error");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleAddChapter = async () => {
    if (!newChapter.seriesId || !newChapter.chapterNum) { showNotif("Series and chapter number required", "error"); return; }
    const pastedUrls = newChapter.pages.split("\n").map(u => u.trim()).filter(Boolean);
    if (pageFiles.length === 0 && pastedUrls.length === 0) { showNotif("Add at least one page image", "error"); return; }
    setSubmitting(true);
    try {
      let imageUrls = pastedUrls;
      if (pageFiles.length > 0) {
        const uploadedUrls = await uploadChapterPages(
          pageFiles.map(p => p.file),
          Number(newChapter.seriesId),
          Number(newChapter.chapterNum),
          (done, total) => setUploadProgress(`Uploading pages ${done} / ${total}`)
        );
        imageUrls = [...uploadedUrls, ...pastedUrls];
      }
      await createChapterWithPages({
        seriesId: Number(newChapter.seriesId),
        chapterNumber: Number(newChapter.chapterNum),
        title: newChapter.title,
        imageUrls,
      });
      setNewChapter({ seriesId: "", chapterNum: "", title: "", pages: "" });
      clearPageFiles();
      showNotif(`Chapter ${newChapter.chapterNum} uploaded successfully`);
      loadSeries();
      setActiveNav("series");
    } catch (err) {
      showNotif(err.message, "error");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  // One-time utility: re-downloads every existing page/cover image, compresses
  // it the same way new uploads are, and overwrites it at its exact same URL —
  // no database changes needed since the path never changes.
  const handleRecompressAll = async () => {
    if (recompress.running) return;
    if (!window.confirm("This downloads and re-compresses every image you've uploaded so far, overwriting the originals in place. It can take a while and the original files can't be recovered afterward. Continue?")) return;

    setRecompress({ running: true, total: 0, done: 0, failed: 0, savedBytes: 0, origBytes: 0 });
    try {
      const allUrls = await getAllImageUrls();
      const urls = allUrls.filter(isOwnStorageUrl);
      setRecompress((r) => ({ ...r, total: urls.length }));

      let index = 0;
      const worker = async () => {
        while (index < urls.length) {
          const url = urls[index++];
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`fetch failed (${res.status})`);
            const blob = await res.blob();
            const origSize = blob.size;
            const path = pathFromPublicUrl(url);
            const file = new File([blob], path.split("/").pop(), { type: blob.type || "image/png" });
            const isCover = path.startsWith("covers/");
            const compressed = await compressImage(file, isCover ? 800 : 1400, 0.85);
            if (compressed.size < origSize) {
              await uploadFile(compressed, path);
              setRecompress((r) => ({ ...r, done: r.done + 1, savedBytes: r.savedBytes + (origSize - compressed.size), origBytes: r.origBytes + origSize }));
            } else {
              setRecompress((r) => ({ ...r, done: r.done + 1, origBytes: r.origBytes + origSize }));
            }
          } catch {
            setRecompress((r) => ({ ...r, done: r.done + 1, failed: r.failed + 1 }));
          }
        }
      };
      await Promise.all(Array.from({ length: 4 }, worker));
      showNotif("Recompression complete", "success");
    } catch (err) {
      showNotif(err.message, "error");
    } finally {
      setRecompress((r) => ({ ...r, running: false }));
    }
  };

  const handleDeleteSeries = async (id) => {
    try {
      const target = series.find(s => s.id === id);
      await deleteFolder(`chapters/${id}`);
      if (target) await deleteCoverIfOwned(target.cover_url);
      await deleteSeriesApi(id);
      setSeries(prev => prev.filter(s => s.id !== id));
      showNotif("Series deleted", "error");
    } catch (err) {
      showNotif(err.message, "error");
    }
  };

  if (authLoading || profileLoading) {
    return <AdminGate message="Checking access..." showSignIn={false} />;
  }
  if (!user) {
    return <AdminGate message="Sign in with an admin account to manage KOKORO content." showSignIn={true} />;
  }
  if (!isAdmin) {
    return <AdminGate message="Your account doesn't have admin access. Ask a site owner to flag your profile as admin." showSignIn={false} />;
  }

  const navItems = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "series", icon: "📚", label: "Series" },
    { id: "upload", icon: "⊕", label: "Upload" },
    { id: "genres", icon: "🏷", label: "Genres" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#f7f3ea", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", display: "flex" }}>
      <style>{css}</style>

      {/* Notification toast */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: notification.type === "error" ? "rgba(200,60,60,0.15)" : "rgba(201,168,76,0.15)",
          border: `1px solid ${notification.type === "error" ? "rgba(200,60,60,0.3)" : "rgba(201,168,76,0.3)"}`,
          borderRadius: 8, padding: "12px 18px",
          fontSize: 14, fontWeight: 400,
          color: notification.type === "error" ? "#e07070" : "#c9a84c",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.3s ease",
        }}>
          {notification.type === "error" ? "✕ " : "✓ "}{notification.msg}
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width: isMobile ? 60 : 220, flexShrink: 0,
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        padding: isMobile ? "20px 8px" : "24px 14px",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 10, padding: "4px 8px", marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #c9a84c, #8a6020)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⬡</div>
          {!isMobile && (
            <div>
              <div style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 15, fontWeight: 700 }}>KOKORO</div>
              <div style={{ fontSize: 11, color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 400 }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} className="nav-item" onClick={() => setActiveNav(item.id)} title={item.label} style={{
              display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 10,
              padding: isMobile ? "10px 6px" : "10px 12px",
              background: activeNav === item.id ? "rgba(201,168,76,0.1)" : "transparent",
              borderLeft: activeNav === item.id ? "2px solid #c9a84c" : "2px solid transparent",
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {!isMobile && <span style={{ fontSize: 14, fontWeight: activeNav === item.id ? 500 : 300, color: activeNav === item.id ? "#c9a84c" : "rgba(247,243,234,0.5)", letterSpacing: "0.04em" }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
          <div className="nav-item" onClick={() => navigate("/")} title="View Site" style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 10, padding: isMobile ? "9px 6px" : "9px 12px" }}>
            <span style={{ fontSize: 14 }}>←</span>
            {!isMobile && <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(247,243,234,0.35)" }}>View Site</span>}
          </div>
          <div className="nav-item" onClick={() => signOut().then(() => navigate("/"))} title="Logout" style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 10, padding: isMobile ? "9px 6px" : "9px 12px" }}>
            <span style={{ fontSize: 14 }}>⏻</span>
            {!isMobile && <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(247,243,234,0.35)" }}>Logout</span>}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: isMobile ? "20px 16px" : "32px 36px", overflowY: "auto", maxHeight: "100vh", minWidth: 0 }}>

        {/* ── DASHBOARD ── */}
        {activeNav === "dashboard" && (
          <div className="fade-up">
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Overview</div>
              <h1 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 28, fontWeight: 700 }}>
                Good day, <span className="gold-shimmer">{profile.username || "Admin"}</span>
              </h1>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: isMobile ? 10 : 16, marginBottom: 36, maxWidth: isMobile ? "none" : 500 }}>
              {[
                { label: "Total Series", value: series.length, icon: "📚" },
                { label: "Total Chapters", value: series.reduce((sum, s) => sum + (s.chapterCount || 0), 0), icon: "📖" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "20px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{stat.icon}</div>
                  <div style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 26, fontWeight: 700, color: "#c9a84c", marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: "rgba(247,243,234,0.5)", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent series */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 17, fontWeight: 700 }}>Recent Series</h3>
                <button className="ghost-btn" onClick={() => setActiveNav("series")} style={{ fontSize: 13, color: "#c9a84c", background: "transparent", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4, padding: "5px 12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>View All</button>
              </div>
              {seriesLoading ? (
                <div style={{ padding: "20px", fontSize: 13, color: "rgba(247,243,234,0.35)" }}>Loading...</div>
              ) : series.slice(0, 4).map((s, i) => (
                <div key={s.id} className="series-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <img src={s.cover_url} alt="" style={{ width: 36, height: 50, borderRadius: 4, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", color: "#f7f3ea", marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "rgba(247,243,234,0.35)", fontWeight: 400 }}>{formatGenres(s.genres)} · {s.chapterCount} chapters</div>
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(247,243,234,0.25)", fontWeight: 400, minWidth: 80, textAlign: "right" }}>{timeAgo(s.updated_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SERIES MANAGER ── */}
        {activeNav === "series" && !editingSeries && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Content</div>
                <h1 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 28, fontWeight: 700 }}>Manage Series</h1>
              </div>
              <button className="cta-btn" onClick={() => setActiveNav("upload")} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px 20px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>+ Add New</button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 700 }}>
                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 70px 60px 90px 100px 80px", gap: 12, padding: "8px 16px", fontSize: 12, color: "rgba(247,243,234,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  <span>Series</span><span>Rating</span><span>Chapters</span><span>Status</span><span>Updated</span><span>Actions</span>
                </div>

                {seriesLoading ? (
                  <div style={{ padding: "20px", fontSize: 13, color: "rgba(247,243,234,0.35)" }}>Loading...</div>
                ) : series.map(s => (
                  <div key={s.id} className="series-row" style={{ display: "grid", gridTemplateColumns: "2fr 70px 60px 90px 100px 80px", gap: 12, alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="nav-item" onClick={() => openEditSeries(s)} style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}>
                      <img src={s.cover_url} alt="" style={{ width: 32, height: 44, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", color: "#f7f3ea", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 700 }}>★ {s.rating}</span>
                    <span style={{ fontSize: 14, color: "rgba(247,243,234,0.7)", textAlign: "center" }}>{s.chapterCount}</span>
                    <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 3, background: s.status === "Completed" ? "rgba(100,180,100,0.1)" : "rgba(201,168,76,0.1)", color: s.status === "Completed" ? "#80c480" : "#c9a84c", border: `1px solid ${s.status === "Completed" ? "rgba(100,180,100,0.2)" : "rgba(201,168,76,0.2)"}`, textAlign: "center", letterSpacing: "0.06em", textTransform: "uppercase", justifySelf: "start" }}>{s.status}</span>
                    <span style={{ fontSize: 13, color: "rgba(247,243,234,0.3)", fontWeight: 400 }}>{timeAgo(s.updated_at)}</span>
                    <div style={{ display: "flex", gap: 6, justifySelf: "start" }}>
                      <button onClick={() => openEditSeries(s)} style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "#c9a84c", cursor: "pointer" }}>✎</button>
                      <button className="danger-btn" onClick={() => handleDeleteSeries(s.id)} style={{ background: "rgba(200,60,60,0.08)", border: "1px solid rgba(200,60,60,0.15)", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "rgba(200,60,60,0.5)" }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT SERIES ── */}
        {activeNav === "series" && editingSeries && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Content</div>
                <h1 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 28, fontWeight: 700 }}>Edit {editingSeries.title}</h1>
              </div>
              <button className="ghost-btn" onClick={closeEditSeries} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(247,243,234,0.4)", padding: "9px 18px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>← Back to list</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, maxWidth: 800, marginBottom: 40 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Series Title *</label>
                  <input className="admin-input" value={editForm.title} onChange={e => updateEditForm("title", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Genres * (click to toggle)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {genres.map(g => (
                      <button key={g.id} type="button" onClick={() => toggleEditGenre(g.id)} style={{
                        padding: "6px 12px", borderRadius: 4, fontSize: 13, cursor: "pointer",
                        fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.04em",
                        background: editForm.genreIds.includes(g.id) ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.04)",
                        color: editForm.genreIds.includes(g.id) ? "#080810" : "rgba(247,243,234,0.5)",
                        border: editForm.genreIds.includes(g.id) ? "none" : "1px solid rgba(255,255,255,0.1)",
                      }}>{g.name}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Status</label>
                    <select className="admin-select" value={editForm.status} onChange={e => updateEditForm("status", e.target.value)}>
                      <option value="Ongoing" style={{ background: "#12121e" }}>Ongoing</option>
                      <option value="Completed" style={{ background: "#12121e" }}>Completed</option>
                      <option value="Hiatus" style={{ background: "#12121e" }}>Hiatus</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Rating (0–10)</label>
                    <input className="admin-input" type="number" min="0" max="10" step="0.1" placeholder="9.5" value={editForm.rating} onChange={e => updateEditForm("rating", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Author</label>
                  <input className="admin-input" value={editForm.author} onChange={e => updateEditForm("author", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Artist</label>
                  <input className="admin-input" value={editForm.artist} onChange={e => updateEditForm("artist", e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Description</label>
                  <textarea className="admin-textarea" value={editForm.description} onChange={e => updateEditForm("description", e.target.value)} style={{ minHeight: 120 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Cover Image</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={editCoverFile ? editCoverFile.previewUrl : editingSeries.cover_url} alt="" style={{ width: 56, height: 78, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }} />
                    <label className="upload-zone" style={{ flex: 1, padding: "14px", fontSize: 13 }}>
                      <input type="file" accept="image/*" onChange={e => handleEditCoverFileSelected(e.target.files)} style={{ display: "none" }} />
                      {editCoverFile ? editCoverFile.file.name : "Click to replace cover"}
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {uploadProgress && <span style={{ fontSize: 13, color: "rgba(247,243,234,0.4)", marginRight: "auto" }}>{uploadProgress}</span>}
                <button className="ghost-btn" onClick={closeEditSeries} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(247,243,234,0.4)", padding: "11px 22px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Cancel</button>
                <button className="cta-btn" onClick={handleSaveEdit} disabled={savingEdit} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px 28px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 6px 20px rgba(201,168,76,0.25)", opacity: savingEdit ? 0.6 : 1 }}>{savingEdit ? "Saving..." : "Save Changes ✦"}</button>
              </div>
            </div>

            {/* Chapters for this series */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 19, fontWeight: 700, marginBottom: 14 }}>Chapters ({editChapters.length})</h3>
              {editChaptersLoading ? (
                <div style={{ fontSize: 13, color: "rgba(247,243,234,0.35)" }}>Loading...</div>
              ) : editChapters.length === 0 ? (
                <div style={{ fontSize: 13, color: "rgba(247,243,234,0.35)" }}>No chapters yet — add one from the Upload tab.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>
                  {editChapters.map(ch => (
                    <div key={ch.id} className="series-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 14, color: "#c9a84c", fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", minWidth: 50 }}>Ch. {ch.chapter_number}</span>
                      <span style={{ flex: 1, fontSize: 14, color: "rgba(247,243,234,0.7)" }}>{ch.title}</span>
                      <span style={{ fontSize: 13, color: "rgba(247,243,234,0.25)" }}>{timeAgo(ch.created_at)}</span>
                      <button className="danger-btn" onClick={() => handleDeleteChapterInEdit(ch)} style={{ background: "rgba(200,60,60,0.08)", border: "1px solid rgba(200,60,60,0.15)", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "rgba(200,60,60,0.5)" }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── UPLOAD ── */}
        {activeNav === "upload" && (
          <div className="fade-up">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Content</div>
              <h1 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 28, fontWeight: 700 }}>Upload Content</h1>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 28 }}>
              {[["series", "New Series"], ["chapter", "New Chapter"]].map(([val, label]) => (
                <button key={val} className="tab-btn" onClick={() => setActiveTab(val)} style={{
                  padding: "11px 24px", fontSize: 13,
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: activeTab === val ? 500 : 300,
                  color: activeTab === val ? "#c9a84c" : "rgba(247,243,234,0.35)",
                  background: "none", letterSpacing: "0.1em", textTransform: "uppercase",
                  borderBottom: activeTab === val ? "2px solid #c9a84c" : "2px solid transparent",
                  marginBottom: -1,
                }}>{label}</button>
              ))}
            </div>

            {activeTab === "series" && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, maxWidth: 800 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Series Title *</label>
                    <input className="admin-input" placeholder="The Remarried Empress" value={newSeries.title} onChange={e => updateSeries("title", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Genres * (click to toggle)</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {genres.map(g => (
                        <button key={g.id} type="button" onClick={() => toggleNewSeriesGenre(g.id)} style={{
                          padding: "6px 12px", borderRadius: 4, fontSize: 13, cursor: "pointer",
                          fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.04em",
                          background: newSeries.genreIds.includes(g.id) ? "linear-gradient(135deg, #c9a84c, #8a6020)" : "rgba(255,255,255,0.04)",
                          color: newSeries.genreIds.includes(g.id) ? "#080810" : "rgba(247,243,234,0.5)",
                          border: newSeries.genreIds.includes(g.id) ? "none" : "1px solid rgba(255,255,255,0.1)",
                        }}>{g.name}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Status</label>
                      <select className="admin-select" value={newSeries.status} onChange={e => updateSeries("status", e.target.value)}>
                        <option value="Ongoing" style={{ background: "#12121e" }}>Ongoing</option>
                        <option value="Completed" style={{ background: "#12121e" }}>Completed</option>
                        <option value="Hiatus" style={{ background: "#12121e" }}>Hiatus</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Rating (0–10)</label>
                      <input className="admin-input" type="number" min="0" max="10" step="0.1" placeholder="9.5" value={newSeries.rating} onChange={e => updateSeries("rating", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Author</label>
                    <input className="admin-input" placeholder="Author name" value={newSeries.author} onChange={e => updateSeries("author", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Artist</label>
                    <input className="admin-input" placeholder="Artist name" value={newSeries.artist} onChange={e => updateSeries("artist", e.target.value)} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Description</label>
                    <textarea className="admin-textarea" placeholder="Write a compelling description..." value={newSeries.description} onChange={e => updateSeries("description", e.target.value)} style={{ minHeight: 120 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Cover Image</label>
                    {coverFile ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={coverFile.previewUrl} alt="" style={{ width: 56, height: 78, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: "rgba(247,243,234,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{coverFile.file.name}</div>
                          <button className="danger-btn" onClick={clearCoverFile} style={{ marginTop: 6, background: "rgba(200,60,60,0.08)", border: "1px solid rgba(200,60,60,0.15)", borderRadius: 4, padding: "4px 10px", fontSize: 13, color: "rgba(200,60,60,0.6)" }}>Remove</button>
                        </div>
                      </div>
                    ) : (
                      <label className="upload-zone" style={{ display: "block" }}>
                        <input type="file" accept="image/*" onChange={e => handleCoverFileSelected(e.target.files)} style={{ display: "none" }} />
                        <div style={{ fontSize: 28, marginBottom: 10 }}>⊕</div>
                        <p style={{ fontSize: 14, color: "rgba(247,243,234,0.5)", fontWeight: 400, marginBottom: 4 }}>Upload cover image</p>
                        <p style={{ fontSize: 13, color: "rgba(247,243,234,0.25)", fontWeight: 400 }}>Click to choose a file</p>
                      </label>
                    )}
                    <div style={{ marginTop: 10 }}>
                      <input className="admin-input" placeholder="or paste an image URL instead" value={newSeries.coverUrl} onChange={e => updateSeries("coverUrl", e.target.value)} disabled={!!coverFile} style={coverFile ? { opacity: 0.4 } : undefined} />
                    </div>
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  {uploadProgress && <span style={{ fontSize: 13, color: "rgba(247,243,234,0.4)", marginRight: "auto" }}>{uploadProgress}</span>}
                  <button className="ghost-btn" onClick={() => { setNewSeries({ title: "", genreIds: [], status: "Ongoing", rating: "", description: "", author: "", artist: "", coverUrl: "" }); clearCoverFile(); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(247,243,234,0.4)", padding: "11px 22px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Clear</button>
                  <button className="cta-btn" onClick={handleAddSeries} disabled={submitting} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px 28px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 6px 20px rgba(201,168,76,0.25)", opacity: submitting ? 0.6 : 1 }}>{submitting ? "Publishing..." : "Publish Series ✦"}</button>
                </div>
              </div>
            )}

            {activeTab === "chapter" && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, maxWidth: 800 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Select Series *</label>
                    <select className="admin-select" value={newChapter.seriesId} onChange={e => updateChapter("seriesId", e.target.value)}>
                      <option value="" style={{ background: "#12121e" }}>Choose series</option>
                      {series.map(s => <option key={s.id} value={s.id} style={{ background: "#12121e" }}>{s.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Chapter Number *</label>
                    <input className="admin-input" type="number" placeholder="e.g. 157" value={newChapter.chapterNum} onChange={e => updateChapter("chapterNum", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Chapter Title</label>
                    <input className="admin-input" placeholder="e.g. The Final Decision" value={newChapter.title} onChange={e => updateChapter("title", e.target.value)} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Page Images {pageFiles.length > 0 && `(${pageFiles.length})`}</label>
                    <label
                      className="upload-zone"
                      style={{ display: "block" }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); handlePageFilesSelected(e.dataTransfer.files); }}
                    >
                      <input type="file" accept="image/*" multiple onChange={e => { handlePageFilesSelected(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
                      <div style={{ fontSize: 28, marginBottom: 10 }}>⊕</div>
                      <p style={{ fontSize: 14, color: "rgba(247,243,234,0.5)", fontWeight: 400, marginBottom: 4 }}>Drop chapter pages here, or click to choose</p>
                      <p style={{ fontSize: 13, color: "rgba(247,243,234,0.25)", fontWeight: 400 }}>Select all pages at once — sorted automatically by filename (e.g. 001.jpg, 002.jpg, ...)</p>
                    </label>
                  </div>

                  {pageFiles.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 220, overflowY: "auto", padding: 4 }}>
                      {pageFiles.map((p, i) => (
                        <div key={p.id} style={{ position: "relative", width: 64 }}>
                          <img src={p.previewUrl} alt="" style={{ width: 64, height: 90, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }} />
                          <span style={{ position: "absolute", top: 2, left: 2, background: "rgba(8,8,16,0.8)", color: "#c9a84c", fontSize: 11, padding: "1px 5px", borderRadius: 2 }}>{i + 1}</span>
                          <button onClick={() => removePageFile(p.id)} style={{ position: "absolute", top: 2, right: 2, background: "rgba(8,8,16,0.8)", border: "none", color: "rgba(247,243,234,0.7)", borderRadius: "50%", width: 16, height: 16, fontSize: 12, cursor: "pointer", lineHeight: "16px", padding: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: 13, color: "rgba(247,243,234,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>Or paste image URLs (appended after uploaded pages)</label>
                    <textarea className="admin-textarea" placeholder={"One URL per line:\nhttps://image1.jpg\nhttps://image2.jpg\n..."} value={newChapter.pages} onChange={e => updateChapter("pages", e.target.value)} style={{ minHeight: 80 }} />
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  {uploadProgress && <span style={{ fontSize: 13, color: "rgba(247,243,234,0.4)", marginRight: "auto" }}>{uploadProgress}</span>}
                  <button className="ghost-btn" onClick={() => { setNewChapter({ seriesId: "", chapterNum: "", title: "", pages: "" }); clearPageFiles(); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(247,243,234,0.4)", padding: "11px 22px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Clear</button>
                  <button className="cta-btn" onClick={handleAddChapter} disabled={submitting} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "11px 28px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 6px 20px rgba(201,168,76,0.25)", opacity: submitting ? 0.6 : 1 }}>{submitting ? "Publishing..." : "Publish Chapter ✦"}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GENRES ── */}
        {activeNav === "genres" && (
          <div className="fade-up">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Content</div>
              <h1 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 28, fontWeight: 700 }}>Manage Genres</h1>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 24, maxWidth: 420 }}>
              <input
                className="admin-input"
                placeholder="e.g. Slice of Life"
                value={newGenreName}
                onChange={e => setNewGenreName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddGenre()}
              />
              <button className="cta-btn" onClick={handleAddGenre} style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "0 22px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>+ Add</button>
            </div>

            {genresLoading ? (
              <p style={{ fontSize: 13, color: "rgba(247,243,234,0.35)" }}>Loading...</p>
            ) : genres.length === 0 ? (
              <p style={{ fontSize: 13, color: "rgba(247,243,234,0.35)" }}>No genres yet — add one above.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 420 }}>
                {genres.map(g => (
                  <div key={g.id} className="series-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 14, color: "#f7f3ea" }}>{g.name}</span>
                    <button className="danger-btn" onClick={() => handleDeleteGenre(g)} style={{ background: "rgba(200,60,60,0.08)", border: "1px solid rgba(200,60,60,0.15)", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "rgba(200,60,60,0.5)" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: 13, color: "rgba(247,243,234,0.25)", marginTop: 16, maxWidth: 420, lineHeight: 1.6 }}>
              Removing a genre only removes it from this list — series already tagged with it keep that genre text until you edit them.
            </p>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeNav === "settings" && (
          <div className="fade-up">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>✦ Configuration</div>
              <h1 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 28, fontWeight: 700 }}>Site Settings</h1>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
              {[["Site Name", "KOKORO Manhwa"], ["Tagline", "Монгол хэлээр хамгийн сайхан роман манхва"], ["Contact Email", "admin@kokoro.mn"]].map(([label, val]) => (
                <div key={label}>
                  <label style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 400 }}>{label}</label>
                  <input className="admin-input" defaultValue={val} />
                </div>
              ))}
              <button className="cta-btn" style={{ background: "linear-gradient(135deg, #c9a84c, #8a6020)", color: "#080810", padding: "12px 24px", borderRadius: 6, fontSize: 13, fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", alignSelf: "flex-start", marginTop: 8, boxShadow: "0 6px 20px rgba(201,168,76,0.25)" }}>Save Settings ✦</button>
            </div>

            <div style={{ marginTop: 40, maxWidth: 520, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "24px" }}>
              <h3 style={{ fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Recompress Existing Images</h3>
              <p style={{ fontSize: 13, color: "rgba(247,243,234,0.45)", lineHeight: 1.6, marginBottom: 16 }}>
                New uploads are already compressed automatically. This is a one-time tool for images uploaded before that — it re-downloads, compresses, and overwrites every existing cover and page image at its current URL. No chapters, pages, or ordering change. This can take a while for a large library, and the original files can't be recovered afterward.
              </p>

              {recompress.total > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${Math.round((recompress.done / recompress.total) * 100)}%`, background: "linear-gradient(90deg, #c9a84c, #f0d080)", transition: "width 0.2s" }} />
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(247,243,234,0.5)" }}>
                    {recompress.done} / {recompress.total} processed
                    {recompress.failed > 0 && <span style={{ color: "#e07070" }}> · {recompress.failed} failed</span>}
                    {recompress.origBytes > 0 && (
                      <> · {(recompress.savedBytes / recompress.origBytes * 100).toFixed(0)}% smaller so far</>
                    )}
                    {!recompress.running && recompress.done === recompress.total && (
                      <> · saved {(recompress.savedBytes / 1024 / 1024).toFixed(0)}MB total</>
                    )}
                  </div>
                </div>
              )}

              <button
                className="ghost-btn"
                onClick={handleRecompressAll}
                disabled={recompress.running}
                style={{
                  background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#c9a84c",
                  padding: "11px 22px", borderRadius: 6, fontSize: 13,
                  fontFamily: "'Noto Sans', Inter, 'Segoe UI', 'Arial Unicode MS', sans-serif", fontWeight: 500,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: recompress.running ? "default" : "pointer", opacity: recompress.running ? 0.6 : 1,
                }}
              >{recompress.running ? "Running..." : "Recompress All Images"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}