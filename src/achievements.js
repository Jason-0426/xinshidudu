// ============================================================
// 成就系统
// ============================================================

export const ACHIEVEMENT_CATEGORIES = {
  focus:  { name: '专注', emoji: '⏱️' },
  streak: { name: '连续', emoji: '🔥' },
  level:  { name: '等级', emoji: '🏆' },
  build:  { name: '建造', emoji: '🏰' },
  special:{ name: '特殊', emoji: '✨' },
};

export const ACHIEVEMENTS = [
  // ---------- 专注类 ----------
  {
    id: 'first_focus',
    category: 'focus',
    icon: '🌱',
    name: '初出茅庐',
    desc: '完成第一次专注',
    rewardCoins: 10,
    rewardExp: 50,
    check: (s) => s.totalSessions >= 1,
  },
  {
    id: 'focus_10h',
    category: 'focus',
    icon: '⏱️',
    name: '专注新手',
    desc: '累计专注 10 小时',
    rewardCoins: 50,
    rewardExp: 200,
    check: (s) => s.totalMinutes >= 600,
  },
  {
    id: 'focus_100h',
    category: 'focus',
    icon: '🎖️',
    name: '百时专注',
    desc: '累计专注 100 小时',
    rewardCoins: 500,
    rewardExp: 2000,
    check: (s) => s.totalMinutes >= 6000,
  },
  {
    id: 'focus_500h',
    category: 'focus',
    icon: '🌋',
    name: '专注宗师',
    desc: '累计专注 500 小时',
    rewardCoins: 3000,
    rewardExp: 10000,
    check: (s) => s.totalMinutes >= 30000,
  },

  // ---------- 连续类 ----------
  {
    id: 'streak_3',
    category: 'streak',
    icon: '🔥',
    name: '三日之约',
    desc: '连续专注 3 天',
    rewardCoins: 30,
    rewardExp: 100,
    check: (s) => s.maxStreak >= 3,
  },
  {
    id: 'streak_7',
    category: 'streak',
    icon: '🥇',
    name: '七日坚守',
    desc: '连续专注 7 天',
    rewardCoins: 100,
    rewardExp: 400,
    check: (s) => s.maxStreak >= 7,
  },
  {
    id: 'streak_30',
    category: 'streak',
    icon: '💎',
    name: '一月传奇',
    desc: '连续专注 30 天',
    rewardCoins: 1000,
    rewardExp: 4000,
    check: (s) => s.maxStreak >= 30,
  },
  {
    id: 'streak_100',
    category: 'streak',
    icon: '👑',
    name: '百日之王',
    desc: '连续专注 100 天',
    rewardCoins: 10000,
    rewardExp: 30000,
    check: (s) => s.maxStreak >= 100,
  },

  // ---------- 等级类 ----------
  {
    id: 'level_4',
    category: 'level',
    icon: '🛡️',
    name: '骑士',
    desc: '达到 Lv.4',
    rewardCoins: 100,
    rewardExp: 0,
    check: (s) => s.level >= 4,
  },
  {
    id: 'level_5',
    category: 'level',
    icon: '⚔️',
    name: '男爵',
    desc: '达到 Lv.5',
    rewardCoins: 200,
    rewardExp: 0,
    check: (s) => s.level >= 5,
  },
  {
    id: 'level_9',
    category: 'level',
    icon: '🏆',
    name: '公爵',
    desc: '达到 Lv.9',
    rewardCoins: 2000,
    rewardExp: 0,
    check: (s) => s.level >= 9,
  },
  {
    id: 'level_10',
    category: 'level',
    icon: '⚜️',
    name: '无冕之王',
    desc: '达到 Lv.10',
    rewardCoins: 5000,
    rewardExp: 0,
    check: (s) => s.level >= 10,
  },

  // ---------- 建造类 ----------
  {
    id: 'build_1',
    category: 'build',
    icon: '🏠',
    name: '筑巢者',
    desc: '领地放 1 个建筑',
    rewardCoins: 20,
    rewardExp: 100,
    check: (s) => s.placedCount >= 1,
  },
  {
    id: 'build_10',
    category: 'build',
    icon: '🏘️',
    name: '小村落',
    desc: '领地放 10 个建筑',
    rewardCoins: 200,
    rewardExp: 500,
    check: (s) => s.placedCount >= 10,
  },
  {
    id: 'build_30',
    category: 'build',
    icon: '🏰',
    name: '繁华城镇',
    desc: '领地放 30 个建筑',
    rewardCoins: 1000,
    rewardExp: 3000,
    check: (s) => s.placedCount >= 30,
  },

  // ---------- 特殊类 ----------
  {
    id: 'night_owl',
    category: 'special',
    icon: '🌙',
    name: '夜猫子',
    desc: '在 0-4 点专注一次',
    rewardCoins: 50,
    rewardExp: 200,
    check: (s) => s.hasNightFocus === true,
  },
  {
    id: 'lightning',
    category: 'special',
    icon: '⚡',
    name: '闪电战',
    desc: '单次专注满 60 分钟',
    rewardCoins: 100,
    rewardExp: 300,
    check: (s) => s.hasLongFocus === true,
  },
  {
    id: 'rich_man',
    category: 'special',
    icon: '💰',
    name: '小富翁',
    desc: '持有 1000 金币',
    rewardCoins: 200,
    rewardExp: 500,
    check: (s) => s.gold >= 1000,   // ← 改了：从 totalGoldEarned → gold（当前持有）
  },
];

// ============================================================
// 检查哪些成就达成了
// ============================================================
export function checkAchievements(stats, unlockedMap = {}) {
  const newlyUnlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (unlockedMap[a.id]) continue; // 已解锁的跳过
    try {
      if (a.check(stats)) {
        newlyUnlocked.push(a);
      }
    } catch (e) {
      console.warn(`成就 ${a.id} 检查出错：`, e);
    }
  }
  return newlyUnlocked;
}

// ============================================================
// 根据 id 找成就
// ============================================================
export function getAchievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// ============================================================
// 按分类分组
// ============================================================
export function groupByCategory() {
  const groups = {};
  for (const a of ACHIEVEMENTS) {
    if (!groups[a.category]) groups[a.category] = [];
    groups[a.category].push(a);
  }
  return groups;
}