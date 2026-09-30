import { Pipe, PipeTransform } from '@angular/core';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** "há 5 minutos", "ontem"... sem precisar registrar locale do Angular. */
@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {
  private readonly formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  transform(value: Date | string | null | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);

    for (const [unit, seconds] of UNITS) {
      if (Math.abs(diffSeconds) >= seconds) {
        return this.formatter.format(Math.round(diffSeconds / seconds), unit);
      }
    }
    return 'agora mesmo';
  }
}
