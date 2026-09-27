import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import './index.css';
import {
  BUILDINGS,
  RARITY_LABEL,
  RARITY_COIN,
  DEFAULT_BUILDING,
} from './buildings';
import CastlePage from './CastlePage';
import ShopPage from './ShopPage';
import SettingsPage from './SettingsPage';
import AboutPage from './AboutPage';
import ProfilePage from './ProfilePage';
import LoginPage from './LoginPage';
import DevPanel from './DevPanel';
import { supabase } from './supabase';
import AvatarPicker from './AvatarPicker';
import { DEFAULT_AVATAR, getAvatarDisplay } from './avatarOptions';
import AchievementUnlockModal from './AchievementUnlockModal';
import { checkAchievements } from './achievements';
import TasksPage from './TasksPage';
import {
  generateTodayTasks,
  getTodayKey,
  getMonthKey,
  checkTaskDone,
} from './dailyTasks';
import VipPage from './VipPage';
import { DEFAULT_VIP, isVip, VIP_BONUS } from './vipConfig';
import ActivitiesPage from './ActivitiesPage';
import { getLiveActivities } from './activities';

// ---------- 仓库 ----------
const EMPTY_INVENTORY = BUILDINGS.reduce((acc, b) => {
  acc[b.id] = 0;
  return acc;
}, {});

const INITIAL_INVENTORY = { ...EMPTY_INVENTORY, house: 1 };

// ---------- 天气 ----------
const WEATHER_MAP = {
  clear: { icon: '☀️', name: '晴空万里' },
  rain:  { icon: '🌧️', name: '暴风雨' },
  snow:  { icon: '❄️', name: '寒冬大雪' },
};

// ---------- 白噪音 ----------
const SOUNDS = [
  { id: 'rain',     name: '雨声', emoji: '🌧️', file: 'sounds/rain.mp3' },
  { id: 'campfire', name: '篝火', emoji: '🔥', file: 'sounds/campfire.mp3' },
  { id: 'wind',     name: '风声', emoji: '💨', file: 'sounds/wind.mp3' },
  { id: 'ocean',    name: '海浪', emoji: '🌊', file: 'sounds/ocean.mp3' },
];

// ---------- 资源路径 ----------
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

// ---------- 辅助函数 ----------
function computeLevel(exp) {
  return Math.min(10, Math.floor((exp || 0) / 500) + 1);
}

function computeTitle(level) {
  const titles = [
    '侍从 I', '侍从 II', '侍从 III', '骑士', '男爵',
    '子爵', '伯爵', '侯爵', '公爵', '国王',
  ];
  return titles[level - 1] || '侍从 I';
}

function computeDays(joinedAt) {
  if (!joinedAt) return 1;
  const joined = new Date(joinedAt);
  joined.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today - joined) / 86400000) + 1;
}

