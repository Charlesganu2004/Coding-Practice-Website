# Coding Practice — C++ & Python

An adaptive practice site that measures where you actually stand, then orders
your work by what is costing you most. Runs entirely in the browser: no server,
no build step, no account, no network.

**Live site:** https://charlesganu2004.github.io/Coding-Practice-Website/
**Run locally:** open `index.html`, or `python -m http.server` and visit `localhost:8000`.

---

## How it works

### 1. The placement exam comes first

Before anything else you take a general diagnostic. It samples every area —
the 18 DSA patterns, C++, Python, low-level design, machine learning — across
four difficulty tiers, in three lengths (25, 45 or 70 questions), of which
about 28% are coding problems.

The result places you on a five-point scale:

> Beginner → Novice → Intermediate → Advanced → Master

Two details make the estimate honest:

- **Harder questions count for more.** A master-tier item carries four times
  the weight of a beginner one, so the weighted score can differ from the raw
  percentage — that difference is the point.
- **Your weakest area caps your level.** Four strong domains and one weak one
  does not read as Master. One strong subject cannot carry the rest.

### 2. The plan follows from the result

The dashboard ranks every section by how much it is costing you and tells you
what to do with each: read the lessons, drill the problems, or go straight to
the section exam.

### 3. Section exams gate progress

Each section has its own exam, assembled at runtime from that section's bank —
roughly 35% coding, tier-ramped, **80% to pass**. Retakes deliberately prefer
questions you have not seen, so a second attempt is a genuinely new paper.

### 4. Re-take the diagnostic to re-measure

Clearing a section prompts you to re-take the general exam. It draws a fresh
sample and reports the **delta**: which level you moved to, which sections
improved, and which slipped and need review.

---

## The AI coach

Every problem has a coach that reads the code you actually wrote. It has two
engines, and the interface always says which one answered.

**Built-in coach — offline, no key, no network.** A real static analyser:

- Language-aware bug patterns — `<= size()` off-by-one, unsigned underflow,
  assignment inside `if`, iterator invalidation, mutable default arguments,
  `is` used for value comparison, mutation during iteration, `pop(0)` in a
  loop, recursion with no base case, unbalanced brackets.
- A diff of your code against the mechanisms the problem requires, so it can
  say *"you still need the hash map"* rather than just "wrong".
- Complexity smells — nested loops when the target is O(n).
- Progressive hints that escalate only as far as you ask, ending at the full
  approach.

**Claude — optional.** Add an Anthropic API key in Settings to ask questions in
your own words, request a code review, or get a hint tailored to your attempt.
The key is stored in your browser's localStorage and sent only to
`api.anthropic.com`. It is never committed, uploaded, or sent anywhere else.

### What the grader can and cannot do

There is no server, so the site **cannot compile C++ or execute Python**.
Coding answers are graded on **approach**: whether your solution contains the
mechanisms the problem requires and avoids the wrong complexity class,
accepting any valid style. A pass means the approach is right, not that the
code is bug-free — so trace it on the examples and compare with the reference
solution, which is always given in both languages.

---

## Contents

| | |
|---|---|
| Coding problems | 137, each with C++ and Python reference solutions |
| Questions | 280, every one with an explanation |
| Lessons | 25 |
| Flashcards | 147, Leitner-scheduled |
| Sections | 32 across 5 tracks |

**Tracks:** DSA (the 18 NeetCode patterns) · C++ (core, memory/RAII, OOP,
modern, real-world codebases) · Python (core, data model, stdlib & performance)
· Low-Level Design · Machine Learning.

Every language topic is taught in both C++ and Python — the C++ drills show the
idiomatic Python equivalent and vice versa, because knowing which language
makes a thing easy is half of knowing the thing.

The **Real-World C++** section draws on production codebases —
[llama.cpp](https://github.com/ggml-org/llama.cpp),
[whisper.cpp](https://github.com/ggml-org/whisper.cpp),
[nlohmann/json](https://github.com/nlohmann/json),
[msgpack-c](https://github.com/msgpack/msgpack-c),
[cppcheck](https://github.com/danmar/cppcheck) and
[Infer](https://github.com/facebook/infer) — covering quantisation, memory
mapping, cache-line effects, binary wire formats, and the undefined behaviour
static analysers exist to catch.

---

## Accessibility

The type scale is built on rem units at a **19px base**, with an A−/A/A+
control in the header that scales the entire interface from 0.9× to 1.4×.
Nothing that carries meaning renders below 16px, controls are at least 50px
tall, focus rings are visible, the roadmap is keyboard-navigable, and
`prefers-reduced-motion` is honoured.

---

## Your data

Progress lives in this browser's `localStorage` and nowhere else. Nothing is
uploaded. Export it from Settings to move devices or keep a backup; Reset
clears everything.

---

## Development

```bash
node tools/validate.js   # content integrity
node tools/selftest.js   # engine and grader logic
```

`validate.js` enforces the schema and, most importantly, asserts that **every
problem's own reference solution passes its own checks** and trips none of its
anti-checks. A check that rejects the model answer would fail a correct
learner, so that is treated as a hard error. It also verifies that every
section has enough items to build an exam and that every domain has items at
all four tiers.

`selftest.js` exercises the level model, exam assembly, gating, retake deltas,
persistence and the grader against synthetic content, so the logic is verified
independently of the question banks.

Content lives in `data/*.js` as plain browser scripts — no bundler, no imports.
The contract is documented in [CONTENT_SCHEMA.md](CONTENT_SCHEMA.md).

Answer positions are rebalanced deterministically at load time. The authored
bank was 79% option B; unbalanced, that is guessable without knowing any of
the material.
