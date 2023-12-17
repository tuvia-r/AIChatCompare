import { APP_INITIALIZER, ApplicationConfig, SecurityContext, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';

import { PrimeNGConfig } from 'primeng/api';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';



const initializeAppFactory = (primeConfig: PrimeNGConfig) => () => {
  primeConfig.ripple = true;
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'ai-chat-compare',
          appId: '1:771377359574:web:e1bf6d4351fc517cec3777',
          storageBucket: 'ai-chat-compare.appspot.com',
          // @ts-ignore
          locationId: 'europe-west',
          apiKey: 'AIzaSyCAABZ89xX6Lx6s1txExnela6_wLkzayGg',
          authDomain: 'ai-chat-compare.firebaseapp.com',
          messagingSenderId: '771377359574',
          measurementId: 'G-JHV37VJ2EJ',
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideAnalytics(() => getAnalytics())),
    ScreenTrackingService,
    UserTrackingService,
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideFunctions(() => getFunctions())),
    importProvidersFrom(provideMessaging(() => getMessaging())),
    importProvidersFrom(providePerformance(() => getPerformance())),
    importProvidersFrom(provideStorage(() => getStorage())),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [PrimeNGConfig],
      multi: true,
   },
   provideMarkdown({
    sanitize: SecurityContext.NONE
  })
  ],
};

declare let process: any;
const env = process.env.NODE_ENV;

export const onBootstrap = () => {
  if(env !== 'production') {
    connectAuthEmulator(getAuth(), 'http://localhost:9099');
    connectFirestoreEmulator(getFirestore(), 'localhost', 8080);
    connectFunctionsEmulator(getFunctions(), 'localhost', 5001);
    connectStorageEmulator(getStorage(), 'localhost', 9199);
  }
  }
