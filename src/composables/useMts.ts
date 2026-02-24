import { supabase, queueMtsMessage, syncSiteMessage } from 'src/dbManagement';
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

  /**
   * Send a message through the MTS edge function (email + site + webhook).
   * Queues to IndexedDB when offline; flushed on reconnect.
   */
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

  /**
   * Insert a site_message directly into Supabase (bypasses edge function).
   * Use for local-first sync or when you only need the in-app inbox.
   */
  async function sendSiteOnly(payload: {
    type: string;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
  }): Promise<{ error: string | null }> {
    const orgId = store.userOrgId;
    const { data: { user } } = await supabase.auth.getUser();
    if (!orgId || !user) return { error: 'Not authenticated or no org' };

    return syncSiteMessage({
      orgId,
      userId: user.id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });
  }

  return { send, sendSiteOnly };
}
