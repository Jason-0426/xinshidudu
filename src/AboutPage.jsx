import React, { useState } from 'react';
import './index.css';

const APP_VERSION = '1.0.0';

// ---------- 子页面内容 ----------
const TERMS_TEXT = `
欢迎使用「信誓读读」。

1. 服务说明
信誓读读是一款游戏化专注工具，帮助用户通过专注获得建筑，建造属于自己的虚拟城堡。

2. 用户行为
您同意不利用本应用从事任何违反当地法律法规的行为。

3. 虚拟资产
应用内的金币、建筑、领地等均为虚拟资产，仅在本应用内有效，不可兑换为现实货币。

4. 服务变更
我们保留随时修改、暂停或终止服务的权利。

5. 免责声明
本应用按"现状"提供，不对因使用本应用造成的任何损失负责。

6. 协议更新
本协议可能会更新，更新后继续使用即视为接受新协议。

如有疑问，请联系我们。
`;

const PRIVACY_TEXT = `
我们重视您的隐私。

1. 我们收集什么
• 账号信息（如使用登录功能）
• 专注记录（时长、时间）
• 设备信息（用于优化体验）

2. 我们如何使用
• 展示您的专注统计数据
• 保存您的虚拟资产
• 改进产品体验

3. 我们不做什么
• 不向第三方出售您的个人数据
• 不用于广告推送

4. 数据存储
您的数据存储在我们的服务器或本地。您可以随时通过「偏好设置 → 清除所有数据」删除本地数据。

5. 第三方服务
如果使用 Google / Email 登录，受对应平台隐私政策约束。

6. 联系我们
如有隐私相关问题，请通过「联系我们」页面联系。

最后更新：2026-09-20
`;

const CONTACT_INFO = [
  { icon: '📧', label: '邮箱', value: 'hello@xinshidudu.app' },
  { icon: '💬', label: 'Discord', value: 'xinshidudu' },
  { icon: '🐦', label: 'Twitter / X', value: '@xinshidudu' },
  { icon: '🐙', label: 'GitHub', value: 'github.com/xinshidudu' },
];

const ROADMAP = [
  { icon: '🔐', title: '账号登录', desc: 'Google / Email 登录，多设备同步', status: '开发中' },
  { icon: '🎉', title: '派对功能', desc: '和朋友一起专注、共建领地', status: '开发中' },
  { icon: '🏘️', title: '更多建筑', desc: '更多种类的建筑与装饰', status: '计划中' },
  { icon: '🏆', title: '成就系统', desc: '解锁徽章，展示你的专注历程', status: '计划中' },
  { icon: '🎵', title: '更多音乐', desc: '更多环境音乐与白噪音', status: '计划中' },
];

