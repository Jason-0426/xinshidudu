// ============================================================
// 活动系统
// ============================================================

// ============================================================
// 活动定义（硬编码）
// 加新活动：复制一个模板改就行
// 时间格式：'YYYY-MM-DD'
// 时间到了自动开启，过期自动消失
// ============================================================
export const ACTIVITIES = [
  // ---------- 春节挑战 ----------
  {
    id: 'spring_festival_2027',
    name: '春节挑战',
    emoji: '🧧',
    desc: '春节限定，完成任务解锁灯笼塔',
    startAt: '2027-01-25',
    endAt: '2027-02-15',

    tasks: [
      {
        id: 'focus_3',
        name: '完成 3 次专注',
        type: 'sessions',
        target: 3,
        reward: 100,
      },
      {
        id: 'total_60',
        name: '累计专注 60 分钟',
        type: 'minutes',
        target: 60,
        reward: 200,
      },
      {
        id: 'total_180',
        name: '累计专注 180 分钟',
        type: 'minutes',
        target: 180,
        reward: 500,
      },
    ],

    allDoneReward: {
      building: {
        id: 'lantern_tower',
        name: '灯笼塔',
        emoji: '🏮',
      },
      coins: 500,
      exp: 1000,
    },
  },

  // ---------- 万圣节 ----------
  {
    id: 'halloween_2026',
    name: '万圣节挑战',
    emoji: '🎃',
    desc: '万圣节限定，完成任务解锁南瓜屋',
    startAt: '2026-10-20',
    endAt: '2026-11-05',
    tasks: [
      { id: 'focus_5',   name: '完成 5 次专注',      type: 'sessions', target: 5,   reward: 150 },
      { id: 'total_90',  name: '累计专注 90 分钟',   type: 'minutes',  target: 90,  reward: 300 },
      { id: 'total_240', name: '累计专注 240 分钟',  type: 'minutes',  target: 240, reward: 600 },
    ],
    allDoneReward: {
      building: { id: 'pumpkin_house', name: '南瓜屋', emoji: '🎃' },
      coins: 600,
      exp: 1200,
    },
  },

  // ---------- 圣诞节 ----------
  {
    id: 'christmas_2026',
    name: '圣诞挑战',
    emoji: '🎄',
    desc: '圣诞限定，完成任务解锁圣诞树',
    startAt: '2026-12-15',
    endAt: '2027-01-05',
    tasks: [
      { id: 'focus_7',   name: '完成 7 次专注',      type: 'sessions', target: 7,   reward: 200 },
      { id: 'total_120', name: '累计专注 120 分钟',  type: 'minutes',  target: 120, reward: 400 },
      { id: 'total_300', name: '累计专注 300 分钟',  type: 'minutes',  target: 300, reward: 800 },
    ],
    allDoneReward: {
      building: { id: 'christmas_tree', name: '圣诞树', emoji: '🎄' },
      coins: 800,
      exp: 1500,
    },
  },

  // ---------- 新年跨年 ----------
  {
    id: 'new_year_2027',
    name: '跨年挑战',
    emoji: '🎆',
    desc: '新年限定，完成任务解锁烟花塔',
    startAt: '2026-12-28',
    endAt: '2027-01-08',
    tasks: [
      { id: 'focus_5',    name: '完成 5 次专注',      type: 'sessions', target: 5,   reward: 200 },
      { id: 'total_100',  name: '累计专注 100 分钟',  type: 'minutes',  target: 100, reward: 400 },
      { id: 'total_300',  name: '累计专注 300 分钟',  type: 'minutes',  target: 300, reward: 900 },
    ],
    allDoneReward: {
      building: { id: 'firework_tower', name: '烟花塔', emoji: '🎆' },
      coins: 1000,
      exp: 2000,
    },
  },
];

// ============================================================
// 工具函数
// ============================================================

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isActivityLive(activity) {
  const today = getTodayKey();
  return today >= activity.startAt && today <= activity.endAt;
}

export function isActivityEnded(activity) {
  const today = getTodayKey();
  return today > activity.endAt;
}

export function isActivityUpcoming(activity) {
  const today = getTodayKey();
  return today < activity.startAt;
}

export function getLiveActivities() {
  return ACTIVITIES.filter((a) => isActivityLive(a));
}

// ============================================================
// 计算活动进度
// ============================================================
export function computeActivityProgress(activity, profile) {
  const records = profile.focusRecords || {};

  let activityMinutes = 0;

  Object.entries(records).forEach(([dateKey, minutes]) => {
    if (dateKey >= activity.startAt && dateKey <= activity.endAt) {
      activityMinutes += minutes;
    }
  });

  const timestamps = profile.sessionTimestamps || [];
  const startMs = new Date(activity.startAt + 'T00:00:00').getTime();
  const endMs = new Date(activity.endAt + 'T23:59:59').getTime();

  const activitySessions = timestamps.filter(
    (t) => t >= startMs && t <= endMs
  ).length;

  const taskProgress = {};
  activity.tasks.forEach((task) => {
    let current = 0;
    if (task.type === 'sessions') {
      current = activitySessions;
    } else if (task.type === 'minutes') {
      current = activityMinutes;
    }

    const done = current >= task.target;
    const pct = Math.min(100, (current / task.target) * 100);

    taskProgress[task.id] = {
      current,
      target: task.target,
      done,
      pct,
    };
  });

  const allTasksDone = activity.tasks.every((t) => taskProgress[t.id].done);
  const doneCount = activity.tasks.filter((t) => taskProgress[t.id].done).length;

  return {
    taskProgress,
    allTasksDone,
    doneCount,
    totalTasks: activity.tasks.length,
    activityMinutes,
    activitySessions,
  };
}

// ============================================================
// 获取用户的某个活动的状态
// ============================================================
export function getUserActivityState(activity, profile) {
  const activities = profile.activities || {};
  return activities[activity.id] || {
    claimedTasks: {},
    allDoneClaimed: false,
  };
}

// ============================================================
// 默认的活动状态
// ============================================================
export function getDefaultActivityState() {
  return {
    claimedTasks: {},
    allDoneClaimed: false,
  };
}