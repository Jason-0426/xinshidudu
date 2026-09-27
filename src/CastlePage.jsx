import React, { useState, useRef, useEffect, memo } from 'react';
import { BUILDINGS_MAP as BUILDINGS } from './buildings';

// ---------- 资源路径工具 ----------
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

// ---------- 领地配置 ----------
const GRID_SIZE = 20;
const TILE_W = 64;
const TILE_H = 32;

const MIN_SCALE = 0.3;
const MAX_SCALE = 3;

// 等距坐标 → 屏幕坐标
function isoToScreen(x, y) {
  const screenX = (x - y) * (TILE_W / 2);
  const screenY = (x + y) * (TILE_H / 2);
  return { x: screenX, y: screenY };
}

// 单个格子
const IsoTile = memo(function IsoTile({ x, y, isWall, hasBuilding }) {
  const { x: sx, y: sy } = isoToScreen(x, y);

  return (
    <div
      className={`iso-tile ${isWall ? 'iso-wall' : 'iso-ground'} ${hasBuilding ? 'has-building' : ''}`}
      style={{ left: sx, top: sy, width: TILE_W, height: TILE_H }}
    />
  );
});

// 已放置的建筑
const PlacedBuilding = memo(function PlacedBuilding({
  x, y, buildingId, rotation = 0,
  damaged = false, damageType = 'fire', damagedAt = null,
  onClick,
}) {
  const b = BUILDINGS[buildingId];
  if (!b) return null;

  const { x: sx, y: sy } = isoToScreen(x, y);

  let imgSrc = null;
  if (b.imgs) {
    imgSrc = b.imgs[rotation % 2];
  }

  // 计算剩余天数
  let daysLeft = null;
  if (damaged && damagedAt) {
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    const remaining = THREE_DAYS - (Date.now() - damagedAt);
    if (remaining > 0) {
      daysLeft = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    } else {
      daysLeft = 0;
    }
  }

  return (
    <div
      className={`placed-building ${damaged ? 'damaged' : ''}`}
      style={{
        left: sx + TILE_W / 2,
        top: sy + TILE_H / 2,
      }}
      onClick={onClick}
      title={damaged ? `${b.name}（受损，${daysLeft} 天后消失）` : `${b.name}（点击管理）`}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={b.name} className="placed-building-img" />
      ) : (
        <div className="placed-building-emoji">{b.emoji}</div>
      )}

      {/* 受损标记 */}
      {damaged && (
        <div className="damage-badge">
          {damageType === 'fire' ? '🔥' : '🔧'}
        </div>
      )}

      {/* 剩余天数 */}
      {damaged && daysLeft !== null && (
        <div className="damage-days-left">
          {daysLeft}天
        </div>
      )}
    </div>
  );
});