export default function AboutPage({ open, onClose }) {
  const [subPage, setSubPage] = useState(null); // null | 'terms' | 'privacy' | 'contact' | 'feedback'

  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const openSub = (key) => setSubPage(key);
  const closeSub = () => {
    setSubPage(null);
    setFeedbackSent(false);
    setFeedbackTitle('');
    setFeedbackContent('');
  };

  const submitFeedback = () => {
    if (!feedbackContent.trim()) {
      alert('请填写反馈内容');
      return;
    }
    setFeedbackSent(true);
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert(`已复制：${text}`);
      }).catch(() => {
        alert(text);
      });
    } else {
      alert(text);
    }
  };

  return (
    <div className={`about-page ${open ? 'open' : ''}`}>
      {/* 顶部栏 */}
      <div className="castle-topbar">
        <button className="castle-back" onClick={onClose}>←</button>
        <div className="castle-topbar-title">关于</div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* 内容 */}
      <div className="about-content">
        {/* Logo + 名字 */}
        <div className="about-hero">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="信誓读读"
            className="about-logo-img"
          />
          <div className="about-name">信誓读读</div>
          <div className="about-version">版本 {APP_VERSION}</div>
          <div className="about-slogan">「专注建造你的城堡」</div>
        </div>

        {/* 产品介绍 */}
        <div className="about-section">
          <div className="about-section-title">📖 产品介绍</div>
          <div className="about-section-text">
            信誓读读是一款游戏化专注 App。
            通过专注获得金币与建筑，建造属于你的专属城堡。
            让每一次专注，都变成城堡里的一块砖。
          </div>
        </div>

        {/* 特色功能 */}
        <div className="about-section">
          <div className="about-section-title">🌟 特色功能</div>
          <ul className="about-feature-list">
            <li>⏱️ 番茄钟 / 倒计时 / 正计时</li>
            <li>🏰 2.5D 等距像素城堡领地</li>
            <li>🌦️ 天气粒子 + 4 种白噪音</li>
            <li>🎨 建筑收集、摆放、旋转</li>
            <li>🛒 建筑商店与稀有度系统</li>
          </ul>
        </div>

        {/* 开发路线图 */}
        <div className="about-section">
          <div className="about-section-title">🎯 开发路线图</div>
          <div className="about-roadmap">
            {ROADMAP.map((r) => (
              <div key={r.title} className="roadmap-item">
                <div className="roadmap-icon">{r.icon}</div>
                <div className="roadmap-body">
                  <div className="roadmap-title">{r.title}</div>
                  <div className="roadmap-desc">{r.desc}</div>
                </div>
                <div className={`roadmap-status status-${r.status === '开发中' ? 'wip' : 'plan'}`}>
                  {r.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 个入口 */}
        <div className="about-section">
          <div className="about-section-title">📌 更多</div>
          <div className="about-links">
            <button className="about-link-item" onClick={() => openSub('terms')}>
              <span className="about-link-label">📄 用户协议</span>
              <span className="about-link-arrow">›</span>
            </button>
            <button className="about-link-item" onClick={() => openSub('privacy')}>
              <span className="about-link-label">🔒 隐私政策</span>
              <span className="about-link-arrow">›</span>
            </button>
            <button className="about-link-item" onClick={() => openSub('contact')}>
              <span className="about-link-label">📧 联系我们</span>
              <span className="about-link-arrow">›</span>
            </button>
            <button className="about-link-item" onClick={() => openSub('feedback')}>
              <span className="about-link-label">🐛 反馈问题</span>
              <span className="about-link-arrow">›</span>
            </button>
          </div>
        </div>

        {/* 致谢 + 版权 */}
        <div className="about-footer">
          <div className="about-thanks">💝 感谢使用信誓读读</div>
          <div className="about-copyright">
            © 2026 信誓读读 · Made with ❤️
          </div>
        </div>

        <div style={{ height: 40 }}></div>
      </div>

      {/* ============================================================
          子页面（叠加在关于页上方）
          ============================================================ */}
      <div className={`about-subpage ${subPage ? 'open' : ''}`}>
        {/* 顶部栏 */}
        <div className="castle-topbar">
          <button className="castle-back" onClick={closeSub}>←</button>
          <div className="castle-topbar-title">
            {subPage === 'terms' && '用户协议'}
            {subPage === 'privacy' && '隐私政策'}
            {subPage === 'contact' && '联系我们'}
            {subPage === 'feedback' && '反馈问题'}
          </div>
          <div style={{ width: 40 }}></div>
        </div>

        <div className="subpage-content">
          {/* ---------- 用户协议 ---------- */}
          {subPage === 'terms' && (
            <pre className="subpage-text">{TERMS_TEXT}</pre>
          )}

          {/* ---------- 隐私政策 ---------- */}
          {subPage === 'privacy' && (
            <pre className="subpage-text">{PRIVACY_TEXT}</pre>
          )}

          {/* ---------- 联系我们 ---------- */}
          {subPage === 'contact' && (
            <>
              <div className="contact-hint">
                💬 点击任意联系方式即可复制
              </div>
              <div className="contact-list">
                {CONTACT_INFO.map((c) => (
                  <button
                    key={c.label}
                    className="contact-item"
                    onClick={() => copyToClipboard(c.value)}
                  >
                    <span className="contact-icon">{c.icon}</span>
                    <div className="contact-body">
                      <div className="contact-label">{c.label}</div>
                      <div className="contact-value">{c.value}</div>
                    </div>
                    <span className="contact-copy">📋</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ---------- 反馈问题 ---------- */}
          {subPage === 'feedback' && (
            <>
              {feedbackSent ? (
                <div className="feedback-success">
                  <div className="feedback-success-icon">💚</div>
                  <div className="feedback-success-title">感谢你的反馈！</div>
                  <div className="feedback-success-text">
                    我们会认真阅读每一条反馈，并尽快改进
                  </div>
                  <button className="feedback-back-btn" onClick={closeSub}>
                    返回
                  </button>
                </div>
              ) : (
                <>
                  <div className="feedback-hint">
                    🐛 遇到 Bug 或有建议？告诉我们，一起让信誓读读更好
                  </div>
                  <div className="feedback-field">
                    <label className="feedback-label">问题类型</label>
                    <div className="feedback-chips">
                      {['Bug 反馈', '功能建议', '体验问题', '其他'].map((t) => (
                        <button
                          key={t}
                          className={`feedback-chip ${feedbackTitle === t ? 'active' : ''}`}
                          onClick={() => setFeedbackTitle(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="feedback-field">
                    <label className="feedback-label">详细描述</label>
                    <textarea
                      className="feedback-textarea"
                      placeholder="请描述你遇到的问题或想法……"
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <button className="feedback-submit" onClick={submitFeedback}>
                    提交反馈
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}