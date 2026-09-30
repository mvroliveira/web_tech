import { Article } from '../models/article.model';

/** Normaliza a URL para detectar a mesma notícia vinda de fontes diferentes. */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    [...u.searchParams.keys()]
      .filter((key) => key.startsWith('utm_'))
      .forEach((key) => u.searchParams.delete(key));
    const host = u.hostname.replace(/^www\./, '');
    const path = u.pathname.replace(/\/$/, '');
    return `${host}${path}${u.search}`.toLowerCase();
  } catch {
    return url;
  }
}

/** Mantém a ordem de `base` e acrescenta apenas os itens inéditos de `incoming`. */
export function mergeUnique(base: Article[], incoming: Article[]): Article[] {
  const seen = new Set(base.map((a) => normalizeUrl(a.url)));
  const result = [...base];
  for (const article of incoming) {
    const key = normalizeUrl(article.url);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(article);
    }
  }
  return result;
}

export function sortByDate(list: Article[]): Article[] {
  return [...list].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
