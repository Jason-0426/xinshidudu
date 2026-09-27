// ============================================================
// 活动系统
// ============================================================

export const ACTIVITIES = [

    // ============================================================
  // 🎉 开服庆典（限时活动）
  // ============================================================
  {
    id: 'launch_celebration_2026',
    name: '开服庆典',
    emoji: '🎉',
    desc: '欢迎来到信誓读读！完成任务领取开服限定奖励',
    startAt: '2026-09-27',
    endAt: '2026-10-11',
    theme: 'launch',

    tasks: [
      {
        id: 'launch_1',
        name: '完成 1 次专注',
        type: 'sessions',
        target: 1,
        reward: 100,
      },
      {
        id: 'launch_2',
        name: '累计专注 60 分钟',
        type: 'minutes',
        target: 60,
        reward: 300,
      },
      {
        id: 'launch_3',
        name: '累计专注 180 分钟',
        type: 'minutes',
        target: 180,
        reward: 800,
      },
    ],

    allDoneReward: {
      building: {
        id: 'launch-tower',
        name: '开服纪念塔',
        emoji: '🏆',
      },
      coins: 1500,
      exp: 3000,
    },
  },
  
  // ============================================================
  // 🎃 万圣节惊魂
  // ============================================================
  {
    id: 'halloween_2026',
    name: '万圣节惊魂',
    emoji: '🎃',
    desc: '万圣夜降临，完成任务解锁南瓜屋',
    startAt: '2026-10-20',
    endAt: '2026-11-05',
    theme: 'halloween',

    tasks: [
      {
        id: 'halloween_1',
        name: '完成 3 次专注',
        type: 'sessions',
        target: 3,
        reward: 100,
      },
      {
        id: 'halloween_2',
        name: '累计专注 60 分钟',
        type: 'minutes',
        target: 60,
        reward: 200,
      },
      {
        id: 'halloween_3',
        name: '累计专注 180 分钟',
        type: 'minutes',
        target: 180,
        reward: 500,
      },
    ],

    allDoneReward: {
      building: {
        id: 'pumpkin-house',
        name: '南瓜屋',
        emoji: '🎃',
      },
      coins: 500,
      exp: 1000,
    },
  },

  // ============================================================
  // 🎄 圣诞奇缘
  // ============================================================
  {
    id: 'christmas_2026',
    name: '圣诞奇缘',
    emoji: '🎄',
    desc: '雪花飘落，完成任务解锁圣诞树',
    startAt: '2026-12-15',
    endAt: '2027-01-05',
    theme: 'christmas',

    tasks: [
      {
        id: 'christmas_1',
        name: '完成 5 次专注',
        type: 'sessions',
        target: 5,
        reward: 150,
      },
      {
        id: 'christmas_2',
        name: '累计专注 100 分钟',
        type: 'minutes',
        target: 100,
        reward: 300,
      },
      {
        id: 'christmas_3',
        name: '累计专注 300 分钟',
        type: 'minutes',
        target: 300,
        reward: 800,
      },
    ],

    allDoneReward: {
      building: {
        id: 'christmas-tree',
        name: '圣诞树',
        emoji: '🎄',
      },
      coins: 800,
      exp: 1500,
    },
  },

  // ============================================================
  // 🧧 新春庙会
  // ============================================================
  {
    id: 'spring_festival_2027',
    name: '新春庙会',
    emoji: '🧧',
    desc: '新年新气象，完成任务解锁灯笼塔',
    startAt: '2027-01-25',
    endAt: '2027-02-15',
    theme: 'spring',

    tasks: [
      {
        id: 'spring_1',
        name: '完成 7 次专注',
        type: 'sessions',
        target: 7,
        reward: 200,
      },
      {
        id: 'spring_2',
        name: '累计专注 150 分钟',
        type: 'minutes',
        target: 150,
        reward: 400,
      },
      {
        id: 'spring_3',
        name: '累计专注 400 分钟',
        type: 'minutes',
        target: 400,
        reward: 1000,
      },
    ],

    allDoneReward: {
      building: {
        id: 'lantern-tower',
        name: '灯笼塔',
        emoji: '🏮',
      },
      coins: 1000,
      exp: 2000,
    },
  },

  // ============================================================
  // 🎆 跨年之夜
  // ============================================================
  {
    id: 'new_year_2027',
    name: '跨年之夜',
    emoji: '🎆',
    desc: '辞旧迎新，完成任务解锁烟花塔',
    startAt: '2026-12-28',
    endAt: '2027-01-08',
    theme: 'new_year',

    tasks: [
      {
        id: 'newyear_1',
        name: '完成 3 次专注',
        type: 'sessions',
        target: 3,
        reward: 150,
      },
      {
        id: 'newyear_2',
        name: '累计专注 90 分钟',
        type: 'minutes',
        target: 90,
        reward: 300,
      },
      {
        id: 'newyear_3',
        name: '累计专注 200 分钟',
        type: 'minutes',
        target: 200,
        reward: 600,
      },
    ],

    allDoneReward: {
      building: {
        id: 'firework-tower',
        name: '烟花塔',
        emoji: '🎆',
      },
      coins: 600,
      exp: 1200,
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

export function getUserActivityState(activity, profile) {
  const activities = profile.activities || {};
  return activities[activity.id] || {
    claimedTasks: {},
    allDoneClaimed: false,
  };
}

export function getDefaultActivityState() {
  return {
    claimedTasks: {},
    allDoneClaimed: false,
  };
}