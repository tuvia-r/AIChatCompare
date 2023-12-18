import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SidebarModule } from 'primeng/sidebar';
import { CoreModule } from '../core/core.module';


@NgModule({
  declarations: [
    LayoutComponent,
    SideBarComponent,
    TopBarComponent
  ],
  imports: [CommonModule, SidebarModule, CoreModule],
  exports: [LayoutComponent],
})
export class LayoutModule {}
