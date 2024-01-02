import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routes } from './chat.routes';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './chat.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { ChatOutputComponent } from './chat-output/chat-output.component';
import { CoreModule } from '../../components/core/core.module';
import { MarkdownModule } from 'ngx-markdown';
import { CopyBtnComponent } from './chat-output/copy-btn/copy-btn.component';
import { TabViewModule } from 'primeng/tabview';
import { ChatOutputGroupComponent } from './chat-output-group/chat-output-group.component';
import { ChatInputBubbleComponent } from './chat-input-bubble/chat-input-bubble.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ChatComponent,
    ChatInputComponent,
    ChatOutputComponent,
    CopyBtnComponent,
    ChatOutputGroupComponent,
    ChatInputBubbleComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreModule,
    MarkdownModule.forChild(),
    TabViewModule,
    SharedModule,
  ],
})
export class ChatModule {}
