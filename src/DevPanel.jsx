import React, { useState } from 'react';
import './index.css';

const EXP_PER_LEVEL = 500;

export default function DevPanel({
  open,
  onClose,
  gold,
  setGold,
  unlocked,
  setUnlocked,
  inventory,
  setInventory,
  placed,
  setPlaced,
  profile,
  setProfile,
  onForceFocusComplete,
  onResetAll,
}) {
  const [customGold, setCustomGold] = useState('');
  const [customExp, setCustomExp] = useState('');

  // ---------- 金币 ----------
  const addGold = (n) => setGold((g) => g + n);

  const setGoldExact = () => {
    const n = parseInt(customGold, 10);
    if (isNaN(n) || n < 0) {
      alert('请输入有效的数字');
      return;
    }
    setGold(n);
    setCustomGold('');
    alert(`金币已设置为 ${n}`);
  };

  // ---------- 经验 / 等级 ----------
  const addExp = (n) => {
    setProfile((p) => ({ ...p, exp: Math.max(0, (p.exp || 0) + n) }));
  };

  const setExpExact = () => {
    const n = parseInt(customExp, 10);
    if (isNaN(n) || n < 0) {
      alert('请输入有效的数字');
      return;
    }
    setProfile((p) => ({ ...p, exp: n }));
    setCustomExp('');
    alert(`经验已设置为 ${n}`);
  };

  const setLevel = (lvl) => {
    const exp = (lvl - 1) * EXP_PER_LEVEL;
    setProfile((p) => ({ ...p, exp }));
    alert(`已设置为 Lv.${lvl}`);
  };

  const currentLevel = Math.min(10, Math.floor((profile.exp || 0) / EXP_PER_LEVEL) + 1);

  // ---------- 建筑 ----------
  const unlockAll = () => {
    setUnlocked(['house', 'tree', 'well', 'tower']);
    alert('已解锁所有建筑');
  };

  const clearPlaced = () => {
    if (!window.confirm('确定清空领地上的所有建筑吗？（会退还到仓库）')) return;
    placed.forEach((p) => {
      setInventory((inv) => ({
        ...inv,
        [p.buildingId]: (inv[p.buildingId] || 0) + 1,
      }));
    });
    setPlaced([]);
  };

  const addAllToInventory = () => {
    setInventory({ house: 99, tree: 99, well: 99, tower: 99 });
    alert('仓库已填满（每种 99 个）');
  };

  // ---------- VIP ----------
  const toggleVip = () => {
    const isActive = profile.vip?.isActive === true;
    setProfile((p) => ({
      ...p,
      vip: {
        isActive: !isActive,
        activatedAt: !isActive ? new Date().toISOString().slice(0, 10) : null,
      },
    }));
    alert(isActive ? '已取消 VIP' : '已激活 VIP');
  };

  // ---------- 成就 ----------
  const clearAchievements = () => {
    if (!window.confirm('确定清空所有已解锁的成就吗？')) return;
    setProfile((p) => ({ ...p, achievements: {} }));
    alert('成就已清空');
  };

  const unlockAllAchievements = async () => {
    if (!window.confirm('确定一键解锁所有成就吗？')) return;
    const { ACHIEVEMENTS } = await import('./achievements');
    const today = new Date().toISOString().slice(0, 10);
    const map = {};
    ACHIEVEMENTS.forEach((a) => {
      map[a.id] = { unlockedAt: today };
    });
    setProfile((p) => ({ ...p, achievements: map }));
    alert(`已解锁 ${ACHIEVEMENTS.length} 个成就`);
  };

  // ---------- 每日任务 ----------
  const resetDailyTasks = () => {
    if (!window.confirm('确定重置今日任务吗？（重新随机抽 3 个）')) return;
    setProfile((p) => ({ ...p, dailyTasks: null }));
    alert('已重置，刷新页面后会重新生成');
  };

  // ---------- 活动 ----------
  const clearActivities = () => {
    if (!window.confirm('确定清空活动领取记录吗？')) return;
    setProfile((p) => ({ ...p, activities: {} }));
    alert('活动记录已清空');
  };

  // ---------- 专注 ----------
  const forceFocus = () => {
    onForceFocusComplete();
    onClose();
  };

  // ---------- 重置 ----------
  const resetAll = () => {
    if (!window.confirm('⚠️ 确定要重置所有数据吗？\n（金币、仓库、领地、解锁、个人信息都会重置）')) return;
    if (!window.confirm('真的确定吗？此操作不可撤销！')) return;
    onResetAll();
    onClose();
  };

  const isVip = profile.vip?.isActive === true;
  const achievementCount = Object.keys(profile.achievements || {}).length;

  return (
    <div className={`dev-panel-backdrop ${open ? 'active' : ''}`} onClick={onClose}>
      <div className="dev-panel" onClick={(e) => e.stopPropagation()}>
        <div className="dev-panel-header">
          <div className="dev-panel-title">🔧 开发者面板</div>
          <button className="dev-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="dev-panel-body">
          {/* ============================================================
              金币
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">💰 金币（当前 {gold}）</div>

            <div className="dev-row">
              <button className="dev-btn" onClick={() => addGold(100)}>+100</button>
              <button className="dev-btn" onClick={() => addGold(1000)}>+1000</button>
              <button className="dev-btn" onClick={() => addGold(10000)}>+1万</button>
              <button className="dev-btn" onClick={() => setGold(0)}>清零</button>
            </div>

            <div className="dev-row">
              <input
                type="number"
                className="dev-input"
                placeholder="输入金币数"
                value={customGold}
                onChange={(e) => setCustomGold(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setGoldExact()}
              />
              <button className="dev-btn primary" onClick={setGoldExact}>设置</button>
            </div>
          </div>

          {/* ============================================================
              等级 / 经验
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">
              ⭐ 等级（当前 Lv.{currentLevel}，经验 {profile.exp || 0}）
            </div>

            <div className="dev-row">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <button
                  key={lvl}
                  className={`dev-btn ${currentLevel === lvl ? 'primary' : ''}`}
                  style={{ minWidth: 44, flex: 'none', padding: '8px 10px' }}
                  onClick={() => setLevel(lvl)}
                >
                  Lv.{lvl}
                </button>
              ))}
            </div>

            <div className="dev-row">
              <button className="dev-btn" onClick={() => addExp(500)}>+500</button>
              <button className="dev-btn" onClick={() => addExp(5000)}>+5000</button>
              <button className="dev-btn" onClick={() => setProfile((p) => ({ ...p, exp: 0 }))}>
                清零
              </button>
            </div>

            <div className="dev-row">
              <input
                type="number"
                className="dev-input"
                placeholder="输入经验值"
                value={customExp}
                onChange={(e) => setCustomExp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setExpExact()}
              />
              <button className="dev-btn primary" onClick={setExpExact}>设置</button>
            </div>
          </div>

          {/* ============================================================
              建筑
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">🏰 建筑</div>

            <div className="dev-row">
              <button className="dev-btn" onClick={unlockAll}>🔓 解锁所有</button>
              <button className="dev-btn" onClick={addAllToInventory}>📦 仓库全满</button>
            </div>

            <div className="dev-row">
              <button className="dev-btn danger" onClick={clearPlaced}>
                🗑 清空领地
              </button>
            </div>
          </div>

          {/* ============================================================
              VIP
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">
              💎 VIP（当前：{isVip ? '✅ 已激活' : '❌ 未激活'}）
            </div>

            <div className="dev-row">
              <button
                className={`dev-btn ${isVip ? 'danger' : 'primary'}`}
                onClick={toggleVip}
              >
                {isVip ? '❌ 取消 VIP' : '👑 激活 VIP'}
              </button>
            </div>
          </div>

          {/* ============================================================
              成就
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">
              🏆 成就（已解锁 {achievementCount} 个）
            </div>

            <div className="dev-row">
              <button className="dev-btn primary" onClick={unlockAllAchievements}>
                🔓 一键全解锁
              </button>
              <button className="dev-btn danger" onClick={clearAchievements}>
                🗑 清空
              </button>
            </div>
          </div>

          {/* ============================================================
              每日任务
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">📋 每日任务</div>

            <div className="dev-row">
              <button className="dev-btn" onClick={resetDailyTasks}>
                🔄 重置今日任务
              </button>
            </div>
          </div>

          {/* ============================================================
              活动
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">🎉 活动</div>

            <div className="dev-row">
              <button className="dev-btn danger" onClick={clearActivities}>
                🗑 清空领取记录
              </button>
            </div>
          </div>

          {/* ============================================================
              专注
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">⏱ 专注</div>

            <div className="dev-row">
              <button className="dev-btn primary" onClick={forceFocus}>
                ⚡ 强制完成 25 分钟专注
              </button>
            </div>
          </div>

          {/* ============================================================
              危险操作
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">⚠️ 危险操作</div>

            <div className="dev-row">
              <button className="dev-btn danger big" onClick={resetAll}>
                🔥 重置所有数据
              </button>
            </div>
          </div>

          {/* ============================================================
              调试信息
              ============================================================ */}
          <div className="dev-section">
            <div className="dev-section-title">📋 调试信息</div>
            <div className="dev-debug">
              <div>名字：{profile.name || '未设置'}</div>
              <div>专注次数：{profile.totalSessions || 0}</div>
              <div>经验：{profile.exp || 0}（Lv.{currentLevel}）</div>
              <div>已解锁建筑：{unlocked.join(', ')}</div>
              <div>领地建筑数：{placed.length}</div>
              <div>VIP：{isVip ? '是' : '否'}</div>
              <div>成就：{achievementCount} 个</div>
              <div>每日任务：{profile.dailyTasks?.date || '未生成'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}