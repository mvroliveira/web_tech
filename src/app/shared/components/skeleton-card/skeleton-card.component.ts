import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-hidden rounded-xl border border-line bg-surface" aria-hidden="true">
      <div class="aspect-video animate-pulse bg-line motion-reduce:animate-none"></div>
      <div class="space-y-3 p-5">
        <div class="h-4 w-1/3 animate-pulse rounded bg-line motion-reduce:animate-none"></div>
        <div class="h-5 w-11/12 animate-pulse rounded bg-line motion-reduce:animate-none"></div>
        <div class="h-5 w-3/4 animate-pulse rounded bg-line motion-reduce:animate-none"></div>
        <div class="h-4 w-full animate-pulse rounded bg-line/60 motion-reduce:animate-none"></div>
      </div>
    </div>
  `,
})
export class SkeletonCardComponent {}
