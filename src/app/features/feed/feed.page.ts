import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { TOPICS } from '../../core/models/article.model';
import { NewsAggregatorService } from '../../core/services/news-aggregator.service';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { FeedStore } from './feed.store';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [ArticleCardComponent, SkeletonCardComponent, InfiniteScrollDirective, RelativeTimePipe],
  providers: [FeedStore],
  templateUrl: './feed.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedPage implements OnInit {
  protected readonly store = inject(FeedStore);
  protected readonly channels = inject(NewsAggregatorService).channels;
  protected readonly topics = TOPICS;
  protected readonly skeletons = [0, 1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.store.loadMore();
  }

  protected onSourceChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.store.setSourceFilter(value || null);
  }

  protected showPending(): void {
    this.store.showPending();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}
