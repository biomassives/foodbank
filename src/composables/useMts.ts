import { supabase, queueMtsMessage } from 'src/dbManagement';
import { useAddressStore } from 'src/store/store';

export interface MtsPayload {
  type: string;
  orgId?: string;
  recipientEmail?: string;
  recipientRole?: string[];
  transports?: ('email' | 'site' | 'webhook')[];
  data?: Record<string, unknown>;
}

export function useMts() {
  const store = useAddressStore();

  async function send(payload: MtsPayload): Promise<void> {
    const orgId = payload.orgId || store.userOrgId;
    if (!orgId) return;

    const body = { ...payload, orgId };

    if (!navigator.onLine) {
      await queueMtsMessage(body);
      return;
    }

    await supabase.functions.invoke('mts', { body });
  }

  return { send };
}
