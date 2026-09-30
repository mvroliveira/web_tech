/** Remove tags HTML (resumos de RSS costumam vir com HTML). */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function truncate(text: string, max = 220): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Usa a primeira <img> do conteúdo quando o feed não traz thumbnail. */
export function extractFirstImage(html: string | null | undefined): string | null {
  const match = html?.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/** Aceita ISO 8601 e o formato do rss2json ("2025-01-15 10:30:00", em UTC). */
export function parseDate(value: string | null | undefined): Date {
  if (!value) return new Date();
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
