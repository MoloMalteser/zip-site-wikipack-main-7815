'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TabBar } from '@/components/ui/TabBar';
import { Tab } from '@/lib/types';
import { ensureProfile, getUserId } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

export default function TabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const tabParam = params.tab as string;
  const [activeTab, setActiveTab] = useState<Tab>((tabParam as Tab) || 'home');
  const [gems, setGems] = useState(0);

  useEffect(() => {
    ensureProfile();
    loadGems();
  }, []);

  useEffect(() => {
    if (tabParam && ['home', 'collection', 'battle'].includes(tabParam)) {
      setActiveTab(tabParam as Tab);
    }
  }, [tabParam]);

  const loadGems = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('gems')
      .eq('id', getUserId())
      .single();
    
    if (data) {
      setGems(data.gems);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.push(`/${tab}`);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="pt-8 pb-4 px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wiki Cards</h1>
            <p className="text-sm text-gray-500">Collect & Battle</p>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
            <span className="text-purple-600">💎</span>
            <span className="font-bold text-purple-700">{gems}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
