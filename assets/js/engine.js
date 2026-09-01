/* engine.js — progress state, skill estimation, and exam assembly. */

(function () {
  'use strict';

  const STORE_KEY = 'cpw:v1';

  /* ================= persistent state ================= */

  const blankState = () => ({
    version: 1,
    createdAt: Date.now(),
    placementDone: false,
    lang: 'cpp',                 // preferred language for coding work
    attempts: [],                // exam attempt records, newest last
    sectionMastery: {},          // sectionId -> { passed, bestPct, attempts, passedAt }
    lessonsRead: {},             // lessonId -> ts
    problemState: {},            // problemId -> { status, bestScore, lang, code, ts }
    questionState: {},           // questionId -> { seen, correct, ts }
    seenItems: {},               // sectionId -> [itemIds] used by exams (to vary retakes)
    cards: {},                   // flashcardId -> { box, due, seen }
    stats: { problemsAttempted: 0, problemsSolved: 0, questionsAnswered: 0, questionsCorrect: 0 }
  });

  const Engine = {
    state: blankState(),

    load() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.state = Object.assign(blankState(), parsed);
        }
      } catch (e) {
        this.state = blankState();
      }
      return this.state;
    },

    save() {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
      } catch (e) { /* private mode / quota — run without persistence */ }
    },

    reset() {
      this.state = blankState();
      this.save();
    },

    exportState() {
      return JSON.stringify(this.state, null, 2);
    },

    importState(json) {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object') throw new Error('Not a progress file.');
      this.state = Object.assign(blankState(), parsed);
      this.save();
    },

    /* ================= deterministic RNG ================= */

    /* mulberry32 — seeded so an exam can be regenerated identically, and so a
       retake with a different seed gives a genuinely different paper. */
    rng(seed) {
      let a = seed >>> 0;
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },

    shuffle(arr, rand) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },

    /* ================= skill estimation ================= */

    /* Weighted by tier: getting a 'master' item right is worth more evidence than
       a 'beginner' one, and getting a beginner item wrong costs more. */
    scoreItems(records) {
      let num = 0, den = 0;
      records.forEach(r => {
        const w = window.TIER_WEIGHT[r.tier] || 1;
        num += w * (r.score != null ? r.score : (r.correct ? 1 : 0));
        den += w;
      });
      return den === 0 ? null : num / den;
    },

    levelFor(score) {
      if (score == null) return null;
      let lvl = window.LEVELS[0];
      window.LEVELS.forEach(l => { if (score >= l.min) lvl = l; });
      return lvl;
    },

    /* Overall level is the weighted mean across domains, but capped so a single
       badly-weak domain stops you being called a Master overall. */
    overallLevel(domainScores) {
      const vals = Object.keys(domainScores)
        .map(k => domainScores[k])
        .filter(v => v != null);
      if (!vals.length) return null;
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const weakest = Math.min.apply(null, vals);
      const meanLvl = this.levelFor(mean);
      const weakLvl = this.levelFor(weakest);
      const capped = Math.min(meanLvl.id, weakLvl.id + 1);
      return { score: mean, level: window.LEVELS[capped], rawLevel: meanLvl, weakest: weakest };
    },

    /* Build the full picture from one attempt's per-item records. */
    analyse(records) {
      const bySection = {}, byDomain = {}, byTier = {};

      records.forEach(r => {
        (bySection[r.section] = bySection[r.section] || []).push(r);
        const d = window.DB.domainOfSection(r.section);
        if (d) (byDomain[d] = byDomain[d] || []).push(r);
        (byTier[r.tier] = byTier[r.tier] || []).push(r);
      });

      const sectionScores = {}, sectionLevels = {}, sectionCounts = {};
      Object.keys(bySection).forEach(s => {
        sectionScores[s] = this.scoreItems(bySection[s]);
        sectionLevels[s] = this.levelFor(sectionScores[s]);
        sectionCounts[s] = bySection[s].length;
      });

      const domainScores = {}, domainLevels = {};
      Object.keys(byDomain).forEach(d => {
        domainScores[d] = this.scoreItems(byDomain[d]);
        domainLevels[d] = this.levelFor(domainScores[d]);
      });

      const tierScores = {};
      Object.keys(byTier).forEach(t => { tierScores[t] = this.scoreItems(byTier[t]); });

      const overall = this.overallLevel(domainScores);

      /* Ranked weak areas: only sections with enough evidence to be fair. */
      const ranked = Object.keys(sectionScores)
        .filter(s => sectionCounts[s] >= 2)
        .sort((a, b) => sectionScores[a] - sectionScores[b]);

      return {
        records, sectionScores, sectionLevels, sectionCounts,
        domainScores, domainLevels, tierScores, overall,
        weakest: ranked.slice(0, 8),
        strongest: ranked.slice(-5).reverse(),
        raw: {
          correct: records.filter(r => (r.score != null ? r.score >= 0.7 : r.correct)).length,
          total: records.length
        }
      };
    },

    /* ================= study plan ================= */

    /* Ordered list of what to do next. Weak sections first, but a section you
       have no data on at all is worth measuring before grinding it. */
    studyPlan(analysis) {
      if (!analysis) return [];
      const plan = [];
      const seen = {};

      analysis.weakest.forEach(sid => {
        const sec = window.DB.sectionById[sid];
        if (!sec || seen[sid]) return;
        seen[sid] = true;
        const score = analysis.sectionScores[sid];
        const lvl = analysis.sectionLevels[sid];
        const bucket = window.DB.bySection[sid] || { lessons: [], problems: [] };
        plan.push({
          section: sec,
          score,
          level: lvl,
          reason: score < 0.35
            ? 'Start with the lessons — the fundamentals are not in place yet.'
            : score < 0.6
              ? 'You know the idea but it is not reliable. Drill the problems.'
              : 'Close to solid. Push into the harder problems, then take the section exam.',
          lessons: bucket.lessons.length,
          problems: bucket.problems.length
        });
      });

      return plan;
    },

    /* ================= exam assembly ================= */

    /* Pick n items from a pool, preferring ones the learner has not seen in a
       previous exam, so a retake is a genuinely new paper. */
    pick(pool, n, rand, sectionId) {
      if (n <= 0 || !pool.length) return [];
      const seenList = (this.state.seenItems && this.state.seenItems[sectionId]) || [];
      const seenSet = {};
      seenList.forEach(id => { seenSet[id] = true; });

      const fresh = pool.filter(x => !seenSet[x.id]);
      const stale = pool.filter(x => seenSet[x.id]);

      const out = this.shuffle(fresh, rand).slice(0, n);
      if (out.length < n) {
        out.push.apply(out, this.shuffle(stale, rand).slice(0, n - out.length));
      }
      return out;
    },

    markSeen(sectionId, ids) {
      if (!this.state.seenItems[sectionId]) this.state.seenItems[sectionId] = [];
      const list = this.state.seenItems[sectionId];
      ids.forEach(id => { if (list.indexOf(id) === -1) list.push(id); });
      /* Let the pool recycle once most of it has been used. */
      const poolSize = ((window.DB.bySection[sectionId] || {}).questions || []).length +
                       ((window.DB.bySection[sectionId] || {}).problems || []).length;
      if (poolSize && list.length > poolSize * 0.75) {
        this.state.seenItems[sectionId] = list.slice(-Math.floor(poolSize * 0.25));
      }
    },

    /* The general placement exam: samples every domain and every tier so the
       result is a real position on the beginner..master scale, not a topic score. */
    buildPlacement(size, seed) {
      const rand = this.rng(seed);
      /* Domain shares of the paper. DSA is the biggest because it is the biggest
         body of work and the best single predictor of interview readiness. */
      const shares = { dsa: 0.36, cpp: 0.18, python: 0.18, lld: 0.13, ml: 0.15 };
      const codingShare = 0.28;

      const items = [];

      window.DOMAINS.forEach(dom => {
        const want = Math.max(3, Math.round(size * shares[dom.id]));
        const sections = window.DB.sectionsOf(dom.id);

        const qPool = [], pPool = [];
        sections.forEach(s => {
          const b = window.DB.bySection[s.id] || { questions: [], problems: [] };
          qPool.push.apply(qPool, b.questions);
          pPool.push.apply(pPool, b.problems);
        });

        const wantCode = Math.round(want * codingShare);
        const wantMc = want - wantCode;

        /* Spread across tiers so the estimate can distinguish a strong beginner
           from a weak expert. */
        const tierTargets = { beginner: 0.25, intermediate: 0.30, advanced: 0.25, master: 0.20 };

        const takeTiered = (pool, total, kind) => {
          const out = [];
          window.TIERS.forEach(t => {
            const nT = Math.round(total * tierTargets[t]);
            const sub = pool.filter(x => x.tier === t && out.indexOf(x) === -1);
            out.push.apply(out, this.shuffle(sub, rand).slice(0, nT));
          });
          /* Backfill from anywhere in the pool if a tier was thin. */
          if (out.length < total) {
            const rest = pool.filter(x => out.indexOf(x) === -1);
            out.push.apply(out, this.shuffle(rest, rand).slice(0, total - out.length));
          }
          return out.slice(0, total).map(x => ({ kind, item: x }));
        };

        items.push.apply(items, takeTiered(qPool, wantMc, 'mc'));
        items.push.apply(items, takeTiered(pPool, wantCode, 'code'));
      });

      return {
        id: 'placement-' + seed,
        kind: 'placement',
        title: 'Placement Exam',
        seed,
        passMark: null,
        items: this.shuffle(items, rand)
      };
    },

    /* A section exam: deeper, tier-ramped, and gated at 80%. */
    buildSectionExam(sectionId, size, seed) {
      const rand = this.rng(seed);
      const b = window.DB.bySection[sectionId] || { questions: [], problems: [] };
      const sec = window.DB.sectionById[sectionId];

      const wantCode = Math.max(2, Math.round(size * 0.35));
      const wantMc = size - wantCode;

      const mc = this.pick(b.questions, wantMc, rand, sectionId).map(x => ({ kind: 'mc', item: x }));
      const code = this.pick(b.problems, wantCode, rand, sectionId).map(x => ({ kind: 'code', item: x }));

      const items = this.shuffle(mc.concat(code), rand);

      return {
        id: 'section-' + sectionId + '-' + seed,
        kind: 'section',
        sectionId,
        title: (sec ? sec.name : sectionId) + ' — Section Exam',
        seed,
        passMark: 0.8,
        items
      };
    },

    /* ================= recording results ================= */

    recordAttempt(exam, records) {
      const analysis = this.analyse(records);
      const pct = records.length
        ? records.reduce((a, r) => a + (r.score != null ? r.score : (r.correct ? 1 : 0)), 0) / records.length
        : 0;

      const attempt = {
        at: Date.now(),
        kind: exam.kind,
        sectionId: exam.sectionId || null,
        title: exam.title,
        seed: exam.seed,
        total: records.length,
        pct,
        weightedScore: analysis.overall ? analysis.overall.score : null,
        levelId: analysis.overall ? analysis.overall.level.id : null,
        levelName: analysis.overall ? analysis.overall.level.name : null,
        sectionScores: analysis.sectionScores,
        domainScores: analysis.domainScores,
        missed: records.filter(r => !(r.score != null ? r.score >= 0.7 : r.correct))
                       .map(r => ({ id: r.id, section: r.section, kind: r.kind }))
      };

      /* Vary future papers. */
      const bySection = {};
      records.forEach(r => { (bySection[r.section] = bySection[r.section] || []).push(r.id); });
      Object.keys(bySection).forEach(s => this.markSeen(s, bySection[s]));

      if (exam.kind === 'placement') {
        this.state.placementDone = true;
      }

      if (exam.kind === 'section' && exam.sectionId) {
        const m = this.state.sectionMastery[exam.sectionId] ||
                  { passed: false, bestPct: 0, attempts: 0, passedAt: null };
        m.attempts += 1;
        m.bestPct = Math.max(m.bestPct, pct);
        if (pct >= (exam.passMark || 0.8)) {
          if (!m.passed) m.passedAt = Date.now();
          m.passed = true;
        }
        this.state.sectionMastery[exam.sectionId] = m;
        attempt.passed = pct >= (exam.passMark || 0.8);
      }

      records.forEach(r => {
        if (r.kind === 'mc') {
          this.state.questionState[r.id] = { seen: true, correct: !!r.correct, ts: Date.now() };
          this.state.stats.questionsAnswered++;
          if (r.correct) this.state.stats.questionsCorrect++;
        }
      });

      this.state.attempts.push(attempt);
      this.save();
      return { attempt, analysis };
    },

    /* The most recent placement attempt is the current skill picture. */
    latestPlacement() {
      for (let i = this.state.attempts.length - 1; i >= 0; i--) {
        if (this.state.attempts[i].kind === 'placement') return this.state.attempts[i];
      }
      return null;
    },

    previousPlacement() {
      const found = [];
      this.state.attempts.forEach(a => { if (a.kind === 'placement') found.push(a); });
      return found.length >= 2 ? found[found.length - 2] : null;
    },

    /* Delta between the two most recent placements — 'what changed since last time'. */
    placementDelta() {
      const now = this.latestPlacement(), before = this.previousPlacement();
      if (!now || !before) return null;
      const rows = [];
      Object.keys(now.sectionScores || {}).forEach(sid => {
        const a = before.sectionScores ? before.sectionScores[sid] : null;
        const b = now.sectionScores[sid];
        if (a == null || b == null) return;
        rows.push({ sectionId: sid, before: a, after: b, delta: b - a });
      });
      rows.sort((x, y) => y.delta - x.delta);
      return {
        levelBefore: before.levelName,
        levelAfter: now.levelName,
        levelMoved: (now.levelId || 0) - (before.levelId || 0),
        scoreBefore: before.weightedScore,
        scoreAfter: now.weightedScore,
        improved: rows.filter(r => r.delta > 0.05).slice(0, 6),
        regressed: rows.filter(r => r.delta < -0.05).slice(0, 6),
        rows
      };
    },

    /* ================= per-problem progress ================= */

    recordProblem(problemId, lang, code, result) {
      const prev = this.state.problemState[problemId] || { bestScore: 0, status: 'new' };
      const best = Math.max(prev.bestScore || 0, result.score);
      const status = best >= 0.999 ? 'solved' : best >= 0.7 ? 'close' : 'attempted';
      if (prev.status === 'new') this.state.stats.problemsAttempted++;
      if (status === 'solved' && prev.status !== 'solved') this.state.stats.problemsSolved++;
      this.state.problemState[problemId] = {
        status, bestScore: best, lang, code, ts: Date.now()
      };
      this.save();
      return this.state.problemState[problemId];
    },

    problemStatus(id) {
      const s = this.state.problemState[id];
      return s ? s.status : 'new';
    },

    sectionProgress(sectionId) {
      const b = window.DB.bySection[sectionId] || { problems: [], lessons: [] };
      const solved = b.problems.filter(p => this.problemStatus(p.id) === 'solved').length;
      const read = b.lessons.filter(l => this.state.lessonsRead[l.id]).length;
      const mastery = this.state.sectionMastery[sectionId];
      return {
        solved, problems: b.problems.length,
        read, lessons: b.lessons.length,
        passed: !!(mastery && mastery.passed),
        bestPct: mastery ? mastery.bestPct : 0,
        attempts: mastery ? mastery.attempts : 0,
        pct: b.problems.length ? solved / b.problems.length : 0
      };
    },

    markLessonRead(id) {
      this.state.lessonsRead[id] = Date.now();
      this.save();
    },

    /* ================= flashcards (Leitner) ================= */

    cardState(id) {
      return this.state.cards[id] || { box: 0, due: 0, seen: 0 };
    },

    gradeCard(id, got) {
      const c = this.cardState(id);
      c.seen++;
      c.box = got ? Math.min(5, c.box + 1) : 0;
      const days = [0, 1, 2, 4, 8, 16][c.box];
      c.due = Date.now() + days * 86400000;
      this.state.cards[id] = c;
      this.save();
      return c;
    },

    dueCards(pool) {
      const now = Date.now();
      const due = pool.filter(c => this.cardState(c.id).due <= now);
      return due.length ? due : pool;
    }
  };

  window.Engine = Engine;
})();
