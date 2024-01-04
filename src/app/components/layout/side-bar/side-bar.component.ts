import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SecretsStoreService } from '../../../services/secrets-store.service';
import { GeminiService } from '../../../services/gemini.service';
import { GptThreeService } from '../../../services/gpt-3.service';
import { Gpt4Service } from '../../../services/gpt-4.service';
import { DisplayService } from '../../../services';
import { ChatService } from '../../../services/chat.service';
import { ModelParamsService } from '../../../services/model-params.service';
import { map } from 'rxjs/operators';
import { v4 } from 'uuid';
import { WINDOW_BREAKPOINT } from '../../../utils';
import { ActiveChatService } from '../../../services/active-chat.service';
import { ChatsDbService } from '../../../services/chats-db.service';

@Component({
  selector: 'ai-chat-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  private secretsStoreService = inject(SecretsStoreService);
  private chatsService = inject(ChatService);
  private displayService = inject(DisplayService);
  private activeChatService = inject(ActiveChatService);
  private chatsDbService = inject(ChatsDbService);
  paramService = inject(ModelParamsService);

  id = v4();


  private geminiService = inject(GeminiService);
  private gpt3Service = inject(GptThreeService);
  private gpt4Service = inject(Gpt4Service);

  get allChatApis () {
    return [this.geminiService, this.gpt3Service, this.gpt4Service];
  }

  get activeIndexes () {
    return this.displayService.sidebarActiveIndexes$.value;
  }

  set activeIndexes (value: any) {
    this.displayService.sidebarActiveIndexes$.next(value);
  }

  formBuilder = inject(FormBuilder);

  activeChatId$ = this.chatsService.chatId$;
  allChats$ = this.chatsService.allChats$.pipe(map(chats => [...chats.entries()].reverse()), map(chats => chats.map(([id, chat]) => ({ id, label: chat.title.slice(0, 20) + '...', value: chat.title }))));

  openAiApiForm = this.formBuilder.control('');
  googleApiForm = this.formBuilder.control('');
  huggingFaceApiForm = this.formBuilder.control('');

  onGoogleApiFormSubmit() {
    this.secretsStoreService.setSecret('geminiApiKey', this.googleApiForm.value as string);
    this.googleApiForm.setValue('');
  }

  onRemoveGoogleApiKey() {
    this.secretsStoreService.setSecret('geminiApiKey', '');
    this.googleApiForm.setValue('');

    this.geminiService.enabled = false;
  }

  hasGoogleApiKey() {
    return !!this.secretsStoreService.getSecret('geminiApiKey');
  }

  onHuggingFaceApiFormSubmit() {
    this.secretsStoreService.setSecret('huggingFaceApiKey', this.huggingFaceApiForm.value as string);
    this.huggingFaceApiForm.setValue('');
  }

  onRemoveHuggingFaceApiKey() {
    this.secretsStoreService.setSecret('huggingFaceApiKey', '');
    this.huggingFaceApiForm.setValue('');
  }

  hasHuggingFaceApiKey() {
    return !!this.secretsStoreService.getSecret('huggingFaceApiKey');
  }

  onOpenAiApiFormSubmit() {
    this.secretsStoreService.setSecret('openAiApiKey', this.openAiApiForm.value as string);
    this.openAiApiForm.setValue('');
  }

  onRemoveOpenAiApiKey() {
    this.secretsStoreService.setSecret('openAiApiKey', '');
    this.openAiApiForm.setValue('');


    this.gpt3Service.enabled = false;
    this.gpt4Service.enabled = false;
  }

  hasOpenAiApiKey() {
    return !!this.secretsStoreService.getSecret('openAiApiKey');
  }

  selectChat(chatId: string): void {
    this.activeChatService.setActiveChatById(chatId);
    if(window.innerWidth < WINDOW_BREAKPOINT) {
      this.displayService.isSidebarVisible$.next(false);
    }
  }

  deleteChat(chatId: string): void {
    this.chatsDbService.deleteChat(chatId);
  }

  toggleChatService(service: any) {
    this.chatsService.toggleChatService(service.modelName);
  }
}
