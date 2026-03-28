import React, { useState } from 'react';
import './AuthPage.css';

const DEMO_USER = { id:'demo', name:'مستخدم تجريبي', email:'demo@lum3t-harir.app', plan:'pro', licenseKey:'LH-DEMO-0000' };

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    if (mode === 'login') {
      if (email === 'demo@lum3t-harir.app' && password === 'demo1234') {
        onLogin(DEMO_USER);
      } else { setError('البريد أو كلمة المرور غير صحيحة'); }
    } else {
      if (!name || !email || !password || !key) { setError('يرجى ملء جميع الحقول'); }
      else if (key.startsWith('LH-')) { onLogin({ id:Date.now(), name, email, plan:'pro', licenseKey:key }); }
      else { setError('مفتاح الترخيص غير صالح'); }
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-orbs">
        <div className="orb orb1"/><div className="orb orb2"/>
      </div>
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 29,18 44,18 33,27 37,42 24,33 11,42 15,27 4,18 19,18" fill="none" stroke="#C9A84C" strokeWidth="2"/>
          </svg>
          <div><h1>لمعة حرير</h1><p>محرر التطريز الاحترافي</p></div>
        </div>
        <div className="auth-tabs">
          <button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('')}}>تسجيل الدخول</button>
          <button className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('')}}>حساب جديد</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode==='register' && <div className="field"><label>الاسم الكامل</label><input type="text" placeholder="محمد أحمد" value={name} onChange={e=>setName(e.target.value)}/></div>}
          <div className="field"><label>البريد الإلكتروني</label><input type="email" placeholder="example@email.com" value={email} onChange={e=>setEmail(e.target.value)} dir="ltr"/></div>
          <div className="field"><label>كلمة المرور</label><input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} dir="ltr"/></div>
          {mode==='register' && <div className="field"><label>مفتاح الترخيص</label><input type="text" placeholder="LH-XXXX-XXXX" value={key} onChange={e=>setKey(e.target.value.toUpperCase())} dir="ltr"/></div>}
          {error && <div className="auth-error">⚠ {error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="spinner"/> : mode==='login' ? 'دخول' : 'إنشاء الحساب'}
          </button>
        </form>
        <div className="auth-demo">
          <span>للتجربة:</span><code>demo@lum3t-harir.app</code><span>/</span><code>demo1234</code>
        </div>
        <div className="auth-license-info">
          <div>🔒</div>
          <div><strong>ترخيص مرتبط بحسابك</strong><p>يمكنك تثبيت التطبيق على أي جهاز. لا يمكن نقل الترخيص دون موافقة الشركة.</p></div>
        </div>
        <div className="auth-footer">
          <span>© 2025 لمعة حرير</span>
        </div>
      </div>
    </div>
  );
}
