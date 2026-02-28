import type { Address, Entry, Location } from 'src/models';

// ── Demo contacts ─────────────────────────────────────────────────

export const demoContacts: Address[] = [
  {
    id: 'demo-contact-1',
    name: { first: 'Maria', last: 'Chen' },
    email: 'maria@riversidefoodpantry.org',
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
  {
    id: 'demo-contact-6',
    name: { first: 'Devon', last: 'Park' },
    email: 'devon.p@routes.org',
    phone: '(303) 555-0106',
  },
  {
    id: 'demo-contact-7',
    name: { first: 'Sam', last: 'Okafor' },
    email: 'sam.o@logistics.net',
    phone: '(303) 555-0107',
  },
];

// ── Time helpers ──────────────────────────────────────────────────

const now = new Date();
const ago = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

// ── Demo queue entries — all 5 statuses, locations match hub names ─
// NOTE: location values must match Location.name exactly for the hub diagram

export const demoQueueEntries: Entry[] = [
  // PENDING (orange) — waiting for a driver
  {
    id: 'demo-queue-1',
    type: 'pickup_queue',
    description: '24 cans soup · 12 boxes mac & cheese · 6 jars peanut butter',
    location: 'Eastside Community Hub',
    status: 'active',
    queueStatus: 'pending',
    createdAt: ago(1.5),
    syncedToCloud: false,
  },
  {
    id: 'demo-queue-2',
    type: 'pickup_queue',
    description: 'Fresh produce box — lettuce, tomatoes, apples (15 lbs)',
    location: 'School District Depot',
    status: 'active',
    queueStatus: 'pending',
    createdAt: ago(0.5),
    syncedToCloud: false,
  },
  // CLAIMED (yellow) — driver accepted, hasn't left yet
  {
    id: 'demo-queue-3',
    type: 'pickup_queue',
    description: 'Bread & dairy run — 8 loaves, 12 qt milk, 6 doz eggs',
    location: "St. Mary's Food Pantry",
    status: 'active',
    queueStatus: 'claimed',
    claimedBy: 'Jake Thompson',
    claimedAt: ago(0.5),
    createdAt: ago(3),
    syncedToCloud: false,
  },
  // IN TRANSIT (green animated) — driver on the road
  {
    id: 'demo-queue-4',
    type: 'pickup_queue',
    description: 'Hygiene kits × 20 — soap, toothbrush, shampoo, deodorant',
    location: 'Veterans Center',
    status: 'active',
    queueStatus: 'in_transit',
    claimedBy: 'Aisha Patel',
    claimedAt: ago(2),
    createdAt: ago(6),
    syncedToCloud: false,
  },
  {
    id: 'demo-queue-5',
    type: 'pickup_queue',
    description: 'Winter clothing — coats (8), gloves (12 pairs), hats (15)',
    location: 'South Park Mobile Stop',
    status: 'active',
    queueStatus: 'in_transit',
    claimedBy: 'Devon Park',
    claimedAt: ago(1.5),
    createdAt: ago(5),
    syncedToCloud: false,
  },
  {
    id: 'demo-queue-6',
    type: 'pickup_queue',
    description: 'Dry staples — rice 50 lb × 3, lentils 25 lb × 4, oats 10 lb × 6',
    location: 'Eastside Community Hub',
    status: 'active',
    queueStatus: 'in_transit',
    claimedBy: 'Jake Thompson',
    claimedAt: ago(1),
    createdAt: ago(8),
    syncedToCloud: false,
  },
  // DELIVERED (checkmark icon) — dropped off, not yet shelved
  {
    id: 'demo-queue-7',
    type: 'pickup_queue',
    description: 'Infant supplies — diapers size 3 × 4, formula × 6, wipes × 4',
    location: 'Eastside Community Hub',
    status: 'fulfilled',
    queueStatus: 'delivered',
    claimedBy: 'Rosa Martinez',
    claimedAt: ago(6),
    completedAt: ago(4),
    createdAt: ago(10),
    syncedToCloud: false,
  },
  // STOCKED (violet) — shelved and available
  {
    id: 'demo-queue-8',
    type: 'pickup_queue',
    description: 'Canned vegetables — corn, green beans, tomatoes × 48 each',
    location: "St. Mary's Food Pantry",
    status: 'fulfilled',
    queueStatus: 'stocked',
    claimedBy: 'Ben Wright',
    claimedAt: ago(26),
    completedAt: ago(20),
    createdAt: ago(32),
    syncedToCloud: false,
  },
];

// ── Demo community board entries ──────────────────────────────────

export const demoCommunityEntries: Entry[] = [
  {
    id: 'demo-entry-1',
    type: 'need',
    description: 'Family of 4 needs diapers (size 3) and infant formula — ongoing monthly',
    status: 'active',
    createdAt: ago(4),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-2',
    type: 'need',
    description: 'School backpacks + supplies for 3 kids starting next week',
    status: 'active',
    createdAt: ago(18),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-3',
    type: 'offering',
    description: 'Garden harvest — tomatoes (40 lbs), zucchini (20 lbs), peppers. Available Fri–Sun.',
    status: 'active',
    createdAt: ago(8),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-4',
    type: 'offering',
    description: 'Artisan bakery donation — sourdough, wheat, rye (12 loaves). Pick up by 4pm.',
    status: 'active',
    createdAt: ago(2),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-5',
    type: 'offering',
    description: 'Winter coats — adult sizes S/M/L/XL, assorted. Clean and bagged.',
    status: 'active',
    createdAt: ago(36),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-6',
    type: 'looking_for',
    description: 'Need one more driver for Friday Eastside run. 2-hour shift, large vehicle preferred.',
    status: 'active',
    createdAt: ago(24),
    syncedToCloud: false,
  },
  {
    id: 'demo-entry-7',
    type: 'upcoming_need',
    description: 'Thanksgiving meal kits for 45 families — need donations and packing volunteers by Nov 20.',
    status: 'active',
    createdAt: ago(72),
    syncedToCloud: false,
  },
];

// ── Demo locations (5 hubs, names must match queue entry location field) ─

export const demoLocations: Location[] = [
  {
    id: 'demo-loc-1',
    name: 'Eastside Community Hub',
    schedule: ['MON', 'WED', 'FRI'],
    contact: 'Maria Chen',
    phone: '(303) 555-0101',
    resources: ['Canned goods', 'Fresh produce', 'Hygiene kits', 'Diapers', 'Dry staples'],
    transportSize: 'large',
    notes: 'Loading dock in rear. Ring buzzer. Forklift available Wed/Fri.',
    createdAt: ago(720),
  },
  {
    id: 'demo-loc-2',
    name: "St. Mary's Food Pantry",
    schedule: ['TUE', 'THU'],
    contact: 'Ben Wright',
    phone: '(303) 555-0104',
    resources: ['Bread', 'Dairy', 'Eggs', 'Baked goods', 'Canned vegetables'],
    transportSize: 'medium',
    notes: 'Side entrance on Oak St. Cooler available for dairy.',
    createdAt: ago(600),
  },
  {
    id: 'demo-loc-3',
    name: 'South Park Mobile Stop',
    schedule: ['SAT'],
    contact: 'Jake Thompson',
    phone: '(303) 555-0102',
    resources: ['Mixed staples', 'Clothing', 'Blankets', 'Personal care'],
    transportSize: 'oversize',
    notes: 'Truck required. Park at south lot off Maple Ave. Setup by 9:30am.',
    createdAt: ago(480),
  },
  {
    id: 'demo-loc-4',
    name: 'Veterans Center',
    schedule: ['MON', 'THU'],
    contact: 'Sam Okafor',
    phone: '(303) 555-0107',
    resources: ['Hygiene kits', 'Clothing', 'Non-perishables', 'Household items'],
    transportSize: 'medium',
    notes: 'Check in at front desk. Use freight elevator. Bay 3.',
    createdAt: ago(360),
  },
  {
    id: 'demo-loc-5',
    name: 'School District Depot',
    schedule: ['WED', 'FRI'],
    contact: 'Devon Park',
    phone: '(303) 555-0106',
    resources: ['School supplies', 'Snack packs', 'Fresh produce', 'Dry staples'],
    transportSize: 'large',
    notes: 'Warehouse Bldg C, gate code 4412. Access Mon–Fri 7am–3pm only.',
    createdAt: ago(240),
  },
];

// ── Demo localStorage content (set on load, restored on clear) ────

export const demoLocalStorage: Record<string, string> = {
  'pantry-welcome': JSON.stringify({
    name: 'Riverside Community Pantry',
    tagline: 'Neighbors feeding neighbors since 2018',
    about:
      'A volunteer-run food pantry serving 200+ families across the east district. ' +
      'We operate five hub locations with a dedicated team of drivers, stock volunteers, ' +
      'and logistics coordinators. All food is free — no ID required, no questions asked.',
  }),
  'pantry-ops-page': JSON.stringify({
    pageTitle: 'Riverside Community Pantry',
    intro:
      'Open five days a week across multiple pickup locations. ' +
      'Serving the Eastside, Veterans Center, South Park, and school district communities.',
    sections: [
      {
        id: 'hours',
        title: 'Hours & Pickup Locations',
        body:
          'Mon/Wed/Fri — Eastside Community Hub · 9am–1pm\n' +
          'Mon/Thu — Veterans Center · 10am–2pm\n' +
          "Tue/Thu — St. Mary's Food Pantry · 10am–2pm\n" +
          'Wed/Fri — School District Depot · 8am–12pm\n' +
          'Sat — South Park Mobile Stop · 10am–12pm (truck route)',
      },
      {
        id: 'eligibility',
        title: 'Who We Serve',
        body:
          'Any household in need is welcome. No ID required, no income verification, no appointments. ' +
          'Just show up during open hours or request a delivery through a volunteer.',
      },
      {
        id: 'volunteer',
        title: 'Volunteer With Us',
        body:
          'We need drivers (Mon, Wed, Fri), stock volunteers (Tue, Thu), and logistics help on Saturdays. ' +
          'Contact us or use an invite code from a current volunteer to join the team.',
      },
    ],
  }),
  'pantry-weekly-schedule': JSON.stringify({
    1: { open: true, openTime: '09:00', closeTime: '13:00', notes: 'Eastside Hub + Veterans Center' },
    2: { open: true, openTime: '10:00', closeTime: '14:00', notes: "St. Mary's Pantry" },
    3: { open: true, openTime: '08:00', closeTime: '15:00', notes: 'Eastside Hub + School Depot' },
    4: { open: true, openTime: '10:00', closeTime: '14:00', notes: "St. Mary's + Veterans Center" },
    5: { open: true, openTime: '09:00', closeTime: '13:00', notes: 'Eastside Hub + School Depot' },
    6: { open: true, openTime: '10:00', closeTime: '12:00', notes: 'South Park Mobile Stop (truck route)' },
    0: { open: false, openTime: '', closeTime: '', notes: '' },
  }),
};

// ── All demo entries combined ─────────────────────────────────────

export const allDemoEntries: Entry[] = [...demoQueueEntries, ...demoCommunityEntries];
