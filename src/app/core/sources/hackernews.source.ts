import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { NEWS_CONFIG } from '../config/news.config';
import { Article, SourceChannel, Topic } from '../models/article.model';
import { hostnameOf, parseDate } from '../../shared/utils/text.utils';
import { NewsSource } from './news-source';

interface HnHit {
  objectID: string;
  title: string | null;
  url: string | null;
  author: string;
  created_at: string;
  points: number | null;
  num_comments: number | null;
}

interface HnResponse {
  hits: HnHit[];
  nbPages: number;
}

type LinkStory = HnHit & { title: string; url: string };

const QUERY_BY_TOPIC: Record<Topic, string> = {
  all: '',
  ai: 'AI',
  tech: 'technology',
  dev: 'programming',
};

const CHANNEL: SourceChannel = { id: 'hackernews', label: 'Hacker News', accent: '#ff6600' };

/** https://hn.algolia.com/api — gratuita, sem chave, com CORS liberado. */
@Injectable()
export class HackerNewsSource implements NewsSource {
  readonly channels = [CHANNEL];
  private readonly http = inject(HttpClient);

  fetch(topic: Topic, page: number): Observable<Article[]> {
    const params = new HttpParams()
      .set('tags', 'story')
      .set('query', QUERY_BY_TOPIC[topic])
      .set('numericFilters', 'points>30') // descarta posts sem tração
      .set('hitsPerPage', NEWS_CONFIG.pageSize)
      .set('page', page - 1); // a Algolia começa a paginação em 0

    return this.http
      .get<HnResponse>('https://hn.algolia.com/api/v1/search_by_date', { params })
      .pipe(
        map((res) =>
          page - 1 >= res.nbPages
            ? []
            : res.hits.filter(isLinkStory).map((hit) => this.toArticle(hit)),
        ),
      );
  }

  private toArticle(hit: LinkStory): Article {
    const points = hit.points ?? 0;
    const comments = hit.num_comments ?? 0;
    return {
      id: `${CHANNEL.id}:${hit.objectID}`,
      title: hit.title,
      summary: `Em destaque no Hacker News com ${points} pontos e ${comments} comentários. Publicado em ${hostnameOf(hit.url)}.`,
      url: hit.url,
      imageUrl: null,
      source: CHANNEL.label,
      sourceId: CHANNEL.id,
      accent: CHANNEL.accent,
      author: hit.author,
      publishedAt: parseDate(hit.created_at),
      tags: [],
    };
  }
}

function isLinkStory(hit: HnHit): hit is LinkStory {
  return !!hit.title && !!hit.url;
}
