<template>
  <Analytics />
  <router-view />
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue';
</script>
