import type { Simulation } from './index';

const now = new Date();
const ago = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();
const future = (days: number) => new Date(now.getTime() + days * 86_400_000).toISOString().slice(0, 10);

export const inventoryManager: Simulation = {
  id: 'inventory-manager',
  name: 'Ward Food Pantry — Inventory Manager',
  subtitle: 'Admin view: offered inventory lifecycle from donation to shelf',
  description:
    'Six ward locations, seven people, and a morning\'s worth of incoming donations. ' +
    'Offerings submitted by the community move through acknowledgement, acceptance, ' +
    'pickup scheduling, and stocking. See how the admin manages the full inventory ' +
    'pipeline from the offered items board to stocked shelves.',
  tags: ['admin', 'inventory', '6 locations', 'offerings', 'matching'],

  contacts: [
    // Admin/manager
    { id: 'inv-c1', name: { first: 'Patricia', last: 'Kim' },     email: 'pat@wardfoodpantry.org',      phone: '(415) 555-0201' },
    // Community donors
    { id: 'inv-c2', name: { first: 'David',    last: 'Rosario' }, email: 'd.rosario@valleyfarm.net',    phone: '(415) 555-0202' },
    { id: 'inv-c3', name: { first: 'Helen',    last: 'Storch' },  email: 'helen@storchesbakery.com',    phone: '(415) 555-0203' },
    // Stock volunteers
    { id: 'inv-c4', name: { first: 'Wei',      last: 'Zhang' },   email: 'wei.z@wardvolunteer.org',     phone: '(415) 555-0204' },
    { id: 'inv-c5', name: { first: 'Amanda',   last: 'Osei' },    email: 'amanda.o@wardvolunteer.org',  phone: '(415) 555-0205' },
    // Driver
    { id: 'inv-c6', name: { first: 'Robert',   last: 'Finch' },   email: 'r.finch@wardvolunteer.org',   phone: '(415) 555-0206' },
    // Community member (submits needs)
    { id: 'inv-c7', name: { first: 'Layla',    last: 'Hassan' },  email: 'layla.h@wardcommunity.net',   phone: '(415) 555-0207' },
  ],

  locations: [
    {
      id: 'inv-loc-1', name: 'Ward Main Warehouse',
      schedule: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      contact: 'Patricia Kim', phone: '(415) 555-0201',
      resources: ['Dry goods', 'Canned food', 'Hygiene items', 'Cold storage', 'Freezer'],
      transportSize: 'large',
      notes: 'Central receiving and sorting facility. Forklift on site. Loading dock open 7am–5pm weekdays.',
      createdAt: ago(720),
    },
    {
      id: 'inv-loc-2', name: 'Ward Drop-off Center',
      schedule: ['MON', 'WED', 'FRI'],
      contact: 'Amanda Osei', phone: '(415) 555-0205',
      resources: ['Non-perishables', 'Household items', 'Clothing'],
      transportSize: 'medium',
      notes: 'Public-facing donation drop point. Staffed 10am–2pm. Sort and bag before sending to warehouse.',
      createdAt: ago(600),
    },
    {
      id: 'inv-loc-3', name: 'Ward Farmers Market',
      schedule: ['SAT'],
      contact: 'David Rosario', phone: '(415) 555-0202',
      resources: ['Fresh produce', 'Eggs', 'Honey', 'Seasonal items'],
      transportSize: 'medium',
      notes: 'Saturday market surplus pickup. Arrive by 12:30pm — vendors donate unsold produce at close.',
      createdAt: ago(480),
    },
    {
      id: 'inv-loc-4', name: "St. Anne's Hall",
      schedule: ['TUE', 'THU'],
      contact: 'Wei Zhang', phone: '(415) 555-0204',
      resources: ['Baked goods', 'Preserved jams', 'Dry staples'],
      transportSize: 'small',
      notes: 'Helen Storch delivers Tuesday mornings. Hot items must be handled day-of.',
      createdAt: ago(360),
    },
    {
      id: 'inv-loc-5', name: 'Ward Food Co-op',
      schedule: ['WED', 'FRI'],
      contact: 'Robert Finch', phone: '(415) 555-0206',
      resources: ['Bulk grains', 'Legumes', 'Oils', 'Specialty items'],
      transportSize: 'large',
      notes: 'Co-op donates near-expiry bulk items weekly. Confirm quantities by Tuesday.',
      createdAt: ago(240),
    },
    {
      id: 'inv-loc-6', name: 'Ward Senior Center',
      schedule: ['MON', 'THU'],
      contact: 'Layla Hassan', phone: '(415) 555-0207',
      resources: ['Soft foods', 'Low-sodium options', 'Meal supplements'],
      transportSize: 'small',
      notes: 'Seniors-focused distribution. Prefer pre-portioned items. Lift access only.',
      createdAt: ago(120),
    },
  ],

  entries: [
    // ── OFFERED items (community submissions at various stages) ────────
    {
      id: 'inv-offer-1', type: 'offering',
      description: 'Valley Farm surplus — butternut squash (60 lbs), kale (30 bunches), sweet corn (4 dozen ears). Ready for pickup Sat morning.',
      status: 'active', createdAt: ago(18), syncedToCloud: false,
    },
    {
      id: 'inv-offer-2', type: 'offering',
      description: "Storch's Bakery donation — sourdough (8), whole wheat (6), rye (4), cinnamon rolls (2 dozen). Every Tuesday 9am.",
      status: 'active', createdAt: ago(6), syncedToCloud: false,
    },
    {
      id: 'inv-offer-3', type: 'offering',
      description: 'Ward Food Co-op: brown rice 50 lb × 4, red lentils 25 lb × 6, quinoa 10 lb × 3. Near-expiry — best used within 3 months.',
      status: 'active', createdAt: ago(3), syncedToCloud: false,
    },
    {
      id: 'inv-offer-4', type: 'offering',
      description: 'Household clearout — canned goods (approx 80 cans), pasta × 12 boxes, olive oil × 6. Boxed and ready.',
      status: 'active', createdAt: ago(28), syncedToCloud: false,
    },
    {
      id: 'inv-offer-5', type: 'offering',
      description: 'Corporate donation: hygiene kits × 40 (soap, shampoo, deodorant, toothbrush, paste). Palletised at our office. Contact Patricia to schedule pickup.',
      status: 'active', createdAt: ago(12), syncedToCloud: false,
    },
    {
      id: 'inv-offer-6', type: 'offering',
      description: 'Ward Farmers Market surplus — assorted stone fruit (apricots, plums, peaches), approx 50 lbs total. Perishable — collect same day.',
      status: 'active', createdAt: ago(1), syncedToCloud: false,
    },

    // ── NEEDS (from community members) ────────────────────────────────
    {
      id: 'inv-need-1', type: 'need',
      description: 'Family of 5 needs low-sodium canned goods and soft foods for elderly parent. Ongoing monthly.',
      status: 'active', createdAt: ago(36), syncedToCloud: false,
    },
    {
      id: 'inv-need-2', type: 'need',
      description: 'Three households requesting bulk grains (rice, lentils) — enough for 2-week supply each.',
      status: 'active', createdAt: ago(20), syncedToCloud: false,
    },
    {
      id: 'inv-need-3', type: 'need',
      description: 'Infant formula (newborn) and size 1 diapers — urgent, for family arriving Thursday.',
      status: 'active', createdAt: ago(4), syncedToCloud: false,
    },
    {
      id: 'inv-need-4', type: 'need',
      description: 'Hygiene kits for 8 individuals at transitional housing in the ward. Any format accepted.',
      status: 'active', createdAt: ago(48), syncedToCloud: false,
    },

    // ── PICKUP QUEUE — accepted offerings in motion ───────────────────
    {
      id: 'inv-queue-1', type: 'pickup_queue',
      description: 'Hygiene kits × 40 — accepted corporate donation. Palletised, ready for pickup.',
      location: 'Ward Main Warehouse',
      status: 'active', queueStatus: 'pending',
      createdAt: ago(2), syncedToCloud: false,
    },
    {
      id: 'inv-queue-2', type: 'pickup_queue',
      description: 'Bulk grains — Co-op donation: rice 50 lb × 4, lentils 25 lb × 6, quinoa 10 lb × 3.',
      location: 'Ward Food Co-op',
      status: 'active', queueStatus: 'claimed',
      claimedBy: 'Robert Finch', claimedAt: ago(0.5),
      createdAt: ago(4), syncedToCloud: false,
    },
    {
      id: 'inv-queue-3', type: 'pickup_queue',
      description: "Bakery run — Storch's Bakery Tuesday delivery, 18 loaves + 2 doz cinnamon rolls.",
      location: "St. Anne's Hall",
      status: 'active', queueStatus: 'in_transit',
      claimedBy: 'Wei Zhang', claimedAt: ago(2),
      createdAt: ago(6), syncedToCloud: false,
    },
    {
      id: 'inv-queue-4', type: 'pickup_queue',
      description: 'Saturday farmers market produce surplus — approx 80 lbs mixed seasonal veg.',
      location: 'Ward Farmers Market',
      status: 'fulfilled', queueStatus: 'stocked',
      claimedBy: 'Amanda Osei', claimedAt: ago(26), completedAt: ago(20),
      createdAt: ago(30), syncedToCloud: false,
    },

    // ── UPCOMING NEEDS — planning ahead ──────────────────────────────
    {
      id: 'inv-upcoming-1', type: 'upcoming_need',
      description: 'Thanksgiving box prep — need 60 turkey donations + stuffing kits by Nov 18. Coordinating with 3 ward churches.',
      status: 'active', calendarDate: future(14),
      createdAt: ago(72), syncedToCloud: false,
    },
    {
      id: 'inv-upcoming-2', type: 'upcoming_need',
      description: 'Winter coat drive launch — need 40+ coats (adult M–XL, children 6–12) for December ward distribution.',
      status: 'active', calendarDate: future(21),
      createdAt: ago(48), syncedToCloud: false,
    },

    // ── LOOKING FOR ────────────────────────────────────────────────────
    {
      id: 'inv-looking-1', type: 'looking_for',
      description: 'Seeking a refrigerated van for Saturday Ward Farmers Market runs — 4 hours, weekly. Know anyone?',
      status: 'active', createdAt: ago(96), syncedToCloud: false,
    },
  ],

  localStorageContent: {
    'pantry-welcome': JSON.stringify({
      name: 'Ward Food Pantry',
      tagline: 'Good food for every neighbor in the ward',
      about:
        'A community-managed pantry operating across six ward locations. ' +
        'We accept donations from local farms, bakeries, co-ops, and households — then route them ' +
        'to families who need them most. Stock volunteers sort and log every item. ' +
        'Drivers run scheduled pickup routes six days a week.',
    }),
    'pantry-ops-page': JSON.stringify({
      pageTitle: 'Ward Food Pantry',
      intro: 'Accepting donations Monday–Saturday across six ward sites. Sorting and distribution happens daily from our Ward Main Warehouse.',
      sections: [
        {
          id: 'donate',
          title: 'How to Donate',
          body: 'Drop non-perishables at the Ward Drop-off Center (Mon/Wed/Fri, 10am–2pm).\n' +
                'Fresh produce: contact us to arrange a pickup or bring to our Saturday farmers market slot.\n' +
                'Bulk or palletised items: email pat@wardfoodpantry.org to schedule a dock appointment.',
        },
        {
          id: 'hours',
          title: 'Distribution Hours',
          body: 'Ward Main Warehouse — Mon–Fri 9am–4pm\n' +
                'Ward Drop-off Center — Mon/Wed/Fri 10am–2pm\n' +
                "St. Anne's Hall — Tue/Thu 10am–1pm\n" +
                'Ward Senior Center — Mon/Thu 11am–2pm',
        },
        {
          id: 'needed',
          title: 'Most Needed Right Now',
          body: 'Low-sodium canned goods · Infant formula · Bulk grains · Hygiene kits · Soft foods for seniors',
        },
      ],
    }),
    'pantry-weekly-schedule': JSON.stringify({
      1: { open: true, openTime: '09:00', closeTime: '16:00', notes: 'Warehouse + Drop-off + Senior Center' },
      2: { open: true, openTime: '10:00', closeTime: '14:00', notes: "St. Anne's Hall + Warehouse" },
      3: { open: true, openTime: '09:00', closeTime: '16:00', notes: 'Warehouse + Drop-off + Ward Food Co-op' },
      4: { open: true, openTime: '10:00', closeTime: '15:00', notes: "St. Anne's Hall + Warehouse + Senior Center" },
      5: { open: true, openTime: '09:00', closeTime: '15:00', notes: 'Warehouse + Drop-off + Ward Food Co-op' },
      6: { open: true, openTime: '10:00', closeTime: '13:00', notes: 'Ward Farmers Market (surplus pickup)' },
      0: { open: false, openTime: '', closeTime: '', notes: '' },
    }),
    'pantry-staged-messages': JSON.stringify([
      {
        id: 'inv-msg-1',
        subject: '📦 New offering received: Valley Farm produce surplus',
        body: 'David Rosario (Valley Farm) has submitted a produce donation — butternut squash (60 lbs), kale (30 bunches), sweet corn (4 dozen ears). Available Saturday morning at Ward Farmers Market. Please confirm a pickup driver by Friday 3pm.',
        roles: ['drivers', 'logistics_outreach'],
        createdAt: ago(18),
      },
      {
        id: 'inv-msg-2',
        subject: '✅ Inventory update: Bulk grains accepted from Ward Food Co-op',
        body: 'The Ward Food Co-op bulk grain donation has been accepted and queued for pickup. Robert Finch has claimed the run. Expected arrival at Ward Main Warehouse by 2pm today.',
        roles: ['stock_pantry', 'admin'],
        createdAt: ago(0.5),
      },
      {
        id: 'inv-msg-3',
        subject: '📊 Weekly inventory overview — Ward Food Pantry',
        body: 'This week: 6 offerings received, 4 pickup queue items (1 pending, 1 claimed, 1 in transit, 1 stocked). Outstanding needs: infant formula, low-sodium canned goods, hygiene kits. Next high-volume day: Saturday farmers market.',
        roles: ['admin'],
        createdAt: ago(0.1),
        scheduledFor: null,
      },
    ]),
  },
};
