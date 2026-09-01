/* cpp.js — C++ lessons, drills and question bank.
 * Sections: cpp-core, cpp-memory, cpp-oop, cpp-modern.
 * Every drill also carries the idiomatic Python equivalent, because knowing
 * which language makes a thing easy is half of knowing the thing.
 */
(function () {
  'use strict';

  const L = [
    {
      id: 'cpp-l1', track: 'cpp', section: 'cpp-core', tier: 'beginner', order: 1,
      title: 'Values, types and initialisation',
      summary: 'Why C++ has four ways to initialise a variable, and which one to use.',
      minutes: 11,
      body: '<p>C++ makes you say what a thing <em>is</em> before you can use it. That is the whole bargain: more up-front commitment in exchange for the compiler catching mistakes and generating fast code.</p>' +
        '<h3>Four initialisation syntaxes</h3>' +
        '<pre class="code">int a = 5;        // copy initialisation\nint b(5);         // direct initialisation\nint c{5};         // brace (list) initialisation  &lt;- prefer this\nint d = {5};      // copy-list initialisation\n\nint e;            // UNINITIALISED - reading it is undefined behaviour\nint f{};          // zero-initialised to 0</pre>' +
        '<p>Prefer braces. They do one thing the others do not: reject narrowing conversions.</p>' +
        '<pre class="code">double pi = 3.14159;\n\nint x = pi;      // COMMON MISTAKE: silently truncates to 3\nint y{pi};       // compiler error - narrowing, exactly what you want</pre>' +
        '<h3>auto</h3>' +
        '<p><code>auto</code> asks the compiler to work out the type. It is not dynamic typing — the type is fixed at compile time, you just did not have to spell it.</p>' +
        '<pre class="code">auto n = 42;              // int\nauto d = 42.0;            // double\nauto s = "hi";            // const char*  (NOT std::string)\nauto t = std::string("hi");  // std::string\n\n// where it really earns its keep\nstd::unordered_map&lt;std::string, std::vector&lt;int&gt;&gt; m;\nfor (const auto&amp; [key, values] : m) { /* ... */ }</pre>' +
        '<h3>const means "I will not change this"</h3>' +
        '<p>Mark everything const that you do not intend to modify. It costs nothing at runtime, documents intent, and turns a class of bugs into compile errors.</p>' +
        '<pre class="code">void print(const std::string&amp; s);   // takes by reference, promises not to modify\nconst int MAX = 100;                // runtime constant\nconstexpr int SIZE = 10 * 10;       // computed at COMPILE time</pre>' +
        '<p>The Python parallel: Python has no <code>const</code>, only the convention of naming module-level constants in capitals. Nothing stops you reassigning them.</p>'
    },
    {
      id: 'cpp-l2', track: 'cpp', section: 'cpp-core', tier: 'intermediate', order: 2,
      title: 'References, pointers and const-correctness',
      summary: 'The three ways to pass a value, and the one you should default to.',
      minutes: 13,
      body: '<h3>Pass by value, reference, or pointer</h3>' +
        '<pre class="code">void byValue(std::string s);          // copies the whole string\nvoid byRef(std::string&amp; s);           // no copy, CAN modify the caller\nvoid byConstRef(const std::string&amp; s); // no copy, CANNOT modify  &lt;- the default\nvoid byPtr(std::string* s);           // no copy, may be null</pre>' +
        '<p>Default to <code>const&amp;</code> for anything bigger than a machine word. Use a plain reference when you genuinely mean to modify the caller. Use a pointer only when absence is meaningful — a pointer can be null, a reference cannot.</p>' +
        '<h3>The dangling reference</h3>' +
        '<pre class="code">// COMMON MISTAKE: returning a reference to a local\nconst std::string&amp; greet() {\n    std::string s = "hello";\n    return s;              // s dies here; the caller reads freed memory\n}\n\n// FIX: return by value. Move semantics make this cheap.\nstd::string greet() {\n    std::string s = "hello";\n    return s;\n}</pre>' +
        '<h3>const is read right to left</h3>' +
        '<pre class="code">const int* p;        // pointer to const int   - cannot change *p\nint* const p;        // const pointer to int   - cannot change p\nconst int* const p;  // both are fixed</pre>' +
        '<h3>Where Python differs</h3>' +
        '<p>Python has no value semantics for objects. Every name is a reference to an object, and whether a function can modify what you passed depends on whether the object is mutable, not on how you passed it.</p>' +
        '<pre class="code"># Python: the list IS modified, there is no "pass by value" to opt into\ndef add(items):\n    items.append(1)     # caller sees this\n\n# C++: this copies, the caller sees nothing\nvoid add(std::vector&lt;int&gt; items) { items.push_back(1); }</pre>'
    },
    {
      id: 'cpp-l3', track: 'cpp', section: 'cpp-memory', tier: 'intermediate', order: 1,
      title: 'Stack, heap, and what a leak actually is',
      summary: 'Automatic storage, dynamic allocation, and why new/delete is now a code smell.',
      minutes: 12,
      body: '<h3>Two places a value can live</h3>' +
        '<p><b>Stack</b>: allocated by moving a pointer, freed automatically when the scope ends, limited to a megabyte or so. <b>Heap</b>: allocated by asking the allocator, freed only when you say so, effectively unlimited.</p>' +
        '<pre class="code">void f() {\n    int a = 5;                 // stack: gone at the closing brace\n    int* b = new int(5);       // heap: yours to free\n    delete b;                  // ...and you must remember\n}</pre>' +
        '<h3>What a leak is</h3>' +
        '<p>A leak is not "memory is still allocated". It is "memory is still allocated and nothing holds a pointer to it any more", so it can never be freed.</p>' +
        '<pre class="code">int* p = new int(1);\np = new int(2);        // COMMON MISTAKE: the first allocation is now unreachable\ndelete p;              // frees only the second</pre>' +
        '<h3>Why exceptions make manual delete unworkable</h3>' +
        '<pre class="code">void f() {\n    Widget* w = new Widget();\n    mayThrow();            // if this throws, delete never runs\n    delete w;\n}</pre>' +
        '<p>You cannot fix this with try/catch everywhere. You fix it by never writing the raw <code>new</code> in the first place — which is what the next lesson is about.</p>' +
        '<h3>Python parallel</h3>' +
        '<p>Python reference-counts and garbage-collects, so you do not free anything. You can still leak, though: a container that grows forever, or a reference cycle holding a large object, keeps memory alive exactly the way a C++ leak does.</p>'
    },
    {
      id: 'cpp-l4', track: 'cpp', section: 'cpp-memory', tier: 'advanced', order: 2,
      title: 'RAII and smart pointers',
      summary: 'Ownership as a design tool: unique_ptr, shared_ptr, weak_ptr.',
      minutes: 15,
      body: '<h3>The idea</h3>' +
        '<p>RAII: tie a resource to an object\'s lifetime. Acquire in the constructor, release in the destructor. The language already guarantees destructors run at scope exit — including when an exception unwinds — so cleanup stops being something you can forget.</p>' +
        '<h3>unique_ptr: one owner</h3>' +
        '<pre class="code">auto w = std::make_unique&lt;Widget&gt;();   // no raw new\nw-&gt;doThing();\n// freed automatically, even if an exception is thrown\n\nauto w2 = std::move(w);   // ownership transferred; w is now null\n// auto w3 = w2;          // will not compile - unique means unique</pre>' +
        '<h3>shared_ptr: shared ownership, reference counted</h3>' +
        '<pre class="code">auto a = std::make_shared&lt;Widget&gt;();  // count 1\nauto b = a;                           // count 2\n// freed when the last shared_ptr goes away</pre>' +
        '<p>shared_ptr is not the safe default. It costs an atomic increment on every copy, and it makes ownership genuinely unclear. Reach for unique_ptr first and only upgrade when several owners really exist.</p>' +
        '<h3>The cycle, and weak_ptr</h3>' +
        '<pre class="code">struct Node {\n    std::shared_ptr&lt;Node&gt; next;\n    std::shared_ptr&lt;Node&gt; prev;   // COMMON MISTAKE: cycle, neither ever freed\n};\n\nstruct Node {\n    std::shared_ptr&lt;Node&gt; next;\n    std::weak_ptr&lt;Node&gt;   prev;   // FIX: weak does not own, breaks the cycle\n};</pre>' +
        '<p>A weak_ptr does not keep the object alive. To use it you call <code>lock()</code>, which returns a shared_ptr that is null if the object has already gone.</p>' +
        '<h3>Python parallel</h3>' +
        '<p>Python\'s <code>with</code> block is RAII for scope-bound resources, and <code>weakref</code> is the direct analogue of weak_ptr for exactly the same cycle problem.</p>' +
        '<pre class="code">with open("f.txt") as f:    # closed on exit, even if the body raises\n    data = f.read()</pre>'
    },
    {
      id: 'cpp-l5', track: 'cpp', section: 'cpp-oop', tier: 'advanced', order: 1,
      title: 'Virtual dispatch, vtables and the destructor rule',
      summary: 'How polymorphism is implemented, and the one bug everyone writes once.',
      minutes: 13,
      body: '<h3>Static versus dynamic dispatch</h3>' +
        '<pre class="code">struct Base    { void f() { std::cout &lt;&lt; "Base"; } };\nstruct Derived : Base { void f() { std::cout &lt;&lt; "Derived"; } };\n\nDerived d;\nBase&amp; r = d;\nr.f();          // prints "Base" - resolved from the STATIC type\n\n// add virtual and it prints "Derived"</pre>' +
        '<p>A class with any virtual function gets a hidden pointer to a table of function pointers. A virtual call reads that pointer, indexes the table, and jumps — one extra indirection, and the compiler usually cannot inline it.</p>' +
        '<h3>The destructor rule</h3>' +
        '<pre class="code">struct Base { ~Base() {} };                    // NOT virtual\nstruct Derived : Base { std::vector&lt;int&gt; big; };\n\nBase* p = new Derived();\ndelete p;    // COMMON MISTAKE: only ~Base runs. big is never destroyed.\n\n// FIX\nstruct Base { virtual ~Base() = default; };</pre>' +
        '<p>The rule: if a class has any virtual function, give it a virtual destructor. If it is not meant to be a base class, mark it <code>final</code> instead.</p>' +
        '<h3>Slicing</h3>' +
        '<pre class="code">void take(Base b);        // BY VALUE\nDerived d;\ntake(d);                  // the Derived part is sliced off and lost\n\nvoid take(const Base&amp; b); // FIX: reference preserves the object</pre>' +
        '<h3>Python parallel</h3>' +
        '<p>Every Python method is virtual — dispatch is always a dictionary lookup on the instance\'s type at call time. There is no slicing because there are no value semantics, and no destructor rule because there is no manual delete.</p>'
    },
    {
      id: 'cpp-l6', track: 'cpp', section: 'cpp-modern', tier: 'advanced', order: 1,
      title: 'Modern C++: 17, 20 and what landed in 23',
      summary: 'Structured bindings, optional, string_view, concepts, ranges, expected.',
      minutes: 14,
      body: '<h3>C++17</h3>' +
        '<pre class="code">// structured bindings - unpack a pair, tuple or struct\nauto [it, inserted] = mySet.insert(42);\nfor (const auto&amp; [key, value] : myMap) { /* ... */ }\n\n// optional - "a value, or nothing", without a sentinel or a null pointer\nstd::optional&lt;int&gt; parse(const std::string&amp; s);\nif (auto v = parse(text)) use(*v);\n\n// string_view - a non-owning window onto characters\nvoid log(std::string_view msg);   // no copy, no allocation\n// but: never store one that outlives the string it points into\n\n// if constexpr - the dead branch is not even compiled\nif constexpr (std::is_integral_v&lt;T&gt;) { /* ... */ }</pre>' +
        '<h3>C++20</h3>' +
        '<pre class="code">// concepts - constrain templates, and get readable errors\ntemplate &lt;std::integral T&gt;\nT half(T x) { return x / 2; }\n\n// ranges - composable, lazy, no intermediate containers\nauto evens = data\n    | std::views::filter([](int n){ return n % 2 == 0; })\n    | std::views::transform([](int n){ return n * n; });\n\n// the spaceship operator generates all six comparisons\nauto operator&lt;=&gt;(const Point&amp;) const = default;</pre>' +
        '<h3>C++23</h3>' +
        '<pre class="code">// expected - like optional, but carries WHY it failed\nstd::expected&lt;Config, ParseError&gt; load(std::string_view path);\n\nauto r = load("app.toml");\nif (r) use(*r);\nelse    report(r.error());</pre>' +
        '<h3>The through-line</h3>' +
        '<p>Every one of these features exists to move a runtime failure to compile time, or to remove a copy. That is the direction modern C++ moves in, and it is the lens to read new features through.</p>'
    }
  ];

  const P = [
    {
      id: 'cpp-p1', title: 'Fix the Dangling Reference', section: 'cpp-core',
      tier: 'intermediate', difficulty: 'Easy',
      prompt: 'The function below returns a reference to a local variable, so the caller reads freed memory.\n\nRewrite it so it is correct.\n\n    const std::string& buildGreeting(const std::string& name) {\n        std::string result = "Hello, " + name;\n        return result;\n    }',
      examples: [{ in: 'buildGreeting("Ada")', out: '"Hello, Ada"', why: 'The returned string must still be valid after the function returns.' }],
      constraints: ['The returned value must outlive the call.', 'Do not leak.'],
      approach: 'A local object is destroyed when the function returns, so any reference to it dangles. The fix is to return by value. That sounds expensive but is not: the compiler either elides the copy entirely under guaranteed copy elision, or moves the string, so returning by value costs a pointer swap rather than a character copy. Returning by value is the correct default for anything constructed inside the function; return a reference only when you are handing back something that outlives the call, such as a member of the object you were called on.',
      keyInsight: 'Return by value for anything you built locally. Copy elision and move semantics make it free.',
      pitfalls: [
        'Making the local static to keep it alive, which breaks with threads and with two calls in one expression.',
        'Returning a reference to the parameter, which only works if the caller keeps the argument alive.',
        'Adding std::move to the return statement, which actively blocks copy elision.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 2,
      starter: { cpp: '#include <string>\n\nstd::string buildGreeting(const std::string& name) {\n    // return a safely-owned string\n}', python: 'def build_greeting(name):\n    # Python has no dangling-reference problem here — why?\n    pass' },
      solution: {
        cpp: '#include <string>\n\nstd::string buildGreeting(const std::string& name) {\n    return "Hello, " + name;   // by value: elided or moved, never dangling\n}',
        python: 'def build_greeting(name):\n    # Python objects are reference-counted and outlive the frame that made\n    # them, so returning a locally built string is always safe.\n    return "Hello, " + name'
      },
      checks: {
        cpp: [
          { re: 'std::string\\s+\\w+\\s*\\(', hint: 'Return std::string by value, not by reference.' },
          { re: 'return', hint: 'Return the built string.' },
          { re: '\\+|append|format', hint: 'Build the greeting from the name.' }
        ],
        python: [{ re: 'return', hint: 'Return the built string.' }, { re: '\\+|format|f["\']', hint: 'Build the greeting from the name.' }]
      },
      antiChecks: {
        cpp: [
          { re: 'std::string\\s*&\\s*\\w+\\s*\\(', hint: 'Returning a reference is the original bug.' },
          { re: 'static\\s+std::string', hint: 'A static local is not a fix — it breaks with threads and with two calls in one expression.' }
        ], python: []
      },
      mcq: [
        { q: 'Why is returning std::string by value not expensive here?', opts: ['Strings are always small', 'Guaranteed copy elision constructs it directly in the caller, and otherwise it is moved', 'The compiler caches the result', 'It is expensive, but correctness matters more'], correct: 1, why: 'Since C++17 the returned temporary is constructed directly in the caller\'s storage. No copy happens at all.' },
        { q: 'Why does writing `return std::move(result);` make things worse?', opts: ['std::move is undefined in a return', 'It blocks copy elision, forcing a move that would otherwise not have happened', 'It causes a dangling reference', 'It leaks'], correct: 1, why: 'The named return value would have been elided. Wrapping it in std::move turns a zero-cost return into a move construction.' }
      ]
    },
    {
      id: 'cpp-p2', title: 'Replace new/delete with unique_ptr', section: 'cpp-memory',
      tier: 'intermediate', difficulty: 'Easy',
      prompt: 'Rewrite this function so it cannot leak, including when process() throws.\n\n    void run() {\n        Widget* w = new Widget();\n        w->process();\n        delete w;\n    }',
      examples: [{ in: 'process() throws', out: 'the Widget is still destroyed', why: 'A raw delete after a throwing call never runs; RAII cleanup does.' }],
      constraints: ['No raw new or delete.', 'Must be exception-safe.'],
      approach: 'The bug is that delete is a statement that only runs if control reaches it. An exception skips it. RAII fixes this structurally: a unique_ptr destroys what it owns in its destructor, and destructors run during stack unwinding, so the Widget is released on every exit path including the exceptional one. Use make_unique rather than unique_ptr with a raw new, both because it is one allocation instead of two in some cases and because it means the word new never appears in your code.',
      keyInsight: 'delete is a statement you can skip; a destructor is not. Move cleanup into a destructor and it becomes unconditional.',
      pitfalls: [
        'Wrapping in try/catch and deleting in the catch, which duplicates the cleanup and misses other exit paths.',
        'Using unique_ptr but then calling release() and deleting manually.',
        'Reaching for shared_ptr when there is only one owner.'
      ],
      complexity: { time: 'O(1)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: { cpp: '#include <memory>\n\nvoid run() {\n    // make the Widget own itself\n}', python: 'def run():\n    # use the construct that guarantees cleanup on exit\n    pass' },
      solution: {
        cpp: '#include <memory>\n\nvoid run() {\n    auto w = std::make_unique<Widget>();\n    w->process();\n    // destroyed here on every path, including an exception\n}',
        python: 'from contextlib import closing\n\ndef run():\n    # Python\'s equivalent guarantee is the with block: __exit__ runs\n    # whether the body finishes normally or raises.\n    with closing(Widget()) as w:\n        w.process()'
      },
      checks: {
        cpp: [{ re: 'make_unique|unique_ptr', hint: 'Own the Widget with a unique_ptr.' }, { re: 'process', hint: 'Still call process().' }],
        python: [{ re: 'with\\s|__exit__|try', hint: 'Use a with block so cleanup runs on every path.' }, { re: 'process', hint: 'Still call process().' }]
      },
      antiChecks: { cpp: [{ re: '\\bdelete\\b|\\bnew\\b', hint: 'Raw new/delete is what we are removing.' }], python: [] },
      mcq: [
        { q: 'Why is try/catch a worse fix than unique_ptr?', opts: ['It is slower', 'It duplicates cleanup at every exit and must be repeated for each new early return', 'catch cannot call delete', 'It does not compile'], correct: 1, why: 'RAII states the cleanup once, at the point of ownership. try/catch restates it at every exit path, and the next early return someone adds will forget it.' },
        { q: 'Why prefer unique_ptr over shared_ptr by default?', opts: ['shared_ptr cannot be moved', 'unique_ptr has no reference count, so no atomic overhead, and it documents that there is exactly one owner', 'shared_ptr leaks', 'They are identical'], correct: 1, why: 'shared_ptr pays an atomic increment per copy and makes ownership ambiguous. Single ownership is both cheaper and clearer, so it is the right default.' }
      ]
    },
    {
      id: 'cpp-p3', title: 'The Virtual Destructor', section: 'cpp-oop',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Deleting a Derived through a Base* below destroys only the Base part, so the vector member leaks.\n\nFix the base class.\n\n    struct Base { ~Base() {} };\n    struct Derived : Base { std::vector<int> data; };\n    Base* p = new Derived();\n    delete p;',
      examples: [{ in: 'delete p where p is Base* pointing at a Derived', out: '~Derived then ~Base both run', why: 'Without a virtual destructor only ~Base runs and the vector is never destroyed.' }],
      constraints: ['Deleting through a base pointer must destroy the whole object.'],
      approach: 'When you delete through a pointer to base, the compiler emits a call to the destructor it can see, which is the base one. Making the base destructor virtual routes that call through the vtable so the most-derived destructor runs first, then each base in turn. The rule is mechanical: a class intended to be deleted polymorphically needs a virtual destructor. Declaring it `virtual ~Base() = default;` is the right form. Note the side effect: declaring any destructor suppresses the implicit move operations, which is why `= default` rather than an empty body matters for classes you also want to be movable.',
      keyInsight: 'Any class you delete through a base pointer needs a virtual destructor. If it is not a base class, mark it final instead.',
      pitfalls: [
        'Making the destructor virtual in the derived class instead of the base — the call site only sees the base.',
        'Adding virtual to every class, which forces a vtable pointer onto types that do not need one.',
        'Writing an empty body `virtual ~Base() {}` where `= default` is clearer and keeps the type trivially destructible where possible.'
      ],
      complexity: { time: 'O(1)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: {
        cpp: '#include <vector>\n\nstruct Base {\n    // make this safe to delete polymorphically\n};\n\nstruct Derived : Base {\n    std::vector<int> data;\n};',
        python: 'class Base:\n    def __init__(self):\n        self.registry = []\n\nclass Derived(Base):\n    def __init__(self):\n        # the base part must be initialised too — do it properly\n        self.data = []'
      },
      solution: {
        cpp: '#include <vector>\n\nstruct Base {\n    virtual ~Base() = default;   // routes destruction through the vtable\n};\n\nstruct Derived : Base {\n    std::vector<int> data;\n};',
        python: 'class Base:\n    def __init__(self):\n        self.registry = []\n\nclass Derived(Base):\n    def __init__(self):\n        super().__init__()      # without this, self.registry never exists\n        self.data = []\n\n# Python has no virtual-destructor bug — objects are reclaimed by their\n# ACTUAL type, never through a static base-pointer view. The parallel trap\n# is on the way IN rather than out: forget super().__init__() and the base\n# part of the object is silently never set up.'
      },
      checks: {
        cpp: [{ re: 'virtual\\s*~', hint: 'Declare the base destructor virtual.' }, { re: 'struct|class', hint: 'Keep the class definitions.' }],
        python: [
          { re: 'super\\s*\\(\\s*\\)\\s*\\.\\s*__init__|Base\\.__init__', hint: 'Initialise the base part by calling super().__init__().' },
          { re: 'class\\s+Derived', hint: 'Keep the subclass.' },
          { re: 'self\\.data', hint: 'Still set up the derived state.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'What does adding a virtual destructor cost?', opts: ['Nothing at all', 'A vtable pointer per object, so the type is no longer trivially copyable or destructible', 'A heap allocation per object', 'It disables inheritance'], correct: 1, why: 'The first virtual function adds a hidden vptr to every instance and stops the type being trivially destructible, which can matter for small value types stored in bulk.' },
        { q: 'A class is never inherited from. What should you do?', opts: ['Give it a virtual destructor anyway, to be safe', 'Mark it final, which documents the intent and lets the compiler devirtualise', 'Make the destructor private', 'Nothing'], correct: 1, why: 'Virtual destructors are for polymorphic deletion. If the class is not a base, final states that and avoids paying for a vtable you never use.' }
      ]
    },
    {
      id: 'cpp-p4', title: 'Rule of Five: a Move-Aware Buffer', section: 'cpp-memory',
      tier: 'master', difficulty: 'Hard',
      prompt: 'Implement a class that owns a heap buffer: destructor frees it, copy performs a deep copy, and move transfers ownership without copying.\n\nAfter a move the source must be safely destructible.',
      examples: [
        { in: 'Buffer b(a); // copy', out: 'two independent buffers', why: 'A shallow copy would give two owners of one allocation and a double free.' },
        { in: 'Buffer b(std::move(a)); // move', out: 'no allocation; a is left null', why: 'Move steals the pointer and must null the source so its destructor does nothing.' }
      ],
      constraints: ['No double free.', 'Copy must be deep.', 'Move must not allocate.', 'Self-assignment must be safe.'],
      approach: 'Five special members travel together once a class owns a resource. The destructor frees. The copy constructor allocates its own buffer and copies the contents. Copy assignment must handle self-assignment and must free what it already held. The move constructor takes the pointer and nulls the source. Move assignment frees its current buffer, steals, and nulls. Mark both moves noexcept so std::vector will move rather than copy your objects when it reallocates. In practice you should reach for std::vector and write none of this — the Rule of Zero — but you must be able to write it to understand what the library is doing for you.',
      keyInsight: 'Copy duplicates the resource; move transfers it and nulls the source. Forget the nulling and you get a double free under load.',
      pitfalls: [
        'A shallow copy constructor, giving two owners of one allocation.',
        'Move that does not null the source, causing a double free.',
        'Copy assignment that leaks the old buffer or breaks on self-assignment.',
        'Moves not marked noexcept, so vector silently copies instead.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], timeAnswer: 2,
      starter: { cpp: '#include <cstddef>\n#include <algorithm>\n\nclass Buffer {\n    int*   data_ = nullptr;\n    size_t size_ = 0;\npublic:\n    explicit Buffer(size_t n) : data_(new int[n]()), size_(n) {}\n    // destructor, copy, move\n};', python: 'import copy\n\nclass Buffer:\n    def __init__(self, n):\n        self.data = [0] * n\n\n    # Python parallel: __copy__ / __deepcopy__' },
      solution: {
        cpp: '#include <cstddef>\n#include <algorithm>\n#include <utility>\n\nclass Buffer {\n    int*   data_ = nullptr;\n    size_t size_ = 0;\npublic:\n    explicit Buffer(size_t n) : data_(new int[n]()), size_(n) {}\n\n    ~Buffer() { delete[] data_; }\n\n    Buffer(const Buffer& o) : data_(new int[o.size_]), size_(o.size_) {\n        std::copy(o.data_, o.data_ + o.size_, data_);   // deep copy\n    }\n\n    Buffer& operator=(const Buffer& o) {\n        if (this != &o) {\n            int* fresh = new int[o.size_];              // allocate before freeing\n            std::copy(o.data_, o.data_ + o.size_, fresh);\n            delete[] data_;\n            data_ = fresh;\n            size_ = o.size_;\n        }\n        return *this;\n    }\n\n    Buffer(Buffer&& o) noexcept : data_(o.data_), size_(o.size_) {\n        o.data_ = nullptr;                              // source no longer owns\n        o.size_ = 0;\n    }\n\n    Buffer& operator=(Buffer&& o) noexcept {\n        if (this != &o) {\n            delete[] data_;\n            data_ = o.data_;  size_ = o.size_;\n            o.data_ = nullptr; o.size_ = 0;\n        }\n        return *this;\n    }\n\n    size_t size() const { return size_; }\n};',
        python: 'import copy\n\nclass Buffer:\n    """Python has no destructors you schedule and no move semantics: names\n    are rebound, never copied. Deep vs shallow copying is the part that\n    maps onto the C++ distinction."""\n\n    def __init__(self, n):\n        self.data = [0] * n\n\n    def __copy__(self):\n        new = Buffer(0)\n        new.data = self.data          # shallow: shares the same list\n        return new\n\n    def __deepcopy__(self, memo):\n        new = Buffer(0)\n        new.data = copy.deepcopy(self.data, memo)   # independent copy\n        return new'
      },
      checks: {
        cpp: [
          { re: '~Buffer', hint: 'Free the buffer in the destructor.' },
          { re: 'delete\\s*\\[\\s*\\]', hint: 'Use delete[] for an array allocation.' },
          { re: '&&', hint: 'Implement move operations taking rvalue references.' },
          { re: 'noexcept', hint: 'Mark the moves noexcept so containers will use them.' },
          { re: 'nullptr', hint: 'Null the source after a move.' },
          { re: 'this\\s*!=\\s*&', hint: 'Guard assignment against self-assignment.' }
        ],
        python: [{ re: 'deepcopy|__deepcopy__|__copy__', hint: 'Model the deep-versus-shallow copy distinction.' }, { re: 'class', hint: 'Keep the class.' }]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why allocate the new buffer before freeing the old one in copy assignment?', opts: ['It is faster', 'If the allocation throws, the object is left unchanged rather than holding a freed pointer', 'It avoids fragmentation', 'The order does not matter'], correct: 1, why: 'That is the strong exception guarantee. Freeing first and then throwing on the allocation leaves the object holding a dangling pointer.' },
        { q: 'What does the Rule of Zero say about this class?', opts: ['Always write all five members', 'Prefer to own nothing directly — hold a std::vector and let the compiler generate all five correctly', 'Never write destructors', 'Use raw pointers'], correct: 1, why: 'A member that already manages its own resource makes every compiler-generated special member correct. Writing the five by hand is for when you genuinely wrap something the library does not.' }
      ]
    },
    {
      id: 'cpp-p5', title: 'optional Instead of a Sentinel', section: 'cpp-modern',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'This function returns -1 to mean "not found", which collides with a legitimate stored value of -1.\n\nRewrite it to express absence in the type instead.\n\n    int findValue(const std::map<std::string,int>& m, const std::string& key);',
      examples: [
        { in: 'key present with value -1', out: 'a present optional holding -1', why: 'A sentinel cannot distinguish this from "missing"; optional can.' },
        { in: 'key absent', out: 'an empty optional', why: 'Absence is represented in the type, so the caller has to handle it.' }
      ],
      constraints: ['Absence must be distinguishable from any stored value.'],
      approach: 'A sentinel return value works only when some value in the range is impossible, and that assumption quietly breaks the day someone stores it. std::optional adds a separate "has value" flag alongside the value, so absence has its own representation regardless of what the value type can hold. The caller cannot ignore it: reading the value requires either checking first or calling value(), which throws. Return std::nullopt for absence, the value otherwise, and the type now documents the contract that a comment used to.',
      keyInsight: 'A sentinel steals a legal value to mean "nothing". optional adds a flag instead, so no value has to be sacrificed.',
      pitfalls: [
        'Calling *opt without checking, which is undefined behaviour when empty.',
        'Using optional<T&>, which is not allowed — use a pointer for optional references.',
        'Returning optional and then having the caller compare against a sentinel anyway.'
      ],
      complexity: { time: 'O(log n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], timeAnswer: 1,
      starter: { cpp: '#include <optional>\n#include <map>\n#include <string>\n\nstd::optional<int> findValue(const std::map<std::string,int>& m,\n                             const std::string& key) {\n    // return the value, or nothing\n}', python: 'def find_value(m, key):\n    """Return the value, or None if the key is absent."""\n    pass' },
      solution: {
        cpp: '#include <optional>\n#include <map>\n#include <string>\n\nstd::optional<int> findValue(const std::map<std::string,int>& m,\n                             const std::string& key) {\n    auto it = m.find(key);\n    if (it == m.end()) return std::nullopt;\n    return it->second;\n}',
        python: 'def find_value(m, key):\n    # Python\'s None plays the role of nullopt. The sentinel trap still\n    # exists if None is a legal stored value — then use a unique marker\n    # object, or dict.get with a private default.\n    return m.get(key)'
      },
      checks: {
        cpp: [{ re: 'optional', hint: 'Return std::optional<int>.' }, { re: 'nullopt', hint: 'Return nullopt when the key is absent.' }, { re: 'find|count|contains', hint: 'Look the key up without inserting it.' }],
        python: [{ re: 'get\\s*\\(|in\\s|try', hint: 'Look the key up without raising.' }, { re: 'return', hint: 'Return the value or None.' }]
      },
      antiChecks: { cpp: [{ re: 'return\\s+-1', hint: 'That is the sentinel we are removing.' }], python: [{ re: 'return\\s+-1', hint: 'That is the sentinel we are removing.' }] },
      mcq: [
        { q: 'Why is m[key] wrong here?', opts: ['It is slower than find', 'operator[] on a map inserts a default-constructed element when the key is missing, mutating a map you were given as const', 'It returns a copy', 'It throws'], correct: 1, why: 'operator[] default-constructs missing keys. It also would not compile on a const map — which is the compiler telling you about the mutation.' },
        { q: 'When does the sentinel approach still break in Python?', opts: ['Never, None always works', 'When None is itself a legitimate stored value — then you need a unique sentinel object', 'When the dict is empty', 'When keys are strings'], correct: 1, why: 'dict.get returns None both for a missing key and for a key stored with value None. A module-level unique object used as the default distinguishes them.' }
      ]
    },
    {
      id: 'cpp-p6', title: 'Constrain a Template with a Concept', section: 'cpp-modern',
      tier: 'master', difficulty: 'Medium',
      prompt: 'Write a function template that averages a container of numbers, constrained so that passing a container of non-numeric elements is a clear compile error rather than a wall of template output.',
      examples: [
        { in: 'average(std::vector<int>{1,2,3})', out: '2.0', why: 'Integer elements are averaged as a double, so the result is not truncated.' },
        { in: 'average(std::vector<std::string>{"a"})', out: 'compile error naming the failed constraint', why: 'The concept rejects it at the call site instead of failing deep inside the body.' }
      ],
      constraints: ['Reject non-arithmetic element types at compile time.', 'Return a double.', 'Empty input returns 0.'],
      approach: 'Without a constraint, passing the wrong type still instantiates the template and fails somewhere inside the body, producing an error that points at your implementation rather than at the caller. A concept moves the check to the interface: the requirement is part of the signature, so overload resolution rejects the call and the compiler says which constraint failed. Constrain on the element type via std::ranges::range_value_t, require std::is_arithmetic on it, then accumulate into a double so integer division never truncates the result.',
      keyInsight: 'A concept turns a failure inside your implementation into a failure at the caller, which is where the mistake actually is.',
      pitfalls: [
        'Accumulating into the element type, so a vector of ints truncates every intermediate sum.',
        'Dividing by size() without guarding the empty case.',
        'Constraining the container rather than its element type.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], timeAnswer: 2,
      starter: { cpp: '#include <ranges>\n#include <concepts>\n#include <vector>\n\n// constrain this so non-numeric elements are rejected at the call site\ntemplate <typename R>\ndouble average(const R& r) {\n    return 0;\n}', python: 'def average(values):\n    """Average a sequence of numbers; 0 for empty."""\n    pass' },
      solution: {
        cpp: '#include <ranges>\n#include <concepts>\n#include <numeric>\n#include <vector>\n\ntemplate <std::ranges::input_range R>\n    requires std::is_arithmetic_v<std::ranges::range_value_t<R>>\ndouble average(const R& r) {\n    double sum = 0.0;          // accumulate as double, never the element type\n    std::size_t n = 0;\n    for (const auto& x : r) { sum += static_cast<double>(x); ++n; }\n    return n ? sum / static_cast<double>(n) : 0.0;\n}',
        python: 'from numbers import Number\n\ndef average(values):\n    # Python checks at runtime rather than compile time; raising a clear\n    # TypeError early is the closest equivalent to a concept.\n    total, n = 0.0, 0\n    for x in values:\n        if not isinstance(x, Number):\n            raise TypeError(f"average() needs numbers, got {type(x).__name__}")\n        total += x\n        n += 1\n    return total / n if n else 0.0'
      },
      checks: {
        cpp: [
          { re: 'requires|concept|std::integral|std::floating_point|is_arithmetic', hint: 'Constrain the template with a concept or requires clause.' },
          { re: 'double', hint: 'Accumulate and return as double.' },
          { re: 'for|accumulate', hint: 'Sum the elements.' },
          { re: '\\?|if', hint: 'Guard the empty case before dividing.' }
        ],
        python: [
          { re: 'isinstance|Number|TypeError', hint: 'Check the element type and fail clearly.' },
          { re: 'for|sum', hint: 'Sum the elements.' },
          { re: 'if|else', hint: 'Guard the empty case before dividing.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'What is the practical benefit of a concept over an unconstrained template?', opts: ['Faster runtime', 'The error is reported at the call site naming the failed requirement, instead of deep inside the template body', 'Smaller binaries', 'It allows more types'], correct: 1, why: 'Constraints participate in overload resolution, so the compiler rejects the call and names the requirement rather than failing during instantiation of your implementation.' },
        { q: 'Why accumulate into double rather than the element type?', opts: ['double is faster', 'With an integer element type, integer division and integer intermediate sums truncate the result', 'It uses less memory', 'It is required by the standard'], correct: 1, why: 'Summing ints into an int and dividing by an int performs integer division. Averaging 1, 2 and 2 would give 1 rather than 1.67.' }
      ]
    }
  ];

  const Q = [
    { id: 'q-cpp-001', section: 'cpp-core', tier: 'beginner', topic: 'initialisation',
      q: 'Which initialisation form rejects a narrowing conversion at compile time?',
      opts: ['int x = 3.9;', 'int x(3.9);', 'int x{3.9};', 'All three behave identically'],
      correct: 2, why: 'Brace initialisation forbids narrowing. The other two silently truncate 3.9 to 3, which is exactly the class of bug braces exist to catch.' },

    { id: 'q-cpp-002', section: 'cpp-core', tier: 'beginner', topic: 'auto',
      q: 'What is the deduced type of `auto s = "hello";`?',
      opts: ['std::string', 'const char*', 'char[6]', 'std::string_view'],
      correct: 1, why: 'A string literal is an array of const char that decays to const char*. To get a std::string you must say so, e.g. `auto s = std::string("hello");` or use the s suffix.' },

    { id: 'q-cpp-003', section: 'cpp-core', tier: 'intermediate', topic: 'parameter passing',
      q: 'What is the right default for a parameter of a large type the function will not modify?',
      opts: ['Pass by value', 'Pass by const reference', 'Pass by non-const reference', 'Pass by raw pointer'],
      correct: 1, why: 'const& avoids the copy and states that the function will not modify the argument. Pass by value only when you need your own copy anyway; use a pointer only when absence is meaningful.' },

    { id: 'q-cpp-004', section: 'cpp-core', tier: 'intermediate', topic: 'const',
      q: 'What does `int* const p` declare?',
      opts: ['A pointer to a const int', 'A const pointer to a mutable int', 'A const pointer to a const int', 'A reference to an int'],
      correct: 1, why: 'Read declarations right to left: p is a const pointer to int. You cannot repoint it, but you can modify what it points at. `const int* p` is the other way round.' },

    { id: 'q-cpp-005', section: 'cpp-core', tier: 'advanced', topic: 'lifetime',
      q: 'Why is returning a reference to a local variable undefined behaviour?',
      opts: ['References cannot be returned', 'The local is destroyed when the function returns, so the reference names freed storage', 'It causes a memory leak', 'It only fails in debug builds'],
      correct: 1, why: 'The local has automatic storage duration and ends at the closing brace. The returned reference points into a stack frame that no longer exists — it often appears to work, which is what makes it dangerous.' },

    { id: 'q-cpp-006', section: 'cpp-core', tier: 'advanced', topic: 'constexpr',
      q: 'What does constexpr guarantee that const does not?',
      opts: ['That the value cannot change', 'That the value is usable in a compile-time context such as an array bound or template argument', 'That the value lives in read-only memory', 'That the value is thread-safe'],
      correct: 1, why: 'const means "not modified through this name", and a const value can still be computed at runtime. constexpr means the value is available during compilation, which is what array bounds and template arguments require.' },

    { id: 'q-cpp-007', section: 'cpp-memory', tier: 'beginner', topic: 'stack vs heap',
      q: 'What frees a stack-allocated local variable?',
      opts: ['The garbage collector', 'Scope exit, automatically, including during exception unwinding', 'An explicit delete', 'The operating system at process exit'],
      correct: 1, why: 'Automatic storage is reclaimed when the enclosing scope ends. That guarantee is what RAII is built on: it holds on the exceptional path too.' },

    { id: 'q-cpp-008', section: 'cpp-memory', tier: 'intermediate', topic: 'leaks',
      q: 'What exactly is a memory leak?',
      opts: ['Memory that is still allocated when the program ends', 'Allocated memory that nothing holds a pointer to any more, so it can never be freed', 'Memory that was freed twice', 'Memory that was never written to'],
      correct: 1, why: 'Reachability is the criterion. Long-lived allocations are fine if something still points at them; the leak is losing the last pointer, which makes freeing impossible.' },

    { id: 'q-cpp-009', section: 'cpp-memory', tier: 'intermediate', topic: 'smart pointers',
      q: 'Which smart pointer should be your default choice?',
      opts: ['shared_ptr, because sharing is safest', 'unique_ptr, because single ownership is cheaper and clearer', 'weak_ptr, because it never keeps anything alive', 'auto_ptr, for compatibility'],
      correct: 1, why: 'unique_ptr has no reference count and therefore no atomic overhead, and it makes ownership explicit. Upgrade to shared_ptr only when several owners genuinely exist. auto_ptr was removed from the language.' },

    { id: 'q-cpp-010', section: 'cpp-memory', tier: 'advanced', topic: 'shared_ptr',
      q: 'Two objects hold shared_ptrs to each other. What happens?',
      opts: ['The cycle is collected automatically', 'Neither reference count ever reaches zero, so neither is freed', 'The program crashes on exit', 'The compiler rejects it'],
      correct: 1, why: 'Reference counting cannot detect cycles. Each keeps the other alive forever. Break the cycle by making one direction a weak_ptr, which observes without owning.' },

    { id: 'q-cpp-011', section: 'cpp-memory', tier: 'advanced', topic: 'RAII',
      q: 'Why is RAII more reliable than remembering to call cleanup at the end of a function?',
      opts: ['It is faster', 'A destructor runs on every exit path, including early returns and exception unwinding; a cleanup statement only runs if control reaches it', 'It uses less memory', 'It prevents all bugs'],
      correct: 1, why: 'The cleanup statement is skipped by any throw or early return. Tying release to a destructor makes it unconditional, which is the entire value of the pattern.' },

    { id: 'q-cpp-012', section: 'cpp-memory', tier: 'master', topic: 'move semantics',
      q: 'What must a move constructor do after taking the source object\'s resource?',
      opts: ['Nothing else', 'Leave the source in a valid state that owns nothing, typically by nulling its pointer', 'Delete the source', 'Copy the resource as a backup'],
      correct: 1, why: 'The source is still a live object and its destructor will run. If it still holds the pointer, the resource is released twice.' },

    { id: 'q-cpp-013', section: 'cpp-memory', tier: 'master', topic: 'noexcept',
      q: 'Why does std::vector copy your elements on reallocation if their move constructor is not noexcept?',
      opts: ['A bug in the standard library', 'To preserve the strong exception guarantee, since a throwing move cannot be rolled back partway through relocation', 'Because moves are slower for small types', 'Because copy is required for trivial types'],
      correct: 1, why: 'If a move throws halfway through, the already-moved-from elements cannot be restored. Copying leaves the original buffer intact and recoverable, so vector chooses it unless the move promises not to throw.' },

    { id: 'q-cpp-014', section: 'cpp-memory', tier: 'advanced', topic: 'arrays',
      q: 'You allocated with `new int[n]`. Which release is correct?',
      opts: ['delete p;', 'delete[] p;', 'free(p);', 'Either delete form works'],
      correct: 1, why: 'Array new must be paired with delete[]. Mismatching them is undefined behaviour, and free() never pairs with new because it does not run destructors.' },

    { id: 'q-cpp-015', section: 'cpp-oop', tier: 'intermediate', topic: 'encapsulation',
      q: 'What is the practical argument for private data with public methods?',
      opts: ['It runs faster', 'The class controls every path that can change its state, so it can keep an invariant true', 'It uses less memory', 'It is required for inheritance'],
      correct: 1, why: 'An invariant you cannot enforce is a comment. Funnelling mutation through methods is what lets a class guarantee, say, that its size field always matches its contents.' },

    { id: 'q-cpp-016', section: 'cpp-oop', tier: 'intermediate', topic: 'initialiser lists',
      q: 'Why prefer a constructor initialiser list over assigning in the body?',
      opts: ['It is shorter', 'Members are constructed directly with the right value instead of being default-constructed and then assigned — and const and reference members can only be initialised this way', 'It avoids exceptions', 'The body cannot access members'],
      correct: 1, why: 'Members are always initialised before the body runs. Assigning in the body means a wasted default construction, and const or reference members cannot be assigned at all.' },

    { id: 'q-cpp-017', section: 'cpp-oop', tier: 'advanced', topic: 'virtual dispatch',
      q: 'A non-virtual method is called through a base reference to a derived object. Which runs?',
      opts: ['The derived override', 'The base version, because non-virtual calls are resolved from the static type', 'It is ambiguous and fails to compile', 'Both, base first'],
      correct: 1, why: 'Without virtual, the compiler binds the call at compile time using the declared type of the expression. Only virtual functions consult the object\'s actual type at run time.' },

    { id: 'q-cpp-018', section: 'cpp-oop', tier: 'advanced', topic: 'slicing',
      q: 'What is object slicing?',
      opts: ['Splitting a class into several files', 'Copying a derived object into a base-typed variable, which discards the derived part', 'Dividing a vector into subranges', 'Removing a base class'],
      correct: 1, why: 'A base-typed variable is only big enough for the base subobject, so the derived members are cut away. Passing or storing by reference or pointer avoids it.' },

    { id: 'q-cpp-019', section: 'cpp-oop', tier: 'advanced', topic: 'override',
      q: 'What does the `override` keyword buy you?',
      opts: ['It makes the function virtual', 'It makes the compiler verify that the function really does override a base virtual, catching signature typos', 'It improves performance', 'It prevents further overriding'],
      correct: 1, why: 'Without it, a slightly wrong signature silently declares a new function instead of overriding, and the base version keeps being called. `final` is what prevents further overriding.' },

    { id: 'q-cpp-020', section: 'cpp-oop', tier: 'master', topic: 'abstract classes',
      q: 'What makes a class abstract in C++?',
      opts: ['Marking it with the abstract keyword', 'Declaring at least one pure virtual function, written `= 0`', 'Making the constructor private', 'Having no data members'],
      correct: 1, why: 'C++ has no abstract keyword. A pure virtual function makes the class impossible to instantiate directly, which is how interfaces are expressed.' },

    { id: 'q-cpp-021', section: 'cpp-oop', tier: 'master', topic: 'templates',
      q: 'When is a function template instantiated?',
      opts: ['When the program starts', 'At compile time, once per distinct set of template arguments actually used', 'On every call', 'Only in release builds'],
      correct: 1, why: 'Templates are compile-time code generation. Each distinct instantiation produces separate code, which is why heavy template use grows both build time and binary size.' },

    { id: 'q-cpp-022', section: 'cpp-modern', tier: 'intermediate', topic: 'structured bindings',
      q: 'What does `for (const auto& [k, v] : myMap)` do?',
      opts: ['Creates two new maps', 'Destructures each pair into named references to its key and value', 'Copies the map', 'Iterates keys only'],
      correct: 1, why: 'Structured bindings unpack each element in place. Taking it by const& avoids copying the pair on every iteration.' },

    { id: 'q-cpp-023', section: 'cpp-modern', tier: 'intermediate', topic: 'optional',
      q: 'What problem does std::optional solve that a sentinel value does not?',
      opts: ['It is faster', 'Absence gets its own representation, so no legitimate value has to be sacrificed to mean "nothing"', 'It prevents exceptions', 'It reduces memory usage'],
      correct: 1, why: 'A sentinel like -1 collides the moment -1 becomes a legal value. optional stores a separate flag, so every value in the range stays usable.' },

    { id: 'q-cpp-024', section: 'cpp-modern', tier: 'advanced', topic: 'string_view',
      q: 'What is the main hazard of std::string_view?',
      opts: ['It copies the string', 'It does not own the characters, so it dangles if the underlying string is destroyed or modified', 'It is slower than std::string', 'It cannot hold empty strings'],
      correct: 1, why: 'A view is a pointer and a length. Binding one to a temporary, or keeping it after the owner is reallocated, leaves it pointing at freed memory.' },

    { id: 'q-cpp-025', section: 'cpp-modern', tier: 'advanced', topic: 'if constexpr',
      q: 'How does `if constexpr` differ from a plain `if`?',
      opts: ['It runs faster at runtime', 'The branch not taken is discarded during instantiation, so it need not even compile for that type', 'It only works with integers', 'It evaluates both branches'],
      correct: 1, why: 'The condition is evaluated at compile time and the false branch is not instantiated. That is what lets one template body handle types for which the other branch would be ill-formed.' },

    { id: 'q-cpp-026', section: 'cpp-modern', tier: 'advanced', topic: 'concepts',
      q: 'What is the main practical benefit of concepts?',
      opts: ['Faster compilation of every program', 'Constraint failures are reported at the call site naming the requirement, instead of as errors deep inside the template body', 'They replace inheritance', 'They allow runtime type checks'],
      correct: 1, why: 'Constraints participate in overload resolution, so the call is rejected before instantiation and the message names the unsatisfied requirement.' },

    { id: 'q-cpp-027', section: 'cpp-modern', tier: 'master', topic: 'ranges',
      q: 'What does it mean that C++20 range views are lazy?',
      opts: ['They cache their results', 'No intermediate container is produced; elements are transformed one at a time as they are consumed', 'They run on another thread', 'They must be materialised before use'],
      correct: 1, why: 'A filter-then-transform pipeline over a million elements allocates nothing. Each element flows through the whole chain on demand, which is why views compose without cost.' },

    { id: 'q-cpp-028', section: 'cpp-modern', tier: 'master', topic: 'expected',
      q: 'What does std::expected<T, E> give you that std::optional<T> does not?',
      opts: ['Better performance', 'The reason for failure, carried in the error type, rather than only the fact of it', 'Thread safety', 'Automatic retries'],
      correct: 1, why: 'optional says something is missing. expected says why, which is what lets a caller distinguish "file not found" from "permission denied" without exceptions.' },

    { id: 'q-cpp-029', section: 'cpp-modern', tier: 'master', topic: 'spaceship',
      q: 'What does `auto operator<=>(const Point&) const = default;` generate?',
      opts: ['Only operator<', 'All six relational and equality comparisons, derived memberwise', 'A hash function', 'A copy constructor'],
      correct: 1, why: 'The three-way comparison operator lets the compiler synthesise <, <=, >, >=, == and != from a single defaulted declaration, comparing members in declaration order.' },

    { id: 'q-cpp-030', section: 'cpp-core', tier: 'master', topic: 'undefined behaviour',
      q: 'Why is undefined behaviour especially dangerous compared with a plain crash?',
      opts: ['It always corrupts the disk', 'The compiler is allowed to assume it never happens, so it may optimise away the very checks that would have caught it — and the program may appear to work', 'It only occurs in release builds', 'It is always detected by the compiler'],
      correct: 1, why: 'Optimisers reason from the assumption that UB does not occur. A null check after a dereference can be deleted as provably redundant, so the symptom appears far from the cause and often only under optimisation.' }
  ];

  window.DB.lessons.push.apply(window.DB.lessons, L);
  window.DB.problems.push.apply(window.DB.problems, P);
  window.DB.questions.push.apply(window.DB.questions, Q);
})();
