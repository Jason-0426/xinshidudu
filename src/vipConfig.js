// ============================================================
// VIP 配置
// ============================================================

// 价格
export const VIP_PRICE = '15.99';
export const VIP_CURRENCY = 'RM';

// 二维码路径（用 BASE_URL 拼接，本地/线上都能找到）
export const VIP_QR_IMAGE = `${import.meta.env.BASE_URL}tng-qr.png`;

// 管理员联系方式（收款后用户联系你激活）
export const VIP_CONTACT_TEXT = '转账后请截图发给我激活';
export const VIP_CONTACT_WA = 'WhatsApp: +60 17-228-7993';

// ============================================================
// VIP 特权列表（展示用）
// ============================================================
export const VIP_PERKS = [
  {
    icon: '👑',
    name: 'VIP 徽章',
    desc: '专属金色皇冠，显示在名字前',
  },
  {
    icon: '💰',
    name: '金币加成 +20%',
    desc: '专注完成时获得的金币增加 20%',
  },
  {
    icon: '⭐',
    name: '经验加成 +20%',
    desc: '专注完成时获得的经验增加 20%',
  },
  {
    icon: '🎨',
    name: '专属头像',
    desc: '解锁 3 个 VIP 限定头像',
  },
  {
    icon: '🏰',
    name: '专属建筑',
    desc: '解锁 VIP 限定建筑「魔法塔」',
  },
];

// ============================================================
// VIP 专属内容
// ============================================================

// VIP 专属头像 id（对应 avatarOptions.js 里的 id）
export const VIP_AVATARS = ['avatar-13', 'avatar-14', 'avatar-15'];

// VIP 专属建筑 id（对应 BUILDINGS 里的 id）
export const VIP_BUILDINGS = ['tower'];

// ============================================================
// VIP 加成数值
// ============================================================
export const VIP_BONUS = {
  coins: 0.2,   // 20%
  exp: 0.2,     // 20%
};

// ============================================================
// 默认 VIP 状态
// ============================================================
export const DEFAULT_VIP = {
  isActive: false,
  activatedAt: null,
};

// ============================================================
// 工具函数
// ============================================================

// 判断是否 VIP
export function isVip(profile) {
  return profile?.vip?.isActive === true;
}

// 判断头像是否 VIP 专属
export function isVipAvatar(avatarId) {
  return VIP_AVATARS.includes(avatarId);
}

// 判断建筑是否 VIP 专属
export function isVipBuilding(buildingId) {
  return VIP_BUILDINGS.includes(buildingId);
}