export interface Profile {
  id: string;
  gems: number;
  last_free_pack: string | null;
}

export interface CardStats {
  power: number;
  defense: number;
}

export interface Card {
  id: string;
  wiki_id: string;
  title: string;
  image_url: string | null;
  owner_id: string | null;
  is_in_deck: boolean;
  stats: CardStats;
  created_at: string;
}

export interface Battle {
  id: string;
  player1_id: string;
  player2_id: string | null;
  status: 'waiting' | 'active' | 'completed';
  winner_id: string | null;
  room_code: string;
  current_turn: number;
  player1_deck: string[] | null;
  player2_deck: string[] | null;
  player1_health: number;
  player2_health: number;
  created_at: string;
  updated_at: string;
}

export interface BattleAction {
  type: 'play_card' | 'attack' | 'pass';
  card_id?: string;
  timestamp: string;
}

export interface WikipediaArticle {
  pageid: number;
  title: string;
  extract: string;
  thumbnail?: { source: string };
  fullurl: string;
  length: number;
  revision_count?: number;
}

export type Tab = 'home' | 'collection' | 'battle';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
