# Content Schema — Coding Practice Website

Every data file is a **classic browser script** (no ESM, no imports, no build step).
It must run when opened from `file://` AND from GitHub Pages.

## File template (MANDATORY — copy exactly)

```js
/* <file description> */
(function () {
  const P = [ /* coding problems */ ];
  const Q = [ /* multiple-choice questions */ ];
  window.DB.problems.push(...P);
  window.DB.questions.push(...Q);
})();
```

`window.DB` already exists before your file loads. Never redeclare it.
Never use `export`, `import`, `require`, or top-level `const` outside the IIFE.

---

## Section IDs (use EXACTLY these strings — no others)

DSA / NeetCode:
`arrays-hashing`, `two-pointers`, `sliding-window`, `stack`, `binary-search`,
`linked-list`, `trees`, `tries`, `heap-pq`, `backtracking`, `graphs`,
`advanced-graphs`, `dp-1d`, `dp-2d`, `greedy`, `intervals`, `math-geometry`,
`bit-manipulation`

C++: `cpp-core`, `cpp-memory`, `cpp-modern`, `cpp-oop`
Python: `py-core`, `py-data-model`, `py-stdlib-perf`
Design: `lld-principles`, `lld-problems`
ML: `ml-foundations`, `ml-modeling`, `ml-deep-learning`, `ml-systems`

## Tiers (use EXACTLY these strings)
`beginner` | `intermediate` | `advanced` | `master`

Tier drives the placement exam's level estimate, so be honest:
- `beginner` — someone who just learned the syntax can do it
- `intermediate` — standard interview warm-up; one clear pattern
- `advanced` — needs a non-obvious insight or careful edge cases
- `master` — hard optimisation, tricky proof, or deep systems knowledge

---

## Coding problem record

```js
{
  id: 'nc-two-sum',            // globally unique, kebab-case, stable
  title: 'Two Sum',
  section: 'arrays-hashing',
  tier: 'beginner',
  difficulty: 'Easy',          // 'Easy' | 'Medium' | 'Hard'
  prompt: 'Given an integer array nums and an integer target, return the indices of the two numbers that add up to target. Exactly one valid answer exists.',
  examples: [
    { in: 'nums = [2,7,11,15], target = 9', out: '[0,1]' },
    { in: 'nums = [3,3], target = 6',       out: '[0,1]' }
  ],
  approach: 'Walk the array once. For each value v at index i, check whether target - v is already in a hash map of value -> index. If it is, you have the pair. Otherwise record v -> i and continue.',
  keyInsight: 'A hash map turns the "have I seen the complement?" question into O(1).',
  pitfalls: [
    'Using the same element twice — check the map BEFORE inserting the current value.',
    'Returning values instead of indices.'
  ],
  complexity: { time: 'O(n)', space: 'O(n)' },
  timeChoices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(1)'],
  timeAnswer: 2,               // index into timeChoices
  starter: {
    cpp: 'vector<int> twoSum(vector<int>& nums, int target) {\n    // your code here\n}',
    python: 'def two_sum(nums, target):\n    # your code here\n    pass'
  },
  solution: {
    cpp: 'vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int,int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n        int need = target - nums[i];\n        if (seen.count(need)) return {seen[need], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}',
    python: 'def two_sum(nums, target):\n    seen = {}\n    for i, v in enumerate(nums):\n        if target - v in seen:\n            return [seen[target - v], i]\n        seen[v] = i\n    return []'
  },
  checks: {
    cpp: [
      { re: 'unordered_map|map\\s*<', hint: 'Store what you have already seen in a hash map.' },
      { re: 'for\\s*\\(|while\\s*\\(',  hint: 'Scan the array.' },
      { re: 'return',                   hint: 'Return the pair of indices.' }
    ],
    python: [
      { re: '\\{\\s*\\}|dict\\(',       hint: 'Store what you have already seen in a dict.' },
      { re: 'for\\s+\\w+',              hint: 'Scan the array.' },
      { re: 'return',                   hint: 'Return the pair of indices.' }
    ]
  },
  antiChecks: {
    cpp: [{ re: 'for[\\s\\S]{0,120}for\\s*\\(', hint: 'Nested loops are the O(n^2) brute force — one pass with a map is enough.' }],
    python: [{ re: 'for[\\s\\S]{0,120}\\n\\s+for\\s', hint: 'Nested loops are the O(n^2) brute force — one pass with a dict is enough.' }]
  },
  mcq: [
    { q: 'Why is the complement checked before inserting the current value?',
      opts: ['To save memory', 'To avoid using the same element twice', 'To keep the map sorted', 'It makes no difference'],
      correct: 1,
      why: 'Inserting first would let nums[i] match itself when target == 2*nums[i].' }
  ]
}
```

