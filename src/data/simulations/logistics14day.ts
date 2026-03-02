/**
 * Simulation: 7 Drivers & Stockers · 33 Hubs · 14 Days
 *
 * Models a busy regional food distribution network over two weeks.
 * One central stocking location (Central Distribution Center) receives
 * all deliveries from 32 pickup hubs. The pipeline shows full aging:
 *   oldest items → STOCKED, mid-week → DELIVERED/IN TRANSIT, recent → CLAIMED/PENDING
 *
 * Generated programmatically — ~140 queue entries, 33 locations, 7 contacts.
 */

import type { Address, Entry, Location, QueueStatus, DayOfWeek } from 'src/models';
import type { Simulation } from './index';

// ── People ────────────────────────────────────────────────────────

const CONTACTS: Address[] = [
  { id: 'lg-c1', name: { first: 'Maria',  last: 'Chen'      }, email: 'maria@cityfoodhub.org',   phone: '(303) 555-0101' },
  { id: 'lg-c2', name: { first: 'Jake',   last: 'Thompson'  }, email: 'jake@routes.org',          phone: '(303) 555-0102' },
  { id: 'lg-c3', name: { first: 'Aisha',  last: 'Patel'     }, email: 'aisha@volunteer.org',      phone: '(303) 555-0103' },
  { id: 'lg-c4', name: { first: 'Devon',  last: 'Park'      }, email: 'devon@driver.org',         phone: '(303) 555-0104' },
  { id: 'lg-c5', name: { first: 'Ben',    last: 'Wright'    }, email: 'ben@stock.org',            phone: '(303) 555-0105' },
  { id: 'lg-c6', name: { first: 'Rosa',   last: 'Martinez'  }, email: 'rosa@community.org',       phone: '(303) 555-0106' },
  { id: 'lg-c7', name: { first: 'Sam',    last: 'Okafor'   }, email: 'sam@logistics.org',        phone: '(303) 555-0107' },
];

const DRIVERS       = ['Jake Thompson', 'Aisha Patel', 'Devon Park'];
const PANTRY_OPS    = ['Ben Wright', 'Rosa Martinez'];

// ── 33 Locations ──────────────────────────────────────────────────
// Location 0 = Central Distribution Center (stocking destination)
// Locations 1–32 = pickup hubs across 5 districts

type LocDef = { name: string; schedule: DayOfWeek[]; contact: string; phone: string; resources: string[]; size: Location['transportSize']; notes: string };

