import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DisplayService {
  readonly isSidebarVisible$ = new BehaviorSubject<boolean>(false);
}
