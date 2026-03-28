import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CommunityPage.css';

const POSTS = [
  { id:1, user:'أحمد المطرفي', avatar:'أ', time:'منذ ساعتين', title:'شعار نادي قدم بغرزة ساتان', tags:['شعار','رياضة'], likes:24, comments:8, color:'#1a3a8a' },
  { id:2, user:'نورة السالم', avatar:'ن', time:'منذ 5 ساعات', title:'خط عربي كلاسيكي — بسم الله', tags:['خط عربي','ديني'], likes:47, comments:15, color:'#c9a84c' },
  { id:3, user:'محمد العتيبي', avatar:'م', time:'أمس', title:'تصميم ورد ثلاثي الأبعاد', tags:['زهور','3D'], likes:31, comments:6, color:'#1a7a3a' },
];
const QUESTIONS = [
  { id:1, user:'خالد الدوسري', avatar:'خ', time:'منذ ساعة', q:'كيف أضبط كثافة غرزة الساتان للقماش الرقيق؟', answers:3, solved:true },
  { id:2, user:'ريم الشمري', avatar:'ر', time:'منذ 3 ساعات', q:'ما الفرق بين underlay الزيجزاج والمستقيم؟', answers:5, solved:true },
  { id:3, user:'عبدالله النمر', avatar:'ع', time:'منذ يوم', q:'كيف أصدر بصيغة DST لماكينة Tajima؟', answers:1, solved:false },
];

export default function CommunityPage({ user, onLogout }) {
  const nav = useNavigate();
  const [tab, setTab] = useState('designs');
  const [liked, setLiked] = useState({});

  return (
    <div className="community">
      <div className="comm-header">
        <div className="comm-brand">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 29,18 44,18 33,27 37,42 24,33 11,42 15,27 4,18 19,18" fill="none" stroke="#C9A84C" strokeWidth="2"/>
          </svg>
          <span>لمعة حرير</span>
          <span className="comm-title-sep">›</span>
          <span className="comm-title-label">المجتمع</span>
        </div>
        <div className="comm-header-right">
          <button className="comm-back" onClick={()=>nav('/editor')}>← العودة للمحرر</button>
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.[0]}</div>
            <span className="user-name">{user?.name}</span>
          </div>
        </div>
      </div>
      <div className="comm-tabs">
        <button className={tab==='designs'?'active':''} onClick={()=>setTab('designs')}>🎨 التصاميم<span className="tab-count">{POSTS.length}</span></button>
        <button className={tab==='questions'?'active':''} onClick={()=>setTab('questions')}>❓ الأسئلة<span className="tab-count">{QUESTIONS.length}</span></button>
        <button className="comm-new-btn">+ مشاركة جديدة</button>
      </div>
      <div className="comm-body">
        {tab==='designs' && (
          <div className="designs-grid">
            {POSTS.map(p=>(
              <div key={p.id} className="design-card">
                <div className="design-preview" style={{background:`${p.color}22`}}>
                  <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
                    <polygon points="24,4 29,18 44,18 33,27 37,42 24,33 11,42 15,27 4,18 19,18" fill="none" stroke={p.color} strokeWidth="2"/>
                  </svg>
                  <div className="design-overlay"><button className="design-open-btn">فتح التصميم</button></div>
                </div>
                <div className="design-info">
                  <div className="design-user">
                    <div className="d-avatar">{p.avatar}</div>
                    <div><span className="d-name">{p.user}</span><span className="d-time">{p.time}</span></div>
                  </div>
                  <div className="design-title">{p.title}</div>
                  <div className="design-tags">{p.tags.map(t=><span key={t} className="design-tag">{t}</span>)}</div>
                  <div className="design-actions">
                    <button className={`d-btn${liked[p.id]?' liked':''}`} onClick={()=>setLiked(l=>({...l,[p.id]:!l[p.id]}))}>
                      {liked[p.id]?'♥':'♡'} {p.likes+(liked[p.id]?1:0)}
                    </button>
                    <button className="d-btn">💬 {p.comments}</button>
                    <button className="d-btn">⬇ تنزيل</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==='questions' && (
          <div className="questions-list">
            {QUESTIONS.map(q=>(
              <div key={q.id} className="question-card">
                <div>{q.solved?<span className="q-solved">✓ محلول</span>:<span className="q-open">مفتوح</span>}</div>
                <div className="q-body">
                  <div className="q-user"><div className="d-avatar">{q.avatar}</div><span className="d-name">{q.user}</span><span className="d-time">{q.time}</span></div>
                  <div className="q-text">{q.q}</div>
                  <div className="q-meta"><span>💬 {q.answers} إجابة</span><button className="q-reply-btn">أجب</button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
