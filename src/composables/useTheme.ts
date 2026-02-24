import { ref, watchEffect } from 'vue';

type Theme = 'dark' | 'light' | 'bauhaus' | 'mondrian-dawn';

const STORAGE_KEY = 'wb-theme';

/**
 * 4-period 6-hour rotation (used as the default for new visitors).
 * Once a theme is stored in localStorage (either auto-picked or user-chosen),
 * it persists until the user changes it in Settings.
 *
 *  00:00 – 05:59  →  dark          (night)
 *  06:00 – 11:59  →  mondrian-dawn (morning)
 *  12:00 – 17:59  →  light         (afternoon)
 *  18:00 – 23:59  →  bauhaus       (evening)
 */
function getDefaultTheme(): Theme {
  const hour = new Date().getHours();
  if (hour < 6)  return 'dark';
  if (hour < 12) return 'mondrian-dawn';
  if (hour < 18) return 'light';
  return 'bauhaus';
}

const current = ref<Theme>(
  (localStorage.getItem(STORAGE_KEY) as Theme) || getDefaultTheme()
);

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

if (typeof document !== 'undefined') {
  applyTheme(current.value);
}

export function useTheme() {
  watchEffect(() => {
    applyTheme(current.value);
    localStorage.setItem(STORAGE_KEY, current.value);
  });

  function toggle() {
    const order: Theme[] = ['dark', 'light', 'bauhaus', 'mondrian-dawn'];
    const idx = order.indexOf(current.value);
    current.value = order[(idx + 1) % order.length];
  }

  function set(theme: Theme) {
    current.value = theme;
  }

  // isDark is exported as the full theme value (not boolean) because
  // SettingsPage uses it as `isDark === 'dark'` / `isDark === opt.value`.
  // This naming is legacy; use `theme` for new code.
  const isDark = current;

  return {
    theme: current,
    isDark,
    toggle,
    set,
  };
}
