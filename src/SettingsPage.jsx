import React, { useState, useEffect } from 'react';
import './index.css';

const STORAGE_KEY = 'xinshidudu_settings';

const DEFAULT_SETTINGS = {
  whiteNoiseVolume: 60,
  masterVolume: 80,
  uiSound: true,
  defaultDuration: 25,
  defaultPomodoroWork: 25,
  defaultPomodoroBreak: 5,
  autoNextRound: false,
  endReminder: true,
  dailyReminder: false,
  dailyReminderTime: '20:00',
  animations: true,
  weatherParticles: true,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {}
}

export default function SettingsPage({
  open,
  onClose,
  onClearData,
  onLogout,
  userEmail,
  theme = 'midnight',
  setTheme,
  themes = [],
}) {
  const [settings, setSettings] = useState(() => loadSettings());
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    if (!window.confirm('确定要清除所有数据吗？\n（金币、仓库、领地、设置都会重置）')) return;
    localStorage.removeItem(STORAGE_KEY);
    setSettings({ ...DEFAULT_SETTINGS });
    if (onClearData) onClearData();
  };

  const handleLogoutClick = () => {
    setConfirmLogout(true);
  };

  const confirmLogoutYes = () => {
    setConfirmLogout(false);
    if (onLogout) onLogout();
  };

  return (
    <div className={`settings-page ${open ? 'open' : ''}`}>
      {/* 顶部栏 */}
      <div className="castle-topbar">
        <button className="castle-back" onClick={onClose}>←</button>
        <div className="castle-topbar-title">偏好设置</div>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="settings-content">

        {/* ============ 账号 ============ */}
        <div className="settings-group">
          <div className="settings-group-title">👤 账号</div>

          <div className="settings-row">
            <div className="settings-label-simple">登录邮箱</div>
            <div className="settings-email">{userEmail || '未登录'}</div>
          </div>

          <div className="settings-row">
            <button className="settings-logout-btn" onClick={handleLogoutClick}>
              🚪 退出登录
            </button>
          </div>
        </div>

        {/* ============ 音效 ============ */}
        <div className="settings-group">
          <div className="settings-group-title">🔊 音效</div>

          <div className="settings-row">
            <div className="settings-label">
              <span>白噪音音量</span>
              <span className="settings-value">{settings.whiteNoiseVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.whiteNoiseVolume}
              onChange={(e) => update('whiteNoiseVolume', Number(e.target.value))}
              className="settings-slider"
            />
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <span>主音量</span>
              <span className="settings-value">{settings.masterVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.masterVolume}
              onChange={(e) => update('masterVolume', Number(e.target.value))}
              className="settings-slider"
            />
          </div>

          <div className="settings-row inline">
            <span className="settings-label-simple">界面音效</span>
            <button
              className={`toggle ${settings.uiSound ? 'on' : ''}`}
              onClick={() => update('uiSound', !settings.uiSound)}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        {/* ============ 专注 ============ */}
        <div className="settings-group">
          <div className="settings-group-title">⏱ 专注</div>

          <div className="settings-row">
            <div className="settings-label-simple">默认专注时长</div>
            <div className="settings-btn-group">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  className={`settings-chip ${settings.defaultDuration === m ? 'active' : ''}`}
                  onClick={() => update('defaultDuration', m)}
                >
                  {m}分
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label-simple">番茄工作</div>
            <div className="settings-btn-group">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  className={`settings-chip ${settings.defaultPomodoroWork === m ? 'active' : ''}`}
                  onClick={() => update('defaultPomodoroWork', m)}
                >
                  {m}分
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-label-simple">番茄休息</div>
            <div className="settings-btn-group">
              {[5, 10, 15].map((m) => (
                <button
                  key={m}
                  className={`settings-chip ${settings.defaultPomodoroBreak === m ? 'active' : ''}`}
                  onClick={() => update('defaultPomodoroBreak', m)}
                >
                  {m}分
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row inline">
            <span className="settings-label-simple">自动开始下一轮</span>
            <button
              className={`toggle ${settings.autoNextRound ? 'on' : ''}`}
              onClick={() => update('autoNextRound', !settings.autoNextRound)}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        {/* ============ 提醒 ============ */}
        <div className="settings-group">
          <div className="settings-group-title">🔔 提醒</div>

          <div className="settings-row inline">
            <span className="settings-label-simple">专注结束提醒</span>
            <button
              className={`toggle ${settings.endReminder ? 'on' : ''}`}
              onClick={() => update('endReminder', !settings.endReminder)}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <div className="settings-row inline">
            <span className="settings-label-simple">每日提醒</span>
            <button
              className={`toggle ${settings.dailyReminder ? 'on' : ''}`}
              onClick={() => update('dailyReminder', !settings.dailyReminder)}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          {settings.dailyReminder && (
            <div className="settings-row inline">
              <span className="settings-label-simple">提醒时间</span>
              <input
                type="time"
                value={settings.dailyReminderTime}
                onChange={(e) => update('dailyReminderTime', e.target.value)}
                className="settings-time"
              />
            </div>
          )}
        </div>

        {/* ============ 外观 ============ */}
<div className="settings-group">
  <div className="settings-group-title">🎨 外观</div>

  {/* 主题选择器 */}
  <div className="settings-row">
    <div className="settings-label-simple">主题</div>
    <div className="theme-picker">
      {themes.map((t) => (
        <button
          key={t.id}
          className={`theme-option ${theme === t.id ? 'active' : ''}`}
          onClick={() => setTheme && setTheme(t.id)}
        >
          <span className="theme-option-emoji">{t.emoji}</span>
          <span className="theme-option-name">{t.name}</span>
          <span className="theme-option-desc">{t.desc}</span>
        </button>
      ))}
    </div>
  </div>

  {/* 动画效果 */}
  <div className="settings-row inline">
    <span className="settings-label-simple">动画效果</span>
            <button
              className={`toggle ${settings.animations ? 'on' : ''}`}
              onClick={() => update('animations', !settings.animations)}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <div className="settings-row inline">
            <span className="settings-label-simple">天气粒子</span>
            <button
              className={`toggle ${settings.weatherParticles ? 'on' : ''}`}
              onClick={() => update('weatherParticles', !settings.weatherParticles)}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        {/* ============ 数据 ============ */}
        <div className="settings-group">
          <div className="settings-group-title">🗑️ 数据</div>

          <div className="settings-row">
            <button className="settings-danger-btn" onClick={handleClear}>
              清除所有数据
            </button>
            <div className="settings-hint">
              金币、仓库、领地、设置都会重置
            </div>
          </div>
        </div>

        <div style={{ height: 40 }}></div>
      </div>

      {/* ---------- 退出登录确认弹窗 ---------- */}
      {confirmLogout && (
        <>
          <div
            className="picker-backdrop active"
            onClick={() => setConfirmLogout(false)}
          />
          <div className="custom-input-modal">
            <div className="custom-input-title">确认退出登录？</div>
            <div className="logout-confirm-text">
              退出后需要重新登录才能访问你的数据
            </div>
            <div className="custom-input-actions">
              <button
                className="custom-btn cancel"
                onClick={() => setConfirmLogout(false)}
              >
                取消
              </button>
              <button
                className="custom-btn confirm"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                onClick={confirmLogoutYes}
              >
                退出
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}