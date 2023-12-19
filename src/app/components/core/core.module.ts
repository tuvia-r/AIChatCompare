import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast/toast.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SliderModule } from 'primeng/slider';
import { MarkdownModule } from 'ngx-markdown';
import { AccordionModule } from 'primeng/accordion';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ShareBtnsComponent } from './share-btns/share-btns.component';
import { AppInfoComponent } from './app-info/app-info.component';



@NgModule({
  declarations: [
    ToastComponent,
    ShareBtnsComponent,
    AppInfoComponent
  ],
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    RippleModule,
    FormsModule,
    MarkdownModule.forRoot(),
  ],
  exports: [
    ToastComponent,
    ButtonModule,
    RippleModule,
    FormsModule,
    InputTextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    ReactiveFormsModule,
    InputSwitchModule,
    SliderModule,
    AccordionModule,
    MenuModule,
    TooltipModule,
    ProgressSpinnerModule,
    SkeletonModule,
    OverlayPanelModule,
    ShareBtnsComponent,
    AppInfoComponent,
  ],
  providers: [
    MessageService
  ]
})
export class CoreModule {}
