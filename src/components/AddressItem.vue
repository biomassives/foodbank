<template>
  <q-item
    class="address-item q-ma-sm shadow-1 cursor-pointer"
    style="border-radius: 16px"
  >
    <q-item-section avatar class="gt-xs">
      <q-avatar class="address-avatar" icon="person" />
    </q-item-section>
    <q-item-section class="col-2" style="flex-grow: 1">
      <q-item-label class="address-name q-mt-sm" lines="1">
        {{ address ? address.name.first + ' ' + address.name.last : 'Unknown' }}
      </q-item-label>
    </q-item-section>
    <q-item-section style="flex-grow: 4">
      <q-item-label class="address-caption" caption>
        {{ address ? address.email : 'Unknown' }}
      </q-item-label>
      <q-item-label class="address-caption" caption>
        {{ address ? address.phone : 'Unknown' }}
      </q-item-label>
    </q-item-section>
    <q-item-section v-if="addressStore.canEdit" side>
      <div class="address-actions q-gutter-xs">
        <q-btn
          size="12px"
          flat
          dense
          round
          icon="edit"
          @click="modal = true"
        />
        <address-modal v-model:card-state="modal" :addressInfo="address" />

        <q-btn
          size="12px"
          flat
          dense
          round
          @click="confirm = true"
          icon="delete"
        />
        <q-dialog v-model="confirm">
          <q-card class="address-dialog-card">
            <q-card-section>
              <h6 class="address-dialog-title">
                Do you want to delete this address?
              </h6>
            </q-card-section>
            <q-separator class="address-separator" />
            <q-card-actions align="right">
              <q-btn
                flat
                label="Yes"
                class="address-btn--warning"
                @click="deleteAddress"
              />
              <q-btn flat label="Cancel" class="address-btn--primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </q-item-section>
  </q-item>
  <q-separator class="address-separator" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useAddressStore } from 'src/store/store';
import AddressModal from './childcomponents/Modal.vue';
import type { Address } from '../models';

const props = defineProps<{ address: Address }>();

const addressStore = useAddressStore();
const modal = ref(false);
const confirm = ref(false);

const deleteAddress = async () => {
  await addressStore.deleteData(props.address.id);
  confirm.value = false;
};
</script>
<style scoped>
.address-item {
  background: var(--wb-surface);
}

.address-avatar {
  background: var(--wb-info);
  color: #fff;
}

.address-name {
  color: var(--wb-text);
  font-family: var(--wb-font);
  font-weight: 700;
}

.address-caption {
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
}

.address-actions {
  color: var(--wb-info);
}

.address-dialog-card {
  background: var(--wb-modal-bg);
  color: var(--wb-text);
  border: 2px solid var(--wb-modal-border);
}

.address-dialog-title {
  color: var(--wb-info);
  font-family: var(--wb-font);
  font-weight: 700;
  margin: 0;
}

.address-separator {
  background: var(--wb-border-subtle);
}

.address-btn--warning {
  background: var(--wb-warning);
  color: #fff;
}

.address-btn--primary {
  background: var(--wb-info);
  color: #fff;
}
</style>
