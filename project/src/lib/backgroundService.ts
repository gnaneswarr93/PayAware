/**
 * Background Service
 * Handles mobile-specific background tasks and real-time persistence
 */
import { supabase } from './supabase';

export const backgroundService = {
  /**
   * Initialize background listeners
   */
  async init() {
    console.log("[BackgroundService] Initializing...");
    
    // Enable Supabase Realtime for instant UI updates
    this.setupRealtimeSync();
    
    // Additional mobile background logic can be added here
    // e.g. Syncing offline transactions when connection is restored
  },

  /**
   * Set up real-time sync via Supabase
   */
  setupRealtimeSync() {
    const channel = supabase
      .channel('realtime_transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        console.log('[BackgroundService] Realtime Update:', payload);
        // This is primarily for other clients/web to sync.
        // On mobile, the UI will re-fetch or use local state.
      })
      .subscribe((status) => {
        console.log(`[BackgroundService] Supabase Realtime Status: ${status}`);
      });

    return channel;
  }
};
