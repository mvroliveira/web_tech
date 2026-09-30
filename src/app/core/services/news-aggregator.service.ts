import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, timeout } from 'rxjs';

import { NEWS_CONFIG } from '../config/news.config';
import { Article, SourceChannel, Topic } from '../models/article.model';
import { NEWS_SOURCES } from '../sources';
import { mergeUnique, sortByDate } from './article.utils';

export interface AggregatedPage {
  articles: Article[];
  /** Nomes das fontes que falharam nesta página */
  failedSources: string[];
  /** Todas as fontes falharam: tratar como erro */
  allFailed: boolean;
  /** Nenhuma fonte tem mais resultados: fim do feed */
  exhausted: boolean;
}

@Injectable({ providedIn: 'root' })
export class NewsAggregatorService {
  private readonly sources = inject(NEWS_SOURCES);

  /** Canais disponíveis para o filtro "Fonte" */
  readonly channels: SourceChannel[] = this.sources.flatMap((source) => source.channels);

  /** Busca a mesma página em todas as fontes em paralelo e unifica o resultado. */
  fetchPage(topic: Topic, page: number): Observable<AggregatedPage> {
    const requests = this.sources.map((source) =>
      source.fetch(topic, page).pipe(
        timeout(NEWS_CONFIG.requestTimeoutMs),
        map((articles) => ({ source, articles, failed: false })),
        // Isolamento de falhas: uma API fora do ar não derruba o feed inteiro.
        catchError((err: unknown) => {
          console.warn('[news] Fonte indisponível:', source.channels[0]?.label, err);
          return of({ source, articles: [] as Article[], failed: true });
        }),
      ),
    );

    return forkJoin(requests).pipe(
      map((results) => {
        const failed = results.filter((r) => r.failed);
        const allFailed = failed.length === results.length;
        return {
          articles: sortByDate(mergeUnique([], results.flatMap((r) => r.articles))),
          failedSources: failed.flatMap((r) => r.source.channels.map((c) => c.label)),
          allFailed,
          exhausted: !allFailed && results.every((r) => r.articles.length === 0),
        };
      }),
    );
  }
}
