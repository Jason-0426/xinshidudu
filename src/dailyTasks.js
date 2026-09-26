// ============================================================
// 每日任务系统
// ============================================================

// ---------- 任务池 ----------
export const TASK_POOL = [
  // 简单（5 分）
  {
    id: 'focus_1',
    name: '初战告捷',
    desc: '完成 1 次专注',
    difficulty: 'easy',
    coins: 15, exp: 40, points: 5,
    check: (d) => d.todaySessions >= 1,
  },
  {
    id: 'single_15',
    name: '快速专注',
    desc: '单次专注满 15 分钟',
    difficulty: 'easy',
    coins: 15, exp: 40, points: 5,
    check: (d) => d.todayMaxSingle >= 15,
  },
  {
    id: 'single_25',
    name: '一次番茄',
    desc: '单次专注满 25 分钟',
    difficulty: 'easy',
    coins: 20, exp: 60, points: 5,
    check: (d) => d.todayMaxSingle >= 25,
  },
  {
    id: 'pomodoro',
    name: '番茄钟大师',
    desc: '用番茄钟完成一次专注',
    difficulty: 'easy',
    coins: 20, exp: 60, points: 5,
    check: (d) => d.todayModes.includes('pomodoro'),
  },
  {
    id: 'stopwatch',
    name: '自由专注',
    desc: '用正计时完成一次专注',
    difficulty: 'easy',
    coins: 20, exp: 60, points: 5,
    check: (d) => d.todayModes.includes('stopwatch'),
  },

  // 中等（10 分）
  {
    id: 'focus_3',
    name: '三连击',
    desc: '完成 3 次专注',
    difficulty: 'medium',
    coins: 50, exp: 150, points: 10,
    check: (d) => d.todaySessions >= 3,
  },
  {
    id: 'single_45',
    name: '深度专注',
    desc: '单次专注满 45 分钟',
    difficulty: 'medium',
    coins: 60, exp: 180, points: 10,
    check: (d) => d.todayMaxSingle >= 45,
  },
  {
    id: 'total_60',
    name: '一小时达成',
    desc: '今日累计专注 60 分钟',
    difficulty: 'medium',
    coins: 50, exp: 150, points: 10,
    check: (d) => d.todayMinutes >= 60,
  },
  {
    id: 'morning',
    name: '早鸟',
    desc: '上午 6-9 点完成一次专注',
    difficulty: 'medium',
    coins: 50, exp: 150, points: 10,
    check: (d) => d.todayHours.some((h) => h >= 6 && h < 9),
  },
  {
    id: 'night',
    name: '夜猫子',
    desc: '晚上 22-24 点完成一次专注',
    difficulty: 'medium',
    coins: 50, exp: 150, points: 10,
    check: (d) => d.todayHours.some((h) => h >= 22 || h === 0),
  },
  {
    id: 'streak_2',
    name: '连击',
    desc: '今天连续完成 2 次专注（间隔 < 30 分钟）',
    difficulty: 'medium',
    coins: 60, exp: 180, points: 10,
    check: (d) => d.streak2 === true,
  },

  // 困难（15 分）
  {
    id: 'focus_5',
    name: '五连专注',
    desc: '完成 5 次专注',
    difficulty: 'hard',
    coins: 120, exp: 300, points: 15,
    check: (d) => d.todaySessions >= 5,
  },
  {
    id: 'single_60',
    name: '一小时大师',
    desc: '单次专注满 60 分钟',
    difficulty: 'hard',
    coins: 100, exp: 250, points: 15,
    check: (d) => d.todayMaxSingle >= 60,
  },
  {
    id: 'total_120',
    name: '两小时达成',
    desc: '今日累计专注 120 分钟',
    difficulty: 'hard',
    coins: 120, exp: 280, points: 15,
    check: (d) => d.todayMinutes >= 120,
  },
  {
    id: 'all_modes',
    name: '全能专注',
    desc: '今天用 3 种模式各完成一次',
    difficulty: 'hard',
    coins: 150, exp: 350, points: 15,
    check: (d) =>
      d.todayModes.includes('pomodoro') &&
      d.todayModes.includes('countdown') &&
      d.todayModes.includes('stopwatch'),
  },
];

