import type { Address, Entry, Location } from 'src/models';
import { basicDemo } from './basicDemo';
import { logistics14day } from './logistics14day';

// ── Simulation interface ──────────────────────────────────────────

export interface Simulation {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tags: string[];
  contacts: Address[];
  entries: Entry[];
  locations: Location[];
  localStorageContent?: Record<string, string>;
}

// ── Registry ──────────────────────────────────────────────────────

export const SIMULATIONS: Simulation[] = [
  basicDemo,
  logistics14day,
];

export function getSimulation(id: string): Simulation | undefined {
  return SIMULATIONS.find(s => s.id === id);
}
