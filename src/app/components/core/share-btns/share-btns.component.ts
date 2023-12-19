import { Component } from '@angular/core';

const shareText = 'Check out this awesome AI Chat Compare app!';

@Component({
  selector: 'ai-chat-share-btns',
  templateUrl: './share-btns.component.html',
  styleUrl: './share-btns.component.scss'
})
export class ShareBtnsComponent {

  goToGithub(): void {
    window.open('https://github.com/tuvia-r/AIChatCompare', '_blank');
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

  copyLink(): void {
    window.navigator.clipboard.writeText(window.location.href);
  }

  shareOnTwitter(): void {
    window.open(`https://twitter.com/intent/tweet?link=${window.location.href}&hashtags=AIChatCompare&text=${shareText}`, '_blank');
  }

  shareOnFacebook(): void {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${shareText}`, '_blank');
  }

  shareOnWhatsapp(): void {
    window.open(`https://api.whatsapp.com/send?text=${window.location.href}`, '_blank');
  }

  shareOnTelegram(): void {
    window.open(`https://t.me/share/url?url=${window.location.href}&text=${shareText}`, '_blank');
  }

  shareOnLinkedin(): void {
    window.open(`https://www.linkedin.com/sharing/share-offsite?mini=true&url=${window.location.href}&title=${shareText}`, '_blank');
  }

  shareOnReddit(): void {
    window.open(`https://reddit.com/submit?url=${window.location.href}&title=${shareText}`, '_blank');
  }

}
