import React from 'react';
import './index.css';

export default function AchievementUnlockModal({
  achievement,
  onClose,
}) {
  if (!achievement) return null;

  return (
    <div className="achievement-unlock-backdrop" onClick={onClose}>
      <div className="achievement-unlock-modal" onClick={(e) => e.stopPropagation()}>
        {/* 光效 */}
        <div className="achievement-unlock-glow" />

        {/* 标题 */}
        <div className="achievement-unlock-label">🎉 成就解锁</div>

        {/* 徽章 */}
        <div className="achievement-unlock-icon">
          {achievement.icon}
        </div>

        {/* 名字 */}
        <div className="achievement-unlock-name">{achievement.name}</div>

        {/* 描述 */}
        <div className="achievement-unlock-desc">{achievement.desc}</div>

        {/* 奖励 */}
        <div className="achievement-unlock-rewards">
          {achievement.rewardCoins > 0 && (
            <div className="achievement-reward-item">
              <img
                src={`${import.meta.env.BASE_URL}coin.png`}
                alt="金币"
                className="gold-icon"
              />
              <span>+{achievement.rewardCoins}</span>
            </div>
          )}
          {achievement.rewardExp > 0 && (
            <div className="achievement-reward-item">
              <span>⭐</span>
              <span>+{achievement.rewardExp} EXP</span>
            </div>
          )}
        </div>

        {/* 确认按钮 */}
        <button className="achievement-unlock-btn" onClick={onClose}>
          太棒了！
        </button>
      </div>
    </div>
  );
}