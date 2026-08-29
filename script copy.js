/* =========================================================================
   FSDM AI STUDENT — shared behavior
   1. Ambient neural-network canvas (mouse-reactive)
   2. HUD live clock (used on every page's status bar)
   3. Glass panel cursor-glow + gentle 3D tilt
   4. Mobile nav toggle + active-link highlight
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  initMobileNav();
  initHUDClock();
  initPanelInteraction();
  initNeuralCanvas();
  initFilters();
  initSchedulePage();
  initAcademicYear();
});

/* ---------- dynamic academic-year readout on the homepage ---------- */
function initAcademicYear() {
  const el = document.getElementById('live-year');
  if (!el) return;
  const now = new Date();
  const y = now.getFullYear();
  // academic year runs Sept -> June in Morocco
  const startYear = now.getMonth() >= 8 ? y : y - 1;
  el.textContent = `${startYear}/${String(startYear + 1).slice(-2)}`;
}

/* ---------- schedule page: big clock + next-class engine ---------- */
function initSchedulePage() {
  const bigClock = document.getElementById('live-clock');
  if (!bigClock) return;

  const dateEl = document.getElementById('live-date');
  const dayTitle = document.getElementById('selected-day-title');
  const picker = document.getElementById('day-picker');
  const daily = document.getElementById('daily-schedule');

  const dayNames = {
    1: ['Monday', 'Lundi', 'الاثنين'],
    2: ['Tuesday', 'Mardi', 'الثلاثاء'],
    3: ['Wednesday', 'Mercredi', 'الأربعاء'],
    4: ['Thursday', 'Jeudi', 'الخميس'],
    5: ['Friday', 'Vendredi', 'الجمعة'],
    6: ['Saturday', 'Samedi', 'السبت']
  };
  const monthNames = {
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
    ar: ['يناير','فبراير','مارس','أبريل','ماي','يونيو','يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر']
  };

  const typeNames = {
    'type-cm': {en:'CM — Lecture', fr:'CM — Cours', ar:'CM — محاضرة'},
    'type-td': {en:'TD — Tutorial', fr:'TD — Travaux dirigés', ar:'TD — أعمال موجهة'},
    'type-tp': {en:'TP — Lab', fr:'TP — Travaux pratiques', ar:'TP — أعمال تطبيقية'}
  };

  const slotEls = Array.from(document.querySelectorAll('.slot[data-day]'));
  const slots = slotEls.map(el => ({
    day: Number(el.dataset.day),
    start: el.dataset.start,
    end: el.dataset.end,
    name: el.querySelector('.s-name')?.textContent.trim() || '',
    room: el.querySelector('.s-room')?.textContent.trim() || '',
    type: Array.from(el.classList).find(c => c.startsWith('type-')) || 'type-cm'
  }));

  const today = new Date();
  let selectedDay = today.getDay();
  if (selectedDay < 1 || selectedDay > 6) selectedDay = 1;

  function currentLang() {
    return typeof window.currentLang === 'string' ? window.currentLang : 'en';
  }

  function renderClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    bigClock.innerHTML = `${hh}<span>:</span>${mm}<span class="sec">:${ss}</span>`;

    const lang = currentLang();
    const days = lang === 'fr'
      ? ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi']
      : lang === 'ar'
        ? ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
        : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${monthNames[lang][now.getMonth()] || monthNames.en[now.getMonth()]} ${now.getFullYear()}`;
  }

  function renderDaily() {
    const lang = currentLang();
    const dayIndex = lang === 'ar' ? 2 : lang === 'fr' ? 1 : 0;
    dayTitle.textContent = dayNames[selectedDay][dayIndex];

    picker.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.day) === selectedDay);
    });

    const daySlots = slots
      .filter(s => s.day === selectedDay)
      .sort((a,b) => a.start.localeCompare(b.start));

    if (!daySlots.length) {
      daily.innerHTML = `<div class="panel daily-empty">${
        lang === 'ar' ? 'لا توجد حصص مبرمجة لهذا اليوم.'
        : lang === 'fr' ? 'Aucun cours programmé pour ce jour.'
        : 'No classes scheduled for this day.'
      }</div>`;
      return;
    }

    daily.innerHTML = daySlots.map(s => {
      const type = typeNames[s.type]?.[lang] || typeNames[s.type]?.en || '';
      return `<article class="panel daily-item">
        <div class="daily-time">${s.start}<br>${s.end}</div>
        <div>
          <div class="daily-name">${s.name}</div>
          <div class="daily-room">${s.room}</div>
        </div>
        <div class="daily-type">${type}</div>
      </article>`;
    }).join('');
  }

  picker.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDay = Number(btn.dataset.day);
      renderDaily();
    });
  });

  window.__scheduleRender = () => {
    renderClock();
    renderDaily();
  };

  renderClock();
  renderDaily();
  setInterval(renderClock, 1000);
}

function initFilters() {
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const items = document.querySelectorAll(group.dataset.filterGroup);
    group.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const val = btn.dataset.filter;
        items.forEach(item => {
          const tags = (item.dataset.filterTags || '').split(',');
          item.style.display = (val === 'all' || tags.includes(val)) ? '' : 'none';
        });
      });
    });
  });
}

/* ---------- active nav link ---------- */
function markActiveNav() {
  const page = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.hud-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ---------- mobile nav ---------- */
function initMobileNav() {
  const btn = document.querySelector('.hud-burger');
  const nav = document.querySelector('.hud-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ---------- HUD clock ---------- */
function initHUDClock() {
  const el = document.getElementById('hud-clock-time');
  if (!el) return;
  const fmt = () => {
    const d = new Date();
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    el.textContent = time;
  };
  fmt();
  setInterval(fmt, 1000);
}

/* ---------- glass panel cursor glow + tilt ---------- */
function initPanelInteraction() {
  const panels = document.querySelectorAll('.panel');
  panels.forEach(panel => {
    panel.addEventListener('pointermove', (e) => {
      const r = panel.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      panel.style.setProperty('--mx', x + '%');
      panel.style.setProperty('--my', y + '%');

      if (panel.classList.contains('tilt')) {
        const rx = ((y - 50) / 50) * -4;
        const ry = ((x - 50) / 50) * 4;
        panel.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      }
    });
    panel.addEventListener('pointerleave', () => {
      if (panel.classList.contains('tilt')) {
        panel.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
      }
    });
  });
}

/* ---------- ambient neural network canvas ---------- */
function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let w, h, dpr;
  let nodes = [];
  const mouse = { x: null, y: null, active: false };
  const MAX_LINK_DIST = 150;
  const MOUSE_LINK_DIST = 220;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((w * h) / 26000);
    nodes = Array.from({ length: Math.min(count, 90) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.6,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // update
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    // links between nodes
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_LINK_DIST) {
          const alpha = (1 - dist / MAX_LINK_DIST) * 0.18;
          ctx.strokeStyle = `rgba(90, 200, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      // link to mouse
      if (mouse.active) {
        const dx = nodes[i].x - mouse.x, dy = nodes[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_LINK_DIST) {
          const alpha = (1 - dist / MOUSE_LINK_DIST) * 0.5;
          ctx.strokeStyle = `rgba(139, 123, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(160, 225, 255, 0.55)';
      ctx.fill();
    }

    // mouse glow node
    if (mouse.active) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
      grad.addColorStop(0, 'rgba(139,123,255,0.35)');
      grad.addColorStop(1, 'rgba(139,123,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('pointerleave', () => { mouse.active = false; });

  resize();
  requestAnimationFrame(step);
}


/* ---------- simple AR / FR / ENG switcher ---------- */
const LANG = {
  en: {
    "HOME":"HOME","MODULES":"MODULES","SCHEDULE":"SCHEDULE","ANNOUNCEMENTS":"ANNOUNCEMENTS",
    "Semestre 5 — Group A":"Semester 5 — Group A","Schedule":"Schedule",
    "Announcements":"Announcements","Course index":"Course index","Modules & Resources":"Modules & Resources",
    "WEEKLY TIMETABLE":"DAILY SCHEDULE","DAILY SCHEDULE":"DAILY SCHEDULE",
    "ALL":"ALL","Semesters tracked":"Semesters tracked","Modules indexed":"Modules indexed",
    "Tool shortcuts":"Tool shortcuts","Academic year":"Academic year",
    "لا توجد إعلانات حالياً":"No announcements currently","لا توجد أي إعلانات جديدة في الوقت الحالي.":"There are no new announcements at the moment.",
    "موقع الإعلاميات التطبيقية":"موقع الإعلاميات التطبيقية",
    "hero_title": 'Applied <span class="grad">Informatics Portal</span>',
    "hero_subtitle": "The Applied Informatics Student Portal — FSDM. Modules & News.",
    "btn-schedule": "▸ View History",
    "btn-modules": "Browse modules",
    "lab-year": "Academic year",
    "lab-modules": "Available modules",
    "lab-semesters": "Active semesters",
    "lab-s3-soon": "S3 coming soon",
    "lab-status": "Status",
    "p5-title": "Maarouf Space",
    "p5-desc": "External Link ↗",
    "p5-link": "View Space →"
  },
  fr: {
    "HOME":"ACCUEIL","MODULES":"MODULES","SCHEDULE":"EMPLOI DU TEMPS","ANNOUNCEMENTS":"ANNONCES",
    "Semestre 5 — Group A":"Semestre 5 — Groupe A","Schedule":"Emploi du temps",
    "Announcements":"Annonces","Course index":"Index des cours","Modules & Ressources":"Modules & Ressources",
    "WEEKLY TIMETABLE":"EMPLOI DU TEMPS QUOTIDIEN","DAILY SCHEDULE":"EMPLOI DU TEMPS QUOTIDIEN",
    "ALL":"TOUT","Semesters tracked":"Semestres suivis","Modules indexed":"Modules indexés",
    "Tool shortcuts":"Raccourcis outils","Academic year":"Année universitaire",
    "لا توجد إعلانات حالياً":"Aucune annonce actuellement","لا توجد أي إعلانات جديدة في الوقت الحالي.":"Aucune nouvelle annonce pour le moment.",
    "موقع الإعلاميات التطبيقية":"موقع الإعلاميات التطبيقية",
    "hero_title": 'Portail des <span class="grad">Études Informatiques</span>',
    "hero_subtitle": "Le portail des étudiants d'Informatique Appliquée — FSDM. Modules & Actualités.",
    "btn-schedule": "▸ Consulter l'historique",
    "btn-modules": "Parcourir les modules",
    "lab-year": "Année universitaire",
    "lab-modules": "Modules disponibles",
    "lab-semesters": "Semestres actifs",
    "lab-s3-soon": "S3 bientôt disponible",
    "lab-status": "Statut",
    "p5-title": "Maarouf Space",
    "p5-desc": "Lien externe ↗",
    "p5-link": "Visiter l'espace →"
  },
  ar: {
    "HOME":"الرئيسية","MODULES":"الوحدات","SCHEDULE":"الجدول","ANNOUNCEMENTS":"الإعلانات",
    "Semestre 5 — Group A":"السداسي 5 — المجموعة A","Schedule":"الجدول",
    "Announcements":"الإعلانات","Course index":"فهرس المقررات","Modules & Resources":"الوحدات والموارد",
    "WEEKLY TIMETABLE":"الجدول اليومي","DAILY SCHEDULE":"الجدول اليومي",
    "ALL":"الكل","Semesters tracked":"الفصول الدراسية","Modules indexed":"الوحدات",
    "Tool shortcuts":"اختصارات الأدوات","Academic year":"السنة الجامعية",
    "موقع الإعلاميات التطبيقية":"موقع الإعلاميات التطبيقية",
    "hero_title": 'موقع <span class="grad">الإعلاميات التطبيقية</span>',
    "hero_subtitle": "بوابة طلبة الإعلاميات التطبيقية — FSDM. الوحدات والإعلانات.",
    "btn-schedule": "▸ عرض التاريخ",
    "btn-modules": "تصفح الوحدات",
    "lab-year": "السنة الجامعية",
    "lab-modules": "الوحدات المتوفرة",
    "lab-semesters": "الفصول الحالية",
    "lab-s3-soon": "سيضاف S3 قريباً",
    "lab-status": "الحالة",
    "p5-title": "Maarouf Space",
    "p5-desc": "  ↗",
    "p5-link": "زيارة الفضاء ←"
  }
};

function applyLanguage(lang){
  if(!LANG[lang]) return;
  localStorage.setItem('fsdm-language',lang);
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';

  const all=Object.keys(LANG.en);
  const nodes=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()) nodes.push(walker.currentNode);

  // Restore English before applying another language.
  nodes.forEach(node=>{
    const value=node.nodeValue.trim();
    if(!value) return;
    for(const key of all){
      if(value===LANG.fr[key] || value===LANG.ar[key] || value===LANG.en[key]){
        node.nodeValue=node.nodeValue.replace(value,LANG.en[key]);
        break;
      }
    }
  });

  nodes.forEach(node=>{
    const value=node.nodeValue.trim();
    if(!value) return;
    const translated=LANG[lang][value];
    if(translated) node.nodeValue=node.nodeValue.replace(value,translated);
  });

  // تحديث العنوان الرئيسي والشرح ديناميكياً
  const titleEl = document.getElementById('hero-main-title');
  if (titleEl && LANG[lang] && LANG[lang]["hero_title"]) {
      titleEl.innerHTML = LANG[lang]["hero_title"];
  }

  const subtitleEl = document.getElementById('hero-subtitle');
  if (subtitleEl && LANG[lang] && LANG[lang]["hero_subtitle"]) {
      subtitleEl.textContent = LANG[lang]["hero_subtitle"];
  }

  // تحديث الأزرار والبطاقات عبر الـ IDs (تزادو ديال البطاقة الخامسة)
  const elementsToTranslate = {
      'btn-schedule': 'btn-schedule',
      'btn-modules': 'btn-modules',
      'lab-year': 'lab-year',
      'lab-modules': 'lab-modules',
      'lab-semesters': 'lab-semesters',
      'lab-s3-soon': 'lab-s3-soon',
      'lab-status': 'lab-status',
      'p5-title': 'p5-title',
      'p5-desc': 'p5-desc',
      'p5-link': 'p5-link'
  };

  for (const [id, key] of Object.entries(elementsToTranslate)) {
      const el = document.getElementById(id);
      if (el && LANG[lang] && LANG[lang][key]) {
          el.textContent = LANG[lang][key];
      }
  }

  document.querySelectorAll('.lang-switcher button').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.lang===lang);
  });

  if(typeof window.__scheduleRender==='function') window.__scheduleRender();
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.lang-switcher button').forEach(btn=>{
    btn.addEventListener('click',()=>applyLanguage(btn.dataset.lang));
  });
  applyLanguage(localStorage.getItem('fsdm-language')||'en');
});