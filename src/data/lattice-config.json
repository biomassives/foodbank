<template>
  <q-page class="bg-black text-white courier-font q-pa-xl">
    <div class="row items-end justify-between border-bottom-white q-pb-lg q-mb-xl">
      <div class="column">
        <h1 class="text-h1 text-weight-bolder q-ma-none letter-spacing-neg">
          {{ config.system.codename }}
        </h1>
        <div class="text-h6 text-marigold uppercase">{{ config.system.sub_header }}</div>
      </div>
      <div class="text-right">
        <div class="text-h3">{{ passPercentage }}%</div>
        <div class="text-overline">SYSTEM_INTEGRITY</div>
      </div>
    </div>

    <div class="row q-col-gutter-xl">
      <div class="col-12 col-md-7">
        <div class="text-overline text-grey-6 q-mb-md">REELS / SPRINT_01</div>
        <q-list dark bordered separator class="border-white-thin">
          <q-item v-for="test in config.sprint_tests" :key="test.id" class="q-py-md">
            <q-item-section avatar>
              <q-icon :name="test.passed ? 'check_box' : 'indeterminate_check_box'" 
                      :color="test.passed ? 'green-5' : 'red-9'" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-mono uppercase">{{ test.name }}</q-item-label>
              <q-item-label caption class="text-grey-7">{{ test.desc }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge outline :color="test.passed ? 'green-10' : 'red-10'">
                {{ test.passed ? 'STABLE' : 'CALIBRATING' }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="col-12 col-md-5">
        <q-card flat bordered class="bg-dark-dim border-white-thin q-pa-md q-mb-lg">
          <div class="text-h5 q-mb-sm text-italic">"{{ config.system.quote }}"</div>
          <q-btn to="/addressbook/" label="ENTER_THE_SILO" unelevated color="white" text-color="black" class="full-width text-bold" />
        </q-card>

        <div class="row q-col-gutter-md">
          <div v-for="(hub, key) in config.operational_hubs" :key="key" class="col-12">
            <q-card flat bordered class="bg-black border-white-thin hover-jolt cursor-pointer" @click="openModal(key)">
              <q-card-section class="row items-center">
                <div class="column">
                  <div class="text-overline text-grey-6">{{ key }}</div>
                  <div class="text-h4" :class="`text-${hub.items[0].color}`">{{ hub.items.length }}</div>
                </div>
                <q-space />
                <q-icon name="north_east" size="sm" color="grey-8" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="ui.modalActive" backdrop-filter="blur(10px) brightness(30%)">
      <q-card class="bg-black border-white-thick text-white courier-font" style="min-width: 380px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h5 uppercase">{{ ui.currentData.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator color="white" class="q-ma-md" />
        <q-card-section class="q-pt-none">
          <q-list separator dark>
            <q-item v-for="item in ui.currentData.items" :key="item.id" class="q-py-md">
              <q-item-section>
                <q-item-label class="text-bold" :class="`text-${item.color}`">{{ item.title }}</q-item-label>
                <q-item-label caption class="text-grey-4">{{ item.detail }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn outline color="white" :label="item.action" size="sm" @click="handleAction(item)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import latticeConfig from '../data/lattice-config.json';

const config = ref(latticeConfig);
const ui = ref({
  modalActive: false,
  currentData: { title: '', items: [] }
});

const passPercentage = computed(() => {
  const passed = config.value.sprint_tests.filter(t => t.passed).length;
  return Math.round((passed / config.value.sprint_tests.length) * 100);
});

const openModal = (key: string) => {
  ui.value.currentData = config.value.operational_hubs[key];
  ui.value.modalActive = true;
};

const handleAction = (item: any) => {
  console.log(`Action [${item.action}] triggered for ${item.title}`);
  // This is where you'd trigger the "Buzzer" we wrote earlier
};
</script>