const LOC_DEFS: LocDef[] = [
  // ── Central (1) ─────────────────────────────────────────────────
  { name: 'Central Distribution Center', schedule: ['MON','TUE','WED','THU','FRI'], contact: 'Maria Chen',    phone: '(303) 555-0101', resources: ['All categories — receiving & storage'], size: 'superload', notes: 'Main stocking facility. Dock A–D. Forklift on site. 6am–6pm.' },

  // ── Northside (7) ───────────────────────────────────────────────
  { name: 'Northside Community Hub',    schedule: ['MON','WED','FRI'], contact: 'Sam Okafor',    phone: '(303) 555-0107', resources: ['Canned goods', 'Dry staples', 'Hygiene'], size: 'large',    notes: 'Loading dock rear. Buzzer required.' },
  { name: 'Jefferson Elementary',       schedule: ['WED','FRI'],       contact: 'Rosa Martinez',  phone: '(303) 555-0106', resources: ['Snack packs', 'School supplies', 'Produce'], size: 'medium',   notes: 'Gym side entrance. School hours only.' },
  { name: 'St. Augustine Church',       schedule: ['TUE','THU'],       contact: 'Ben Wright',     phone: '(303) 555-0105', resources: ['Bread', 'Dairy', 'Baked goods'], size: 'medium',   notes: 'Fellowship hall. Side door off parking lot.' },
  { name: 'Sunrise Senior Center',      schedule: ['MON','THU'],       contact: 'Jake Thompson',  phone: '(303) 555-0102', resources: ['Non-perishables', 'Hygiene', 'Household'], size: 'small',    notes: 'Elevator accessible. Check in at desk.' },
  { name: 'Northside Public Library',   schedule: ['WED'],             contact: 'Devon Park',     phone: '(303) 555-0104', resources: ['Books', 'School supplies'], size: 'small',    notes: 'Staff entrance around back. Quiet zone.' },
  { name: 'Family Health Clinic N',     schedule: ['MON','FRI'],       contact: 'Aisha Patel',    phone: '(303) 555-0103', resources: ['Hygiene kits', 'Baby supplies', 'Vitamins'], size: 'medium',   notes: 'Loading only before 10am. HIPAA zone.' },
  { name: 'Rainbow Daycare Center',     schedule: ['TUE','WED'],       contact: 'Maria Chen',     phone: '(303) 555-0101', resources: ['Baby food', 'Diapers', 'Wipes'], size: 'small',    notes: 'Sign in at reception. Bring ID.' },

  // ── Eastside (7) ────────────────────────────────────────────────
  { name: 'Eastside Community Hub',     schedule: ['MON','WED','FRI'], contact: 'Jake Thompson',  phone: '(303) 555-0102', resources: ['Canned goods', 'Fresh produce', 'Dry staples'], size: 'large',    notes: 'Forklift available Wed/Fri. Bay 2.' },
  { name: 'Eastside Warehouse',         schedule: ['WED','FRI'],       contact: 'Sam Okafor',    phone: '(303) 555-0107', resources: ['Bulk dry goods', 'Overstock'], size: 'oversize', notes: 'Truck bay only. 4-hour minimum booking.' },
  { name: 'Hope Community Church',      schedule: ['TUE','THU','SAT'], contact: 'Rosa Martinez',  phone: '(303) 555-0106', resources: ['Bread', 'Dairy', 'Hot meals'], size: 'medium',   notes: 'Kitchen access. Weekend staff only.' },
  { name: 'Riverside Park Stop',        schedule: ['SAT'],             contact: 'Devon Park',     phone: '(303) 555-0104', resources: ['Mixed staples', 'Produce'], size: 'medium',   notes: 'Set up at pavilion by 9am. No vehicle access after.' },
  { name: 'East Recreation Center',     schedule: ['TUE','FRI'],       contact: 'Ben Wright',     phone: '(303) 555-0105', resources: ['Sports gear', 'Clothing', 'Non-perishables'], size: 'medium',   notes: 'Lobby drop only. Freight elevator available.' },
  { name: 'Memorial Hospital Annex',    schedule: ['MON','THU'],       contact: 'Aisha Patel',    phone: '(303) 555-0103', resources: ['Medical supplies', 'Hygiene', 'Baby food'], size: 'medium',   notes: 'Loading dock B. Sterile packaging required.' },
  { name: 'Greenfield Market Hub',      schedule: ['WED','SAT'],       contact: 'Maria Chen',     phone: '(303) 555-0101', resources: ['Fresh produce', 'Dairy surplus', 'Bakery'], size: 'large',    notes: 'Market closes at 1pm Sat. Arrive early.' },

  // ── Southside (7) ───────────────────────────────────────────────
  { name: 'South Park Mobile Stop',     schedule: ['SAT'],             contact: 'Jake Thompson',  phone: '(303) 555-0102', resources: ['Mixed staples', 'Clothing', 'Blankets'], size: 'oversize', notes: 'Truck required. South lot off Maple Ave.' },
  { name: 'Sacred Heart Church',        schedule: ['TUE','THU','SUN'], contact: 'Devon Park',     phone: '(303) 555-0104', resources: ['Canned goods', 'Dry staples', 'Bread'], size: 'medium',   notes: 'Basement entrance. Sundays after service.' },
  { name: 'Lincoln Middle School',      schedule: ['MON','WED','FRI'], contact: 'Rosa Martinez',  phone: '(303) 555-0106', resources: ['Snack packs', 'Produce', 'Hygiene'], size: 'medium',   notes: 'Cafeteria loading only. Call ahead.' },
  { name: 'Hope Shelter',              schedule: ['MON','TUE','WED','THU','FRI','SAT'], contact: 'Sam Okafor', phone: '(303) 555-0107', resources: ['All food types', 'Clothing', 'Hygiene', 'Bedding'], size: 'large', notes: 'Accepts every day. 24-hour drop possible.' },
  { name: 'Southside Park Stop',       schedule: ['SAT'],             contact: 'Ben Wright',     phone: '(303) 555-0105', resources: ['Fresh produce', 'Bread', 'Snacks'], size: 'medium',   notes: 'Gazebo area. Noon–2pm window.' },
  { name: 'Community Garden Hub',      schedule: ['TUE','FRI'],       contact: 'Aisha Patel',    phone: '(303) 555-0103', resources: ['Fresh vegetables', 'Seeds', 'Compost kits'], size: 'small',    notes: 'Seasonal produce only. Check availability.' },
  { name: 'Engine Co. 7 Firehouse',   schedule: ['WED'],             contact: 'Maria Chen',     phone: '(303) 555-0101', resources: ['Non-perishables', 'Baby supplies'], size: 'small',    notes: 'Active station. Quiet drop preferred.' },

  // ── Westside (6) ────────────────────────────────────────────────
  { name: 'Westside Food Bank',        schedule: ['MON','WED','FRI'], contact: 'Sam Okafor',    phone: '(303) 555-0107', resources: ['Everything — regional receiving hub'], size: 'oversize', notes: 'Dock 1–4. Pallet jack on site. Signage posted.' },
  { name: 'Calvary Baptist Church',    schedule: ['SUN','WED'],       contact: 'Devon Park',     phone: '(303) 555-0104', resources: ['Dry goods', 'Canned goods', 'Bread'], size: 'medium',   notes: 'Wed: fellowship hall. Sun: parking lot.' },
  { name: 'Maplewood Senior Home',     schedule: ['MON','TUE','WED','THU','FRI'], contact: 'Ben Wright', phone: '(303) 555-0105', resources: ['Soft foods', 'Hygiene', 'Household'], size: 'medium', notes: 'Delivery to loading bay. Sign visitor log.' },
  { name: 'Riverside Apartments Hub',  schedule: ['TUE','THU'],       contact: 'Rosa Martinez',  phone: '(303) 555-0106', resources: ['Non-perishables', 'Clothing', 'Household'], size: 'large',    notes: 'Leasing office manages access. Intercom #201.' },
  { name: 'Washington Elementary',     schedule: ['MON','WED'],       contact: 'Jake Thompson',  phone: '(303) 555-0102', resources: ['Snack packs', 'School supplies', 'Produce'], size: 'medium',   notes: 'Gym entrance. Principal must sign delivery.' },
  { name: 'Oak Park Hub',             schedule: ['SAT'],             contact: 'Aisha Patel',    phone: '(303) 555-0103', resources: ['Mixed staples', 'Clothing', 'Produce'], size: 'medium',   notes: 'Picnic shelter #3. Arrive before 10am.' },

  // ── Downtown (6) ────────────────────────────────────────────────
  { name: 'City Mission Soup Kitchen', schedule: ['MON','TUE','WED','THU','FRI'], contact: 'Rosa Martinez', phone: '(303) 555-0106', resources: ['All food types', 'Paper goods', 'Condiments'], size: 'large', notes: 'Kitchen receiving 6–8am only. Call Sam for after-hours.' },
  { name: 'Downtown Community Center', schedule: ['MON','WED','FRI'], contact: 'Maria Chen',     phone: '(303) 555-0101', resources: ['Canned goods', 'Dry staples', 'Hygiene'], size: 'large',    notes: 'Freight entrance on 3rd. Badge required.' },
  { name: 'Central Library',          schedule: ['TUE','THU'],       contact: 'Devon Park',     phone: '(303) 555-0104', resources: ['Children\'s books', 'School supplies'], size: 'small',    notes: 'Staff door only. Reference desk will assist.' },
  { name: 'First Presbyterian Church', schedule: ['SUN','WED'],       contact: 'Ben Wright',     phone: '(303) 555-0105', resources: ['Canned goods', 'Dry staples', 'Baby supplies'], size: 'medium',   notes: 'Basement fellowship hall. Sun access after 1pm.' },
  { name: 'Metro Health Clinic',      schedule: ['MON','FRI'],       contact: 'Aisha Patel',    phone: '(303) 555-0103', resources: ['Hygiene kits', 'Baby food', 'Vitamins'], size: 'medium',   notes: 'Clinical receiving. Package labelling required.' },
  { name: 'St. Vincent de Paul Ctr',  schedule: ['TUE','THU','SAT'], contact: 'Jake Thompson',  phone: '(303) 555-0102', resources: ['Clothing', 'Household items', 'Furniture'], size: 'oversize', notes: 'Furniture bay separate. Truck with lift required.' },
];

