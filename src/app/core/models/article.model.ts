export type Topic = 'all' | 'ai' | 'tech' | 'dev';

export const TOPICS: ReadonlyArray<{ id: Topic; label: string }> = [
  { id: 'all', label: 'Tudo' },
  { id: 'ai', label: 'Inteligência Artificial' },
  { id: 'tech', label: 'Tecnologia' },
  { id: 'dev', label: 'Desenvolvimento' },
];

/** Formato único que todas as fontes (adapters) devem produzir. */
export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string | null;
  /** Nome exibido, ex.: "TechCrunch" */
  source: string;
  /** Id técnico do canal, ex.: "rss:techcrunch-ai" */
  sourceId: string;
  /** Cor da fonte, usada para identificá-la no card */
  accent: string;
  author?: string;
  publishedAt: Date;
  tags: string[];
}

/** Um canal selecionável no filtro "Fonte". Um adapter pode expor vários (ex.: RSS). */
export interface SourceChannel {
  id: string;
  label: string;
  accent: string;
}
