import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

type AppFunctions = {
  name: string,
  input: any,
  result: void,
}

@Injectable({
  providedIn: 'root',
})
export class FunctionsService {
  private functions = inject(Functions);

  async call<T extends AppFunctions>(name: T['name'], data: T['input']) {
    const callable = httpsCallable(this.functions, name);
    const res = await callable(data);
    return res.data as T['result'];
  }
}
