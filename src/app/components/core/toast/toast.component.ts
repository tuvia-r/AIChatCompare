import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../../services';

@Component({
  selector: 'ai-chat-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  private messageService = inject(MessageService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toast => {
      this.messageService.add(toast);
    });
  }
}
