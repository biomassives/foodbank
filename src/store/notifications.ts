import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase, cacheNotifications, getCachedNotifications } from 'src/dbManagement';

export interface SiteMessage {
  id: string;
  org_id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export const useNotificationStore = defineStore('notifications', () => {
  const messages = ref<SiteMessage[]>([]);
  const loading = ref(false);
  const drawerOpen = ref(false);

  const unreadCount = computed(() =>
    messages.value.filter(m => !m.read).length
  );

  const sortedMessages = computed(() =>
    [...messages.value].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  );

  async function fetchMessages() {
    loading.value = true;
    try {
      const { data } = await supabase
        .from('site_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      messages.value = (data || []) as SiteMessage[];
      await cacheNotifications(messages.value);
    } catch {
      // Offline — load from IDB cache
      const cached = await getCachedNotifications();
      messages.value = cached as SiteMessage[];
    } finally {
      loading.value = false;
    }
  }

  async function markRead(messageId: string) {
    const msg = messages.value.find(m => m.id === messageId);
    if (msg) msg.read = true;
    await supabase
      .from('site_messages')
      .update({ read: true })
      .eq('id', messageId);
  }

  async function markAllRead() {
    const unreadIds = messages.value.filter(m => !m.read).map(m => m.id);
    if (unreadIds.length === 0) return;
    messages.value.forEach(m => { m.read = true; });
    await supabase
      .from('site_messages')
      .update({ read: true })
      .in('id', unreadIds);
  }

  function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value;
  }

  function subscribeRealtime(userId: string) {
    return supabase
      .channel('site_messages_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'site_messages',
        filter: `user_id=eq.${userId}`,
      }, (payload: { new: SiteMessage }) => {
        messages.value.unshift(payload.new);
      })
      .subscribe();
  }

  return {
    messages,
    loading,
    drawerOpen,
    unreadCount,
    sortedMessages,
    fetchMessages,
    markRead,
    markAllRead,
    toggleDrawer,
    subscribeRealtime,
  };
});
