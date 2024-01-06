import {
  APP_INITIALIZER,
  ApplicationConfig,
  SecurityContext,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

import { PrimeNGConfig } from 'primeng/api';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
} from '@angular/fire/analytics';
import { environment } from './environments';


const initializeAppFactory = (primeConfig: PrimeNGConfig) => () => {
  primeConfig.ripple = true;
};

const firebaseProviders = []

if(environment.firebase) {
  firebaseProviders.push(
    importProvidersFrom(provideFirebaseApp(() => initializeApp(environment.firebase as any))),
    importProvidersFrom(provideAnalytics(() => getAnalytics())),
    ScreenTrackingService,
  )
}
else {
  console.warn('Firebase environment not found. Skipping Firebase initialization.')
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [PrimeNGConfig],
      multi: true,
    },
    provideMarkdown({
      sanitize: SecurityContext.NONE,
    }),
    ...firebaseProviders
  ],
};
