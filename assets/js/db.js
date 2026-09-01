/* db.js — content registry. MUST load before any data/*.js file. */

window.DB = {
  problems: [],
  questions: [],
  lessons: [],
  flashcards: []
};

/* ---------- Domains & sections ---------------------------------------- */

window.DOMAINS = [
  { id: 'dsa',    name: 'DSA / NeetCode Core Skills', short: 'DSA',    icon: '◇',
    blurb: 'The 18 patterns that cover essentially every coding-interview question.' },
  { id: 'cpp',    name: 'C++',                        short: 'C++',    icon: '✦',
    blurb: 'The language itself: memory, ownership, objects, and modern C++.' },
  { id: 'python', name: 'Python',                     short: 'Python', icon: '▲',
    blurb: 'The object model, the data model, and the standard library that wins interviews.' },
  { id: 'lld',    name: 'Low-Level Design',           short: 'LLD',    icon: '▣',
    blurb: 'Turning requirements into classes: SOLID, patterns, and the 45-minute answer.' },
  { id: 'ml',     name: 'Machine Learning',           short: 'ML',     icon: '◎',
    blurb: 'Foundations, modelling, deep learning, and shipping models that survive contact.' }
];

window.SECTIONS = [
  /* --- DSA: NeetCode roadmap order ----------------------------------- */
  { id: 'arrays-hashing',   domain: 'dsa', name: 'Arrays & Hashing',      order: 1 },
  { id: 'two-pointers',     domain: 'dsa', name: 'Two Pointers',          order: 2 },
  { id: 'sliding-window',   domain: 'dsa', name: 'Sliding Window',        order: 3 },
  { id: 'stack',            domain: 'dsa', name: 'Stack',                 order: 4 },
  { id: 'binary-search',    domain: 'dsa', name: 'Binary Search',         order: 5 },
  { id: 'linked-list',      domain: 'dsa', name: 'Linked List',           order: 6 },
  { id: 'trees',            domain: 'dsa', name: 'Trees',                 order: 7 },
  { id: 'tries',            domain: 'dsa', name: 'Tries',                 order: 8 },
  { id: 'heap-pq',          domain: 'dsa', name: 'Heap / Priority Queue', order: 9 },
  { id: 'backtracking',     domain: 'dsa', name: 'Backtracking',          order: 10 },
  { id: 'graphs',           domain: 'dsa', name: 'Graphs',                order: 11 },
  { id: 'advanced-graphs',  domain: 'dsa', name: 'Advanced Graphs',       order: 12 },
  { id: 'dp-1d',            domain: 'dsa', name: '1-D Dynamic Programming', order: 13 },
  { id: 'dp-2d',            domain: 'dsa', name: '2-D Dynamic Programming', order: 14 },
  { id: 'greedy',           domain: 'dsa', name: 'Greedy',                order: 15 },
  { id: 'intervals',        domain: 'dsa', name: 'Intervals',             order: 16 },
  { id: 'math-geometry',    domain: 'dsa', name: 'Math & Geometry',       order: 17 },
  { id: 'bit-manipulation', domain: 'dsa', name: 'Bit Manipulation',      order: 18 },

  /* --- C++ ------------------------------------------------------------ */
  { id: 'cpp-core',    domain: 'cpp', name: 'C++ Core Language',       order: 1 },
  { id: 'cpp-memory',  domain: 'cpp', name: 'Memory, RAII & Ownership', order: 2 },
  { id: 'cpp-oop',     domain: 'cpp', name: 'OOP, Templates & Dispatch', order: 3 },
  { id: 'cpp-modern',  domain: 'cpp', name: 'Modern C++ (17/20/23/26)', order: 4 },
  { id: 'rw-cpp',      domain: 'cpp', name: 'Real-World C++ Codebases',  order: 5 },

  /* --- Python --------------------------------------------------------- */
  { id: 'py-core',        domain: 'python', name: 'Python Core Language',      order: 1 },
  { id: 'py-data-model',  domain: 'python', name: 'The Python Data Model',     order: 2 },
  { id: 'py-stdlib-perf', domain: 'python', name: 'Stdlib, Complexity & Perf', order: 3 },

  /* --- LLD ------------------------------------------------------------ */
  { id: 'lld-principles', domain: 'lld', name: 'Design Principles & Patterns', order: 1 },
  { id: 'lld-problems',   domain: 'lld', name: 'Design Problems',              order: 2 },

  /* --- ML ------------------------------------------------------------- */
  { id: 'ml-foundations',   domain: 'ml', name: 'ML Foundations',    order: 1 },
  { id: 'ml-modeling',      domain: 'ml', name: 'Modelling & Metrics', order: 2 },
  { id: 'ml-deep-learning', domain: 'ml', name: 'Deep Learning',     order: 3 },
  { id: 'ml-systems',       domain: 'ml', name: 'ML in Production',   order: 4 }
];

