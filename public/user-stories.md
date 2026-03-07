# FoodBank — User Stories
*Last updated: 2026-03-07*

---

## Personas

| Persona | Auth state | Role value | canEdit |
|---|---|---|---|
| Public visitor | None | — | No |
| Invite recipient | None → magic-link | — | No |
| Member / viewer | Authenticated | `viewer` | No |
| Driver | Authenticated | `driver` | Yes |
| Stocker | Authenticated | `stocker` | Yes |
| Editor | Authenticated | `editor` | Yes |
| Admin | Authenticated | `admin` | Yes |

---

## 1. Public Visitor

*A community member, donor, or prospective volunteer who has not yet joined the pantry.*

**What they see on the homepage (desktop):**
- SCHEDULE cell — pantry hours and upcoming calendar events
- ABOUT THE PANTRY cell — name, tagline, and about text set by admin
- TASK QUEUE — read-only view of pending and in-progress pickups (no action buttons)
- ACTIVITY cell — community panel: pantry tagline, about text, expressed community needs, link to /info
- LOCATIONS — pickup points and pantry addresses (public info)
- COMMUNITY — active needs and offerings posted by the community

**What they cannot see or do:**
- CLAIM / IN TRANSIT / DELIVERED / UNCLAIM queue action buttons (gated by canEdit)
- MY TASKS strip (only for drivers/stockers)
- Add buttons for entries, locations, contacts
- Admin panel (/admin redirects to /login)
- Member contact directory details beyond seed contacts

**Their journeys:**

- As a public visitor, I want to see the pantry schedule so I know when it's open for distribution.
- As a public visitor, I want to read about the pantry's mission so I can decide whether to get involved.
- As a public visitor, I want to browse expressed community needs so I know what resources are needed.
- As a public visitor, I want to navigate to /info for detailed pantry operational information.
- As a public visitor, I want to find a way to donate or learn about funding opportunities.
- As a public visitor, I want to find the /join page so I can request to become a member.
- As a public visitor, I should not be able to claim or modify any pickup tasks.

---

## 2. Invite Recipient

*Someone the admin has already invited — they have a code and may have a pre-filled email.*

**Their journeys:**

- As an invite recipient, I want to arrive at /join with my invite code pre-filled from the URL so the process is frictionless.
- As an invite recipient, I want to enter my email and receive a magic-link so I don't have to create a password.
- As an invite recipient, after clicking the magic link I want to be taken into the app with my role already set.
- As a new joiner, I want to see a welcome message confirming my pantry and role.
- As a new joiner, I want to be prompted to set my display name so my teammates know who I am.
- If my invite code is expired or mismatched with my email, I want a clear error message explaining why the join failed.

---

## 3. Member / Viewer

*A community member who has accepted an invite but not yet been assigned an operational role.*

**What they see:**
- Everything a public visitor sees
- TASK QUEUE — read-only (status visible, no action buttons)
- Mobile DIRECTORY / QUEUE toggle
- Their own profile page with NEEDS & ITEMS board
- Announcements targeted at all members

**What they cannot do:**
- Claim, transit, deliver, or stock queue entries
- Access the admin panel
- Add entries, locations, or contacts

**Their journeys:**

- As a member, I want to see the pantry's active task queue so I understand the organisation's current workload.
- As a member, I want to post my own needs and offerings on my profile so the community knows what I can give or receive.
- As a member, I want to update my display name, bio, and photo so my teammates can recognise me.
- As a member, I want to receive pantry announcements relevant to my role.
- As a member, I want to express interest in volunteering so the admin can upgrade my role to driver or stocker.

---

## 4. Driver

*A volunteer who picks up food donations and delivers them to the pantry.*

**Homepage layout (desktop):**
- MY DELIVERIES strip (top, full width) — their active claimed and in-transit tasks
- TASK QUEUE (left 2/3) — full queue to claim from, with CLAIM / IN TRANSIT / DELIVERED / UNCLAIM actions
- TEAM ACTIVITY (right 1/3) — team-wide pipeline stats + recent community feed
- LOCATIONS / DIRECTORY / COMMUNITY below (scroll to reach)

**Their journeys:**

- As a driver, I want to see MY DELIVERIES prominently at the top so I know immediately what I have claimed.
- As a driver, when I have no active tasks I want to see the full queue so I can claim a new pickup.
- As a driver, I want to CLAIM a pending task, mark it IN TRANSIT when I'm on the road, and DELIVERED when I hand it off.
- As a driver, I want to UNCLAIM a task I cannot complete so another driver can take it.
- As a driver, I want to see my teammates' claimed and in-transit tasks so I understand overall delivery progress.
- As a driver, I want to see recent community needs and offerings so I can refer friends who might help.
- As a driver, I want to receive an SMS/phone notification (TwiML) when new pickups are posted, at a frequency set by the admin (default: daily digest).
- As a driver, I want the daily digest to contain deep-links directly to /, /logistics, and specific tasks so I don't have to navigate manually.
- As a driver, I do not want access to the admin panel — my workflow lives entirely on the homepage and /logistics.
- As a driver, I want my total deliveries and contribution hours tracked so my work is recognised.

**Notification model:**
- Default: one daily digest (morning) listing pending pickups, active claims, and items completed the previous day.
- Admin can raise or lower frequency (immediate, hourly, daily, weekly) per role.
- Trigger notifications: task claimed by someone else, task available (new pending), task delivered.

---

## 5. Stocker

*A volunteer who receives delivered food and stocks pantry shelves.*

**Homepage layout (desktop):**
- MY SHIFTS strip (top, full width) — their active commitments
- TASK QUEUE (full width) — queue with STOCKED action on delivered items; can also see and claim driver tasks
- PANTRY STATUS panel (below queue on scroll) — delivered/stocked counts highlighted; full pipeline visible
- LOCATIONS / DIRECTORY / COMMUNITY below