// ── Item descriptions pool ────────────────────────────────────────

const ITEM_DESCRIPTIONS = [
  'Canned goods — soup ×24, vegetables ×36, beans ×12',
  'Fresh produce box — lettuce, tomatoes, apples (15 lbs)',
  'Dry staples — rice 50 lb ×3, lentils 25 lb ×2, oats 10 lb ×4',
  'Bread & dairy — 8 loaves, 12 qt milk, 6 doz eggs, 4 lb butter',
  'Hygiene kits ×20 — soap, shampoo, toothbrush, deodorant',
  'Baby supplies — diapers size 3 ×4, formula ×6, wipes ×4',
  'Clothing bundle — coats (8), gloves (12 pairs), hats (15)',
  'Bakery surplus — sourdough ×10, whole wheat ×8, rolls ×24',
  'Frozen protein — chicken ×40 lb, ground beef ×20 lb',
  'Snack packs ×60 — granola bars, trail mix, dried fruit',
  'School supplies ×30 — pencils, notebooks, backpacks',
  'Household items — dish soap ×24, paper towels ×12, trash bags ×6',
  'Condiments & oils — olive oil ×10, ketchup ×12, salt ×8',
  'Fruit — oranges ×60, bananas ×80, apples ×50',
  'Dairy surplus — yogurt ×48, cheese ×20 lb, cream cheese ×12',
  'Protein alternative — peanut butter ×24, hummus ×18, tofu ×12',
  'Holiday kit — canned cranberry, stuffing ×10, gravy ×8',
  'Medical supplies — vitamins ×60, bandages ×20, thermometers ×10',
  'Bedding bundle — blankets ×8, pillowcases ×20, towels ×15',
  'Paper goods — tissues ×24, napkins ×12, paper plates ×8 packs',
];

