// Honorary assets that can be unlocked with special codes
export interface HonoraryAsset {
  name: string;
  url: string;
  code: string;
  type: 'hat' | 'eye' | 'mouth' | 'body' | 'bg';
  description?: string;
}

export const honoraryAssets: HonoraryAsset[] = [
  {
    name: "Golden Crown",
    url: "https://res.cloudinary.com/dxgbphyhk/image/upload/v1/bubu/honorary/golden_crown.png",
    code: "KINGBUBU",
    type: "hat",
    description: "A rare golden crown for the true Bubu royalty"
  },
  {
    name: "Diamond Eyes",
    url: "https://res.cloudinary.com/dxgbphyhk/image/upload/v1/bubu/honorary/diamond_eyes.png",
    code: "SPARKLE",
    type: "eye",
    description: "Rare diamond eyes that sparkle with wealth"
  },
  {
    name: "Rainbow Background",
    url: "https://res.cloudinary.com/dxgbphyhk/image/upload/v1/bubu/honorary/rainbow_bg.png",
    code: "RAINBOW",
    type: "bg",
    description: "A magical rainbow background for your Bubu"
  },
  {
    name: "Legendary Cape",
    url: "https://res.cloudinary.com/dxgbphyhk/image/upload/v1/bubu/honorary/legendary_cape.png",
    code: "SUPERHERO",
    type: "body",
    description: "A legendary cape for the most heroic Bubus"
  },
  {
    name: "Pixel Smile",
    url: "https://res.cloudinary.com/dxgbphyhk/image/upload/v1/bubu/honorary/pixel_smile.png",
    code: "HAPPY",
    type: "mouth",
    description: "The rarest smile in the Bubu universe"
  }
];

// Function to check if a code is valid and return the corresponding asset
export function getAssetByCode(code: string): HonoraryAsset | null {
  const normalizedCode = code.trim().toUpperCase();
  return honoraryAssets.find(asset => asset.code === normalizedCode) || null;
}
