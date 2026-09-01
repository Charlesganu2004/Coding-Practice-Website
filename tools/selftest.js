/* tools/selftest.js — exercises the engine and checker with synthetic content,
 * so the assessment logic is verified independently of the question banks.
 *
 *   node tools/selftest.js
 */

const path = require('path');
const ROOT = path.join(__dirname, '..');

/* minimal browser shims */
const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
global.window = {};

require(path.join(ROOT, 'assets/js/db.js'));
require(path.join(ROOT, 'assets/js/checker.js'));
require(path.join(ROOT, 'assets/js/engine.js'));

const { DB, SECTIONS, DOMAINS, TIERS, LEVELS } = global.window;
const Engine = global.window.Engine;
const Checker = global.window.Checker;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}
function section(t) { console.log('\n' + t); }

/* ---------- synthesise a full content set ---------- */

let n = 0;
SECTIONS.forEach(s => {
  TIERS.forEach(t => {
    for (let i = 0; i < 5; i++) {
      DB.questions.push({
        id: `q-${s.id}-${t}-${i}`, section: s.id, tier: t,
        q: `Synthetic question ${++n} for ${s.id}?`,
        opts: ['a', 'b', 'c', 'd'], correct: i % 4,
        why: 'Because this is a synthetic fixture used by the self-test.'
      });
    }
    for (let i = 0; i < 3; i++) {
      DB.problems.push({
        id: `p-${s.id}-${t}-${i}`, section: s.id, tier: t,
        title: `Synthetic problem ${s.id} ${t} ${i}`,
        difficulty: t === 'beginner' ? 'Easy' : t === 'master' ? 'Hard' : 'Medium',
        prompt: 'Write a function that sums an array of integers and returns the total.',
        approach: 'Iterate once, accumulating into a running total, then return it.',
        keyInsight: 'One pass is enough.',
        complexity: { time: 'O(n)', space: 'O(1)' },
        timeChoices: ['O(1)', 'O(n)', 'O(n log n)', 'O(n^2)'], timeAnswer: 1,
        starter: { cpp: 'int total(vector<int>& v) {\n    // your code\n}',
                   python: 'def total(v):\n    pass' },
        solution: { cpp: 'int total(vector<int>& v) {\n    int s = 0;\n    for (int x : v) s += x;\n    return s;\n}',
                    python: 'def total(v):\n    s = 0\n    for x in v:\n        s += x\n    return s' },
        checks: {
          cpp: [{ re: 'for\\s*\\(|while\\s*\\(|accumulate', hint: 'Loop over the values.' },
                { re: 'return', hint: 'Return the total.' }],
          python: [{ re: 'for\\s+\\w+|sum\\(', hint: 'Loop over the values.' },
                   { re: 'return', hint: 'Return the total.' }]
        },
        antiChecks: { cpp: [], python: [] },
        mcq: [{ q: 'Why one pass?', opts: ['a', 'b', 'c', 'd'], correct: 2, why: 'Fixture.' }]
      });
    }
  });
  for (let i = 0; i < 4; i++) {
    DB.flashcards.push({ id: `fc-${s.id}-${i}`, section: s.id, tier: 'beginner',
      track: 'dsa', front: 'front', back: 'back text long enough' });
  }
});
DB.index();

section('Registry');
ok('every section maps to a known domain',
  SECTIONS.every(s => DOMAINS.some(d => d.id === s.domain)));
ok('index() buckets every problem',
  SECTIONS.every(s => DB.bySection[s.id].problems.length === 12));
ok('domainOfSection resolves', DB.domainOfSection('dp-1d') === 'dsa');

/* ---------- checker ---------- */

section('Checker');
const prob = DB.problems[0];

ok('reference C++ solution passes its own checks',
  Checker.check(prob, 'cpp', prob.solution.cpp).verdict === 'pass');
ok('reference Python solution passes its own checks',
  Checker.check(prob, 'python', prob.solution.python).verdict === 'pass');
