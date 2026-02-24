import { reactive, watch } from 'vue';
import type { DayOfWeek, TransportSize } from 'src/models';

const STORAGE_KEY = 'wb-wizard-state';

export interface InventoryCategory {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
  items: string[];
}

export interface WizardState {
  step: number;
  pantryName: string;
  adminEmail: string;
  mode: 'shared' | 'local' | 'advanced';
  customUrl: string;
  customKey: string;
  locationName: string;
  locationSchedule: DayOfWeek[];
  locationTransportSize: TransportSize;
  locationContact: string;
  locationPhone: string;
  inviteCode: string;
  contacts: Array<{ first: string; last: string; phone: string; email: string }>;
  inventory: InventoryCategory[];
  completed: boolean;
  orgId: string | null;
}

function getDefaultState(): WizardState {
  return {
    step: 1,
    pantryName: '',
    adminEmail: '',
    mode: 'shared',
    customUrl: '',
    customKey: '',
    locationName: '',
    locationSchedule: [],
    locationTransportSize: 'medium',
    locationContact: '',
    locationPhone: '',
    inviteCode: '',
    contacts: [],
    inventory: [],
    completed: false,
    orgId: null,
  };
}

function loadFromStorage(): WizardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...getDefaultState(), ...JSON.parse(raw) };
  } catch { /* ignore corrupt data */ }
  return getDefaultState();
}

export function useWizard() {
  const state = reactive<WizardState>(loadFromStorage());

  watch(
    () => ({ ...state }),
    (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
    { deep: true }
  );

  function reset() {
    Object.assign(state, getDefaultState());
    localStorage.removeItem(STORAGE_KEY);
  }

  return { state, reset };
}
