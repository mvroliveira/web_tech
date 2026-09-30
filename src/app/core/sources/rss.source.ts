import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { NEWS_CONFIG, RSS_FEEDS, RssFeedConfig } from '../config/news.config';
import { Article, SourceChannel, Topic } from '../models/article.model';
import { extractFirstImage, parseDate, stripHtml, truncate } from '../../shared/utils/text.utils';
import { NewsSource } from './news-source';

interface Rss2JsonItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure?: { link?: string; type?: string };
  categories: string[];
}

interface Rss2JsonResponse {
  status: 'ok' | 'error';
  items: Rss2JsonItem[];
}

/**
 * Converte feeds RSS em JSON via https://rss2json.com (plano gratuito, sem chave).
 * Um único adapter expõe um canal por feed configurado em RSS_FEEDS.
 */
@Injectable()
export class RssSource implements NewsSource {
  readonly channels: SourceChannel[] = RSS_FEEDS.map((feed) => ({
    id: `rss:${feed.id}`,
    label: feed.label,
    accent: feed.accent,
  }));

  private readonly http = inject(HttpClient);

  fetch(topic: Topic, page: number): Observable<Article[]> {
    // O rss2json gratuito devolve só os itens mais recentes, sem paginação.
    if (page > 1) return of([]);

    const feeds = RSS_FEEDS.filter((feed) => topic === 'all' || feed.topics.includes(topic));
    if (feeds.length === 0) return of([]);

    return forkJoin(feeds.map((feed) => this.fetchFeed(feed))).pipe(
      map((lists) => lists.flat()),
    );
  }

  private fetchFeed(feed: RssFeedConfig): Observable<Article[]> {
    const params = new HttpParams().set('rss_url', feed.url);
    return this.http.get<Rss2JsonResponse>(NEWS_CONFIG.rss2jsonEndpoint, { params }).pipe(
      map((res) => (res.status === 'ok' ? res.items.map((item) => this.toArticle(item, feed)) : [])),
      // Um feed fora do ar não derruba os demais.
      catchError((err: unknown) => {
        console.warn(`[rss] ${feed.label} indisponível`, err);
        return of([]);
      }),
    );
  }

  private toArticle(item: Rss2JsonItem, feed: RssFeedConfig): Article {
    return {
      id: `rss:${feed.id}:${item.guid || item.link}`,
      title: stripHtml(item.title),
      summary: truncate(stripHtml(item.description || item.content)),
      url: item.link,
      imageUrl:
        item.thumbnail ||
        this.enclosureImage(item) ||
        extractFirstImage(item.content || item.description),
      source: feed.label,
      sourceId: `rss:${feed.id}`,
      accent: feed.accent,
      author: item.author || undefined,
      publishedAt: parseDate(item.pubDate),
      tags: item.categories ?? [],
    };
  }

  private enclosureImage(item: Rss2JsonItem): string | null {
    const enclosure = item.enclosure;
    return enclosure?.link && enclosure.type?.startsWith('image') ? enclosure.link : null;
  }
}
