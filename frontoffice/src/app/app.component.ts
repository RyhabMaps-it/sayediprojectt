import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { LoginModalComponent } from './layout/login-modal/login-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoginModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Sayadi Group';
  private router = inject(Router);
  private static readonly CHROMELESS_PREFIXES = ['/connexion', '/inscription', '/catalogues/'];
  isChromeless = signal(AppComponent.isChromeless(this.router.url));

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.isChromeless.set(AppComponent.isChromeless((event as NavigationEnd).urlAfterRedirects));
    });
  }

  private static isChromeless(url: string): boolean {
    return AppComponent.CHROMELESS_PREFIXES.some((prefix) => url.startsWith(prefix));
  }
}
