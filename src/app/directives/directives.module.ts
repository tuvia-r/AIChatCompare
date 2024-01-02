import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollIntoViewDirective } from './scroll-into-view.directive';

@NgModule({
  declarations: [ScrollIntoViewDirective],
  imports: [CommonModule],
  exports: [ScrollIntoViewDirective],
})
export class DirectivesModule {}
