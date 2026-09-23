import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ar } from './translations/ar';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { Translations } from './translations/types';

export type Lang = 'fr' | 'en' | 'ar';

export interface LangOption {
  code: Lang;
  label: string;
  short: string;
}

export const LANGUAGES: LangOption[] = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'ع' }
];

const STORAGE_KEY = 'sayadi_lang';
const DICTIONARIES: Record<Lang, Translations> = { fr, en, ar };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private document = inject(DOCUMENT);
  private title = inject(Title);

  readonly lang = signal<Lang>(this.initialLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
      const root = this.document.documentElement;
      root.lang = lang;
      root.dir = lang === 'ar' ? 'rtl' : 'ltr';
      this.title.setTitle(this.t('meta.title'));
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // storage unavailable (private mode): the choice simply isn't remembered
      }
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  /** Resolves a dotted key ("home.heroTitle") and replaces {{param}} placeholders. */
  t(key: string, params?: Record<string, string | number | null | undefined>): string {
    const value = this.lookup(DICTIONARIES[this.lang()], key) ?? this.lookup(fr, key) ?? key;
    if (!params) {
      return value;
    }
    return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) => String(params[name] ?? ''));
  }

  private lookup(dict: Translations, key: string): string | null {
    let node: unknown = dict;
    for (const part of key.split('.')) {
      if (node === null || typeof node !== 'object') {
        return null;
      }
      node = (node as Record<string, unknown>)[part];
    }
    return typeof node === 'string' ? node : null;
  }

  private initialLang(): Lang {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'fr' || stored === 'en' || stored === 'ar') {
        return stored;
      }
    } catch {
      // ignore
    }
    const browser = (navigator.language || 'fr').slice(0, 2);
    return browser === 'en' || browser === 'ar' ? browser : 'fr';
  }
}
