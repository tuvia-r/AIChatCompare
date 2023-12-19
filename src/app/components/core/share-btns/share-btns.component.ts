import { Component } from '@angular/core';

const shareText = 'Check out this awesome AI Chat Compare app!';
const url = 'https://ai-chat-compare.web.app/chat';

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
    window.navigator.clipboard.writeText(url);
  }

  open(url: string): void {
    window.open(encodeURI(url), '_blank');
  }

  shareOnTwitter(): void {
    this.open(`https://twitter.com/intent/tweet?link=${url}&hashtags=AIChatCompare&text=${shareText}\n${url}\n`);
  }

  shareOnFacebook(): void {
    this.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${shareText}`);
  }

  shareOnWhatsapp(): void {
    this.open(`https://api.whatsapp.com/send?text=${url}`);
  }

  shareOnTelegram(): void {
    this.open(`https://t.me/share/url?url=${url}&text=${shareText}`);
  }

  shareOnLinkedin(): void {
    this.open(`https://www.linkedin.com/feed/?shareActive=true&&text=${shareText}\n${url}`);
  }

  shareOnReddit(): void {
    this.open(`https://reddit.com/submit?url=${url}&title=${shareText}`);
  }

}
