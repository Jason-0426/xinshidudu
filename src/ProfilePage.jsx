import React, { useState, useMemo } from 'react';
import { getAvatarDisplay } from './avatarOptions';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from './achievements';
import { isVip } from './vipConfig';
import './index.css';

// 资源路径工具
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

// ============================================================
// 爵位
// ============================================================
const TITLES = [
  { level: 1,  name: '侍从 I' },
  { level: 2,  name: '侍从 II' },
  { level: 3,  name: '侍从 III' },
  { level: 4,  name: '骑士' },
  { level: 5,  name: '男爵' },
  { level: 6,  name: '子爵' },
  { level: 7,  name: '伯爵' },
  { level: 8,  name: '侯爵' },
  { level: 9,  name: '公爵' },
  { level: 10, name: '国王' },
];

const getTitle = (level) => {
  let result = TITLES[0].name;
  for (const t of TITLES) {
    if (level >= t.level) result = t.name;
  }
  return result;
};

const getNextTitle = (level) => {
  for (const t of TITLES) {
    if (level < t.level) return t;
  }
  return null;
};

const EXP_PER_LEVEL = 500;

// ============================================================
// 工具
// ============================================================
const dateKey = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const computeStats = (profile) => {
  const records = profile.focusRecords || {};
  const keys = Object.keys(records).sort();

  const totalMinutes = keys.reduce((sum, k) => sum + (records[k] || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  let currentStreak = 0;
  let maxStreak = 0;

  if (keys.length > 0) {
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

  const now = new Date();
  const dow = now.getDay();
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);

  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
  const weekDays = [];
  let weekTotal = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const k = dateKey(d);
    const minutes = records[k] || 0;
    weekTotal += minutes;
    weekDays.push({
      day: dayNames[i],
      date: k,
      minutes,
      hours: +(minutes / 60).toFixed(1),
      isToday: k === dateKey(now),
    });
  }

  const exp = profile.exp || 0;
  const level = Math.min(10, Math.floor(exp / EXP_PER_LEVEL) + 1);
  const expInLevel = exp % EXP_PER_LEVEL;

  const joined = new Date(profile.joinedAt);
  joined.setHours(0, 0, 0, 0);
  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);
  const daysSinceJoined = Math.floor((today0 - joined) / 86400000) + 1;

  return {
    totalMinutes,
    totalHours,
    currentStreak,
    maxStreak,
    weekDays,
    weekTotal: +(weekTotal / 60).toFixed(1),
    level,
    expInLevel,
    expForNext: EXP_PER_LEVEL,
    daysSinceJoined,
    title: getTitle(level),
    nextTitle: getNextTitle(level),
    totalSessions: profile.totalSessions || 0,
  };
};

