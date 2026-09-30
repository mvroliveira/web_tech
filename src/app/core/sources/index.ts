import { Provider } from '@angular/core';

import { DevToSource } from './devto.source';
import { HackerNewsSource } from './hackernews.source';
import { NEWS_SOURCES } from './news-source';
import { RssSource } from './rss.source';

/** Registre novas fontes aqui. O restante da aplicação não precisa mudar. */
export function provideNewsSources(): Provider[] {
  return [
    { provide: NEWS_SOURCES, useClass: DevToSource, multi: true },
    { provide: NEWS_SOURCES, useClass: HackerNewsSource, multi: true },
    { provide: NEWS_SOURCES, useClass: RssSource, multi: true },
  ];
}

export * from './news-source';
