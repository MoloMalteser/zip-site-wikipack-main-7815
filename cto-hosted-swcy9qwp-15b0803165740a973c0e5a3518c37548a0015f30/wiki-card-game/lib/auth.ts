'use client';

const USER_ID_KEY = 'wiki_user_id';

export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

export async function ensureProfile(): Promise<void> {
  // Client-side only - called from useEffect
  if (typeof window === 'undefined') return;
  
  const { createClient } = await import('./supabase/client');
  const supabase = createClient();
  const userId = getUserId();
  
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();
  
  if (!existingProfile) {
    await supabase.from('profiles').insert([{ id: userId }]);
  }
}

export function canClaimFreePack(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lastClaim = localStorage.getItem('last_free_pack');
  if (!lastClaim) return true;
  
  const lastDate = new Date(lastClaim);
  const now = new Date();
  const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
  
  return diffHours >= 24;
}

export function setLastFreePack(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('last_free_pack', new Date().toISOString());
}
