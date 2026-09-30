import { Topic } from '../models/article.model';

export interface RssFeedConfig {
  id: string;
  label: string;
  url: string;
  topics: Topic[];
  accent: string;
}

export const NEWS_CONFIG = {
  /** Itens pedidos por página a cada fonte paginável */
  pageSize: 12,
  /** Intervalo do auto-refresh em segundo plano (5 min) */
  refreshIntervalMs: 5 * 60 * 1000,
  /** Tempo máximo de espera por fonte antes de considerá-la indisponível */
  requestTimeoutMs: 10_000,
  rss2jsonEndpoint: 'https://api.rss2json.com/v1/api.json',
};

/** Feeds RSS confiáveis. Para adicionar uma fonte nova, basta incluir uma linha aqui. */
export const RSS_FEEDS: RssFeedConfig[] = [
  {
    id: 'techcrunch-ai',
    label: 'TechCrunch',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    topics: ['ai'],
    accent: '#0a9e01',
  },
  {
    id: 'mit-tech-review',
    label: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    topics: ['ai', 'tech'],
    accent: '#c8102e',
  },
  {
    id: 'the-verge',
    label: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    topics: ['tech'],
    accent: '#5200ff',
  },
  {
    id: 'ars-technica',
    label: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
    topics: ['tech'],
    accent: '#ff4e00',
  },
];
