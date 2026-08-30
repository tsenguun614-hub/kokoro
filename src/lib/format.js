// Relative-time strings in Mongolian, matching the site's existing copy style.
export function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Дөнгөж сая";
  if (minutes < 60) return `${minutes} минутын өмнө`;
  if (hours < 24) return `${hours} цагийн өмнө`;
  if (days < 30) return `${days} өдрийн өмнө`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} сарын өмнө`;
  return `${Math.floor(months / 12)} жилийн өмнө`;
}

export function isRecent(dateString, withinDays = 7) {
  if (!dateString) return false;
  const days = (Date.now() - new Date(dateString).getTime()) / 86400000;
  return days <= withinDays;
}

// Compact number display for stat widgets, e.g. 12400 -> "12.4K".
export function formatCount(n) {
  if (n === null || n === undefined) return "0";
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
}

// Compact genre display for cards. Accepts either [{id,name}] or [name, ...].
export function formatGenres(genres, max = 2) {
  if (!genres || genres.length === 0) return "";
  const names = genres.map((g) => (typeof g === "string" ? g : g.name));
  if (names.length <= max) return names.join(" · ");
  return `${names.slice(0, max).join(" · ")} +${names.length - max}`;
}
