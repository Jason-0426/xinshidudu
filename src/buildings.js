// ============================================================
// 30 个建筑数据
// ============================================================

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

// 生成某个建筑的 2 张图片路径
const imgs = (id) => [
  asset(`buildings/${id}-0.png`),
  asset(`buildings/${id}-1.png`),
];

export const BUILDINGS = [
  // ===== 基础 =====
  { id: 'house',         name: '小木屋',   rarity: 'common', price: 0,     imgs: imgs('house') },
  { id: 'bakery',        name: '面包房',   rarity: 'common', price: 200,   imgs: imgs('bakery') },
  { id: 'pine-tree',     name: '松树',     rarity: 'common', price: 100,   imgs: imgs('pine-tree') },
  { id: 'water-well',    name: '水井',     rarity: 'common', price: 150,   imgs: imgs('water-well') },
  { id: 'farm',          name: '农田',     rarity: 'common', price: 200,   imgs: imgs('farm') },
  { id: 'fence',         name: '木栅栏',   rarity: 'common', price: 80,    imgs: imgs('fence') },
  { id: 'stone-pile',    name: '石堆',     rarity: 'common', price: 50,    imgs: imgs('stone-pile') },
  { id: 'campfire',      name: '篝火',     rarity: 'common', price: 120,   imgs: imgs('campfire') },
  { id: 'wooden-bridge', name: '木桥',     rarity: 'common', price: 250,   imgs: imgs('wooden-bridge') },
  { id: 'flower-bed',    name: '花坛',     rarity: 'common', price: 100,   imgs: imgs('flower-bed') },

  // ===== 中级 =====
  { id: 'blacksmith',    name: '铁匠铺',   rarity: 'rare',   price: 500,   imgs: imgs('blacksmith') },
  { id: 'tavern',        name: '酒馆',     rarity: 'rare',   price: 600,   imgs: imgs('tavern') },
  { id: 'stable',        name: '马厩',     rarity: 'rare',   price: 550,   imgs: imgs('stable') },
  { id: 'windmill',      name: '风车磨坊', rarity: 'rare',   price: 800,   imgs: imgs('windmill') },
  { id: 'herb-garden',   name: '药草园',   rarity: 'rare',   price: 450,   imgs: imgs('herb-garden') },
  { id: 'library',       name: '藏书阁',   rarity: 'rare',   price: 700,   imgs: imgs('library') },
  { id: 'archer-tower',  name: '弓箭塔',   rarity: 'rare',   price: 900,   imgs: imgs('archer-tower') },
  { id: 'mine',          name: '矿洞',     rarity: 'rare',   price: 650,   imgs: imgs('mine') },
  { id: 'fishing-hut',   name: '渔屋',     rarity: 'rare',   price: 500,   imgs: imgs('fishing-hut') },
  { id: 'barn',          name: '大谷仓',   rarity: 'rare',   price: 600,   imgs: imgs('barn') },

  // ===== 高级 =====
  { id: 'castle-tower',  name: '城堡塔楼', rarity: 'epic',   price: 2000,  imgs: imgs('castle-tower') },
  { id: 'cathedral',     name: '大教堂',   rarity: 'epic',   price: 3000,  imgs: imgs('cathedral') },
  { id: 'town-hall',     name: '议事厅',   rarity: 'epic',   price: 2500,  imgs: imgs('town-hall') },
  { id: 'wizard-tower',  name: '魔法塔',   rarity: 'epic',   price: 3500,  imgs: imgs('wizard-tower') },
  { id: 'dragon-nest',   name: '龙巢',     rarity: 'epic',   price: 4000,  imgs: imgs('dragon-nest') },
  { id: 'clock-tower',   name: '时光钟楼', rarity: 'epic',   price: 3800,  imgs: imgs('clock-tower') },
  { id: 'sky-garden',    name: '天空花园', rarity: 'epic',   price: 4500,  imgs: imgs('sky-garden') },

  // ===== 传说 =====
  { id: 'dragon-castle', name: '龙之城堡', rarity: 'legendary', price: 10000, imgs: imgs('dragon-castle') },
  { id: 'phoenix-temple',name: '凤凰圣殿', rarity: 'legendary', price: 12000, imgs: imgs('phoenix-temple') },
  { id: 'star-gate',     name: '星界之门', rarity: 'legendary', price: 15000, imgs: imgs('star-gate') },

    // ===== 活动限定 =====
  { id: 'launch-tower', name: '开服纪念塔', rarity: 'legendary', price: 0, imgs: imgs('launch-tower') },
];

export const RARITY_LABEL = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const RARITY_COIN = {
  common: 20,
  rare: 80,
  epic: 300,
  legendary: 1000,
};

export const DEFAULT_BUILDING = BUILDINGS[0];

export const getBuildingById = (id) => BUILDINGS.find((b) => b.id === id);

// ============================================================
// 对象版本（key 是 id）—— 给 CastlePage 用
// ============================================================
export const BUILDINGS_MAP = BUILDINGS.reduce((acc, b) => {
  acc[b.id] = b;
  return acc;
}, {});