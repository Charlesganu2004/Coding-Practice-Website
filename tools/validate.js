/* tools/validate.js — content integrity check.
 *
 *   node tools/validate.js
 *
 * Verifies that every data file parses, that records match the schema, and —
 * most importantly — that every problem's own reference solution PASSES its own
 * checks and does not trip its own antiChecks. A check that rejects the model
 * answer would fail a correct learner, so that is treated as a hard error.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const errors = [];
const warnings = [];
const err = m => errors.push(m);
const warn = m => warnings.push(m);

/* ---- load the app's registry + all data files into a fake window ---- */

global.window = {};
require(path.join(ROOT, 'assets/js/db.js'));

const dataDir = path.join(ROOT, 'data');
const files = fs.existsSync(dataDir)
  ? fs.readdirSync(dataDir).filter(f => f.endsWith('.js')).sort()
  : [];

if (!files.length) { console.error('No data files found in data/'); process.exit(1); }

const counts = {};
files.forEach(f => {
  const before = {
    problems: window.DB.problems.length,
    questions: window.DB.questions.length,
    lessons: window.DB.lessons.length,
    flashcards: window.DB.flashcards.length
  };
  try {
    require(path.join(dataDir, f));
  } catch (e) {
    err(`${f}: failed to load — ${e.message}`);
    return;
  }
  counts[f] = {
    problems: window.DB.problems.length - before.problems,
    questions: window.DB.questions.length - before.questions,
    lessons: window.DB.lessons.length - before.lessons,
    flashcards: window.DB.flashcards.length - before.flashcards
  };
});

/* ---- also load the checker so we grade exactly as the site does ---- */
require(path.join(ROOT, 'assets/js/checker.js'));
const Checker = window.Checker;

const SECTION_IDS = new Set(window.SECTIONS.map(s => s.id));
const TIERS = new Set(window.TIERS);
const DIFFS = new Set(['Easy', 'Medium', 'Hard']);

/* ---- unique ids ---- */
const all = [].concat(window.DB.problems, window.DB.questions, window.DB.lessons, window.DB.flashcards);
const seen = new Map();
all.forEach(x => {
  if (!x || !x.id) { err(`record with no id: ${JSON.stringify(x).slice(0, 90)}`); return; }
  if (seen.has(x.id)) err(`duplicate id: ${x.id}`);
  seen.set(x.id, x);
});

/* ---- questions ---- */
window.DB.questions.forEach(q => {
  const at = `question ${q.id}`;
  if (!SECTION_IDS.has(q.section)) err(`${at}: unknown section "${q.section}"`);
  if (!TIERS.has(q.tier)) err(`${at}: bad tier "${q.tier}"`);
  if (!Array.isArray(q.opts) || q.opts.length !== 4) err(`${at}: needs exactly 4 options`);
  if (!(Number.isInteger(q.correct) && q.correct >= 0 && q.correct <= 3)) err(`${at}: correct out of range`);
  if (!q.why || q.why.length < 15) err(`${at}: missing or trivial explanation`);
  if (!q.q || q.q.length < 10) err(`${at}: question text too short`);
  if (Array.isArray(q.opts) && new Set(q.opts).size !== q.opts.length) err(`${at}: duplicate options`);
});

/* answer-position balance — a lazy bank puts the answer at index 1 every time */
const dist = [0, 0, 0, 0];
window.DB.questions.forEach(q => { if (q.correct >= 0 && q.correct <= 3) dist[q.correct]++; });
const total = dist.reduce((a, b) => a + b, 0);
dist.forEach((n, i) => {
  const share = total ? n / total : 0;
  if (total > 40 && (share < 0.13 || share > 0.38)) {
    warn(`answer position ${i} is ${(share * 100).toFixed(0)}% of questions (want ~25%)`);
  }
});

