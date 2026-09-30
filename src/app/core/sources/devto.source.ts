import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { NEWS_CONFIG } from '../config/news.config';
import { Article, SourceChannel, Topic } from '../models/article.model';
import { parseDate } from '../../shared/utils/text.utils';
import { NewsSource } from './news-source';

interface DevToArticle {
  id: number;
  title: string;
  description: string | null;
  url: string;
  cover_image: string | null;
  social_image: string | null;
  published_at: string;
  tag_list: string[];
  user: { name: string };
}

const TAG_BY_TOPIC: Record<Topic, string | null> = {
  all: null,
  ai: 'ai',
  tech: 'technology',
  dev: 'webdev',
};

const CHANNEL: SourceChannel = { id: 'devto', label: 'DEV Community', accent: '#3b49df' };

/** https://developers.forem.com/api — gratuita, sem chave, com CORS liberado. */
@Injectable()
export class DevToSource implements NewsSource {
  readonly channels = [CHANNEL];
  private readonly http = inject(HttpClient);

  fetch(topic: Topic, page: number): Observable<Article[]> {
    let params = new HttpParams().set('page', page).set('per_page', NEWS_CONFIG.pageSize);
    const tag = TAG_BY_TOPIC[topic];
    if (tag) params = params.set('tag', tag);

    return this.http
      .get<DevToArticle[]>('https://dev.to/api/articles', { params })
      .pipe(map((items) => items.map((item) => this.toArticle(item))));
  }

  private toArticle(a: DevToArticle): Article {
    return {
      id: `${CHANNEL.id}:${a.id}`,
      title: a.title,
      summary: a.description ?? '',
      url: a.url,
      imageUrl: a.cover_image ?? a.social_image ?? null,
      source: CHANNEL.label,
      sourceId: CHANNEL.id,
      accent: CHANNEL.accent,
      author: a.user?.name,
      publishedAt: parseDate(a.published_at),
      tags: a.tag_list ?? [],
    };
  }
}
