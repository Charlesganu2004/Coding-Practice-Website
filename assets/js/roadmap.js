/* roadmap.js — the interactive dependency map.
 *
 * Each domain is a DAG: a node is a section, an edge means "the parent teaches
 * something the child assumes". A node unlocks when every parent is passed.
 * Positions are hand-laid so the graph reads top-to-bottom without crossings.
 */

(function () {
  'use strict';

  const W = 208, H = 66;   /* node box */

  const MAPS = {
    dsa: {
      width: 1120, height: 856,
      title: 'DSA — the 18 patterns',
      blurb: 'Follow the arrows. Each pattern assumes the ones feeding into it.',
      nodes: [
        { id: 'arrays-hashing',   x: 448, y: 12 },
        { id: 'two-pointers',     x: 232, y: 118 },
        { id: 'stack',            x: 672, y: 118 },
        { id: 'binary-search',    x: 16,  y: 224 },
        { id: 'sliding-window',   x: 232, y: 224 },
        { id: 'linked-list',      x: 448, y: 224 },
        { id: 'trees',            x: 448, y: 330 },
        { id: 'heap-pq',          x: 16,  y: 436 },
        { id: 'tries',            x: 232, y: 436 },
        { id: 'backtracking',     x: 672, y: 436 },
        { id: 'dp-1d',            x: 448, y: 542 },
        { id: 'graphs',           x: 672, y: 542 },
        { id: 'greedy',           x: 232, y: 648 },
        { id: 'dp-2d',            x: 448, y: 648 },
        { id: 'advanced-graphs',  x: 888, y: 648 },
        { id: 'intervals',        x: 16,  y: 754 },
        { id: 'bit-manipulation', x: 448, y: 754 },
        { id: 'math-geometry',    x: 672, y: 754 }
      ],
      edges: [
        ['arrays-hashing', 'two-pointers'],
        ['arrays-hashing', 'stack'],
        ['two-pointers', 'binary-search'],
        ['two-pointers', 'sliding-window'],
        ['two-pointers', 'linked-list'],
        ['linked-list', 'trees'],
        ['binary-search', 'trees'],
        ['trees', 'heap-pq'],
        ['trees', 'tries'],
        ['trees', 'backtracking'],
        ['backtracking', 'dp-1d'],
        ['backtracking', 'graphs'],
        ['graphs', 'advanced-graphs'],
        ['dp-1d', 'dp-2d'],
        ['dp-1d', 'greedy'],
        ['graphs', 'dp-2d'],
        ['greedy', 'intervals'],
        ['dp-2d', 'bit-manipulation'],
        ['dp-2d', 'math-geometry']
      ]
    },

    cpp: {
      width: 700, height: 540,
      title: 'C++ — language to mastery',
      blurb: 'Ownership is the spine of C++. Everything after it assumes you have it.',
      nodes: [
        { id: 'cpp-core',   x: 240, y: 12 },
        { id: 'cpp-memory', x: 240, y: 140 },
        { id: 'cpp-oop',    x: 60,  y: 276 },
        { id: 'cpp-modern', x: 420, y: 276 },
        { id: 'rw-cpp',     x: 240, y: 412 }
      ],
      edges: [
        ['cpp-core', 'cpp-memory'],
        ['cpp-memory', 'cpp-oop'],
        ['cpp-memory', 'cpp-modern'],
        ['cpp-oop', 'rw-cpp'],
        ['cpp-modern', 'rw-cpp']
      ]
    },

    python: {
      width: 700, height: 420,
      title: 'Python — language to mastery',
      blurb: 'The data model is the unlock: once dunders click, the rest is library knowledge.',
      nodes: [
        { id: 'py-core',        x: 240, y: 12 },
        { id: 'py-data-model',  x: 60,  y: 148 },
        { id: 'py-stdlib-perf', x: 420, y: 148 }
      ],
      edges: [
        ['py-core', 'py-data-model'],
        ['py-core', 'py-stdlib-perf']
      ]
    },

    lld: {
      width: 700, height: 300,
      title: 'Low-Level Design',
      blurb: 'Principles first, then the classic interview problems.',
      nodes: [
        { id: 'lld-principles', x: 240, y: 12 },
        { id: 'lld-problems',   x: 240, y: 148 }
      ],
      edges: [['lld-principles', 'lld-problems']]
    },

    ml: {
      width: 900, height: 420,
      title: 'Machine Learning',
      blurb: 'Foundations carry everything; production is where most candidates are thin.',
      nodes: [
        { id: 'ml-foundations',   x: 340, y: 12 },
        { id: 'ml-modeling',      x: 130, y: 148 },
        { id: 'ml-deep-learning', x: 550, y: 148 },
        { id: 'ml-systems',       x: 340, y: 284 }
      ],
      edges: [
        ['ml-foundations', 'ml-modeling'],
        ['ml-foundations', 'ml-deep-learning'],
        ['ml-modeling', 'ml-systems'],
        ['ml-deep-learning', 'ml-systems']
      ]
    }
  };

  const Roadmap = {
    maps: MAPS,
    NODE_W: W,
    NODE_H: H,

    map(domainId) { return MAPS[domainId] || null; },

    parentsOf(domainId, sectionId) {
      const m = MAPS[domainId];
      if (!m) return [];
      return m.edges.filter(e => e[1] === sectionId).map(e => e[0]);
    },

    /* A node is unlocked when every parent has been passed. Roots are always
       open, and nothing is ever hard-locked — locking is advisory here, because
       forcing a strict order fights the placement exam's whole purpose. */
    isUnlocked(domainId, sectionId, isPassed) {
      const parents = this.parentsOf(domainId, sectionId);
      if (!parents.length) return true;
      return parents.every(p => isPassed(p));
    },

    /* Orthogonal elbow path from the bottom of `a` to the top of `b`. */
    edgePath(a, b) {
      const x1 = a.x + W / 2, y1 = a.y + H;
      const x2 = b.x + W / 2, y2 = b.y;
      const mid = y1 + (y2 - y1) / 2;
      if (Math.abs(x1 - x2) < 2) return 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2;
      const r = 12;
      const dir = x2 > x1 ? 1 : -1;
      return 'M' + x1 + ' ' + y1 +
             ' L' + x1 + ' ' + (mid - r) +
             ' Q' + x1 + ' ' + mid + ' ' + (x1 + r * dir) + ' ' + mid +
             ' L' + (x2 - r * dir) + ' ' + mid +
             ' Q' + x2 + ' ' + mid + ' ' + x2 + ' ' + (mid + r) +
             ' L' + x2 + ' ' + y2;
    }
  };

  window.Roadmap = Roadmap;
})();
