import { Component, Input } from '@angular/core';

@Component({
  selector: 'ai-chat-collapsable',
  template: `
  <div
      pRipple
      pStyleClass="@next"
      enterClass="hidden"
      enterActiveClass="slidedown"
      leaveToClass="hidden"
      leaveActiveClass="slideup"
      class="flex align-items-center justify-content-between cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple {{ headerStyleClass }}"
    >
      <span class="font-medium">{{ title }}</span>
      <i class="pi pi-chevron-down"></i>
    </div>
    <ul class="list-none py-0 pl-3 pr-0 m-0 overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out {{containerClass}}">
      <ng-content></ng-content>
    </ul>
  `,
  styles: `
  `,
})
export class CollapsableComponent {
  @Input() title!: string;
  @Input() headerStyleClass: string = '';
  @Input() containerClass: string = '';
}
