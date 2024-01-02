import { Directive, ElementRef, Input, inject } from '@angular/core';

@Directive({
  selector: '[chatScrollIntoView]',
})
export class ScrollIntoViewDirective {
  @Input('trigger') set scrollIntoView(value: any) {
    if (value) {
      this.ngAfterViewInit();
    }
  }

  el = inject(ElementRef);

  async ngAfterViewInit() {
    await new Promise(resolve => setTimeout(resolve, 100));
    if(!this.el.nativeElement || !this.el.nativeElement.scrollIntoView) {
      return;
    }
    this.el.nativeElement?.scrollIntoView();
  }
}
