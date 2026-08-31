# Forge — C++ & Python Mastery

A dependency-free, static learning site for C++, Python, interview-pattern practice, low-level design, and machine-learning foundations.

## What it includes

- A 50-question general diagnostic: 30 coding prompts and 20 multiple-choice questions.
- Section gates, recalibration exams, and retention checks: each has 12 coding prompts and 8 multiple-choice questions.
- Final assessment score is always `60% coding + 40% multiple choice`.
- 375 independently authored launch prompts across five tracks and 50 skills.
- NeetCode-aligned DSA pattern coverage, without copying or affiliating with NeetCode content.
- C++20 and Python 3.12 starter editors, progressive hints, test checklists, misconception-aware review, and local progress export/import.
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

## Content policy

All prompts, options, explanations, and coaching language are independently authored. “NeetCode-aligned” only describes broad interview-pattern coverage.
