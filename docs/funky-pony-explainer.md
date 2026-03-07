# Funky Pony — Community Food Pantry Platform
## A Plain-Language Guide for Community Partners, Pantry Admins & Supporters

---

### What Is Funky Pony?

Funky Pony is a lightweight digital platform built for the Ward Community Food Pantry. It coordinates food pickups, volunteer drivers, pantry stock, and community needs — all in one place, with no complicated software to install.

It runs in a web browser. Volunteers follow links in a daily email. Admins manage everything from a secure dashboard. Community members can see pantry hours and needs without creating an account.

---

### The Problem It Solves

Running a rural food pantry involves a lot of moving parts:
- Food donations arrive at different times and locations in Boulder
- Volunteer drivers need to know what to pick up and when
- Pantry staff need to know what's been delivered so they can stock shelves
- Community members need to know when the pantry is open and what's available
- Admins need to coordinate all of this without a full-time staff

Before Funky Pony, this coordination happened through a mix of texts, phone calls, and spreadsheets. Things got missed. Drivers didn't always know what was claimed. Staff didn't know what was in transit.

---

### How It Works — The Daily Loop

Every morning, an automated digest email goes out to drivers, stockers, and logistics volunteers. It contains:

- **Activity since yesterday** — new pickups available, items claimed, deliveries completed
- **Pantry needs** — what the pantry is short on
- **Upcoming pickup dates** — scheduled donor locations for the next 7 days

The email contains direct action links. A driver can tap "View Pickups" from their phone and claim a run in one step — no login screen, no dashboard to navigate.

---

### Who Uses It

| Person | What they do |
|--------|-------------|
| **Pantry Admin** | Creates volunteer accounts, manages the schedule, posts announcements, reviews logistics |
| **Driver** | Receives the daily digest, claims pickup runs, marks deliveries complete |
| **Stocker / Pantry Ops** | Receives the digest, marks incoming donations as stocked |
| **Community Member** | Views pantry hours, location info, and upcoming events — no account needed |
| **Community Partner** | Can see the public pantry info page, upcoming schedule, and community needs board |

---

### Key Features

#### Public Information Page (`/info`)
Anyone can visit the pantry info page — no account required. It shows hours, location, what the pantry accepts, and current community needs. Pantry admins write and update this content from the dashboard.

#### Community Calendar (`/calendar`)
A 12-week rolling calendar showing pantry open days, donor pickup locations, and volunteer events. Public-facing. Admins populate it by adding locations with a weekly schedule.

#### Pickup Queue
The heart of the logistics system. When a food donation is available for pickup, an admin creates a pickup task. It moves through stages:

```
PENDING → CLAIMED → IN TRANSIT → DELIVERED → STOCKED
```

Drivers claim tasks. Stockers mark them stocked. Everyone sees the current state in real time.

#### Logistics Hub Diagram (`/logistics`)
A visual dashboard showing all active pickups, color-coded by status. Drivers and stockers use this to see at a glance what's in motion.

#### Community Needs Board
Members and partners can post items they have available, items they're looking for, or upcoming donation events. Anonymous posting supported.

#### Daily Digest Email
Sent every 36 hours when there is activity to report. Contains live pantry stats, active needs, and upcoming scheduled pickups. Designed to be actionable from a mobile inbox.

---

### How Accounts Work — Security Without Friction

Funky Pony uses a personal invitation system. There are no open signups.

1. **Admin creates an invite** — enters the volunteer's name, email address, and role (driver, stocker, etc.)
2. **System sends a magic link** — the volunteer receives a personal email with a one-click sign-in link
3. **Account is created automatically** — no password to set, no form to fill out
4. **Role is assigned from the invite** — the system sets the volunteer's permissions based on what the admin specified; the volunteer cannot change their own role

This means:
- Only people the pantry admin has personally invited can create accounts
- Roles are set centrally and cannot be self-modified
- Invite codes are single-use and tied to the recipient's email address
- If an invite is forwarded to someone else, it won't work — the email must match

---

### What Makes It Secure

- **No open signups** — you can only join if an admin invites you
- **Personal codes** — each code is locked to one email address
- **Single-use** — once redeemed, an invite code is permanently burned
- **Roles come from the database** — the server assigns roles, not the client
- **Admin panel is route-guarded** — drivers and stockers are redirected away from the admin area; they interact through the homepage and logistics view
- **Storage is access-controlled** — profile photos are publicly readable; attached entry media is private to the org

---

### Data & Privacy

- No personal data is sold or shared with third parties
- Anonymous posting is available on the community needs board
- Email addresses are used only for digest emails and account setup
- Users can opt out of digest emails at any time

The platform is built on Supabase (open-source database infrastructure) with all data stored in a US-based PostgreSQL instance.

---

### Deployment

Funky Pony can run on any standard web hosting platform:

| Platform | Notes |
|----------|-------|
| Netlify | Recommended — free tier supports full deployment |
| Vercel | Supported |
| Replit | Supported for development and demos |
| Self-hosted | Node.js server included |

The backend (database, authentication, edge functions) runs on Supabase. Setup takes approximately one hour following the included wizard.

---

### How You Can Help

#### Community Partners
- Share the pantry info page link with your networks
- Post donations you have available on the community needs board
- Connect with the pantry admin to become a registered donor location on the calendar

#### Funders & Supporters
- The platform is open-source and free to use
- Infrastructure costs (Supabase, email delivery) run approximately $20–50/month for a pantry of our scale
- Contributions support ongoing development of features like SMS notifications, nutrition data, and multi-pantry coordination

#### Volunteers
- If you'd like to drive or help with pantry ops, contact the pantry admin to receive an invite
- Onboarding takes under 5 minutes — click the link in your email and you're in

---

### Contact

Ward Community Food Pantry — Ward, Colorado
Operated by Funky Pony Space

---

*This document describes the platform as of March 2026. Features are actively developed.*
