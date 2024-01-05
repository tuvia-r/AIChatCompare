import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListboxFilterEvent } from 'primeng/listbox';

@Component({
  selector: 'chat-dropdown-select',
  template:`
  <div (click)="op.toggle($event)" class="w-10rem p-1 z-3 border-round border-1 border-primary-200 flex flex-row justify-content-between">
        <div
          class="h-2rem w-8rem flex flex-grow-1 align-items-center gap-1 overflow-x-auto no-scroll-bar"
        >
          <ng-container *ngFor="let item of items">
            <div
              (onRemove)="selectedChanges.emit({ all: items, current: [item] })"
              class="h-full surface-200 white-space-nowrap text-overflow-ellipsis border-round text-center p-2 flex align-items-center justify-content-center"
              *ngIf="item[selectionName] === true"
            >{{item[labelName]}}</div>
          </ng-container>
          <p-overlayPanel #op styleClass="overlay-child-p-0 shadow-none">
            <p-listbox
              #chatServicesListbox
              [options]="items"
              [checkbox]="false"
              [multiple]="true"
              optionLabel="modelName"
              [filter]="true"
              [style]="{ width: 'min(30rem, 100vw)' }"
              [listStyle]="{ 'max-height': '320px' }"
              [virtualScrollItemSize]="46"
              [lazy]="true"
              scrollHeight="250px"
              (onFilter)="onFiltering($event)"
              pFocusTrap
              [filterMessage]="filterPlaceHolder"
              [ariaFilterLabel]="filterPlaceHolder"
              [filterPlaceHolder]="filterPlaceHolder"
            >
              <ng-template let-item pTemplate="item">
                <div
                  class="flex w-full gap-2 align-items-center justify-content-between z-3"
                >
                  <p-checkbox
                    [disabled]="item[disabledName]() !== true"
                    [ngModel]="item[selectionName]"
                    (onChange)="selectedChanges.emit({ all: items, current: [item] })"
                    [binary]="true"
                    [inputId]="item[labelName]"
                  ></p-checkbox>
                  <label [for]="item[labelName]">{{
                    item[labelName]
                  }}</label>
                  <div class="flex flex-grow-1 justify-content-end">
                    <i *ngIf="item['link']" class="pi pi-external-link" (click)="open(item['link'])"></i>
                  </div>
                </div>
              </ng-template>
            </p-listbox>
          </p-overlayPanel>
        </div>
        <div class="w-2rem flex justify-content-center align-items-center text-primary"><i class="pi pi-chevron-down"></i></div>
      </div>`,
  styles: `
    ::ng-deep .overlay-child-p-0 .p-overlaypanel-content {
      padding: 0 !important;
    }

    ::ng-deep .overlay-child-p-0 .p-overlaypanel-content:before {
      content: none !important;
      display: none !important;
    }

    .no-scroll-bar::-webkit-scrollbar {
      display: none;
    }

    .no-scroll-bar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `,
})
export class DropdownSelectComponent {
  @Input() items: any[] = [];
  @Input() title: string = '';

  @Input() selectionName: string = '';
  @Input() labelName: string = '';
  @Input() disabledName: string = '';
  @Input() filterPlaceHolder: string = '';
  @Input() filterDelay: number = 500;

  @Output() selectedChanges = new EventEmitter<{
    all: any[];
    current: any[];
  }>();
  @Output() onFilter = new EventEmitter<ListboxFilterEvent>();

  open(link: string) {
    window.open(link, '_blank');
  }

  filterTimeout?: NodeJS.Timeout;

  onFiltering(event: ListboxFilterEvent) {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filterTimeout = setTimeout(() => {
      this.onFilter.emit(event);
    }, this.filterDelay);
  }
}