// ── Generator ────────────────────────────────────────────────────

function ts(offsetHours: number): string {
  const now = new Date();
  return new Date(now.getTime() - offsetHours * 3_600_000).toISOString();
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/**
 * Deterministic pick from an array using a seed index (no Math.random).
 * Rotates through the array based on a combination of day + item offsets.
 */
function pick<T>(arr: T[], seed: number): T {
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

function generateLocations(): Location[] {
  return LOC_DEFS.map((def, i) => ({
    id: `lg-loc-${i + 1}`,
    name: def.name,
    schedule: def.schedule,
    contact: def.contact,
    phone: def.phone,
    resources: def.resources,
    transportSize: def.size,
    notes: def.notes,
    createdAt: ts((30 - i) * 24),
  }));
}

function generateQueueEntries(locations: Location[]): Entry[] {
  // Pickup hubs: indices 1–32 (skip 0 = Central Distribution Center)
  const pickupHubs = locations.slice(1);
  const entries: Entry[] = [];
  let idx = 1;

  // 14 days of activity — 10 items per day = 140 queue entries
  for (let day = 13; day >= 0; day--) {
    const dayDate = dateStr(day);
    const itemsThisDay = 10;

    for (let i = 0; i < itemsThisDay; i++) {
      const hub = pick(pickupHubs, day * 7 + i * 11);
      const desc = pick(ITEM_DESCRIPTIONS, day * 3 + i * 7);
      const driver = pick(DRIVERS, day + i);
      const pantryOps = pick(PANTRY_OPS, day + i + 1);

      // Age determines status: older items are further along the pipeline
      // day 13 (oldest) → stocked; day 0 (today) → pending/claimed
      const ageHours = day * 24 + i * 1.5;

      let queueStatus: QueueStatus;
      let status: 'active' | 'fulfilled';
      let claimedBy: string | undefined;
      let claimedAt: string | undefined;
      let completedAt: string | undefined;

      if (ageHours > 10 * 24) {
        // > 10 days old: fully stocked — pantry inventory & ops team received it
        queueStatus = 'stocked';
        status = 'fulfilled';
        claimedBy = pantryOps;
        claimedAt = ts(ageHours - 8);
        completedAt = ts(ageHours - 4);
      } else if (ageHours > 7 * 24) {
        // 7–10 days: delivered, awaiting pantry ops to shelve
        queueStatus = 'delivered';
        status = 'fulfilled';
        claimedBy = pantryOps;
        claimedAt = ts(ageHours - 6);
        completedAt = ts(ageHours - 2);
      } else if (ageHours > 4 * 24) {
        // 4–7 days: driver is moving it
        queueStatus = 'in_transit';
        status = 'active';
        claimedBy = driver;
        claimedAt = ts(ageHours - 3);
      } else if (ageHours > 2 * 24) {
        // 2–4 days: driver has claimed, not yet picked up
        queueStatus = 'claimed';
        status = 'active';
        claimedBy = driver;
        claimedAt = ts(ageHours - 1);
      } else {
        // < 2 days: freshly added, waiting
        queueStatus = 'pending';
        status = 'active';
      }

      entries.push({
        id: `lg-q${idx++}`,
        type: 'pickup_queue',
        description: desc,
        location: hub.name,
        status,
        queueStatus,
        claimedBy,
        claimedAt,
        completedAt,
        calendarDate: dayDate,
        createdAt: ts(ageHours),
        syncedToCloud: false,
      });
    }
  }

  return entries;
}

function generateCommunityEntries(): Entry[] {
  const now = (h: number) => ts(h);
  return [
    { id: 'lg-e1', type: 'need', description: 'Single parent — 3 children, needs weekly grocery box. South district.', status: 'active', createdAt: now(6), syncedToCloud: false },
    { id: 'lg-e2', type: 'need', description: 'Elderly couple needs soft foods and low-sodium options. Delivery preferred.', status: 'active', createdAt: now(14), syncedToCloud: false },
    { id: 'lg-e3', type: 'need', description: 'Refugee family of 6 — halal food only, 3 children under 5. Diapers urgent.', status: 'active', createdAt: now(20), syncedToCloud: false },
    { id: 'lg-e4', type: 'need', description: 'Student housing — 8 people, need pasta, rice, canned goods through end of semester.', status: 'active', createdAt: now(32), syncedToCloud: false },
    { id: 'lg-e5', type: 'offering', description: 'Restaurant surplus — 40 lbs cooked rice, 20 lbs roasted veg. Ready Tue/Thu 2pm.', status: 'active', createdAt: now(4), syncedToCloud: false },
    { id: 'lg-e6', type: 'offering', description: 'Farm donation — winter squash 200 lbs, turnips 80 lbs, carrots 60 lbs. Pick up Fri.', status: 'active', createdAt: now(10), syncedToCloud: false },
    { id: 'lg-e7', type: 'offering', description: 'Grocery store markdown — 50 loaves bread, 30 doz eggs, 20 gal milk. Today only.', status: 'active', createdAt: now(1.5), syncedToCloud: false },
    { id: 'lg-e8', type: 'offering', description: 'Church kitchen — lasagna ×30 pans, soup ×15 gal. Available Sunday 1pm pickup.', status: 'active', createdAt: now(24), syncedToCloud: false },
    { id: 'lg-e9', type: 'looking_for', description: 'Need 2 drivers with trucks for Saturday South Park run. 3-hour shift. Urgent.', status: 'active', createdAt: now(48), syncedToCloud: false },
    { id: 'lg-e10', type: 'looking_for', description: 'Seeking refrigerated transport once weekly for dairy surplus from Greenfield Market.', status: 'active', createdAt: now(72), syncedToCloud: false },
    { id: 'lg-e11', type: 'upcoming_need', description: 'Thanksgiving week: 200 family meal kits needed. Seeking bulk donations now.', status: 'active', createdAt: now(96), syncedToCloud: false },
    { id: 'lg-e12', type: 'upcoming_need', description: 'Winter drive: 150 coat + blanket packages for shelter distribution, Dec 1.', status: 'active', createdAt: now(120), syncedToCloud: false },
  ];
}

// ── Assemble simulation ───────────────────────────────────────────

function build(): Simulation {
  const locations = generateLocations();
  const queueEntries = generateQueueEntries(locations);
  const communityEntries = generateCommunityEntries();

  return {
    id: 'logistics-14day',
    name: '7 Drivers · 33 Hubs · 14 Days',
    subtitle: 'A regional network at full operational scale',
    description:
      'Simulates two weeks of food distribution across 33 pickup hubs, ' +
      'one central stocking facility, and a rotating crew of 7. ' +
      'Every status lane is active — ideal for exploring the logistics diagram, ' +
      'pipeline counts, and multi-hub routing.',
    tags: ['advanced', '33 hubs', '7 people', '14 days', '~140 queue items'],

    contacts: CONTACTS,
    locations,
    entries: [...queueEntries, ...communityEntries],

    localStorageContent: {
      'pantry-welcome': JSON.stringify({
        name: 'City Food Hub Network',
        tagline: '33 hubs · 7 crew · serving 1,200+ households',
        about:
          'A coordinated city-wide food distribution network linking surplus from restaurants, ' +
          'farms, grocery stores, and community donors to families in need across all five districts. ' +
          'All coordination runs through one central distribution center with daily routing to hubs.',
      }),
      'pantry-ops-page': JSON.stringify({
        pageTitle: 'City Food Hub Network',
        intro: 'Operating 33 pickup locations across Northside, Eastside, Southside, Westside, and Downtown. Deliveries run Monday–Saturday.',
        sections: [
          { id: 'hubs', title: '33 Pickup Hubs', body: 'Hubs operate on rotating schedules. Check the Schedule and Logistics pages for live status and active routes.' },
          { id: 'central', title: 'Central Distribution Center', body: 'All deliveries consolidate at the Central Distribution Center. Stockers process and redistribute Mon–Fri. Receiving 6am–4pm.' },
          { id: 'volunteer', title: 'Join the Crew', body: 'We need drivers (M/W/F and weekends) and stockers (Tue/Thu). Contact your district coordinator or use an invite code.' },
        ],
      }),
      'pantry-weekly-schedule': JSON.stringify({
        1: { open: true, openTime: '06:00', closeTime: '18:00', notes: 'Northside + Eastside + Westside + Downtown hubs open' },
        2: { open: true, openTime: '07:00', closeTime: '17:00', notes: 'Eastside + Southside + Downtown hubs open' },
        3: { open: true, openTime: '06:00', closeTime: '18:00', notes: 'All districts open — peak day' },
        4: { open: true, openTime: '07:00', closeTime: '17:00', notes: 'Northside + Southside + Westside hubs open' },
        5: { open: true, openTime: '06:00', closeTime: '16:00', notes: 'Eastside + Downtown + School hubs open' },
        6: { open: true, openTime: '09:00', closeTime: '13:00', notes: 'Mobile stops + market hubs + shelter' },
        0: { open: false, openTime: '', closeTime: '', notes: '' },
      }),
    },
  };
}

export const logistics14day = build();