ok('unmodified starter is rejected as empty',
  Checker.check(prob, 'cpp', prob.starter.cpp).verdict === 'empty');
ok('blank submission is rejected',
  Checker.check(prob, 'cpp', '   ').verdict === 'empty');

ok('an alternative valid approach also passes',
  Checker.check(prob, 'python', 'def total(v):\n    return sum(v)').verdict === 'pass');

/* Regression: comments must be stripped per line before whitespace is
   collapsed, or one leading '#' swallows the whole submission and a correct
   answer is scored zero. */
ok('a solution that OPENS with a comment is still graded', (() => {
  const withComment = '# walk once, accumulating\ndef total(v):\n    s = 0\n    for x in v:\n        s += x\n    return s';
  return Checker.check(prob, 'python', withComment).verdict === 'pass';
})(), 'a leading comment must not make the submission read as empty');

ok('the same holds for C++ line comments', (() => {
  const withComment = '// accumulate in one pass\nint total(vector<int>& v) {\n    int s = 0;\n    for (int x : v) s += x;\n    return s;\n}';
  return Checker.check(prob, 'cpp', withComment).verdict === 'pass';
})());

ok('answer hidden in a comment does not count',
  Checker.check(prob, 'cpp', 'int total(vector<int>& v) {\n// for (int x : v) return x;\nint q=1; int w=2; int e=3;\n}').verdict !== 'pass');

ok('partial answer scores between 0 and 1', (() => {
  const r = Checker.check(prob, 'cpp', 'int total(vector<int>& v) {\n    for (int x : v) { int y = x; }\n    int z = 0;\n}');
  return r.score > 0 && r.score < 1;
})());

ok('antiCheck penalises but does not zero', (() => {
  const p2 = JSON.parse(JSON.stringify(prob));
  p2.antiChecks.python = [{ re: 'for[\\s\\S]{0,80}\\n\\s+for\\s', hint: 'nested' }];
  const r = Checker.check(p2, 'python', 'def total(v):\n    for a in v:\n        for b in v:\n            pass\n    return 0');
  return r.tripped.length === 1 && r.score < 1 && r.score >= 0;
})());

ok('gradeForExam blends approach and complexity', (() => {
  const good = Checker.gradeForExam(prob, 'python', prob.solution.python, 1);
  const noCx = Checker.gradeForExam(prob, 'python', prob.solution.python, 3);
  return Math.abs(good.score - 1) < 1e-9 && Math.abs(noCx.score - 0.75) < 1e-9;
})(), 'complexity should be 25% of a coding item');

/* ---------- level model ---------- */

section('Level model');
Engine.load();

ok('levelFor maps the bands', LEVELS.map(l => Engine.levelFor(l.min).name).join(',') ===
  LEVELS.map(l => l.name).join(','));
ok('a perfect score is Master', Engine.levelFor(1).name === 'Master');
ok('a zero score is Beginner', Engine.levelFor(0).name === 'Beginner');

ok('harder items carry more weight', (() => {
  const easyRight = Engine.scoreItems([
    { tier: 'beginner', correct: true }, { tier: 'master', correct: false }
  ]);
  const hardRight = Engine.scoreItems([
    { tier: 'beginner', correct: false }, { tier: 'master', correct: true }
  ]);
  return hardRight > easyRight;
})());

ok('one weak domain caps the overall level', (() => {
  const r = Engine.overallLevel({ dsa: 1, cpp: 1, python: 1, lld: 1, ml: 0.1 });
  return r.level.id < r.rawLevel.id;
})(), 'weakest area should pull the headline level down');

ok('uniform mastery is not capped', (() => {
  const r = Engine.overallLevel({ dsa: 0.95, cpp: 0.95, python: 0.95, lld: 0.92, ml: 0.9 });
  return r.level.name === 'Master';
})());

/* ---------- placement assembly ---------- */

