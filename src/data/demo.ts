import type { Address, Entry, Location } from 'src/models';

// ── Five demo users ──────────────────────────────────────────────

export const demoContacts: Address[] = [
  {
    id: 'demo-contact-1',
    name: { first: 'Maria', last: 'Chen' },
    email: 'maria@wardfoodpantry.org',
    phone: '(303) 555-0101',
  },
  {
    id: 'demo-contact-2',
    name: { first: 'Jake', last: 'Thompson' },
    email: 'jake.t@volunteer.org',
    phone: '(303) 555-0102',
  },
  {
    id: 'demo-contact-3',
    name: { first: 'Aisha', last: 'Patel' },
    email: 'aisha.p@community.org',
    phone: '(303) 555-0103',
  },
  {
    id: 'demo-contact-4',
    name: { first: 'Ben', last: 'Wright' },
    email: 'ben.w@neighbor.net',
    phone: '(303) 555-0104',
  },
  {
    id: 'demo-contact-5',
    name: { first: 'Rosa', last: 'Martinez' },
    email: 'rosa.m@gardens.org',
    phone: '(303) 555-0105',
  },
];

// ── Demo queue items at various statuses ─────────────────────────

const now = new Date();
const ago = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

export const demoQueueEntries: Entry[] = [
  {
    id: 'demo-queue-1',
    type: 'pickup_queue',
    description: '24 cans of soup + 12 boxes mac & cheese',
    location: 'Pickup Point A',
    status: 'active',
    queueStatus: 'pending',
    createdAt: ago(6),
    syncedToCloud: false,
  },
  {
    id: 'demo-queue-2',
    type: 'pickup_queue',
    description: 'Fresh produce box (15 lbs) — lettuce, tomatoes, apples',
    location: 'Pantry',
    status: 'active',
    queueStatus: 'claimed',
    claimedBy: 'Jake Thompson',
    claimedAt: ago(2),
    createdAt: ago(8),
    syncedToCloud: false,
  },
  {
    id: 'demo-queue-3',
    type: 'pickup_queue',
    description: 'Winter coats (box of 8) — assorted sizes',
    location: 'Pickup Point B',
    status: 'active',
    queueStatus: 'in_transit',
    claimedBy: 'Aisha Patel',
    claimedAt: ago(3),
    createdAt: ago(12),
    syncedToCloud: false,
  },
  {
    id: 'demo-queue-4',
    type: 'pickup_queue',
    description: 'Hygiene kits x12 — soap, toothbrush, shampoo',
    location: 'Pickup Point C',
    status: 'fulfilled',
    queueStatus: 'delivered',
    claimedBy: 'Jake Thompson',
    claimedAt: ago(18),
    completedAt: ago(14),
    createdAt: ago(24),
    syncedToCloud: false,
  },
  {
    id: 'demo-queue-5',
    type: 'pickup_queue',
    description: 'Rice and beans — 50lb bags x3',
    location: 'Pantry',
    status: 'active',
    queueStatus: 'pending',
    createdAt: ago(1),
    syncedToCloud: false,
  },
];

// ── Demo community entries ───────────────────────────────────────

export const demoCommunityEntries: Entry[] = [
  {
    id: 'demo-entry-1',
    type: 'need',
    description: 'Family of 4 needs diapers (size 3) and infant formula',
    status: 'active',
    createdAt: ago(4),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-2',
    type: 'offering',
    description: 'Garden surplus — 20 lbs zucchini, available through Friday',
    status: 'active',
    createdAt: ago(10),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-3',
    type: 'looking_for',
    description: 'Wheelchair-accessible delivery route for south neighborhood',
    status: 'active',
    createdAt: ago(48),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-4',
    type: 'upcoming_need',
    description: 'Holiday meal kits for 30 families — need by Dec 18',
    status: 'active',
    createdAt: ago(72),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-5',
    type: 'offering',
    description: 'Baked bread — 8 loaves, sourdough, pick up today',
    status: 'active',
    createdAt: ago(2),
    syncedToCloud: false,
  },
];

// ── Demo locations ───────────────────────────────────────────────

export const demoLocations: Location[] = [
  {
    id: 'demo-loc-1',
    name: 'Community Center',
    schedule: ['MON', 'WED', 'FRI'],
    contact: 'Maria Chen',
    phone: '(303) 555-0101',
    resources: ['Canned goods', 'Fresh produce', 'Hygiene kits', 'Diapers'],
    transportSize: 'large',
    notes: 'Loading dock in rear. Ring buzzer.',
    createdAt: ago(720),
  },
  {
    id: 'demo-loc-2',
    name: 'Church of the Hills',
    schedule: ['TUE', 'THU'],
    contact: 'Ben Wright',
    phone: '(303) 555-0104',
    resources: ['Bread', 'Dairy', 'Eggs', 'Baked goods'],
    transportSize: 'medium',
    notes: 'Side entrance. Cooler available.',
    createdAt: ago(600),
  },
  {
    id: 'demo-loc-3',
    name: 'Mobile Stop — South Park',
    schedule: ['SAT'],
    contact: 'Jake Thompson',
    phone: '(303) 555-0102',
    resources: ['Mixed staples', 'Clothing', 'Blankets'],
    transportSize: 'oversize',
    notes: 'Need truck. Park at south lot.',
    createdAt: ago(480),
  },
];

// ── All demo data combined ───────────────────────────────────────

export const allDemoEntries: Entry[] = [...demoQueueEntries, ...demoCommunityEntries];
