import { Injectable, inject } from '@angular/core';
import { LocalDbService } from './local-db.service';

export interface ModelParams {
  temperature?: number;
  maxTokens?: number;
  enabledModels?: string[];
}


@Injectable({
  providedIn: 'root',
})
export class ModelParamsService {
  private localDbService = inject(LocalDbService);
  private settings: ModelParams = this.localDbService.get<ModelParams>('settings') ?? {} as ModelParams;

  get temperature() {
    return this.settings.temperature ?? 0.5;
  }

  set temperature(value: number) {
    this.settings.temperature = value;
    this.localDbService.set('settings', this.settings);
  }

  get maxTokens() {
    return this.settings.maxTokens ?? 100;
  }

  set maxTokens(value: number) {
    this.settings.maxTokens = value;
    this.localDbService.set('settings', this.settings);
  }

  get enabledModels() {
    return this.settings.enabledModels ?? [];
  }

  set enabledModels(value: string[]) {
    this.settings.enabledModels = value;
    this.localDbService.set('settings', this.settings);
  }
}
