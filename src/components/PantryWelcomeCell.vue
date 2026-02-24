<template>
  <div class="welcome-cell">
    <div v-if="content.name" class="welcome-org">{{ content.name }}</div>
    <div v-if="content.tagline" class="welcome-tagline">{{ content.tagline }}</div>
    <div v-if="content.about" class="welcome-about">{{ content.about }}</div>
    <img v-if="drawing" :src="drawing" alt="" class="welcome-drawing" />
    <div v-if="!content.name && !content.about && !drawing" class="welcome-placeholder">
      <q-icon name="storefront" size="20px" class="welcome-placeholder-icon" />
      <span>Add a welcome message in Admin → Welcome</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const WELCOME_KEY = 'pantry-welcome';
const DRAWING_KEY = 'pantry-homepage-drawing';

interface WelcomeContent {
  name: string;
  tagline: string;
  about: string;
}

const content = ref<WelcomeContent>({ name: '', tagline: '', about: '' });
const drawing = ref('');

onMounted(() => {
  try {
    const raw = localStorage.getItem(WELCOME_KEY);
    if (raw) content.value = { ...content.value, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  drawing.value = localStorage.getItem(DRAWING_KEY) || '';
});
</script>

<style scoped>
.welcome-cell {
  padding: 18px 20px;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.welcome-org {
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 1.05rem;
  letter-spacing: 3px;
  color: var(--wb-text);
  text-transform: uppercase;
  line-height: 1.2;
}

.welcome-tagline {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
  text-transform: uppercase;
}

.welcome-about {
  font-family: var(--wb-font);
  font-size: 0.78rem;
  color: var(--wb-text-muted);
  line-height: 1.6;
  margin-top: 4px;
}

.welcome-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-size: 0.6rem;
  letter-spacing: 1px;
  text-align: center;
  padding: 8px;
}

.welcome-placeholder-icon {
  opacity: 0.3;
}

.welcome-drawing {
  width: 100%;
  max-height: 150px;
  object-fit: contain;
  border-radius: 2px;
  opacity: 0.92;
  background: transparent;
  margin-top: 4px;
}
</style>
