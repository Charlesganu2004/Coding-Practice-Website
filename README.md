# Forge — C++ & Python Mastery

A dependency-free, static learning site for C++, Python, interview-pattern practice, low-level design, and machine-learning foundations.

## What it includes

- A 50-question general diagnostic: 30 coding prompts and 20 multiple-choice questions.
- Section gates, recalibration exams, and retention checks: each has 12 coding prompts and 8 multiple-choice questions.
- Final assessment score is always `60% coding + 40% multiple choice`.
- 375 independently authored launch prompts across five tracks and 50 skills.
- NeetCode-aligned DSA pattern coverage, without copying or affiliating with NeetCode content.
- A clickable learning-roadmap view: every skill stop exposes its prerequisite, invariant, failure mode, test case, score, and one-click drill.
- Larger visibility-first default type (18 px) with persistent A−/A+ controls; the layout reflows instead of requiring horizontal scrolling at larger text sizes.
- C++20 and Python 3.12 starter editors, progressive hints, test checklists, misconception-aware review, and local progress export/import.
- An offline coach plus an optional local-AI coach for Socratic hints and draft review. It is off by default and has no built-in API key.
- Browser-local progress only; no analytics, accounts, backend, or external dependencies.

## Local preview

Open `index.html` in a modern browser. The app deliberately has no build step or package installation.

## GitHub Pages

After pushing this repository:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main`, choose `/(root)`, then click **Save**.
5. GitHub will publish the site at `https://charlesganu2004.github.io/Coding-Practice-Website/` once the deployment completes.

## Important limitation

GitHub Pages is a static host. It cannot safely run arbitrary C++ or Python or keep test cases secret. The code editors therefore provide transparent local-practice guidance and self-review checklists; they are not represented as a secure online judge. A future production judge should use a separately sandboxed execution service with rate limits and no client-exposed API keys.

## Optional local AI coach

The AI coach is deliberately local and opt-in:

1. Open any coding drill and expand **Connect a local model**.
2. Enter an OpenAI-compatible local chat-completions endpoint, such as `http://127.0.0.1:8080/v1/chat/completions`.
3. Acknowledge the local-only setting and save it.
4. Press **Ask local AI for a nudge** or **Review my draft**.

The app accepts only loopback endpoints (`localhost`, `127.0.0.1`, or `::1`) and sends the visible problem and draft only after an AI-help button is pressed. It stores no API keys and does not include a remote proxy. Keep any model server bound to your own machine, with built-in tools disabled.

The request shape is compatible with a user-run `llama.cpp` server, but the repository includes no third-party code, model, binary, or dependency. `llama.cpp` was statically reviewed at commit `2d8d612e4c68d3801e556a1b4a028f55ec33ecbb`; `whisper.cpp` was reviewed at `eacbd8234c6654cdbf2c377f72b2106875479bdc`. Neither is installed or bundled here.

## Content policy

All prompts, options, explanations, and coaching language are independently authored. “NeetCode-aligned” only describes broad interview-pattern coverage.
