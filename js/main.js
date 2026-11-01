/* ============================================================
   抵制校园霸凌 · Web 演示版  交互脚本
   - 舞台自适应缩放
   - 翻页（按钮 / 键盘 / 圆点）
   - 华丽色带切换 + 第9→10 泪滴落水特效
   - 互动：视频 / 情景判定 / 投票 / 选择 / 匿名纸条 / 签名
   - 动态背景粒子
   ============================================================ */
(function(){
  "use strict";

  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;
  let busy = false;

  const wipe = document.getElementById('wipe');
  const tdFx = document.getElementById('tdFx');
  const counterEl = document.getElementById('cur');
  const progEl = document.getElementById('progress');
  const dotsEl = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  /* ---------- 舞台缩放 ---------- */
  const stage = document.getElementById('stage');
  function fit(){
    const s = Math.min(window.innerWidth/1280, window.innerHeight/720) * 0.98;
    stage.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- 圆点导航 ---------- */
  slides.forEach((s, i)=>{
    const d = document.createElement('button');
    d.className = 'dot' + (i===0?' active':'');
    d.title = (i+1) + '. ' + (s.dataset.name||'');
    d.addEventListener('click', ()=> go(i));
    dotsEl.appendChild(d);
  });
  const dots = Array.from(dotsEl.children);

  function updateUI(){
    counterEl.textContent = current + 1;
    progEl.style.width = ((current+1)/total*100) + '%';
    dots.forEach((d,i)=> d.classList.toggle('active', i===current));
    prevBtn.disabled = current===0;
    nextBtn.disabled = current===total-1;
  }

  function setActive(i){
    slides.forEach((s,k)=> s.classList.toggle('active', k===i));
  }

  /* ---------- 华丽切换（方向感知） ---------- */
  function wipeTransition(swap){
    busy = true;
    wipe.classList.remove('play'); void wipe.offsetWidth; wipe.classList.add('play');
    setTimeout(swap, 400);
    setTimeout(()=>{ wipe.classList.remove('play'); busy = false; }, 920);
  }

  /* 第9 → 第10 页：文字隐去、泪滴坠落、水波扩散、第10页自水面浮现 */
  function teardropTransition(swap){
    busy = true;
    const fx = tdFx;
    fx.innerHTML = '';
    const water = document.createElement('div'); water.className = 'td-water';
    const r1 = document.createElement('div'); r1.className = 'td-ripple r1';
    const r2 = document.createElement('div'); r2.className = 'td-ripple r2';
    const r3 = document.createElement('div'); r3.className = 'td-ripple r3';
    fx.appendChild(water); fx.appendChild(r1); fx.appendChild(r2); fx.appendChild(r3);

    // 取第9页泪滴位置，生成飞行泪滴（无缝衔接）
    const tearSrc = slides[8].querySelector('.tint');
    let sx = window.innerWidth/2, sy = window.innerHeight*0.32;
    if(tearSrc){ const r = tearSrc.getBoundingClientRect(); sx = r.left + r.width/2; sy = r.top + r.height/2; }
    const tear = document.createElement('div'); tear.className = 'td-tear';
    tear.style.left = sx + 'px'; tear.style.top = sy + 'px'; tear.style.opacity = '1';
    fx.appendChild(tear);

    fx.classList.add('show');
    slides[8].classList.add('td-fade');           // 第9页文字淡出，仅留泪滴
    void fx.offsetWidth;

    // 泪滴坠向中央水面
    requestAnimationFrame(()=>{
      tear.style.transition = 'top 1.05s cubic-bezier(.55,0,.72,.4), left .9s ease, opacity .3s';
      tear.style.left = (window.innerWidth/2) + 'px';
      tear.style.top  = (window.innerHeight/2 - 27) + 'px';
    });

    // 入水：水波扩散
    setTimeout(()=>{ fx.classList.add('run'); tear.style.opacity = '0'; tear.style.transform = 'rotate(45deg) scale(.4)'; }, 1060);

    // 第10页自水面浮现
    setTimeout(()=>{ swap(); }, 1860);

    // 水面褪去，露出第10页
    setTimeout(()=>{ fx.classList.remove('show'); }, 2320);

    // 收尾
    setTimeout(()=>{
      slides[8].classList.remove('td-fade');
      slides[9].classList.remove('td-emerge');
      fx.className = ''; fx.innerHTML = '';
      busy = false;
    }, 3360);
  }

  function go(target, forceWipe){
    target = Math.max(0, Math.min(total-1, target));
    if(target === current || busy) return;
    const dir = target > current ? 1 : -1;
    const isSpecial = (!forceWipe && current === 8 && target === 9); // 第9页 → 第10页
    const inc = slides[target];
    inc.classList.remove('enter-next','enter-prev');
    inc.classList.add(dir > 0 ? 'enter-next' : 'enter-prev');
    void inc.offsetWidth;
    current = target;
    updateUI();
    if(isSpecial){
      teardropTransition(()=>{
        setActive(target);
        inc.classList.remove('enter-next','enter-prev');
        inc.classList.add('td-emerge');
      });
    } else {
      wipeTransition(()=>{
        setActive(target);
        inc.classList.remove('enter-next','enter-prev');
      });
    }
  }

  /* ---------- 事件 ---------- */
  prevBtn.addEventListener('click', ()=> go(current-1, true));
  nextBtn.addEventListener('click', ()=> go(current+1));

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' '){ e.preventDefault(); go(current+1); }
    else if(e.key === 'ArrowLeft' || e.key === 'PageUp'){ e.preventDefault(); go(current-1, true); }
    else if(e.key === 'Home'){ go(0, true); }
    else if(e.key === 'End'){ go(total-1, true); }
    else if(e.key === 'f' || e.key === 'F'){ toggleFs(); }
  });

  function toggleFs(){
    if(!document.fullscreenElement){ document.documentElement.requestFullscreen?.(); }
    else { document.exitFullscreen?.(); }
  }
  document.getElementById('fsBtn').addEventListener('click', toggleFs);

  /* ============================================================
     互动环节
     ============================================================ */

  /* 视频：点击海报播放 */
  const poster = document.getElementById('videoPoster');
  const video = document.getElementById('introVideo');
  if(poster && video){
    poster.addEventListener('click', ()=>{
      poster.classList.add('hide');
      video.play().catch(()=>{});
    });
  }

  /* 互动①：点击情景卡显示判定 */
  document.querySelectorAll('.scn').forEach(card=>{
    card.addEventListener('click', ()=>{
      const v = card.dataset.v;
      card.classList.add('show', v);
      card.querySelector('.verdict').textContent = card.dataset.t;
    });
  });

  /* 互动②：投票计数 */
  document.querySelectorAll('.vc').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      let n = parseInt(btn.dataset.count, 10) || 0; n++;
      btn.dataset.count = n;
      btn.querySelector('.cnt').textContent = n;
      btn.animate(
        [{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],
        {duration:300, easing:'ease-out'}
      );
    });
  });

  /* 互动③：情景选择高亮 */
  document.querySelectorAll('.choice').forEach(box=>{
    box.querySelectorAll('.opt').forEach(opt=>{
      opt.addEventListener('click', ()=>{
        box.querySelectorAll('.opt').forEach(o=> o.classList.remove('pick'));
        opt.classList.add('pick');
      });
    });
  });

  /* 互动④：匿名纸条投入信箱 */
  const mailBtn = document.getElementById('mailBtn');
  const noteInput = document.getElementById('noteInput');
  const flyNote = document.getElementById('flyNote');
  if(mailBtn){
    mailBtn.addEventListener('click', ()=>{
      const txt = (noteInput.value||'').trim();
      if(!txt){ noteInput.focus(); return; }
      const btnR = mailBtn.getBoundingClientRect();
      const boxR = document.querySelector('.mailbox').getBoundingClientRect();
      flyNote.textContent = '已投入信箱 💌';
      flyNote.style.left = (btnR.left + 20) + 'px';
      flyNote.style.top = (btnR.top - 10) + 'px';
      flyNote.style.opacity = '1';
      flyNote.style.transition = 'none';
      flyNote.style.transform = 'translate(0,0) scale(1)';
      requestAnimationFrame(()=>{
        flyNote.style.transition = 'all .9s cubic-bezier(.5,0,.3,1)';
        flyNote.style.transform = 'translate(' + (boxR.left - btnR.left + 30) + 'px,' + (boxR.top - btnR.top - 10) + 'px) scale(.7)';
        flyNote.style.opacity = '0';
      });
      noteInput.value = '';
      mailBtn.textContent = '已投递 ✓';
      setTimeout(()=>{ mailBtn.textContent = '投入暖心信箱 →'; }, 1500);
    });
  }

  /* 互动⑤：签名 */
  document.querySelectorAll('.sign-line').forEach(line=>{
    line.addEventListener('click', ()=>{
      const name = prompt('请输入你的名字（用于班级承诺书）：', '');
      if(name && name.trim()){
        line.textContent = name.trim();
        line.classList.add('filled');
      }
    });
  });

  /* ============================================================
     动态背景粒子（缓慢上升的光点）
     ============================================================ */
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, parts = [];
  const PCOL = ['180,210,240','242,179,60','46,158,107','232,84,63','127,168,217'];
  function resizeCanvas(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function initParts(){
    parts = [];
    const n = Math.min(80, Math.floor(W*H/20000));
    for(let i=0;i<n;i++){
      parts.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: Math.random()*2.6 + 0.8,
        sp: Math.random()*0.35 + 0.12,
        a: Math.random()*0.5 + 0.15,
        tw: Math.random()*0.02 + 0.005,
        ph: Math.random()*Math.PI*2,
        c: PCOL[Math.floor(Math.random()*PCOL.length)]
      });
    }
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(const p of parts){
      p.y -= p.sp; p.ph += p.tw;
      if(p.y < -10){ p.y = H + 10; p.x = Math.random()*W; }
      const alpha = p.a * (0.6 + 0.4*Math.sin(p.ph));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(' + p.c + ',' + alpha + ')';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas(); initParts(); draw();

  /* ---------- 初始化 ---------- */
  setActive(0);
  updateUI();
})();
