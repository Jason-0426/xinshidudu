import React, { useState } from 'react';
import { supabase } from './supabase';
import './index.css';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setSuccessMsg('');
  };

  // 把 Supabase 英文错误翻译成中文
  const translateError = (msg) => {
    const m = (msg || '').toLowerCase();
    if (m.includes('invalid login credentials')) return '邮箱或密码错误';
    if (m.includes('user already registered')) return '该邮箱已注册，请直接登录';
    if (m.includes('password should be at least')) return '密码至少 6 位';
    if (m.includes('invalid email')) return '邮箱格式不正确';
    if (m.includes('email not confirmed')) return '邮箱未验证，请先到邮箱点击验证链接';
    if (m.includes('rate limit')) return '操作太频繁，请稍后再试';
    if (m.includes('failed to fetch') || m.includes('network')) {
      return '网络连接失败，请检查网络后重试';
    }
    return msg || '操作失败，请重试';
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('请输入邮箱');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('两次密码不一致');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        if (data.user) {
          onLogin(data.user);
        }
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (err) throw err;

        if (data.user && !data.session) {
          setSuccessMsg('注册成功！请到邮箱点击验证链接，然后返回登录。');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        } else if (data.session) {
          onLogin(data.user);
        }
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };
    return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="信誓读读" className="login-logo-img" />
        <div className="login-slogan">专注建造你的城堡</div>

        {/* 模式切换 */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            登录
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            注册
          </button>
        </div>

        {/* 输入框 */}
        <div className="login-form">
          <div className="login-field">
            <label className="login-label">邮箱</label>
            <input
              type="email"
              className="login-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label className="login-label">密码</label>
            <input
              type="password"
              className="login-input"
              placeholder="至少 6 位"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'register' && (
            <div className="login-field">
              <label className="login-label">确认密码</label>
              <input
                type="password"
                className="login-input"
                placeholder="再输入一次"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <div className="login-error">⚠️ {error}</div>}
          {successMsg && <div className="login-success">✅ {successMsg}</div>}

          <button
            className="login-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? '处理中...'
              : mode === 'login'
                ? '登录'
                : '注册'}
          </button>
        </div>

        {/* 底部说明 */}
        <div className="login-footer">
          {mode === 'login' ? (
            <>
              还没有账号？
              <button className="login-link" onClick={() => switchMode('register')}>
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？
              <button className="login-link" onClick={() => switchMode('login')}>
                去登录
              </button>
            </>
          )}
        </div>

        <div className="login-hint">
          注册后请到邮箱点击验证链接
        </div>
      </div>
    </div>
  );
}