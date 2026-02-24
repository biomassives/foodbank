<template>
  <q-banner inline-actions rounded class="bg-secondary text-white">
    Nothing Address
    <template v-slot:action>
      <q-btn @click="putData" label="Put Example" />
    </template>
  </q-banner>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import uniqueId from 'lodash.uniqueid';
import { useAddressStore } from '../store/store';

export default defineComponent({
  name: 'BannerComponent',
  setup() {
    const addressStore = useAddressStore();
    const putData = async () => {
      const data = {
        id: uniqueId('address-'),
        name: { first: 'Dan', last: 'Freeman' },
        email: '4drfreeman@gmail.com',
        phone: '720 371 1757',
      };
      await addressStore.addData(data);
    };
    return {
      addressStore,
      putData,
    };
  },
});
</script>
<style scoped></style>
