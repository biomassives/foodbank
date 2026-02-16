import en from './en';
import type { LangPack } from './en';
import { computed, ref } from 'vue';

const packs: Record<string, LangPack> = { en };
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

export type { LangPack };
