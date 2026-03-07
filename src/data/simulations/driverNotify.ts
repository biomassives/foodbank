import type { Simulation } from './index';

const now = new Date();
const ago = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();
const future = (days: number) => new Date(now.getTime() + days * 86_400_000).toISOString().slice(0, 10);

// ── Scenario ──────────────────────────────────────────────────────────────────
// Ward Food Pantry — this morning's driver notification flow.
// The data represents the system state after the following sequence:
//
//  07:45 → 2 items posted pending  → availability email sent to all drivers
//  08:12 → Carlos claims item A    → claim email to Carlos + notify others
//  08:12 → Carlos claims item B    → within 60s window → batch digest queued
//  08:13 → Priya  claims item C    → within 60s window → included in batch
//  08:13 → 60s window closes       → batch digest fired (3 claims, 2 drivers)
//  09:30 → Keiko marks in-transit  → pickup confirmed notification
//  10:15 → Marcus marks delivered  → dropoff notification to stock + admin
//  10:45 → earlier item stocked    → shelf update logged
//  11:00 → offers overview email   → daily digest to admin

export const driverNotify: Simulation = {
  id: 'driver-notify',
  name: 'Ward Food Pantry — Driver Notification Flow',
  subtitle: 'End-to-end Mailgun notification test: available → claim → batch → pickup → dropoff → overview',
  description:
    'A morning\'s operations at Ward Food Pantry with data at every stage ' +
    'of the driver notification pipeline. Staged messages show the exact emails ' +
    'triggered at each step: availability alerts, claim confirmations (with ' +
    '60-second batching), pickup confirmations, delivery receipts, and the ' +
    'daily offers overview. Use this to verify your Mailgun configuration end-to-end.',
  tags: ['notifications', 'mailgun', 'drivers', '4 hubs', 'batching', '60s window'],

  contacts: [
    { id: 'dn-admin',  name: { first: 'Sarah',  last: 'Monroe' },    email: 's.monroe@wardfoodpantry.org', phone: '(510) 555-0301' },
    { id: 'dn-d1',    name: { first: 'Carlos',  last: 'Rivera' },    email: 'c.rivera@wardvolunteer.org',  phone: '(510) 555-0302' },
    { id: 'dn-d2',    name: { first: 'Priya',   last: 'Kapoor' },    email: 'p.kapoor@wardvolunteer.org',  phone: '(510) 555-0303' },
    { id: 'dn-d3',    name: { first: 'Tom',     last: 'Odhiambo' },  email: 't.odhiambo@wardvolunteer.org',phone: '(510) 555-0304' },
    { id: 'dn-d4',    name: { first: 'Keiko',   last: 'Nakamura' },  email: 'k.nakamura@wardvolunteer.org',phone: '(510) 555-0305' },
    { id: 'dn-d5',    name: { first: 'Marcus',  last: 'Webb' },      email: 'm.webb@wardvolunteer.org',    phone: '(510) 555-0306' },
    { id: 'dn-stock', name: { first: 'Fatima',  last: 'Al-Hassan' }, email: 'f.alhassan@wardfoodpantry.org',phone: '(510) 555-0307' },
  ],

  locations: [
    {
      id: 'dn-loc-1', name: 'Ward Central Hub',
      schedule: ['MON', 'WED', 'FRI'],
      contact: 'Sarah Monroe', phone: '(510) 555-0301',
      resources: ['Dry goods', 'Canned food', 'Hygiene kits', 'Bulk staples'],
      transportSize: 'large',
      notes: 'Central hub. Loading dock Bay 2. Forklift Mon/Wed/Fri. Ring intercom on arrival.',
      createdAt: ago(720),
    },
    {
      id: 'dn-loc-2', name: 'North Ward Donation Point',
      schedule: ['TUE', 'THU', 'SAT'],
      contact: 'Tom Odhiambo', phone: '(510) 555-0304',
      resources: ['Baked goods', 'Produce', 'Canned goods', 'Clothing'],
      transportSize: 'medium',
      notes: 'Community drop-off. Bins on north side of building. Tom holds keys.',
      createdAt: ago(480),
    },
    {
      id: 'dn-loc-3', name: 'East Ward Collection',
      schedule: ['MON', 'WED', 'FRI'],
      contact: 'Keiko Nakamura', phone: '(510) 555-0305',
      resources: ['Fresh produce', 'Dairy', 'Eggs', 'Bread'],
      transportSize: 'medium',
      notes: 'Farm cooperative. Refrigerated van preferred. Pickup before 10am to ensure freshness.',
      createdAt: ago(360),
    },
    {
      id: 'dn-loc-4', name: 'South Ward Depot',
      schedule: ['TUE', 'THU'],
      contact: 'Marcus Webb', phone: '(510) 555-0306',
      resources: ['Non-perishables', 'Household items', 'School supplies'],
      transportSize: 'small',
      notes: 'Residential ward depot. Street parking only. Quiet hours before 9am.',
      createdAt: ago(240),
    },
  ],

  entries: [
    // ── PENDING — posted 07:45, availability email already sent ──────
    {
      id: 'dn-q-pend-1', type: 'pickup_queue',
      description: 'Large canned goods donation — 120 cans assorted (soup, beans, tomatoes, corn). Palletised at Ward Central Hub. Heavy lift.',
      location: 'Ward Central Hub',
      status: 'active', queueStatus: 'pending',
      createdAt: ago(3.25),  // 07:45 this morning
      syncedToCloud: false,
    },
    {
      id: 'dn-q-pend-2', type: 'pickup_queue',
      description: 'Farm surplus — mixed produce: cabbage × 12, potatoes 40 lbs, carrots 20 lbs. Refrigerated van preferred.',
      location: 'East Ward Collection',
      status: 'active', queueStatus: 'pending',
      createdAt: ago(3.25),
      syncedToCloud: false,
    },

    // ── CLAIMED — 08:12–08:13 (within 60s batch window) ─────────────
    {
      id: 'dn-q-claimed-1', type: 'pickup_queue',
      description: 'North Ward bread & dairy run — 10 loaves, 8 qt milk, 4 doz eggs. Must arrive by 9am.',
      location: 'North Ward Donation Point',
      status: 'active', queueStatus: 'claimed',
      claimedBy: 'Carlos Rivera',
      claimedAt: ago(2.8),   // 08:12 — first claim (starts 60s window)
      createdAt: ago(4),
      syncedToCloud: false,
    },
    {
      id: 'dn-q-claimed-2', type: 'pickup_queue',
      description: 'South Ward depot — non-perishables box + 3 bags household supplies. Fits in sedan.',
      location: 'South Ward Depot',
      status: 'active', queueStatus: 'claimed',
      claimedBy: 'Carlos Rivera',
      claimedAt: ago(2.8),   // 08:12 — second claim by same driver (60s window)
      createdAt: ago(5),
      syncedToCloud: false,
    },
    {
      id: 'dn-q-claimed-3', type: 'pickup_queue',
      description: 'Hygiene kits × 15 (soap, toothbrush, shampoo, deodorant) — packed and ready at Ward Central Hub.',
      location: 'Ward Central Hub',
      status: 'active', queueStatus: 'claimed',
      claimedBy: 'Priya Kapoor',
      claimedAt: ago(2.78),  // 08:13 — third claim (within 60s window of first)
      createdAt: ago(5.5),
      syncedToCloud: false,
    },

    // ── IN TRANSIT — pickups confirmed ───────────────────────────────
    {
      id: 'dn-q-transit-1', type: 'pickup_queue',
      description: 'Dry staples batch — flour 25 lb × 4, cornmeal 10 lb × 6, sugar 5 lb × 8.',
      location: 'Ward Central Hub',
      status: 'active', queueStatus: 'in_transit',
      claimedBy: 'Keiko Nakamura',
      claimedAt: ago(3.5),
      createdAt: ago(6),
      syncedToCloud: false,
    },
    {
      id: 'dn-q-transit-2', type: 'pickup_queue',
      description: 'East Ward fresh produce — kale, chard, beets (seasonal box, approx 30 lbs).',
      location: 'East Ward Collection',
      status: 'active', queueStatus: 'in_transit',
      claimedBy: 'Marcus Webb',
      claimedAt: ago(4),
      createdAt: ago(7),
      syncedToCloud: false,
    },

    // ── DELIVERED — dropoffs confirmed ───────────────────────────────
    {
      id: 'dn-q-del-1', type: 'pickup_queue',
      description: 'Infant supplies — formula × 8, diapers size 2 × 4, wipes × 6. Priority delivery.',
      location: 'Ward Central Hub',
      status: 'fulfilled', queueStatus: 'delivered',
      claimedBy: 'Carlos Rivera',
      claimedAt: ago(8), completedAt: ago(6.5),
      createdAt: ago(10),
      syncedToCloud: false,
    },
    {
      id: 'dn-q-del-2', type: 'pickup_queue',
      description: 'Clothing donation — winter coats × 12 (adult assorted), blankets × 8.',
      location: 'North Ward Donation Point',
      status: 'fulfilled', queueStatus: 'delivered',
      claimedBy: 'Priya Kapoor',
      claimedAt: ago(9), completedAt: ago(7),
      createdAt: ago(11),
      syncedToCloud: false,
    },

    // ── STOCKED — fully processed ────────────────────────────────────
    {
      id: 'dn-q-stocked-1', type: 'pickup_queue',
      description: 'Canned vegetables batch — corn × 24, green beans × 24, tomatoes × 24. Sorted and shelved.',
      location: 'Ward Central Hub',
      status: 'fulfilled', queueStatus: 'stocked',
      claimedBy: 'Tom Odhiambo',
      claimedAt: ago(26), completedAt: ago(20),
      createdAt: ago(30),
      syncedToCloud: false,
    },

    // ── OFFERINGS overview (community) ────────────────────────────────
    {
      id: 'dn-offer-1', type: 'offering',
      description: 'South Ward neighbour offering garden produce weekly through October — tomatoes, zucchini, herbs.',
      status: 'active', createdAt: ago(48), syncedToCloud: false,
    },
    {
      id: 'dn-offer-2', type: 'offering',
      description: 'Local restaurant donating prepared meals (10–15 portions) every Thursday evening. Needs refrigerated pickup.',
      status: 'active', createdAt: ago(24), syncedToCloud: false,
    },

    // ── AVAILABILITY check (upcoming_need flags drivers needed) ───────
    {
      id: 'dn-avail-1', type: 'upcoming_need',
      description: 'Saturday bulk pickup needs 2 drivers with large vehicles — Ward Central Hub and East Ward Collection. 8am start.',
      status: 'active', calendarDate: future(2),
      createdAt: ago(12), syncedToCloud: false,
    },
  ],

  localStorageContent: {
    'pantry-welcome': JSON.stringify({
      name: 'Ward Food Pantry',
      tagline: 'Fast, reliable food distribution across the ward',
      about:
        'A driver-coordinated food distribution network serving four ward communities. ' +
        'We operate through a real-time pickup queue system with SMS and email ' +
        'notifications keeping every driver informed. Same-day pickups, fast turnarounds.',
    }),
    'pantry-ops-page': JSON.stringify({
      pageTitle: 'Ward Food Pantry',
      intro: 'Distribution seven days a week across four ward hubs. Drivers dispatched by queue — claim items in the app to get your route.',
      sections: [
        {
          id: 'drivers',
          title: 'For Drivers',
          body: 'Sign in and check the pickup queue each morning. Claim items to reserve them. Mark in-transit when you pick up and delivered when you drop off. You\'ll receive email confirmation at each step.',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          body: 'New pickups: email to all available drivers.\nClaim confirmed: email to you + notification to others.\nBatch window: if 3+ items are claimed in 60 seconds, a single digest goes to admin.\nDelivery confirmed: stock team and admin notified.',
        },
        {
          id: 'availability',
          title: 'Updating Availability',
          body: 'You\'ll receive a weekly availability check email with a personal link. Click it to update your days/slots without logging in. Your availability affects which notification digests you receive.',
        },
      ],
    }),
    'pantry-weekly-schedule': JSON.stringify({
      1: { open: true, openTime: '07:30', closeTime: '18:00', notes: 'Ward Central Hub + East Ward Collection' },
      2: { open: true, openTime: '08:00', closeTime: '16:00', notes: 'North Ward Donation Point + South Ward Depot' },
      3: { open: true, openTime: '07:30', closeTime: '18:00', notes: 'Ward Central Hub + East Ward Collection' },
      4: { open: true, openTime: '08:00', closeTime: '16:00', notes: 'North Ward Donation Point + South Ward Depot' },
      5: { open: true, openTime: '07:30', closeTime: '17:00', notes: 'Ward Central Hub + East Ward Collection' },
      6: { open: true, openTime: '08:00', closeTime: '13:00', notes: 'North Ward Donation Point (Saturday drops)' },
      0: { open: false, openTime: '', closeTime: '', notes: '' },
    }),

    // ── Staged messages: the notification chain for this morning ──────
    'pantry-staged-messages': JSON.stringify([
      {
        id: 'dn-msg-1',
        subject: '🚛 New pickups available — Ward Food Pantry',
        body: 'Two new items are ready for pickup this morning:\n\n' +
              '• Canned goods batch (120 cans) — Ward Central Hub\n' +
              '• Farm produce surplus — East Ward Collection\n\n' +
              'Open the app to claim your route.\n\n' +
              'Reply STOP to unsubscribe from pickup alerts.',
        roles: ['drivers'],
        createdAt: ago(3.25),
        scheduledFor: null,
      },
      {
        id: 'dn-msg-2',
        subject: '📋 Availability check — are you free this weekend?',
        body: 'Hi {driver_name},\n\n' +
              'We have Saturday bulk pickups that need 2 drivers with large vehicles. ' +
              'Please update your availability for this weekend:\n\n' +
              '→ Update my availability: {availability_link}\n\n' +
              '(This link is personal to you and expires in 48 hours.)',
        roles: ['drivers'],
        createdAt: ago(12),
        scheduledFor: null,
      },
      {
        id: 'dn-msg-3',
        subject: '✅ Item claimed: Carlos Rivera — North Ward bread & dairy',
        body: 'Carlos Rivera has claimed the North Ward bread & dairy run (08:12).\n\n' +
              'Item: 10 loaves, 8 qt milk, 4 doz eggs — North Ward Donation Point\n' +
              'ETA to hub: ~9:30am\n\n' +
              'This item is no longer available for claim.',
        roles: ['drivers', 'admin'],
        createdAt: ago(2.8),
        scheduledFor: null,
      },
      {
        id: 'dn-msg-4',
        subject: '📦 BATCH DIGEST — 3 items claimed in 60-second window (08:12–08:13)',
        body: 'Three pickups were claimed within the 60-second batching window:\n\n' +
              '• Carlos Rivera — North Ward bread & dairy (08:12)\n' +
              '• Carlos Rivera — South Ward depot supplies (08:12)\n' +
              '• Priya Kapoor  — Hygiene kits ×15, Ward Central Hub (08:13)\n\n' +
              'Total items in motion: 5 claimed, 2 in transit.\n' +
              'No action required — this is a summary digest.',
        roles: ['admin'],
        createdAt: ago(2.78),
        scheduledFor: null,
      },
      {
        id: 'dn-msg-5',
        subject: '🚚 Pickup confirmed: Keiko Nakamura — dry staples en route',
        body: 'Keiko Nakamura marked the dry staples run as in-transit (09:30).\n\n' +
              'Pickup: Ward Central Hub\n' +
              'Cargo: flour, cornmeal, sugar — approx 180 lbs\n' +
              'Expected delivery: Ward Central Hub by 10:30am\n\n' +
              'Stock team: please have Bay 1 clear.',
        roles: ['admin', 'stock_pantry'],
        createdAt: ago(1.5),
        scheduledFor: null,
      },
      {
        id: 'dn-msg-6',
        subject: '📬 Delivery confirmed: Marcus Webb — East Ward produce dropped off',
        body: 'Marcus Webb completed the East Ward produce delivery (10:15).\n\n' +
              'Delivered to: Ward Central Hub\n' +
              'Items: kale, chard, beets — ~30 lbs seasonal box\n\n' +
              'Please sort and refrigerate within 2 hours.',
        roles: ['admin', 'stock_pantry'],
        createdAt: ago(0.8),
        scheduledFor: null,
      },
      {
        id: 'dn-msg-7',
        subject: '📊 Today\'s offers overview — Ward Food Pantry',
        body: 'Morning summary (as of 11:00am):\n\n' +
              '✅ Completed today:\n' +
              '  • 2 deliveries confirmed (infant supplies, clothing)\n' +
              '  • 1 batch stocked (canned vegetables)\n\n' +
              '🔄 In progress:\n' +
              '  • 3 items claimed (North Ward, South Ward, hygiene kits)\n' +
              '  • 2 items in transit (dry staples, produce)\n' +
              '  • 2 items pending claim (canned goods batch, farm surplus)\n\n' +
              '📋 Community offerings received:\n' +
              '  • Garden produce (weekly through October)\n' +
              '  • Restaurant meals (Thursday evenings)\n\n' +
              'Drivers active today: Carlos Rivera, Priya Kapoor, Keiko Nakamura, Marcus Webb',
        roles: ['admin'],
        createdAt: ago(0.1),
        scheduledFor: null,
      },
    ]),
  },
};