/* ---- problems ---- */
window.DB.problems.forEach(p => {
  const at = `problem ${p.id}`;
  if (!SECTION_IDS.has(p.section)) err(`${at}: unknown section "${p.section}"`);
  if (!TIERS.has(p.tier)) err(`${at}: bad tier "${p.tier}"`);
  if (!DIFFS.has(p.difficulty)) err(`${at}: bad difficulty "${p.difficulty}"`);
  if (!p.prompt || p.prompt.length < 25) err(`${at}: prompt too short`);
  if (!p.approach || p.approach.length < 60) err(`${at}: approach too thin`);
  if (!p.complexity || !p.complexity.time || !p.complexity.space) err(`${at}: missing complexity`);
  if (!Array.isArray(p.timeChoices) || p.timeChoices.length < 3) err(`${at}: needs timeChoices`);
  else if (!(p.timeAnswer >= 0 && p.timeAnswer < p.timeChoices.length)) err(`${at}: timeAnswer out of range`);

  ['cpp', 'python'].forEach(lang => {
    const sol = p.solution && p.solution[lang];
    const starter = p.starter && p.starter[lang];
    if (!sol) { err(`${at}: missing ${lang} solution`); return; }
    if (!starter) warn(`${at}: missing ${lang} starter`);

    const checks = (p.checks && p.checks[lang]) || [];
    if (!checks.length) { warn(`${at}: no ${lang} checks`); return; }

    checks.forEach(c => {
      let re;
      try { re = new RegExp(c.re, 'im'); }
      catch (e) { err(`${at}: ${lang} check "${c.re}" is not a valid regex`); return; }
      if (!re.test(Checker.strip(sol, lang))) {
        err(`${at}: its own ${lang} solution FAILS check /${c.re}/ — this would reject a correct answer`);
      }
      if (!c.hint) warn(`${at}: a ${lang} check has no hint`);
    });

    const antis = (p.antiChecks && p.antiChecks[lang]) || [];
    antis.forEach(a => {
      let re;
      try { re = new RegExp(a.re, 'im'); }
      catch (e) { err(`${at}: ${lang} antiCheck "${a.re}" is not a valid regex`); return; }
      if (re.test(Checker.strip(sol, lang))) {
        err(`${at}: its own ${lang} solution TRIPS antiCheck /${a.re}/ — the model answer would be penalised`);
      }
    });

    /* the starter must not already satisfy everything */
    if (starter) {
      const graded = Checker.check(p, lang, starter);
      if (graded.verdict === 'pass') {
        warn(`${at}: the ${lang} starter alone passes every check — the drill is free`);
      }
    }
  });

  (p.mcq || []).forEach((m, i) => {
    if (!Array.isArray(m.opts) || m.opts.length !== 4) err(`${at}: mcq[${i}] needs 4 options`);
    if (!(m.correct >= 0 && m.correct <= 3)) err(`${at}: mcq[${i}] correct out of range`);
    if (!m.why) err(`${at}: mcq[${i}] missing why`);
  });
});

/* ---- lessons ---- */
window.DB.lessons.forEach(l => {
  const at = `lesson ${l.id}`;
  if (!SECTION_IDS.has(l.section)) err(`${at}: unknown section "${l.section}"`);
  if (!TIERS.has(l.tier)) err(`${at}: bad tier "${l.tier}"`);
  if (!l.body || l.body.length < 500) err(`${at}: body too short (${l.body ? l.body.length : 0} chars)`);
  if (l.body && /<script|onerror=|onclick=/i.test(l.body)) err(`${at}: body contains script`);
  /* unescaped C++ templates inside code blocks render as broken HTML */
  if (l.body && /<pre[^>]*>[\s\S]*?<(vector|map|string|int|unordered_map)>/.test(l.body)) {
    err(`${at}: unescaped angle brackets inside a code block (write &lt;int&gt;)`);
  }
});

/* ---- flashcards ---- */
window.DB.flashcards.forEach(c => {
  const at = `flashcard ${c.id}`;
  if (!SECTION_IDS.has(c.section)) err(`${at}: unknown section "${c.section}"`);
  if (!c.front || !c.back) err(`${at}: missing front or back`);
  if (c.back && c.back.length < 12) warn(`${at}: answer is very thin`);
});

/* ---- coverage: every section needs enough to build an exam ---- */
window.DB.index();
window.SECTIONS.forEach(s => {
  const b = window.DB.bySection[s.id];
  const pool = b.questions.length + b.problems.length;
  if (pool < 8) {
    err(`section "${s.id}" has only ${pool} items — a 25-question exam cannot be built`);
  } else if (pool < 14) {
    warn(`section "${s.id}" has ${pool} items — retakes will repeat questions`);
  }
  if (!b.problems.length) warn(`section "${s.id}" has no coding problems`);
});

/* ---- tier coverage: the placement exam needs all four tiers per domain ---- */
window.DOMAINS.forEach(d => {
  const secs = window.DB.sectionsOf(d.id).map(s => s.id);
  window.TIERS.forEach(t => {
    const n = [].concat(window.DB.questions, window.DB.problems)
      .filter(x => secs.includes(x.section) && x.tier === t).length;
    if (n < 3) err(`domain "${d.id}" has only ${n} ${t} items — cannot place a learner at that tier`);
  });
});

/* ---- report ---- */
console.log('\nContent loaded');
console.log('─'.repeat(64));
Object.keys(counts).forEach(f => {
  const c = counts[f];
  console.log(
    '  ' + f.padEnd(24) +
    String(c.problems).padStart(4) + ' prob' +
    String(c.questions).padStart(5) + ' q' +
    String(c.lessons).padStart(4) + ' les' +
    String(c.flashcards).padStart(5) + ' cards'
  );
});
console.log('─'.repeat(64));
const st = window.DB.stats();
console.log(`  TOTAL${' '.repeat(19)}${String(st.problems).padStart(4)} prob${String(st.questions).padStart(5)} q${String(st.lessons).padStart(4)} les${String(st.flashcards).padStart(5)} cards`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.slice(0, 40).forEach(w => console.log('  ! ' + w));
  if (warnings.length > 40) console.log(`  … and ${warnings.length - 40} more`);
}

if (errors.length) {
  console.log(`\n${errors.length} ERROR(s):`);
  errors.slice(0, 60).forEach(e => console.log('  ✗ ' + e));
  if (errors.length > 60) console.log(`  … and ${errors.length - 60} more`);
  console.log('');
  process.exit(1);
}

console.log('\nAll content valid.\n');
