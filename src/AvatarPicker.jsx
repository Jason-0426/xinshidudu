import React, { useRef, useState } from 'react';
import { PRESET_AVATARS, getAvatarDisplay } from './avatarOptions';
import { VIP_AVATARS } from './vipConfig';
import './index.css';

export default function AvatarPicker({
  open,
  onClose,
  avatar,
  setAvatar,
  onConfirm,
  onUploadPhoto,    // 可选：上传照片的回调（以后接 Supabase Storage）
  isFirstTime = false,
  isVip = false,
}) {
  const [tab, setTab] = useState('preset'); // 'preset' | 'upload'
  const fileInputRef = useRef(null);

  if (!open) return null;

  const display = getAvatarDisplay(avatar);

  const pickPreset = (id) => {
    setAvatar({ type: 'preset', value: id });
  };

  // 选择本地图片
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('图片不能超过 2MB');
      return;
    }

    // 先用本地 URL 预览（临时）
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      if (onUploadPhoto) {
        // 有上传回调 → 交给 App 处理（上传到 Supabase）
        onUploadPhoto(file, dataUrl);
      } else {
        // 没有 → 先本地预览
        setAvatar({ type: 'custom', value: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="avatar-picker-backdrop">
      <div className="avatar-picker-modal">
        {/* 标题 */}
        <div className="avatar-picker-header">
          <div className="avatar-picker-title">
            {isFirstTime ? '选择你的头像' : '更换头像'}
          </div>
          {!isFirstTime && (
            <button className="avatar-picker-close" onClick={onClose}>✕</button>
          )}
        </div>

        {/* 当前头像预览 */}
        <div className="avatar-picker-preview">
          <img src={display.src} alt="头像" className="avatar-preview-img" />
        </div>

        {/* Tab 切换 */}
        <div className="avatar-picker-tabs">
          <button
            className={`avatar-tab ${tab === 'preset' ? 'active' : ''}`}
            onClick={() => setTab('preset')}
          >
            🎨 预设头像
          </button>
          <button
            className={`avatar-tab ${tab === 'upload' ? 'active' : ''}`}
            onClick={() => setTab('upload')}
          >
            📷 上传照片
          </button>
        </div>

        {/* 内容 */}
        <div className="avatar-picker-body">
          {tab === 'preset' && (
            <div className="avatar-grid">
              {PRESET_AVATARS.map((a) => {
                const isVipAvatar = VIP_AVATARS.includes(a.id);
                const locked = isVipAvatar && !isVip;
                return (
                  <button
                    key={a.id}
                    className={`avatar-grid-item ${avatar.type === 'preset' && avatar.value === a.id ? 'selected' : ''} ${locked ? 'vip-locked' : ''}`}
                    onClick={() => !locked && pickPreset(a.id)}
                    disabled={locked}
                    title={locked ? `${a.name}（VIP 专属）` : a.name}
                  >
                    <img src={a.img} alt={a.name} />
                    {isVipAvatar && (
                      <span className="vip-avatar-badge">👑</span>
                    )}
                    {locked && (
                      <span className="vip-avatar-lock">🔒</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'upload' && (
            <div className="avatar-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button className="avatar-upload-btn" onClick={triggerUpload}>
                <div className="avatar-upload-icon">📷</div>
                <div className="avatar-upload-text">选择图片</div>
                <div className="avatar-upload-hint">
                  从相册选择或拍照（最大 2MB）
                </div>
              </button>
              {avatar.type === 'custom' && (
                <div className="avatar-upload-preview">
                  <img src={avatar.value} alt="预览" />
                  <div className="avatar-upload-success">✅ 已上传</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="avatar-picker-footer">
          {isFirstTime && (
            <div className="avatar-picker-hint">
              可随时在「用户资料」里更换
            </div>
          )}
          <button className="avatar-confirm-btn" onClick={onConfirm}>
            {isFirstTime ? '开始冒险' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}