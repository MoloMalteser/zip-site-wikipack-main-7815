'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { Card as CardComponent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getUserId, setLastFreePack } from '@/lib/auth';
import { fetchMultipleArticles } from '@/lib/wiki/fetcher';
import { calculateCardStats } from '@/lib/wiki/stats';
import { createClient } from '@/lib/supabase/client';

interface PackOpeningProps {
  onComplete: (cards: CardType[]) => void;
}

export function PackOpening({ onComplete }: PackOpeningProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState(0);
  const supabase = createClient();

  const openPack = async () => {
    setIsOpening(true);
    setError(null);
    
    try {
      const userId = getUserId();
      
      // Ensure profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (!existingProfile) {
        await supabase.from('profiles').insert([{ id: userId }]);
      }
      
      // Fetch 5 random Wikipedia articles
      const articles = await fetchMultipleArticles(5);
      
      // Create card records
      const cardData = articles.map((article) => ({
        wiki_id: article.pageid.toString(),
        title: article.title,
        image_url: article.thumbnail?.source || null,
        owner_id: userId,
        stats: calculateCardStats(article),
      }));
      
      const { data: insertedCards, error: insertError } = await supabase
        .from('cards')
        .insert(cardData)
        .select();
      
      if (insertError) {
        throw new Error(insertError.message);
      }
      
      setCards(insertedCards || []);
      
      // Stagger reveal
      for (let i = 0; i < (insertedCards?.length || 0); i++) {
        setTimeout(() => setRevealedCards(i + 1), i * 300);
      }
      
      setLastFreePack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsOpening(false);
    }
  };

  const handleCollect = () => {
    onComplete(cards);
    setCards([]);
    setIsOpening(false);
    setRevealedCards(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <AnimatePresence mode="wait">
        {!isOpening && (
          <motion.div
            key="pack"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={openPack}
              className="w-72 h-96 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-2xl flex flex-col items-center justify-center mb-6 relative overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse" />
              
              <div className="relative z-10">
                <div className="text-7xl mb-4">📦</div>
                <div className="text-3xl font-bold mb-2">Open Pack</div>
                <div className="text-sm opacity-80">5 Random Cards</div>
              </div>
            </motion.button>
            
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {isOpening && cards.length === 0 && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              📦
            </motion.div>
            <div className="text-gray-500 font-medium">Opening pack...</div>
          </motion.div>
        )}

        {cards.length > 0 && (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold mb-8"
            >
              Your Cards
            </motion.h2>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{
                    rotateY: index < revealedCards ? 0 : 180,
                    opacity: index < revealedCards ? 1 : 0.5,
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: 'easeOut'
                  }}
                >
                  <CardComponent 
                    card={card} 
                    flipped={index < revealedCards}
                  />
                </motion.div>
              ))}
            </div>
            
            {revealedCards >= cards.length && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button onClick={handleCollect}>
                  Collect Cards
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
