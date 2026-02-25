export interface Address {
  id: string;
  name: { first: string; last: string };
  email: string;
  phone: string;
}

export interface Meta {
  totalCount: number;
}

export type EntryType =
  | 'need'
  | 'offering'
  | 'pickup_queue'
  | 'looking_for'
  | 'upcoming_need'
  | 'calendar_event';

export type QueueStatus = 'pending' | 'claimed' | 'in_transit' | 'delivered' | 'stocked';

export type CalendarVisibility = 'public' | 'drivers' | 'stock_pantry' | 'logistics_outreach' | 'admin';
export type CalendarRecurrence = 'weekly' | 'biweekly' | 'monthly' | 'none';

export interface Entry {
  id: string;
  type: EntryType;
  description: string;
  location?: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  queueStatus?: QueueStatus;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  createdAt: string;
  syncedToCloud: boolean;
  sketch?: string;
  image?: string;
  calendarDate?: string;
  calendarDayOfWeek?: string;
  calendarRecurrence?: CalendarRecurrence;
  calendarVisibility?: CalendarVisibility[];
  calendarLocationId?: string;
  requesterEmail?: string;
}

export type TransportSize = 'small' | 'medium' | 'large' | 'oversize' | 'superload';

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface Location {
  id: string;
  name: string;
  schedule: DayOfWeek[];
  contact: string;
  phone: string;
  resources: string[];
  transportSize: TransportSize;
  notes?: string;
  createdAt: string;
}

export interface AddressState {
  searchStr: string;
  addressList: Address[];
  entryList: Entry[];
  locationList: Location[];
  role: string;
  user: any;
  userOrgId: string | null;
}

export interface ParamsType {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export type DaySlot = 'morning' | 'afternoon' | 'evening';
export type WeekAvailability = Record<DayOfWeek, Record<DaySlot, boolean>>;

export interface UserProfile {
  id: string;
  org_id: string | null;
  role: string;
  email: string | null;
  display_name: string | null;
  bio: string | null;
  location_label: string | null;
  interests: string[];
  availability: WeekAvailability | Record<string, never>;
  off_week_notes: string | null;
  avatar_url: string | null;
  digest_opt_in: boolean;
  created_at: string;
}