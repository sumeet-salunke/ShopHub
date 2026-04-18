const API_ORIGIN = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";

export const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' fill='%23dbeafe'/%3E%3Cpath d='M120 315h400L398 175l-88 98-58-64z' fill='%2360a5fa'/%3E%3Ccircle cx='220' cy='145' r='36' fill='%2393c5fd'/%3E%3Ctext x='320' y='365' text-anchor='middle' font-family='Arial' font-size='28' fill='%231e3a8a'%3ENo image%3C/text%3E%3C/svg%3E";

export const resolveImageUrl = (image) => {
  if (!image || typeof image !== "string") return FALLBACK_IMAGE;

  const trimmed = image.trim();
  if (!trimmed) return FALLBACK_IMAGE;

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  return `${API_ORIGIN}/${trimmed.replace(/\\/g, "/").replace(/^\/+/, "")}`;
};
