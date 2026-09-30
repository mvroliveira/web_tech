import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, filter, interval, switchMap } from 'rxjs';

import { NEWS_CONFIG } from '../../core/config/news.config';
import { Article, Topic } from '../../core/models/article.model';
import { mergeUnique, sortByDate } from '../../core/services/article.utils';
import { NewsAggregatorService } from '../../core/services/news-aggregator.service';

interface FeedState {
  articles: Article[];
  /** Notícias novas detectadas pelo auto-refresh, aguardando o clique do usuário */
  pending: Article[];
  page: number;
  topic: Topic;
  sourceFilter: string | null;
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  failedSources: string[];
  lastUpdated: Date | null;
}

const initialState: FeedState = {
  articles: [],
  pending: [],
  page: 0,
  topic: 'all',
  sourceFilter: null,
  loading: false,
  hasMore: true,
  error: null,
  failedSources: [],
  lastUpdated: null,
};

/**
 * Store do feed com Signals: um único signal de estado + seletores `computed`.
 * Fornecido no componente (providers), então nasce e morre junto com a página.
 */
@Injectable()
export class FeedStore {
  private readonly aggregator = inject(NewsAggregatorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<FeedState>(initialState);
  private loadSub?: Subscription;

  // Seletores públicos (somente leitura)
  readonly topic = computed(() => this.state().topic);
  readonly sourceFilter = computed(() => this.state().sourceFilter);
  readonly loading = computed(() => this.state().loading);
  readonly hasMore = computed(() => this.state().hasMore);
  readonly error = computed(() => this.state().error);
  readonly failedSources = computed(() => this.state().failedSources);
  readonly lastUpdated = computed(() => this.state().lastUpdated);
  readonly pendingCount = computed(() => this.state().pending.length);

  readonly articles = computed(() => {
    const { articles, sourceFilter } = this.state();
    return sourceFilter ? articles.filter((a) => a.sourceId === sourceFilter) : articles;
  });

  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.articles().length === 0,
  );

  constructor() {
    this.startAutoRefresh();
    this.destroyRef.onDestroy(() => this.loadSub?.unsubscribe());
  }

  loadMore(): void {
    const { loading, hasMore, topic, page } = this.state();
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    this.patch({ loading: true, error: null });

    this.loadSub = this.aggregator.fetchPage(topic, nextPage).subscribe((result) => {
      if (result.allFailed) {
        this.patch({
          loading: false,
          failedSources: result.failedSources,
          error: 'Nenhuma fonte respondeu. Verifique sua conexão e tente de novo.',
        });
        return;
      }

      this.state.update((s) => ({
        ...s,
        articles: mergeUnique(s.articles, result.articles),
        page: nextPage,
        hasMore: !result.exhausted,
        loading: false,
        failedSources: result.failedSources,
        lastUpdated: nextPage === 1 ? new Date() : s.lastUpdated,
      }));
    });
  }

  setTopic(topic: Topic): void {
    if (topic !== this.state().topic) this.reload({ topic });
  }

  setSourceFilter(sourceId: string | null): void {
    this.patch({ sourceFilter: sourceId });
  }

  refresh(): void {
    this.reload({});
  }

  /** Move as notícias pendentes para o topo do feed. */
  showPending(): void {
    this.state.update((s) => ({
      ...s,
      articles: mergeUnique(s.pending, s.articles),
      pending: [],
      lastUpdated: new Date(),
    }));
  }

  private reload(overrides: Partial<FeedState>): void {
    this.loadSub?.unsubscribe();
    this.state.update((s) => ({
      ...initialState,
      topic: s.topic,
      sourceFilter: s.sourceFilter,
      ...overrides,
    }));
    this.loadMore();
  }

  /**
   * A cada N minutos busca a página 1 em segundo plano. Em vez de trocar o
   * conteúdo sob o usuário, guarda as novidades em `pending` e mostra um aviso.
   */
  private startAutoRefresh(): void {
    interval(NEWS_CONFIG.refreshIntervalMs)
      .pipe(
        filter(() => !document.hidden && !this.state().loading && this.state().page > 0),
        switchMap(() => this.aggregator.fetchPage(this.state().topic, 1)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ articles }) => {
        const { articles: current, pending } = this.state();
        const known = [...pending, ...current];
        const fresh = mergeUnique(known, articles).slice(known.length);
        if (fresh.length > 0) {
          this.patch({ pending: sortByDate([...fresh, ...pending]) });
        }
      });
  }

  private patch(partial: Partial<FeedState>): void {
    this.state.update((s) => ({ ...s, ...partial }));
  }
}
