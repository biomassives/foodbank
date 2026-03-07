import type { Simulation } from './index';

const now = new Date();
const ago = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();

export const basicDemo: Simulation = {
  id: 'basic-demo',
  name: 'Ward Food Pantry — Getting Started',
  subtitle: 'A ward pantry getting up to speed',
  description:
    'Five ward hubs, seven volunteers, eight active queue items spanning every status lane. ' +
    'A good first look at the directory, queue, logistics diagram, and calendar. ' +
    'Perfect for onboarding new admins or demonstrating the core pickup workflow.',
  tags: ['beginner', '5 hubs', '8 queue items', '1 week'],

  contacts: [
    { id: 'demo-contact-1', name: { first: 'Maria', last: 'Chen' },    email: 'maria@wardfoodpantry.org',   phone: '(303) 555-0101' },
    { id: 'demo-contact-2', name: { first: 'Jake', last: 'Thompson' }, email: 'jake.t@wardvolunteer.org',   phone: '(303) 555-0102' },
    { id: 'demo-contact-3', name: { first: 'Aisha', last: 'Patel' },   email: 'aisha.p@wardvolunteer.org',  phone: '(303) 555-0103' },
    { id: 'demo-contact-4', name: { first: 'Ben', last: 'Wright' },    email: 'ben.w@wardfoodpantry.org',   phone: '(303) 555-0104' },
    { id: 'demo-contact-5', name: { first: 'Rosa', last: 'Martinez' }, email: 'rosa.m@wardvolunteer.org',   phone: '(303) 555-0105' },
    { id: 'demo-contact-6', name: { first: 'Devon', last: 'Park' },    email: 'devon.p@wardvolunteer.org',  phone: '(303) 555-0106' },
    { id: 'demo-contact-7', name: { first: 'Sam', last: 'Okafor' },    email: 'sam.o@wardfoodpantry.org',   phone: '(303) 555-0107' },
  ],

  locations: [
    {
      id: 'demo-loc-1', name: 'East Ward Community Hub',
      schedule: ['MON', 'WED', 'FRI'], contact: 'Maria Chen', phone: '(303) 555-0101',
      resources: ['Canned goods', 'Fresh produce', 'Hygiene kits', 'Diapers', 'Dry staples'],
      transportSize: 'large', notes: 'Loading dock in rear. Ring buzzer. Forklift available Wed/Fri.', createdAt: ago(720),
    },
    {
      id: 'demo-loc-2', name: 'Ward Parish Food Pantry',
      schedule: ['TUE', 'THU'], contact: 'Ben Wright', phone: '(303) 555-0104',
      resources: ['Bread', 'Dairy', 'Eggs', 'Baked goods', 'Canned vegetables'],
      transportSize: 'medium', notes: 'Side entrance on Oak St. Cooler available for dairy.', createdAt: ago(600),
    },
    {
      id: 'demo-loc-3', name: 'South Ward Mobile Stop',
      schedule: ['SAT'], contact: 'Jake Thompson', phone: '(303) 555-0102',
      resources: ['Mixed staples', 'Clothing', 'Blankets', 'Personal care'],
      transportSize: 'oversize', notes: 'Truck required. Park at south lot off Maple Ave. Setup by 9:30am.', createdAt: ago(480),
    },
    {
      id: 'demo-loc-4', name: 'Ward Veterans Annex',
      schedule: ['MON', 'THU'], contact: 'Sam Okafor', phone: '(303) 555-0107',
      resources: ['Hygiene kits', 'Clothing', 'Non-perishables', 'Household items'],
      transportSize: 'medium', notes: 'Check in at front desk. Use freight elevator. Bay 3.', createdAt: ago(360),
    },
    {
      id: 'demo-loc-5', name: 'Ward School Depot',
      schedule: ['WED', 'FRI'], contact: 'Devon Park', phone: '(303) 555-0106',
      resources: ['School supplies', 'Snack packs', 'Fresh produce', 'Dry staples'],
      transportSize: 'large', notes: 'Warehouse Bldg C, gate code 4412. Access Mon–Fri 7am–3pm only.', createdAt: ago(240),
    },
  ],

  entries: [
    // PENDING
    { id: 'demo-queue-1', type: 'pickup_queue', description: '24 cans soup · 12 boxes mac & cheese · 6 jars peanut butter', location: 'East Ward Community Hub', status: 'active', queueStatus: 'pending', createdAt: ago(1.5), syncedToCloud: false },
    { id: 'demo-queue-2', type: 'pickup_queue', description: 'Fresh produce box — lettuce, tomatoes, apples (15 lbs)', location: 'Ward School Depot', status: 'active', queueStatus: 'pending', createdAt: ago(0.5), syncedToCloud: false },
    // CLAIMED
    { id: 'demo-queue-3', type: 'pickup_queue', description: 'Bread & dairy run — 8 loaves, 12 qt milk, 6 doz eggs', location: 'Ward Parish Food Pantry', status: 'active', queueStatus: 'claimed', claimedBy: 'Jake Thompson', claimedAt: ago(0.5), createdAt: ago(3), syncedToCloud: false },
    // IN TRANSIT
    { id: 'demo-queue-4', type: 'pickup_queue', description: 'Hygiene kits × 20 — soap, toothbrush, shampoo, deodorant', location: 'Ward Veterans Annex', status: 'active', queueStatus: 'in_transit', claimedBy: 'Aisha Patel', claimedAt: ago(2), createdAt: ago(6), syncedToCloud: false },
    { id: 'demo-queue-5', type: 'pickup_queue', description: 'Winter clothing — coats (8), gloves (12 pairs), hats (15)', location: 'South Ward Mobile Stop', status: 'active', queueStatus: 'in_transit', claimedBy: 'Devon Park', claimedAt: ago(1.5), createdAt: ago(5), syncedToCloud: false },
    { id: 'demo-queue-6', type: 'pickup_queue', description: 'Dry staples — rice 50 lb × 3, lentils 25 lb × 4, oats 10 lb × 6', location: 'East Ward Community Hub', status: 'active', queueStatus: 'in_transit', claimedBy: 'Jake Thompson', claimedAt: ago(1), createdAt: ago(8), syncedToCloud: false },
    // DELIVERED
    { id: 'demo-queue-7', type: 'pickup_queue', description: 'Infant supplies — diapers size 3 × 4, formula × 6, wipes × 4', location: 'East Ward Community Hub', status: 'fulfilled', queueStatus: 'delivered', claimedBy: 'Rosa Martinez', claimedAt: ago(6), completedAt: ago(4), createdAt: ago(10), syncedToCloud: false },
    // STOCKED
    { id: 'demo-queue-8', type: 'pickup_queue', description: 'Canned vegetables — corn, green beans, tomatoes × 48 each', location: 'Ward Parish Food Pantry', status: 'fulfilled', queueStatus: 'stocked', claimedBy: 'Ben Wright', claimedAt: ago(26), completedAt: ago(20), createdAt: ago(32), syncedToCloud: false },
    // Community board
    { id: 'demo-entry-1', type: 'need', description: 'Family of 4 needs diapers (size 3) and infant formula — ongoing monthly', status: 'active', createdAt: ago(4), syncedToCloud: false },
    { id: 'demo-entry-2', type: 'need', description: 'School backpacks + supplies for 3 kids starting next week', status: 'active', createdAt: ago(18), syncedToCloud: false },
    { id: 'demo-entry-3', type: 'offering', description: 'Garden harvest — tomatoes (40 lbs), zucchini (20 lbs), peppers. Available Fri–Sun.', status: 'active', createdAt: ago(8), syncedToCloud: false },
    { id: 'demo-entry-4', type: 'offering', description: 'Artisan bakery donation — sourdough, wheat, rye (12 loaves). Pick up by 4pm.', status: 'active', createdAt: ago(2), syncedToCloud: false },
    { id: 'demo-entry-5', type: 'offering', description: 'Winter coats — adult sizes S/M/L/XL, assorted. Clean and bagged.', status: 'active', createdAt: ago(36), syncedToCloud: false },
    { id: 'demo-entry-6', type: 'looking_for', description: 'Need one more driver for Friday East Ward run. 2-hour shift, large vehicle preferred.', status: 'active', createdAt: ago(24), syncedToCloud: false },
    { id: 'demo-entry-7', type: 'upcoming_need', description: 'Thanksgiving meal kits for 45 ward families — need donations and packing volunteers by Nov 20.', status: 'active', createdAt: ago(72), syncedToCloud: false },
  ],

  localStorageContent: {
    'pantry-welcome': JSON.stringify({
      name: 'Ward Food Pantry',
      tagline: 'Serving our ward, neighbor by neighbor',
      about:
        'A volunteer-run food pantry serving 200+ families across the ward. ' +
        'We operate five hub locations with a dedicated team of drivers, stock volunteers, ' +
        'and logistics coordinators. All food is free — no ID required, no questions asked.',
    }),
    'pantry-ops-page': JSON.stringify({
      pageTitle: 'Ward Food Pantry',
      intro: 'Open five days a week across multiple pickup locations. Serving East Ward, the Veterans Annex, South Ward, and the school district.',
      sections: [
        { id: 'hours', title: 'Hours & Pickup Locations', body: 'Mon/Wed/Fri — East Ward Community Hub · 9am–1pm\nMon/Thu — Ward Veterans Annex · 10am–2pm\nTue/Thu — Ward Parish Food Pantry · 10am–2pm\nWed/Fri — Ward School Depot · 8am–12pm\nSat — South Ward Mobile Stop · 10am–12pm (truck route)' },
        { id: 'eligibility', title: 'Who We Serve', body: 'Any household in the ward is welcome. No ID required, no income verification, no appointments. Just show up during open hours or request a delivery through a volunteer.' },
        { id: 'volunteer', title: 'Volunteer With Us', body: 'We need drivers (Mon, Wed, Fri), stock volunteers (Tue, Thu), and logistics help on Saturdays. Contact us or use an invite code from a current volunteer to join the team.' },
      ],
    }),
    'pantry-weekly-schedule': JSON.stringify({
      1: { open: true, openTime: '09:00', closeTime: '13:00', notes: 'East Ward Hub + Veterans Annex' },
      2: { open: true, openTime: '10:00', closeTime: '14:00', notes: 'Ward Parish Pantry' },
      3: { open: true, openTime: '08:00', closeTime: '15:00', notes: 'East Ward Hub + School Depot' },
      4: { open: true, openTime: '10:00', closeTime: '14:00', notes: 'Ward Parish Pantry + Veterans Annex' },
      5: { open: true, openTime: '09:00', closeTime: '13:00', notes: 'East Ward Hub + School Depot' },
      6: { open: true, openTime: '10:00', closeTime: '12:00', notes: 'South Ward Mobile Stop (truck route)' },
      0: { open: false, openTime: '', closeTime: '', notes: '' },
    }),
  },
};
