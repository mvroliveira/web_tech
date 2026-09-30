import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { Article } from '../../../core/models/article.model';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [RelativeTimePipe],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.featured]': 'featured()' },
})
export class ArticleCardComponent {
  readonly article = input.required<Article>();
  /** Card de destaque: ocupa a largura toda e fica horizontal no desktop */
  readonly featured = input(false);

  protected readonly imageFailed = signal(false);
  protected readonly showImage = computed(() => !!this.article().imageUrl && !this.imageFailed());
  protected readonly isoDate = computed(() => this.article().publishedAt.toISOString());
  protected readonly fullDate = computed(() =>
    this.article().publishedAt.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }),
  );
}
