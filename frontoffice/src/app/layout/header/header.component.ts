import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService, LANGUAGES, Lang } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { LoginModalService } from '../../core/services/login-modal.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  menuOpen = signal(false);
  langMenuOpen = signal(false);
  profileOpen = signal(false);

  i18n = inject(I18nService);
  languages = LANGUAGES;
  currentLang = computed(() => LANGUAGES.find((l) => l.code === this.i18n.lang())!);

  initials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase();
  });

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private loginModal: LoginModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.cartService.refresh().subscribe();
    }
  }

  selectLang(lang: Lang): void {
    this.i18n.setLang(lang);
    this.langMenuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  openLogin(): void {
    this.closeMenu();
    this.loginModal.open();
  }

  toggleProfile(): void {
    this.profileOpen.update((v) => !v);
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  closeProfile(): void {
    this.profileOpen.set(false);
  }

  logout(): void {
    this.closeProfile();
    this.authService.logout();
    this.cartService.reset();
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
