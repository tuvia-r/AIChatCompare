import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalDbService {
  private document = inject(DOCUMENT);
  get db() {
    return this.document.defaultView?.localStorage;
  }

  get<T>(key: string) {
    const value = this.db?.getItem(key);
    if (!value) {
      return null;
    }
    try {
      const parsed = JSON.parse(value);
      return parsed as T;

    }
    catch (e) {}
    return value as T;
  }

  set<T>(key: string, value: T) {
    if (typeof value === 'string') {
      this.db?.setItem(key, value);
      return;
    }
    this.db?.setItem(key, JSON.stringify(value));
  }

  remove(key: string) {
    this.db?.removeItem(key);
  }
}
