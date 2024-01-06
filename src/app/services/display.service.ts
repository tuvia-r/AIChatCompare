import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DisplayService {
  private document = inject(DOCUMENT);

  readonly isSidebarVisible$ = new BehaviorSubject<boolean>(false);

  readonly sidebarActiveIndexes$ = new BehaviorSubject<number[]>([0]);

  readonly nightMode$ = new BehaviorSubject<boolean>(this.getDefaultIsNightMode());

  private get window() {
    return this.document.defaultView;
  }

  constructor() {
    this.init();
  }

  private init() {
    this.nightMode$.subscribe((nightMode) => {
      const themeEl = this.document.getElementById('theme-element');
      if (nightMode) {
        themeEl?.setAttribute('href', 'dark.css');
      } else {
        themeEl?.setAttribute('href', 'light.css');
      }
    });
  }

  getDefaultIsNightMode() {
    if (this.window?.matchMedia) {
      const isNightMode = this.window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      return isNightMode;
    }
    return false;
  }
}