function computeStreak(profile) {
  const records = profile.focusRecords || {};
  const dateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);
  while (true) {
    const k = dateKey(cursor);
    if (records[k] && records[k] > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ============================================================
// 天气粒子层
// ============================================================
const WeatherLayer = memo(function WeatherLayer({ type }) {
  const particles = useMemo(() => {
    if (type === 'clear') return [];
    const count = type === 'rain' ? 60 : 40;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: type === 'rain' ? 0.6 + Math.random() * 0.4 : 4 + Math.random() * 4,
      opacity: 0.4 + Math.random() * 0.5,
    }));
  }, [type]);

  if (type === 'clear') return null;

  return (
    <div className={`weather-layer weather-${type}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={type === 'rain' ? 'raindrop' : 'snowflake'}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
});

// ============================================================
// 专注页面
// ============================================================
const FocusView = memo(function FocusView({
  focusMode,
  duration,
  selectedBuilding,
  weather,
  setWeather,
  onFinish,
  onStop,
  sound,
  setSound,
  audioOn,
  toggleAudio,
  placed,
}) {
  // 从 localStorage 恢复初始状态
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem('xinshidudu_focus');
      if (!saved) return { timeLeft: duration * 60, elapsed: 0 };

      const state = JSON.parse(saved);
      const now = Date.now();
      const totalElapsedSec = Math.floor(
        (now - state.startedAt - state.totalPausedMs) / 1000
      );

      if (state.mode === 'stopwatch') {
        return {
          timeLeft: duration * 60,
          elapsed: Math.max(0, Math.min(totalElapsedSec, 3 * 60 * 60)),
        };
      } else {
        const totalSec = state.duration * 60;
        const left = Math.max(0, totalSec - totalElapsedSec);
        return {
          timeLeft: left,
          elapsed: totalElapsedSec,
        };
      }
    } catch {
      return { timeLeft: duration * 60, elapsed: 0 };
    }
  };

  const initial = getInitialState();
  const [timeLeft, setTimeLeft] = useState(initial.timeLeft);
  const [elapsed, setElapsed] = useState(initial.elapsed);
  const [isPaused, setIsPaused] = useState(false);
  const [weatherMenuOpen, setWeatherMenuOpen] = useState(false);
  const [soundMenuOpen, setSoundMenuOpen] = useState(false);

  // 真实总时长
  const [realDuration, setRealDuration] = useState(() => {
    try {
      const saved = localStorage.getItem('xinshidudu_focus');
      if (saved) {
        const state = JSON.parse(saved);
        return state.duration || duration;
      }
    } catch {}
    return duration;
  });

  // 切回前台时，重新计算剩余时间
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isPaused) {
        try {
          const saved = localStorage.getItem('xinshidudu_focus');
          if (saved) {
            const state = JSON.parse(saved);
            const now = Date.now();
            const totalElapsedSec = Math.floor(
              (now - state.startedAt - state.totalPausedMs) / 1000
            );

            if (state.mode === 'stopwatch') {
              setElapsed(Math.min(totalElapsedSec, 3 * 60 * 60));
            } else {
              const totalSec = state.duration * 60;
              const left = Math.max(0, totalSec - totalElapsedSec);
              setTimeLeft(left);
            }
          }
        } catch (e) {
          console.error('visibilitychange 恢复失败：', e);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused]);

  // 兜底：每 5 秒检查一次时间
  useEffect(() => {
    if (isPaused) return;

    const check = () => {
      try {
        const saved = localStorage.getItem('xinshidudu_focus');
        if (!saved) return;
        const state = JSON.parse(saved);
        const now = Date.now();
        const totalElapsedSec = Math.floor(
          (now - state.startedAt - state.totalPausedMs) / 1000
        );

        if (state.mode !== 'stopwatch') {
          const totalSec = state.duration * 60;
          const left = Math.max(0, totalSec - totalElapsedSec);
          setTimeLeft((prev) => {
            if (Math.abs(prev - left) > 3) return left;
            return prev;
          });
        }
      } catch {}
    };

    const timer = setInterval(check, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // 计时器
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (focusMode === 'stopwatch') {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= 3 * 60 * 60) {
            clearInterval(timer);
            setTimeout(() => onFinish(Math.floor(next / 60)), 0);
            return 3 * 60 * 60;
          }
          return next;
        });
      } else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimeout(() => onFinish(duration), 0);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, focusMode, duration, onFinish]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const displayTime = focusMode === 'stopwatch' ? formatTime(elapsed) : formatTime(timeLeft);

  const progressPercent =
    focusMode === 'stopwatch'
      ? Math.min((elapsed / (3 * 60 * 60)) * 100, 100)
      : Math.min(((realDuration * 60 - timeLeft) / (realDuration * 60)) * 100, 100);

  const handleManualFinish = () => {
    const minutes = Math.floor(elapsed / 60);
    if (minutes < 1) {
      onStop();
      return;
    }
    onFinish(minutes);
  };

  return (
    <div className="focus-view">
      <WeatherLayer type={weather} />

      <div className="focus-view-top">
        <div style={{ position: 'relative' }}>
          <button
            className="glass-btn weather-btn"
            onClick={() => { setWeatherMenuOpen((v) => !v); setSoundMenuOpen(false); }}
          >
            <span>{WEATHER_MAP[weather].icon}</span>
            <span>{WEATHER_MAP[weather].name}</span>
            <span style={{ fontSize: 10 }}>▾</span>
          </button>

          {weatherMenuOpen && (
            <div className="glass weather-menu">
              {Object.entries(WEATHER_MAP).map(([key, w]) => (
                <button
                  key={key}
                  className="weather-item"
                  onClick={() => { setWeather(key); setWeatherMenuOpen(false); }}
                >
                  <span>{w.icon}</span>
                  <span>{w.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <button
              className="glass-btn sound-btn"
              onClick={() => { setSoundMenuOpen((v) => !v); setWeatherMenuOpen(false); }}
            >
              <span>{sound.emoji}</span>
              <span>{sound.name}</span>
              <span style={{ fontSize: 10 }}>▾</span>
            </button>

            {soundMenuOpen && (
              <div className="glass weather-menu sound-menu">
                {SOUNDS.map((s) => (
                  <button
                    key={s.id}
                    className={`weather-item ${sound.id === s.id ? 'active' : ''}`}
                    onClick={() => { setSound(s); setSoundMenuOpen(false); }}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="glass-btn audio-focus-btn" onClick={toggleAudio}>
            {audioOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      <div className="focus-castle-area">
        <div className="focus-focus-display">
          <div className="focus-building-showcase">
            <img
              src={selectedBuilding.imgs[0]}
              alt={selectedBuilding.name}
              className="focus-building-showcase-img"
            />
            <div className="focus-building-showcase-name">
              {selectedBuilding.name}
            </div>
          </div>

          <div className="focus-progress">
            <div className="focus-progress-bar">
              <div
                className="focus-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="focus-progress-text">
              {focusMode === 'stopwatch'
                ? `已专注 ${Math.floor(elapsed / 60)} 分钟`
                : `已完成 ${Math.round(progressPercent)}%`}
            </div>
          </div>
        </div>
      </div>

      <div className="focus-view-bottom">
        <div className="glass timer-panel">
          <div className="timer-status">
            <span className="timer-dot"></span>
            {focusMode === 'pomodoro' && '番茄钟 · 第 1 轮'}
            {focusMode === 'countdown' && '领地建造中'}
            {focusMode === 'stopwatch' && '正计时进行中'}
          </div>
          <div className="timer-digits">{displayTime}</div>
          <div className="timer-reward">
            完成后获得：{selectedBuilding.name}
          </div>
        </div>

        <div className="focus-actions">
          <button className="pause-btn" onClick={() => setIsPaused((v) => !v)}>
            {isPaused ? '▶ 继续' : '⏸ 暂停'}
          </button>

          {focusMode === 'stopwatch' ? (
            <button className="giveup-btn" onClick={handleManualFinish}>
              ✓ 结束并结算
            </button>
          ) : (
            <button className="giveup-btn" onClick={onStop}>
              ✕ 放弃
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ============================================================
// 主 App
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const syncTimerRef = useRef(null);
  const profileLoadedRef = useRef(false);

  const [isDev, setIsDev] = useState(false);
  const [devPanelOpen, setDevPanelOpen] = useState(false);

  const [view, setView] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [weather, setWeather] = useState('clear');

  const [focusMode, setFocusMode] = useState('countdown');
  const [duration, setDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  const [customModal, setCustomModal] = useState(null);
  const [customValue, setCustomValue] = useState('');

  const isCustomDuration = ![15, 25, 45, 60].includes(duration);
  const isCustomBreak    = ![5, 10, 15].includes(breakDuration);

  const confirmCustom = () => {
    const n = parseInt(customValue, 10);
    if (isNaN(n) || n < 1) {
      alert('请输入大于 0 的数字');
      return;
    }
    if (customModal === 'work') setDuration(n);
    if (customModal === 'break') setBreakDuration(n);
    setCustomModal(null);
  };

  const [audioOn, setAudioOn] = useState(false);
  const [sound, setSound] = useState(SOUNDS[0]);
  const audioRef = useRef(null);

  const [gold, setGold] = useState(328);
  const [selectedBuilding, setSelectedBuilding] = useState(DEFAULT_BUILDING);
  const [buildingPickerOpen, setBuildingPickerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarIsFirstTime, setAvatarIsFirstTime] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [vipOpen, setVipOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);

  const [profile, setProfile] = useState({
    avatar: { ...DEFAULT_AVATAR },
    avatarChosen: false,
    name: '',
    joinedAt: (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })(),
    totalSessions: 0,
    exp: 0,
    focusRecords: {},
    achievements: {},
    dailyTasks: null,
    points: 0,
    pointsMonth: '',
    unlockedLegendary: [],
    vip: { ...DEFAULT_VIP },
    activities: {},
    sessionTimestamps: [],
  });

  const [homeSoundMenuOpen, setHomeSoundMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultData, setResultData] = useState({ minutes: 0, coins: 0 });

  const [rewardOpen, setRewardOpen] = useState(false);
  const [pendingCoins, setPendingCoins] = useState(0);
  const [pendingMinutes, setPendingMinutes] = useState(0);

  const [castleOpen, setCastleOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const [unlocked, setUnlocked]   = useState(['house']);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [placed, setPlaced]       = useState([]);

  // ---------- 音频管理 ----------
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = asset(sound.file);
      audioRef.current.load();
      if (wasPlaying && audioOn) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [sound]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(asset(sound.file));
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    const audio = audioRef.current;
    if (audioOn) {
      audio.play().catch((err) => console.log('播放失败：', err));
    } else {
      audio.pause();
    }
  }, [audioOn]);

  // ---------- 检查登录状态 ----------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        loadUserData(data.session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setDataLoaded(false);
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 检查是否有未完成的专注
useEffect(() => {
  if (!dataLoaded) return;  // 等数据加载完再检查

  try {
    const saved = localStorage.getItem('xinshidudu_focus');
    if (saved) {
      const state = JSON.parse(saved);
      
      // 计算已经过了多久
      const elapsed = Date.now() - state.startedAt - state.totalPausedMs;
      
      // 如果不到 3 小时 → 恢复专注页
      if (elapsed < 3 * 60 * 60 * 1000) {
        setView('focus');
      } else {
        // 超过 3 小时 → 清除
        localStorage.removeItem('xinshidudu_focus');
      }
    }
  } catch (e) {
    console.error('恢复专注失败：', e);
  }
}, [dataLoaded]);

  // ---------- 自动同步到 Supabase ----------
  useEffect(() => {
    if (!user || !dataLoaded) return;
    if (!profileLoadedRef.current) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('user_data')
        .update({ gold, inventory, placed, unlocked, profile })
        .eq('user_id', user.id);

      if (error) console.warn('同步失败：', error);
    }, 800);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dataLoaded, gold, inventory, placed, unlocked, profile]);

  // ---------- 每日任务刷新 + 积分月重置 ----------
  useEffect(() => {
    if (!dataLoaded) return;

    const today = getTodayKey();
    const thisMonth = getMonthKey();

    setProfile((p) => {
      let updated = { ...p };
      let changed = false;

      if (!p.dailyTasks || p.dailyTasks.date !== today) {
        updated.dailyTasks = generateTodayTasks();
        changed = true;
      }

      if (p.pointsMonth !== thisMonth) {
        updated.points = 0;
        updated.pointsMonth = thisMonth;
        changed = true;
      }

      return changed ? updated : p;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  // ---------- 检查受损建筑是否超过 3 天 ----------
  useEffect(() => {
    if (!dataLoaded) return;

    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    setPlaced((prev) => {
      const filtered = prev.filter((p) => {
        if (!p.damaged || !p.damagedAt) return true;
        return now - p.damagedAt < THREE_DAYS;
      });
      return filtered.length === prev.length ? prev : filtered;
    });

    const timer = setInterval(() => {
      const now2 = Date.now();
      setPlaced((prev) => {
        const filtered = prev.filter((p) => {
          if (!p.damaged || !p.damagedAt) return true;
          return now2 - p.damagedAt < THREE_DAYS;
        });
        return filtered.length === prev.length ? prev : filtered;
      });
    }, 60 * 60 * 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  // ---------- 首次进入：未设置名字 → 打开用户资料页 ----------
  useEffect(() => {
    if (dataLoaded && !profile.name) {
      setTimeout(() => setProfileOpen(true), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  // ---------- 设置完名字后 → 首次选择头像 ----------
  useEffect(() => {
    if (dataLoaded && profile.name && profile.avatarChosen === false) {
      setAvatarIsFirstTime(true);
      setTimeout(() => setAvatarPickerOpen(true), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name, profile.avatarChosen, dataLoaded]);

  // ---------- 从 Supabase 加载用户数据 ----------
  async function loadUserData(userId) {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('加载数据失败：', error);
      setAuthLoading(false);
      return;
    }

    if (data) {
      if (typeof data.gold === 'number') setGold(data.gold);
      if (data.inventory) setInventory({ ...EMPTY_INVENTORY, ...data.inventory });
      if (data.placed) setPlaced(data.placed);
      if (data.unlocked) setUnlocked(data.unlocked);
      if (data.profile && Object.keys(data.profile).length > 0) {
        setProfile((p) => ({ ...p, ...data.profile }));
      }
      if (data.is_dev) setIsDev(true);
      else setIsDev(false);
    } else {
      await supabase.from('user_data').insert({ user_id: userId });
    }

    profileLoadedRef.current = true;
    setDataLoaded(true);
    setAuthLoading(false);
  }

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setAuthLoading(true);
    loadUserData(loggedInUser.id);
  };

  const handleLogout = async () => {
    setDrawerOpen(false);
    setBuildingPickerOpen(false);
    setProfileOpen(false);
    setAvatarPickerOpen(false);
    setResultOpen(false);
    setRewardOpen(false);
    setCastleOpen(false);
    setShopOpen(false);
    setSettingsOpen(false);
    setAboutOpen(false);
    setTasksOpen(false);
    setVipOpen(false);
    setActivitiesOpen(false);
    setCustomModal(null);
    setHomeSoundMenuOpen(false);
    setAchievementQueue([]);
    setActiveMenu(null);

    await supabase.auth.signOut();
    profileLoadedRef.current = false;
    setUser(null);
    setDataLoaded(false);
    setIsDev(false);
    setDevPanelOpen(false);
    setGold(328);
    setInventory(INITIAL_INVENTORY);
    setUnlocked(['house']);
    setPlaced([]);
    setProfile({
      avatar: { ...DEFAULT_AVATAR },
      avatarChosen: false,
      name: '',
      joinedAt: (() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      })(),
      totalSessions: 0,
      exp: 0,
      focusRecords: {},
      achievements: {},
      dailyTasks: null,
      points: 0,
      pointsMonth: '',
      unlockedLegendary: [],
      vip: { ...DEFAULT_VIP },
      activities: {},
      sessionTimestamps: [],
    });
  };

  // ---------- 计算成就检测用的统计数据 ----------
  const computeStatsForAchievements = (extra = {}) => {
    const records = profile.focusRecords || {};
    const keys = Object.keys(records).sort();

    const totalMinutes = keys.reduce((sum, k) => sum + (records[k] || 0), 0);

    let currentStreak = 0;
    let maxStreak = 0;

    if (keys.length > 0) {
      const dateKey = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const firstDate = new Date(keys[0]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = 0;
      const cursor = new Date(firstDate);
      while (cursor <= today) {
        const k = dateKey(cursor);
        if (records[k] && records[k] > 0) {
          streak += 1;
          if (streak > maxStreak) maxStreak = streak;
        } else {
          streak = 0;
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      let cs = 0;
      const back = new Date(today);
      while (true) {
        const k = dateKey(back);
        if (records[k] && records[k] > 0) {
          cs += 1;
          back.setDate(back.getDate() - 1);
        } else {
          break;
        }
      }
      currentStreak = cs;
    }

    const level = Math.min(10, Math.floor((profile.exp || 0) / 500) + 1);

    return {
      totalSessions: profile.totalSessions || 0,
      totalMinutes,
      maxStreak,
      currentStreak,
      level,
      placedCount: placed.length,
      gold,
      hasNightFocus: extra.isNight === true,
      hasLongFocus: extra.isLong === true,
    };
  };

  // ---------- 检测并解锁新成就 ----------
  const checkAndUnlockAchievements = (extra = {}) => {
    const stats = computeStatsForAchievements(extra);
    const unlockedMap = profile.achievements || {};
    const newly = checkAchievements(stats, unlockedMap);

    if (newly.length === 0) return;

    const d = new Date();
    const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const newMap = { ...unlockedMap };
    let totalCoins = 0;
    let totalExp = 0;

    newly.forEach((a) => {
      newMap[a.id] = { unlockedAt: todayKey };
      totalCoins += a.rewardCoins || 0;
      totalExp += a.rewardExp || 0;
    });

    setProfile((p) => ({
      ...p,
      achievements: newMap,
      exp: (p.exp || 0) + totalExp,
    }));

    if (totalCoins > 0) {
      setGold((g) => g + totalCoins);
    }

    setAchievementQueue((q) => [...q, ...newly]);
  };

  const toggleAudio = () => setAudioOn((v) => !v);

  const startFocus = () => {
  // 记录专注开始时间
  const focusState = {
    mode: focusMode,
    duration,
    startedAt: Date.now(),
    pausedAt: null,
    totalPausedMs: 0,
  };
  localStorage.setItem('xinshidudu_focus', JSON.stringify(focusState));
  setView('focus');
};

  const stopFocus = () => {
    localStorage.removeItem('xinshidudu_focus');  // ← 加这行
    if (placed.length > 0) {
      const randomIdx = Math.floor(Math.random() * placed.length);
      setPlaced((prev) =>
        prev.map((p, i) =>
          i === randomIdx
            ? {
                ...p,
                damaged: true,
                damageType: Math.random() < 0.5 ? 'fire' : 'wrench',
                damagedAt: Date.now(),
              }
            : p
        )
      );
    }
    setView('home');
    setAudioOn(false);
  };

  const keepBuilding = () => {
    const id = selectedBuilding.id;
    setInventory((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    setRewardOpen(false);
    setGold((g) => g + pendingCoins);
    setResultData({ minutes: pendingMinutes, coins: pendingCoins });
    setResultOpen(true);
  };

  const convertToCoins = () => {
    const rarity = selectedBuilding.rarity;
    const extraCoins = RARITY_COIN[rarity] || 10;
    setRewardOpen(false);
    setGold((g) => g + pendingCoins + extraCoins);
    setResultData({ minutes: pendingMinutes, coins: pendingCoins + extraCoins });
    setResultOpen(true);
  };

  const finishFocus = (minutes) => {
    localStorage.removeItem('xinshidudu_focus');  // ← 加这行
    const d = new Date();
    const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const hour = d.getHours();
    const now = Date.now();

    setProfile((prev) => {
      const records = { ...(prev.focusRecords || {}) };
      records[todayKey] = (records[todayKey] || 0) + minutes;

      let daily = prev.dailyTasks;
      if (!daily || daily.date !== getTodayKey()) {
        daily = generateTodayTasks();
      }

      const newModes = daily.todayModes.includes(focusMode)
        ? daily.todayModes
        : [...daily.todayModes, focusMode];

      const newHours = [...daily.todayHours, hour];

      const streak2 =
        daily.lastFocusEndTime !== null &&
        now - daily.lastFocusEndTime < 30 * 60 * 1000;

      daily = {
        ...daily,
        todayMinutes: (daily.todayMinutes || 0) + minutes,
        todaySessions: (daily.todaySessions || 0) + 1,
        todayMaxSingle: Math.max(daily.todayMaxSingle || 0, minutes),
        todayModes: newModes,
        todayHours: newHours,
        lastFocusEndTime: now,
        streak2: daily.streak2 || streak2,
      };

      const updatedTasks = daily.tasks.map((t) => {
        if (t.done) return t;
        const isDone = checkTaskDone(t.id, daily);
        return isDone ? { ...t, done: true } : t;
      });

      daily = { ...daily, tasks: updatedTasks };

      const vipActive = isVip(prev);
      const baseExp = minutes * 2;
      const expGain = vipActive
        ? Math.round(baseExp * (1 + VIP_BONUS.exp))
        : baseExp;

      const timestamps = [...(prev.sessionTimestamps || []), now];
      const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
      const trimmedTimestamps = timestamps.filter((t) => t >= oneYearAgo);

      return {
        ...prev,
        focusRecords: records,
        totalSessions: (prev.totalSessions || 0) + 1,
        exp: (prev.exp || 0) + expGain,
        dailyTasks: daily,
        sessionTimestamps: trimmedTimestamps,
      };
    });

    const vipActive = isVip(profile);

    // 基础：分钟数 + 10
    let baseCoins = minutes + 10;

    // 阶梯奖励
    if (minutes >= 60) {
      baseCoins += 50;   // 60 分钟以上额外 +50
    } else if (minutes >= 30) {
      baseCoins += 20;   // 30-59 分钟额外 +20
    }

    const coins = vipActive
      ? Math.round(baseCoins * (1 + VIP_BONUS.coins))
      : baseCoins;

    setPendingCoins(coins);
    setPendingMinutes(minutes);
    setRewardOpen(true);
    setView('home');
    setAudioOn(false);

    setTimeout(() => {
      checkAndUnlockAchievements({
        isNight: hour >= 0 && hour < 4,
        isLong: minutes >= 60,
      });
    }, 500);
  };

  const pickBuilding = (b) => {
    setSelectedBuilding(b);
    setBuildingPickerOpen(false);
  };

  const openProfile = () => {
    setDrawerOpen(false);
    setActiveMenu('profile');
    setTimeout(() => setProfileOpen(true), 200);
  };

  const closeProfile  = () => { setProfileOpen(false);  setActiveMenu(null); };
  const closeCastle   = () => { setCastleOpen(false);   setActiveMenu(null); };
  const closeShop     = () => { setShopOpen(false);     setActiveMenu(null); };
  const closeSettings = () => { setSettingsOpen(false); setActiveMenu(null); };
  const closeAbout    = () => { setAboutOpen(false);    setActiveMenu(null); };

  // 是否有未领取的任务
  const hasUnclaimedTasks = () => {
    const daily = profile.dailyTasks;
    if (!daily || !daily.tasks) return false;
    return daily.tasks.some((t) => t.done && !t.claimed);
  };

  // 是否有可领取的活动奖励
  const hasClaimableActivities = () => {
    const live = getLiveActivities();
    if (live.length === 0) return false;

    const userActivities = profile.activities || {};
    for (const activity of live) {
      const state = userActivities[activity.id];
      if (!state) return true;

      const claimedTasks = state.claimedTasks || {};
      for (const task of activity.tasks) {
        if (!claimedTasks[task.id]) {
          return true;
        }
      }
      if (!state.allDoneClaimed) {
        return true;
      }
    }
    return false;
  };

  const handleDesktopMenu = (key) => {
    setActiveMenu(key);
    if (key === 'profile') openProfile();
    if (key === 'home') { setDrawerOpen(false); setTimeout(() => setCastleOpen(true), 200); }
    if (key === 'shop') { setDrawerOpen(false); setTimeout(() => setShopOpen(true), 200); }
    if (key === 'settings') { setDrawerOpen(false); setTimeout(() => setSettingsOpen(true), 200); }
    if (key === 'about') { setDrawerOpen(false); setTimeout(() => setAboutOpen(true), 200); }
    if (key === 'tasks') { setDrawerOpen(false); setTimeout(() => setTasksOpen(true), 200); }
    if (key === 'vip') { setDrawerOpen(false); setTimeout(() => setVipOpen(true), 200); }
    if (key === 'activities') { setDrawerOpen(false); setTimeout(() => setActivitiesOpen(true), 200); }
  };

  // ---------- 共用：城堡舞台 ----------
  const CastleStage = ({ onClick }) => (
    <div className="castle-stage" onClick={onClick}>
      <img
        src={selectedBuilding.imgs[0]}
        alt={selectedBuilding.name}
        className="castle-img"
      />
      <div className="castle-hint">点击更换建筑</div>
    </div>
  );

  // ---------- 共用：控制面板 ----------
  const ControlPanel = () => (
    <>
      <div className="glass control-card">
        <div className="control-label"><span>⏱</span> 设定专注模式</div>

        <div className="mode-tabs">
          {[
            { key: 'pomodoro', label: '番茄钟' },
            { key: 'countdown', label: '倒计时' },
            { key: 'stopwatch', label: '正计时' },
          ].map((m) => (
            <button
              key={m.key}
              className={`mode-tab ${focusMode === m.key ? 'active' : ''}`}
              onClick={() => setFocusMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {focusMode === 'pomodoro' && (
          <>
            <div className="control-sublabel">工作时长</div>
            <div className="time-options">
              {[15, 25, 45, 60].map((m) => (
                <button key={m} className={`glass-btn time-option ${duration === m ? 'active' : ''}`} onClick={() => setDuration(m)}>
                  {m}分
                </button>
              ))}
              <button className={`glass-btn time-option ${isCustomDuration ? 'active' : ''}`} onClick={() => { setCustomValue(String(duration)); setCustomModal('work'); }}>
                {isCustomDuration ? `${duration}分` : '自定义'}
              </button>
            </div>
            <div className="control-sublabel">休息时长</div>
            <div className="time-options">
              {[5, 10, 15].map((m) => (
                <button key={m} className={`glass-btn time-option ${breakDuration === m ? 'active' : ''}`} onClick={() => setBreakDuration(m)}>
                  {m}分
                </button>
              ))}
              <button className={`glass-btn time-option ${isCustomBreak ? 'active' : ''}`} onClick={() => { setCustomValue(String(breakDuration)); setCustomModal('break'); }}>
                {isCustomBreak ? `${breakDuration}分` : '自定义'}
              </button>
            </div>
          </>
        )}

        {focusMode === 'countdown' && (
          <div className="time-options">
            {[15, 25, 45, 60].map((m) => (
              <button key={m} className={`glass-btn time-option ${duration === m ? 'active' : ''}`} onClick={() => setDuration(m)}>
                {m}分
              </button>
            ))}
            <button className={`glass-btn time-option ${isCustomDuration ? 'active' : ''}`} onClick={() => { setCustomValue(String(duration)); setCustomModal('work'); }}>
              {isCustomDuration ? `${duration}分` : '自定义'}
            </button>
          </div>
        )}

        {focusMode === 'stopwatch' && (
          <div className="stopwatch-hint">从 0 开始计时，随时停止。最长 3 小时</div>
        )}

        <button className="start-btn" onClick={startFocus}>🔨 开启领地建设</button>
      </div>

      <div className="glass audio-quick" style={{ position: 'relative' }}>
        <div className="audio-quick-left">
          <button className="audio-toggle" onClick={toggleAudio}>{audioOn ? '⏸' : '▶'}</button>
          <button className="audio-quick-text" onClick={() => setHomeSoundMenuOpen((v) => !v)}>
            {sound.emoji} {sound.name} ▾
          </button>
        </div>
        <span style={{ color: audioOn ? '#34d399' : '#6b7280', fontSize: 16 }}>{audioOn ? '🔊' : '🔇'}</span>

        {homeSoundMenuOpen && (
          <div className="glass home-sound-menu">
            {SOUNDS.map((s) => (
              <button key={s.id} className={`weather-item ${sound.id === s.id ? 'active' : ''}`} onClick={() => { setSound(s); setHomeSoundMenuOpen(false); }}>
                <span>{s.emoji}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ---------- 加载中 ----------
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner">⏳</div>
        <div className="app-loading-text">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!dataLoaded) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner">⏳</div>
        <div className="app-loading-text">加载你的城堡...</div>
      </div>
    );
  }

  return (
    <>
      {/* ============================================================
          电脑版主页
          ============================================================ */}
      {view === 'home' && (
        <div className="desktop-layout">
          <div className={`desktop-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((v) => !v)}>
              {sidebarCollapsed ? '▶' : '◀'}
            </button>

            {!sidebarCollapsed && (
              <div className="sidebar-profile" onClick={openProfile}>
                <img
                  src={getAvatarDisplay(profile.avatar).src}
                  alt="头像"
                  className="sidebar-profile-avatar"
                />
                <div className="sidebar-profile-info">
                  <div className="sidebar-profile-name">
                    {profile.name || '未设置名字'}
                    {isVip(profile) && <span style={{ marginLeft: 4 }}>👑</span>}
                  </div>
                  <div className="sidebar-profile-sub">
                    Lv.{computeLevel(profile.exp)} · {computeTitle(computeLevel(profile.exp))}
                  </div>
                </div>
              </div>
            )}

            {[
              {
                label: '账号',
                items: [
                  { key: 'profile', icon: '👤', text: '用户资料' },
                ],
              },
              {
                label: '游戏',
                items: [
                  { key: 'tasks',      icon: '📋', text: '每日任务', badge: true },
                  { key: 'activities', icon: '🎉', text: '活动',     badge: true },
                  { key: 'home',       icon: '🏰', text: '我的城堡' },
                  { key: 'shop',       icon: '🛒', text: '建筑商店' },
                  { key: 'vip',        icon: '💎', text: 'VIP 特权' },
                ],
              },
              {
                label: '系统',
                items: [
                  { key: 'settings', icon: '⚙️', text: '偏好设置' },
                  { key: 'about',    icon: '❓', text: '关于' },
                ],
              },
            ].map((group) => (
              <div key={group.label} className="sidebar-group">
                {!sidebarCollapsed && (
                  <div className="sidebar-group-label">{group.label}</div>
                )}
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className={`sidebar-item ${activeMenu === item.key ? 'active' : ''}`}
                    onClick={() => handleDesktopMenu(item.key)}
                    data-tooltip={item.text}
                  >
                    <span className="sidebar-icon">
                      {item.icon}
                      {item.badge && hasUnclaimedTasks() && (
                        <span className="sidebar-badge-dot" />
                      )}
                    </span>
                    {!sidebarCollapsed && <span className="sidebar-text">{item.text}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="desktop-topbar">
            <div className="desktop-topbar-left">
              <img
                src={asset('logo.png')}
                alt="信誓读读"
                className="topbar-logo-img"
              />
              <div className="desktop-brand">信誓读读</div>
              <span className="level-tag">Lv.{computeLevel(profile.exp)}</span>
              <span className="streak-badge">🔥{computeStreak(profile)}</span>
            </div>

            <div className="desktop-topbar-right">
              <div className="glass gold-card">
                <img src={asset('coin.png')} alt="金币" className="gold-icon" />
                <span>{gold}</span>
              </div>
              {isDev && (
                <button className="dev-toggle-btn" onClick={() => setDevPanelOpen(true)} title="开发者面板">🔧</button>
              )}
            </div>
          </div>

          <div className="desktop-center">
            <CastleStage onClick={() => setBuildingPickerOpen(true)} />
            <div className="desktop-controls"><ControlPanel /></div>
          </div>

          <div className="desktop-right">
            <div className="party-panel">
              <div className="stats-panel-title">🎉 派对</div>
              <div className="party-card">
                <div className="party-icon">🎊</div>
                <div className="party-title">和其他骑士一起专注</div>
                <div className="party-desc">创建或加入派对，与好友并肩建造领地</div>
                <button className="party-create-btn" onClick={() => alert('派对功能即将上线，敬请期待！')}>+ 创建派对</button>
              </div>
              <div className="party-hint">
                <span>💡</span>
                <span>派对功能正在开发中，很快与你见面</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          手机版主页
          ============================================================ */}
      {view === 'home' && (
        <div className="app-viewport mobile-only">
          <div className="top-bar">
            <button className="glass-btn menu-btn" onClick={() => setDrawerOpen(true)}>☰</button>
            <div className="glass player-card">
              <img src={asset('logo.png')} alt="信誓读读" className="player-avatar-img" />
              <div>
                <div className="player-name">
                  信誓读读
                  <span className="level-tag">Lv.{computeLevel(profile.exp)}</span>
                  <span className="streak-badge">🔥{computeStreak(profile)}</span>
                </div>
                <div className="player-sub">{computeTitle(computeLevel(profile.exp))}领地</div>
              </div>
            </div>
            <div className="glass gold-card">
              <img src={asset('coin.png')} alt="金币" className="gold-icon" />
              <span>{gold}</span>
            </div>
            {isDev && (
              <button className="dev-toggle-btn mobile" onClick={() => setDevPanelOpen(true)} title="开发者面板">🔧</button>
            )}
          </div>

          <div className="main-area">
            <CastleStage onClick={() => setBuildingPickerOpen(true)} />
          </div>

          <div className="home-controls"><ControlPanel /></div>

          <div className={`drawer-backdrop ${drawerOpen ? 'active' : ''}`} onClick={() => setDrawerOpen(false)} />
          <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
            {/* 用户信息卡 */}
            <div className="drawer-profile clickable" onClick={openProfile}>
              <div className="drawer-avatar">
                <img
                  src={getAvatarDisplay(profile.avatar).src}
                  alt="头像"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div>
                <div className="drawer-name">
                  {profile.name || '未设置名字'}
                  {isVip(profile) && <span style={{ marginLeft: 6 }}>👑</span>}
                </div>
                <div className="drawer-role">
                  Lv.{computeLevel(profile.exp)} · {computeTitle(computeLevel(profile.exp))}
                </div>
                <div className="drawer-days">
                  🗓 已守护领地 {computeDays(profile.joinedAt)} 天
                </div>
              </div>
            </div>

            <nav className="drawer-nav">
              <button className="drawer-nav-item" onClick={openProfile}>👤 用户资料</button>
              <button
                className="drawer-nav-item"
                onClick={() => { setDrawerOpen(false); setTimeout(() => setTasksOpen(true), 200); }}
              >
                📋 每日任务
                {hasUnclaimedTasks() && <span className="drawer-badge-dot" />}
              </button>
              <button
                className="drawer-nav-item"
                onClick={() => { setDrawerOpen(false); setTimeout(() => setActivitiesOpen(true), 200); }}
              >
                🎉 活动
                {hasClaimableActivities() && <span className="drawer-badge-dot" />}
              </button>
              <button className="drawer-nav-item" onClick={() => { setDrawerOpen(false); setTimeout(() => setCastleOpen(true), 200); }}>🏰 我的城堡与成就</button>
              <button className="drawer-nav-item" onClick={() => { setDrawerOpen(false); setTimeout(() => setShopOpen(true), 200); }}>🛒 建筑商店</button>
              <button className="drawer-nav-item" onClick={() => { setDrawerOpen(false); setTimeout(() => setVipOpen(true), 200); }}>💎 VIP 特权</button>
              <button className="drawer-nav-item" onClick={() => { setDrawerOpen(false); setTimeout(() => setSettingsOpen(true), 200); }}>⚙️ 偏好与专注设置</button>
              <button className="drawer-nav-item" onClick={() => { setDrawerOpen(false); setTimeout(() => setAboutOpen(true), 200); }}>❓ 关于信誓读读</button>
            </nav>
            <div className="drawer-footer">
              <span>版本 1.0</span>
              <span>2.5D 引擎已启用</span>
            </div>
          </aside>
        </div>
      )}

      {/* ============================================================
          专注页面
          ============================================================ */}
      {view === 'focus' && (
        <FocusView
          focusMode={focusMode}
          duration={duration}
          selectedBuilding={selectedBuilding}
          weather={weather}
          setWeather={setWeather}
          onFinish={finishFocus}
          onStop={stopFocus}
          sound={sound}
          setSound={setSound}
          audioOn={audioOn}
          toggleAudio={toggleAudio}
          placed={placed}
        />
      )}

      {/* ============================================================
          建筑选择弹窗
          ============================================================ */}
      <div className={`picker-backdrop ${buildingPickerOpen ? 'active' : ''}`} onClick={() => setBuildingPickerOpen(false)} />
      <div className={`picker-modal ${buildingPickerOpen ? 'active' : ''}`}>
        <div className="picker-header">
          <div>
            <div className="picker-title">选择本次建造的建筑</div>
            <div className="picker-sub">专注完成后将获得该建筑</div>
          </div>
          <button className="picker-close" onClick={() => setBuildingPickerOpen(false)}>✕</button>
        </div>
        <div className="picker-list">
          {BUILDINGS.map((b) => {
            const isUnlocked = unlocked.includes(b.id);
            return (
              <button
                key={b.id}
                className={`picker-item ${selectedBuilding.id === b.id ? 'selected' : ''} rarity-${b.rarity} ${!isUnlocked ? 'locked' : ''}`}
                onClick={() => isUnlocked && pickBuilding(b)}
                disabled={!isUnlocked}
              >
                <div className={`picker-thumb rarity-${b.rarity}`}>
                  <img src={b.imgs[0]} alt={b.name} />
                  {!isUnlocked && <div className="lock-badge">🔒</div>}
                </div>
                <div className="picker-name">{b.name}</div>
                <div className={`picker-rarity rarity-${b.rarity}`}>
                  {isUnlocked ? RARITY_LABEL[b.rarity] : '未解锁'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          完成弹窗
          ============================================================ */}
      <div className={`picker-backdrop ${resultOpen ? 'active' : ''}`} onClick={() => setResultOpen(false)} />

      <div className={`reward-modal ${rewardOpen ? 'active' : ''}`}>
        <div className="reward-icon">
          <img src={selectedBuilding.imgs[0]} alt={selectedBuilding.name} />
        </div>
        <div className="reward-title">🎁 获得建筑</div>
        <div className="reward-name">{selectedBuilding.name} ×1</div>
        <div className={`reward-rarity rarity-tag-${selectedBuilding.rarity}`}>{RARITY_LABEL[selectedBuilding.rarity]}</div>
        <div className="reward-actions">
          <button className="reward-btn keep" onClick={keepBuilding}>📦 保留 ×1</button>
          <button className="reward-btn convert" onClick={convertToCoins}>
            💰 转 {RARITY_COIN[selectedBuilding.rarity] || 10}
            <img src={asset('coin.png')} alt="金币" className="gold-icon" />
          </button>
        </div>
      </div>

      <div className={`result-modal ${resultOpen ? 'active' : ''}`}>
        <div className="result-icon">🎉</div>
        <div className="result-title">专注完成！</div>
        <div className="result-detail">用时 <strong>{resultData.minutes}</strong> 分钟</div>
        <div className="result-coins">
          +{resultData.coins}
          <img src={asset('coin.png')} alt="金币" className="gold-icon" />
        </div>
        <button className="result-ok" onClick={() => setResultOpen(false)}>确定</button>
      </div>

      {/* ============================================================
          个人资料页
          ============================================================ */}
      <ProfilePage
        open={profileOpen}
        onClose={closeProfile}
        profile={profile}
        setProfile={setProfile}
        gold={gold}
        setGold={setGold}
        onEditAvatar={() => {
          setAvatarIsFirstTime(false);
          setAvatarPickerOpen(true);
        }}
      />

      {/* ============================================================
          头像选择器
          ============================================================ */}
      <AvatarPicker
        open={avatarPickerOpen}
        onClose={() => {
          setAvatarPickerOpen(false);
          setAvatarIsFirstTime(false);
        }}
        avatar={profile.avatar}
        setAvatar={(a) => setProfile((p) => ({ ...p, avatar: a }))}
        onConfirm={() => {
          setProfile((p) => ({ ...p, avatarChosen: true }));
          setAvatarPickerOpen(false);
          setAvatarIsFirstTime(false);
        }}
        onUploadPhoto={(file, dataUrl) => {
          setProfile((p) => ({ ...p, avatar: { type: 'custom', value: dataUrl } }));
        }}
        isFirstTime={avatarIsFirstTime}
        isVip={isVip(profile)}
      />

      {/* ============================================================
          成就解锁弹窗
          ============================================================ */}
      {achievementQueue.length > 0 && (
        <AchievementUnlockModal
          achievement={achievementQueue[0]}
          onClose={() => {
            setAchievementQueue((q) => q.slice(1));
          }}
        />
      )}

      {/* ============================================================
          城堡页
          ============================================================ */}
      <CastlePage
        open={castleOpen}
        onClose={closeCastle}
        gold={gold}
        setGold={setGold}
        inventory={inventory}
        setInventory={setInventory}
        placed={placed}
        setPlaced={setPlaced}
      />

      {/* ============================================================
          商店页
          ============================================================ */}
      <ShopPage
        open={shopOpen}
        onClose={closeShop}
        gold={gold}
        setGold={setGold}
        unlocked={unlocked}
        setUnlocked={setUnlocked}
        isVip={isVip(profile)}
      />

      {/* ============================================================
          偏好设置页
          ============================================================ */}
      <SettingsPage
        open={settingsOpen}
        onClose={closeSettings}
        onLogout={handleLogout}
        userEmail={user?.email}
        onClearData={() => {
          setGold(328);
          setInventory(INITIAL_INVENTORY);
          setUnlocked(['house']);
          setPlaced([]);
        }}
      />

      {/* ============================================================
          关于页
          ============================================================ */}
      <AboutPage open={aboutOpen} onClose={closeAbout} />

      {/* ============================================================
          每日任务页
          ============================================================ */}
      <TasksPage
        open={tasksOpen}
        onClose={() => { setTasksOpen(false); setActiveMenu(null); }}
        profile={profile}
        setProfile={setProfile}
        gold={gold}
        setGold={setGold}
      />

      {/* ============================================================
          活动页
          ============================================================ */}
      <ActivitiesPage
        open={activitiesOpen}
        onClose={() => { setActivitiesOpen(false); setActiveMenu(null); }}
        profile={profile}
        setProfile={setProfile}
        gold={gold}
        setGold={setGold}
      />

      {/* ============================================================
          VIP 页
          ============================================================ */}
      <VipPage
        open={vipOpen}
        onClose={() => { setVipOpen(false); setActiveMenu(null); }}
        profile={profile}
        setProfile={setProfile}
      />

      {/* ============================================================
          开发者面板
          ============================================================ */}
      {isDev && (
        <DevPanel
          open={devPanelOpen}
          onClose={() => setDevPanelOpen(false)}
          gold={gold}
          setGold={setGold}
          unlocked={unlocked}
          setUnlocked={setUnlocked}
          inventory={inventory}
          setInventory={setInventory}
          placed={placed}
          setPlaced={setPlaced}
          profile={profile}
          setProfile={setProfile}
          onForceFocusComplete={() => finishFocus(25)}
          onResetAll={async () => {
            if (user) {
              await supabase.from('user_data').update({
                gold: 328,
                inventory: INITIAL_INVENTORY,
                placed: [],
                unlocked: ['house'],
                profile: {
                  avatar: { ...DEFAULT_AVATAR },
                  avatarChosen: false,
                  name: '',
                  joinedAt: (() => {
                    const d = new Date();
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                  })(),
                  totalSessions: 0,
                  exp: 0,
                  focusRecords: {},
                  achievements: {},
                  dailyTasks: null,
                  points: 0,
                  pointsMonth: '',
                  unlockedLegendary: [],
                  vip: { ...DEFAULT_VIP },
                  activities: {},
                  sessionTimestamps: [],
                },
              }).eq('user_id', user.id);
            }
            setGold(328);
            setInventory(INITIAL_INVENTORY);
            setUnlocked(['house']);
            setPlaced([]);
            setProfile({
              avatar: { ...DEFAULT_AVATAR },
              avatarChosen: false,
              name: '',
              joinedAt: (() => {
                const d = new Date();
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
              })(),
              totalSessions: 0,
              exp: 0,
              focusRecords: {},
              achievements: {},
              dailyTasks: null,
              points: 0,
              pointsMonth: '',
              unlockedLegendary: [],
              vip: { ...DEFAULT_VIP },
              activities: {},
              sessionTimestamps: [],
            });
          }}
        />
      )}

      {/* ============================================================
          自定义时长输入弹窗
          ============================================================ */}
      {customModal && (
        <>
          <div className="picker-backdrop active" onClick={() => setCustomModal(null)} />
          <div className="custom-input-modal">
            <div className="custom-input-title">
              {customModal === 'work' ? '自定义专注时长' : '自定义休息时长'}
            </div>
            <div className="custom-input-row">
              <input
                type="number"
                min="1"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmCustom()}
                autoFocus
              />
              <span>分钟</span>
            </div>
            <div className="custom-input-actions">
              <button className="custom-btn cancel" onClick={() => setCustomModal(null)}>取消</button>
              <button className="custom-btn confirm" onClick={confirmCustom}>确定</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}