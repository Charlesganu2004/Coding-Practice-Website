/* coach.js — the AI assist that helps while you are stuck.
 *
 * Two engines, and the UI is explicit about which one answered:
 *
 *  1. LOCAL COACH (always on, offline, no key, no network).
 *     A real static analyser: language-aware bug patterns, a diff of your code
 *     against the mechanisms the problem requires, complexity smells, and
 *     progressive hints that escalate only as far as you ask.
 *
 *  2. CLAUDE (optional). If you paste your own Anthropic API key it is stored
 *     in this browser's localStorage only and sent directly to api.anthropic.com.
 *     Claude is prompted to coach, not to hand over the answer.
 *
 * The local coach is what makes this useful on a plane. Claude is the upgrade.
 */

(function () {
  'use strict';

  const KEY_STORE = 'cpw:anthropic-key';
  const MODEL = 'claude-opus-5';
  const API_URL = 'https://api.anthropic.com/v1/messages';

  /* ================= shared helpers ================= */

  function stripComments(code, lang) {
    if (lang === 'python') {
      return code.replace(/(^|\n)\s*#.*/g, '$1')
                 .replace(/("""|''')[\s\S]*?\1/g, '');
    }
    return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  }

  function lineOf(code, index) {
    return code.slice(0, index).split('\n').length;
  }

  /* Find the first match of `re` and report its line number. */
  function findLine(code, re) {
    const m = re.exec(code);
    return m ? { line: lineOf(code, m.index), text: m[0].trim().slice(0, 70) } : null;
  }

  /* ================= language-aware bug patterns ================= */

  /* Each rule: { id, re, title, detail, severity }
     severity: 'error' (almost certainly wrong) | 'warn' (suspicious) */

  const CPP_RULES = [
    { id: 'assign-in-if', severity: 'error',
      re: /\bif\s*\(\s*[A-Za-z_]\w*\s*=\s*[^=]/,
      title: 'Assignment inside an if condition',
      detail: 'You wrote `if (x = y)`, which assigns and then tests the result. Use `==` to compare.' },

    { id: 'le-size', severity: 'error',
      re: /for\s*\([^;]*;[^;]*<=\s*\w+\s*\.\s*size\s*\(\s*\)\s*;/,
      title: 'Off-by-one: `<= size()` walks one past the end',
      detail: 'Valid indices are 0 .. size()-1. Using `<=` reads one element past the end, which is undefined behaviour. Use `<`.' },

    { id: 'size-minus-one', severity: 'warn',
      re: /\w+\s*\.\s*size\s*\(\s*\)\s*-\s*1/,
      title: '`size() - 1` underflows on an empty container',
      detail: 'size() returns an unsigned type, so 0 - 1 wraps to a huge number instead of -1. Guard the empty case, or cast to int.' },

    { id: 'no-return', severity: 'error',
      re: null,
      custom: (code) => {
        const sig = /\b(int|long|double|float|bool|char|string|vector\s*<|unordered_map\s*<|pair\s*<|auto)\s+\w+\s*\([^)]*\)\s*\{/.test(code);
        return sig && !/\breturn\b/.test(code);
      },
      title: 'A non-void function with no `return`',
      detail: 'You declared a function that returns a value but never return one. Falling off the end is undefined behaviour.' },

    { id: 'erase-in-range-for', severity: 'error',
      re: /for\s*\(\s*(auto|const auto)[^)]*:\s*(\w+)\s*\)[\s\S]{0,160}?\2\s*\.\s*(erase|push_back|insert|clear)\s*\(/,
      title: 'Modifying a container while range-for iterates it',
      detail: 'Inserting or erasing during a range-for invalidates the iterators and can crash or skip elements. Collect what to change, then apply it after the loop.' },

    { id: 'int-overflow', severity: 'warn',
      re: /\bint\s+\w+\s*=\s*\w+\s*\*\s*\w+/,
      title: 'Possible integer overflow',
      detail: 'Multiplying two ints stores the result as int before any wider assignment. If the product can exceed ~2.1e9, use `long long`.' },

    { id: 'cstr-compare', severity: 'warn',
      re: /\bchar\s*\*\s*\w+[\s\S]{0,120}?==\s*"/,
      title: 'Comparing a `char*` with `==`',
      detail: 'That compares pointers, not text. Use std::string, or strcmp for raw pointers.' }
  ];

  const PY_RULES = [
    { id: 'mutable-default', severity: 'error',
      re: /def\s+\w+\s*\([^)]*=\s*(\[\s*\]|\{\s*\}|set\s*\(\s*\))/,
      title: 'Mutable default argument',
      detail: 'The default is created once at definition time and then shared by every call, so it accumulates across calls. Use `None` and build the container inside the function.' },

    { id: 'is-literal', severity: 'error',
      re: /\bis\s+(?!None\b|True\b|False\b|not\b)(["'\d]|\[)/,
      title: '`is` used to compare values',
      detail: '`is` tests object identity, not equality. It happens to work for small ints and short strings and then fails silently elsewhere. Use `==`.' },

    { id: 'mutate-while-iter', severity: 'error',
      re: /for\s+(\w+)\s+in\s+(\w+)\s*:[\s\S]{0,160}?\2\s*\.\s*(remove|pop|append|insert)\s*\(/,
      title: 'Mutating a list while iterating it',
      detail: 'Removing during iteration makes the loop skip elements. Iterate over a copy (`for x in lst[:]`) or build a new list.' },

    { id: 'pop-zero', severity: 'warn',
      re: /\.\s*pop\s*\(\s*0\s*\)/,
      title: '`pop(0)` is O(n) each call',
      detail: 'Popping the front of a list shifts every remaining element. In a loop that is O(n^2). Use `collections.deque` and `popleft()`.' },

    { id: 'insert-zero', severity: 'warn',
      re: /\.\s*insert\s*\(\s*0\s*,/,
      title: '`insert(0, x)` is O(n) each call',
      detail: 'Prepending to a list shifts everything. Append and reverse at the end, or use a deque.' },

    { id: 'shadow-builtin', severity: 'warn',
      re: /\b(list|dict|set|sum|max|min|str|input|id|type|len)\s*=\s*[^=]/,
      title: 'Shadowing a built-in name',
      detail: 'Rebinding a built-in (like `list` or `sum`) breaks any later use of it in the same scope.' },

    { id: 'no-return-py', severity: 'warn',
      re: null,
      custom: (code) => /^\s*def\s/m.test(code) && !/\breturn\b/.test(code) && !/\byield\b/.test(code) && !/\bprint\s*\(/.test(code),
      title: 'The function never returns anything',
      detail: 'It will return None. If the problem asks for a value, add a `return`.' }
  ];

  /* ================= structural analysis ================= */

  function bracketBalance(code, lang) {
    if (lang === 'python') return null;
    const pairs = { '(': ')', '[': ']', '{': '}' };
    const stack = [];
    let inStr = null;
    for (let i = 0; i < code.length; i++) {
      const c = code[i], prev = code[i - 1];
      if (inStr) { if (c === inStr && prev !== '\\') inStr = null; continue; }
      if (c === '"' || c === "'") { inStr = c; continue; }
      if (pairs[c]) stack.push({ c, i });
      else if (c === ')' || c === ']' || c === '}') {
        const top = stack.pop();
        if (!top || pairs[top.c] !== c) {
          return { kind: 'mismatch', line: lineOf(code, i), got: c };
        }
      }
    }
    if (stack.length) return { kind: 'unclosed', line: lineOf(code, stack[stack.length - 1].i), got: stack[stack.length - 1].c };
    return null;
  }

  function loopDepth(code, lang) {
    /* Rough nesting depth of loops — enough to flag an O(n^2) shape. */
    const lines = code.split('\n');
    let max = 0;
    if (lang === 'python') {
      const stack = [];
      lines.forEach(l => {
        if (!l.trim()) return;
        const indent = l.length - l.replace(/^\s*/, '').length;
        while (stack.length && indent <= stack[stack.length - 1]) stack.pop();
        if (/^\s*(for|while)\b/.test(l)) { stack.push(indent); max = Math.max(max, stack.length); }
      });
    } else {
      let depth = 0;
      for (let i = 0; i < code.length; i++) {
        if (code[i] === '{') depth++;
        else if (code[i] === '}') depth--;
        const rest = code.slice(i, i + 6);
        if (/^(for|while)\b/.test(rest)) {
          let d = 1;
          const before = code.slice(0, i);
          d = (before.match(/\bfor\b|\bwhile\b/g) || []).length;
        }
      }
      /* simpler: count loop keywords that appear inside another loop's braces */
      const re = /\b(for|while)\s*\(/g;
      const positions = [];
      let m;
      while ((m = re.exec(code))) positions.push(m.index);
      positions.forEach(p => {
        const body = code.slice(p);
        const open = body.indexOf('{');
        if (open === -1) return;
        let d = 0, end = -1;
        for (let i = open; i < body.length; i++) {
          if (body[i] === '{') d++;
          else if (body[i] === '}') { d--; if (d === 0) { end = i; break; } }
        }
        if (end === -1) return;
        const inner = body.slice(open, end);
        const nested = (inner.match(/\b(for|while)\s*\(/g) || []).length;
        max = Math.max(max, 1 + nested);
      });
      if (!max && positions.length) max = 1;
    }
    return max;
  }

  function hasRecursionWithoutBase(code, lang) {
    const nameMatch = lang === 'python'
      ? /def\s+(\w+)\s*\(/.exec(code)
      : /\b(?:int|long|double|bool|void|string|auto)\s+(\w+)\s*\(/.exec(code);
    if (!nameMatch) return false;
    const name = nameMatch[1];
    const calls = new RegExp('\\b' + name + '\\s*\\(', 'g');
    const count = (code.match(calls) || []).length;
    if (count < 2) return false;                      /* definition + >=1 call */
    const guard = lang === 'python' ? /\bif\b[\s\S]*?\breturn\b/ : /\bif\s*\([\s\S]*?\breturn\b/;
    return !guard.test(code);
  }

  /* ================= the local coach ================= */

  const Coach = {

    /* ---- progressive hints ---- */

    hintLevels(problem) {
      const out = [];
      if (problem.keyInsight) {
        out.push({ level: 1, label: 'Nudge', text: problem.keyInsight });
      }
      const mechanisms = [];
      ['cpp', 'python'].forEach(l => {
        ((problem.checks && problem.checks[l]) || []).forEach(c => {
          if (c.hint && mechanisms.indexOf(c.hint) === -1) mechanisms.push(c.hint);
        });
      });
      if (mechanisms.length) {
        out.push({
          level: 2, label: 'What it needs',
          text: 'Your solution should end up doing these things:\n' +
                mechanisms.map(m => '  • ' + m).join('\n')
        });
      }
      if (problem.pitfalls && problem.pitfalls.length) {
        out.push({
          level: 3, label: 'Traps to avoid',
          text: problem.pitfalls.map(p => '  • ' + p).join('\n')
        });
      }
      if (problem.approach) {
        out.push({ level: 4, label: 'Full approach', text: problem.approach });
      }
      return out;
    },

    /* ---- static analysis of the learner's code ---- */

    analyze(problem, lang, rawCode) {
      const findings = [];
      const code = rawCode || '';
      const src = stripComments(code, lang);
      const starter = (problem.starter && problem.starter[lang]) || '';

      const norm = s => s.replace(/\s+/g, ' ').trim();
      if (!norm(src) || norm(src) === norm(starter)) {
        return {
          state: 'empty',
          findings: [{
            severity: 'info',
            title: 'Nothing written yet',
            detail: 'Write an attempt first — even a wrong one. The coach reads your code, so it needs code to read.'
          }]
        };
      }

      /* 1. syntax-level */
      const bal = bracketBalance(src, lang);
      if (bal) {
        findings.push({
          severity: 'error',
          line: bal.line,
          title: bal.kind === 'unclosed'
            ? 'Unclosed ' + bal.got
            : 'Mismatched ' + bal.got,
          detail: bal.kind === 'unclosed'
            ? 'A `' + bal.got + '` opened around line ' + bal.line + ' is never closed. This will not compile.'
            : 'The closing `' + bal.got + '` near line ' + bal.line + ' does not match what was opened.'
        });
      }

      /* 2. language bug patterns */
      const rules = lang === 'python' ? PY_RULES : CPP_RULES;
      rules.forEach(rule => {
        let hit = null;
        if (rule.custom) { if (rule.custom(src)) hit = { line: null }; }
        else if (rule.re) { hit = findLine(src, rule.re); }
        if (hit) {
          findings.push({
            severity: rule.severity, line: hit.line,
            title: rule.title, detail: rule.detail, snippet: hit.text
          });
        }
      });

      /* 3. recursion without a base case */
      if (hasRecursionWithoutBase(src, lang)) {
        findings.push({
          severity: 'error',
          title: 'Recursion with no visible base case',
          detail: 'The function calls itself but there is no guard that returns without recursing. That is an infinite recursion — add the stopping condition first.'
        });
      }

      /* 4. missing required mechanisms — the pedagogically useful one */
      const checks = (problem.checks && problem.checks[lang]) || [];
      const missing = [];
      checks.forEach(c => {
        let re;
        try { re = new RegExp(c.re, 'im'); } catch (e) { return; }
        if (!re.test(src)) missing.push(c.hint);
      });
      if (missing.length) {
        findings.push({
          severity: 'warn',
          title: missing.length === checks.length
            ? 'This does not look like the intended approach yet'
            : 'Missing ' + missing.length + ' of ' + checks.length + ' pieces',
          detail: 'Still to do:\n' + missing.map(m => '  • ' + m).join('\n')
        });
      }

      /* 5. complexity smell against the problem's own target */
      const depth = loopDepth(src, lang);
      const target = (problem.complexity && problem.complexity.time) || '';
      const targetLinear = /O\(n\)|O\(n \+ m\)|O\(log n\)|O\(1\)/.test(target.replace(/\s/g, ' '));
      if (depth >= 2 && targetLinear) {
        findings.push({
          severity: 'warn',
          title: 'Nested loops, but the target is ' + target,
          detail: 'Your code nests loops ' + depth + ' deep, which is at least O(n^2). The intended solution is ' + target +
                  '. Usually that means replacing the inner search with a hash lookup, a pointer that only moves forward, or precomputed state.'
        });
      }

      /* 6. did they actually solve it? */
      const passed = checks.length - missing.length;
      const state = findings.some(f => f.severity === 'error') ? 'broken'
        : missing.length === 0 ? 'looks-good'
        : passed > 0 ? 'partial' : 'off-track';

      if (state === 'looks-good') {
        findings.unshift({
          severity: 'ok',
          title: 'The approach looks right',
          detail: 'Every mechanism this problem needs is present, and no bug patterns fired. ' +
                  'Static analysis cannot execute your code, so trace it once on the examples — ' +
                  'then compare against the reference solution.'
        });
      }

      return { state, findings, depth, missing, passed, total: checks.length };
    },

    /* ---- next best action, in one sentence ---- */

    nextStep(analysis, problem) {
      if (!analysis) return '';
      switch (analysis.state) {
        case 'empty':      return 'Start with the shape: write the signature and the loop, then fill in the body.';
        case 'broken':     return 'Fix the error above first — everything else is guesswork until it compiles.';
        case 'off-track':  return 'Re-read the key insight. The structure you need is different from what you have written.';
        case 'partial':    return 'You have part of it. Work through the missing pieces one at a time.';
        case 'looks-good': return 'Trace it on the examples, answer the complexity question, then read the reference solution.';
        default:           return '';
      }
    },

    /* ================= Claude ================= */

    hasKey() { try { return !!localStorage.getItem(KEY_STORE); } catch (e) { return false; } },
    getKey()  { try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; } },
    setKey(k) { try { k ? localStorage.setItem(KEY_STORE, k) : localStorage.removeItem(KEY_STORE); } catch (e) {} },

    systemPrompt(mode) {
      const base =
        'You are a coding-interview coach embedded in a practice site. The learner is ' +
        'working a problem in C++ or Python. Be concrete, warm, and brief.';
      if (mode === 'review') {
        return base + '\n\nThe learner asked you to REVIEW their code. Point out actual bugs ' +
          'with the line and the fix, note complexity problems, and say what is already right. ' +
          'You may show corrected lines, but do not paste a full working solution unless they ' +
          'explicitly ask for one.';
      }
      if (mode === 'explain') {
        return base + '\n\nExplain the concept the learner asked about, grounded in this specific ' +
          'problem. Use a small example. Show both the C++ and the Python way when it differs.';
      }
      return base + '\n\nThe learner is STUCK and wants a hint. Give the smallest hint that ' +
        'unblocks them — one step, not the answer. Ask a leading question about their own code ' +
        'where that works better. Never write the full solution in hint mode.';
    },

    userPrompt(problem, lang, code, mode, question) {
      const parts = [];
      parts.push('PROBLEM: ' + problem.title + ' (' + problem.difficulty + ')');
      parts.push(problem.prompt);
      if (problem.complexity) {
        parts.push('Target complexity: time ' + problem.complexity.time + ', space ' + problem.complexity.space);
      }
      parts.push('\nLANGUAGE: ' + (lang === 'cpp' ? 'C++' : 'Python'));
      parts.push('\nMY CURRENT CODE:\n```\n' + (code || '(empty)') + '\n```');

      const local = this.analyze(problem, lang, code);
      if (local.findings && local.findings.length) {
        parts.push('\nThe site\'s local analyser flagged: ' +
          local.findings.map(f => f.title).join('; ') +
          '. Use these only if they are actually right — verify against the code yourself.');
      }
      if (question) parts.push('\nMY QUESTION: ' + question);
      else if (mode === 'review') parts.push('\nPlease review my code.');
      else parts.push('\nI am stuck. Give me one hint.');
      return parts.join('\n');
    },

    /* Streams a reply. onDelta(textChunk) is called as tokens arrive.
       Resolves with the full text, rejects with a readable Error. */
    async ask(problem, lang, code, mode, question, onDelta) {
      const key = this.getKey();
      if (!key) throw new Error('No API key saved. Add one in Settings to use Claude, or use the built-in coach.');

      let res;
      try {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            /* Required for calls made directly from a browser page. */
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 2000,
            stream: true,
            system: this.systemPrompt(mode),
            messages: [{ role: 'user', content: this.userPrompt(problem, lang, code, mode, question) }]
          })
        });
      } catch (e) {
        throw new Error('Could not reach the Anthropic API. Check your connection — the rest of the site works offline.');
      }

      if (!res.ok) {
        let detail = '';
        try { const j = await res.json(); detail = (j.error && j.error.message) || ''; } catch (e) {}
        if (res.status === 401) throw new Error('That API key was rejected. Check it in Settings.');
        if (res.status === 429) throw new Error('Rate limited by the API. Wait a moment and try again.');
        throw new Error('API error ' + res.status + (detail ? ': ' + detail : ''));
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '', full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          let evt;
          try { evt = JSON.parse(payload); } catch (e) { continue; }
          if (evt.type === 'content_block_delta' && evt.delta && evt.delta.type === 'text_delta') {
            full += evt.delta.text;
            if (onDelta) onDelta(evt.delta.text);
          } else if (evt.type === 'error') {
            throw new Error((evt.error && evt.error.message) || 'Stream error');
          }
        }
      }
      return full;
    }
  };

  window.Coach = Coach;
})();
