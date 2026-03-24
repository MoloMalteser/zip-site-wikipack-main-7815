'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserId } from '@/lib/auth';
import { Battle, Card } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Copy, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface BattleArenaProps {
  initialRoomCode?: string;
}

export function BattleArena({ initialRoomCode }: BattleArenaProps) {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [joinCode, setJoinCode] = useState('');
  const [deck, setDeck] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const supabase = createClient();
  const userId = getUserId();
  
  useEffect(() => {
    loadDeck();
  }, []);
  
  useEffect(() => {
    if (!battle) return;
    
    const channel = supabase
      .channel(`battle_${battle.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'battles',
        filter: `id=eq.${battle.id}`
      }, (payload) => {
        setBattle(payload.new as Battle);
      })
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [battle?.id]);
  
  const loadDeck = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('owner_id', userId)
      .eq('is_in_deck', true);
    
    setDeck(data || []);
    setIsLoading(false);
  };
  
  const createBattle = async () => {
    if (deck.length === 0) {
      setError('You need cards in your deck to battle!');
      return;
    }
    
    if (deck.length < 5) {
      setError('You need 5 cards in your deck to battle!');
      return;
    }
    
    setError(null);
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const { data, error: createError } = await supabase
      .from('battles')
      .insert({
        room_code: code,
        player1_id: userId,
        player1_deck: deck.map(c => c.id),
        status: 'waiting',
      })
      .select()
      .single();
    
    if (createError) {
      setError('Failed to create battle room');
      return;
    }
    
    setBattle(data);
    setRoomCode(code);
  };
  
  const joinBattle = async () => {
    if (deck.length === 0) {
      setError('You need cards in your deck to battle!');
      return;
    }
    
    if (deck.length < 5) {
      setError('You need 5 cards in your deck to battle!');
      return;
    }
    
    if (!joinCode || joinCode.length !== 4) {
      setError('Please enter a valid 4-digit room code');
      return;
    }
    
    setError(null);
    
    // First, get the battle to check if it exists and has room
    const { data: existingBattle } = await supabase
      .from('battles')
      .select('*')
      .eq('room_code', joinCode.toUpperCase())
      .eq('status', 'waiting')
      .single();
    
    if (!existingBattle) {
      setError('Room not found or game already started');
      return;
    }
    
    if (existingBattle.player1_id === userId) {
      setError('You cannot join your own room');
      return;
    }
    
    const { data, error: joinError } = await supabase
      .from('battles')
      .update({
        player2_id: userId,
        player2_deck: deck.map(c => c.id),
        status: 'active',
      })
      .eq('room_code', joinCode.toUpperCase())
      .select()
      .single();
    
    if (joinError) {
      setError('Failed to join battle');
      return;
    }
    
    setBattle(data);
    setRoomCode(joinCode.toUpperCase());
  };
  
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const playCard = async (cardId: string) => {
    // Implement battle logic
    console.log('Playing card:', cardId);
  };

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
    <div className="min-h-[60vh]">
      <AnimatePresence mode="wait">
        {!battle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <Swords className="w-24 h-24 text-gray-900 mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Battle Arena</h2>
              <p className="text-gray-500">Create or join a battle room</p>
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
            
            <div className="flex flex-col gap-4 w-full max-w-md">
              <Button
                onClick={createBattle}
                icon={<Sparkles size={20} />}
                className="w-full"
              >
                Create Room
              </Button>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Room Code"
                  maxLength={4}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full uppercase font-mono text-center tracking-widest text-lg focus:outline-none focus:border-black transition-colors"
                />
                <Button
                  onClick={joinBattle}
                  variant="secondary"
                >
                  Join
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-500 mb-2">Your Battle Deck</p>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const card = deck[i];
                  return (
                    <div
                      key={i}
                      className={`
                        w-12 h-16 rounded-xl flex items-center justify-center
                        ${card ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gray-100'}
                      `}
                    >
                      {card ? (
                        <span className="text-white text-xs font-bold">{card.title.slice(0, 2)}</span>
                      ) : (
                        <span className="text-gray-300">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {deck.length}/5 cards in deck
              </p>
            </div>
          </motion.div>
        )}
        
        {battle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {battle.status === 'waiting' && (
              <div className="text-center py-20">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-7xl font-bold tracking-widest mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {battle.room_code}
                  </div>
                </motion.div>
                
                <Button
                  onClick={copyRoomCode}
                  variant="secondary"
                  icon={<Copy size={18} />}
                  className="mx-auto mb-6"
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Users size={20} />
                  </motion.div>
                  <span>Waiting for opponent...</span>
                </div>
              </div>
            )}
            
            {battle.status === 'active' && (
              <div className="space-y-6">
                {/* Health bars */}
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">You</p>
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-green-500"
                        initial={{ width: '100%' }}
                        animate={{ width: `${battle.player1_id === userId 
                          ? (battle.player1_health / 100) * 100 
                          : (battle.player2_health / 100) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm font-bold mt-1">
                      {battle.player1_id === userId 
                        ? battle.player1_health 
                        : battle.player2_health}/100
                    </p>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-300">VS</div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Opponent</p>
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-400 to-red-500"
                        initial={{ width: '100%' }}
                        animate={{ width: `${battle.player1_id === userId 
                          ? (battle.player2_health / 100) * 100 
                          : (battle.player1_health / 100) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm font-bold mt-1">
                      {battle.player1_id === userId 
                        ? battle.player2_health 
                        : battle.player1_health}/100
                    </p>
                  </div>
                </div>
                
                {/* Turn indicator */}
                <div className="text-center py-4">
                  <span className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    ${battle.current_turn === 1 
                      ? (battle.player1_id === userId ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                      : (battle.player2_id === userId ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                    }
                  `}>
                    {battle.current_turn === 1 
                      ? (battle.player1_id === userId ? 'Your Turn' : 'Opponent\'s Turn')
                      : (battle.player2_id === userId ? 'Your Turn' : 'Opponent\'s Turn')
                    }
                  </span>
                </div>
                
                {/* Cards */}
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Your Cards</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {deck.map((card) => (
                      <motion.button
                        key={card.id}
                        whileHover={{ scale: 1.1, y: -10 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => playCard(card.id)}
                        className="w-20 h-28 rounded-xl bg-gradient-to-br from-gray-800 to-black text-white flex items-center justify-center text-xs font-medium p-2 shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <span className="line-clamp-2 text-center">{card.title}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
