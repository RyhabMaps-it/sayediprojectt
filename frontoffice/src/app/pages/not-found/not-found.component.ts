import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="section not-found">
      <div class="container">
        <h1>404</h1>
        <p>{{ 'notFound.text' | t }}</p>
        <a routerLink="/" class="btn btn-primary">{{ 'notFound.back' | t }}</a>
      </div>
    </section>
  `,
  styles: [
    `
      .not-found {
        text-align: center;
        padding: 100px 0;
      }
      .not-found h1 {
        font-size: 4rem;
        color: var(--color-maroon);
      }
      .not-found p {
        margin-bottom: 24px;
      }
    `
  ]
})
export class NotFoundComponent {}
