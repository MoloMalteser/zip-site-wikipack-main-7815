'use client';

import { useState } from 'react';
import { PackOpening } from '@/components/features/PackOpening';
import { Card as CardType } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const [showPack, setShowPack] = useState(true);
  const [lastOpenedCards, setLastOpenedCards] = useState<CardType[]>([]);

  const handlePackComplete = (cards: CardType[]) => {
    setLastOpenedCards(cards);
    setShowPack(false);
  };

  const handleOpenAnother = () => {
    setShowPack(true);
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {showPack ? (
          <motion.div
            key="pack"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PackOpening onComplete={handlePackComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-6xl mb-6"
            >
              🎉
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-2">Pack Opened!</h2>
            <p className="text-gray-500 mb-8">
              You got {lastOpenedCards.length} new cards
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {lastOpenedCards.slice(0, 3).map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.random() * 0.3 }}
                  className="w-20 h-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs p-2 text-center overflow-hidden"
                >
                  {card.title}
                </motion.div>
              ))}
              {lastOpenedCards.length > 3 && (
                <div className="w-20 h-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                  +{lastOpenedCards.length - 3}
                </div>
              )}
            </div>
            
            <button
              onClick={handleOpenAnother}
              className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Open Another Pack
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
