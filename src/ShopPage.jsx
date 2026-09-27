import React from 'react';
import { VIP_BUILDINGS } from './vipConfig';
import { BUILDINGS, RARITY_LABEL } from './buildings';
import './index.css';

// 资源路径工具
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

export default function ShopPage({
  open,
  onClose,
  gold,
  setGold,
  unlocked,
  setUnlocked,
  isVip = false,
}) {
  const buyBuilding = (id, price) => {
    if (price === 0) return;
    if (gold < price) {
      alert(`金币不足！解锁需要 ${price}`);
      return;
    }
    setGold((g) => g - price);
    setUnlocked((prev) => [...prev, id]);
  };

  return (
    <div className={`shop-page ${open ? 'open' : ''}`}>
      {/* 顶部栏 */}
      <div className="castle-topbar">
        <button className="castle-back" onClick={onClose}>←</button>
        <div className="castle-topbar-title">建筑商店</div>
        <div className="glass gold-card">
          <img src={asset('coin.png')} alt="金币" className="gold-icon" />
          <span>{gold}</span>
        </div>
      </div>

      {/* 提示 */}
      <div className="shop-hint">
        💡 解锁建筑后，可以在专注时选择它，专注完成就能获得
      </div>

      {/* 建筑列表 */}
      <div className="shop-content">
        <div className="shop-grid">
          {BUILDINGS.map((b) => {
            const isUnlocked = unlocked.includes(b.id);
            const canAfford = gold >= b.price;
            const isVipBuilding = VIP_BUILDINGS.includes(b.id);
            const vipLocked = isVipBuilding && !isVip;

            return (
              <div
                key={b.id}
                className={`shop-card rarity-${b.rarity} ${vipLocked ? 'vip-locked' : ''}`}
              >
                {/* 缩略图 */}
                <div className={`shop-thumb rarity-${b.rarity}`}>
                  <img src={b.imgs[0]} alt={b.name} />
                  {isVipBuilding && (
                    <span className="vip-shop-badge">👑</span>
                  )}
                </div>

                {/* 名字 */}
                <div className="shop-name">{b.name}</div>

                {/* 稀有度 */}
                <div className={`shop-rarity rarity-${b.rarity}`}>
                  {RARITY_LABEL[b.rarity]}
                </div>

                {/* 状态 / 按钮 */}
                {isUnlocked ? (
                  <div className="shop-owned">✅ 已解锁</div>
                ) : vipLocked ? (
                  <div className="shop-vip-locked">
                    💎 VIP 专属
                  </div>
                ) : (
                  <button
                    className={`shop-buy-btn ${!canAfford ? 'disabled' : ''}`}
                    onClick={() => buyBuilding(b.id, b.price)}
                    disabled={!canAfford}
                  >
                    {canAfford ? (
                      <>
                        解锁 {b.price} <img src={asset('coin.png')} alt="金币" className="gold-icon" />
                      </>
                    ) : (
                      <>
                        需 {b.price} <img src={asset('coin.png')} alt="金币" className="gold-icon" />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}