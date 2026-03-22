import en from './en';
import es from './es';
import sw from './sw';
import type { LangPack } from './en';
import { computed, ref } from 'vue';

const packs: Record<string, LangPack> = { en, es, sw };
const currentLocale = ref('en');

/** Composable — returns reactive lang pack */
export function useI18n() {
  const t = computed(() => packs[currentLocale.value] || packs.en);
  return { t, locale: currentLocale };
}

/** Imperatively switch locale */
export function setLocale(locale: string) {
  if (packs[locale]) {
    currentLocale.value = locale;
  }
}

/** Register a new language pack at runtime */
export function registerLangPack(locale: string, pack: LangPack) {
  packs[locale] = pack;
}

/**
 * Function-style composable for components that use t('dotted.key') syntax.
 * Drop-in replacement for vue-i18n's useI18n() in this project.
 */
export function useTranslate() {
  const pack = computed(() => packs[currentLocale.value] || packs.en);

  function t(key: string): string | Record<string, unknown> {
    const keys = key.split('.');
    let cur: unknown = pack.value;
    for (const k of keys) cur = (cur as Record<string, unknown>)?.[k];
    return (cur as string | Record<string, unknown>) ?? key;
  }

  function tm(key: string): string | Record<string, unknown> {
    return t(key);
  }

  return { t, tm, locale: currentLocale };
}

export type { LangPack };
