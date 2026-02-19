import { ref, watchEffect } from 'vue';

type Theme = 'dark' | 'light' | 'bauhaus';

const STORAGE_KEY = 'wb-theme';

function getDefaultTheme(): Theme {
  const hour = new Date().getHours();
  return (hour >= 7 && hour < 19) ? 'light' : 'dark';
}

const current = ref<Theme>(
  (localStorage.getItem(STORAGE_KEY) as Theme) || getDefaultTheme()
);

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// Apply on first import
if (typeof document !== 'undefined') {
  applyTheme(current.value);
}

export function useTheme() {
  watchEffect(() => {
    applyTheme(current.value);
    localStorage.setItem(STORAGE_KEY, current.value);
  });

  function toggle() {
    const order: Theme[] = ['dark', 'light', 'bauhaus'];
    const idx = order.indexOf(current.value);
    current.value = order[(idx + 1) % order.length];
  }

  function set(theme: Theme) {
    current.value = theme;
  }

  return {
    isDark: current,
    toggle,
    set,
  };
}
