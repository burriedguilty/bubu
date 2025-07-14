// Hat assets for PFP maker
export interface AssetItem {
  name: string;
  url: string;
  backUrl?: string; // Optional back part URL
  usePathfinder?: boolean; // Whether to use pathfinder effect for this hat
}

export const hatAssets: AssetItem[] = [
  { name: 'Hat 1', url: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508097/topi_bucket_cbsfb7.png', backUrl: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508116/topi_bucket_haxsrm.png', usePathfinder: true },
  { name: 'Hat 2', url: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508098/mahkota_uf0tn1.png', backUrl: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508116/mahkota_kqoeeh.png', usePathfinder: false },
  { name: 'Hat 3', url: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508098/topi_cina_gq5l5x.png', backUrl: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508118/topi_cina_v3jux4.png', usePathfinder: true },
  { name: 'Hat 4', url: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508099/topi_mafia_rm217s.png', backUrl: '', usePathfinder: false },
  { name: 'Hat 5', url: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508099/topi_beanie_v1lz8d.png', backUrl: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508115/topi_beanie_f55igp.png', usePathfinder: false },
  { name: 'Hat 6', url: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508103/topi_army_hraelq.png', backUrl: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508114/topi_army_gamsxs.png', usePathfinder: true },
  { name: 'Hat 7', url: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508104/topi_normal_beatvy.png', backUrl: 'https://res.cloudinary.com/dfjqqnv3x/image/upload/v1752508117/topi_normal_hztghv.png', usePathfinder: true },
];