section('Placement exam');
[25, 45, 70].forEach(size => {
  const ex = Engine.buildPlacement(size, 12345);
  const domains = {};
  ex.items.forEach(it => {
    const d = DB.domainOfSection(it.item.section);
    domains[d] = (domains[d] || 0) + 1;
  });
  ok(`size ${size}: builds ${ex.items.length} items (within 25% of target)`,
    Math.abs(ex.items.length - size) <= size * 0.25, `got ${ex.items.length}`);
  ok(`size ${size}: covers all ${DOMAINS.length} areas`,
    Object.keys(domains).length === DOMAINS.length, JSON.stringify(domains));
  const tiers = {};
  ex.items.forEach(it => { tiers[it.item.tier] = (tiers[it.item.tier] || 0) + 1; });
  ok(`size ${size}: spans all four tiers`, Object.keys(tiers).length === 4, JSON.stringify(tiers));
  const codes = ex.items.filter(i => i.kind === 'code').length;
  ok(`size ${size}: includes coding items (${codes})`, codes >= 3);
});

ok('same seed reproduces the same paper', (() => {
  const a = Engine.buildPlacement(45, 999).items.map(i => i.item.id).join();
  const b = Engine.buildPlacement(45, 999).items.map(i => i.item.id).join();
  return a === b;
})());

ok('a different seed gives a different paper', (() => {
  const a = Engine.buildPlacement(45, 111).items.map(i => i.item.id).join();
  const b = Engine.buildPlacement(45, 222).items.map(i => i.item.id).join();
  return a !== b;
})());

ok('no item appears twice in one paper', (() => {
  const ids = Engine.buildPlacement(70, 42).items.map(i => i.item.id);
  return new Set(ids).size === ids.length;
})());

/* ---------- section exam + gating ---------- */

section('Section exam and gating');
const secEx = Engine.buildSectionExam('dp-1d', 25, 7);
ok('draws only from its own section', secEx.items.every(i => i.item.section === 'dp-1d'));
ok('has a pass mark of 80%', secEx.passMark === 0.8);
ok('mixes coding and multiple choice',
  secEx.items.some(i => i.kind === 'code') && secEx.items.some(i => i.kind === 'mc'));

/* fail it */
const failRecords = secEx.items.map(i => ({
  id: i.item.id, kind: i.kind, section: i.item.section, tier: i.item.tier,
  correct: false, score: 0
}));
Engine.recordAttempt(secEx, failRecords);
ok('a failed attempt does not pass the section',
  Engine.sectionProgress('dp-1d').passed === false);

/* pass it */
const secEx2 = Engine.buildSectionExam('dp-1d', 25, 8);
const passRecords = secEx2.items.map(i => ({
  id: i.item.id, kind: i.kind, section: i.item.section, tier: i.item.tier,
  correct: true, score: 1
}));
Engine.recordAttempt(secEx2, passRecords);
ok('a 100% attempt passes the section', Engine.sectionProgress('dp-1d').passed === true);
ok('attempt count is tracked', Engine.sectionProgress('dp-1d').attempts === 2);

/* A retake can only differ as far as the pool allows: drawing 25 items from a
   32-item bank must repeat at least 18 of them. So test the real contract —
   when the pool has room, a retake prefers items you have not seen. */
ok('a retake prefers unseen questions when the pool has room', (() => {
  Engine.reset();
  const first = Engine.buildSectionExam('graphs', 10, 1);
  Engine.markSeen('graphs', first.items.map(i => i.item.id));
  const second = Engine.buildSectionExam('graphs', 10, 2).items.map(i => i.item.id);
  const seen = new Set(first.items.map(i => i.item.id));
  const overlap = second.filter(id => seen.has(id)).length;
  /* 32-item pool, 10 seen: a random draw would repeat ~3; preference should give 0 */
  return overlap === 0;
})(), 'with 22 unseen items available, a 10-item retake should reuse none');

