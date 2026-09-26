import React from 'react';
import { VIP_BUILDINGS } from './vipConfig';
import './index.css';

// ---------- 商店里的建筑定义（含价格）----------
const SHOP_BUILDINGS = [
  {
    id: 'house',
    name: '小木屋',
    rarity: 'common',
    price: 0,
    imgs: [
      '/buildings/house-0.png',
      '/buildings/house-1.png',
      '/buildings/house-2.png',
      '/buildings/house-3.png',
    ],
    emoji: null,
  },
  {
    id: 'tree',
    name: '松树',
    rarity: 'common',
    price: 100,
    imgs: null,
    emoji: '🌲',
  },
  {
    id: 'well',
    name: '水井',
    rarity: 'rare',
    price: 300,
    imgs: null,
    emoji: '⛲',
  },
  {
    id: 'tower',
    name: '魔法塔',
    rarity: 'epic',
    price: 1000,
    imgs: null,
    emoji: '🏰',
  },
];

const RARITY_LABEL = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
};

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
          <img src="/coin.png" alt="金币" className="gold-icon" />
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
          {SHOP_BUILDINGS.map((b) => {
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
                  {b.imgs ? (
                    <img src={b.imgs[0]} alt={b.name} />
                  ) : (
                    <span>{b.emoji}</span>
                  )}
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
                        解锁 {b.price} <img src="/coin.png" alt="金币" className="gold-icon" />
                      </>
                    ) : (
                      <>
                        需 {b.price} <img src="/coin.png" alt="金币" className="gold-icon" />
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