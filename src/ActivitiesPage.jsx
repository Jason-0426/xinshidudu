import React from 'react';
import {
  ACTIVITIES,
  isActivityLive,
  isActivityEnded,
  isActivityUpcoming,
  computeActivityProgress,
  getUserActivityState,
  getDefaultActivityState,
} from './activities';
import './index.css';

export default function ActivitiesPage({
  open,
  onClose,
  profile,
  setProfile,
  gold,
  setGold,
}) {
  // 分类活动
  const liveActivities = ACTIVITIES.filter((a) => isActivityLive(a));
  const upcomingActivities = ACTIVITIES.filter((a) => isActivityUpcoming(a));
  const endedActivities = ACTIVITIES.filter((a) => isActivityEnded(a));

  // ---------- 领取任务奖励 ----------
  const claimTask = (activity, task, progress) => {
    if (!progress.done) return;

    const state = getUserActivityState(activity, profile);
    if (state.claimedTasks?.[task.id]) return;

    setProfile((p) => {
      const activities = { ...(p.activities || {}) };
      const actState = activities[activity.id] || getDefaultActivityState();
      const newClaimedTasks = {
        ...(actState.claimedTasks || {}),
        [task.id]: true,
      };
      activities[activity.id] = {
        ...actState,
        claimedTasks: newClaimedTasks,
      };
      return {
        ...p,
        activities,
        exp: (p.exp || 0) + 50,
      };
    });

    setGold((g) => g + task.reward);
  };

  // ---------- 领取全部完成奖励 ----------
  const claimAllDone = (activity, progress) => {
    if (!progress.allTasksDone) return;

    const state = getUserActivityState(activity, profile);
    if (state.allDoneClaimed) return;

    setProfile((p) => {
      const activities = { ...(p.activities || {}) };
      const actState = activities[activity.id] || getDefaultActivityState();
      activities[activity.id] = {
        ...actState,
        allDoneClaimed: true,
      };
      return {
        ...p,
        activities,
        exp: (p.exp || 0) + (activity.allDoneReward.exp || 0),
      };
    });

    setGold((g) => g + (activity.allDoneReward.coins || 0));
  };

  return (
    <div className={`activities-page ${open ? 'open' : ''}`}>
      {/* 顶部栏 */}
      <div className="castle-topbar">
        <button className="castle-back" onClick={onClose}>←</button>
        <div className="castle-topbar-title">活动</div>
        <div className="glass gold-card">
          <img
            src={`${import.meta.env.BASE_URL}coin.png`}
            alt="金币"
            className="gold-icon"
          />
          <span>{gold}</span>
        </div>
      </div>

      <div className="activities-content">
        {/* ============================================================
            进行中的活动
            ============================================================ */}
        {liveActivities.length > 0 && (
          <>
            <div className="activities-section-title">🔥 进行中</div>
            {liveActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                profile={profile}
                status="live"
                onClaimTask={claimTask}
                onClaimAllDone={claimAllDone}
              />
            ))}
          </>
        )}

        {/* ============================================================
            即将开始
            ============================================================ */}
        {upcomingActivities.length > 0 && (
          <>
            <div className="activities-section-title">🕐 即将开始</div>
            {upcomingActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                profile={profile}
                status="upcoming"
                onClaimTask={claimTask}
                onClaimAllDone={claimAllDone}
              />
            ))}
          </>
        )}

        {/* ============================================================
            已结束
            ============================================================ */}
        {endedActivities.length > 0 && (
          <>
            <div className="activities-section-title">✅ 已结束</div>
            {endedActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                profile={profile}
                status="ended"
                onClaimTask={claimTask}
                onClaimAllDone={claimAllDone}
              />
            ))}
          </>
        )}

        {ACTIVITIES.length === 0 && (
          <div className="activities-empty">
            <div style={{ fontSize: 48 }}>📭</div>
            <div>暂时没有活动</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              敬请期待新的挑战
            </div>
          </div>
        )}

        <div style={{ height: 40 }}></div>
      </div>
    </div>
  );
}

