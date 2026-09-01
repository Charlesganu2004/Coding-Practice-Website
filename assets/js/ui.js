/* ui.js — router and views. */

(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const app = () => $('#app');

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const pct = v => v == null ? '—' : Math.round(v * 100) + '%';
  const LETTER = ['A', 'B', 'C', 'D', 'E', 'F'];

  function toast(msg) {
    const old = $('.toast'); if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  const go = h => { location.hash = h; };
  const top = () => window.scrollTo(0, 0);

  /* ================= text size ================= */

  const SCALE_KEY = 'cpw:scale';
  const SCALES = { sm: 0.9, md: 1.15, lg: 1.4 };

  function applyScale(name) {
    const v = SCALES[name] || SCALES.md;
    document.documentElement.style.setProperty('--scale', v);
    try { localStorage.setItem(SCALE_KEY, name); } catch (e) {}
    document.querySelectorAll('.text-size button').forEach(b =>
      b.classList.toggle('on', b.getAttribute('data-scale') === name));
  }

  function initScale() {
    let name = 'md';
    try { name = localStorage.getItem(SCALE_KEY) || 'md'; } catch (e) {}
    applyScale(name);
    document.querySelectorAll('.text-size button').forEach(b => {
      b.addEventListener('click', () => applyScale(b.getAttribute('data-scale')));
    });
  }

  /* ================= fragments ================= */

  function levelLadder(id) {
    return '<div class="ladder">' + window.LEVELS.map(l =>
      '<div class="' + (l.id === id ? 'at' : (l.id < id ? 'below' : '')) + '">' +
      esc(l.name) + '</div>').join('') + '</div>';
  }

  function meter(label, value, cls) {
    const w = value == null ? 0 : Math.round(value * 100);
    return '<div class="meter-row"><div><div class="lab">' + esc(label) + '</div>' +
      '<div class="bar ' + (cls || '') + '"><span style="width:' + w + '%"></span></div></div>' +
      '<div class="val">' + (value == null ? 'not measured' : w + '%') + '</div></div>';
  }

  const diffBadge = d => '<span class="badge b-' + esc(String(d).toLowerCase()) + '">' + esc(d) + '</span>';
  const tierBadge = t => '<span class="badge b-' + esc(t) + '">' + esc(t) + '</span>';
  const statusBadge = st => {
    const m = { solved: 'Solved', close: 'Close', attempted: 'Tried', new: 'Not started' };
    return '<span class="badge b-' + esc(st) + '">' + esc(m[st] || st) + '</span>';
  };

  /* ================= roadmap ================= */

  function renderRoadmapSvg(domainId) {
    const map = window.Roadmap.map(domainId);
    if (!map) return '';
    const W = window.Roadmap.NODE_W, H = window.Roadmap.NODE_H;
    const passed = id => Engine.sectionProgress(id).passed;
    const byId = {};
    map.nodes.forEach(n => { byId[n.id] = n; });

    let svg = '<svg class="roadmap-svg" viewBox="0 0 ' + map.width + ' ' + map.height + '" ' +
      'role="img" aria-label="' + esc(map.title) + ' dependency map">';

    map.edges.forEach(([a, b]) => {
      const na = byId[a], nb = byId[b];
      if (!na || !nb) return;
      const lit = passed(a);
      svg += '<path class="rm-edge' + (lit ? ' lit' : '') + '" d="' +
        window.Roadmap.edgePath(na, nb) + '"/>';
    });

    map.nodes.forEach(n => {
      const sec = window.DB.sectionById[n.id];
      if (!sec) return;
      const b = window.DB.bySection[n.id] || { problems: [], questions: [], lessons: [] };
      const prog = Engine.sectionProgress(n.id);
      const unlocked = window.Roadmap.isUnlocked(domainId, n.id, passed);
      const cls = prog.passed ? 'done' : (unlocked ? 'active' : 'locked');
      const total = b.problems.length;
      const sub = prog.passed
        ? 'passed · ' + prog.solved + '/' + total
        : total ? prog.solved + ' / ' + total + ' solved' : b.questions.length + ' questions';

      svg += '<g class="rm-node ' + cls + '" data-section="' + esc(n.id) + '" ' +
        'tabindex="0" role="link" aria-label="' + esc(sec.name) + ', ' + esc(sub) + '">' +
        '<rect class="rm-node-box" x="' + n.x + '" y="' + n.y + '" width="' + W + '" height="' + H + '"/>' +
        '<text x="' + (n.x + 16) + '" y="' + (n.y + 27) + '" font-size="17">' + esc(sec.name) + '</text>' +
        '<text class="rm-sub" x="' + (n.x + 16) + '" y="' + (n.y + 49) + '" font-size="14">' + esc(sub) + '</text>' +
        (prog.passed
          ? '<text x="' + (n.x + W - 22) + '" y="' + (n.y + 30) + '" font-size="20" fill="#5fe08d">✓</text>'
          : '') +
        '</g>';
    });

    svg += '</svg>';
    return svg;
  }

  function wireRoadmap() {
    app().querySelectorAll('.rm-node').forEach(g => {
      const open = () => go('#/section/' + g.getAttribute('data-section'));
      g.addEventListener('click', open);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }

  function viewRoadmap(domainId) {
    const dom = window.DB.domainById[domainId];
    if (!dom || !window.Roadmap.map(domainId)) return viewLearn();
    const map = window.Roadmap.map(domainId);

    let h = '<div class="crumb"><a href="#/learn">Learn</a> / ' + esc(dom.name) + '</div>' +
      '<h1>' + esc(map.title) + '</h1><div class="sub">' + esc(map.blurb) + '</div>' +
      '<div class="roadmap-wrap anim-in">' + renderRoadmapSvg(domainId) + '</div>' +
      '<div class="rm-legend">' +
      '<span><i style="border-color:var(--accent);background:#12293a"></i>Open now</span>' +
      '<span><i style="border-color:var(--green);background:#12291d"></i>Passed</span>' +
      '<span><i style="border-color:var(--line);background:var(--panel-2);opacity:.5"></i>Earlier topics first</span>' +
      '</div>' +
      '<div class="note" style="margin-top:26px"><b>Nothing here is hard-locked.</b> The dimmed ' +
      'nodes are just topics whose prerequisites you have not cleared yet — if the placement exam ' +
      'says you are already strong somewhere, jump straight to it.</div>';

    app().innerHTML = h;
    wireRoadmap();
  }

  /* ================= dashboard ================= */

  function viewHome() {
    const st = Engine.state;
    const stats = window.DB.stats();
    if (!st.placementDone) return viewPlacementIntro(true);

    const last = Engine.latestPlacement();
    const delta = Engine.placementDelta();
    const analysis = {
      sectionScores: last.sectionScores || {},
      domainScores: last.domainScores || {},
      sectionCounts: {},
      weakest: Object.keys(last.sectionScores || {})
        .sort((a, b) => last.sectionScores[a] - last.sectionScores[b]).slice(0, 8)
    };
    Object.keys(analysis.sectionScores).forEach(k => { analysis.sectionCounts[k] = 2; });

    let h = '<div class="panel panel-accent anim-in"><div class="between">' +
      '<div><div class="eyebrow">Current standing</div>' +
      '<h1 style="margin:0">' + esc(last.levelName || 'Unmeasured') + '</h1>' +
      '<div class="sub" style="margin:10px 0 0">' +
      esc((window.LEVELS[last.levelId || 0] || {}).blurb || '') + '</div></div>' +
      '<div class="row"><a class="btn btn-ghost" href="#/progress">History</a>' +
      '<a class="btn" href="#/placement">Re-take diagnostic</a></div></div>' +
      levelLadder(last.levelId || 0) + '</div>';

    if (delta) {
      const m = delta.levelMoved;
      h += '<div class="panel anim-in"><div class="eyebrow">Since your last diagnostic</div>' +
        '<div style="font-size:var(--fs-md);margin-bottom:14px">' + esc(delta.levelBefore) +
        ' → <b style="color:var(--accent)">' + esc(delta.levelAfter) + '</b>  ' +
        (m > 0 ? '<span class="delta-up">▲ up ' + m + ' level' + (m > 1 ? 's' : '') + '</span>'
          : m < 0 ? '<span class="delta-down">▼ down ' + Math.abs(m) + '</span>'
            : '<span class="delta-flat">— same level</span>') + '</div>';
      if (delta.improved.length) {
        h += '<div class="eyebrow" style="margin-top:16px">Improved</div>';
        delta.improved.forEach(r => {
          const s = window.DB.sectionById[r.sectionId];
          h += '<div class="meter-row"><div class="lab">' + esc(s ? s.name : r.sectionId) +
            '</div><div class="val delta-up">+' + Math.round(r.delta * 100) + '</div></div>';
        });
      }
      if (delta.regressed.length) {
        h += '<div class="eyebrow" style="margin-top:16px">Slipped — worth reviewing</div>';
        delta.regressed.forEach(r => {
          const s = window.DB.sectionById[r.sectionId];
          h += '<div class="meter-row"><div class="lab">' + esc(s ? s.name : r.sectionId) +
            '</div><div class="val delta-down">' + Math.round(r.delta * 100) + '</div></div>';
        });
      }
      h += '</div>';
    }

    h += '<div class="panel anim-in"><h2>Where you stand by area</h2>';
    window.DOMAINS.forEach(d => {
      const sc = (last.domainScores || {})[d.id];
      const lvl = Engine.levelFor(sc);
      const cls = sc == null ? '' : sc >= 0.72 ? 'green' : sc >= 0.5 ? 'gold' : 'red';
      h += meter(d.name + (lvl ? '  ·  ' + lvl.name : ''), sc, cls);
    });
    h += '</div>';

    const plan = Engine.studyPlan(analysis);
    if (plan.length) {
      h += '<div class="panel"><h2>Your study plan</h2>' +
        '<div class="sub">Ordered by what is costing you most. Clear a section by scoring 80% on its exam.</div>' +
        '<div class="plist stagger">';
      plan.forEach((p, i) => {
        const prog = Engine.sectionProgress(p.section.id);
        const dom = window.DB.domainById[p.section.domain];
        h += '<div class="panel panel-tight" style="margin:0;background:var(--panel-2)"><div class="between">' +
          '<div style="min-width:240px;flex:1">' +
          '<div class="row" style="gap:10px;margin-bottom:6px">' +
          '<span class="tag">' + esc(dom ? dom.short : '') + '</span>' +
          '<b style="font-size:var(--fs-md)">' + (i + 1) + '. ' + esc(p.section.name) + '</b>' +
          (prog.passed ? ' <span class="badge b-passed">Passed</span>' : '') + '</div>' +
          '<div style="color:var(--text-dim);font-size:var(--fs-sm)">' + esc(p.reason) + '</div>' +
          '<div class="small" style="margin-top:6px">scored ' + pct(p.score) + ' · ' +
          p.lessons + ' lessons · ' + prog.solved + '/' + prog.problems + ' problems solved</div></div>' +
          '<div class="row"><a class="btn btn-ghost btn-sm" href="#/section/' + esc(p.section.id) + '">Open</a>' +
          '<a class="btn btn-sm" href="#/exam/' + esc(p.section.id) + '">Section exam</a></div>' +
          '</div></div>';
      });
      h += '</div></div>';
    }

    h += '<div class="grid grid-4" style="margin-bottom:22px">' +
      '<div class="stat"><div class="k">Coding problems</div><div class="v accent">' + stats.problems +
      '</div><div class="n">' + st.stats.problemsSolved + ' solved</div></div>' +
      '<div class="stat"><div class="k">Questions</div><div class="v">' + stats.questions +
      '</div><div class="n">' + st.stats.questionsAnswered + ' answered</div></div>' +
      '<div class="stat"><div class="k">Lessons</div><div class="v">' + stats.lessons +
      '</div><div class="n">' + Object.keys(st.lessonsRead).length + ' read</div></div>' +
      '<div class="stat"><div class="k">Sections passed</div><div class="v">' +
      Object.keys(st.sectionMastery).filter(k => st.sectionMastery[k].passed).length +
      '</div><div class="n">of ' + window.SECTIONS.length + '</div></div></div>';

    h += '<div class="row"><a class="btn btn-solid" href="#/learn">Open the roadmap</a>' +
      '<a class="btn btn-solid" href="#/practice">Practice problems</a>' +
      '<a class="btn btn-solid" href="#/cards">Flashcards</a></div>';

    app().innerHTML = h;
  }

  /* ================= placement ================= */

  function viewPlacementIntro(first) {
    let h = '';
    if (first) {
      h += '<div class="panel panel-accent anim-in"><div class="eyebrow">Start here</div>' +
        '<h1>Find out where you actually stand</h1>' +
        '<div class="sub">Before anything else, take the general diagnostic. It samples every ' +
        'area — the 18 DSA patterns, C++, Python, low-level design and machine learning — across ' +
        'four difficulty tiers, and places you on the scale below. Everything after that is ' +
        'ordered by what it finds.</div>' + levelLadder(-1) + '</div>';
    } else {
      h += '<div class="crumb"><a href="#/">Dashboard</a> / Diagnostic</div>' +
        '<h1>General diagnostic</h1><div class="sub">A fresh sample across every area. Retakes ' +
        'deliberately pull different questions, and the result is compared against your last ' +
        'attempt so you can see exactly what moved.</div>';
    }

    h += '<div class="panel"><h2>Choose the length</h2>' +
      '<div class="sub">Longer papers measure each section more precisely. About 28% of items ' +
      'are coding problems; the rest are multiple choice.</div><div class="grid grid-3 stagger">' +
      [['Quick', 25, 'A fast read on your overall level. Thin per-section detail.'],
       ['Standard', 45, 'The recommended paper. Reliable per-area breakdown.'],
       ['Full', 70, 'Deepest measurement, section-by-section confidence.']]
        .map(([n, size, blurb]) =>
          '<div class="card" data-size="' + size + '" tabindex="0" role="button">' +
          '<h3>' + n + '</h3><div class="lead" style="margin-bottom:8px">' + size + ' questions</div>' +
          '<p>' + esc(blurb) + '</p>' +
          '<p style="margin-top:12px;color:var(--text-mute)">≈ ' + Math.round(size * 1.3) + ' min</p></div>')
        .join('') + '</div></div>';

    h += '<div class="note"><b>How coding answers are graded.</b> This site runs entirely in your ' +
      'browser with no server, so it cannot compile C++ or execute Python. Coding answers are ' +
      'graded on <b>approach</b>: whether your solution contains the mechanisms the problem ' +
      'requires and avoids the wrong complexity class, accepting any valid style. You always get ' +
      'the reference solution in both languages afterwards, and the coach will read your code.</div>';

    app().innerHTML = h;
    app().querySelectorAll('.card[data-size]').forEach(c => {
      const start = () => startExam(Engine.buildPlacement(
        parseInt(c.getAttribute('data-size'), 10), Date.now() % 2147483647));
      c.addEventListener('click', start);
      c.addEventListener('keydown', e => { if (e.key === 'Enter') start(); });
    });
  }

  /* ================= exam runner ================= */

  let RUN = null;

  function startExam(exam) {
    if (!exam.items.length) { toast('No questions available for that exam yet.'); return; }
    RUN = { exam, idx: 0, answers: new Array(exam.items.length).fill(null) };
    top(); renderExamItem();
  }

  function renderExamItem() {
    const { exam, idx } = RUN;
    const entry = exam.items[idx];
    const total = exam.items.length;
    const sec = window.DB.sectionById[entry.item.section];
    const secName = sec ? sec.name : entry.item.section;

    let h = '<div class="exam-head"><div class="between">' +
      '<div><b style="font-size:var(--fs-md)">' + esc(exam.title) + '</b><br>' +
      '<span class="small">Question ' + (idx + 1) + ' of ' + total + '</span></div>' +
      '<button class="btn btn-ghost btn-sm" id="quitExam">Save &amp; quit</button></div>' +
      '<div class="exam-progress">' + exam.items.map((_, i) =>
        '<span class="pip ' + (i < idx ? 'done' : i === idx ? 'now' : '') + '"></span>').join('') +
      '</div></div>';

    if (entry.kind === 'mc') {
      const q = entry.item;
      h += '<div class="q-card anim-in"><div class="row" style="gap:9px">' +
        '<span class="badge b-mc">Multiple choice</span>' + tierBadge(q.tier) +
        '<span class="tag">' + esc(secName) + '</span></div>' +
        '<div class="q-text">' + esc(q.q) + '</div><div class="opts">' +
        q.opts.map((o, i) => '<button class="opt" data-i="' + i + '">' +
          '<span class="k">' + LETTER[i] + '</span><span>' + esc(o) + '</span></button>').join('') +
        '</div></div>';
    } else {
      const p = entry.item;
      const lang = Engine.state.lang;
      const saved = RUN.answers[idx];
      const code = (saved && saved.code) || (p.starter && p.starter[lang]) || '';
      h += '<div class="q-card anim-in"><div class="row" style="gap:9px">' +
        '<span class="badge b-code">Coding</span>' + diffBadge(p.difficulty) + tierBadge(p.tier) +
        '<span class="tag">' + esc(secName) + '</span></div>' +
        '<h2 style="margin:14px 0 10px">' + esc(p.title) + '</h2>' +
        '<div style="white-space:pre-wrap;margin-bottom:16px">' + esc(p.prompt) + '</div>' +
        examplesHtml(p) + constraintsHtml(p) +
        '<div class="editor-wrap" style="margin-top:18px"><div class="editor-bar">' +
        langToggle(lang) + '<div class="grow"></div>' +
        '<span class="small">graded on approach</span></div>' +
        '<textarea class="editor" id="examEditor" spellcheck="false" ' +
        'aria-label="Code editor">' + esc(code) + '</textarea></div>';

      if (p.timeChoices && p.timeChoices.length) {
        const selCx = saved && saved.cx != null ? saved.cx : null;
        h += '<div style="margin-top:22px"><h3>What is the time complexity of your solution?</h3>' +
          '<div class="opts">' + p.timeChoices.map((o, i) =>
            '<button class="opt cx' + (selCx === i ? ' sel' : '') + '" data-cx="' + i + '">' +
            '<span class="k">' + LETTER[i] + '</span><span>' + esc(o) + '</span></button>').join('') +
          '</div></div>';
      }
      h += '</div>';
    }

    h += '<div class="row" style="margin-top:24px">' +
      '<button class="btn btn-lg" id="nextBtn">' +
      (idx === total - 1 ? 'Finish &amp; see results' : 'Submit &amp; continue') + '</button>' +
      (entry.kind === 'code' ? '<button class="btn btn-ghost" id="skipBtn">Skip this one</button>' : '') +
      '</div>';

    app().innerHTML = h;
    wireExamItem(entry);
  }

  const langToggle = lang => '<div class="lang-toggle" role="group" aria-label="Language">' +
    '<button data-lang="cpp" class="' + (lang === 'cpp' ? 'on' : '') + '">C++</button>' +
    '<button data-lang="python" class="' + (lang === 'python' ? 'on' : '') + '">Python</button></div>';

  function examplesHtml(p) {
    if (!p.examples || !p.examples.length) return '';
    return '<div class="eyebrow" style="margin-top:18px">Examples</div>' +
      p.examples.map((e, i) =>
        '<pre class="code">Input:  ' + esc(e.in) + '\nOutput: ' + esc(e.out) +
        (e.why ? '\n\nWhy:    ' + esc(e.why) : '') + '</pre>').join('');
  }

  function constraintsHtml(p) {
    if (!p.constraints || !p.constraints.length) return '';
    return '<div class="eyebrow" style="margin-top:18px">Constraints</div><ul style="margin-left:26px">' +
      p.constraints.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul>';
  }

  function handleTab(e) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = e.target, s = ta.selectionStart, en = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
    ta.selectionStart = ta.selectionEnd = s + 4;
    ta.dispatchEvent(new Event('input'));
  }

  function wireExamItem(entry) {
    const idx = RUN.idx;
    $('#quitExam').addEventListener('click', () => {
      if (confirm('Leave this exam? Your answers so far will be discarded.')) { RUN = null; go('#/'); }
    });

    if (entry.kind === 'mc') {
      const mark = b => {
        app().querySelectorAll('.opt[data-i]').forEach(x => x.classList.remove('sel'));
        b.classList.add('sel');
        RUN.answers[idx] = { pick: parseInt(b.getAttribute('data-i'), 10) };
      };
      app().querySelectorAll('.opt[data-i]').forEach(b => b.addEventListener('click', () => mark(b)));
      const prev = RUN.answers[idx];
      if (prev && prev.pick != null) {
        const b = app().querySelector('.opt[data-i="' + prev.pick + '"]');
        if (b) b.classList.add('sel');
      }
    } else {
      const ed = $('#examEditor');
      ed.addEventListener('keydown', handleTab);
      ed.addEventListener('input', () => {
        const a = RUN.answers[idx] || {};
        a.code = ed.value; a.lang = Engine.state.lang;
        RUN.answers[idx] = a;
      });
      app().querySelectorAll('.lang-toggle button').forEach(b => {
        b.addEventListener('click', () => {
          const lang = b.getAttribute('data-lang');
          const cur = RUN.answers[idx] || {};
          const untouched = !cur.code ||
            cur.code === ((entry.item.starter && entry.item.starter[Engine.state.lang]) || '');
          Engine.state.lang = lang; Engine.save();
          if (untouched) { cur.code = (entry.item.starter && entry.item.starter[lang]) || ''; RUN.answers[idx] = cur; }
          renderExamItem();
        });
      });
      app().querySelectorAll('.opt[data-cx]').forEach(b => {
        b.addEventListener('click', () => {
          app().querySelectorAll('.opt[data-cx]').forEach(x => x.classList.remove('sel'));
          b.classList.add('sel');
          const a = RUN.answers[idx] || {};
          a.cx = parseInt(b.getAttribute('data-cx'), 10);
          a.code = $('#examEditor').value; a.lang = Engine.state.lang;
          RUN.answers[idx] = a;
        });
      });
      const skip = $('#skipBtn');
      if (skip) skip.addEventListener('click', () => { RUN.answers[idx] = null; advance(); });
    }
    $('#nextBtn').addEventListener('click', advance);
  }

  function advance() {
    if (RUN.idx >= RUN.exam.items.length - 1) return finishExam();
    RUN.idx++; top(); renderExamItem();
  }

  function finishExam() {
    const { exam, answers } = RUN;
    const records = exam.items.map((entry, i) => {
      const a = answers[i];
      if (entry.kind === 'mc') {
        const q = entry.item;
        const correct = !!a && a.pick === q.correct;
        return { id: q.id, kind: 'mc', section: q.section, tier: q.tier,
                 correct, score: correct ? 1 : 0, pick: a ? a.pick : null, item: q };
      }
      const p = entry.item;
      if (!a || !a.code) {
        return { id: p.id, kind: 'code', section: p.section, tier: p.tier, correct: false,
                 score: 0, result: null, item: p, code: '', lang: Engine.state.lang };
      }
      const res = Checker.gradeForExam(p, a.lang || Engine.state.lang, a.code, a.cx);
      return { id: p.id, kind: 'code', section: p.section, tier: p.tier,
               correct: res.score >= 0.7, score: res.score, result: res, item: p,
               code: a.code, lang: a.lang || Engine.state.lang, cx: a.cx };
    });

    const { attempt, analysis } = Engine.recordAttempt(exam, records);
    RUN = null; top();
    renderResults(exam, attempt, analysis, records);
  }

  function renderResults(exam, attempt, analysis, records) {
    const isPlacement = exam.kind === 'placement';
    let h = '';

    if (isPlacement) {
      const lvl = window.LEVELS[attempt.levelId || 0];
      h += '<div class="panel result-hero anim-in"><div class="eyebrow">Your level</div>' +
        '<div class="result-level">' + esc(lvl.name) + '</div>' +
        '<div class="result-score">' + analysis.raw.correct + ' of ' + analysis.raw.total +
        ' correct · weighted score ' + pct(attempt.weightedScore) + '</div>' +
        '<div class="sub" style="margin:18px auto 0;text-align:center">' + esc(lvl.blurb) + '</div>' +
        levelLadder(lvl.id) +
        '<div class="small" style="max-width:62ch;margin:0 auto">Weighted score counts harder ' +
        'questions for more, which is why it can differ from the raw percentage. Your level is ' +
        'capped by your weakest area, so one strong subject cannot carry the rest.</div></div>';
    } else {
      const passed = attempt.passed;
      h += '<div class="panel result-hero anim-in"><div class="eyebrow">' + esc(exam.title) + '</div>' +
        '<div class="result-level">' + (passed ? 'Passed' : 'Not yet') + '</div>' +
        '<div class="result-score">' + analysis.raw.correct + ' of ' + analysis.raw.total +
        ' correct · ' + pct(attempt.pct) + ' (need 80%)</div>' +
        '<div class="sub" style="margin:18px auto 0;text-align:center">' +
        (passed ? 'Section cleared. Re-take the general diagnostic to re-measure your overall ' +
                  'level and see what moved, then take the next section on your plan.'
                : 'Review the misses below, work the lessons and problems, then retake — a retake ' +
                  'pulls different questions.') + '</div></div>';
    }

    const delta = isPlacement ? Engine.placementDelta() : null;
    if (delta) {
      h += '<div class="panel"><h2>Compared with your last diagnostic</h2>' +
        '<div style="font-size:var(--fs-md);margin-bottom:16px">' + esc(delta.levelBefore) +
        ' → <b style="color:var(--accent)">' + esc(delta.levelAfter) + '</b> · overall ' +
        pct(delta.scoreBefore) + ' → ' + pct(delta.scoreAfter) + '</div>';
      delta.rows.slice(0, 10).forEach(r => {
        const s = window.DB.sectionById[r.sectionId];
        const cls = r.delta > 0.05 ? 'delta-up' : r.delta < -0.05 ? 'delta-down' : 'delta-flat';
        h += '<div class="meter-row"><div class="lab">' + esc(s ? s.name : r.sectionId) + '</div>' +
          '<div class="val ' + cls + '">' + (r.delta > 0 ? '+' : '') + Math.round(r.delta * 100) + '</div></div>';
      });
      h += '</div>';
    }

    if (isPlacement) {
      h += '<div class="panel"><h2>By area</h2>';
      window.DOMAINS.forEach(d => {
        const sc = analysis.domainScores[d.id];
        const lvl = Engine.levelFor(sc);
        const cls = sc == null ? '' : sc >= 0.72 ? 'green' : sc >= 0.5 ? 'gold' : 'red';
        h += meter(d.name + (lvl ? '  ·  ' + lvl.name : ''), sc, cls);
      });
      h += '</div><div class="panel"><h2>Section by section</h2>' +
        '<div class="sub">Sections you saw too few questions from are marked not measured — ' +
        'take a longer paper for a finer read.</div>';
      window.DOMAINS.forEach(d => {
        h += '<div class="eyebrow" style="margin-top:20px">' + esc(d.name) + '</div>';
        window.DB.sectionsOf(d.id).forEach(s => {
          const sc = analysis.sectionScores[s.id];
          const n = analysis.sectionCounts[s.id] || 0;
          const cls = sc == null ? '' : sc >= 0.72 ? 'green' : sc >= 0.5 ? 'gold' : 'red';
          h += meter(s.name + (n ? '  (' + n + ' q)' : ''), n >= 1 ? sc : null, cls);
        });
      });
      h += '</div>';
    }

    const plan = Engine.studyPlan(analysis);
    if (plan.length) {
      h += '<div class="panel"><h2>What to work on, in order</h2><div class="plist">';
      plan.slice(0, 6).forEach((p, i) => {
        h += '<div class="panel panel-tight" style="margin:0;background:var(--panel-2)">' +
          '<div class="between"><div style="flex:1;min-width:220px">' +
          '<b style="font-size:var(--fs-md)">' + (i + 1) + '. ' + esc(p.section.name) + '</b> ' +
          '<span class="tag">' + pct(p.score) + '</span>' +
          '<div style="color:var(--text-dim);font-size:var(--fs-sm);margin-top:5px">' + esc(p.reason) + '</div></div>' +
          '<div class="row"><a class="btn btn-ghost btn-sm" href="#/section/' + esc(p.section.id) + '">Open</a>' +
          '<a class="btn btn-sm" href="#/exam/' + esc(p.section.id) + '">Exam</a></div></div></div>';
      });
      h += '</div></div>';
    }

    h += '<div class="panel"><h2>Review every question</h2>' +
      '<div class="sub">This is where the learning happens. Every miss shows the right answer and why.</div>';
    records.forEach((r, i) => {
      const ok = r.score != null ? r.score >= 0.7 : r.correct;
      const sec = window.DB.sectionById[r.section];
      h += '<details class="reveal"' + (ok ? '' : ' open') + '><summary>' +
        (ok ? '<span style="color:var(--green)">✓</span> ' : '<span style="color:var(--red)">✗</span> ') +
        'Q' + (i + 1) + ' · ' + esc(sec ? sec.name : r.section) + ' · ' +
        (r.kind === 'mc' ? 'Multiple choice' : 'Coding · ' + pct(r.score)) + '</summary><div>';

      if (r.kind === 'mc') {
        const q = r.item;
        h += '<div class="q-text">' + esc(q.q) + '</div><div class="opts">' +
          q.opts.map((o, oi) => {
            const cls = oi === q.correct ? ' right' : oi === r.pick ? ' wrong' : '';
            return '<button class="opt' + cls + '" disabled><span class="k">' + LETTER[oi] +
              '</span><span>' + esc(o) + '</span></button>';
          }).join('') + '</div>' +
          '<div class="why"><b>Why:</b> ' + esc(q.why) + '</div>';
      } else {
        const p = r.item;
        h += '<h3>' + esc(p.title) + '</h3><div style="white-space:pre-wrap;margin-bottom:14px">' +
          esc(p.prompt) + '</div>';
        if (r.result) {
          h += renderCheckList(r.result);
          if (p.timeChoices) {
            h += '<div class="why"><b>Complexity:</b> you answered ' +
              (r.cx != null ? esc(p.timeChoices[r.cx]) : 'nothing') + ' · correct is <b>' +
              esc(p.timeChoices[p.timeAnswer]) + '</b> (time ' + esc(p.complexity.time) +
              ', space ' + esc(p.complexity.space) + ')</div>';
          }
        } else {
          h += '<div class="verdict empty"><strong>Not answered</strong>You skipped this one.</div>';
        }
        h += '<details class="reveal"><summary>Approach</summary><div><p>' + esc(p.approach) + '</p>' +
          (p.keyInsight ? '<div class="hint-box"><b>Key insight:</b> ' + esc(p.keyInsight) + '</div>' : '') +
          '</div></details>' +
          '<details class="reveal"><summary>Reference solution</summary><div>' +
          '<div class="eyebrow" style="margin-top:12px">C++</div><pre class="code">' + esc(p.solution.cpp) + '</pre>' +
          '<div class="eyebrow">Python</div><pre class="code">' + esc(p.solution.python) + '</pre></div></details>' +
          '<a class="btn btn-ghost btn-sm" href="#/problem/' + esc(p.id) + '">Open in workspace</a>';
      }
      h += '</div></details>';
    });
    h += '</div>';

    h += '<div class="row" style="margin-top:24px"><a class="btn" href="#/">Back to dashboard</a>' +
      (isPlacement ? '<a class="btn btn-ghost" href="#/learn">Open the roadmap</a>'
        : '<a class="btn btn-ghost" href="#/placement">Re-take diagnostic</a>' +
          (!attempt.passed ? '<a class="btn btn-solid" href="#/exam/' + esc(exam.sectionId) + '">Retake section exam</a>' : '')) +
      '</div>';

    app().innerHTML = h;
  }

  function renderCheckList(result) {
    let h = '<div class="verdict ' + result.verdict + '"><strong>' + Checker.summarise(result) +
      '</strong>Approach score ' + pct(result.score) + '</div><ul class="check-list">';
    result.passed.forEach(c => { h += '<li><span class="check-ok">✓</span><span>' + esc(c.hint) + '</span></li>'; });
    result.failed.forEach(c => { h += '<li><span class="check-no">✗</span><span>' + esc(c.hint) + '</span></li>'; });
    result.tripped.forEach(c => { h += '<li><span class="check-warn">▲</span><span>' + esc(c.hint) + '</span></li>'; });
    h += '</ul>';
    (result.notes || []).forEach(n => { h += '<div class="note">' + esc(n) + '</div>'; });
    return h;
  }

  /* ================= learn ================= */

  function viewLearn() {
    let h = '<h1>Learn</h1><div class="sub">Pick a track and follow the map. Every language topic ' +
      'is taught in both C++ and Python.</div><div class="grid grid-2 stagger">';
    window.DOMAINS.forEach(d => {
      const secs = window.DB.sectionsOf(d.id);
      let lessons = 0, problems = 0;
      secs.forEach(s => {
        const b = window.DB.bySection[s.id] || { lessons: [], problems: [] };
        lessons += b.lessons.length; problems += b.problems.length;
      });
      const passed = secs.filter(s => Engine.sectionProgress(s.id).passed).length;
      h += '<a class="card" href="#/roadmap/' + esc(d.id) + '">' +
        '<div class="row" style="gap:12px"><span style="font-size:var(--fs-xl);color:var(--accent)">' +
        d.icon + '</span><h3 style="margin:0">' + esc(d.name) + '</h3></div>' +
        '<p style="margin-top:10px">' + esc(d.blurb) + '</p>' +
        '<p class="small" style="margin-top:12px">' + secs.length + ' sections · ' + lessons +
        ' lessons · ' + problems + ' problems · ' + passed + '/' + secs.length + ' passed</p>' +
        '<div class="bar" style="margin-top:12px"><span style="width:' +
        Math.round((passed / Math.max(1, secs.length)) * 100) + '%"></span></div></a>';
    });
    h += '</div>';
    app().innerHTML = h;
  }

  function viewSection(sectionId) {
    const s = window.DB.sectionById[sectionId];
    if (!s) return notFound();
    const d = window.DB.domainById[s.domain];
    const b = window.DB.bySection[sectionId] || { lessons: [], problems: [], questions: [], flashcards: [] };
    const prog = Engine.sectionProgress(sectionId);

    let h = '<div class="crumb"><a href="#/learn">Learn</a> / ' +
      '<a href="#/roadmap/' + esc(s.domain) + '">' + esc(d ? d.name : '') + '</a> / ' + esc(s.name) + '</div>' +
      '<div class="between"><div><h1>' + esc(s.name) + '</h1>' +
      '<div class="sub" style="margin-bottom:0">' + b.lessons.length + ' lessons · ' +
      b.problems.length + ' coding problems · ' + b.questions.length + ' questions' +
      (prog.passed ? ' · <span class="badge b-passed">Passed</span>' : '') + '</div></div>' +
      '<a class="btn" href="#/exam/' + esc(sectionId) + '">' +
      (prog.attempts ? 'Retake section exam' : 'Take section exam') + '</a></div>';

    if (prog.attempts) {
      h += '<div class="panel panel-tight"><div class="between"><div>Best section-exam score: <b>' +
        pct(prog.bestPct) + '</b> over ' + prog.attempts + ' attempt' + (prog.attempts > 1 ? 's' : '') +
        ' · pass mark 80%</div><div class="bar" style="width:200px"><span style="width:' +
        Math.round(prog.bestPct * 100) + '%"></span></div></div></div>';
    }

    if (b.lessons.length) {
      h += '<div class="panel"><h2>Lessons</h2><div class="plist">';
      b.lessons.forEach(l => {
        h += '<a class="prow" href="#/lesson/' + esc(l.id) + '"><div><div class="t">' + esc(l.title) +
          (Engine.state.lessonsRead[l.id] ? ' ✓' : '') + '</div><div class="s">' + esc(l.summary || '') +
          '</div></div><div class="hide-sm">' + tierBadge(l.tier) + '</div>' +
          '<div class="s hide-sm">' + (l.minutes || 10) + ' min</div>' +
          '<div style="color:var(--text-mute)">›</div></a>';
      });
      h += '</div></div>';
    }
    if (b.problems.length) h += '<div class="panel"><h2>Problems</h2>' + problemRows(b.problems) + '</div>';
    if (b.flashcards.length) {
      h += '<div class="row"><a class="btn btn-solid" href="#/cards/' + esc(sectionId) + '">Drill ' +
        b.flashcards.length + ' flashcards</a></div>';
    }
    app().innerHTML = h;
  }

  function viewLesson(id) {
    const l = window.DB.byId[id];
    if (!l || !l.body) return notFound();
    const s = window.DB.sectionById[l.section];
    Engine.markLessonRead(id);
    const sibs = ((window.DB.bySection[l.section] || {}).lessons) || [];
    const i = sibs.findIndex(x => x.id === id);
    const prev = i > 0 ? sibs[i - 1] : null, next = i >= 0 && i < sibs.length - 1 ? sibs[i + 1] : null;

    app().innerHTML = '<div class="crumb"><a href="#/learn">Learn</a> / ' +
      '<a href="#/section/' + esc(l.section) + '">' + esc(s ? s.name : '') + '</a> / ' + esc(l.title) + '</div>' +
      '<h1>' + esc(l.title) + '</h1><div class="row" style="margin-bottom:22px">' + tierBadge(l.tier) +
      '<span class="tag">' + (l.minutes || 10) + ' min read</span></div>' +
      '<div class="panel prose anim-in">' + l.body + '</div>' +
      '<div class="row" style="margin-top:22px">' +
      (prev ? '<a class="btn btn-ghost" href="#/lesson/' + esc(prev.id) + '">← ' + esc(prev.title) + '</a>' : '') +
      (next ? '<a class="btn" href="#/lesson/' + esc(next.id) + '">' + esc(next.title) + ' →</a>' : '') +
      '<a class="btn btn-solid" href="#/section/' + esc(l.section) + '">Back to section</a></div>';
  }

  /* ================= practice ================= */

  const FILTERS = { domain: '', section: '', difficulty: '', status: '', q: '' };

  function problemRows(list) {
    if (!list.length) return '<div class="empty">No problems match those filters.</div>';
    return '<div class="plist">' + list.map(p => {
      const s = window.DB.sectionById[p.section];
      return '<a class="prow" href="#/problem/' + esc(p.id) + '"><div><div class="t">' + esc(p.title) +
        '</div><div class="s">' + esc(s ? s.name : p.section) + '</div></div>' +
        '<div class="hide-sm">' + diffBadge(p.difficulty) + '</div>' +
        '<div class="hide-sm">' + tierBadge(p.tier) + '</div>' +
        '<div>' + statusBadge(Engine.problemStatus(p.id)) + '</div></a>';
    }).join('') + '</div>';
  }

  function viewPractice() {
    let list = window.DB.problems.slice();
    if (FILTERS.domain) list = list.filter(p => window.DB.domainOfSection(p.section) === FILTERS.domain);
    if (FILTERS.section) list = list.filter(p => p.section === FILTERS.section);
    if (FILTERS.difficulty) list = list.filter(p => p.difficulty === FILTERS.difficulty);
    if (FILTERS.status) list = list.filter(p => Engine.problemStatus(p.id) === FILTERS.status);
    if (FILTERS.q) {
      const q = FILTERS.q.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().indexOf(q) !== -1);
    }
    const secOpts = FILTERS.domain ? window.DB.sectionsOf(FILTERS.domain) : window.SECTIONS;

    app().innerHTML = '<h1>Practice</h1><div class="sub">' + window.DB.problems.length +
      ' coding problems. Each gives you an editor in C++ or Python, checks your approach, ' +
      'and has a coach that reads your code when you get stuck.</div>' +
      '<div class="filters">' +
      '<input type="text" id="fq" placeholder="Search problems…" value="' + esc(FILTERS.q) + '" style="min-width:220px" aria-label="Search problems">' +
      '<select id="fdomain" aria-label="Area"><option value="">All areas</option>' +
      window.DOMAINS.map(d => '<option value="' + d.id + '"' + (FILTERS.domain === d.id ? ' selected' : '') +
        '>' + esc(d.name) + '</option>').join('') + '</select>' +
      '<select id="fsection" aria-label="Section"><option value="">All sections</option>' +
      secOpts.map(s => '<option value="' + s.id + '"' + (FILTERS.section === s.id ? ' selected' : '') +
        '>' + esc(s.name) + '</option>').join('') + '</select>' +
      '<select id="fdiff" aria-label="Difficulty"><option value="">Any difficulty</option>' +
      ['Easy', 'Medium', 'Hard'].map(d => '<option value="' + d + '"' +
        (FILTERS.difficulty === d ? ' selected' : '') + '>' + d + '</option>').join('') + '</select>' +
      '<select id="fstatus" aria-label="Status"><option value="">Any status</option>' +
      [['new', 'Not started'], ['attempted', 'Attempted'], ['close', 'Close'], ['solved', 'Solved']]
        .map(([v, n]) => '<option value="' + v + '"' + (FILTERS.status === v ? ' selected' : '') +
          '>' + n + '</option>').join('') + '</select>' +
      '<span class="small">' + list.length + ' shown</span></div>' + problemRows(list);

    const bind = (id, key, ev) => {
      const el = $('#' + id);
      el.addEventListener(ev || 'change', () => {
        FILTERS[key] = el.value;
        if (key === 'domain') FILTERS.section = '';
        viewPractice();
        if (key === 'q') { const f = $('#fq'); f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
      });
    };
    bind('fq', 'q', 'input'); bind('fdomain', 'domain'); bind('fsection', 'section');
    bind('fdiff', 'difficulty'); bind('fstatus', 'status');
  }

  /* ================= problem workspace ================= */

  const WS = { tab: 'description', hintsShown: 0, coachLog: [], lastAnalysis: null };

  function viewProblem(id) {
    const p = window.DB.byId[id];
    if (!p || !p.prompt) return notFound();
    const s = window.DB.sectionById[p.section];
    const saved = Engine.state.problemState[id];
    let lang = (saved && saved.lang) || Engine.state.lang;
    let code = (saved && saved.code) || (p.starter && p.starter[lang]) || '';

    WS.tab = 'description'; WS.hintsShown = 0; WS.coachLog = []; WS.lastAnalysis = null;

    function leftPanel() {
      if (WS.tab === 'description') {
        return '<div style="white-space:pre-wrap;font-size:var(--fs-base)">' + esc(p.prompt) + '</div>' +
          examplesHtml(p) + constraintsHtml(p) +
          (p.complexity ? '<div class="eyebrow" style="margin-top:20px">Target complexity</div>' +
            '<div style="font-family:var(--mono);color:var(--accent-2);font-size:var(--fs-sm)">time ' +
            esc(p.complexity.time) + ' · space ' + esc(p.complexity.space) + '</div>' : '') +
          (p.followUp ? '<div class="note"><b>Follow-up:</b> ' + esc(p.followUp) + '</div>' : '');
      }
      if (WS.tab === 'hints') {
        const levels = Coach.hintLevels(p);
        let out = '<div class="sub">Hints escalate. Take only as many as you need — the last one ' +
          'is the full approach.</div>';
        levels.forEach((lv, i) => {
          if (i < WS.hintsShown) {
            out += '<div class="hint-box"><b>' + esc(lv.label) + '</b><div style="margin-top:8px;white-space:pre-wrap">' +
              esc(lv.text) + '</div></div>';
          }
        });
        if (WS.hintsShown < levels.length) {
          out += '<button class="btn btn-solid" id="moreHint">Reveal hint ' + (WS.hintsShown + 1) +
            ' of ' + levels.length + '</button>';
        } else {
          out += '<div class="small">That is every hint. The reference solution is on the Solution tab.</div>';
        }
        if (p.pitfalls && p.pitfalls.length && WS.hintsShown >= levels.length) {
          out += '<div class="eyebrow" style="margin-top:22px">Common mistakes</div><ul style="margin-left:26px">' +
            p.pitfalls.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
        }
        return out;
      }
      if (WS.tab === 'coach') return coachPanel(p);
      if (WS.tab === 'solution') {
        return '<div class="note"><b>Try the coach first.</b> Reading the answer before you have ' +
          'struggled is the fastest way to feel productive and learn nothing.</div>' +
          '<details class="reveal"><summary>Approach</summary><div><p>' + esc(p.approach) + '</p>' +
          (p.keyInsight ? '<div class="hint-box"><b>Key insight:</b> ' + esc(p.keyInsight) + '</div>' : '') +
          '</div></details>' +
          '<div class="eyebrow" style="margin-top:20px">C++</div><pre class="code">' + esc(p.solution.cpp) + '</pre>' +
          '<div class="eyebrow">Python</div><pre class="code">' + esc(p.solution.python) + '</pre>' +
          (p.mcq && p.mcq.length ? '<h3 style="margin-top:26px">Check your understanding</h3><div id="mcqHost"></div>' : '');
      }
      return '';
    }

    function render() {
      const st = Engine.problemStatus(id);
      let h = '<div class="crumb"><a href="#/practice">Practice</a> / ' +
        '<a href="#/section/' + esc(p.section) + '">' + esc(s ? s.name : '') + '</a> / ' + esc(p.title) + '</div>' +
        '<div class="between"><div><h1 style="margin-bottom:10px">' + esc(p.title) + '</h1>' +
        '<div class="row">' + diffBadge(p.difficulty) + tierBadge(p.tier) + statusBadge(st) +
        '<span class="tag">' + esc(s ? s.name : '') + '</span></div></div></div>';

      h += '<div class="workspace" style="margin-top:24px"><div>' +
        '<div class="tabs" role="tablist">' +
        [['description', 'Description'], ['hints', 'Hints'], ['coach', 'AI Coach'], ['solution', 'Solution']]
          .map(([k, n]) => '<button class="tab' + (WS.tab === k ? ' on' : '') + '" data-tab="' + k +
            '" role="tab">' + n + '</button>').join('') +
        '</div><div class="panel" id="leftPanel">' + leftPanel() + '</div></div>';

      h += '<div><div class="editor-wrap"><div class="editor-bar">' + langToggle(lang) +
        '<div class="grow"></div><button class="btn btn-ghost btn-sm" id="resetCode">Reset</button></div>' +
        '<textarea class="editor" id="ed" spellcheck="false" aria-label="Code editor">' + esc(code) + '</textarea></div>' +
        '<div class="row" style="margin-top:16px">' +
        '<button class="btn btn-lg" id="checkBtn">Check my approach</button>' +
        '<button class="btn btn-solid" id="askCoach">Ask the coach</button></div>' +
        '<div id="checkOut"></div>';

      if (p.timeChoices && p.timeChoices.length) {
        h += '<div class="panel" style="margin-top:20px"><h3>What is the time complexity?</h3>' +
          '<div class="opts" id="cxOpts">' + p.timeChoices.map((o, i) =>
            '<button class="opt" data-cx="' + i + '"><span class="k">' + LETTER[i] + '</span><span>' +
            esc(o) + '</span></button>').join('') + '</div><div id="cxWhy"></div></div>';
      }
      h += '</div></div>';

      app().innerHTML = h;

      const ed = $('#ed');
      ed.addEventListener('keydown', handleTab);
      ed.addEventListener('input', () => { code = ed.value; });

      app().querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
        WS.tab = b.getAttribute('data-tab'); code = ed.value; render();
      }));

      app().querySelectorAll('.lang-toggle button').forEach(b => b.addEventListener('click', () => {
        const nl = b.getAttribute('data-lang');
        if (nl === lang) return;
        const untouched = ed.value === ((p.starter && p.starter[lang]) || '');
        lang = nl; Engine.state.lang = nl; Engine.save();
        code = untouched ? ((p.starter && p.starter[nl]) || '') : ed.value;
        render();
      }));

      $('#resetCode').addEventListener('click', () => {
        code = (p.starter && p.starter[lang]) || ''; render();
      });

      $('#checkBtn').addEventListener('click', () => {
        code = ed.value;
        const r = Checker.check(p, lang, code);
        Engine.recordProblem(id, lang, code, r);
        $('#checkOut').innerHTML = renderCheckList(r) +
          (r.verdict === 'pass' ? '<div class="note"><b>Approach confirmed.</b> The checker validates ' +
            'structure, not execution — trace it on the examples, then compare with the reference.</div>' : '');
      });

      $('#askCoach').addEventListener('click', () => {
        code = ed.value; WS.tab = 'coach'; render();
        setTimeout(() => runLocalCoach(p, lang, code), 30);
      });

      const more = $('#moreHint');
      if (more) more.addEventListener('click', () => { WS.hintsShown++; code = ed.value; render(); });

      wireCoach(p, () => lang, () => $('#ed').value);

      if (p.timeChoices) {
        app().querySelectorAll('.opt[data-cx]').forEach(b => b.addEventListener('click', () => {
          const pick = parseInt(b.getAttribute('data-cx'), 10);
          app().querySelectorAll('.opt[data-cx]').forEach((x, xi) => {
            x.disabled = true;
            if (xi === p.timeAnswer) x.classList.add('right');
            else if (xi === pick) x.classList.add('wrong');
          });
          $('#cxWhy').innerHTML = '<div class="why"><b>' +
            (pick === p.timeAnswer ? 'Correct.' : 'Not quite.') + '</b> This runs in ' +
            esc(p.complexity.time) + ' time and ' + esc(p.complexity.space) + ' space.</div>';
        }));
      }

      if (WS.tab === 'solution' && p.mcq && p.mcq.length) mountQuiz($('#mcqHost'), p.mcq);
    }

    render();
  }

  /* ---- coach panel ---- */

  function coachPanel(p) {
    const hasKey = Coach.hasKey();
    let h = '<div class="coach"><div class="coach-head"><div class="coach-dot">◆</div>' +
      '<div><b>Coach</b><div class="small">' +
      (hasKey ? 'Built-in analysis + Claude' : 'Built-in analysis (offline)') + '</div></div></div>' +
      '<div class="coach-body" id="coachBody">';

    if (!WS.coachLog.length) {
      h += '<div class="small">Write some code, then ask. The coach reads what you actually wrote — ' +
        'it looks for real bugs, compares your structure against what the problem needs, and tells ' +
        'you the next step without handing over the answer.</div>';
    }
    WS.coachLog.forEach(m => {
      h += '<div class="coach-msg ' + (m.role === 'you' ? 'you' : '') + '">' +
        '<div class="who">' + esc(m.who) + '</div>' +
        (m.html ? '<div>' + m.html + '</div>' : '<div class="bubble">' + esc(m.text) + '</div>') + '</div>';
    });
    h += '</div></div>';

    h += '<div class="row" style="margin-top:18px">' +
      '<button class="btn" id="cAnalyze">Analyse my code</button>' +
      '<button class="btn btn-solid" id="cHint"' + (hasKey ? '' : ' disabled') + '>Ask Claude for a hint</button>' +
      '<button class="btn btn-solid" id="cReview"' + (hasKey ? '' : ' disabled') + '>Claude: review my code</button>' +
      '</div>';

    if (hasKey) {
      h += '<div class="row" style="margin-top:14px">' +
        '<input type="text" id="cQ" placeholder="Ask anything about this problem…" style="flex:1;min-width:260px" aria-label="Question for Claude">' +
        '<button class="btn btn-ghost" id="cSend">Send</button></div>';
    } else {
      h += '<div class="note"><b>Claude is optional.</b> The analysis above runs offline with no ' +
        'key and no network. To also ask Claude questions in your own words, add an Anthropic API ' +
        'key in <a href="#/settings">Settings</a> — it is stored only in this browser and sent ' +
        'only to Anthropic.</div>';
    }
    return h;
  }

  function findingHtml(f) {
    const cls = f.severity === 'error' ? 'err' : f.severity === 'ok' ? 'ok' : '';
    return '<div class="finding ' + cls + '"><div class="ftitle">' +
      (f.severity === 'error' ? '✗ ' : f.severity === 'ok' ? '✓ ' : '▲ ') + esc(f.title) + '</div>' +
      (f.line ? '<div class="fline">line ' + f.line + (f.snippet ? ':  ' + esc(f.snippet) : '') + '</div>' : '') +
      '<div style="margin-top:6px;white-space:pre-wrap">' + esc(f.detail) + '</div></div>';
  }

  function runLocalCoach(p, lang, code) {
    const a = Coach.analyze(p, lang, code);
    WS.lastAnalysis = a;
    let html = a.findings.map(findingHtml).join('');
    const step = Coach.nextStep(a, p);
    if (step) html += '<div class="hint-box"><b>Next step:</b> ' + esc(step) + '</div>';
    WS.coachLog.push({ role: 'coach', who: 'Built-in coach · offline', html });
    const body = $('#coachBody');
    if (body) {
      body.innerHTML += '<div class="coach-msg"><div class="who">Built-in coach · offline</div><div>' +
        html + '</div></div>';
      body.scrollTop = body.scrollHeight;
    }
  }

  function wireCoach(p, getLang, getCode) {
    const an = $('#cAnalyze');
    if (an) an.addEventListener('click', () => runLocalCoach(p, getLang(), getCode()));

    const ask = (mode, question) => {
      const body = $('#coachBody');
      if (question) {
        WS.coachLog.push({ role: 'you', who: 'You', text: question });
        body.innerHTML += '<div class="coach-msg you"><div class="who">You</div><div class="bubble">' +
          esc(question) + '</div></div>';
      }
      const wrap = document.createElement('div');
      wrap.className = 'coach-msg';
      wrap.innerHTML = '<div class="who">Claude</div><div class="bubble coach-thinking">thinking</div>';
      body.appendChild(wrap);
      body.scrollTop = body.scrollHeight;
      const bubble = wrap.querySelector('.bubble');
      let acc = '';

      Coach.ask(p, getLang(), getCode(), mode, question, chunk => {
        acc += chunk;
        bubble.classList.remove('coach-thinking');
        bubble.textContent = acc;
        body.scrollTop = body.scrollHeight;
      }).then(full => {
        bubble.classList.remove('coach-thinking');
        bubble.textContent = full || '(empty response)';
        WS.coachLog.push({ role: 'coach', who: 'Claude', text: full });
      }).catch(err => {
        bubble.classList.remove('coach-thinking');
        bubble.textContent = err.message;
        bubble.style.borderColor = 'var(--red)';
      });
    };

    const h = $('#cHint');   if (h) h.addEventListener('click', () => ask('hint', null));
    const r = $('#cReview'); if (r) r.addEventListener('click', () => ask('review', null));
    const send = $('#cSend');
    if (send) {
      const fire = () => {
        const box = $('#cQ');
        const q = box.value.trim();
        if (!q) return;
        box.value = '';
        ask('explain', q);
      };
      send.addEventListener('click', fire);
      $('#cQ').addEventListener('keydown', e => { if (e.key === 'Enter') fire(); });
    }
  }

  function mountQuiz(host, questions) {
    if (!host) return;
    let i = 0;
    function draw(answered, pick) {
      const q = questions[i];
      let h = '<div class="q-text">' + esc(q.q) + '</div><div class="opts">' +
        q.opts.map((o, oi) => {
          let cls = '';
          if (answered) { if (oi === q.correct) cls = ' right'; else if (oi === pick) cls = ' wrong'; }
          return '<button class="opt' + cls + '" data-i="' + oi + '"' + (answered ? ' disabled' : '') +
            '><span class="k">' + LETTER[oi] + '</span><span>' + esc(o) + '</span></button>';
        }).join('') + '</div>';
      if (answered) {
        h += '<div class="why"><b>' + (pick === q.correct ? 'Correct.' : 'Not quite.') + '</b> ' + esc(q.why) + '</div>';
        if (i < questions.length - 1) h += '<div class="row" style="margin-top:16px"><button class="btn btn-sm" id="qNext">Next question</button></div>';
      }
      host.innerHTML = h;
      host.querySelectorAll('.opt[data-i]').forEach(b =>
        b.addEventListener('click', () => draw(true, parseInt(b.getAttribute('data-i'), 10))));
      const n = host.querySelector('#qNext');
      if (n) n.addEventListener('click', () => { i++; draw(false, null); });
    }
    draw(false, null);
  }

  /* ================= section exam ================= */

  function viewSectionExamIntro(sectionId) {
    const s = window.DB.sectionById[sectionId];
    if (!s) return notFound();
    const b = window.DB.bySection[sectionId] || { questions: [], problems: [] };
    const pool = b.questions.length + b.problems.length;
    const prog = Engine.sectionProgress(sectionId);

    if (pool < 4) {
      app().innerHTML = '<div class="crumb"><a href="#/section/' + esc(sectionId) + '">' + esc(s.name) +
        '</a></div><div class="empty"><h2>Not enough questions yet</h2><p>This section does not have ' +
        'enough items to build an exam.</p></div>';
      return;
    }
    const size = Math.min(25, pool);

    let h = '<div class="crumb"><a href="#/section/' + esc(sectionId) + '">' + esc(s.name) +
      '</a> / Section exam</div><h1>' + esc(s.name) + ' — Section Exam</h1>' +
      '<div class="sub">' + size + ' questions, about 35% coding problems, ramped from beginner to ' +
      'master. You need <b>80%</b> to clear the section. Each attempt draws a different sample from ' +
      'the ' + pool + '-item bank, so a retake is a genuinely new paper.</div>';

    if (prog.attempts) {
      h += '<div class="panel panel-tight">Best so far: <b>' + pct(prog.bestPct) + '</b> over ' +
        prog.attempts + ' attempt' + (prog.attempts > 1 ? 's' : '') +
        (prog.passed ? ' · <span class="badge b-passed">Passed</span>' : '') + '</div>';
    }
    if (prog.passed) {
      h += '<div class="note"><b>You have already cleared this section.</b> Retaking is fine for ' +
        'maintenance, but the higher-value move is the general diagnostic — it re-measures every ' +
        'area and shows what moved. <a href="#/placement">Re-take the diagnostic →</a></div>';
    }
    h += '<div class="row" style="margin-top:24px"><button class="btn btn-lg" id="startSec">Start the section exam</button>' +
      '<a class="btn btn-ghost" href="#/section/' + esc(sectionId) + '">Study first</a></div>';

    app().innerHTML = h;
    $('#startSec').addEventListener('click', () =>
      startExam(Engine.buildSectionExam(sectionId, size, Date.now() % 2147483647)));
  }

  /* ================= flashcards ================= */

  function viewCards(sectionId) {
    let pool = window.DB.flashcards.slice();
    if (sectionId) pool = pool.filter(c => c.section === sectionId);
    if (!pool.length) {
      app().innerHTML = '<h1>Flashcards</h1><div class="empty">No cards in this deck yet.</div>';
      return;
    }
    const due = Engine.dueCards(pool);
    let i = 0, flipped = false;

    function draw() {
      const c = due[i % due.length];
      const st = Engine.cardState(c.id);
      const sec = window.DB.sectionById[c.section];
      let h = '<h1>Flashcards</h1><div class="sub">' + due.length + ' cards · card ' +
        ((i % due.length) + 1) + ' · box ' + st.box + ' of 5. Cards you miss come back sooner.</div>' +
        '<div class="row" style="margin-bottom:18px"><span class="tag">' +
        esc(sec ? sec.name : c.section) + '</span>' + tierBadge(c.tier || 'beginner') + '</div>' +
        '<div class="flash" id="flash" tabindex="0" role="button"><div><div class="side">' +
        (flipped ? 'Answer' : 'Question') + '</div>' + esc(flipped ? c.back : c.front) + '</div></div>' +
        '<div class="row" style="margin-top:18px">';
      h += flipped
        ? '<button class="btn" id="got">I knew it</button><button class="btn btn-ghost" id="missed">Needs work</button>'
        : '<button class="btn" id="flip">Show answer</button>';
      h += '<a class="btn btn-solid" href="#/cards">All decks</a></div>';
      app().innerHTML = h;

      const flip = () => { flipped = !flipped; draw(); };
      $('#flash').addEventListener('click', flip);
      $('#flash').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      const f = $('#flip'); if (f) f.addEventListener('click', () => { flipped = true; draw(); });
      const g = $('#got'); if (g) g.addEventListener('click', () => { Engine.gradeCard(c.id, true); i++; flipped = false; draw(); });
      const m = $('#missed'); if (m) m.addEventListener('click', () => { Engine.gradeCard(c.id, false); i++; flipped = false; draw(); });
    }
    draw();
  }

  function viewCardDecks() {
    let h = '<h1>Flashcards</h1><div class="sub">' + window.DB.flashcards.length +
      ' cards. Pick a deck, or drill everything.</div>';
    if (!window.DB.flashcards.length) {
      app().innerHTML = h + '<div class="empty">The flashcard bank has not been generated yet.</div>';
      return;
    }
    h += '<div class="row" style="margin-bottom:24px"><button class="btn" id="allCards">Drill all cards</button></div>' +
      '<div class="grid grid-3 stagger">';
    window.DOMAINS.forEach(d => window.DB.sectionsOf(d.id).forEach(s => {
      const n = ((window.DB.bySection[s.id] || {}).flashcards || []).length;
      if (!n) return;
      h += '<a class="card" href="#/cards/' + esc(s.id) + '"><h3>' + esc(s.name) + '</h3>' +
        '<p>' + n + ' cards · ' + esc(d.short) + '</p></a>';
    }));
    h += '</div>';
    app().innerHTML = h;
    $('#allCards').addEventListener('click', () => viewCards(null));
  }

  /* ================= progress ================= */

  function viewProgress() {
    const st = Engine.state;
    const attempts = st.attempts.slice().reverse();
    const last = Engine.latestPlacement();

    let h = '<h1>Progress</h1><div class="sub">Every attempt, and how your level has moved.</div>' +
      '<div class="grid grid-4" style="margin-bottom:24px">' +
      '<div class="stat"><div class="k">Level</div><div class="v accent">' + esc(last ? last.levelName : '—') + '</div></div>' +
      '<div class="stat"><div class="k">Problems solved</div><div class="v">' + st.stats.problemsSolved +
      '</div><div class="n">of ' + window.DB.problems.length + '</div></div>' +
      '<div class="stat"><div class="k">Questions right</div><div class="v">' + st.stats.questionsCorrect +
      '</div><div class="n">of ' + st.stats.questionsAnswered + ' answered</div></div>' +
      '<div class="stat"><div class="k">Sections passed</div><div class="v">' +
      Object.keys(st.sectionMastery).filter(k => st.sectionMastery[k].passed).length +
      '</div><div class="n">of ' + window.SECTIONS.length + '</div></div></div>';

    h += '<div class="panel"><h2>Section mastery</h2>';
    window.DOMAINS.forEach(d => {
      h += '<div class="eyebrow" style="margin-top:20px">' + esc(d.name) + '</div>';
      window.DB.sectionsOf(d.id).forEach(s => {
        const p = Engine.sectionProgress(s.id);
        const score = last && last.sectionScores ? last.sectionScores[s.id] : null;
        const cls = p.passed ? 'green' : score == null ? '' : score >= 0.6 ? 'gold' : 'red';
        h += '<div class="meter-row"><div><div class="lab">' + esc(s.name) +
          (p.passed ? ' <span class="badge b-passed">Passed</span>' : '') + '</div>' +
          '<div class="bar ' + cls + '"><span style="width:' +
          Math.round((p.passed ? 1 : (score || p.pct || 0)) * 100) + '%"></span></div></div>' +
          '<div class="val">' + (p.attempts ? pct(p.bestPct) : (score == null ? '—' : pct(score))) + '</div></div>';
      });
    });
    h += '</div>';

    h += '<div class="panel"><h2>Attempt history</h2>';
    if (!attempts.length) h += '<div class="empty">No exams taken yet.</div>';
    else {
      h += '<div class="plist">' + attempts.map(a => {
        const w = new Date(a.at);
        return '<div class="prow" style="cursor:default"><div><div class="t">' + esc(a.title) + '</div>' +
          '<div class="s">' + w.toLocaleDateString() + ' ' +
          w.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + a.total + ' questions</div></div>' +
          '<div class="hide-sm">' + (a.levelName ? '<span class="tag">' + esc(a.levelName) + '</span>' : '') + '</div>' +
          '<div class="hide-sm">' + (a.kind === 'section'
            ? (a.passed ? '<span class="badge b-passed">Passed</span>' : '<span class="badge b-new">Not passed</span>') : '') + '</div>' +
          '<div><b>' + pct(a.pct) + '</b></div></div>';
      }).join('') + '</div>';
    }
    h += '</div>';
    app().innerHTML = h;
  }

  /* ================= settings ================= */

  function viewSettings() {
    const key = Coach.getKey();
    let scaleName = 'md';
    try { scaleName = localStorage.getItem(SCALE_KEY) || 'md'; } catch (e) {}

    app().innerHTML = '<h1>Settings</h1>' +
      '<div class="panel"><h2>Text size</h2><div class="sub">The whole interface scales. ' +
      'Pick whichever you can read without leaning in — there is no prize for small type.</div>' +
      '<div class="row">' +
      [['sm', 'Smaller'], ['md', 'Default'], ['lg', 'Large']].map(([v, n]) =>
        '<button class="btn ' + (scaleName === v ? '' : 'btn-solid') + '" data-setscale="' + v + '">' +
        n + '</button>').join('') + '</div></div>' +

      '<div class="panel"><h2>AI Coach</h2>' +
      '<div class="sub">The built-in coach always works: it reads your code offline, finds real bugs, ' +
      'and tells you what is missing. Adding an Anthropic API key additionally lets you ask Claude ' +
      'questions in your own words.</div>' +
      '<div class="note"><b>Where the key goes.</b> It is saved in this browser\'s localStorage and ' +
      'sent directly to api.anthropic.com from your machine. It is never uploaded to GitHub and ' +
      'never sent anywhere else. Anyone with access to this browser profile can read it — so use a ' +
      'key scoped to this purpose, and clear it when you are done.</div>' +
      '<div class="row"><input type="password" id="apiKey" placeholder="sk-ant-…" value="' + esc(key) +
      '" style="flex:1;min-width:300px" aria-label="Anthropic API key">' +
      '<button class="btn" id="saveKey">Save</button>' +
      '<button class="btn btn-danger" id="clearKey">Clear</button></div>' +
      '<div class="small" style="margin-top:12px">Model: claude-opus-5 · ' +
      (key ? 'A key is saved.' : 'No key saved — Claude features are off, offline coach still works.') +
      '</div></div>' +

      '<div class="panel"><h2>Your data</h2>' +
      '<div class="sub">Progress lives in this browser only. Nothing is uploaded. Export it to move ' +
      'devices or keep a backup.</div><div class="row">' +
      '<button class="btn btn-solid" id="exp">Export progress</button>' +
      '<button class="btn btn-solid" id="imp">Import progress</button>' +
      '<button class="btn btn-danger" id="rst">Reset everything</button></div>' +
      '<input type="file" id="impFile" accept="application/json" style="display:none"></div>';

    app().querySelectorAll('[data-setscale]').forEach(b => b.addEventListener('click', () => {
      applyScale(b.getAttribute('data-setscale')); viewSettings();
    }));
    $('#saveKey').addEventListener('click', () => {
      Coach.setKey($('#apiKey').value.trim());
      toast($('#apiKey').value.trim() ? 'Key saved in this browser.' : 'Key cleared.');
      viewSettings();
    });
    $('#clearKey').addEventListener('click', () => { Coach.setKey(''); toast('Key cleared.'); viewSettings(); });
    $('#exp').addEventListener('click', () => {
      const blob = new Blob([Engine.exportState()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'coding-practice-progress.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('#imp').addEventListener('click', () => $('#impFile').click());
    $('#impFile').addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try { Engine.importState(r.result); toast('Progress imported.'); viewSettings(); }
        catch (err) { toast('That file could not be read as progress data.'); }
      };
      r.readAsText(f);
    });
    $('#rst').addEventListener('click', () => {
      if (confirm('Erase all progress, scores and saved code? This cannot be undone.')) {
        Engine.reset(); toast('Progress reset.'); go('#/');
      }
    });
  }

  /* ================= router ================= */

  function notFound() {
    app().innerHTML = '<div class="empty"><h2>Not found</h2><p>That page does not exist. ' +
      '<a href="#/">Back to the dashboard</a></p></div>';
  }

  function setNav(hash) {
    document.querySelectorAll('.nav a').forEach(a => {
      const h = a.getAttribute('href');
      a.classList.toggle('on', h === '#/' ? (hash === '#/' || hash === '') : hash.indexOf(h) === 0);
    });
    const chip = $('#levelChip');
    const last = Engine.latestPlacement();
    chip.innerHTML = last ? 'Level <b>' + esc(last.levelName) + '</b>' : '<b>Take the diagnostic</b>';
  }

  function route() {
    const hash = location.hash || '#/';
    const parts = hash.replace(/^#\//, '').split('/');
    const head = parts[0] || '';
    const arg = parts[1] ? decodeURIComponent(parts[1]) : null;

    if (RUN) RUN = null;
    setNav(hash); top();

    switch (head) {
      case '':          return viewHome();
      case 'placement': return viewPlacementIntro(false);
      case 'learn':     return viewLearn();
      case 'roadmap':   return viewRoadmap(arg);
      case 'section':   return viewSection(arg);
      case 'lesson':    return viewLesson(arg);
      case 'practice':  return viewPractice();
      case 'problem':   return viewProblem(arg);
      case 'exam':      return viewSectionExamIntro(arg);
      case 'cards':     return arg ? viewCards(arg) : viewCardDecks();
      case 'progress':  return viewProgress();
      case 'settings':  return viewSettings();
      default:          return notFound();
    }
  }

  function boot() {
    window.DB.index();
    Engine.load();
    initScale();

    const stats = window.DB.stats();
    if (!stats.problems && !stats.questions) {
      app().innerHTML = '<div class="empty"><h2>Content did not load</h2>' +
        '<p>The files under <code>data/</code> could not be read. If you opened this from a file ' +
        'manager, serve the folder instead:<br><code>python -m http.server</code> then open ' +
        '<code>localhost:8000</code>.</p></div>';
      return;
    }
    window.addEventListener('hashchange', route);
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
