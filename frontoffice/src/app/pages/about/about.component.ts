import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolveImageUrl } from '../../core/utils/image-url';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  images = {
    zaytouna: resolveImageUrl('/images/products/claustra-zaytouna-1.jpg'),
    fence: resolveImageUrl('/images/products/claustra-skaya-2.jpg')
  };
}
