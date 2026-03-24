'use client';

import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { getRarity, rarityColors, rarityTextColors } from '@/lib/wiki/stats';

interface CardProps {
  card: CardType;
  flipped?: boolean;
  onClick?: () => void;
  className?: string;
  showSellButton?: boolean;
  onSell?: () => void;
}

export function Card({ card, flipped = true, onClick, className = '' }: CardProps) {
  const rarity = getRarity(card.stats);
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative w-32 h-48 cursor-pointer select-none
        ${className}
      `}
      onClick={onClick}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: flipped ? 0 : 180 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Rarity gradient border */}
          <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[rarity]} opacity-20`} />
          
          {/* Image area */}
          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl opacity-20">📄</span>
              </div>
            )}
            {/* Rarity indicator */}
            <div
              className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br ${rarityColors[rarity]} border border-white`}
            />
          </div>
          
          {/* Content */}
          <div className="p-3 relative">
            <h3 className="text-xs font-semibold line-clamp-2 mb-2 text-gray-800 leading-tight">
              {card.title}
            </h3>
            <div className="flex justify-between items-center text-xs">
              <span className={`font-bold ${rarityTextColors[rarity]}`}>
                ⚔️ {card.stats.power}
              </span>
              <span className={`font-bold ${rarityTextColors[rarity]}`}>
                🛡️ {card.stats.defense}
              </span>
            </div>
          </div>
        </div>
        
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center shadow-xl border border-gray-700"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="text-center">
            <div className="text-white text-5xl font-bold opacity-10 mb-2">W</div>
            <div className="text-gray-400 text-xs tracking-widest uppercase">Wiki Cards</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
