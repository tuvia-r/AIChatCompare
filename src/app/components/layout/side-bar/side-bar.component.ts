import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { SecretsStoreService } from '../../../services/secrets-store.service';
import { GeminiService } from '../../../services/gemini.service';
import { GptThreeService } from '../../../services/gpt-3.service';
import { Gpt4Service } from '../../../services/gpt-4.service';
import { DisplayService } from '../../../services';
import { ChatService } from '../../../services/chat.service';
import { ModelParamsService } from '../../../services/model-params.service';
import { map, take, tap } from 'rxjs/operators';
import { v4 } from 'uuid';
import { WINDOW_BREAKPOINT } from '../../../utils';
import { ChatUtilsService } from '../../../services/chat-utils.service';
import { ChatsDbService } from '../../../services/chats-db.service';

interface SecretConfig {
  label: string;
  secretDbKey: string;
  formControl: FormControl<string | null>;
  helpUrl: string;
}

@Component({
  selector: 'ai-chat-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  private secretsStoreService = inject(SecretsStoreService);
  private chatsService = inject(ChatService);
  private displayService = inject(DisplayService);
  private chatsUtilsService = inject(ChatUtilsService);
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

  canCreateChat$ = this.chatsService.activeChat$.pipe(map(chat => !chat || chat?.groups.length > 0));
  activeChatId$ = this.chatsService.chatId$;
  allChats$ = this.chatsService.allChats$.pipe(map(chats => [...chats.entries()].reverse()), map(chats => chats.map(([id, chat]) => ({ id, label: chat.title, value: chat.title }))));

  openAiApiForm = this.formBuilder.control('');
  googleApiForm = this.formBuilder.control('');
  huggingFaceApiForm = this.formBuilder.control('');

  secretConfigs: SecretConfig[] = [
    {
      label: 'Google Gemini',
      secretDbKey: 'geminiApiKey',
      formControl: this.googleApiForm,
      helpUrl: 'https://makersuite.google.com/app/apikey',
    },
    {
      label: 'Hugging Face',
      secretDbKey: 'huggingFaceApiKey',
      formControl: this.huggingFaceApiForm,
      helpUrl: 'https://huggingface.co/docs/api-inference/quicktour',
    },
    {
      label: 'OpenAI',
      secretDbKey: 'openAiApiKey',
      formControl: this.openAiApiForm,
      helpUrl: 'https://platform.openai.com/account/api-keys',
    }
  ];

  onSecretSubmit(secretConfig: SecretConfig) {
    this.secretsStoreService.setSecret(secretConfig.secretDbKey, secretConfig.formControl.value as string);
    secretConfig.formControl.setValue('');
  }

  onSecretRemove(secretConfig: SecretConfig) {
    this.secretsStoreService.setSecret(secretConfig.secretDbKey, '');
    secretConfig.formControl.setValue('');

    // Disable all chat services that require this secret
    this.chatsService.allChatServices$.pipe(
      tap(services => services.forEach(service => {
        if(!service.isAvailable() && service.enabled) {
          this.chatsService.toggleChatService(service.modelName);
        }
      })),
      take(1)
    ).subscribe();
  }

  hesSecret(secretConfig: SecretConfig) {
    return !!this.secretsStoreService.getSecret(secretConfig.secretDbKey);
  }

  onSecretHelp(secretConfig: SecretConfig) {
    window.open(secretConfig.helpUrl, '_blank');
  }

  selectChat(chatId: string): void {
    this.chatsUtilsService.setActiveChatById(chatId);
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

  async regenerateChatTitle(chatId: string) {
    const chat = this.chatsDbService.getChat(chatId);
    if(!chat) return;
    await this.chatsService.checkTitle(chat, true);
  }

  createChat() {
    if(this.chatsUtilsService.activeChat && this.chatsUtilsService.activeChat?.groups.length === 0) return;
    this.chatsUtilsService.newChat();
  }
}
