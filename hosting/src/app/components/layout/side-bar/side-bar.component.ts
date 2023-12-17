import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SecretsStoreService } from '../../../services/secrets-store.service';
import { GeminiService } from '../../../services/gemini.service';
import { GptThreeService } from '../../../services/gpt-3.service';
import { Gpt4Service } from '../../../services/gpt-4.service';
import { DisplayService } from '../../../services';
import { ChatService } from '../../../services/chat.service';
import { ModelParamsService } from '../../../services/model-params.service';
import { map } from 'rxjs';

@Component({
  selector: 'ai-chat-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  private secretsStoreService = inject(SecretsStoreService);
  private chatsService = inject(ChatService);
  private displayService = inject(DisplayService);
  paramService = inject(ModelParamsService);


  private geminiService = inject(GeminiService);
  private gpt3Service = inject(GptThreeService);
  private gpt4Service = inject(Gpt4Service);

  get allChatApis () {
    return [this.geminiService, this.gpt3Service, this.gpt4Service];
  }

  formBuilder = inject(FormBuilder);

  allChats$ = this.chatsService.allChats$.pipe(map(chats => [...chats.entries()].reverse()), map(chats => chats.map(([id, chat]) => ({ id, label: chat[0].text.slice(0, 20) + '...' }))));

  openAiApiForm = this.formBuilder.control('');
  googleApiForm = this.formBuilder.control('');

  onGoogleApiFormSubmit() {
    this.secretsStoreService.setSecret('geminiApiKey', this.googleApiForm.value as string);
    this.googleApiForm.setValue('');
  }

  onOpenAiApiFormSubmit() {
    this.secretsStoreService.setSecret('openAiApiKey', this.openAiApiForm.value as string);
    this.openAiApiForm.setValue('');
  }

  selectChat(chatId: string): void {
    this.chatsService.goToChat(chatId);
    this.displayService.isSidebarVisible$.next(false);
  }

  deleteChat(chatId: string): void {
    this.chatsService.deleteChat(chatId);
  }

  goToGithub(): void {
    window.open('https://github.com/tuvia-r', '_blank');
  }

  goToLinkedin(): void {
    window.open('https://www.linkedin.com/in/tuvia-rumpler-b62365104/', '_blank');
  }

  goToTwitter(): void {
    window.open('https://twitter.com/RumplerTuvia', '_blank');
  }

  goToWebsite(): void {
    window.open('https://tuviarumpler.web.app', '_blank');
  }

}
