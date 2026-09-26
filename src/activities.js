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
  // ---------- 示例：春节挑战 ----------
  {
    id: 'spring_festival_2026',
    name: '春节挑战',
    emoji: '🧧',
    desc: '春节限定，完成任务解锁灯笼塔',
    startAt: '2026-09-01',
endAt: '2026-10-31',

    // 活动任务（按顺序解锁展示）
    tasks: [
      {
        id: 'focus_3',
        name: '完成 3 次专注',
        type: 'sessions',  // sessions | minutes
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

    // 全部完成奖励
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

  // ---------- 示例：万圣节 ----------
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

  // ---------- 示例：圣诞节 ----------
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
];

// ============================================================
// 工具函数
// ============================================================

// 今天日期 key（YYYY-MM-DD）
function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 判断活动当前是否在进行中
export function isActivityLive(activity) {
  const today = getTodayKey();
  return today >= activity.startAt && today <= activity.endAt;
}

// 判断活动是否已结束
export function isActivityEnded(activity) {
  const today = getTodayKey();
  return today > activity.endAt;
}

// 判断活动是否还未开始
export function isActivityUpcoming(activity) {
  const today = getTodayKey();
  return today < activity.startAt;
}

// 获取当前进行中的活动列表
export function getLiveActivities() {
  return ACTIVITIES.filter((a) => isActivityLive(a));
}

// ============================================================
// 计算活动进度
// ============================================================
export function computeActivityProgress(activity, profile) {
  const records = profile.focusRecords || {};

  // 活动期间内的专注记录
  const activityRecords = {};
  let activitySessions = 0;
  let activityMinutes = 0;

  Object.entries(records).forEach(([dateKey, minutes]) => {
    if (dateKey >= activity.startAt && dateKey <= activity.endAt) {
      activityRecords[dateKey] = minutes;
      activityMinutes += minutes;
    }
  });

  // sessions 需要另外统计
  // 从 profile 里读（用户每完成一次专注会 +1 session）
  // 但 profile.totalSessions 是累计的，无法按日期过滤
  // 用另一种方法：从 dailyTasks 或者自定义 session 记录里统计
  // 第一版：粗略用活动期间天数估算
  // 更好的做法：在 finishFocus 时记录时间戳

  // 先简化：假设每次专注至少 1 分钟，sessions ≈ 活动期间内的有效天数
  // 更准确：从 profile 里加一个 sessionsLog 字段（数组，记录每次专注的时间戳）
  // 这里我们先按 minutes 来算，sessions 类型用另一个方式

  // 用 profile.sessionTimestamps（在 finishFocus 时 push）
  const timestamps = profile.sessionTimestamps || [];
  const startMs = new Date(activity.startAt).getTime();
  const endMs = new Date(activity.endAt + 'T23:59:59').getTime();

  activitySessions = timestamps.filter(
    (t) => t >= startMs && t <= endMs
  ).length;

  // 计算每个任务的进度
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

  // 是否全部完成
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
    claimedTasks: {},   // { taskId: true }
    allDoneClaimed: false,
  };
}

// ============================================================
// 默认的活动状态（用户首次参与时初始化）
// ============================================================
export function getDefaultActivityState() {
  return {
    claimedTasks: {},
    allDoneClaimed: false,
  };
}