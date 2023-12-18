import { Injectable, inject } from '@angular/core';
import { LocalDbService } from './local-db.service';

@Injectable({
  providedIn: 'root',
})
export class SecretsStoreService {

  private localDbService = inject(LocalDbService);

  getSecret(secretName: string) {
    return this.localDbService.get<string>(secretName);
  }

  setSecret(secretName: string, secretValue: string) {
    this.localDbService.set(secretName, secretValue);
  }
}
