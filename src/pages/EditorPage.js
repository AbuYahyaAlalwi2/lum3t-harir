import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditorPage.css';

const THREAD_COLORS = [
  { id:1, name:'Navy Blue', pantone:'287 C', hex:'#1a3a8a' },
  { id:2, name:'Metallic Gold', pantone:'872 C', hex:'#c9a84c' },
  { id:3, name:'Bright Red', pantone:'185 C', hex:'#cc2222' },
  { id:4, name:'Forest Green', pantone:'356 C', hex:'#1a7a3a' },
  { id:5, name:'Pure White', pantone:'White', hex:'#f0ede6' },
  { id:6, name:'Sky Blue', pantone:'292 C', hex:'#5a9ae0' },
];

const STITCH_TYPES = [
  { id:'satin', label:'ساتان', icon:'≡' },
  { id:'fill', label:'تعبئة', icon:'▦' },
  { id:'run', label:'عداء', icon:'⟶' },
  { id:'cross', label:'كروس', icon:'✕' },
  { id:'tatami', label:'تاتامي', icon:'▤' },
  { id:'chain', label:'سلسلة', icon:'⬡' },
];

const MENU_ITEMS = ['ملف','تحرير','عرض','تطريز','نص','أدوات','مساعدة'];

export default function EditorPage({ user, onLogout }) {
  const nav = useNavigate();
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('select');
  const [stitchType, setStitchType] = useState('satin');
  const [activeColor, setActiveColor] = useState(THREAD_COLORS[0]);
  const [activeTab, setActiveTab] = useState('props');
  const [zoom, setZoom] = useState(1);
  const [trueView, setTrueView] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x:0, y:0 });
  const [stitches, setStitches] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [layers, setLayers] = useState([{ id:1, name:'طبقة 1', color:'#1a3a8a', visible:true }]);
  const [density, setDensity] = useState('0.40');
  const [stitchLen, setStitchLen] = useState('3.5');
  const [fillAngle, setFillAngle] = useState('45');
  const [underlay, setUnderlay] = useState(true);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0,0,W,H);
    if (showGrid) {
      ctx.strokeStyle = 'rgba(201,168,76,0.05)'; ctx.lineWidth = 0.5;
      for (let x=0;x<W;x+=10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for (let y=0;y<H;y+=10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      ctx.strokeStyle = 'rgba(201,168,76,0.09)';
      for (let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for (let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    }
    ctx.strokeStyle = 'rgba(201,168,76,0.25)'; ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
    ctx.setLineDash([]);
    stitches.forEach(s => {
      if (!s.points || s.points.length < 2) return;
      ctx.save();
      if (s.type==='satin') {
        ctx.strokeStyle = s.color; ctx.lineWidth = 1.2;
        for (let i=0;i<s.points.length-1;i+=4) {
          ctx.beginPath();ctx.moveTo(s.points[i].x,s.points[i].y-3);ctx.lineTo(s.points[i].x,s.points[i].y+3);ctx.stroke();
        }
      } else if (s.type==='run') {
        ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.setLineDash([5,3]);
        ctx.beginPath();s.points.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = s.color; ctx.lineWidth = 1.5;
        ctx.beginPath();s.points.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));ctx.stroke();
      }
      ctx.restore();
    });
    if (currentPath.length > 1) {
      ctx.strokeStyle = 'rgba(201,168,76,0.7)'; ctx.lineWidth = 1.5; ctx.setLineDash([5,3]);
      ctx.beginPath();currentPath.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);
    }
  }, [stitches, currentPath, showGrid]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX-r.left, y: clientY-r.top };
  };

  const onMove = (e) => {
    const p = getPos(e);
    const W = canvasRef.current.width, H = canvasRef.current.height;
    setCursorPos({ x:((p.x-W/2)*200/W).toFixed(1), y:((H/2-p.y)*200/H).toFixed(1) });
    if (drawing) setCurrentPath(prev => [...prev.slice(-80), p]);
  };

  const onDown = (e) => {
    e.preventDefault();
    if (tool==='select'||tool==='zoom'||tool==='pan') return;
    setDrawing(true); setCurrentPath([getPos(e)]);
  };

  const onUp = () => {
    if (!drawing || currentPath.length < 2) { setDrawing(false); return; }
    setStitches(prev => [...prev, { id:Date.now(), type:stitchType, color:activeColor.hex, points:[...currentPath] }]);
    setCurrentPath([]); setDrawing(false);
  };

  const totalStitches = stitches.reduce((n,s) => n+(s.points?.length||0), 0);

  return (
    <div className="editor">
      <div className="menubar">
        <div className="app-brand">
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 29,18 44,18 33,27 37,42 24,33 11,42 15,27 4,18 19,18" fill="none" stroke="#C9A84C" strokeWidth="2"/>
          </svg>
          <span>لمعة حرير</span>
        </div>
        {MENU_ITEMS.map(m=><button key={m} className="menu-item">{m}</button>)}
        <div className="menubar-right">
          <span className="mb-badge mono" style={{direction:'ltr'}}>X:{cursorPos.x} Y:{cursorPos.y}</span>
          <button className="mb-icon-btn" onClick={()=>nav('/community')}>👥</button>
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.[0]}</div>
            <span className="user-name">{user?.name}</span>
          </div>
          <button className="mb-icon-btn" onClick={onLogout}>⏻</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="tb-group">
          <button className="tb-btn" title="جديد">📄</button>
          <button className="tb-btn" title="فتح">📂</button>
          <button className="tb-btn" title="حفظ">💾</button>
        </div>
        <div className="tb-sep"/>
        <div className="tb-group">
          <button className="tb-btn" onClick={()=>setStitches(p=>p.slice(0,-1))}>↩</button>
        </div>
        <div className="tb-sep"/>
        <div className="tb-group">
          <button className={`tb-btn${trueView?' active':''}`} onClick={()=>setTrueView(v=>!v)}>👁</button>
          <button className={`tb-btn${showGrid?' active':''}`} onClick={()=>setShowGrid(v=>!v)}>⊞</button>
        </div>
        <div className="tb-sep"/>
        <div className="tb-group">
          <span className="tb-label">نوع الغرزة</span>
          {STITCH_TYPES.map(st=>(
            <button key={st.id} className={`tb-stitch-btn${stitchType===st.id?' active':''}`}
              onClick={()=>setStitchType(st.id)} title={st.label}>{st.icon}</button>
          ))}
        </div>
        <div className="tb-right">
          <div className="zoom-ctrl">
            <button onClick={()=>setZoom(z=>Math.max(0.25,z-0.25))}>−</button>
            <span>{Math.round(zoom*100)}%</span>
            <button onClick={()=>setZoom(z=>Math.min(4,z+0.25))}>+</button>
          </div>
          <div className="license-badge">🔐 {user?.plan==='pro'?'Pro':'Free'}</div>
        </div>
      </div>

      <div className="editor-body">
        <div className="toolbox">
          {[
            {id:'select',label:'تحديد',icon:'⬡'},null,
            {id:'line',label:'خط',icon:'╱'},
            {id:'curve',label:'منحنى',icon:'∿'},
            {id:'shape',label:'شكل',icon:'⬠'},null,
            {id:'text',label:'نص',icon:'T'},
            {id:'satin',label:'ساتان',icon:'≡'},null,
            {id:'zoom',label:'تكبير',icon:'⊕'},
            {id:'pan',label:'يد',icon:'✋'},
          ].map((t,i) => t===null
            ? <div key={i} className="tool-divider"/>
            : <button key={t.id} className={`tool-btn${tool===t.id?' active':''}`} onClick={()=>setTool(t.id)} title={t.label}>
                <span style={{fontSize:'16px'}}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
          )}
        </div>

        <div className="canvas-area">
          <div className="ruler-corner">mm</div>
          <div className="ruler-h"/>
          <div className="ruler-v"/>
          <div className="canvas-viewport">
            <canvas ref={canvasRef} width={600} height={500} className="main-canvas"
              style={{transform:`scale(${zoom})`, cursor:tool==='pan'?'grab':tool==='zoom'?'zoom-in':tool==='select'?'default':'crosshair'}}
              onMouseMove={onMove} onMouseDown={onDown} onMouseUp={onUp} onMouseLeave={onUp}
              onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}/>
          </div>
          <div className="canvas-info">
            <span>غرز: {totalStitches}</span>
            <span>ألوان: {THREAD_COLORS.length}</span>
          </div>
        </div>

        <div className="right-panel">
          <div className="panel-tabs">
            {[['props','خصائص'],['colors','ألوان'],['layers','طبقات']].map(([id,label])=>(
              <button key={id} className={activeTab===id?'active':''} onClick={()=>setActiveTab(id)}>{label}</button>
            ))}
          </div>
          {activeTab==='props' && (
            <div className="panel-body">
              <div className="panel-section">
                <div className="section-title">نوع الغرزة</div>
                <div className="stitch-grid">
                  {STITCH_TYPES.map(st=>(
                    <button key={st.id} className={`stitch-btn${stitchType===st.id?' active':''}`} onClick={()=>setStitchType(st.id)}>
                      <span className="stitch-icon">{st.icon}</span><span>{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="panel-section">
                <div className="section-title">معاملات الغرزة</div>
                <div className="prop-row"><span>كثافة (مم)</span><input className="prop-input" value={density} onChange={e=>setDensity(e.target.value)} type="number" step="0.05" dir="ltr"/></div>
                <div className="prop-row"><span>طول الغرزة</span><input className="prop-input" value={stitchLen} onChange={e=>setStitchLen(e.target.value)} type="number" step="0.5" dir="ltr"/></div>
                <div className="prop-row"><span>زاوية التعبئة</span><input className="prop-input" value={fillAngle} onChange={e=>setFillAngle(e.target.value)} type="number" step="5" dir="ltr"/></div>
              </div>
              <div className="panel-section">
                <div className="section-title">المكمل</div>
                <div className="prop-row"><span>تفعيل</span>
                  <label className="toggle"><input type="checkbox" checked={underlay} onChange={e=>setUnderlay(e.target.checked)}/><span className="toggle-track"/></label>
                </div>
              </div>
              <div className="panel-section">
                <div className="section-title">لون الخيط</div>
                <div className="active-thread">
                  <div className="at-swatch" style={{background:activeColor.hex}}/>
                  <div className="at-info"><strong>{activeColor.name}</strong><span>Pantone {activeColor.pantone}</span></div>
                </div>
              </div>
            </div>
          )}
          {activeTab==='colors' && (
            <div className="panel-body">
              <div className="panel-section">
                <div className="section-title">خيوط المشروع</div>
                <div className="thread-list">
                  {THREAD_COLORS.map(c=>(
                    <div key={c.id} className={`thread-item${activeColor.id===c.id?' active':''}`} onClick={()=>setActiveColor(c)}>
                      <div className="t-swatch" style={{background:c.hex}}/>
                      <div className="t-info"><span className="t-name">{c.name}</span><span className="t-pantone">Pantone {c.pantone}</span></div>
                      <span className="t-count">{stitches.filter(s=>s.color===c.hex).length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab==='layers' && (
            <div className="panel-body">
              <div className="panel-section">
                <div className="section-title">الطبقات</div>
                <div className="layer-list">
                  {layers.map(l=>(
                    <div key={l.id} className="layer-item">
                      <div className="l-swatch" style={{background:l.color}}/>
                      <span className="l-name">{l.name}</span>
                      <button className="l-eye">👁</button>
                    </div>
                  ))}
                  <button className="add-layer-btn" onClick={()=>setLayers(p=>[...p,{id:Date.now(),name:`طبقة ${p.length+1}`,color:'#808080'}])}>+ طبقة جديدة</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-panel">
        <div className="bp-seq">
          <div className="bp-title">تسلسل الخيوط</div>
          <div className="seq-list">
            {THREAD_COLORS.slice(0,4).map((c,i)=>(
              <div key={c.id} className={`seq-item${i===0?' active':''}`}>
                <div className="seq-dot" style={{background:c.hex}}/>
                <span>{i+1}. {c.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bp-stats">
          <div className="bp-title">إحصائيات</div>
          <div className="stats-grid">
            <div className="stat-box"><span className="stat-val">{totalStitches}</span><span className="stat-lbl">الغرز</span></div>
            <div className="stat-box"><span className="stat-val">{layers.length}</span><span className="stat-lbl">الطبقات</span></div>
            <div className="stat-box"><span className="stat-val">{Math.ceil(totalStitches/500)}د</span><span className="stat-lbl">الوقت</span></div>
            <div className="stat-box"><span className="stat-val">{Math.ceil(totalStitches*0.04)}كب</span><span className="stat-lbl">الحجم</span></div>
          </div>
        </div>
        <div className="bp-preview">
          <div className="bp-title">معاينة TrueView</div>
          <div className="preview-box">
            {stitches.length===0 ? <span className="preview-empty">ابدأ الرسم لترى المعاينة</span> : <span className="preview-empty">✓ {totalStitches} غرزة</span>}
          </div>
        </div>
      </div>

      <div className="statusbar">
        <div className="sb-item"><span className="sb-dot green"/><span>جاهز</span></div>
        <div className="sb-item"><span className="sb-lbl">أداة:</span><span>{tool}</span></div>
        <div className="sb-item"><span className="sb-lbl">غرزة:</span><span>{stitchType}</span></div>
        <div className="sb-item"><span className="sb-lbl">إطار:</span><span>200×200 مم</span></div>
        <div className="sb-item sb-right"><span className="sb-dot gold"/><span>لمعة حرير v1.0 — {user?.name}</span></div>
      </div>
    </div>
  );
}
