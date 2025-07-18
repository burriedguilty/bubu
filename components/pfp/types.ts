// Common types for PFP assets

export interface Asset {
  id: string;
  name: string;
  url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