/* ---------- Skill levels ---------------------------------------------- */

window.LEVELS = [
  { id: 0, name: 'Beginner',     min: 0.00, blurb: 'Building the vocabulary. Work through lessons before problems.' },
  { id: 1, name: 'Novice',       min: 0.35, blurb: 'The ideas are landing. Drill the patterns until they are automatic.' },
  { id: 2, name: 'Intermediate', min: 0.55, blurb: 'Solid core. The gap is speed and the harder variants.' },
  { id: 3, name: 'Advanced',     min: 0.72, blurb: 'Interview-ready in most sections. Close the last weak spots.' },
  { id: 4, name: 'Master',       min: 0.88, blurb: 'Deep command. Maintain with hard problems and edge cases.' }
];

window.TIER_WEIGHT = { beginner: 1, intermediate: 2, advanced: 3, master: 4 };
window.TIERS = ['beginner', 'intermediate', 'advanced', 'master'];

/* ---------- Lookups (populated by DB.index() after data loads) --------- */

window.DB.byId = {};
window.DB.bySection = {};
window.DB.sectionById = {};
window.DB.domainById = {};

/* ---------- answer-position balancing --------------------------------- *
 * Authors unconsciously park the right answer at B. Left alone, roughly
 * three quarters of this bank answers to index 1, which is guessable without
 * knowing anything. Every question's options are permuted deterministically
 * from a hash of its id: the spread evens out, and because the permutation is
 * a pure function of the id it is stable across sessions, so review screens
 * and stored attempt history still line up.
 */
function hashId(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/* Round-robin the target slot so the distribution is exactly even, rather
   than merely random. Items are ordered by a hash of their id first, so the
   assignment is stable and does not depend on file load order. */
function balanceAnswers(items) {
  const eligible = items.filter(it =>
    it && !it.__balanced && Array.isArray(it.opts) && it.opts.length >= 2 &&
    it.correct >= 0 && it.correct < it.opts.length);

  eligible.sort((a, b) => {
    const ha = hashId(a.id || ''), hb = hashId(b.id || '');
    return ha === hb ? String(a.id).localeCompare(String(b.id)) : ha - hb;
  });

  eligible.forEach((item, i) => {
    const target = i % item.opts.length;
    const cur = item.correct;
    if (cur !== target) {
      const tmp = item.opts[target];
      item.opts[target] = item.opts[cur];
      item.opts[cur] = tmp;
      item.correct = target;
    }
    item.__balanced = true;
  });
}

window.DB.index = function () {
  const self = window.DB;

  const mcqs = [];
  self.problems.forEach(p => (p.mcq || []).forEach(m => mcqs.push(m)));
  balanceAnswers(self.questions);
  balanceAnswers(mcqs);
  self.byId = {};
  self.bySection = {};
  self.sectionById = {};
  self.domainById = {};

  window.SECTIONS.forEach(s => { self.sectionById[s.id] = s; });
  window.DOMAINS.forEach(d => { self.domainById[d.id] = d; });

  window.SECTIONS.forEach(s => {
    self.bySection[s.id] = { problems: [], questions: [], lessons: [], flashcards: [] };
  });

  const bucket = (item, kind) => {
    if (item && item.id) self.byId[item.id] = item;
    const b = self.bySection[item && item.section];
    if (b) b[kind].push(item);
  };

  self.problems.forEach(p => bucket(p, 'problems'));
  self.questions.forEach(q => bucket(q, 'questions'));
  self.lessons.forEach(l => bucket(l, 'lessons'));
  self.flashcards.forEach(f => bucket(f, 'flashcards'));

  Object.keys(self.bySection).forEach(id => {
    self.bySection[id].lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  return self;
};

window.DB.sectionsOf = function (domainId) {
  return window.SECTIONS
    .filter(s => s.domain === domainId)
    .sort((a, b) => a.order - b.order);
};

window.DB.domainOfSection = function (sectionId) {
  const s = window.DB.sectionById[sectionId];
  return s ? s.domain : null;
};

/* Content counts, used by the dashboard and by the loader sanity check. */
window.DB.stats = function () {
  const self = window.DB;
  return {
    problems: self.problems.length,
    questions: self.questions.length,
    lessons: self.lessons.length,
    flashcards: self.flashcards.length,
    sections: window.SECTIONS.length,
    coding: self.problems.length
  };
};