// ============================================================
// 主组件
// ============================================================
export default function ProfilePage({
  open,
  onClose,
  profile,
  setProfile,
  gold,
  setGold,
  onEditAvatar,
}) {
  const [chartType, setChartType] = useState('bar');
  const [nameEditOpen, setNameEditOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const stats = useMemo(() => computeStats(profile), [profile]);
  const vip = isVip(profile);

  const unlockedMap = profile.achievements || {};
  const unlockedCount = Object.keys(unlockedMap).length;
  const totalCount = ACHIEVEMENTS.length;

  // ---------- 名字 ----------
  const openNameEdit = () => {
    setNameInput(profile.name || '');
    setNameEditOpen(true);
  };

  const confirmName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      alert('名字不能为空');
      return;
    }
    if (trimmed.length > 12) {
      alert('名字不能超过 12 个字');
      return;
    }

    const isFirstTime = !profile.name;
    if (!isFirstTime) {
      if (gold < 50) {
        alert('金币不足！改名需要 50');
        return;
      }
      setGold((g) => g - 50);
    }

    setProfile((p) => ({ ...p, name: trimmed }));
    setNameEditOpen(false);
  };

  const maxMinutes = Math.max(...stats.weekDays.map((d) => d.minutes), 60);

  return (
    <div className={`profile-page ${open ? 'open' : ''}`}>
      {/* 顶部栏 */}
      <div className="profile-topbar">
        <button className="profile-back" onClick={onClose}>←</button>
        <div className="profile-topbar-title">用户资料</div>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="profile-content">
        {/* ---------- Hero ---------- */}
        <div className="profile-hero">
          <button
            className="profile-avatar-btn"
            onClick={onEditAvatar}
            title="点击更换头像"
          >
            <img
              src={getAvatarDisplay(profile.avatar).src}
              alt="头像"
              className="profile-avatar-img"
            />
            <span className="profile-avatar-edit">✏️</span>
          </button>

          <button className="profile-name-btn" onClick={openNameEdit}>
            {vip && <span className="vip-crown">👑</span>}
            <span className={`profile-name-text ${vip ? 'is-vip' : ''}`}>
              {profile.name || '点击设置名字'}
            </span>
            <span className="profile-name-edit">✏️</span>
          </button>

          <div className="profile-title">
            {stats.title} · Lv.{stats.level}
          </div>

          {vip && (
            <div className="vip-badge-label">
              💎 VIP 会员
            </div>
          )}

          <div className="profile-exp-bar">
            <div
              className="profile-exp-fill"
              style={{ width: `${(stats.expInLevel / stats.expForNext) * 100}%` }}
            />
          </div>
          <div className="profile-exp-text">
            {stats.expInLevel} / {stats.expForNext} EXP
            {stats.nextTitle && ` · 下一爵位：${stats.nextTitle.name}`}
          </div>
        </div>

        {/* ---------- 基本信息 ---------- */}
        <div className="profile-stats">
          <div className="profile-stat-row">
            <span className="profile-stat-label">👑 当前爵位</span>
            <span className="profile-stat-value">{stats.title}</span>
          </div>
          <div className="profile-stat-row">
            <span className="profile-stat-label">🗓 守护天数</span>
            <span className="profile-stat-value">{stats.daysSinceJoined} 天</span>
          </div>
          <div className="profile-stat-row">
            <span className="profile-stat-label">📅 加入时间</span>
            <span className="profile-stat-value">{profile.joinedAt}</span>
          </div>
        </div>

        {/* ---------- 数据统计 ---------- */}
        <div className="profile-section-title">📊 数据统计</div>
        <div className="stats-panel-cards">
          <div className="stat-card">
            <div className="stat-label">总专注时长</div>
            <div className="stat-value">
              {stats.totalHours} <span className="stat-unit">h</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">连续建造</div>
            <div className="stat-value gold">
              {stats.currentStreak} <span className="stat-unit">天</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">最多连续</div>
            <div className="stat-value gold">
              {stats.maxStreak} <span className="stat-unit">天</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">本周专注</div>
            <div className="stat-value">
              {stats.weekTotal} <span className="stat-unit">h</span>
            </div>
          </div>
        </div>

        {/* ---------- 本周专注趋势 ---------- */}
        <div className="chart-card">
          <div className="chart-header">
            <span>本周专注趋势</span>
            <div className="chart-type-tabs">
              <button
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
                title="柱状图"
              >柱</button>
              <button
                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
                title="折线图"
              >折</button>
              <button
                className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                onClick={() => setChartType('pie')}
                title="饼图"
              >饼</button>
            </div>
          </div>

          <WeekChart data={stats.weekDays} maxMinutes={maxMinutes} type={chartType} />
        </div>

        {/* ---------- 成就徽章 ---------- */}
        <div className="profile-section-title">
          🏆 成就徽章
          <span className="achievement-count">
            {unlockedCount} / {totalCount}
          </span>
        </div>

        {/* 按分类显示 */}
        {Object.entries(ACHIEVEMENT_CATEGORIES).map(([catKey, catInfo]) => {
          const list = ACHIEVEMENTS.filter((a) => a.category === catKey);
          if (list.length === 0) return null;

          return (
            <div key={catKey} className="achievement-category">
              <div className="achievement-category-title">
                <span>{catInfo.emoji}</span>
                <span>{catInfo.name}</span>
              </div>
              <div className="achievement-list">
                {list.map((a) => {
                  const unlocked = !!unlockedMap[a.id];
                  const unlockedAt = unlockedMap[a.id]?.unlockedAt;
                  return (
                    <div
                      key={a.id}
                      className={`achievement-item ${unlocked ? 'unlocked' : 'locked'}`}
                      title={unlocked ? `✅ ${a.desc}` : `🔒 ${a.desc}`}
                    >
                      <div className="achievement-icon">
                        {unlocked ? a.icon : '🔒'}
                      </div>
                      <div className="achievement-body">
                        <div className="achievement-name">
                          {unlocked ? a.name : '？？？'}
                        </div>
                        <div className="achievement-desc">{a.desc}</div>
                        {unlocked && unlockedAt && (
                          <div className="achievement-date">
                            {unlockedAt} 解锁
                          </div>
                        )}
                      </div>
                      <div className="achievement-rewards-mini">
                        {a.rewardCoins > 0 && (
                          <span className="achievement-mini-reward">
                            <img src={asset('coin.png')} alt="金币" className="gold-icon" />
                            {a.rewardCoins}
                          </span>
                        )}
                        {a.rewardExp > 0 && (
                          <span className="achievement-mini-reward">⭐{a.rewardExp}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{ height: 40 }}></div>
      </div>

      {/* ---------- 名字编辑弹窗 ---------- */}
      {nameEditOpen && (
        <>
          <div
            className="picker-backdrop active"
            onClick={() => setNameEditOpen(false)}
          />
          <div className="custom-input-modal">
            <div className="custom-input-title">
              {!profile.name ? (
                '设置你的名字'
              ) : (
                <>
                  修改名字（花 50 <img src={asset('coin.png')} alt="金币" className="gold-icon" />）
                </>
              )}
            </div>
            <div className="custom-input-row">
              <input
                type="text"
                maxLength={12}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmName()}
                placeholder="输入名字"
                autoFocus
                style={{
                  width: 200,
                  textAlign: 'left',
                  fontSize: 16,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            {profile.name && (
              <div className="name-edit-hint">
                当前金币：{gold} <img src={asset('coin.png')} alt="金币" className="gold-icon" />
              </div>
            )}
            <div className="custom-input-actions">
              <button className="custom-btn cancel" onClick={() => setNameEditOpen(false)}>
                取消
              </button>
              <button className="custom-btn confirm" onClick={confirmName}>
                {!profile.name ? (
                  '确定'
                ) : (
                  <>
                    花 50 <img src={asset('coin.png')} alt="金币" className="gold-icon" /> 改名
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// 本周图表
// ============================================================
function WeekChart({ data, maxMinutes, type }) {
  const chartHeight = 140;
  const chartWidth = 300;

  if (type === 'bar') {
    return (
      <div className="chart-bars">
        {data.map((d) => {
          const heightPct = maxMinutes > 0 ? (d.minutes / maxMinutes) * 100 : 0;
          return (
            <div key={d.date} className="chart-col">
              <div className="chart-bar-wrap">
                <div
                  className={`chart-bar ${d.minutes > 0 ? 'has-value' : ''} ${d.isToday ? 'today' : ''}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className={`chart-day ${d.isToday ? 'active' : ''}`}>{d.day}</span>
              <span className="chart-mini-value">
                {d.minutes > 0 ? `${d.hours}h` : ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === 'line') {
    const padding = 20;
    const innerW = chartWidth - padding * 2;
    const innerH = chartHeight - padding * 2;

    const points = data.map((d, i) => {
      const x = padding + (i / 6) * innerW;
      const y = padding + innerH - (d.minutes / maxMinutes) * innerH;
      return { x, y, ...d };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    return (
      <div className="chart-line-wrap">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="chart-svg"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1={padding}
              y1={padding + innerH * (1 - p)}
              x2={chartWidth - padding}
              y2={padding + innerH * (1 - p)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}

          <path
            d={pathD}
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="chart-line-days">
          {data.map((d) => (
            <span key={d.date} className={d.isToday ? 'today' : ''}>
              {d.day}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, d) => sum + d.minutes, 0);
    if (total === 0) {
      return <div className="chart-empty">本周还没有专注记录</div>;
    }

    const colors = ['#34d399', '#10b981', '#059669', '#fbbf24', '#f59e0b', '#60a5fa', '#a855f7'];
    let accumulated = 0;
    const segments = data
      .filter((d) => d.minutes > 0)
      .map((d, i) => {
        const pct = (d.minutes / total) * 100;
        const start = accumulated;
        accumulated += pct;
        return { ...d, start, end: accumulated, color: colors[i % colors.length] };
      });

    const gradient = segments
      .map((s) => `${s.color} ${s.start}% ${s.end}%`)
      .join(', ');

    return (
      <div className="chart-pie-wrap">
        <div
          className="chart-pie"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="chart-pie-center">
            <div className="chart-pie-total">{total}m</div>
            <div className="chart-pie-label">本周</div>
          </div>
        </div>
        <div className="chart-pie-legend">
          {segments.map((s) => (
            <div key={s.date} className="chart-pie-item">
              <span className="chart-pie-color" style={{ background: s.color }} />
              <span>周{s.day}</span>
              <span className="chart-pie-value">{s.hours}h</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}