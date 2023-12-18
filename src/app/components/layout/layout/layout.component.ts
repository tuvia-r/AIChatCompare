import { Component, inject } from '@angular/core';
import { DisplayService } from '../../../services';

@Component({
  selector: 'ai-chat-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private displayService = inject(DisplayService);

  showSidebar$ = this.displayService.isSidebarVisible$;

  set showSidebar(value: boolean) {
    this.displayService.isSidebarVisible$.next(value);
  }

  get showSidebar(): boolean {
    return this.displayService.isSidebarVisible$.value;
  }

}
