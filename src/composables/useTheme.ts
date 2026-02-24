import { ref, watchEffect } from 'vue';

// Added 'mondrian-dawn' to the type definition
type Theme = 'dark' | 'light' | 'bauhaus' | 'mondrian-dawn';

const STORAGE_KEY = 'wb-theme';

function getDefaultTheme(): Theme {
  const hour = new Date().getHours();
  // Early morning context (6am - 9am) gets the new theme by default!
  if (hour >= 6 && hour < 9) return 'mondrian-dawn';
  return (hour >= 7 && hour < 19) ? 'light' : 'dark';
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
    // Included 'mondrian-dawn' in the rotation
    const order: Theme[] = ['dark', 'light', 'bauhaus', 'mondrian-dawn'];
    const idx = order.indexOf(current.value);
    current.value = order[(idx + 1) % order.length];
  }

  function set(theme: Theme) {
    current.value = theme;
  }

  return {
    theme: current, 
    toggle,
    set,
  };
}
