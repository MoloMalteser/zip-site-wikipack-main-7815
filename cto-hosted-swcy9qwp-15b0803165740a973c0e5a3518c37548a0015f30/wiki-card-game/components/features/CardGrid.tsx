'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card as CardType } from '@/lib/types';
import { Card as CardComponent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserId } from '@/lib/auth';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Trash2, Gem } from 'lucide-react';

interface CardGridProps {
  refreshTrigger?: number;
}

export function CardGrid({ refreshTrigger = 0 }: CardGridProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const userId = getUserId();
  
  useEffect(() => {
    loadCards();
    
    const channel = supabase
      .channel('cards_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'cards',
        filter: `owner_id=eq.${userId}`
      }, () => {
        loadCards();
      })
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [refreshTrigger]);
  
  const loadCards = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    setCards(data || []);
    setIsLoading(false);
  };
  
  const toggleDeck = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    const deckCount = cards.filter(c => c.is_in_deck).length;
    
    if (!card.is_in_deck && deckCount >= 5) {
      alert('Deck can only have 5 cards');
      return;
    }
    
    await supabase
      .from('cards')
      .update({ is_in_deck: !card.is_in_deck })
      .eq('id', cardId);
    
    // Optimistic update
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, is_in_deck: !c.is_in_deck } : c
    ));
  };
  
  const sellCard = async (card: CardType) => {
    if (!card) return;
    
    await supabase
      .from('cards')
      .delete()
      .eq('id', card.id);
    
    // Award gems
    await supabase
      .from('profiles')
      .update({ gems: supabase.rpc('add_gems', { user_id: userId, amount: 10 }) })
      .eq('id', userId);
    
    setSelectedCard(null);
    loadCards();
  };
  
  const deckCards = cards.filter(c => c.is_in_deck);
  const collectionCards = cards.filter(c => !c.is_in_deck);
  const emptySlots = Math.max(0, 25 - cards.length);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Deck Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Battle Deck</h2>
            <p className="text-gray-500 text-sm">{deckCards.length}/5 cards in deck</p>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => {
            const card = deckCards[i];
            return (
              <motion.div
                key={card?.id || `deck-slot-${i}`}
                layout
                className={`
                  aspect-[2/3] rounded-2xl border-2
                  ${card ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-200'}
                  flex items-center justify-center overflow-hidden
                `}
                onClick={() => card && toggleDeck(card.id)}
              >
                {card ? (
                  <CardComponent
                    card={card}
                    className="w-full h-full"
                  />
                ) : (
                  <span className="text-gray-300 text-2xl">+</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Collection Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Collection</h2>
            <p className="text-gray-500 text-sm">{cards.length} cards</p>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {collectionCards.map((card) => (
            <motion.div
              key={card.id}
              layout
              layoutId={card.id}
              className="aspect-[2/3] rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden hover:border-gray-300 transition-colors"
              onClick={() => setSelectedCard(card)}
            >
              <CardComponent
                card={card}
                className="w-full h-full"
              />
            </motion.div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: Math.min(5, emptySlots) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-[2/3] rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center"
            >
              <span className="text-gray-200 text-2xl">+</span>
            </div>
          ))}
        </div>
      </section>

      {/* Card Detail Modal */}
      <Modal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title={selectedCard?.title}
      >
        {selectedCard && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CardComponent
                card={selectedCard}
                className="w-40 h-60"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {selectedCard.stats.power}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Power</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {selectedCard.stats.defense}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Defense</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant={selectedCard.is_in_deck ? 'secondary' : 'primary'}
                onClick={() => {
                  toggleDeck(selectedCard.id);
                  setSelectedCard(null);
                }}
                className="flex-1"
              >
                {selectedCard.is_in_deck ? 'Remove from Deck' : 'Add to Deck'}
              </Button>
              
              <Button
                variant="danger"
                onClick={() => sellCard(selectedCard)}
                icon={<Gem size={16} />}
              >
                10 Gems
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
