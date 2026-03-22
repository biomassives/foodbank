<template>
  <Analytics />
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { Analytics } from '@vercel/analytics/vue';

const $q = useQuasar();

onMounted(() => {
  // Android / Chrome install banner
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    const prompt = e as Event & {
      prompt(): Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    $q.notify({
      message: 'Add Funky Pony Space to your home screen',
      caption: 'Works offline · one-tap access',
      icon: 'get_app',
      color: 'grey-10',
      textColor: 'yellow-6',
      position: 'bottom',
      timeout: 0,
      actions: [
        {
          label: 'Install',
          color: 'yellow',
          noCaps: true,
          handler: () => { void prompt.prompt(); }
        },
        { label: 'Not now', color: 'grey-5', noCaps: true }
      ]
    });
  });

  // iOS: show Share → Add to Home Screen hint once per session
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    !!(navigator as Navigator & { standalone?: boolean }).standalone;
  if (isIOS && !isStandalone && !sessionStorage.getItem('ios-hint')) {
    sessionStorage.setItem('ios-hint', '1');
    setTimeout(() => {
      $q.notify({
        message: 'To install: tap Share then "Add to Home Screen"',
        icon: 'ios_share',
        color: 'grey-10',
        textColor: 'yellow-6',
        position: 'bottom',
        timeout: 7000
      });
    }, 3500);
  }
});
</script>
