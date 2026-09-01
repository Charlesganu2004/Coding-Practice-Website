/* checker.js — grades submitted code by structure, not by string equality.
 *
 * WHAT THIS IS: a static approach-checker. It verifies that your solution
 * contains the mechanisms the problem actually requires (a hash map, one pass,
 * a monotonic stack, the recurrence, ...) and that it avoids the wrong
 * complexity class. It accepts any spelling of a correct approach.
 *
 * WHAT THIS IS NOT: a compiler or a test runner. It cannot execute C++ or
 * Python in the browser, so it cannot catch an off-by-one inside an otherwise
 * correct-looking loop. Treat a pass as "the approach is right", then read the
 * reference solution to check the details. The UI says this plainly.
 */

(function () {
  'use strict';

  const Checker = {

    /* Strip comments so the checks cannot be satisfied by pasting the answer
       into a comment. Strings are deliberately kept — some problems legitimately
       require a specific literal. */
    strip(code, lang) {
      let out = code;
      if (lang === 'python') {
        out = out.replace(/^\s*#.*$/gm, '');
        out = out.replace(/(^|\n)\s*("""|''')[\s\S]*?\2/g, '$1');
      } else {
        out = out.replace(/\/\*[\s\S]*?\*\//g, '');
        out = out.replace(/\/\/.*$/gm, '');
      }
      return out;
    },

    /* Did they actually write anything, or just submit the starter?
     *
     * Comments must be stripped line by line BEFORE whitespace is collapsed.
     * Collapsing first turns the whole submission into one line, and then a
     * single `#` or `//` swallows everything after it — so a solution that
     * opens with a comment was being read as empty and scored zero. */
    isSubstantive(code, starter, lang) {
      const norm = s => this.strip(s || '', lang).replace(/\s+/g, ' ').trim();
      const c = norm(code);
      if (c.length < 12) return false;
      if (starter && norm(starter) === c) return false;
      /* A body that is only a placeholder does not count. */
      if (/^(pass|\{\s*\}|;)$/.test(c)) return false;
      return true;
    },

    compile(re) {
      try { return new RegExp(re, 'im'); }
      catch (e) { return null; }
    },

    /* Grade one submission.
       Returns { verdict, score, passed[], failed[], tripped[], notes[] } */
    check(problem, lang, code) {
      const notes = [];
      const starter = (problem.starter && problem.starter[lang]) || '';

      if (!this.isSubstantive(code, starter, lang)) {
        return {
          verdict: 'empty', score: 0, passed: [], failed: [], tripped: [],
          notes: ['Write a solution first — the editor still holds the starter code.']
        };
      }

      const src = this.strip(code, lang);
      const checks = (problem.checks && problem.checks[lang]) || [];
      const antis = (problem.antiChecks && problem.antiChecks[lang]) || [];

      const passed = [], failed = [];
      checks.forEach(c => {
        const re = this.compile(c.re);
        if (!re) { notes.push('A check for this problem could not be read; it was skipped.'); return; }
        (re.test(src) ? passed : failed).push(c);
      });

      const tripped = [];
      antis.forEach(a => {
        const re = this.compile(a.re);
        if (re && re.test(src)) tripped.push(a);
      });

      const denom = passed.length + failed.length;
      let score = denom === 0 ? 1 : passed.length / denom;

      /* An anti-pattern is a real penalty but never a zero: a working brute
         force is worth more than nothing, and the hint explains the upgrade. */
      if (tripped.length) score = Math.max(0, score - 0.34 * tripped.length);

      let verdict;
      if (score >= 0.999 && !tripped.length) verdict = 'pass';
      else if (score >= 0.7) verdict = 'close';
      else if (score > 0) verdict = 'partial';
      else verdict = 'fail';

      return { verdict, score, passed, failed, tripped, notes };
    },

    /* Combined grade for exam use: approach + the Big-O question. */
    gradeForExam(problem, lang, code, complexityAnswer) {
      const r = this.check(problem, lang, code);
      const cxOk = complexityAnswer != null && complexityAnswer === problem.timeAnswer;
      /* 75% approach, 25% complexity — knowing the cost is part of the answer. */
      const score = 0.75 * r.score + 0.25 * (cxOk ? 1 : 0);
      return Object.assign({}, r, { complexityCorrect: cxOk, score });
    },

    /* Human-readable summary line. */
    summarise(result) {
      switch (result.verdict) {
        case 'pass':    return 'All approach checks passed.';
        case 'close':   return 'Nearly there — most of the approach is present.';
        case 'partial': return 'Part of the approach is there, but key pieces are missing.';
        case 'empty':   return 'Nothing to grade yet.';
        default:        return 'This does not match the approach the problem is after.';
      }
    }
  };

  window.Checker = Checker;
})();