// ---------- 传说建筑物（按月份轮换）----------
export const LEGENDARY_BUILDINGS = [
  { month: 1,  id: 'dragon_castle', name: '龙之城堡',  emoji: '🐉', img: null, rarity: 'legendary' },
  { month: 2,  id: 'phoenix_tower', name: '凤凰之塔',  emoji: '🦅', img: null, rarity: 'legendary' },
  { month: 3,  id: 'sakura_shrine', name: '樱花神社',  emoji: '🌸', img: null, rarity: 'legendary' },
  { month: 4,  id: 'jade_temple',   name: '翡翠神殿',  emoji: '🏛️', img: null, rarity: 'legendary' },
  { month: 5,  id: 'star_palace',   name: '流星圣殿',  emoji: '⭐', img: null, rarity: 'legendary' },
  { month: 6,  id: 'dragon_palace', name: '深海龙宫',  emoji: '🌊', img: null, rarity: 'legendary' },
  { month: 7,  id: 'flame_forge',   name: '炎魔熔炉',  emoji: '🔥', img: null, rarity: 'legendary' },
  { month: 8,  id: 'ice_palace',    name: '极光冰殿',  emoji: '❄️', img: null, rarity: 'legendary' },
  { month: 9,  id: 'golden_garden', name: '黄金花园',  emoji: '🏆', img: null, rarity: 'legendary' },
  { month: 10, id: 'undead_castle', name: '亡灵城堡',  emoji: '💀', img: null, rarity: 'legendary' },
  { month: 11, id: 'sky_city',      name: '天空之城',  emoji: '☁️', img: null, rarity: 'legendary' },
  { month: 12, id: 'bell_tower',    name: '新年钟楼',  emoji: '🎄', img: null, rarity: 'legendary' },
];

// 积分上限
export const POINTS_LIMIT = 600;

// ---------- 工具函数 ----------

// 今天的日期字符串 YYYY-MM-DD
export function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 这个月的字符串 YYYY-MM
export function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// 当前的传说建筑物（按月份）
export function getCurrentLegendary() {
  const month = new Date().getMonth() + 1; // 1-12
  return LEGENDARY_BUILDINGS.find((b) => b.month === month) || LEGENDARY_BUILDINGS[0];
}

// 随机抽 N 个任务（不重复）
export function pickRandomTasks(count = 3) {
  const pool = [...TASK_POOL];
  const picked = [];
  // 保证至少 1 个简单 + 1 个中等
  const easy = pool.filter((t) => t.difficulty === 'easy');
  const medium = pool.filter((t) => t.difficulty === 'medium');
  const hard = pool.filter((t) => t.difficulty === 'hard');

  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (count >= 3) {
    picked.push(pickOne(easy));
    picked.push(pickOne(medium));
    picked.push(pickOne(hard));
    // 剩余的随机补
    for (let i = 3; i < count; i++) {
      const remaining = pool.filter((t) => !picked.includes(t));
      if (remaining.length > 0) picked.push(pickOne(remaining));
    }
  } else {
    // 简单随机
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
  }

  return picked;
}

// 生成今天的任务数据
export function generateTodayTasks() {
  const tasks = pickRandomTasks(3).map((t) => ({
    id: t.id,
    done: false,
    claimed: false,
  }));

  return {
    date: getTodayKey(),
    tasks,
    // 追踪字段
    todayMinutes: 0,
    todaySessions: 0,
    todayMaxSingle: 0,
    todayModes: [],
    todayHours: [],
    lastFocusEndTime: null,
    streak2: false,
  };
}

// 根据 id 找任务定义
export function getTaskDef(id) {
  return TASK_POOL.find((t) => t.id === id);
}

// 检查任务是否完成
export function checkTaskDone(taskId, dailyData) {
  const def = getTaskDef(taskId);
  if (!def) return false;
  return def.check(dailyData);
}