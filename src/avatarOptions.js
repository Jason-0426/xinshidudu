// ============================================================
// 预设头像列表（15 张 AI 生成的头像）
// ============================================================

export const PRESET_AVATARS = [
  { id: 'avatar-1',  img: '/avatars/avatar-1.png',  name: '年轻骑士' },
  { id: 'avatar-2',  img: '/avatars/avatar-2.png',  name: '老骑士' },
  { id: 'avatar-3',  img: '/avatars/avatar-3.png',  name: '女法师' },
  { id: 'avatar-4',  img: '/avatars/avatar-4.png',  name: '老巫师' },
  { id: 'avatar-5',  img: '/avatars/avatar-5.png',  name: '王子' },
  { id: 'avatar-6',  img: '/avatars/avatar-6.png',  name: '农女' },
  { id: 'avatar-7',  img: '/avatars/avatar-7.png',  name: '吟游诗人' },
  { id: 'avatar-8',  img: '/avatars/avatar-8.png',  name: '猎人' },
  { id: 'avatar-9',  img: '/avatars/avatar-9.png',  name: '铁匠' },
  { id: 'avatar-10', img: '/avatars/avatar-10.png', name: '牧师' },
  { id: 'avatar-11', img: '/avatars/avatar-11.png', name: '商人' },
  { id: 'avatar-12', img: '/avatars/avatar-12.png', name: '精灵弓手' },
  { id: 'avatar-13', img: '/avatars/avatar-13.png', name: '盗贼' },
  { id: 'avatar-14', img: '/avatars/avatar-14.png', name: '学徒' },
  { id: 'avatar-15', img: '/avatars/avatar-15.png', name: '矮人战士' },
];

// ============================================================
// 头像数据结构
// ============================================================
//
// profile.avatar = 
//   { type: 'preset', value: 'avatar-1' }
//   或
//   { type: 'custom', value: 'https://xxx.supabase.co/storage/...' }
//
// 首次进入 → { type: 'preset', value: 'avatar-1' }
//

export const DEFAULT_AVATAR = {
  type: 'preset',
  value: 'avatar-1',
};

// ============================================================
// 工具函数
// ============================================================

// 根据 id 找头像
export function getPresetAvatar(id) {
  return PRESET_AVATARS.find((a) => a.id === id) || PRESET_AVATARS[0];
}

// 获取头像显示内容（返回 { type: 'preset' | 'custom', src }）
export function getAvatarDisplay(avatar) {
  if (!avatar) {
    return { type: 'preset', src: PRESET_AVATARS[0].img };
  }

  if (avatar.type === 'custom' && avatar.value) {
    return { type: 'custom', src: avatar.value };
  }

  const preset = getPresetAvatar(avatar.value);
  return { type: 'preset', src: preset.img };
}

// 判断两个头像是否相同
export function isSameAvatar(a, b) {
  if (!a || !b) return false;
  return a.type === b.type && a.value === b.value;
}