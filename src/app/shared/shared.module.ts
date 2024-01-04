import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DirectivesModule } from '../directives/directives.module';
import { ChipModule } from 'primeng/chip';
import { ListboxModule } from 'primeng/listbox';
import { CheckboxModule } from 'primeng/checkbox';
import { DeferModule } from 'primeng/defer';
import { FocusTrapModule } from 'primeng/focustrap';






@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    StyleClassModule,
    RippleModule,
  ],
  exports: [
    ButtonModule,
    ProgressSpinnerModule,
    StyleClassModule,
    RippleModule,
    BadgeModule,
    InputNumberModule,
    ReactiveFormsModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SelectButtonModule,
    OverlayPanelModule,
    TooltipModule,
    DropdownModule,
    ToastModule,
    DirectivesModule,
    ChipModule,
    ListboxModule,
    CheckboxModule,
    DeferModule,
    FocusTrapModule
  ],
})
export class SharedModule {}
