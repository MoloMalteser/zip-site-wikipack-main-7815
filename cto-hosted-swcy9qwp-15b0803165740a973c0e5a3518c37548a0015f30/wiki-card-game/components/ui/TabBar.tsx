'use client';

import { motion } from 'framer-motion';
import { Tab } from '@/lib/types';
import { Home, Layers, Swords } from 'lucide-react';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'collection', icon: Layers, label: 'Collection' },
  { id: 'battle', icon: Swords, label: 'Battle' },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
      <div className="flex items-center justify-around h-full max-w-md mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex flex-col items-center justify-center
                w-16 h-16 rounded-full transition-colors duration-200
                ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-600'}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-black rounded-2xl"
                  transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                />
              )}
              
              <Icon className="relative w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <motion.span
                layoutId={`activeLabel-${tab.id}`}
                className="relative text-xs font-medium"
                animate={{ opacity: isActive ? 1 : 0.7 }}
              >
                {tab.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