// ============================================================
// 城堡页主组件
// ============================================================
export default function CastlePage({
  open,
  onClose,
  gold,
  setGold,
  inventory,
  setInventory,
  placed,
  setPlaced,
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(null);
  const [hoverTile, setHoverTile] = useState(null);
  const [selectedPlaced, setSelectedPlaced] = useState(null);

  const draggingRef = useRef(null);
  const viewportRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  // ---------- 初始化：自适应缩放 + 居中 ----------
  useEffect(() => {
    if (!open) return;
    const vp = viewportRef.current;
    if (!vp) return;

    const w = vp.clientWidth;
    const h = vp.clientHeight;

    const worldW = GRID_SIZE * TILE_W;
    const worldH = GRID_SIZE * TILE_H;

    const padding = 80;
    const fitScale = Math.min((w - padding) / worldW, (h - padding) / worldH);
    const initScale = Math.min(Math.max(fitScale, MIN_SCALE), 1.2);

    const center = isoToScreen(GRID_SIZE / 2, GRID_SIZE / 2);

    setScale(initScale);
    setOffset({
      x: w / 2 - center.x * initScale,
      y: h / 2 - center.y * initScale,
    });
  }, [open]);

  // ---------- 滚轮缩放 ----------
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !open) return;

    const onWheel = (e) => {
      e.preventDefault();

      const rect = vp.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const worldX = (mx - offset.x) / scale;
      const worldY = (my - offset.y) / scale;

      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newScale = Math.min(Math.max(scale * factor, MIN_SCALE), MAX_SCALE);

      setScale(newScale);
      setOffset({
        x: mx - worldX * newScale,
        y: my - worldY * newScale,
      });
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, [open, offset, scale]);

  // ---------- 全局触摸监听（处理拖拽建筑）----------
useEffect(() => {
  if (!open) return;

  const handleGlobalTouchMove = (e) => {
    if (!draggingRef.current) return;
    if (!viewportRef.current) return;

    e.preventDefault();

    const t = e.touches[0];
    if (!t) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const mx = (t.clientX - rect.left - offset.x) / scale;
    const my = (t.clientY - rect.top - offset.y) / scale;
    const tile = screenToIso(mx, my);

    if (tile && tile.x >= 0 && tile.x < GRID_SIZE && tile.y >= 0 && tile.y < GRID_SIZE) {
      setHoverTile(tile);
    } else {
      setHoverTile(null);
    }
  };

  const handleGlobalTouchEnd = (e) => {
    if (!draggingRef.current) return;

    // 放下建筑
    if (hoverTile) {
      const buildingId = draggingRef.current;
      const occupied = placed.some((p) => p.x === hoverTile.x && p.y === hoverTile.y);
      if (!occupied) {
        setPlaced((prev) => [...prev, { x: hoverTile.x, y: hoverTile.y, buildingId }]);
        setInventory((prev) => ({
          ...prev,
          [buildingId]: Math.max(0, (prev[buildingId] || 0) - 1),
        }));
      }
    }

    draggingRef.current = null;
    setDragging(null);
    setHoverTile(null);
  };

  window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
  window.addEventListener('touchend', handleGlobalTouchEnd);
  window.addEventListener('touchcancel', handleGlobalTouchEnd);

  return () => {
    window.removeEventListener('touchmove', handleGlobalTouchMove);
    window.removeEventListener('touchend', handleGlobalTouchEnd);
    window.removeEventListener('touchcancel', handleGlobalTouchEnd);
  };
}, [open, offset, scale, hoverTile, placed, setPlaced, setInventory]);

  // 屏幕坐标 → 等距格坐标
  const screenToIso = (sx, sy) => {
    const x = (sx / (TILE_W / 2) + sy / (TILE_H / 2)) / 2;
    const y = (sy / (TILE_H / 2) - sx / (TILE_W / 2)) / 2;
    return { x: Math.round(x), y: Math.round(y) };
  };

  // ---------- 拖动 ----------
  const handleMouseDown = (e) => {
    if (draggingRef.current) return;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    setDragging('__canvas__');
  };

  const handleMouseMove = (e) => {
    if (dragging === '__canvas__') {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setOffset({
        x: dragStartRef.current.ox + dx,
        y: dragStartRef.current.oy + dy,
      });
      return;
    }

    if (draggingRef.current && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const mx = (e.clientX - rect.left - offset.x) / scale;
      const my = (e.clientY - rect.top - offset.y) / scale;
      const tile = screenToIso(mx, my);
      if (tile && tile.x >= 0 && tile.x < GRID_SIZE && tile.y >= 0 && tile.y < GRID_SIZE) {
        setHoverTile(tile);
      } else {
        setHoverTile(null);
      }
    }
  };

  const handleMouseUp = () => {
    setDragging(null);

    if (draggingRef.current && hoverTile) {
      const buildingId = draggingRef.current;
      const occupied = placed.some((p) => p.x === hoverTile.x && p.y === hoverTile.y);
      if (!occupied) {
        setPlaced((prev) => [...prev, { x: hoverTile.x, y: hoverTile.y, buildingId }]);
        setInventory((prev) => ({
          ...prev,
          [buildingId]: Math.max(0, (prev[buildingId] || 0) - 1),
        }));
      }
    }

    draggingRef.current = null;
    setHoverTile(null);
  };

  // ---------- 触摸事件 ----------
const touchStateRef = useRef({
  mode: null,         // 'pan' | 'pinch' | 'drag-building'
  startX: 0,
  startY: 0,
  startOffsetX: 0,
  startOffsetY: 0,
  startDistance: 0,
  startScale: 1,
  startMidX: 0,
  startMidY: 0,
});

const handleTouchStart = (e) => {
  // 从仓库拖建筑
  if (draggingRef.current) {
    // 已经在拖建筑了，不动
    return;
  }

  if (e.touches.length === 2) {
    // 双指：缩放
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const midX = (t1.clientX + t2.clientX) / 2;
    const midY = (t1.clientY + t2.clientY) / 2;

    touchStateRef.current = {
      ...touchStateRef.current,
      mode: 'pinch',
      startDistance: distance,
      startScale: scale,
      startMidX: midX,
      startMidY: midY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  } else if (e.touches.length === 1) {
    // 单指：拖动地图
    const t = e.touches[0];
    touchStateRef.current = {
      ...touchStateRef.current,
      mode: 'pan',
      startX: t.clientX,
      startY: t.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  }
};

const handleTouchMove = (e) => {
  e.preventDefault();

  const state = touchStateRef.current;

  if (state.mode === 'pinch' && e.touches.length === 2) {
    // 缩放
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const factor = distance / state.startDistance;
    const newScale = Math.min(Math.max(state.startScale * factor, MIN_SCALE), MAX_SCALE);

    // 以双指中点为中心缩放
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const midX = state.startMidX - rect.left;
      const midY = state.startMidY - rect.top;

      const worldX = (midX - state.startOffsetX) / state.startScale;
      const worldY = (midY - state.startOffsetY) / state.startScale;

      setScale(newScale);
      setOffset({
        x: midX - worldX * newScale,
        y: midY - worldY * newScale,
      });
    }
  } else if (state.mode === 'pan' && e.touches.length === 1) {
    // 拖动地图
    const t = e.touches[0];
    const dx = t.clientX - state.startX;
    const dy = t.clientY - state.startY;
    setOffset({
      x: state.startOffsetX + dx,
      y: state.startOffsetY + dy,
    });
  }
};

const handleTouchEnd = (e) => {
  const state = touchStateRef.current;

  // 触摸结束 → 重置状态
  if (e.touches.length === 0) {
    touchStateRef.current = {
      mode: null,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      startDistance: 0,
      startScale: 1,
      startMidX: 0,
      startMidY: 0,
    };
  } else if (e.touches.length === 1 && state.mode === 'pinch') {
    // 双指 → 单指，切换成拖动
    const t = e.touches[0];
    touchStateRef.current = {
      ...state,
      mode: 'pan',
      startX: t.clientX,
      startY: t.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  }
};

  const startDragFromInventory = (buildingId) => {
    if ((inventory[buildingId] || 0) <= 0) return;
    draggingRef.current = buildingId;
    setDragging(buildingId);
  };

  // ---------- 建筑管理菜单 ----------
  const openBuildingMenu = (idx) => setSelectedPlaced(idx);
  const closeBuildingMenu = () => setSelectedPlaced(null);

  const rotateBuilding = () => {
    if (selectedPlaced === null) return;
    setPlaced((prev) =>
      prev.map((p, i) =>
        i === selectedPlaced
          ? { ...p, rotation: ((p.rotation || 0) + 1) % 2 }
          : p
      )
    );
    closeBuildingMenu();
  };

  const removePlaced = () => {
    if (selectedPlaced === null) return;
    const item = placed[selectedPlaced];
    setPlaced((prev) => prev.filter((_, i) => i !== selectedPlaced));
    setInventory((prev) => ({
      ...prev,
      [item.buildingId]: (prev[item.buildingId] || 0) + 1,
    }));
    closeBuildingMenu();
  };

  // 修复受损建筑
  const RARITY_COST = { common: 10, rare: 30, epic: 50, legendary: 200 };

  const repairBuilding = () => {
    if (selectedPlaced === null) return;

    const item = placed[selectedPlaced];
    const b = BUILDINGS[item.buildingId];
    if (!b) return;

    const cost = RARITY_COST[b.rarity || 'common'] || 10;

    if (gold < cost) {
      alert(`金币不足！修复需要 ${cost} 金币，你只有 ${gold} 金币`);
      return;
    }

    setGold((g) => g - cost);
    setPlaced((prev) => prev.map((p, i) =>
      i === selectedPlaced
        ? { ...p, damaged: false, damagedAt: null }
        : p
    ));
    closeBuildingMenu();
  };

  // 仓库里只显示数量 > 0 的建筑
  const inventoryItems = Object.entries(BUILDINGS).filter(
    ([id]) => (inventory[id] || 0) > 0
  );

  // ---------- 渲染 ----------
  return (
    <div className={`castle-page ${open ? 'open' : ''}`}>
      <div className="castle-topbar">
        <button className="castle-back" onClick={onClose}>←</button>
        <div className="castle-topbar-title">我的城堡</div>
        <div className="glass gold-card">
          <img src={asset('coin.png')} alt="金币" className="gold-icon" />
          <span>{gold}</span>
        </div>
      </div>

      <div
  className="castle-viewport"
  ref={viewportRef}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  style={{ cursor: dragging === '__canvas__' ? 'grabbing' : 'grab' }}
>
        <div
          className="castle-world"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {(() => {
  // 计算所有被建筑覆盖的格子
  const coveredTiles = new Set();
  placed.forEach((p) => {
    const b = BUILDINGS[p.buildingId];
    const size = b?.size || 1;
    for (let dx = 0; dx < size; dx++) {
      for (let dy = 0; dy < size; dy++) {
        coveredTiles.add(`${p.x + dx}-${p.y + dy}`);
      }
    }
  });

  return Array.from({ length: GRID_SIZE }).map((_, x) =>
    Array.from({ length: GRID_SIZE }).map((_, y) => {
      const isWall =
        x === 0 || x === GRID_SIZE - 1 ||
        y === 0 || y === GRID_SIZE - 1;
      const hasBuilding = coveredTiles.has(`${x}-${y}`);
      return (
        <IsoTile
          key={`${x}-${y}`}
          x={x}
          y={y}
          isWall={isWall}
          hasBuilding={hasBuilding}
        />
      );
    })
  );
})()}

          {[...placed]
            .sort((a, b) => (a.x + a.y) - (b.x + b.y))
            .map((p, i) => (
              <PlacedBuilding
                key={`b-${i}`}
                x={p.x}
                y={p.y}
                buildingId={p.buildingId}
                rotation={p.rotation || 0}
                damaged={p.damaged || false}
                damageType={p.damageType || 'fire'}
                damagedAt={p.damagedAt || null}
                onClick={() => openBuildingMenu(placed.indexOf(p))}
              />
            ))}

          {hoverTile && dragging && dragging !== '__canvas__' && (
            <div
              className="hover-indicator"
              style={{
                left: isoToScreen(hoverTile.x, hoverTile.y).x,
                top: isoToScreen(hoverTile.x, hoverTile.y).y,
                width: TILE_W,
                height: TILE_H,
              }}
            />
          )}
        </div>
      </div>

      {selectedPlaced !== null && (
        <>
          <div
            className="building-menu-backdrop"
            onClick={closeBuildingMenu}
          />
          <div className="building-menu">
            <div className="building-menu-title">
              {BUILDINGS[placed[selectedPlaced]?.buildingId]?.name}
            </div>

            {/* 如果受损，显示修复按钮 */}
            {placed[selectedPlaced]?.damaged && (
              <>
                {(() => {
                  const item = placed[selectedPlaced];
                  if (item?.damagedAt) {
                    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
                    const remaining = THREE_DAYS - (Date.now() - item.damagedAt);
                    const days = remaining > 0 ? Math.ceil(remaining / (24 * 60 * 60 * 1000)) : 0;
                    return (
                      <div className="building-menu-warning">
                        ⚠️ 剩 {days} 天未修复将永久消失
                      </div>
                    );
                  }
                  return null;
                })()}
                <button
                  className="building-menu-item repair"
                  onClick={repairBuilding}
                >
                  🔧 花 {RARITY_COST[BUILDINGS[placed[selectedPlaced]?.buildingId]?.rarity || 'common'] || 10}
                  <img src={asset('coin.png')} alt="金币" className="gold-icon" />
                  修复
                </button>
              </>
            )}

            <button
              className="building-menu-item"
              onClick={rotateBuilding}
            >
              🔄 翻转方向
            </button>
            <button
              className="building-menu-item danger"
              onClick={removePlaced}
            >
              📦 移回仓库
            </button>
            <button
              className="building-menu-item cancel"
              onClick={closeBuildingMenu}
            >
              ✕ 取消
            </button>
          </div>
        </>
      )}

      <div className="castle-inventory">
        <div className="inventory-title">🏠 建筑仓库（拖拽到领地放置）</div>
        <div className="inventory-list">
          {inventoryItems.length === 0 ? (
            <div style={{
              padding: '20px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              textAlign: 'center',
              width: '100%',
            }}>
              仓库空空如也，去专注获得建筑吧
            </div>
          ) : (
            inventoryItems.map(([id, b]) => {
              const count = inventory[id] || 0;
              return (
                <div
  key={id}
  className={`inventory-item ${dragging === id ? 'dragging' : ''}`}
  onMouseDown={(e) => {
    e.stopPropagation();
    startDragFromInventory(id);
  }}
  onMouseUp={handleMouseUp}
  onTouchStart={(e) => {
    e.stopPropagation();
    e.preventDefault();
    startDragFromInventory(id);
  }}
  onTouchMove={(e) => {
    // 手指移动时，告诉 viewport 处理
    e.preventDefault();
  }}
  onTouchEnd={handleTouchEnd}
>
                  <div className="inventory-thumb">
                    <img src={b.imgs[0]} alt={b.name} />
                  </div>
                  <div className="inventory-name">{b.name}</div>
                  <div className="inventory-count">×{count}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}