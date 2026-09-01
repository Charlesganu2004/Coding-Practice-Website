/* python.js — Python lessons, drills and question bank.
 * Sections: py-core, py-data-model, py-stdlib-perf.
 * Each drill shows the C++ equivalent, so the two tracks reinforce each other.
 */
(function () {
  'use strict';

  const L = [
    {
      id: 'py-l1', track: 'python', section: 'py-core', tier: 'beginner', order: 1,
      title: 'Names, objects and binding',
      summary: 'Python has no variables in the C++ sense. It has names bound to objects.',
      minutes: 12,
      body: '<p>The single most useful mental model in Python: a name is a label tied to an object. Assignment does not copy anything, it re-points the label.</p>' +
        '<pre class="code">a = [1, 2, 3]\nb = a          # b labels the SAME list\nb.append(4)\nprint(a)       # [1, 2, 3, 4]  - surprising until the model clicks</pre>' +
        '<p>In C++ <code>auto b = a;</code> on a vector copies it. In Python it never does. To copy you must ask.</p>' +
        '<pre class="code">import copy\nb = a.copy()             # shallow: new list, same element objects\nb = copy.deepcopy(a)     # deep: new list, new elements all the way down</pre>' +
        '<h3>Mutable versus immutable</h3>' +
        '<p>Rebinding a name never affects other names. Mutating the object affects everyone who labels it.</p>' +
        '<pre class="code">a = [1, 2]\nb = a\nb = [9]        # rebinds b only; a is still [1, 2]\n\nb = a\nb.append(9)    # mutates the shared object; a is [1, 2, 9]</pre>' +
        '<p>Integers, floats, strings and tuples are immutable, so this distinction never bites you with them. Lists, dicts, sets and most of your own classes are mutable, so it always can.</p>' +
        '<h3>is versus ==</h3>' +
        '<pre class="code">a = [1, 2]\nb = [1, 2]\na == b   # True  - same contents\na is b   # False - different objects\n\n# COMMON MISTAKE\nif x is 256:   # works by accident: small ints are cached\nif x is 257:   # False even when x == 257\n\n# FIX: use is only for None, True, False\nif x == 257: ...\nif x is None: ...</pre>'
    },
    {
      id: 'py-l2', track: 'python', section: 'py-core', tier: 'intermediate', order: 2,
      title: 'Functions, defaults and closures',
      summary: 'The mutable-default trap and the late-binding closure trap, both explained.',
      minutes: 13,
      body: '<h3>The mutable default argument</h3>' +
        '<p>Default arguments are evaluated <em>once</em>, when the function is defined — not on each call.</p>' +
        '<pre class="code"># COMMON MISTAKE\ndef add(item, bucket=[]):\n    bucket.append(item)\n    return bucket\n\nadd(1)   # [1]\nadd(2)   # [1, 2]   - the same list, still there\n\n# FIX\ndef add(item, bucket=None):\n    if bucket is None:\n        bucket = []\n    bucket.append(item)\n    return bucket</pre>' +
        '<h3>Late binding in closures</h3>' +
        '<p>A closure captures the <em>name</em>, not the value at capture time.</p>' +
        '<pre class="code"># COMMON MISTAKE: all three print 2\nfuncs = [lambda: print(i) for i in range(3)]\nfor f in funcs: f()      # 2, 2, 2\n\n# FIX: bind the value now, via a default argument\nfuncs = [lambda i=i: print(i) for i in range(3)]\nfor f in funcs: f()      # 0, 1, 2</pre>' +
        '<p>C++ lambdas make this choice explicit in the capture list: <code>[&amp;i]</code> is Python\'s behaviour, <code>[i]</code> is the fix.</p>' +
        '<h3>*args and **kwargs</h3>' +
        '<pre class="code">def f(*args, **kwargs):\n    # args is a tuple, kwargs is a dict\n    ...\n\ndef g(a, b, *, key=None):   # key is keyword-only\n    ...\n\nvalues = [1, 2]\nf(*values)                  # unpack positionally</pre>'
    },
    {
      id: 'py-l3', track: 'python', section: 'py-core', tier: 'intermediate', order: 3,
      title: 'Comprehensions and generators',
      summary: 'Building sequences declaratively, and not building them at all.',
      minutes: 11,
      body: '<h3>Comprehensions</h3>' +
        '<pre class="code">squares  = [x*x for x in range(10)]\nevens    = [x for x in data if x % 2 == 0]\nlookup   = {k: v for k, v in pairs}\nuniq     = {x.lower() for x in words}\n\n# nested reads in the same order you would write the loops\nflat = [x for row in matrix for x in row]</pre>' +
        '<h3>Generators: the same thing, lazily</h3>' +
        '<pre class="code">squares = (x*x for x in range(10))   # parentheses, not brackets\n\ndef read_lines(path):\n    with open(path) as f:\n        for line in f:\n            yield line.rstrip()      # one line in memory at a time</pre>' +
        '<p>A generator computes each value on demand. That makes it the right tool for large or infinite sequences, and for pipelines where you only need the first few results.</p>' +
        '<pre class="code">total = sum(x*x for x in range(10_000_000))   # no list is ever built</pre>' +
        '<h3>The exhaustion trap</h3>' +
        '<pre class="code">g = (x for x in range(3))\nprint(list(g))   # [0, 1, 2]\nprint(list(g))   # []  - COMMON MISTAKE: a generator is consumed once</pre>' +
        '<p>This is exactly a C++20 range view: lazy, single-pass, no intermediate container.</p>'
    },
    {
      id: 'py-l4', track: 'python', section: 'py-data-model', tier: 'advanced', order: 1,
      title: 'The data model: dunder methods',
      summary: 'How to make your class behave like a built-in type.',
      minutes: 14,
      body: '<p>Python\'s syntax is a set of hooks. <code>len(x)</code> calls <code>x.__len__()</code>, <code>a + b</code> calls <code>a.__add__(b)</code>. Implement the hook and your type participates in the language.</p>' +
        '<pre class="code">class Vec:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    def __repr__(self):                 # for developers; aim to be unambiguous\n        return f"Vec({self.x}, {self.y})"\n\n    def __eq__(self, other):\n        if not isinstance(other, Vec):\n            return NotImplemented\n        return (self.x, self.y) == (other.x, other.y)\n\n    def __hash__(self):                 # REQUIRED if you define __eq__\n        return hash((self.x, self.y))\n\n    def __add__(self, other):\n        return Vec(self.x + other.x, self.y + other.y)\n\n    def __len__(self):\n        return 2</pre>' +
        '<h3>The __eq__ / __hash__ contract</h3>' +
        '<p>Defining <code>__eq__</code> sets <code>__hash__</code> to None, making your class unhashable and unusable in sets or as dict keys. That is deliberate: two objects that compare equal <em>must</em> hash equal, so Python makes you confirm the pair.</p>' +
        '<p>The rule mirrors C++ exactly: a type used as an <code>unordered_map</code> key needs both <code>operator==</code> and a <code>std::hash</code> specialisation, and they must agree.</p>' +
        '<h3>Hash only immutable state</h3>' +
        '<pre class="code"># COMMON MISTAKE: hashing a mutable field\nclass Bad:\n    def __hash__(self): return hash(self.items)   # items is a list -> TypeError\n\n# and even if it worked: mutating after insertion loses the object in the set</pre>'
    },
    {
      id: 'py-l5', track: 'python', section: 'py-data-model', tier: 'master', order: 2,
      title: 'Decorators and context managers',
      summary: 'Two ways to wrap behaviour, built from first principles.',
      minutes: 14,
      body: '<h3>A decorator is a function that returns a function</h3>' +
        '<pre class="code">import functools, time\n\ndef timed(fn):\n    @functools.wraps(fn)          # keeps __name__, __doc__, signature\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        try:\n            return fn(*args, **kwargs)\n        finally:\n            print(f"{fn.__name__} took {time.perf_counter() - start:.3f}s")\n    return wrapper\n\n@timed\ndef work(): ...\n\n# @timed is exactly:  work = timed(work)</pre>' +
        '<p>Omitting <code>functools.wraps</code> is the classic mistake: the decorated function reports itself as <code>wrapper</code>, which breaks introspection, documentation tools and debuggers.</p>' +
        '<h3>Context managers</h3>' +
        '<pre class="code">class Timer:\n    def __enter__(self):\n        self.start = time.perf_counter()\n        return self\n\n    def __exit__(self, exc_type, exc, tb):\n        self.elapsed = time.perf_counter() - self.start\n        return False          # False: do not swallow the exception\n\nwith Timer() as t:\n    work()\nprint(t.elapsed)</pre>' +
        '<pre class="code">from contextlib import contextmanager\n\n@contextmanager\ndef timer():\n    start = time.perf_counter()\n    try:\n        yield\n    finally:\n        print(time.perf_counter() - start)   # runs even if the body raises</pre>' +
        '<p>The <code>try/finally</code> is essential — without it the cleanup is skipped on an exception, which is the whole reason the construct exists. This is Python\'s RAII: <code>__exit__</code> is the destructor, and <code>with</code> is the scope.</p>' +
        '<h3>Returning True from __exit__</h3>' +
        '<p>Returning a truthy value <em>suppresses</em> the exception. That is almost never what you want, and doing it by accident silently swallows errors.</p>'
    },
    {
      id: 'py-l6', track: 'python', section: 'py-stdlib-perf', tier: 'advanced', order: 1,
      title: 'Complexity of the built-ins, and the GIL',
      summary: 'Which operations are secretly O(n), and when threads actually help.',
      minutes: 13,
      body: '<h3>The complexity table worth memorising</h3>' +
        '<table><thead><tr><th>Operation</th><th>Cost</th></tr></thead><tbody>' +
        '<tr><td>list index, append, pop()</td><td>O(1)</td></tr>' +
        '<tr><td>list insert(0, x), pop(0)</td><td><b>O(n)</b> — shifts everything</td></tr>' +
        '<tr><td>x in list</td><td><b>O(n)</b></td></tr>' +
        '<tr><td>x in set / dict</td><td>O(1) average</td></tr>' +
        '<tr><td>deque appendleft / popleft</td><td>O(1)</td></tr>' +
        '<tr><td>str += in a loop</td><td><b>O(n^2)</b> overall — strings are immutable</td></tr>' +
        '</tbody></table>' +
        '<pre class="code"># COMMON MISTAKE: quadratic queue\nqueue = []\nqueue.pop(0)                 # O(n) every call\n\n# FIX\nfrom collections import deque\nqueue = deque()\nqueue.popleft()              # O(1)\n\n# COMMON MISTAKE: quadratic string building\nout = ""\nfor s in parts: out += s\n\n# FIX\nout = "".join(parts)</pre>' +
        '<h3>Membership testing</h3>' +
        '<pre class="code"># O(n) per check, O(n*m) overall\nif item in big_list: ...\n\n# build once, then O(1) per check\nlookup = set(big_list)\nif item in lookup: ...</pre>' +
        '<h3>The GIL</h3>' +
        '<p>CPython allows only one thread to execute bytecode at a time. So:</p>' +
        '<ul><li><b>CPU-bound</b> work gets no speedup from threads. Use <code>multiprocessing</code> or a native extension.</li>' +
        '<li><b>I/O-bound</b> work does benefit, because the lock is released while waiting on the network or disk. Threads or <code>asyncio</code> both work.</li></ul>' +
        '<p>C++ has no such restriction: <code>std::thread</code> gives real parallelism, and the corresponding hazard is that you must synchronise shared state yourself.</p>'
    }
  ];

  const P = [
    {
      id: 'py-p1', title: 'Fix the Mutable Default', section: 'py-core',
      tier: 'intermediate', difficulty: 'Easy',
      prompt: 'This function is meant to return a fresh list each time it is called without a bucket, but it accumulates across calls.\n\nFix it.\n\n    def collect(item, bucket=[]):\n        bucket.append(item)\n        return bucket',
      examples: [
        { in: 'collect(1); collect(2)', out: '[1] then [2]', why: 'Each call without a bucket must start from empty.' },
        { in: 'collect(3, [9])', out: '[9, 3]', why: 'An explicitly passed bucket is still appended to.' }
      ],
      constraints: ['Calling without a bucket must start empty every time.', 'Passing a bucket must still work.'],
      approach: 'Default arguments are evaluated once, at function definition time, and the resulting object is reused for every call that does not supply one. A mutable default therefore becomes shared state that persists across calls. The idiom is to default to None, which is immutable and harmless, and create the real container inside the body when the caller did not supply one. Test the sentinel with `is None` rather than a truthiness check, because an explicitly passed empty list is falsy and would be wrongly replaced.',
      keyInsight: 'The default object is created once at def time, not per call. Default to None and build the container in the body.',
      pitfalls: [
        'Using `if not bucket:` instead of `if bucket is None:`, which silently replaces a caller-supplied empty list.',
        'Copying the default with `bucket=list(bucket)`, which breaks the caller\'s expectation that their list is appended to.'
      ],
      complexity: { time: 'O(1)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: { python: 'def collect(item, bucket=None):\n    # start fresh when no bucket was given\n    pass', cpp: '#include <vector>\n#include <optional>\n\nstd::vector<int> collect(int item, std::optional<std::vector<int>> bucket = std::nullopt);' },
      solution: {
        python: 'def collect(item, bucket=None):\n    if bucket is None:      # `is None`, not `not bucket`\n        bucket = []\n    bucket.append(item)\n    return bucket',
        cpp: '#include <vector>\n#include <optional>\n\n// C++ default arguments are re-evaluated on every call, so this trap\n// does not exist. optional expresses "the caller may omit this".\nstd::vector<int> collect(int item,\n                         std::optional<std::vector<int>> bucket = std::nullopt) {\n    std::vector<int> out = bucket.value_or(std::vector<int>{});\n    out.push_back(item);\n    return out;\n}'
      },
      checks: {
        python: [{ re: 'bucket\\s*=\\s*None|=\\s*None', hint: 'Default to None rather than a list.' }, { re: 'is\\s+None', hint: 'Test the sentinel with `is None`.' }, { re: 'append', hint: 'Append the item.' }, { re: 'return', hint: 'Return the bucket.' }],
        cpp: [{ re: 'optional|vector', hint: 'Express the optional bucket.' }, { re: 'push_back', hint: 'Append the item.' }, { re: 'return', hint: 'Return the bucket.' }]
      },
      antiChecks: { python: [{ re: 'def\\s+\\w+\\s*\\([^)]*=\\s*\\[\\s*\\]', hint: 'That is the original bug — a mutable default.' }], cpp: [] },
      mcq: [
        { q: 'Why is `if not bucket:` the wrong test here?', opts: ['It is slower', 'An explicitly passed empty list is falsy, so it would be silently replaced by a different list', 'It raises on None', 'It only works for dicts'], correct: 1, why: 'The caller passed a list expecting it to be appended to. Treating empty as absent quietly hands them back a different object.' },
        { q: 'Why does C++ not have this trap?', opts: ['C++ has no default arguments', 'C++ default arguments are re-evaluated at each call site rather than stored once on the function object', 'C++ copies all arguments', 'It does have it'], correct: 1, why: 'The default expression is substituted at the call, so a default of `{}` constructs a fresh empty container every time.' }
      ]
    },
    {
      id: 'py-p2', title: 'Consistent __eq__ and __hash__', section: 'py-data-model',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Write a Point class with x and y that compares by value and can be used in a set or as a dict key.\n\nTwo points with the same coordinates must be equal and must hash the same.',
      examples: [
        { in: 'Point(1,2) == Point(1,2)', out: 'True', why: 'Equality compares coordinates, not identity.' },
        { in: 'len({Point(1,2), Point(1,2)})', out: '1', why: 'Equal objects must hash equally, or the set would hold both.' },
        { in: 'Point(1,2) == "not a point"', out: 'False', why: 'Returning NotImplemented lets Python fall back and answer False rather than raising.' }
      ],
      constraints: ['Equal points must hash equal.', 'Comparing to an unrelated type must not raise.'],
      approach: 'Defining __eq__ sets __hash__ to None, so the class becomes unhashable until you define __hash__ too. That is Python enforcing the contract that equal objects hash equally. Build both from the same tuple of fields so they can never drift apart: compare the tuples in __eq__ and hash the tuple in __hash__. For the type check, return NotImplemented rather than False when the other operand is an unrelated type — that tells Python to try the reflected operation, and only then fall back to identity comparison, which is what makes `Point(1,2) == "x"` yield False instead of raising.',
      keyInsight: 'Derive __eq__ and __hash__ from the same tuple of fields, and hash only immutable state.',
      pitfalls: [
        'Defining __eq__ without __hash__, which makes the class unusable in a set.',
        'Returning False instead of NotImplemented for foreign types, which breaks reflected comparison.',
        'Hashing a mutable field, so an object changes hash after being inserted and can no longer be found.'
      ],
      complexity: { time: 'O(1)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: { python: 'class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    # __eq__, __hash__, __repr__', cpp: '#include <functional>\n\nstruct Point {\n    int x, y;\n    // operator== and a std::hash specialisation\n};' },
      solution: {
        python: 'class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    def _key(self):\n        return (self.x, self.y)      # one source of truth for both\n\n    def __eq__(self, other):\n        if not isinstance(other, Point):\n            return NotImplemented    # let Python fall back, do not raise\n        return self._key() == other._key()\n\n    def __hash__(self):\n        return hash(self._key())\n\n    def __repr__(self):\n        return f"Point({self.x}, {self.y})"',
        cpp: '#include <functional>\n#include <cstddef>\n\nstruct Point {\n    int x, y;\n\n    bool operator==(const Point& o) const { return x == o.x && y == o.y; }\n};\n\n// The same contract, spelled explicitly: unordered containers need both.\nnamespace std {\n    template <>\n    struct hash<Point> {\n        size_t operator()(const Point& p) const noexcept {\n            return hash<int>{}(p.x) ^ (hash<int>{}(p.y) << 1);\n        }\n    };\n}'
      },
      checks: {
        python: [{ re: '__eq__', hint: 'Define __eq__.' }, { re: '__hash__', hint: 'Define __hash__ so the class stays hashable.' }, { re: 'NotImplemented|isinstance', hint: 'Handle comparison against a foreign type.' }, { re: 'hash\\s*\\(', hint: 'Hash the field tuple.' }],
        cpp: [{ re: 'operator==', hint: 'Define operator==.' }, { re: 'hash', hint: 'Provide a std::hash specialisation.' }, { re: 'struct|class', hint: 'Keep the type.' }]
      },
      antiChecks: { python: [], cpp: [] },
      mcq: [
        { q: 'What happens if you define __eq__ but not __hash__?', opts: ['Nothing, the default hash is kept', 'Python sets __hash__ to None, so instances cannot go in a set or be dict keys', 'Hashing falls back to id()', 'It is a syntax error'], correct: 1, why: 'The default hash is identity-based and would contradict value equality. Python removes it rather than let you silently violate the contract.' },
        { q: 'Why return NotImplemented rather than False for a foreign type?', opts: ['It is faster', 'It lets Python try the reflected operation on the other operand before concluding they are unequal', 'It raises a clearer error', 'They are equivalent'], correct: 1, why: 'Returning False asserts inequality outright. NotImplemented says "I do not know", so the other type gets a chance to answer, which matters for subclasses and interoperating types.' }
      ]
    },
    {
      id: 'py-p3', title: 'A Context Manager, Two Ways', section: 'py-data-model',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Write a context manager that records how long the block took, and that still records it when the block raises.\n\nIt must not swallow the exception.',
      examples: [
        { in: 'with Timer() as t: work()', out: 't.elapsed is set', why: 'The measurement is taken on exit.' },
        { in: 'the block raises', out: 'elapsed still recorded, exception still propagates', why: '__exit__ must run cleanup but return a falsy value.' }
      ],
      constraints: ['Timing must be recorded on every exit path.', 'Exceptions must propagate.'],
      approach: 'The protocol is __enter__, whose return value is bound by `as`, and __exit__, which receives the exception triple and runs on every exit path. The critical detail is the return value of __exit__: any truthy value suppresses the exception, so returning None or False is what lets errors propagate normally. In the generator form with @contextmanager, the equivalent guarantee comes from wrapping the yield in try/finally — without the finally, an exception in the body skips the cleanup entirely, which defeats the purpose.',
      keyInsight: '__exit__ returning truthy swallows the exception. Return None, and wrap the generator form in try/finally.',
      pitfalls: [
        'Returning True from __exit__, silently hiding every error raised in the block.',
        'Using @contextmanager without try/finally, so cleanup is skipped on an exception.',
        'Doing the timing in __enter__ only, so a raising block records nothing.'
      ],
      complexity: { time: 'O(1)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: { python: 'import time\n\nclass Timer:\n    def __enter__(self):\n        pass\n\n    def __exit__(self, exc_type, exc, tb):\n        pass', cpp: '#include <chrono>\n\nclass Timer {\n    // RAII: start in the constructor, stop in the destructor\n};' },
      solution: {
        python: 'import time\nfrom contextlib import contextmanager\n\nclass Timer:\n    def __enter__(self):\n        self.start = time.perf_counter()\n        return self\n\n    def __exit__(self, exc_type, exc, tb):\n        self.elapsed = time.perf_counter() - self.start\n        return False        # falsy: the exception keeps propagating\n\n\n@contextmanager\ndef timer():\n    start = time.perf_counter()\n    try:\n        yield\n    finally:\n        # finally is what makes this run when the body raises\n        print(time.perf_counter() - start)',
        cpp: '#include <chrono>\n\n// C++ needs no protocol: the destructor already runs on every exit path,\n// including stack unwinding. This IS the context manager.\nclass Timer {\n    std::chrono::steady_clock::time_point start_;\n    double* out_;\npublic:\n    explicit Timer(double* out)\n        : start_(std::chrono::steady_clock::now()), out_(out) {}\n\n    ~Timer() {\n        std::chrono::duration<double> d =\n            std::chrono::steady_clock::now() - start_;\n        if (out_) *out_ = d.count();\n    }\n};'
      },
      checks: {
        python: [{ re: '__enter__', hint: 'Implement __enter__.' }, { re: '__exit__|finally', hint: 'Implement __exit__, or use try/finally in the generator form.' }, { re: 'return\\s+self|yield', hint: 'Return the object from __enter__ (or yield).' }, { re: 'perf_counter|time', hint: 'Record the time.' }],
        cpp: [{ re: '~\\w+\\s*\\(', hint: 'Do the cleanup in the destructor.' }, { re: 'chrono|clock', hint: 'Record the time.' }]
      },
      antiChecks: { python: [{ re: 'return\\s+True', hint: 'Returning True from __exit__ swallows the exception.' }], cpp: [] },
      mcq: [
        { q: 'What does returning True from __exit__ do?', opts: ['Signals success', 'Suppresses any exception raised in the with block', 'Re-raises the exception', 'Nothing'], correct: 1, why: 'A truthy return tells Python the exception has been handled, so it stops propagating. Doing this accidentally hides real failures.' },
        { q: 'Why must the @contextmanager form wrap yield in try/finally?', opts: ['For readability', 'An exception in the body propagates out through the yield, so without finally the cleanup after it never runs', 'To catch StopIteration', 'It is optional'], correct: 1, why: 'The exception is thrown into the generator at the yield point. Only a finally guarantees the cleanup executes on that path.' }
      ]
    },
    {
      id: 'py-p4', title: 'Kill the Quadratic Queue', section: 'py-stdlib-perf',
      tier: 'intermediate', difficulty: 'Easy',
      prompt: 'This BFS-style drain is O(n^2) because of one line.\n\nRewrite it to be O(n).\n\n    def drain(items):\n        queue = list(items)\n        out = []\n        while queue:\n            out.append(queue.pop(0))\n        return out',
      examples: [
        { in: 'drain([1,2,3])', out: '[1, 2, 3]', why: 'Order is preserved — it is still FIFO.' },
        { in: 'drain(range(100000))', out: 'completes quickly', why: 'With pop(0) on a list this takes quadratic time.' }
      ],
      constraints: ['Must remain FIFO.', 'Must be O(n) overall.'],
      approach: 'A Python list is a contiguous array, so removing the first element shifts every remaining element down by one — O(n) per call, O(n^2) across the drain. collections.deque is a doubly linked block structure with O(1) removal at both ends, so popleft makes the whole loop linear. This is the single most common accidental quadratic in Python, and it appears constantly in BFS implementations where the queue is the core data structure. The C++ analogue is the same: std::vector::erase(begin()) is O(n) and std::deque::pop_front is O(1).',
      keyInsight: 'list.pop(0) shifts the whole array. deque.popleft() is O(1). BFS needs a deque.',
      pitfalls: [
        'Using list.insert(0, x) for the same reason, which is equally O(n).',
        'Reversing the list and using pop() — correct and O(n), but it inverts the order unless you reverse again.',
        'Reaching for queue.Queue, which is thread-safe and much slower for single-threaded use.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 2,
      starter: { python: 'from collections import deque\n\ndef drain(items):\n    # make this linear\n    pass', cpp: '#include <deque>\n#include <vector>\n\nstd::vector<int> drain(const std::vector<int>& items);' },
      solution: {
        python: 'from collections import deque\n\ndef drain(items):\n    queue = deque(items)\n    out = []\n    while queue:\n        out.append(queue.popleft())   # O(1) instead of O(n)\n    return out',
        cpp: '#include <deque>\n#include <vector>\n\nstd::vector<int> drain(const std::vector<int>& items) {\n    std::deque<int> queue(items.begin(), items.end());\n    std::vector<int> out;\n    out.reserve(items.size());\n    while (!queue.empty()) {\n        out.push_back(queue.front());   // pop_front is O(1);\n        queue.pop_front();              // vector::erase(begin()) would be O(n)\n    }\n    return out;\n}'
      },
      checks: {
        python: [{ re: 'deque', hint: 'Use collections.deque.' }, { re: 'popleft', hint: 'Remove from the left in O(1).' }, { re: 'return', hint: 'Return the drained list.' }],
        cpp: [{ re: 'deque', hint: 'Use std::deque.' }, { re: 'pop_front', hint: 'Remove from the front in O(1).' }, { re: 'return', hint: 'Return the result.' }]
      },
      antiChecks: {
        python: [{ re: '\\.pop\\s*\\(\\s*0\\s*\\)', hint: 'pop(0) on a list is the O(n) operation we are removing.' }],
        cpp: [{ re: 'erase\\s*\\(\\s*\\w*\\.?begin', hint: 'erase(begin()) on a vector is O(n).' }]
      },
      mcq: [
        { q: 'Why is list.pop(0) O(n)?', opts: ['It searches for the element', 'A list is a contiguous array, so every remaining element must shift down one slot', 'It reallocates the whole list', 'It is actually O(1)'], correct: 1, why: 'Indexing is O(1) precisely because the elements are contiguous, and that same layout is what makes front removal require shifting everything.' },
        { q: 'When is queue.Queue the right choice over deque?', opts: ['Always, it is safer', 'Only when several threads share the queue and you need blocking and locking', 'When the queue is large', 'Never'], correct: 1, why: 'queue.Queue adds locks and blocking semantics for producer/consumer threading. In single-threaded code that overhead buys nothing.' }
      ]
    },
    {
      id: 'py-p5', title: 'Memoise with lru_cache', section: 'py-stdlib-perf',
      tier: 'intermediate', difficulty: 'Easy',
      prompt: 'Naive recursive Fibonacci recomputes the same values exponentially often.\n\nMake it linear without restructuring the recursion.',
      examples: [
        { in: 'fib(10)', out: '55', why: 'Standard definition with fib(0)=0, fib(1)=1.' },
        { in: 'fib(40)', out: '102334155, returned instantly', why: 'Without caching this is roughly a billion calls.' }
      ],
      constraints: ['Keep the recursive shape.', 'Must be O(n) with caching.'],
      approach: 'The recursion tree of naive Fibonacci recomputes fib(k) an exponential number of times, but the function is pure: the same argument always gives the same answer. That is exactly the precondition for memoisation. functools.lru_cache stores results keyed by the argument tuple, so each distinct n is computed once and every later call is a dict lookup, collapsing the exponential tree to O(n). The cache requires hashable arguments, which is why it works here and would not for a function taking a list. C++ has no decorator, so the equivalent is an explicit static table.',
      keyInsight: 'Memoisation applies to pure functions with hashable arguments. lru_cache is one line and turns the exponential tree into O(n).',
      pitfalls: [
        'Applying lru_cache to a function whose arguments are lists or dicts — unhashable, so it raises.',
        'Caching a function that reads mutable global state, so stale answers are returned.',
        'Using an unbounded cache on a hot path with unbounded argument variety, which leaks memory.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(n)', 'O(n log n)', 'O(2^n)'], timeAnswer: 1,
      starter: { python: 'def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)', cpp: '#include <unordered_map>\n\nlong long fib(int n);' },
      solution: {
        python: 'from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)',
        cpp: '#include <unordered_map>\n\nlong long fib(int n) {\n    static std::unordered_map<int, long long> memo;   // the explicit cache\n    if (n <= 1) return n;\n    auto it = memo.find(n);\n    if (it != memo.end()) return it->second;\n    long long v = fib(n - 1) + fib(n - 2);\n    memo[n] = v;\n    return v;\n}'
      },
      checks: {
        python: [{ re: 'lru_cache|cache|memo', hint: 'Add memoisation.' }, { re: 'def\\s+fib', hint: 'Keep the recursive function.' }, { re: 'return', hint: 'Return the result.' }],
        cpp: [{ re: 'unordered_map|map|static|memo|\\[\\]', hint: 'Cache computed values.' }, { re: 'fib', hint: 'Keep the recursive function.' }, { re: 'return', hint: 'Return the result.' }]
      },
      antiChecks: { python: [], cpp: [] },
      mcq: [
        { q: 'What property must a function have for memoisation to be correct?', opts: ['It must be recursive', 'It must be pure — same arguments always give the same result, with no side effects that matter', 'It must return integers', 'It must be fast'], correct: 1, why: 'Caching replaces a call with a stored answer. If the function depends on mutable state or has side effects, skipping the call changes behaviour.' },
        { q: 'Why does lru_cache reject a function called with a list argument?', opts: ['Lists are too large', 'Cache keys must be hashable, and lists are mutable and therefore unhashable', 'It only supports integers', 'It does not reject them'], correct: 1, why: 'The cache is a dict keyed by the arguments. A mutable key could change after insertion, so Python forbids hashing it — pass a tuple instead.' }
      ]
    },
    {
      id: 'py-p6', title: 'Flatten Nested Data Lazily', section: 'py-core',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Write a generator that yields every non-list element from an arbitrarily nested list, in order, without building an intermediate flattened list.',
      examples: [
        { in: '[1, [2, [3, 4]], 5]', out: '1, 2, 3, 4, 5', why: 'Depth is arbitrary, so the traversal must recurse.' },
        { in: '[[], [[]], 1]', out: '1', why: 'Empty nestings contribute nothing but must not break the walk.' }
      ],
      constraints: ['Must be a generator — no full list built.', 'Handles arbitrary nesting depth.', 'Preserves order.'],
      approach: 'Recurse over the structure and yield leaves. For each element, if it is itself a list, delegate to a recursive call with `yield from`, which forwards every value the sub-generator produces without materialising them; otherwise yield the element directly. Because nothing is accumulated, memory is O(depth) for the call stack rather than O(n) for the output, and a consumer that only needs the first few values never pays for the rest. Note that `yield from` is not just sugar for a loop — it also forwards send and throw, which matters for coroutine-style generators.',
      keyInsight: '`yield from` delegates to a sub-generator, letting a recursive walk stay lazy end to end.',
      pitfalls: [
        'Returning a list instead of yielding, which defeats the laziness the problem asks for.',
        'Treating strings as iterables and recursing into them forever, one character at a time.',
        'Using `yield` instead of `yield from` on the recursive call, which yields the generator object rather than its values.'
      ],
      complexity: { time: 'O(n)', space: 'O(d)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 2,
      starter: { python: 'def flatten(nested):\n    """Yield each leaf in order."""\n    pass', cpp: '#include <vector>\n#include <variant>\n\n// C++ has no generators before coroutines; collect into an output vector.' },
      solution: {
        python: 'def flatten(nested):\n    for item in nested:\n        if isinstance(item, list):\n            yield from flatten(item)   # delegate, stay lazy\n        else:\n            yield item',
        cpp: '#include <vector>\n#include <variant>\n\n// A nested structure needs an explicit sum type in C++.\nstruct Node;\nusing Value = std::variant<int, std::vector<Node>>;\nstruct Node { Value v; };\n\n// Without coroutines the idiomatic form collects into an output parameter,\n// which is eager — the closest eager equivalent of the Python generator.\nvoid flatten(const std::vector<Node>& nested, std::vector<int>& out) {\n    for (const auto& n : nested) {\n        if (std::holds_alternative<int>(n.v))\n            out.push_back(std::get<int>(n.v));\n        else\n            flatten(std::get<std::vector<Node>>(n.v), out);\n    }\n}'
      },
      checks: {
        python: [{ re: 'yield', hint: 'It must be a generator.' }, { re: 'yield\\s+from|for\\s.*flatten', hint: 'Recurse into nested lists.' }, { re: 'isinstance|type\\s*\\(', hint: 'Distinguish a nested list from a leaf.' }],
        cpp: [{ re: 'variant|holds_alternative|vector', hint: 'Model the nested structure.' }, { re: 'flatten', hint: 'Recurse into nested elements.' }, { re: 'push_back', hint: 'Collect the leaves.' }]
      },
      antiChecks: { python: [{ re: 'return\\s+\\[', hint: 'Returning a list defeats the laziness this problem is about.' }], cpp: [] },
      mcq: [
        { q: 'What does `yield from sub` do that `yield sub` does not?', opts: ['Nothing, they are the same', 'It yields each value the sub-generator produces, rather than yielding the generator object itself', 'It sorts the values', 'It flattens only one level'], correct: 1, why: 'Plain yield hands the caller a generator object. yield from iterates it and forwards every value, and also forwards send and throw.' },
        { q: 'Why does treating strings as iterables break this?', opts: ['Strings are immutable', 'Iterating a string yields one-character strings, which are themselves iterable, so the recursion never bottoms out', 'Strings cannot be yielded', 'It does not break'], correct: 1, why: 'A single character is still a string, so a purely iterable-based test recurses forever. Checking specifically for list avoids it.' }
      ]
    }
  ];

  const Q = [
    { id: 'q-py-001', section: 'py-core', tier: 'beginner', topic: 'binding',
      q: 'After `a = [1,2]; b = a; b.append(3)`, what is a?',
      opts: ['[1, 2]', '[1, 2, 3]', '[3]', 'It raises'],
      correct: 1, why: 'Assignment binds a second name to the same list object. append mutates that shared object, so both names see the change.' },

    { id: 'q-py-002', section: 'py-core', tier: 'beginner', topic: 'is vs ==',
      q: 'When should you use `is` rather than `==`?',
      opts: ['For all comparisons, it is faster', 'Only when comparing against None, True or False — that is, when you mean identity', 'For strings and numbers', 'Never'],
      correct: 1, why: '`is` tests whether two names refer to the same object. It appears to work for small ints and interned strings because of caching, then fails silently for larger values.' },

    { id: 'q-py-003', section: 'py-core', tier: 'intermediate', topic: 'defaults',
      q: 'When is a default argument expression evaluated?',
      opts: ['On every call', 'Once, when the def statement executes', 'On the first call only', 'When the module is imported by another module'],
      correct: 1, why: 'The default is computed once and stored on the function object. That is why a mutable default becomes shared state across calls.' },

    { id: 'q-py-004', section: 'py-core', tier: 'advanced', topic: 'closures',
      q: '`fs = [lambda: i for i in range(3)]`. What does `[f() for f in fs]` give?',
      opts: ['[0, 1, 2]', '[2, 2, 2]', '[0, 0, 0]', 'It raises'],
      correct: 1, why: 'The closures capture the name i, not its value. By the time they are called the loop has finished and i is 2. Bind eagerly with a default argument to fix it.' },

    { id: 'q-py-005', section: 'py-core', tier: 'intermediate', topic: 'generators',
      q: 'What happens when you iterate the same generator twice?',
      opts: ['It restarts from the beginning', 'The second iteration is empty, because a generator is consumed once', 'It raises StopIteration immediately on the first', 'It caches and replays'],
      correct: 1, why: 'A generator holds a single suspended execution. Once exhausted it stays exhausted; to iterate again you must call the generator function to create a new one.' },

    { id: 'q-py-006', section: 'py-core', tier: 'intermediate', topic: 'comprehensions',
      q: 'What is the memory difference between `[x*x for x in big]` and `(x*x for x in big)`?',
      opts: ['None', 'The brackets build the whole list in memory; the parentheses produce a lazy generator that holds one value at a time', 'The parentheses build a tuple', 'The brackets are lazy'],
      correct: 1, why: 'A list comprehension materialises every element. A generator expression computes them on demand, which is what lets you sum ten million squares without allocating.' },

    { id: 'q-py-007', section: 'py-core', tier: 'advanced', topic: 'copying',
      q: 'What does `copy.copy(obj)` do for a list of lists?',
      opts: ['Copies everything recursively', 'Creates a new outer list whose elements are the same inner list objects', 'Returns the same object', 'Raises for nested structures'],
      correct: 1, why: 'A shallow copy duplicates one level. Mutating an inner list is visible through both outer lists; copy.deepcopy is what recurses.' },

    { id: 'q-py-008', section: 'py-core', tier: 'master', topic: 'exceptions',
      q: 'Why is a bare `except:` discouraged?',
      opts: ['It is slower', 'It catches KeyboardInterrupt and SystemExit too, so it swallows Ctrl-C and shutdown signals', 'It cannot access the exception object', 'It only catches the first exception'],
      correct: 1, why: 'Those inherit from BaseException, not Exception. Catching them makes a program unkillable and hides real control flow; catch Exception, or the specific type.' },

    { id: 'q-py-009', section: 'py-data-model', tier: 'advanced', topic: 'dunder',
      q: 'Which method does `len(x)` call?',
      opts: ['x.length()', 'x.__len__()', 'x.size()', 'x.__size__()'],
      correct: 1, why: 'Built-in syntax maps onto dunder hooks. Implementing __len__ makes your type work with len(), and also makes it falsy when it returns 0.' },

    { id: 'q-py-010', section: 'py-data-model', tier: 'advanced', topic: 'hashing',
      q: 'You define __eq__ on a class and then put instances in a set. What happens?',
      opts: ['It works normally', 'TypeError: unhashable type, because defining __eq__ sets __hash__ to None', 'Instances compare by identity in the set', 'The set silently deduplicates wrongly'],
      correct: 1, why: 'Value equality without a matching hash would break the set invariant, so Python removes the inherited hash and makes you supply a consistent one.' },

    { id: 'q-py-011', section: 'py-data-model', tier: 'advanced', topic: 'repr',
      q: 'What distinguishes __repr__ from __str__?',
      opts: ['They are identical', '__repr__ targets developers and should be unambiguous; __str__ targets end users and should be readable', '__str__ is for debugging', '__repr__ must return bytes'],
      correct: 1, why: 'repr() is what the REPL and debuggers show, so it should say precisely what the object is. If you write only one, write __repr__ — str() falls back to it.' },

    { id: 'q-py-012', section: 'py-data-model', tier: 'master', topic: 'decorators',
      q: 'What does functools.wraps preserve?',
      opts: ['The return value', 'The wrapped function\'s __name__, __doc__ and signature metadata', 'Execution speed', 'Thread safety'],
      correct: 1, why: 'Without it the decorated function reports itself as "wrapper", which breaks introspection, help(), documentation generators and debuggers.' },

    { id: 'q-py-013', section: 'py-data-model', tier: 'master', topic: 'context managers',
      q: 'What does returning a truthy value from __exit__ mean?',
      opts: ['The block succeeded', 'Any exception raised in the block is suppressed', 'Cleanup failed', 'The context manager is reusable'],
      correct: 1, why: 'A truthy return tells Python the exception is handled and it stops propagating. Doing so unintentionally hides genuine errors.' },

    { id: 'q-py-014', section: 'py-data-model', tier: 'advanced', topic: 'properties',
      q: 'What does @property give you over a plain attribute?',
      opts: ['Faster access', 'A method that is accessed like an attribute, so validation or computation can be added without changing any calling code', 'Thread safety', 'Immutability'],
      correct: 1, why: 'It preserves the attribute interface while letting you intercept reads and writes. That is why Python code exposes plain attributes first and adds properties only when a rule appears.' },

    { id: 'q-py-015', section: 'py-data-model', tier: 'master', topic: 'MRO',
      q: 'What does Python\'s method resolution order determine?',
      opts: ['The order attributes are stored', 'The linear order in which base classes are searched for an attribute under multiple inheritance', 'Which methods are virtual', 'The order __init__ arguments are passed'],
      correct: 1, why: 'The C3 linearisation produces a consistent order that respects each parent\'s own order, which is what makes cooperative super() calls work in a diamond hierarchy.' },

    { id: 'q-py-016', section: 'py-data-model', tier: 'advanced', topic: 'dataclasses',
      q: 'What does @dataclass generate for you?',
      opts: ['Only __init__', '__init__, __repr__ and __eq__ from the annotated fields, with options for ordering and immutability', 'A database schema', 'Type checking at runtime'],
      correct: 1, why: 'It removes the boilerplate of a value type. frozen=True additionally makes instances immutable and hashable, which is the usual reason to reach for it.' },

    { id: 'q-py-017', section: 'py-stdlib-perf', tier: 'beginner', topic: 'complexity',
      q: 'What is the cost of `x in my_list` for a list of n elements?',
      opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correct: 2, why: 'A list search compares elements one at a time. Converting to a set first makes each membership test O(1) on average, which is the fix whenever you test repeatedly.' },

    { id: 'q-py-018', section: 'py-stdlib-perf', tier: 'intermediate', topic: 'strings',
      q: 'Why is building a string with `s += part` in a loop O(n^2)?',
      opts: ['String concatenation is slow in general', 'Strings are immutable, so each += allocates a new string and copies everything accumulated so far', 'The loop is the problem', 'It is actually O(n)'],
      correct: 1, why: 'Each step copies the whole accumulated string. "".join(parts) walks the parts once, computes the total length, allocates once and copies once.' },

    { id: 'q-py-019', section: 'py-stdlib-perf', tier: 'intermediate', topic: 'deque',
      q: 'When should you reach for collections.deque instead of a list?',
      opts: ['When you need random access by index', 'When you add or remove at the front, which is O(n) on a list and O(1) on a deque', 'When the data is sorted', 'When you need key lookup'],
      correct: 1, why: 'A deque is optimised for both ends. This is what makes it the correct queue for BFS; a list used as a queue is quietly quadratic.' },

    { id: 'q-py-020', section: 'py-stdlib-perf', tier: 'advanced', topic: 'GIL',
      q: 'Your CPU-bound function is slow. Will threading.Thread speed it up in CPython?',
      opts: ['Yes, threads always parallelise', 'No — the GIL lets only one thread execute bytecode at a time, so use multiprocessing or a native extension', 'Only with more than 8 cores', 'Only if the function is recursive'],
      correct: 1, why: 'Threads help when the work is I/O-bound, because the GIL is released while waiting. For CPU-bound work you need separate processes or code that releases the GIL.' },

    { id: 'q-py-021', section: 'py-stdlib-perf', tier: 'advanced', topic: 'bisect',
      q: 'What does the bisect module do?',
      opts: ['Splits a list in half', 'Binary-searches a sorted sequence for an insertion point, in O(log n)', 'Sorts a list', 'Removes duplicates'],
      correct: 1, why: 'bisect_left and bisect_right find where a value belongs in already-sorted data. insort inserts there — the search is O(log n) even though the insertion itself is O(n).' },

    { id: 'q-py-022', section: 'py-stdlib-perf', tier: 'intermediate', topic: 'heapq',
      q: 'What kind of heap does heapq implement?',
      opts: ['A max-heap', 'A min-heap, so the smallest element is always at index 0', 'A balanced binary search tree', 'A Fibonacci heap'],
      correct: 1, why: 'heapq is a min-heap. The usual trick for a max-heap is to push negated values, or to push tuples whose first element is the negated priority.' },

    { id: 'q-py-023', section: 'py-stdlib-perf', tier: 'advanced', topic: 'collections',
      q: 'What does collections.defaultdict(list) do that a plain dict does not?',
      opts: ['It is faster', 'Accessing a missing key creates and stores an empty list instead of raising KeyError', 'It keeps keys sorted', 'It allows unhashable keys'],
      correct: 1, why: 'The factory runs on a missing lookup, which removes the setdefault dance when grouping. Note it also means a read can mutate the dict.' },

    { id: 'q-py-024', section: 'py-stdlib-perf', tier: 'master', topic: 'slots',
      q: 'What does defining __slots__ on a class achieve?',
      opts: ['It makes attributes private', 'It removes the per-instance __dict__, cutting memory use and forbidding new attributes at runtime', 'It speeds up method calls', 'It makes the class immutable'],
      correct: 1, why: 'It matters when you create very many small instances. The trade-off is that you can no longer attach arbitrary attributes, and multiple inheritance gets fiddly.' },

    { id: 'q-py-025', section: 'py-stdlib-perf', tier: 'advanced', topic: 'dict ordering',
      q: 'Is dictionary insertion order guaranteed in modern Python?',
      opts: ['No, dicts are unordered', 'Yes — it became a language guarantee in 3.7', 'Only for string keys', 'Only for OrderedDict'],
      correct: 1, why: 'It was an implementation detail in 3.6 and became guaranteed in 3.7. OrderedDict is still useful for its order-aware equality and move_to_end.' },

    { id: 'q-py-026', section: 'py-core', tier: 'master', topic: 'iteration',
      q: 'Why does removing items from a list while iterating it skip elements?',
      opts: ['The list becomes unsorted', 'The iterator advances by index, so removing an element shifts the rest left and the next one is stepped over', 'Removal raises immediately', 'Only dicts have this problem'],
      correct: 1, why: 'After removing index i the element that was at i+1 is now at i, and the iterator moves to i+1 regardless. Iterate over a copy, or build a new list with a comprehension.' },

    { id: 'q-py-027', section: 'py-stdlib-perf', tier: 'master', topic: 'asyncio',
      q: 'What kind of workload does asyncio actually speed up?',
      opts: ['CPU-bound number crunching', 'I/O-bound work with many concurrent waits, such as thousands of network requests', 'Anything, it is generally faster', 'Disk-bound sorting'],
      correct: 1, why: 'A single thread interleaves tasks while they await I/O. There is no parallel CPU execution, so a blocking CPU-bound call inside a coroutine stalls the entire event loop.' },

    { id: 'q-py-028', section: 'py-core', tier: 'advanced', topic: 'truthiness',
      q: 'Which of these is truthy in Python?',
      opts: ['[]', '"0"', '0', '{}'],
      correct: 1, why: 'Any non-empty string is truthy, including "0" and "False". Empty containers and the number zero are falsy, which is why `if x:` and `if x is not None:` are different tests.' }
  ];

  window.DB.lessons.push.apply(window.DB.lessons, L);
  window.DB.problems.push.apply(window.DB.problems, P);
  window.DB.questions.push.apply(window.DB.questions, Q);
})();
