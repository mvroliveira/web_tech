import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input, output } from '@angular/core';

/**
 * Emite `scrolled` quando o elemento (sentinela) se aproxima da viewport.
 * Como o sentinela é recriado a cada carregamento (via @if no template),
 * o observer dispara de novo mesmo que a tela ainda não esteja cheia.
 */
@Directive({ selector: '[appInfiniteScroll]', standalone: true })
export class InfiniteScrollDirective {
  /** Distância antes do fim da tela para começar a carregar */
  readonly rootMargin = input('600px');
  readonly scrolled = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) this.scrolled.emit();
        },
        { rootMargin: this.rootMargin() },
      );
      observer.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
