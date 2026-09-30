import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideNewsSources } from './core/sources';

export const appConfig: ApplicationConfig = {
  providers: [
    // Mantenha a estratégia de change detection que o CLI gerou para a sua versão
    // (provideZoneChangeDetection ou provideZonelessChangeDetection). O código do
    // projeto usa apenas Signals, então funciona nos dois modos.
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideNewsSources(),
  ],
};
