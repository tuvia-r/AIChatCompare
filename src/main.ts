import 'prismjs/plugins/autoloader/prism-autoloader.min.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';


bootstrapApplication(AppComponent, appConfig)
.then((ref) => {
  if((globalThis as any)?.Prism?.plugins.autoloader.languages_path){
    (globalThis as any).Prism.plugins.autoloader.languages_path = 'assets/prismjs/components/';
  }
})
  .catch((err) => console.error(err));
