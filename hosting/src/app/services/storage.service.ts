import { Injectable, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { getStorage, ref, getDownloadURL, uploadString } from '@firebase/storage';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private app = inject(FirebaseApp);
  private storage = getStorage(this.app);

  constructor() { }


  toDownloadUrl$(path: string) {
    const storageRef = ref(this.storage, path);
    return from(getDownloadURL(storageRef));
  }

  toDownloadUrl(path: string) {
    const storageRef = ref(this.storage, path);
    return getDownloadURL(storageRef);
  }

  async uploadDataUri(dataUri: string, path: string, type: string) {
    const storageRef = ref(this.storage, path);
    const uploadTask = await uploadString(storageRef, dataUri, 'data_url', { contentType: type });
    return uploadTask.ref.fullPath;
  }

}
