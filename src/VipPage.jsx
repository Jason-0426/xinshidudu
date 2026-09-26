import React, { useState } from 'react';
import {
  VIP_PRICE,
  VIP_CURRENCY,
  VIP_QR_IMAGE,
  VIP_CONTACT_TEXT,
  VIP_CONTACT_WA,
  VIP_PERKS,
  isVip,
} from './vipConfig';
import './index.css';

export default function VipPage({
  open,
  onClose,
  profile,
  setProfile,
}) {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrError, setQrError] = useState(false);
  const vip = isVip(profile);

  // 用户点了"我已付款"
  const handleIPaid = () => {
    alert(
      '感谢支持！\n\n' +
      '请把转账截图发给我：\n' +
      VIP_CONTACT_WA + '\n\n' +
      '管理员确认后会为你激活 VIP，请稍等。'
    );
    setQrModalOpen(false);
  };

  return (
    <div className={`vip-page ${open ? 'open' : ''}`}>
      {/* 顶部栏 */}
      <div className="castle-topbar">
        <button className="castle-back" onClick={onClose}>←</button>
        <div className="castle-topbar-title">VIP</div>
        <div style={{ width: 36 }}></div>
      </div>

      <div className="vip-content">

        {/* ============================================================
            VIP 头部：皇冠 + 标题
            ============================================================ */}
        <div className={`vip-hero ${vip ? 'is-vip' : ''}`}>
          <div className="vip-hero-crown">
            {vip ? '👑' : '💎'}
          </div>
          <div className="vip-hero-title">
            {vip ? '你已是 VIP' : '成为 VIP'}
          </div>
          <div className="vip-hero-sub">
            {vip ? '感谢你的支持！' : '一次购买，永久享受'}
          </div>
        </div>

        {/* ============================================================
            已激活信息
            ============================================================ */}
        {vip && profile?.vip?.activatedAt && (
          <div className="vip-activated-info">
            ✅ 已于 {profile.vip.activatedAt} 激活
          </div>
        )}

        {/* ============================================================
            特权列表
            ============================================================ */}
        <div className="vip-section-title">
          🎁 专属特权
        </div>

        <div className="vip-perks">
          {VIP_PERKS.map((perk, i) => (
            <div key={i} className="vip-perk-item">
              <div className="vip-perk-icon">{perk.icon}</div>
              <div className="vip-perk-body">
                <div className="vip-perk-name">{perk.name}</div>
                <div className="vip-perk-desc">{perk.desc}</div>
              </div>
              {vip && <div className="vip-perk-check">✓</div>}
            </div>
          ))}
        </div>

        {/* ============================================================
            价格 + 购买按钮（VIP 时不显示）
            ============================================================ */}
        {!vip && (
          <>
            <div className="vip-price-card">
              <div className="vip-price-label">永久 VIP</div>
              <div className="vip-price-value">
                {VIP_CURRENCY} {VIP_PRICE}
              </div>
              <div className="vip-price-hint">一次购买 · 永久有效</div>
            </div>

            <button
              className="vip-buy-btn"
              onClick={() => setQrModalOpen(true)}
            >
              💎 立即购买 VIP
            </button>
          </>
        )}

        {vip && (
          <div className="vip-thanks">
            👑 你已拥有全部 VIP 特权
          </div>
        )}

        <div style={{ height: 40 }}></div>
      </div>

      {/* ============================================================
          二维码弹窗
          ============================================================ */}
      {qrModalOpen && (
        <>
          <div
            className="picker-backdrop active"
            onClick={() => setQrModalOpen(false)}
          />
          <div className="vip-qr-modal">
            <div className="vip-qr-title">扫码付款</div>
            <div className="vip-qr-price">
              {VIP_CURRENCY} {VIP_PRICE}
            </div>

            <div className="vip-qr-img-wrap">
              {qrError ? (
                <div className="vip-qr-placeholder" style={{ display: 'flex' }}>
                  <div style={{ fontSize: 40 }}>📱</div>
                  <div>二维码未放入</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>
                    请把 TNG 收款码保存为 public/tng-qr.png
                  </div>
                </div>
              ) : (
                <img
                  src={VIP_QR_IMAGE}
                  alt="TNG 收款码"
                  className="vip-qr-img"
                  onError={() => setQrError(true)}
                />
              )}
            </div>

            <div className="vip-qr-hint">
              {VIP_CONTACT_TEXT}
            </div>

            <div className="vip-qr-contact">
              {VIP_CONTACT_WA}
            </div>

            <div className="vip-qr-actions">
              <button
                className="custom-btn cancel"
                onClick={() => setQrModalOpen(false)}
              >
                取消
              </button>
              <button
                className="custom-btn confirm"
                onClick={handleIPaid}
              >
                ✓ 我已付款
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}