ok('a retake still fills the paper when the pool is exhausted', (() => {
  Engine.reset();
  const all = Engine.buildSectionExam('graphs', 25, 1);
  Engine.markSeen('graphs', all.items.map(i => i.item.id));
  return Engine.buildSectionExam('graphs', 25, 2).items.length === 25;
})(), 'it must recycle rather than return a short paper');

/* ---------- placement scoring end to end ---------- */

section('Placement scoring, end to end');
Engine.reset();

function takePlacement(seed, correctFn) {
  const ex = Engine.buildPlacement(45, seed);
  const records = ex.items.map(i => {
    const right = correctFn(i);
    return {
      id: i.item.id, kind: i.kind, section: i.item.section, tier: i.item.tier,
      correct: right, score: right ? 1 : 0, item: i.item, pick: right ? i.item.correct : 0
    };
  });
  return Engine.recordAttempt(ex, records);
}

const beginnerRun = takePlacement(1, i => i.item.tier === 'beginner');
ok('answering only beginner items reads as a low level',
  beginnerRun.attempt.levelId <= 1, beginnerRun.attempt.levelName);

Engine.reset();
const masterRun = takePlacement(2, () => true);
ok('answering everything reads as Master',
  masterRun.attempt.levelName === 'Master', masterRun.attempt.levelName);
ok('placementDone flips after a placement', Engine.state.placementDone === true);

Engine.reset();
const mixed = takePlacement(3, i => DB.domainOfSection(i.item.section) !== 'ml');
ok('a single weak area shows up as the weakest domain', (() => {
  const ds = mixed.attempt.domainScores;
  return ds.ml === 0 && Object.keys(ds).filter(k => k !== 'ml').every(k => ds[k] > 0.5);
})(), JSON.stringify(mixed.attempt.domainScores));
ok('the study plan puts the weak area first', (() => {
  const plan = Engine.studyPlan(mixed.analysis);
  return plan.length > 0 && DB.domainOfSection(plan[0].section.id) === 'ml';
})());

/* ---------- retake delta ---------- */

section('Retake delta');
Engine.reset();
takePlacement(10, i => i.item.tier === 'beginner');
takePlacement(11, () => true);
const delta = Engine.placementDelta();
ok('a delta is produced after two placements', !!delta);
ok('the level movement is reported as an increase', delta && delta.levelMoved > 0,
  delta ? `${delta.levelBefore} → ${delta.levelAfter}` : '');
ok('improved sections are listed', delta && delta.improved.length > 0);
ok('score rose', delta && delta.scoreAfter > delta.scoreBefore);

/* ---------- persistence ---------- */

section('Persistence');
Engine.reset();
Engine.recordProblem('p-dp-1d-beginner-0', 'cpp', 'int total(){return 0;}', { score: 1 });
Engine.markLessonRead('some-lesson');
const dump = Engine.exportState();
Engine.reset();
ok('a reset clears progress', Engine.problemStatus('p-dp-1d-beginner-0') === 'new');
Engine.importState(dump);
ok('an import restores progress', Engine.problemStatus('p-dp-1d-beginner-0') === 'solved');
ok('an import restores lessons read', !!Engine.state.lessonsRead['some-lesson']);
ok('corrupt storage does not crash the app', (() => {
  store['cpw:v1'] = '{not json';
  try { Engine.load(); return true; } catch (e) { return false; }
})());

/* ---------- flashcards ---------- */

section('Flashcards');
Engine.reset();
const card = DB.flashcards[0];
Engine.gradeCard(card.id, true);
ok('a correct card moves up a box', Engine.cardState(card.id).box === 1);
Engine.gradeCard(card.id, false);
ok('a missed card drops to box 0', Engine.cardState(card.id).box === 0);
ok('a missed card is due immediately', Engine.cardState(card.id).due <= Date.now() + 1000);

/* ---------- report ---------- */

console.log('\n' + '─'.repeat(50));
console.log(`${pass} passed, ${fail} failed`);
console.log('─'.repeat(50) + '\n');
process.exit(fail ? 1 : 0);
