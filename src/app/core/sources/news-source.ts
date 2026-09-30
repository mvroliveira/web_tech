import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Article, SourceChannel, Topic } from '../models/article.model';

/**
 * Contrato de um adapter de notícias. Cada API externa ganha sua própria
 * implementação e converte a resposta para o modelo `Article`.
 */
export interface NewsSource {
  readonly channels: SourceChannel[];
  /** `page` começa em 1. Retorne [] quando a fonte não tiver mais resultados. */
  fetch(topic: Topic, page: number): Observable<Article[]>;
}

/** Multi-provider: o agregador recebe um array com todas as fontes registradas. */
export const NEWS_SOURCES = new InjectionToken<NewsSource[]>('NEWS_SOURCES');