**Their journeys:**

- As a stocker, I want to see MY SHIFTS prominently so I know what I have committed to today.
- As a stocker, I want to see DELIVERED items clearly highlighted so I know what is ready to be shelved.
- As a stocker, I want to mark a delivered item as STOCKED once it is on the shelves.
- As a stocker, I want to see driver tasks so I can refer a friend or claim a driving task myself if needed.
- As a stocker (future), I want to log CLEAN and REPAIR tasks so maintenance work is tracked alongside stocking.
- As a stocker, I want to receive an SMS notification when a delivery arrives and is ready to be stocked.
- As a stocker, I do not want access to the admin panel.
- As a stocker, I want my total stocking sessions and hours tracked for recognition.

---

## 6. Editor

*A trusted volunteer who can manage entries, locations, and contacts but does not have full admin access.*

**Their journeys:**

- As an editor, I want all the canEdit affordances (add entries, add locations, edit welcome content) on the homepage.
- As an editor, I want access to the admin panel so I can manage the info page, schedule, and staged announcements.
- As an editor, I cannot manage members, invites, or data stores (those are admin-only tabs).
- As an editor, I want to compose and stage announcements for admin approval before they are sent.

---

## 7. Admin

*The pantry coordinator — full access to all features.*

**Their journeys:**

**Operations:**
- As an admin, I want to see the full pipeline (pending / claimed / in-transit / delivered / stocked) at a glance.
- As an admin, I want to add, edit, and delete pickup locations including their schedule and transport size.
- As an admin, I want to add entries (needs, offerings, upcoming needs, queue tasks) on behalf of the community.
- As an admin, I want to manage the 12-week calendar auto-generated from location schedules.

**Members & invites:**
- As an admin, I want to generate invite codes with a pre-set role (driver, stocker, editor, member) and send them by email or shareable link.
- As an admin, I want to see all members, their roles, and their contact details in one place.
- As an admin, I want to change a member's role after they join (e.g. promote viewer → driver).
- As an admin, I want to edit a member's display name, phone, bio, and location label.

**Announcements & messaging:**
- As an admin, I want to compose announcements targeted at specific roles (drivers, stockers, all members).
- As an admin, I want to stage a draft announcement for review before it is sent.
- As an admin, I want to schedule an announcement to go out at a specific time.
- As an admin, I want to set the notification frequency for drivers and stockers independently (default: daily).
- As an admin, I want to view the message delivery log (sent / delivered / bounced / complained) so I know the digest is reaching volunteers.

**Contribution tracking (planned):**
- As an admin, I want to see a volunteer contributions tab showing each member's total tasks completed, deliveries made, and stocking sessions.
- As an admin, I want to filter contributions by date range to produce a monthly report.

**Data & infrastructure:**
- As an admin, I want to see the health of IndexedDB, Supabase, and edge functions in the DATA tab.
- As an admin, I want to run the setup probes to confirm Mailgun, MTS, and invite claim-invite are working.
- As an admin, I want to export or bulk-import contact data.
- As an admin, I want to use the Oracle panel to manage passphrases, review the E8 integrity pipeline, and update my password.

---

## Visibility Matrix

| Surface | Public | Viewer | Driver | Stocker | Editor | Admin |
|---|---|---|---|---|---|---|
| Schedule cell | Yes | Yes | Hidden* | Hidden* | Yes | Yes |
| About/Welcome cell | Yes | Yes | Hidden* | Hidden* | Yes | Yes |
| MY TASKS strip | No | No | Yes | Yes | No | No |
| Task queue (read-only) | Yes | Yes | Yes | Yes | Yes | Yes |
| Queue action buttons | No | No | Yes | Yes | Yes | Yes |
| Team activity / stats | No | No | Yes | Yes | Yes | Yes |
| Community panel (activity) | Yes | Yes | No | No | No | No |
| Locations cell | Yes | Yes | Yes | Yes | Yes | Yes |
| Directory cell | Yes | Yes | Yes | Yes | Yes | Yes |
| Community cell | Yes | Yes | Yes | Yes | Yes | Yes |
| Add buttons (entries/loc/contact) | No | No | No | No | Yes | Yes |
| Admin panel (/admin) | No | No | No | No | Yes | Yes |
| Logistics page (/logistics) | Yes | Yes | Yes | Yes | Yes | Yes |
| Profile page (/profile) | No | Yes | Yes | Yes | Yes | Yes |
| Needs & Items board | No | Yes | Yes | Yes | Yes | Yes |

*Driver/stocker see MY TASKS strip instead; schedule/welcome are hidden for them to maximise queue space.

---

## Open Questions

1. **Viewer queue visibility** — Should viewers see the queue at all, or just the community panel? Currently they see the queue read-only. If the queue contains sensitive pickup addresses, restricting to canEdit may be safer.

2. **Directory privacy** — The DIRECTORY cell shows internal contacts (name, email, phone). Should this be gated to members (any authenticated user with orgId) rather than fully public?

3. **Stocker CLAIM** — Should a stocker be able to CLAIM a pending driver task? Currently yes (canEdit = true). This covers the case where a stocker can also drive. If distinct permissions are needed, a separate `canDrive` flag would be required.

4. **Contribution tracking** — The total tasks / hours metric is mentioned in several journeys but not yet implemented. The admin tab and user self-view are both planned.

5. **Donation / funding** — The viewer community panel has a placeholder for a donate link and funding opportunities. A `pantry-donate-url` localStorage key is the simplest path; rich funding content could live in an additional AdminPage INFO PAGE section.

6. **Clean & repair tasks** — Stocker journey mentions these as future `EntryType` additions. When added, they will need their own queue status flow distinct from the food pickup flow.