### Rules for `checks` / `antiChecks`
- `re` is a **string**, compiled at runtime with `new RegExp(re, 'im')`.
- Because it is a JS string literal, every regex backslash is **doubled**: write `'\\s'`, `'\\d'`, `'\\('`.
- Checks must accept **every reasonable correct approach**, not one exact solution.
  Use alternation (`'sort\\(|sorted\\('`) rather than demanding one spelling.
- 2–4 checks per language. Never require a specific variable name.
- `antiChecks` are optional; use them only when a pattern genuinely signals the
  wrong complexity class. Never flag something a correct solution might contain.
- Do not anchor with `^` or `$` (user code is multi-line).

### Rules for solutions
- `solution.cpp` compiles as-is inside a translation unit that already has
  `#include <bits/stdc++.h>` and `using namespace std;`.
- `solution.python` is valid Python 3, no imports beyond the standard library
  (put any needed `import` inside the snippet).
- Both solutions must be genuinely correct and match the stated complexity.
- Use `\n` escapes for newlines. Never use raw newlines inside a JS string.
- Never use backticks/template literals in data (they break older parsers in odd ways) — use single quotes and escape.

---

## Multiple-choice question record

```js
{
  id: 'q-ah-001',              // unique, kebab-case
  section: 'arrays-hashing',
  tier: 'intermediate',
  q: 'What is the average-case lookup cost of std::unordered_map?',
  opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
  correct: 0,
  why: 'Hashing buckets give amortised constant lookup; std::map is the O(log n) tree.',
  topic: 'hash maps'
}
```

- Exactly 4 options. `correct` is a 0-based index.
- `why` is required — it is shown in the review screen and is how the learner
  actually learns from a miss. One or two sentences, concrete.
- Distractors must be plausible and represent real misconceptions.
  Never use filler options like 'None of the above' or joke answers.
- Spread `correct` evenly across 0..3 — do not make index 1 the answer every time.
- Questions must be self-contained (no 'as shown above').
- Code inside `q` uses `\n` for newlines.

---

## Lesson record (only for lesson files)

```js
window.DB.lessons.push({
  id: 'cpp-pointers',
  track: 'cpp',                // 'cpp' | 'python' | 'dsa' | 'lld' | 'ml'
  section: 'cpp-core',
  tier: 'beginner',
  order: 3,
  title: 'Pointers & References',
  summary: 'Addresses, dereferencing, and why a reference is not a pointer.',
  minutes: 12,
  body: '<p>...</p><h3>...</h3><pre class="code">...</pre>'
});
```

- `body` is an HTML **string**, single-quoted, with `\n` escapes.
- Allowed tags: `p, h3, h4, ul, ol, li, strong, em, code, pre, table, thead, tbody, tr, th, td, blockquote`.
- Code blocks: `<pre class="code">…</pre>`; escape `<` as `&lt;` and `>` as `&gt;`
  inside them (critical for C++ templates: write `vector&lt;int&gt;`).
- Aim for 400–900 words per lesson with at least two worked code blocks.
- Teach the *why*, show the common mistake, then show the correct version.

---

## Quality bar (this is the whole point of the site)

- Content must be correct. A wrong "correct answer" is worse than no question.
- Explanations teach, they do not just assert. Every `why` should leave the
  reader able to answer a *variant* of the question.
- Cover both C++ and Python everywhere a language is involved.
- No placeholder text, no 'TODO', no truncated lists, no duplicated ids.
