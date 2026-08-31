(() => {
  'use strict';

  const STORAGE_KEY = 'forge-mastery-progress-v1';
  const VERSION = 1;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  const titleCase = (value) => String(value).replace(/\b\w/g, (char) => char.toUpperCase());
  const unique = (values) => [...new Set(values)];
  const clamp = (number, min, max) => Math.min(Math.max(number, min), max);

  const TRACKS = [
    {
      id: 'cpp', name: 'C++', symbol: 'C++', blurb: 'Resource-safe systems code, expressive APIs, and performance-aware choices.',
      skills: [
        ['cpp.fundamentals', 'Fundamentals & lifetime', 'A telemetry reader must turn raw numeric tokens into initialized, well-typed readings.', 'every value is initialized, every conversion is intentional, and invalid input has a visible path', 'value types, brace initialization, and explicit error values', 'reading an indeterminate value or silently narrowing a conversion', 'empty input, a malformed token, and the largest accepted reading', 1, []],
        ['cpp.functions', 'Functions, references & pointers', 'A configuration editor updates a shared settings record without accidentally copying or dangling.', 'the caller can see intended mutations and no reference outlives its target', 'const references for observation, references for required targets, and pointers only when absence is meaningful', 'returning a reference or pointer to an object that has already died', 'a missing target, an aliasing call, and an object that leaves scope', 2, ['cpp.fundamentals']],
        ['cpp.raii', 'RAII & value semantics', 'A log session owns a file handle and may be moved between worker objects.', 'the resource is released exactly once even when control flow exits early', 'RAII, move-only ownership, and the rule of zero where possible', 'double-closing a resource or copying an owner', 'an early return, an exception-like failure path, and a move followed by destruction', 3, ['cpp.functions']],
        ['cpp.oop', 'OOP & contracts', 'A pricing engine supports several pricing policies without exposing mutable internals.', 'each type owns one responsibility and callers depend on stable behavior rather than representation', 'composition, narrow interfaces, and explicit invariants', 'a base class with an unsafe destructor or a subclass that violates its contract', 'a new policy, invalid input, and a caller that only knows the interface', 3, ['cpp.raii']],
        ['cpp.stl', 'STL, iterators & algorithms', 'A report pipeline filters and ranks transaction records held in standard containers.', 'iterator validity and algorithm preconditions are preserved through every mutation', 'standard algorithms, iterator-aware container choices, and clear complexity reasoning', 'using an iterator after vector reallocation or erasing while iterating incorrectly', 'an empty collection, a reallocation, and duplicate records', 3, ['cpp.fundamentals']],
        ['cpp.templates', 'Templates & lambdas', 'A reusable aggregation utility should work for several numeric-like types without surprising conversions.', 'generic code states its constraints and captures only the data it needs', 'templates with intentional interfaces, lambdas, and value captures by default', 'capturing a dead reference or accepting a type that cannot satisfy the operation', 'a temporary value, a custom numeric wrapper, and a lambda used after its creator returns', 4, ['cpp.stl']],
        ['cpp.testing', 'Testing & debugging', 'A parser intermittently fails in production but passes its happy-path examples.', 'a failing input becomes a small reproducible test before the implementation changes', 'minimal reproductions, assertions, sanitizers, and boundary-focused tests', 'patching a symptom without proving the root cause', 'a one-character input, malformed delimiters, and a regression from the reported crash', 2, ['cpp.fundamentals']],
        ['cpp.concurrent', 'Concurrency & performance', 'Several workers update a shared work queue while a dashboard reads aggregate status.', 'shared state has an explicit synchronization strategy and performance claims have a measured reason', 'ownership boundaries, mutexes or atomics where appropriate, and profiling before optimization', 'a data race, deadlock, or an optimization that changes correctness', 'two workers at once, an empty queue, and a slow producer with a fast consumer', 5, ['cpp.raii', 'cpp.testing']]
      ]
    },
    {
      id: 'python', name: 'Python', symbol: 'PY', blurb: 'Readable Python that handles data, boundaries, tests, and concurrent work.',
      skills: [
        ['python.collections', 'Collections & data modeling', 'An event importer groups records by account while preserving the information needed for later review.', 'the selected collection matches lookup, ordering, and mutation needs without accidental sharing', 'dicts, sets, tuples, and dataclasses chosen for their behavioral contract', 'using a list for repeated lookup or confusing a mutable record with an immutable key', 'no records, duplicate account IDs, and a record with optional fields', 1, []],
        ['python.functions', 'Functions, scope & mutability', 'A batch helper accepts configuration defaults and processes independent requests.', 'one caller cannot silently change another caller’s defaults or local state', 'pure functions where possible, keyword-only settings, and sentinel values instead of mutable defaults', 'a mutable default argument retaining data from an earlier call', 'two consecutive calls, an explicit empty value, and a caller-provided override', 2, ['python.collections']],
        ['python.iterators', 'Iterators & generators', 'A large audit stream must be grouped into batches without loading the full stream into memory.', 'items are consumed once, in order, and only as needed', 'iterators, generator functions, and streaming-friendly APIs', 'calling len on a one-pass iterable or exhausting an iterator during validation', 'an empty stream, a final partial batch, and an iterator that cannot be rewound', 3, ['python.functions']],
        ['python.oop', 'OOP & dataclasses', 'A booking domain needs records with clear identity, validation, and state changes.', 'state changes are explicit and each object protects its own invariants', 'dataclasses for data, methods for behavior, and composition over incidental inheritance', 'putting shared mutable state on the class or exposing an invalid intermediate state', 'two independent instances, a forbidden state transition, and readable debug output', 3, ['python.collections']],
        ['python.typing', 'Typing, errors & testing', 'A service parses user-supplied commands and returns either a result or a useful error.', 'callers can distinguish success from failure without guessing from a sentinel', 'type hints, small exception boundaries, and focused tests', 'catching every exception and discarding the cause', 'invalid syntax, a valid edge input, and an unexpected internal failure', 3, ['python.functions']],
        ['python.stdlib', 'Files, packages & stdlib', 'A command-line report writes a safe output file and can be imported without side effects.', 'paths, resources, and package initialization behave predictably in different environments', 'pathlib, context managers, standard library parsing, and explicit entry points', 'relying on the current working directory or running application code at import time', 'a missing directory, a path with spaces, and importing the module in a test', 3, ['python.typing']],
        ['python.async', 'Async & concurrency', 'A client gathers independent service checks with a deadline and partial failures.', 'concurrent tasks are awaited, cancelled, and reported without blocking unrelated work', 'asyncio task groups, timeouts, and explicit error collection', 'calling blocking code in the event loop or losing exceptions from background tasks', 'one slow request, one failed request, and cancellation during shutdown', 4, ['python.typing']],
        ['python.performance', 'Performance & memory', 'A data-cleaning job becomes slow after the input grows by two orders of magnitude.', 'optimization follows a measured bottleneck and preserves observable results', 'profiling, generators, appropriate data structures, and algorithmic complexity', 'micro-optimizing syntax while retaining an accidental quadratic loop', 'a tiny input, a large input, and repeated records that stress memory', 4, ['python.iterators', 'python.collections']]
      ]
    },
    {
      id: 'dsa', name: 'Interview patterns', symbol: 'DSA', blurb: 'NeetCode-aligned pattern coverage with independently authored problems and explanations.',
      skills: [
        ['dsa.arrays', 'Arrays & hashing', 'A badge stream must report the first identifier that appears exactly once.', 'counts and positions remain correct as each item is processed', 'hash maps or sets with an explicit pass strategy', 'losing the original order while counting duplicates', 'an empty stream, all duplicates, and a unique item at the end', 1, []],
        ['dsa.twoPointers', 'Two pointers', 'A sorted measurement list needs pairs whose combined value reaches a target without rechecking work.', 'the unexplored interval shrinks without discarding a possible answer', 'left and right pointers with a monotonic comparison', 'moving both pointers when only one move is justified', 'no pair, duplicate values, and a valid pair at the boundary', 2, ['dsa.arrays']],
        ['dsa.slidingWindow', 'Sliding window', 'Find the shortest telemetry interval containing all required alert types.', 'the window is valid before it is minimized and counts match its boundaries', 'a frequency map with expand-then-contract logic', 'shrinking before all requirements are satisfied', 'an empty requirement list, repeated required alerts, and a late best window', 3, ['dsa.arrays']],
        ['dsa.stack', 'Stack', 'A deployment script contains nested delimiters and must identify the first mismatch.', 'the most recent unmatched opener is always available at the top', 'a stack with an explicit matching map', 'trying to match closers without remembering nesting order', 'an empty string, an early closer, and deep nesting', 2, ['dsa.arrays']],
        ['dsa.binarySearch', 'Binary search', 'Find the minimum battery capacity for which a monotonic route-feasibility check succeeds.', 'the answer remains inside the maintained search interval', 'binary search over a sorted space or monotonic predicate', 'using binary search when the predicate is not actually monotonic', 'the smallest feasible value, the largest infeasible value, and one-element ranges', 3, ['dsa.arrays']],
        ['dsa.linkedLists', 'Linked lists', 'A chain of relay nodes may contain a cycle and needs safe structural inspection.', 'each pointer advance is valid and no node is lost during rewiring', 'slow/fast pointers, dummy heads, and local next-pointer storage', 'overwriting next before saving the remainder', 'one node, a cycle at the head, and a long acyclic tail', 3, ['dsa.twoPointers']],
        ['dsa.trees', 'Trees', 'A sensor hierarchy needs an aggregate computed from every branch while respecting subtree boundaries.', 'each recursive call returns exactly the information its parent needs', 'DFS or BFS with a deliberate traversal invariant', 'mixing global state with recursion so one branch contaminates another', 'an empty tree, a single node, and an unbalanced branch', 3, ['dsa.stack']],
        ['dsa.tries', 'Tries', 'An autocomplete service must answer prefix queries across a changing dictionary.', 'every path represents exactly one prefix and terminal words are marked separately', 'a trie with child maps and terminal metadata', 'treating a prefix as a complete word without a terminal marker', 'an empty prefix, a word that prefixes another word, and a missing branch', 4, ['dsa.trees']],
        ['dsa.heap', 'Heap / priority queue', 'A monitor should keep the k most urgent incidents from a large stream.', 'the heap contains exactly the current best candidate set', 'a min-heap or max-heap chosen around the eviction rule', 'using the wrong heap direction and retaining the least useful items', 'k equal to zero, more ties than k, and a stream shorter than k', 3, ['dsa.arrays']],
        ['dsa.backtracking', 'Backtracking', 'Generate valid workstation assignments under pairwise constraints.', 'every recursive frame adds one decision and undoes exactly that decision before returning', 'choose-explore-unchoose recursion with pruning', 'reusing a mutable path without undoing its last choice', 'no valid assignment, one valid assignment, and a branch pruned early', 4, ['dsa.stack']],
        ['dsa.graphs', 'Graphs', 'Determine whether relay dependencies can activate without a circular dependency.', 'visited-state meaning is unambiguous for every traversal', 'BFS/DFS with visited and active-state tracking', 'marking a node visited too late and revisiting it forever', 'a disconnected graph, a self-loop, and a cycle deep in the graph', 3, ['dsa.trees']],
        ['dsa.advancedGraphs', 'Advanced graphs', 'Choose the least-cost service route when each edge has a nonnegative delay.', 'the next finalized distance is globally minimal under the algorithm’s assumptions', 'Dijkstra-style relaxation with a priority queue', 'finalizing a distance before discarding stale queue entries', 'an unreachable node, equal-cost routes, and a path with many hops', 5, ['dsa.graphs', 'dsa.heap']],
        ['dsa.dp1', '1-D dynamic programming', 'Choose non-adjacent maintenance windows to maximize saved cost.', 'the state captures all prior information that changes the next decision', 'a one-dimensional recurrence with explicit base cases', 'using a greedy local choice where future compatibility matters', 'no windows, one window, and two competing early choices', 4, ['dsa.arrays']],
        ['dsa.dp2', '2-D dynamic programming', 'Find the cheapest transformation path through a grid with directional constraints.', 'each cell means one precise subproblem and depends only on already-solved states', 'a table or memoized recursion with a documented recurrence', 'filling cells in an order that uses uninitialized neighbors', 'a one-row grid, blocked cells, and multiple equally cheap paths', 5, ['dsa.dp1']],
        ['dsa.greedy', 'Greedy', 'Select the fewest maintenance intervals that cover every required minute.', 'the local choice has a proof that it never harms an optimal future', 'sorted events with an exchange argument', 'choosing a locally cheap action without proving global safety', 'overlapping intervals, an uncovered gap, and intervals sharing endpoints', 4, ['dsa.intervals']],
        ['dsa.intervals', 'Intervals', 'Merge overlapping reservation windows while preserving closed/open endpoint rules.', 'the active merged range always represents all processed overlapping intervals', 'sort by start time and compare against a current interval', 'forgetting to specify whether touching endpoints overlap', 'one interval, nested intervals, and intervals that touch exactly', 3, ['dsa.arrays']],
        ['dsa.math', 'Math & geometry', 'Normalize a set of 2-D directions so equivalent slopes compare reliably.', 'the representation is canonical despite signs and common factors', 'greatest common divisors, integer arithmetic, and normalization rules', 'using floating-point slopes where equality must be exact', 'vertical lines, negative values, and duplicate points', 4, ['dsa.arrays']],
        ['dsa.bits', 'Bit manipulation', 'Track compact feature flags and answer whether exactly one allowed flag changed.', 'each bit operation has a stated mask and width assumption', 'bit masks, XOR, shifts, and careful signedness reasoning', 'using a shift count or signed value that makes the operation undefined or misleading', 'zero, a high bit, and two equal flag sets', 4, ['dsa.arrays']]
      ]
    },
    {
      id: 'lld', name: 'Low-level design', symbol: 'LLD', blurb: 'Design exercises that reward invariants, tradeoffs, tests, and operational clarity.',
      skills: [
        ['lld.requirements', 'Requirements & invariants', 'A neighborhood tool-locker service must prevent double checkout while supporting reservations.', 'the essential business rules are stated before classes or tables are chosen', 'written invariants, examples, and explicit non-goals', 'coding a happy-path model before defining what cannot happen', 'two people reserving the same tool, an expired reservation, and a lost key', 2, []],
        ['lld.model', 'Domain models & APIs', 'Expose a locker service API that separates member intent from inventory internals.', 'API operations reflect domain actions and return enough information for callers to recover', 'small domain objects, command/query boundaries, and stable contracts', 'leaking persistence fields or forcing callers to coordinate a multi-step action', 'an unavailable tool, an invalid member, and a successful checkout receipt', 3, ['lld.requirements']],
        ['lld.composition', 'Composition & SOLID', 'Add multiple notification policies to a booking service without rewriting booking logic.', 'new behavior can be introduced without violating existing object responsibilities', 'composition, dependency inversion, and replaceable policy objects', 'a growing conditional that mixes booking, transport, and policy decisions', 'a new notification channel, a failed channel, and a policy that is disabled', 3, ['lld.model']],
        ['lld.state', 'State transitions', 'A reservation moves among pending, active, checked-out, expired, and returned states.', 'every transition has a valid source, trigger, and resulting side effect', 'explicit state diagrams, guarded transitions, and auditable events', 'allowing a transition that skips a required lifecycle step', 'expiration during checkout, duplicate return, and retry after a failed payment', 4, ['lld.requirements']],
        ['lld.persistence', 'Persistence & consistency', 'Persist reservations and inventory snapshots while recovering from an interrupted update.', 'a committed view never exposes a half-applied business operation', 'transactions, optimistic versioning, and clear consistency boundaries', 'updating related records independently and leaving a partial write', 'a crash between writes, a stale reader, and a retry of the same request', 4, ['lld.state']],
        ['lld.concurrency', 'Concurrency & idempotency', 'Two kiosk requests can arrive at the same moment for one available locker slot.', 'duplicate or concurrent requests produce one logical result without overselling capacity', 'idempotency keys, compare-and-swap or locks, and conflict responses', 'treating retries as new business actions', 'two identical requests, two conflicting requests, and a delayed retry', 5, ['lld.persistence']],
        ['lld.observability', 'Testing & observability', 'An on-call engineer must tell whether locker failures are bad input, a dependency issue, or a broken invariant.', 'tests and telemetry expose the behavior that matters to users and operators', 'contract tests, structured logs, metrics, traces, and invariant alerts', 'logging noise without correlation or testing only implementation details', 'a timeout, an invariant violation, and a normal successful workflow', 3, ['lld.model']],
        ['lld.caseStudies', 'Case-study synthesis', 'Design a multi-user task board with permissions, reminders, ordering, and offline retries.', 'requirements, model, transitions, persistence, and operations tell one coherent story', 'a thin vertical slice, tradeoff notes, and a testable API', 'drawing many classes without a working behavior or failure strategy', 'a role change, a conflicting edit, and a delayed reminder', 5, ['lld.concurrency', 'lld.observability']]
      ]
    },
    {
      id: 'ml', name: 'Machine learning', symbol: 'ML', blurb: 'Python-first ML practice grounded in validation, metrics, pipelines, and responsible deployment.',
      skills: [
        ['ml.prep', 'Data preparation & numerics', 'Prepare a tabular churn dataset containing missing values, categories, and outliers.', 'transformations are explicit, reproducible, and do not change the meaning of a feature silently', 'NumPy/pandas-style vectorized transforms, schemas, and documented assumptions', 'imputing or casting values in a way that leaks a label or destroys a sentinel meaning', 'all-missing columns, an unseen category, and an extreme but valid value', 2, []],
        ['ml.stats', 'Probability & statistics', 'Decide whether a conversion-rate change is likely signal or ordinary sampling variation.', 'uncertainty, population, and decision threshold are named before a conclusion', 'distributions, confidence intervals, and hypothesis checks with assumptions', 'treating a noisy point estimate as proof of a product effect', 'small samples, imbalanced groups, and a metric with a wide interval', 3, ['ml.prep']],
        ['ml.regression', 'Regression', 'Estimate delivery time from route and workload features while preserving a useful error scale.', 'the target definition, loss, and error analysis match the decision the model supports', 'baseline regressors, residual analysis, and robust validation', 'optimizing a metric whose units are meaningless to the user', 'a constant baseline, an outlier, and a route outside the training range', 3, ['ml.prep', 'ml.stats']],
        ['ml.classification', 'Classification & metrics', 'Triage support requests where false negatives cost more than false positives.', 'the threshold and metric reflect the asymmetric real-world cost', 'confusion matrices, precision/recall, F1, PR curves, and threshold analysis', 'celebrating accuracy on an imbalanced class', 'a rare positive class, a changed threshold, and a hand-labeled hard case', 4, ['ml.stats']],
        ['ml.validation', 'Validation, leakage & regularization', 'Repair a model whose offline validation is excellent but production performance collapses.', 'all preprocessing and model choices are learned only from the appropriate training partition', 'train/validation/test discipline, cross-validation, and regularization', 'fitting normalization or feature selection on the full dataset', 'a temporal split, a duplicate entity, and an intentionally leaked feature', 5, ['ml.prep', 'ml.classification']],
        ['ml.features', 'Features & pipelines', 'Build a reproducible feature pipeline used identically in training and serving.', 'a feature has one definition, one owner, and compatible train/serve behavior', 'pipeline objects, feature contracts, and versioned transformations', 'copying preprocessing code into two places until they diverge', 'missing fields at serving time, an unseen category, and a schema version change', 4, ['ml.validation']],
        ['ml.trees', 'Trees & unsupervised learning', 'Segment activity patterns for outreach and compare a tree-based baseline against a clustering hypothesis.', 'the chosen method has an evaluation tied to the intended action, not just a pretty plot', 'tree baselines, scaling-aware clustering, and segment validation', 'treating arbitrary cluster labels as ground truth or forgetting feature scale', 'one dominant feature, unstable cluster assignments, and a segment with no actionable difference', 4, ['ml.prep']],
        ['ml.deployment', 'Neural nets, deployment & ethics', 'Ship a risk model with monitoring, rollback, fairness checks, and a human escalation path.', 'the deployed system remains observable, bounded, and contestable after model training ends', 'model/version registries, drift checks, subgroup evaluation, and safe fallbacks', 'assuming a high offline score removes the need for monitoring or human review', 'distribution shift, a subgroup regression, and a failed model-service request', 5, ['ml.validation', 'ml.features']]
      ]
    }
  ];

  const CODING_MODES = [
    { id: 'implement', label: 'Implement', instruction: 'Build the smallest clear implementation for the situation.' },
    { id: 'debug', label: 'Debug', instruction: 'First make a minimal failing case, then write a corrected implementation.' },
    { id: 'test', label: 'Test the edges', instruction: 'Write the implementation and a compact test plan that would catch the risky behavior.' },
    { id: 'design', label: 'Make the tradeoff explicit', instruction: 'Write a small API or solution that makes the ownership, state, or data-flow decision obvious.' }
  ];

  const MCQ_TYPES = [
    { id: 'principle', label: 'Invariant check' },
    { id: 'risk', label: 'Failure diagnosis' },
    { id: 'test', label: 'Test selection' }
  ];

  const flattenSkills = () => TRACKS.flatMap((track) => track.skills.map(([id, name, scenario, invariant, tool, risk, test, difficulty, prerequisites]) => ({
    id, name, scenario, invariant, tool, risk, test, difficulty, prerequisites, trackId: track.id, trackName: track.name
  })));
  const SKILLS = flattenSkills();
  const skillById = (id) => SKILLS.find((skill) => skill.id === id);
  const trackById = (id) => TRACKS.find((track) => track.id === id);

  function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      result ^= value.charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function deterministicShuffle(items, key) {
    const output = [...items];
    let seed = hash(key);
    for (let index = output.length - 1; index > 0; index -= 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const swapIndex = seed % (index + 1);
      [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
    }
    return output;
  }

  function languageStarter(question, language) {
    const headline = question.title.replace(/[^\w .:+-]/g, '');
    if (language === 'cpp') {
      return `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n// ${headline}\n// State the invariant before you implement.\n\nint main() {\n    // Write a focused example or your solve function here.\n    return 0;\n}\n`;
    }
    return `from __future__ import annotations\n\n# ${headline}\n# State the invariant before you implement.\n\ndef solve(data):\n    \"\"\"Return a result while preserving the stated invariant.\"\"\"\n    pass\n\nif __name__ == \"__main__\":\n    # Add a focused example here.\n    pass\n`;
  }

  function buildCodingQuestion(skill, mode, capstone = false) {
    const title = capstone ? `Synthesize: ${skill.name}` : `${mode.label}: ${skill.name}`;
    const prompt = capstone
      ? `Combine ${skill.name} with its prerequisites in a small vertical slice. ${skill.scenario} Make the central decision and its failure behavior visible. Your solution must preserve this invariant: ${skill.invariant}. Use ${skill.tool}; do not hide the tradeoff behind global mutable state or unexplained magic.`
      : `${mode.instruction} ${skill.scenario} The solution must preserve this invariant: ${skill.invariant}. Prefer ${skill.tool}. A common failure is ${skill.risk}. Keep the interface small enough to test locally.`;
    const id = `${skill.id}.coding.${capstone ? 'synthesis' : mode.id}`;
    return {
      id, familyId: id, trackId: skill.trackId, skillId: skill.id, format: 'coding', difficulty: clamp(skill.difficulty + (mode.id === 'design' ? 1 : 0), 1, 5),
      title, prompt, mode: capstone ? 'Synthesis' : mode.label, estimatedMinutes: capstone ? 24 : 14,
      outcome: `You will recognize the ${skill.name} pattern, state a durable invariant, and choose a solution that is testable under pressure.`,
      hints: [
        `Before coding, write one sentence for what must remain true: ${skill.invariant}.`,
        `Choose the main tool deliberately: ${skill.tool}.`,
        `Make a tiny test around ${skill.test}. Confirm that ${skill.risk} cannot happen.`
      ],
      rubric: [
        'The core behavior matches the stated situation.',
        `An edge case around ${skill.test} is handled deliberately.`,
        `The implementation protects against ${skill.risk}.`,
        'The time/space or design tradeoff is explainable in one or two sentences.'
      ],
      explanation: `This is a ${skill.name} exercise. Strong solutions begin with the invariant, select ${skill.tool}, and prove it using the smallest cases that could expose ${skill.risk}.`,
      misconceptionTags: [skill.risk, 'missing-invariant', 'untested-edge-case'],
      prerequisites: skill.prerequisites,
      languages: ['cpp', 'python']
    };
  }

  function buildMcqQuestion(skill, type) {
    const id = `${skill.id}.mcq.${type.id}`;
    let question;
    let correct;
    let distractors;
    let explanation;
    if (type.id === 'principle') {
      question = `In a ${skill.name} review, which decision is the most defensible?`;
      correct = `Use ${skill.tool} so that ${skill.invariant}.`;
      distractors = [
        'Add global mutable state so later code can repair any mistake.',
        'Prefer the shortest implementation even when it hides failure paths.',
        'Assume production input is valid because most examples are happy paths.'
      ];
      explanation = `The invariant drives the choice. ${correct}`;
    } else if (type.id === 'risk') {
      question = `A review finds a risk of ${skill.risk}. What should the next investigation prioritize?`;
      correct = `Reproduce it with ${skill.test} and verify that ${skill.invariant}.`;
      distractors = [
        'Rename variables first; a clearer name removes the failure.',
        'Add a broad catch-all fallback and continue silently.',
        'Optimize the fastest current example before reproducing the defect.'
      ];
      explanation = `A small reproduction is evidence. It connects the observed risk to the invariant you need to preserve.`;
    } else {
      question = `Which is the highest-value first test for this ${skill.name} task?`;
      correct = `A focused case involving ${skill.test}.`;
      distractors = [
        'Only a large randomized case with no asserted outcome.',
        'Only a happy-path example that mirrors the implementation.',
        'A cosmetic output-format check before behavior is verified.'
      ];
      explanation = `The most revealing early test is the one most likely to break the invariant or expose the named risk.`;
    }
    const options = deterministicShuffle([correct, ...distractors], id).map((text, index) => ({ id: `${id}.option.${index}`, text, correct: text === correct }));
    return {
      id, familyId: id, trackId: skill.trackId, skillId: skill.id, format: 'mcq', difficulty: clamp(skill.difficulty, 1, 5),
      title: `${type.label}: ${skill.name}`, prompt: question, options, answer: options.find((option) => option.correct).id,
      explanation, misconceptionTags: [skill.risk, 'rote-memorization'], prerequisites: skill.prerequisites, estimatedMinutes: 3
    };
  }

  function buildQuestionBank() {
    const bank = [];
    for (const skill of SKILLS) {
      for (const mode of CODING_MODES) bank.push(buildCodingQuestion(skill, mode));
      for (const type of MCQ_TYPES) bank.push(buildMcqQuestion(skill, type));
    }
    for (const track of TRACKS) {
      const capstoneCount = Math.ceil(track.skills.length / 2);
      const skills = SKILLS.filter((skill) => skill.trackId === track.id).slice(0, capstoneCount);
      for (const skill of skills) bank.push(buildCodingQuestion(skill, CODING_MODES[3], true));
    }
    return bank;
  }

  const BANK = buildQuestionBank();
  const questionById = (id) => BANK.find((question) => question.id === id);

  const BASE_PROGRESS = () => ({
    version: VERSION,
    theme: 'paper',
    seenIds: [],
    attempts: [],
    skillScores: {},
    trackScores: {},
    completed: {},
    activeExam: null,
    recommendedSkills: [],
    practiceCount: 0
  });

  function loadProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || stored.version !== VERSION || !Array.isArray(stored.seenIds) || !Array.isArray(stored.attempts)) return BASE_PROGRESS();
      return { ...BASE_PROGRESS(), ...stored, activeExam: stored.activeExam || null };
    } catch {
      return BASE_PROGRESS();
    }
  }

  const state = {
    route: 'home',
    progress: loadProgress(),
    practice: { track: 'all', skill: 'all', format: 'all', difficulty: 'all', questionId: null },
    latestResult: null
  };

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.progress.theme === 'night' ? 'night' : 'paper';
    $('#theme-toggle').textContent = state.progress.theme === 'night' ? '◑' : '◐';
  }

  function band(score) {
    if (score === null || score === undefined) return 'No evidence yet';
    if (score >= 90) return 'Mastery';
    if (score >= 75) return 'Proficient';
    if (score >= 60) return 'Capable';
    if (score >= 40) return 'Developing';
    return 'Beginner';
  }

  function scoreLabel(score) {
    return score === null || score === undefined ? '—' : `${Math.round(score)}%`;
  }

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(timestamp));
  }

  function toast(message, kind = 'success') {
    const region = $('#toast-region');
    const item = document.createElement('div');
    item.className = `toast${kind === 'error' ? ' error' : ''}`;
    item.textContent = message;
    region.append(item);
    window.setTimeout(() => item.remove(), 4000);
  }

  function setRoute(route) {
    const validRoute = ['home', 'diagnostic', 'practice', 'roadmap', 'exam'].includes(route) ? route : 'home';
    state.route = validRoute;
    for (const view of $$('.view')) view.hidden = view.dataset.view !== validRoute;
    for (const button of $$('.primary-nav [data-route]')) button.toggleAttribute('aria-current', button.dataset.route === validRoute);
    if (validRoute === 'home') renderHome();
    if (validRoute === 'diagnostic') renderAssessmentHub();
    if (validRoute === 'practice') renderPractice();
    if (validRoute === 'roadmap') renderRoadmap();
    if (validRoute === 'exam') renderExam();
    $('#main-content').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function renderHome() {
    $('#question-count').textContent = BANK.length;
    const target = $('#home-tracks');
    target.innerHTML = TRACKS.map((track) => {
      const score = state.progress.trackScores[track.id];
      const firstSkill = skillById(track.skills[0][0]);
      return `<article class="track-card">
        <span class="track-symbol">${escapeHtml(track.symbol)}</span>
        <h3>${escapeHtml(track.name)}</h3>
        <p>${escapeHtml(track.blurb)}</p>
        <footer><span>${track.skills.length} skills · ${scoreLabel(score)}</span><button type="button" data-action="practice-track" data-track="${track.id}">Train <span aria-hidden="true">→</span></button></footer>
      </article>`;
    }).join('');
  }

  function assessmentKindLabel(kind) {
    return ({ diagnostic: 'General diagnostic', section: 'Section gate', recalibration: 'Recalibration exam', retention: 'Retention check' })[kind] || 'Assessment';
  }

  function getLastAttempt(kind, trackId = null) {
    return state.progress.attempts.find((attempt) => attempt.kind === kind && (trackId === null || attempt.targetTrack === trackId));
  }

  function renderAssessmentHub() {
    const container = $('#assessment-hub');
    const diagnostic = getLastAttempt('diagnostic');
    const active = state.progress.activeExam;
    const activeNotice = active ? `<div class="mini-note"><h3>Resume your in-progress ${escapeHtml(assessmentKindLabel(active.kind))}</h3><p>${active.questionIds.length} questions are saved in this browser. Resume where you left off.</p><button class="text-button" type="button" data-action="resume-exam">Resume assessment →</button></div>` : '';
    if (!diagnostic) {
      container.innerHTML = `<div class="assessment-grid">
        <article class="assessment-card"><p class="eyebrow">Start here</p><h2>Diagnostic A: your general baseline</h2><p>Fifty original questions across all five tracks. This is deliberately broad: it finds the first skill to train instead of assigning one vague global level.</p><div class="assessment-meta"><span class="chip chip-coding">30 coding · 60%</span><span class="chip chip-mcq">20 multiple choice · 40%</span><span class="chip">~90–120 minutes</span></div><button class="button button-primary" type="button" data-action="start-diagnostic">Begin the diagnostic →</button></article>
        <aside class="assessment-aside">${activeNotice}<div class="mini-note"><h3>How coding is scored here</h3><p>Each coding prompt has four transparent test groups: core behavior, an edge case, the key failure mode, and an explainable tradeoff. This is local practice evidence—not a hidden cloud judge.</p></div></aside>
      </div>`;
      return;
    }
    const recentAttempts = state.progress.attempts.slice(0, 5).map((attempt) => `<div class="attempt-row"><div><strong>${escapeHtml(attempt.title)}</strong><span>${formatDate(attempt.finishedAt)}</span></div><strong>${Math.round(attempt.total)}%</strong></div>`).join('');
    const sectionChoices = TRACKS.map((track) => {
      const done = state.progress.completed[track.id] || {};
      const score = state.progress.trackScores[track.id];
      let action = 'Start section gate';
      let kind = 'section';
      if (done.gate && !done.recalibrated) { action = 'Take fresh recalibration'; kind = 'recalibration'; }
      if (done.recalibrated) { action = 'Schedule retention check'; kind = 'retention'; }
      return `<button class="section-choice" type="button" data-action="start-section" data-track="${track.id}" data-kind="${kind}"><span><strong>${escapeHtml(track.name)}</strong><small>${scoreLabel(score)} · ${escapeHtml(band(score))} · ${track.skills.length} skills</small></span><span>${escapeHtml(action)} →</span></button>`;
    }).join('');
    container.innerHTML = `<div class="assessment-grid">
      <article class="assessment-card"><p class="eyebrow">Your next proof</p><h2>One section at a time.</h2><p>Every section gate and recalibration exam has 20 fresh items: 12 coding (60% of the score) and 8 multiple choice (40%). A gate requires 80% overall, at least 75% coding, and at least 70% multiple choice.</p><div class="assessment-section-list">${sectionChoices}</div></article>
      <aside class="assessment-aside">${activeNotice}<div class="mini-note"><h3>Recent evidence</h3><div class="attempt-list">${recentAttempts || '<p>No completed attempts yet.</p>'}</div></div></aside>
    </div>`;
  }

  function populatePracticeFilters() {
    const trackSelect = $('#practice-track-filter');
    if (!trackSelect.options.length) {
      trackSelect.innerHTML = `<option value="all">All tracks</option>${TRACKS.map((track) => `<option value="${track.id}">${escapeHtml(track.name)}</option>`).join('')}`;
      trackSelect.addEventListener('change', () => {
        state.practice.track = trackSelect.value;
        state.practice.skill = 'all';
        populateSkillFilter();
        state.practice.questionId = null;
        renderPractice();
      });
      $('#practice-skill-filter').addEventListener('change', (event) => { state.practice.skill = event.target.value; state.practice.questionId = null; renderPractice(); });
      $('#practice-format-filter').addEventListener('change', (event) => { state.practice.format = event.target.value; state.practice.questionId = null; renderPractice(); });
      $('#practice-difficulty-filter').addEventListener('change', (event) => { state.practice.difficulty = event.target.value; state.practice.questionId = null; renderPractice(); });
    }
    trackSelect.value = state.practice.track;
    $('#practice-format-filter').value = state.practice.format;
    $('#practice-difficulty-filter').value = state.practice.difficulty;
    populateSkillFilter();
  }

  function populateSkillFilter() {
    const select = $('#practice-skill-filter');
    const skills = state.practice.track === 'all' ? SKILLS : SKILLS.filter((skill) => skill.trackId === state.practice.track);
    if (!skills.some((skill) => skill.id === state.practice.skill)) state.practice.skill = 'all';
    select.innerHTML = `<option value="all">All skills</option>${skills.map((skill) => `<option value="${skill.id}">${escapeHtml(skill.name)}</option>`).join('')}`;
    select.value = state.practice.skill;
  }

  function filteredPracticeQuestions() {
    return BANK.filter((question) => {
      if (state.practice.track !== 'all' && question.trackId !== state.practice.track) return false;
      if (state.practice.skill !== 'all' && question.skillId !== state.practice.skill) return false;
      if (state.practice.format !== 'all' && question.format !== state.practice.format) return false;
      if (state.practice.difficulty !== 'all' && String(question.difficulty) !== state.practice.difficulty) return false;
      return true;
    });
  }

  function choosePracticeQuestion(forceNew = false) {
    const candidates = filteredPracticeQuestions();
    if (!candidates.length) return null;
    const current = questionById(state.practice.questionId);
    if (!forceNew && current && candidates.some((candidate) => candidate.id === current.id)) return current;
    const index = (state.progress.practiceCount + hash(`${state.practice.track}.${state.practice.skill}.${state.practice.format}`)) % candidates.length;
    const question = candidates[index];
    state.practice.questionId = question.id;
    state.progress.practiceCount += 1;
    saveProgress();
    return question;
  }

  function renderPractice() {
    populatePracticeFilters();
    const candidates = filteredPracticeQuestions();
    $('#library-count').textContent = `${candidates.length} matching original practice prompts`;
    const question = choosePracticeQuestion(false);
    const card = $('#practice-card');
    if (!question) {
      card.innerHTML = `<div class="empty-state"><h2>No prompts match that filter.</h2><p>Try another skill, format, or difficulty. The library has work at every stage.</p><button class="button button-secondary" type="button" id="empty-clear">Clear filters</button></div>`;
      $('#empty-clear')?.addEventListener('click', clearPracticeFilters);
      return;
    }
    const skill = skillById(question.skillId);
    const track = trackById(question.trackId);
    const header = `<div class="practice-card-header"><span class="chip">${escapeHtml(track.name)}</span><span class="chip">${escapeHtml(skill.name)}</span><span class="chip ${question.format === 'coding' ? 'chip-coding' : 'chip-mcq'}">${question.format === 'coding' ? 'Coding' : 'Multiple choice'}</span><span class="chip">Level ${question.difficulty} · ${question.estimatedMinutes} min</span><button class="text-button" type="button" id="next-practice">New drill →</button></div>`;
    if (question.format === 'coding') {
      card.innerHTML = `${header}<div class="practice-card-body"><p class="eyebrow">${escapeHtml(question.mode)} exercise</p><h2>${escapeHtml(question.title)}</h2><p class="challenge-prompt">${escapeHtml(question.prompt)}</p><div class="challenge-outcome"><strong>What this trains</strong><p>${escapeHtml(question.outcome)}</p></div><div class="challenge-layout"><section class="editor-panel" aria-label="Practice code editor"><div class="editor-toolbar"><label>Language <select id="practice-language"><option value="cpp">C++20</option><option value="python">Python 3.12</option></select></label><span>Local practice editor</span></div><textarea class="code-editor" id="practice-editor" spellcheck="false" aria-label="Code editor"></textarea><div class="editor-actions"><button class="button button-primary" type="button" id="check-approach">Review my approach</button><button class="button button-secondary" type="button" id="load-starter">Restore starter</button></div></section><aside class="coach-panel"><h3>Coach’s checklist</h3><ol>${question.rubric.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol><div class="coach-result" id="coach-result"><strong>Write first. Then review.</strong><p>This review checks visible strategy signals only; it cannot prove that arbitrary C++ or Python ran correctly in a static web page.</p></div></aside></div><details class="hint-details"><summary>Reveal progressive hints</summary><ol>${question.hints.map((hint) => `<li>${escapeHtml(hint)}</li>`).join('')}</ol><p><strong>Pattern explanation:</strong> ${escapeHtml(question.explanation)}</p></details><div class="review-checks">${question.rubric.map((item, index) => `<label><input type="checkbox" data-practice-check="${index}"> I tested: ${escapeHtml(item)}</label>`).join('')}</div></div>`;
      const language = $('#practice-language');
      const editor = $('#practice-editor');
      editor.value = languageStarter(question, language.value);
      language.addEventListener('change', () => { editor.value = languageStarter(question, language.value); });
      $('#load-starter').addEventListener('click', () => { editor.value = languageStarter(question, language.value); toast('Starter restored.'); });
      $('#check-approach').addEventListener('click', () => reviewApproach(question, editor.value));
    } else {
      card.innerHTML = `${header}<div class="practice-card-body"><p class="eyebrow">${escapeHtml(question.mode || 'Knowledge check')}</p><h2>${escapeHtml(question.title)}</h2><p class="challenge-prompt">${escapeHtml(question.prompt)}</p><div class="mcq-practice" id="practice-options">${question.options.map((option, index) => `<button class="answer-option" type="button" data-option="${option.id}"><span class="option-key">${String.fromCharCode(65 + index)}</span><p>${escapeHtml(option.text)}</p></button>`).join('')}</div><div class="explanation" id="practice-explanation" hidden><strong>Why this matters</strong><p>${escapeHtml(question.explanation)}</p></div></div>`;
      $$('#practice-options [data-option]').forEach((button) => button.addEventListener('click', () => {
        const selected = button.dataset.option;
        $$('#practice-options [data-option]').forEach((optionButton) => {
          const option = question.options.find((item) => item.id === optionButton.dataset.option);
          optionButton.dataset.state = option.correct ? 'correct' : optionButton.dataset.option === selected ? 'incorrect' : '';
          optionButton.disabled = true;
        });
        $('#practice-explanation').hidden = false;
      }));
    }
    $('#next-practice').addEventListener('click', () => { choosePracticeQuestion(true); renderPractice(); });
  }

  function reviewApproach(question, code) {
    const result = $('#coach-result');
    const normalized = code.toLowerCase();
    const signals = [
      { hit: code.trim().length >= 60, label: 'a non-trivial code draft' },
      { hit: /\b(if|match|switch)\b/.test(normalized), label: 'a branch for validation or edge cases' },
      { hit: /\b(for|while|yield|recurs|dfs|bfs)\b/.test(normalized), label: 'a visible control-flow strategy' },
      { hit: /\b(return|raise|throw)\b/.test(normalized), label: 'an explicit result or error path' }
    ];
    const found = signals.filter((signal) => signal.hit);
    const missing = signals.filter((signal) => !signal.hit);
    result.innerHTML = `<strong>${found.length}/4 visible strategy signals</strong><p>${found.length ? `I can see ${escapeHtml(found.map((signal) => signal.label).join(', '))}.` : 'Start with a small executable or callable draft.'} ${missing.length ? `Next, make room for ${escapeHtml(missing[0].label)}.` : 'Now test the rubric cases locally and explain the tradeoff aloud.'}</p>`;
  }

  function clearPracticeFilters() {
    state.practice = { track: 'all', skill: 'all', format: 'all', difficulty: 'all', questionId: null };
    renderPractice();
  }

  function eligibleCandidates(trackId, format, usedIds, preferredSkillIds = [], avoidSeen = true) {
    const candidates = BANK.filter((question) => question.trackId === trackId && question.format === format && !usedIds.has(question.id));
    const unseen = avoidSeen ? candidates.filter((question) => !state.progress.seenIds.includes(question.id)) : candidates;
    const pool = unseen.length ? unseen : candidates;
    return [...pool].sort((a, b) => {
      const aPriority = preferredSkillIds.includes(a.skillId) ? 0 : 1;
      const bPriority = preferredSkillIds.includes(b.skillId) ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      const aSeen = state.progress.seenIds.includes(a.id) ? 1 : 0;
      const bSeen = state.progress.seenIds.includes(b.id) ? 1 : 0;
      if (aSeen !== bSeen) return aSeen - bSeen;
      return hash(`${a.id}.${state.progress.attempts.length}`) - hash(`${b.id}.${state.progress.attempts.length}`);
    });
  }

  function takeQuestions(trackId, format, count, usedIds, preferredSkillIds = []) {
    const candidates = eligibleCandidates(trackId, format, usedIds, preferredSkillIds);
    const chosen = [];
    const chosenSkills = new Set();
    for (const question of candidates) {
      if (chosen.length >= count) break;
      if (!chosenSkills.has(question.skillId) || candidates.length - chosen.length <= count) {
        chosen.push(question);
        chosenSkills.add(question.skillId);
        usedIds.add(question.id);
      }
    }
    if (chosen.length < count) {
      for (const question of candidates) {
        if (chosen.length >= count) break;
        if (!usedIds.has(question.id)) { chosen.push(question); usedIds.add(question.id); }
      }
    }
    return chosen;
  }

  function assessmentBlueprint(kind, targetTrack) {
    if (kind === 'diagnostic') {
      return [
        ['cpp', 5, 3], ['python', 5, 3], ['dsa', 11, 7], ['lld', 5, 3], ['ml', 4, 4]
      ];
    }
    return [[targetTrack, 12, 8]];
  }

  function preferredSkillsFor(kind, trackId) {
    const trackSkills = SKILLS.filter((skill) => skill.trackId === trackId).map((skill) => skill.id);
    if (kind === 'section') return state.progress.recommendedSkills.filter((id) => trackSkills.includes(id));
    if (kind === 'recalibration') {
      const weak = state.progress.recommendedSkills.filter((id) => trackSkills.includes(id));
      const prior = weak.flatMap((id) => skillById(id)?.prerequisites || []);
      const next = trackSkills.filter((id) => !weak.includes(id) && !prior.includes(id));
      return [...weak, ...prior, ...next];
    }
    return trackSkills;
  }

  function startAssessment(kind, targetTrack = null) {
    const current = state.progress.activeExam;
    if (current) {
      toast('Finish or resume the saved assessment before starting another.', 'error');
      setRoute('diagnostic');
      return;
    }
    const usedIds = new Set();
    const questions = [];
    for (const [trackId, codingCount, mcqCount] of assessmentBlueprint(kind, targetTrack)) {
      const preferred = preferredSkillsFor(kind, trackId);
      questions.push(...takeQuestions(trackId, 'coding', codingCount, usedIds, preferred));
      questions.push(...takeQuestions(trackId, 'mcq', mcqCount, usedIds, preferred));
    }
    const questionIds = deterministicShuffle(questions.map((question) => question.id), `${kind}.${targetTrack || 'all'}.${Date.now()}`);
    const optionOrders = {};
    for (const id of questionIds) {
      const question = questionById(id);
      if (question.format === 'mcq') optionOrders[id] = deterministicShuffle(question.options.map((option) => option.id), `${id}.${Date.now()}`);
    }
    const track = targetTrack ? trackById(targetTrack) : null;
    state.progress.activeExam = {
      id: `${kind}-${Date.now()}`,
      kind,
      targetTrack,
      title: kind === 'diagnostic' ? 'Diagnostic A: General Baseline' : `${track.name}: ${assessmentKindLabel(kind)}`,
      questionIds,
      optionOrders,
      index: 0,
      answers: {},
      startedAt: Date.now()
    };
    saveProgress();
    setRoute('exam');
  }

  function activeExamQuestion() {
    const exam = state.progress.activeExam;
    return exam ? questionById(exam.questionIds[exam.index]) : null;
  }

  function answerFor(questionId) {
    const exam = state.progress.activeExam;
    if (!exam.answers[questionId]) exam.answers[questionId] = { language: 'cpp', code: '', checks: [] };
    return exam.answers[questionId];
  }

  function renderExam() {
    const container = $('#exam-content');
    const exam = state.progress.activeExam;
    if (!exam) {
      container.innerHTML = `<div class="empty-state"><h2>No assessment is open.</h2><p>Start with the general diagnostic, then return here for section gates and recalibration exams.</p><button class="button button-primary" type="button" data-route="diagnostic">Open assessment center</button></div>`;
      return;
    }
    const question = activeExamQuestion();
    if (!question) { state.progress.activeExam = null; saveProgress(); renderExam(); return; }
    const answer = answerFor(question.id);
    const progressPercent = Math.round(((exam.index + 1) / exam.questionIds.length) * 100);
    const skill = skillById(question.skillId);
    const track = trackById(question.trackId);
    let body;
    if (question.format === 'mcq') {
      const orderedOptions = exam.optionOrders[question.id].map((optionId) => question.options.find((option) => option.id === optionId));
      body = `<div class="exam-options">${orderedOptions.map((option, index) => `<button class="answer-option${answer.selected === option.id ? ' is-selected' : ''}" type="button" data-exam-option="${option.id}"><span class="option-key">${String.fromCharCode(65 + index)}</span><p>${escapeHtml(option.text)}</p></button>`).join('')}</div>`;
    } else {
      body = `<div class="exam-coding"><div class="language-row"><label>Write in <select id="exam-language"><option value="cpp">C++20</option><option value="python">Python 3.12</option></select></label><span class="chip chip-coding">Self-review makes the coding score transparent</span></div><textarea id="exam-editor" spellcheck="false" aria-label="Code response"></textarea><div class="exam-self-review">${question.rubric.map((item, index) => `<label><input type="checkbox" data-exam-check="${index}" ${answer.checks.includes(index) ? 'checked' : ''}>${escapeHtml(item)}</label>`).join('')}</div></div>`;
    }
    container.innerHTML = `<div class="exam-frame"><div class="exam-topbar"><strong>${escapeHtml(exam.title)}</strong><span class="exam-count">Question ${exam.index + 1} of ${exam.questionIds.length}</span></div><div class="exam-progress"><span style="width:${progressPercent}%"></span></div><div class="exam-question"><span class="chip">${escapeHtml(track.name)} · ${escapeHtml(skill.name)} · ${question.format === 'coding' ? 'Coding' : 'Multiple choice'}</span><h1>${escapeHtml(question.title)}</h1><p class="prompt">${escapeHtml(question.prompt)}</p>${body}</div><div class="exam-nav"><button class="button button-secondary" type="button" id="exam-previous" ${exam.index === 0 ? 'disabled' : ''}>← Back</button><span class="exam-nav-note">${question.format === 'coding' ? 'Coding: write code + mark local test evidence.' : 'Choose one answer before continuing.'}</span><button class="button button-primary" type="button" id="exam-next">${exam.index === exam.questionIds.length - 1 ? 'Finish assessment' : 'Continue →'}</button></div></div>`;
    if (question.format === 'mcq') {
      $$('#exam-content [data-exam-option]').forEach((button) => button.addEventListener('click', () => {
        answer.selected = button.dataset.examOption;
        saveProgress();
        renderExam();
      }));
    } else {
      const language = $('#exam-language');
      const editor = $('#exam-editor');
      language.value = answer.language || 'cpp';
      editor.value = answer.code || languageStarter(question, language.value);
      language.addEventListener('change', () => {
        const previousStarter = languageStarter(question, answer.language || 'cpp');
        answer.language = language.value;
        if (!answer.code || answer.code === previousStarter) {
          answer.code = languageStarter(question, language.value);
          editor.value = answer.code;
        }
        saveProgress();
      });
      editor.addEventListener('input', () => { answer.code = editor.value; saveProgress(); });
      $$('#exam-content [data-exam-check]').forEach((checkbox) => checkbox.addEventListener('change', () => {
        const index = Number(checkbox.dataset.examCheck);
        answer.checks = checkbox.checked ? unique([...answer.checks, index]) : answer.checks.filter((item) => item !== index);
        saveProgress();
      }));
    }
    $('#exam-previous').addEventListener('click', () => { exam.index -= 1; saveProgress(); renderExam(); });
    $('#exam-next').addEventListener('click', () => {
      if (exam.index === exam.questionIds.length - 1) finishAssessment();
      else { exam.index += 1; saveProgress(); renderExam(); }
    });
  }

  function calculateAssessment(exam) {
    const items = exam.questionIds.map(questionById);
    const groups = { coding: [], mcq: [] };
    const skillResults = {};
    const trackResults = {};
    const missed = [];
    for (const question of items) {
      const answer = exam.answers[question.id] || {};
      const score = question.format === 'mcq'
        ? Number(answer.selected === question.answer)
        : (String(answer.code || '').trim().length >= 20 ? (answer.checks || []).length / question.rubric.length : 0);
      groups[question.format].push(score);
      if (!skillResults[question.skillId]) skillResults[question.skillId] = { earned: 0, possible: 0 };
      skillResults[question.skillId].earned += score;
      skillResults[question.skillId].possible += 1;
      if (!trackResults[question.trackId]) trackResults[question.trackId] = { earned: 0, possible: 0 };
      trackResults[question.trackId].earned += score;
      trackResults[question.trackId].possible += 1;
      if (score < 0.999) missed.push({ question, score });
    }
    const coding = groups.coding.length ? (groups.coding.reduce((sum, value) => sum + value, 0) / groups.coding.length) * 100 : 0;
    const mcq = groups.mcq.length ? (groups.mcq.reduce((sum, value) => sum + value, 0) / groups.mcq.length) * 100 : 0;
    const total = 0.6 * coding + 0.4 * mcq;
    const skillScores = Object.fromEntries(Object.entries(skillResults).map(([id, value]) => [id, (value.earned / value.possible) * 100]));
    const trackScores = Object.fromEntries(Object.entries(trackResults).map(([id, value]) => [id, (value.earned / value.possible) * 100]));
    return { coding, mcq, total, skillScores, trackScores, missed, itemCount: items.length };
  }

  function updateMastery(result) {
    for (const [skillId, score] of Object.entries(result.skillScores)) {
      const previous = state.progress.skillScores[skillId];
      state.progress.skillScores[skillId] = previous === undefined ? score : (previous * 0.45) + (score * 0.55);
    }
    for (const track of TRACKS) {
      const values = SKILLS.filter((skill) => skill.trackId === track.id).map((skill) => state.progress.skillScores[skill.id]).filter((score) => score !== undefined);
      if (values.length) state.progress.trackScores[track.id] = values.reduce((sum, score) => sum + score, 0) / values.length;
    }
    state.progress.recommendedSkills = Object.entries(state.progress.skillScores).sort(([, a], [, b]) => a - b).slice(0, 8).map(([id]) => id);
  }

  function passStatus(kind, result) {
    if (kind === 'section') return result.total >= 80 && result.coding >= 75 && result.mcq >= 70;
    if (kind === 'recalibration') return result.total >= 70;
    if (kind === 'retention') return result.total >= 70;
    return true;
  }

  function finishAssessment() {
    const exam = state.progress.activeExam;
    const result = calculateAssessment(exam);
    const passed = passStatus(exam.kind, result);
    const attempt = { id: exam.id, kind: exam.kind, targetTrack: exam.targetTrack, title: exam.title, finishedAt: Date.now(), total: result.total, coding: result.coding, mcq: result.mcq, passed, itemCount: result.itemCount };
    state.progress.attempts.unshift(attempt);
    state.progress.attempts = state.progress.attempts.slice(0, 30);
    state.progress.seenIds = unique([...state.progress.seenIds, ...exam.questionIds]);
    updateMastery(result);
    if (exam.targetTrack && exam.kind === 'section' && passed) state.progress.completed[exam.targetTrack] = { ...state.progress.completed[exam.targetTrack], gate: true };
    if (exam.targetTrack && exam.kind === 'recalibration' && passed) state.progress.completed[exam.targetTrack] = { ...state.progress.completed[exam.targetTrack], gate: true, recalibrated: true };
    state.latestResult = { ...result, exam, passed };
    state.progress.activeExam = null;
    saveProgress();
    renderResults();
  }

  function renderResults() {
    const { exam, total, coding, mcq, skillScores, missed, passed } = state.latestResult;
    const isDiagnostic = exam.kind === 'diagnostic';
    const heading = isDiagnostic
      ? `Your baseline is ${band(total)}.`
      : passed ? 'That section is proven.' : 'Keep the pass within reach.';
    const summary = isDiagnostic
      ? 'This is a starting map, not a label. Train the weakest evidenced skill first, then let the next assessment update the picture.'
      : passed
        ? (exam.kind === 'section' ? 'You cleared the gate. Take the fresh recalibration exam next; it checks integration, retained prerequisites, and the next skill edge.' : 'You have enough evidence to advance. A 7- or 30-day retention check will protect the learning.')
        : 'The threshold is not a punishment. It is a useful signal: train the missed patterns, then attempt a fresh gate instead of replaying the same questions.';
    const weakest = Object.entries(skillScores).sort(([, a], [, b]) => a - b).slice(0, 5).map(([id, score]) => ({ skill: skillById(id), score }));
    const criticalMisses = missed.slice(0, 5);
    $('#exam-content').innerHTML = `<div class="results-wrap"><section class="results-hero"><p class="eyebrow">${escapeHtml(assessmentKindLabel(exam.kind))} complete</p><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(summary)}</p><div class="results-score"><strong>${Math.round(total)}%</strong><span>${escapeHtml(band(total))}</span></div></section><section class="score-breakdown"><article><h2>Coding</h2><strong>${Math.round(coding)}%</strong><p>Worth 60% of the final result. Code evidence plus local test-group self-review.</p></article><article><h2>Multiple choice</h2><strong>${Math.round(mcq)}%</strong><p>Worth 40% of the final result. Each item tests an invariant, failure diagnosis, or test choice.</p></article></section><section class="results-section"><p class="eyebrow">What to train next</p><h2>Turn evidence into a drill.</h2><ul class="recommendation-list">${weakest.map(({ skill, score }) => `<li><button type="button" data-action="practice-skill" data-skill="${skill.id}"><span><strong>${escapeHtml(skill.name)}</strong><small>${escapeHtml(trackById(skill.trackId).name)} · ${Math.round(score)}% on this evidence</small></span><span>Practice →</span></button></li>`).join('')}</ul></section><section class="results-section"><p class="eyebrow">Review queue</p><h2>Missed patterns worth revisiting</h2>${criticalMisses.length ? `<ul class="recommendation-list">${criticalMisses.map(({ question, score }) => `<li><button type="button" data-action="practice-skill" data-skill="${question.skillId}"><span><strong>${escapeHtml(question.title)}</strong><small>${Math.round(score * 100)}% evidence · ${escapeHtml(question.explanation)}</small></span><span>Review →</span></button></li>`).join('')}</ul>` : '<p>Excellent—every item has full evidence. Choose a harder practice filter or a retention check.</p>'}</section><div class="results-actions"><button class="button button-secondary" type="button" data-route="roadmap">Open my roadmap</button>${isDiagnostic ? '<button class="button button-primary" type="button" data-route="diagnostic">Choose a section gate →</button>' : `<button class="button button-primary" type="button" data-route="diagnostic">Return to assessment center →</button>`}</div></div>`;
    state.route = 'exam';
    for (const view of $$('.view')) view.hidden = view.dataset.view !== 'exam';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function renderRoadmap() {
    const hasEvidence = state.progress.attempts.length > 0;
    const cards = TRACKS.map((track) => {
      const score = state.progress.trackScores[track.id];
      const skillButtons = SKILLS.filter((skill) => skill.trackId === track.id).map((skill) => {
        const skillScore = state.progress.skillScores[skill.id];
        return `<button type="button" data-action="practice-skill" data-skill="${skill.id}" title="Practice ${escapeHtml(skill.name)}">${escapeHtml(skill.name)} ${skillScore === undefined ? '' : `${Math.round(skillScore)}%`}</button>`;
      }).join('');
      return `<article class="roadmap-card"><header><h2>${escapeHtml(track.name)}</h2><span class="band">${escapeHtml(band(score))}</span></header><div class="score-bar" aria-label="${escapeHtml(track.name)} score ${scoreLabel(score)}"><span style="width:${score ?? 0}%"></span></div><div class="score-row"><span>${track.skills.length} skills tracked</span><strong>${scoreLabel(score)}</strong></div><div class="skill-chips">${skillButtons}</div></article>`;
    }).join('');
    const nextSkill = state.progress.recommendedSkills[0] ? skillById(state.progress.recommendedSkills[0]) : skillById('dsa.arrays');
    $('#roadmap-content').innerHTML = hasEvidence ? `<div class="roadmap-overview"><div class="roadmap-cards">${cards}</div><aside class="next-steps"><p class="eyebrow">Recommended next</p><h2>${escapeHtml(nextSkill.name)}</h2><p>Start with the skill carrying the weakest current evidence. After targeted practice, take its track’s fresh 20-question gate.</p><ol><li>Write and test two drills.</li><li>Explain the invariant aloud.</li><li>Take a 12-coding / 8-MCQ section gate.</li></ol><button class="button button-primary" type="button" data-action="practice-skill" data-skill="${nextSkill.id}">Train ${escapeHtml(nextSkill.name)}</button></aside></div>` : `<div class="empty-state"><h2>Your roadmap appears after the general diagnostic.</h2><p>It will show separate evidence for C++, Python, interview patterns, LLD, and ML, rather than pretending a single score describes all of you.</p><button class="button button-primary" type="button" data-action="start-diagnostic">Take Diagnostic A →</button></div>`;
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(state.progress, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `forge-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    toast('Progress export downloaded.');
  }

  async function importProgress(file) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || parsed.version !== VERSION || !Array.isArray(parsed.attempts) || !Array.isArray(parsed.seenIds)) throw new Error('Unsupported file');
      state.progress = { ...BASE_PROGRESS(), ...parsed };
      state.latestResult = null;
      applyTheme();
      saveProgress();
      renderHome();
      if (state.route === 'diagnostic') renderAssessmentHub();
      if (state.route === 'practice') renderPractice();
      if (state.route === 'roadmap') renderRoadmap();
      if (state.route === 'exam') renderExam();
      toast('Progress imported into this browser.');
    } catch {
      toast('That file is not a compatible Forge progress export.', 'error');
    }
  }

  function openResetDialog() {
    const dialog = $('#confirmation-dialog');
    $('#dialog-title').textContent = 'Reset local progress?';
    $('#dialog-message').textContent = 'This clears saved attempts, recommendations, and any in-progress assessment from this browser. Export first if you want a backup.';
    const confirm = $('#dialog-confirm');
    const listener = () => {
      if (dialog.returnValue === 'confirm') {
        state.progress = BASE_PROGRESS();
        state.latestResult = null;
        applyTheme();
        saveProgress();
        setRoute('home');
        toast('Local progress reset.');
      }
      confirm.removeEventListener('click', listener);
    };
    confirm.addEventListener('click', listener);
    dialog.showModal();
  }

  function openPracticeForSkill(skillId) {
    const skill = skillById(skillId);
    if (!skill) return;
    state.practice.track = skill.trackId;
    state.practice.skill = skillId;
    state.practice.format = 'coding';
    state.practice.difficulty = 'all';
    state.practice.questionId = null;
    setRoute('practice');
  }

  function bindGlobalEvents() {
    document.addEventListener('click', (event) => {
      const routeTarget = event.target.closest('[data-route]');
      if (routeTarget) { setRoute(routeTarget.dataset.route); return; }
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) return;
      const { action, track, kind, skill } = actionTarget.dataset;
      if (action === 'start-diagnostic') startAssessment('diagnostic');
      if (action === 'start-section') startAssessment(kind, track);
      if (action === 'resume-exam') setRoute('exam');
      if (action === 'practice-track') {
        state.practice = { track, skill: 'all', format: 'coding', difficulty: 'all', questionId: null };
        setRoute('practice');
      }
      if (action === 'practice-skill') openPracticeForSkill(skill);
    });
    $('#theme-toggle').addEventListener('click', () => {
      state.progress.theme = state.progress.theme === 'night' ? 'paper' : 'night';
      applyTheme();
      saveProgress();
    });
    const dataMenuButton = $('#data-menu-button');
    dataMenuButton.addEventListener('click', () => {
      const menu = $('#data-menu');
      menu.hidden = !menu.hidden;
      dataMenuButton.setAttribute('aria-expanded', String(!menu.hidden));
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.header-actions')) { $('#data-menu').hidden = true; dataMenuButton.setAttribute('aria-expanded', 'false'); }
    });
    $('#export-progress').addEventListener('click', exportProgress);
    $('#import-progress').addEventListener('change', (event) => { if (event.target.files[0]) importProgress(event.target.files[0]); event.target.value = ''; });
    $('#reset-progress').addEventListener('click', openResetDialog);
    $('#surprise-me').addEventListener('click', () => { choosePracticeQuestion(true); renderPractice(); });
    $('#clear-filters').addEventListener('click', clearPracticeFilters);
  }

  function init() {
    applyTheme();
    bindGlobalEvents();
    renderHome();
    if (state.progress.activeExam) toast('An in-progress assessment is ready to resume.');
  }

  init();
})();