// ============================================================
// 单个活动卡片
// ============================================================
function ActivityCard({
  activity,
  profile,
  status,
  onClaimTask,
  onClaimAllDone,
}) {
  const progress = computeActivityProgress(activity, profile);
  const state = getUserActivityState(activity, profile);
  const claimedTasks = state.claimedTasks || {};
  const allDoneClaimed = state.allDoneClaimed || false;

  const isLive = status === 'live';
  const isUpcoming = status === 'upcoming';
  const isEnded = status === 'ended';

  return (
    <div className={`activity-card activity-${status} activity-theme-${activity.theme || 'default'}`}>
      {/* 头部 */}
      <div className="activity-card-header">
        <div className="activity-emoji">{activity.emoji}</div>
        <div className="activity-info">
          <div className="activity-name">{activity.name}</div>
          <div className="activity-date">
            {activity.startAt} ~ {activity.endAt}
          </div>
        </div>
        {isLive && <div className="activity-live-badge">进行中</div>}
        {isUpcoming && <div className="activity-upcoming-badge">即将开始</div>}
        {isEnded && <div className="activity-ended-badge">已结束</div>}
      </div>

      {/* 描述 */}
      <div className="activity-desc">{activity.desc}</div>

      {/* 进度条 */}
      {isLive && (
        <div className="activity-progress-bar">
          <div
            className="activity-progress-fill"
            style={{
              width: `${(progress.doneCount / progress.totalTasks) * 100}%`,
            }}
          />
        </div>
      )}
      {isLive && (
        <div className="activity-progress-text">
          {progress.doneCount} / {progress.totalTasks} 任务完成
        </div>
      )}

      {/* 任务列表 */}
      <div className="activity-tasks">
        {activity.tasks.map((task) => {
          const tp = progress.taskProgress[task.id];
          const claimed = !!claimedTasks[task.id];

          return (
            <div
              key={task.id}
              className={`activity-task ${tp.done ? 'done' : ''} ${claimed ? 'claimed' : ''}`}
            >
              <div className="activity-task-check">
                {claimed ? '✅' : tp.done ? '🎁' : isEnded ? '❌' : '⏳'}
              </div>
              <div className="activity-task-body">
                <div className="activity-task-name">{task.name}</div>
                {isLive && !tp.done && (
                  <div className="activity-task-progress">
                    {tp.current} / {tp.target}
                  </div>
                )}
                {isLive && !tp.done && (
                  <div className="activity-task-bar">
                    <div
                      className="activity-task-bar-fill"
                      style={{ width: `${tp.pct}%` }}
                    />
                  </div>
                )}
                <div className="activity-task-reward">
                  <img
                    src={`${import.meta.env.BASE_URL}coin.png`}
                    alt="金币"
                    className="gold-icon"
                  />
                  +{task.reward}
                </div>
              </div>
              {tp.done && !claimed && isLive && (
                <button
                  className="activity-claim-btn"
                  onClick={() => onClaimTask(activity, task, tp)}
                >
                  领取
                </button>
              )}
              {claimed && (
                <div className="activity-claimed-label">已领取</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 全部完成奖励 */}
      <div className={`activity-all-done ${progress.allTasksDone ? 'unlocked' : ''}`}>
        <div className="activity-all-done-title">
          🎁 全部完成奖励
        </div>
        <div className="activity-all-done-rewards">
          <div className="activity-all-done-item">
            <span className="activity-all-done-emoji">
              {activity.allDoneReward.building.emoji}
            </span>
            <span>{activity.allDoneReward.building.name}</span>
          </div>
          <div className="activity-all-done-item">
            <img
              src={`${import.meta.env.BASE_URL}coin.png`}
              alt="金币"
              className="gold-icon"
            />
            <span>+{activity.allDoneReward.coins}</span>
          </div>
          <div className="activity-all-done-item">
            <span>⭐</span>
            <span>+{activity.allDoneReward.exp}</span>
          </div>
        </div>

        {progress.allTasksDone && !allDoneClaimed && isLive && (
          <button
            className="activity-all-done-btn"
            onClick={() => onClaimAllDone(activity, progress)}
          >
            🎉 领取全部奖励
          </button>
        )}
        {allDoneClaimed && (
          <div className="activity-all-done-done">
            ✅ 已领取全部奖励
          </div>
        )}
      </div>
    </div>
  );
}