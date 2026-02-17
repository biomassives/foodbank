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
  | 'upcoming_need';

export type QueueStatus = 'pending' | 'claimed' | 'in_transit' | 'delivered' | 'stocked';

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