<template>
  <div class="bio-carousel-wrap">
    <q-carousel
      v-model="slide"
      transition-prev="slide-right"
      transition-next="slide-left"
      swipeable
      animated
      control-color="accent"
      navigation
      padding
      arrows
      height="220px"
      class="bio-carousel"
    >
      <q-carousel-slide name="welcome" class="column no-wrap flex-center">
        <div class="hero-reg" style="top:8px; left:8px;">REG_01: STATUS</div>
        <q-icon name="eco" size="56px" class="q-mb-sm" :color="store.canSync ? 'positive' : 'accent'" />
        <div class="text-h6 text-uppercase text-weight-bolder letter-spacing-4">
          {{ pantryName || 'Local Pantry' }}
        </div>
        <div class="text-caption text-center q-px-md">
          {{ store.canSync ? 'Connected to Global Biodiversity Ledger' : 'Operating in Sovereign Local Mode' }}
        </div>
      </q-carousel-slide>

      <q-carousel-slide name="tokens" class="column no-wrap flex-center">
        <div class="hero-reg" style="top:8px; left:8px;">REG_02: EDUCATION</div>
        <q-icon name="token" size="56px" color="accent" class="q-mb-sm" />
        <div class="text-subtitle1 text-weight-bold">Understanding Tokens</div>
        <div class="text-caption text-center q-px-lg">
          Biodiversity tokens represent local flora density. 
          <span class="text-weight-bold">Rearrange</span> your ledger to prioritize urgent ecological observations.
        </div>
      </q-carousel-slide>

      <q-carousel-slide name="action" class="column no-wrap flex-center">
        <div class="hero-reg" style="top:8px; left:8px;">REG_03: ACTION</div>
        <q-icon name="add_location_alt" size="56px" color="positive" class="q-mb-sm" />
        <div class="text-subtitle1 text-weight-bold">Record a Species</div>
        <q-btn 
          flat 
          outline 
          label="Open Quick Add" 
          icon="add" 
          class="q-mt-sm onboard-btn" 
          @click="$emit('open-add')"
        />
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAddressStore } from 'src/store/store';

const store = useAddressStore();
const slide = ref('welcome');
const pantryName = computed(() => localStorage.getItem('pantryName'));

defineEmits(['open-add']);
</script>

<style lang="scss" scoped>
.bio-carousel-wrap {
  border-bottom: 3px solid var(--wb-border);
  background: var(--wb-surface);
}

.bio-carousel {
  background: transparent;
  color: var(--wb-text);
}

.letter-spacing-4 {
  letter-spacing: 4px;
}

.hero-reg {
  position: absolute;
  font-family: monospace;
  font-size: 10px;
  color: var(--wb-text-faint);
  letter-spacing: 1px;
}

// Styling the dots to look more "Warhol"
:deep(.q-carousel__navigation-inner) {
  .q-btn {
    font-size: 6px;
    &.q-btn--actionable {
      color: var(--wb-border-mid) !important;
    }
  }
}
</style>
