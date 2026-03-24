import { CardStats, Rarity, WikipediaArticle } from '@/lib/types';

export function calculateCardStats(article: WikipediaArticle): CardStats {
  const { length, title, extract } = article;
  
  // Power based on article length (logarithmic scale)
  const basePower = Math.log10(Math.max(length, 100)) * 10;
  
  // Defense based on word count of extract
  const wordCount = extract.split(/\s+/).filter(w => w.length > 0).length;
  const baseDefense = Math.min(wordCount / 5, 50);
  
  // Adjust based on title length (shorter titles = more powerful)
  const titleMultiplier = Math.max(0.5, 10 / title.length);
  
  return {
    power: Math.round(basePower * titleMultiplier),
    defense: Math.round(baseDefense),
  };
}

export function getRarity(stats: CardStats): Rarity {
  const totalStats = stats.power + stats.defense;
  
  if (totalStats >= 80) return 'legendary';
  if (totalStats >= 60) return 'epic';
  if (totalStats >= 40) return 'rare';
  return 'common';
}

export const rarityColors: Record<Rarity, string> = {
  common: 'from-gray-100 to-gray-200',
  rare: 'from-blue-100 to-blue-200',
  epic: 'from-purple-100 to-purple-200',
  legendary: 'from-yellow-100 to-yellow-300',
};

export const rarityTextColors: Record<Rarity, string> = {
  common: 'text-gray-600',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary: 'text-yellow-600',
};

export const rarityGlowColors: Record<Rarity, string> = {
  common: 'shadow-gray-200',
  rare: 'shadow-blue-200',
  epic: 'shadow-purple-200',
  legendary: 'shadow-yellow-300',
};
