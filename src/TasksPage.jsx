import React from 'react';
import {
  getCurrentLegendary,
  getTaskDef,
  POINTS_LIMIT,
} from './dailyTasks';
import './index.css';

export default function TasksPage({
  open,
  onClose,
  profile,
  setProfile,
  gold,
  setGold,
}) {
  const daily = profile.dailyTasks || { tasks: [] };
  const points = profile.points || 0;
  const legendary = getCurrentLegendary();
  const unlockedLegendary = profile.unlockedLegendary || [];
  const legendaryUnlocked = unlockedLegendary.includes(legendary.id);

  // 领取任务奖励
  const claimTask = (taskId) => {
    const def = getTaskDef(taskId);
    if (!def) return;

    setProfile((p) => {
      const daily = p.dailyTasks || { tasks: [] };
      const tasks = daily.tasks.map((t) =>
        t.id === taskId ? { ...t, claimed: true } : t
      );

      const newPoints = Math.min(POINTS_LIMIT, (p.points || 0) + def.points);

      // 检查是否达成传说建筑解锁
      const monthKey = p.pointsMonth;
      const currentMonth = new Date().toISOString().slice(0, 7);
      let newUnlocked = p.unlockedLegendary || [];

      if (newPoints >= POINTS_LIMIT && monthKey === currentMonth && !newUnlocked.includes(legendary.id)) {
        newUnlocked = [...newUnlocked, legendary.id];
      }

      return {
        ...p,
        dailyTasks: { ...daily, tasks },
        points: newPoints,
        unlockedLegendary: newUnlocked,
        exp: (p.exp || 0) + def.exp,
      };
    });

    // 金币单独加
    setGold((g) => g + def.coins);
  };

  const completedCount = daily.tasks.filter((t) => t.done).length;
  const claimedCount = daily.tasks.filter((t) => t.claimed).length;

  const pointsPct = Math.min(100, (points / POINTS_LIMIT) * 100);

  return (
    <div className={`tasks-page ${open ? 'open' : ''}`}>
      {/* 顶部栏 */}
      <div className="castle-topbar">
        <button className="castle-back" onClick={onClose}>←</button>
        <div className="castle-topbar-title">每日任务</div>
        <div className="glass gold-card">
          <img src="/coin.png" alt="金币" className="gold-icon" />
          <span>{gold}</span>
        </div>
      </div>

      <div className="tasks-content">

        {/* ============================================================
            本月传说建筑
            ============================================================ */}
        <div className="tasks-legendary liquid-glass">
          <div className="tasks-legendary-label">本月传说</div>

          <div className={`tasks-legendary-img ${legendaryUnlocked ? 'unlocked' : ''}`}>
            {legendary.img ? (
              <img src={legendary.img} alt={legendary.name} />
            ) : (
              <span className="tasks-legendary-emoji">{legendary.emoji}</span>
            )}
          </div>

          <div className="tasks-legendary-name">{legendary.name}</div>

          {legendaryUnlocked ? (
            <div className="tasks-legendary-status unlocked">
              ✅ 已解锁 · 已加入仓库
            </div>
          ) : (
            <div className="tasks-legendary-status">
              距离解锁还差 {Math.max(0, POINTS_LIMIT - points)} 积分
            </div>
          )}

          {/* 积分进度条 */}
          <div className="tasks-points-bar">
            <div
              className="tasks-points-fill"
              style={{ width: `${pointsPct}%` }}
            />
          </div>
          <div className="tasks-points-text">
            <span>{points} / {POINTS_LIMIT} 积分</span>
            <span>{Math.round(pointsPct)}%</span>
          </div>

          <div className="tasks-legendary-hint">
            积分每月 1 号重置，传说建筑每月更换
          </div>
        </div>

        {/* ============================================================
            今日任务
            ============================================================ */}
        <div className="tasks-section-title">
          📋 今日任务
          <span className="tasks-progress-badge">
            {completedCount} / {daily.tasks.length} 完成
          </span>
        </div>

        <div className="tasks-list">
          {daily.tasks.map((t) => {
            const def = getTaskDef(t.id);
            if (!def) return null;

            return (
              <div
                key={t.id}
                className={`task-item liquid-glass ${t.done ? 'done' : ''} ${t.claimed ? 'claimed' : ''}`}
              >
                {/* 左侧图标 */}
                <div className={`task-icon ${def.difficulty}`}>
                  {t.claimed ? '✅' : t.done ? '🎁' : '⏳'}
                </div>

                {/* 中间内容 */}
                <div className="task-body">
                  <div className="task-name">{def.name}</div>
                  <div className="task-desc">{def.desc}</div>

                  {/* 奖励 */}
                  <div className="task-rewards">
                    <span className="task-reward">
                      <img src="/coin.png" alt="金币" className="gold-icon" />
                      +{def.coins}
                    </span>
                    <span className="task-reward">⭐ +{def.exp}</span>
                    <span className="task-reward points">🎫 +{def.points}</span>
                  </div>
                </div>

                {/* 右侧按钮 */}
                <div className="task-action">
                  {t.claimed ? (
                    <span className="task-done-label">已领取</span>
                  ) : t.done ? (
                    <button
                      className="task-claim-btn"
                      onClick={() => claimTask(t.id)}
                    >
                      领取
                    </button>
                  ) : (
                    <span className="task-pending-label">进行中</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部说明 */}
        <div className="tasks-footer">
          <div className="tasks-footer-line">
            🕐 每日 0 点刷新任务
          </div>
          <div className="tasks-footer-line">
            🎫 完成任务得积分，攒满解锁传说建筑
          </div>
        </div>

        <div style={{ height: 40 }}></div>
      </div>
    </div>
  );
}