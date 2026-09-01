/* realworld-cpp.js — patterns lifted from production C++ codebases.
 *
 * Grounded in: ggml-org/llama.cpp, ggml-org/whisper.cpp, nlohmann/json,
 * msgpack/msgpack-c, danmar/cppcheck and facebook/infer. The point is to move
 * from "I can pass a LeetCode test" to "I can read and reason about the C++ that
 * actually ships": ownership at scale, data-oriented layout, binary formats,
 * and the undefined behaviour that static analysers exist to catch.
 */
(function () {
  'use strict';

  const L = [
    {
      id: 'rw-header-only', track: 'cpp', section: 'rw-cpp', tier: 'advanced', order: 1,
      title: 'Header-only libraries and the nlohmann/json design',
      summary: 'Why a whole JSON library ships as one header, and what that costs you.',
      minutes: 14,
      body: '<p><code>nlohmann/json</code> is the most-used C++ JSON library and it ships as a single header. Understanding why teaches you most of what is interesting about modern C++ library design.</p>' +
        '<h3>One type, many shapes</h3>' +
        '<p>A JSON value is a tagged union: null, bool, number, string, array, or object. The library models this with a discriminant plus a union of pointers, which is the same shape as <code>std::variant</code> but hand-rolled for control over the layout.</p>' +
        '<pre class="code">// the shape, simplified\nenum class value_t { null, object, array, string, boolean, number_integer, number_float };\n\nunion json_value {\n    object_t*  object;\n    array_t*   array;\n    string_t*  string;\n    bool       boolean;\n    int64_t    number_integer;\n    double     number_float;\n};</pre>' +
        '<h3>The convenience that bites</h3>' +
        '<p><code>operator[]</code> on a missing key <em>creates</em> it, exactly like <code>std::map</code>. That makes reading code look clean and silently corrupts data.</p>' +
        '<pre class="code">json cfg = json::parse(text);\n\n// COMMON MISTAKE: inserts a null "timeuot" and returns it\nint t = cfg["timeuot"].get&lt;int&gt;();   // typo, no error, garbage value\n\n// FIX: at() throws on a missing key\nint t = cfg.at("timeout").get&lt;int&gt;();\n\n// or be explicit about the default\nint t = cfg.value("timeout", 30);</pre>' +
        '<h3>ADL-based serialisation</h3>' +
        '<p>To teach the library about your own type you do not specialise a template inside its namespace. You write free functions named <code>to_json</code> and <code>from_json</code> next to your type, and argument-dependent lookup finds them.</p>' +
        '<pre class="code">namespace app {\n    struct Point { int x, y; };\n\n    void to_json(nlohmann::json&amp; j, const Point&amp; p) {\n        j = nlohmann::json{{"x", p.x}, {"y", p.y}};\n    }\n    void from_json(const nlohmann::json&amp; j, Point&amp; p) {\n        j.at("x").get_to(p.x);\n        j.at("y").get_to(p.y);\n    }\n}</pre>' +
        '<p>This is the extension mechanism you should reach for whenever you want users to opt a type into your library without editing your headers.</p>' +
        '<h3>What header-only costs</h3>' +
        '<p>Every translation unit that includes it re-parses and re-instantiates the templates. On a large project that is minutes of build time. The mitigations are the ones you would use for any heavy template header: include it in as few translation units as possible, hide it behind your own thin interface, and use the forward-declaration header where the library provides one.</p>',
      quizNote: true
    },
    {
      id: 'rw-binary-formats', track: 'cpp', section: 'rw-cpp', tier: 'advanced', order: 2,
      title: 'Binary serialisation: msgpack-c and wire formats',
      summary: 'Varints, zero-copy views, arenas, and why endianness still matters.',
      minutes: 13,
      body: '<p>JSON is for humans. When you need throughput you reach for a binary format, and <code>msgpack-c</code> is a good one to study because the spec is small enough to hold in your head.</p>' +
        '<h3>Type-tagged, length-prefixed</h3>' +
        '<p>Every value starts with a tag byte. Small values pack the payload into the tag itself: a positive integer below 128 is a single byte, and a short string encodes its length in the low bits of the tag. That is why MessagePack beats JSON on size without any compression.</p>' +
        '<pre class="code">// 0x00..0x7f  positive fixint   (value in the tag)\n// 0xa0..0xbf  fixstr           (length in the low 5 bits)\n// 0xcc        uint8            (1 more byte)\n// 0xcd        uint16           (2 more bytes, BIG endian)\n// 0xce        uint32           (4 more bytes, BIG endian)</pre>' +
        '<h3>The endianness trap</h3>' +
        '<p>MessagePack is big-endian on the wire; x86 and ARM are little-endian in memory. Writing an integer by memcpy-ing its bytes works on your laptop and produces garbage on the other end.</p>' +
        '<pre class="code">// COMMON MISTAKE: host byte order leaks onto the wire\nuint32_t n = 1;\nout.append(reinterpret_cast&lt;char*&gt;(&amp;n), 4);   // 01 00 00 00 on x86\n\n// FIX: serialise byte by byte, most significant first\nout.push_back(char((n &gt;&gt; 24) &amp; 0xff));\nout.push_back(char((n &gt;&gt; 16) &amp; 0xff));\nout.push_back(char((n &gt;&gt;  8) &amp; 0xff));\nout.push_back(char( n        &amp; 0xff));</pre>' +
        '<h3>Zero-copy and the zone</h3>' +
        '<p>The interesting design decision in msgpack-c is <code>msgpack::object</code>: a parsed value that <em>points into the original buffer</em> rather than copying strings out of it. Lifetime is managed by a <code>zone</code>, an arena that owns everything the parse allocated and frees it in one shot.</p>' +
        '<p>This is a pattern worth stealing. When you parse a large message and use it briefly, an arena turns thousands of small allocations into one, and destruction from O(n) frees into a single pointer reset.</p>' +
        '<pre class="code">// the danger: the view must not outlive the buffer\nmsgpack::object_handle oh = msgpack::unpack(buf.data(), buf.size());\nmsgpack::object obj = oh.get();     // points INTO buf\n// using obj after buf is destroyed is a dangling read</pre>' +
        '<p>Any API that hands you a view — <code>std::string_view</code>, <code>std::span</code>, a msgpack object — moves lifetime management onto you. That is the trade you accept for not copying.</p>'
    },
    {
      id: 'rw-data-oriented', track: 'cpp', section: 'rw-cpp', tier: 'master', order: 3,
      title: 'Data-oriented design: what llama.cpp and ggml get right',
      summary: 'Quantisation, memory mapping, alignment, and writing for the cache.',
      minutes: 16,
      body: '<p><code>llama.cpp</code> runs large language models on a laptop. It does that with no heavyweight dependencies and a compute core, <code>ggml</code>, written in plain C. The techniques are general performance engineering.</p>' +
        '<h3>Quantisation: trading precision for bandwidth</h3>' +
        '<p>Model weights start as 32-bit floats. Inference is bandwidth-bound, not compute-bound, so the win comes from making the weights smaller. Quantisation stores a block of weights as small integers plus a shared scale.</p>' +
        '<pre class="code">// the idea behind a 4-bit block quant, simplified\nstruct block_q4 {\n    float   scale;      // one scale per block\n    uint8_t qs[16];     // 32 weights, 4 bits each, packed two per byte\n};\n// 32 floats = 128 bytes  ->  block = 4 + 16 = 20 bytes</pre>' +
        '<p>Dequantising is <code>value = scale * (q - 8)</code>. The error is real but small, and moving a fifth of the bytes through memory is worth far more than the lost precision.</p>' +
        '<h3>Memory mapping the model</h3>' +
        '<p>A multi-gigabyte model is not read into a buffer. It is <code>mmap</code>-ed, so pages load lazily on first touch and the OS page cache is shared between processes. Startup becomes instant and a second process pays nothing.</p>' +
        '<pre class="code">// RAII around a mapping — the only safe way to hold one\nclass MappedFile {\n    void*  addr_ = nullptr;\n    size_t size_ = 0;\npublic:\n    explicit MappedFile(const char* path);   // open + fstat + mmap\n    ~MappedFile() { if (addr_) munmap(addr_, size_); }\n\n    MappedFile(const MappedFile&amp;)            = delete;\n    MappedFile&amp; operator=(const MappedFile&amp;) = delete;\n    MappedFile(MappedFile&amp;&amp; o) noexcept\n        : addr_(o.addr_), size_(o.size_) { o.addr_ = nullptr; o.size_ = 0; }\n\n    const void* data() const { return addr_; }\n    size_t      size() const { return size_; }\n};</pre>' +
        '<p>Note the shape: destructor releases, copy deleted, move nulls the source. That is the Rule of Five applied to a non-memory resource, and it is the single most valuable C++ habit this section can give you.</p>' +
        '<h3>Alignment and the cache line</h3>' +
        '<p>SIMD loads want 32- or 64-byte alignment. A cache line is 64 bytes. Two threads writing different variables that share a line will ping-pong that line between cores — false sharing — and the code will run slower with more threads.</p>' +
        '<pre class="code">// COMMON MISTAKE: counters share a cache line\nstruct Counters { std::atomic&lt;long&gt; a, b; };   // 16 bytes, same line\n\n// FIX: pad each to its own line\nstruct alignas(64) Padded { std::atomic&lt;long&gt; v; char pad[64 - sizeof(v)]; };\nstruct Counters { Padded a, b; };</pre>' +
        '<h3>Struct of arrays</h3>' +
        '<p>If you loop over one field of a million objects, an array of structs drags every other field through the cache with it. Splitting into parallel arrays — struct of arrays — means every byte you load is a byte you use.</p>'
    },
    {
      id: 'rw-streaming-audio', track: 'cpp', section: 'rw-cpp', tier: 'advanced', order: 4,
      title: 'Real-time constraints: whisper.cpp and streaming buffers',
      summary: 'Ring buffers, fixed budgets, and why you never allocate in the audio path.',
      minutes: 12,
      body: '<p><code>whisper.cpp</code> runs speech recognition on the same ggml core. What it adds is a real-time pipeline, and real-time code obeys rules that ordinary code does not.</p>' +
        '<h3>The audio callback rule</h3>' +
        '<p>An audio callback runs on a high-priority thread with a hard deadline — miss it and the user hears a click. So inside it you must not allocate, must not lock a mutex that another thread can hold, must not do I/O, and must not throw. Everything is preallocated.</p>' +
        '<h3>Ring buffer</h3>' +
        '<p>The producer (device) and consumer (model) run at different rates, so samples land in a fixed-size circular buffer.</p>' +
        '<pre class="code">class RingBuffer {\n    std::vector&lt;float&gt; buf_;\n    size_t head_ = 0, count_ = 0;\npublic:\n    explicit RingBuffer(size_t cap) : buf_(cap) {}\n\n    void push(float s) {\n        size_t tail = (head_ + count_) % buf_.size();\n        buf_[tail] = s;\n        if (count_ == buf_.size()) head_ = (head_ + 1) % buf_.size();  // overwrite oldest\n        else ++count_;\n    }\n\n    bool pop(float&amp; out) {\n        if (count_ == 0) return false;\n        out = buf_[head_];\n        head_ = (head_ + 1) % buf_.size();\n        --count_;\n        return true;\n    }\n};</pre>' +
        '<p>Note there is no <code>new</code> anywhere after construction. The modulo is the whole trick: capacity is fixed, and the indices wrap.</p>' +
        '<h3>Overlapping windows</h3>' +
        '<p>Transcription runs on windows of audio. If windows simply abut, a word straddling the boundary is cut in half and both halves transcribe wrongly. So consecutive windows overlap, and the overlap is reconciled. Any streaming pipeline over chunked data — logs, network packets, sensor readings — has this same boundary problem.</p>'
    },
    {
      id: 'rw-static-analysis', track: 'cpp', section: 'rw-cpp', tier: 'master', order: 5,
      title: 'What cppcheck and Infer find that your tests do not',
      summary: 'The undefined behaviour catalogue, and how to read an analyser report.',
      minutes: 14,
      body: '<p><code>cppcheck</code> and Facebook\'s <code>infer</code> exist because C++ lets you write code that is wrong in ways the compiler accepts and your tests pass. Knowing what they look for is knowing where C++ actually hurts.</p>' +
        '<h3>The catalogue</h3>' +
        '<table><thead><tr><th>Defect</th><th>Why tests miss it</th></tr></thead><tbody>' +
        '<tr><td>Buffer overrun</td><td>Reads adjacent memory that usually holds something harmless</td></tr>' +
        '<tr><td>Use after free</td><td>The freed block is often still intact when you read it</td></tr>' +
        '<tr><td>Uninitialised read</td><td>Stack memory is frequently zero in a debug build</td></tr>' +
        '<tr><td>Null dereference</td><td>Only on the error path nobody tested</td></tr>' +
        '<tr><td>Resource leak</td><td>Short-lived processes exit before it matters</td></tr>' +
        '<tr><td>Iterator invalidation</td><td>Small containers do not reallocate</td></tr>' +
        '</tbody></table>' +
        '<h3>The classic one</h3>' +
        '<pre class="code">std::vector&lt;int&gt; v = {1, 2, 3};\nint&amp; first = v[0];\nv.push_back(4);        // may reallocate the whole buffer\nfirst = 99;            // COMMON MISTAKE: writes to freed memory\n\n// FIX: take the reference after you are done growing,\n// or reserve up front so no reallocation happens\nv.reserve(4);\nint&amp; safe = v[0];\nv.push_back(4);        // no reallocation, reference still valid</pre>' +
        '<h3>How Infer differs</h3>' +
        '<p><code>cppcheck</code> matches patterns in one function at a time and is fast and easy to run. <code>infer</code> does interprocedural analysis using separation logic: it builds a proof about what each function does to the heap, then composes those proofs across call sites. That lets it find a null dereference where the null originates three functions away — the kind no pattern matcher will ever see.</p>' +
        '<h3>Reading a report</h3>' +
        '<p>Both tools produce false positives. The discipline is to triage rather than to bulk-suppress: for each finding, either fix it, or write down the invariant that makes it safe. If you cannot state that invariant, the tool is probably right.</p>' +
        '<blockquote>A suppression without a comment explaining why the code is safe is a bug with paperwork.</blockquote>' +
        '<h3>Turn the compiler up first</h3>' +
        '<pre class="code"># cheapest wins available, before any external tool\ng++ -std=c++20 -Wall -Wextra -Wpedantic -Wshadow -Wconversion \\\n    -fsanitize=address,undefined -g -O1 main.cpp\n\n# AddressSanitizer catches overruns and use-after-free AT RUNTIME\n# UndefinedBehaviorSanitizer catches signed overflow, bad shifts, misaligned loads</pre>'
    }
  ];

  const P = [
    {
      id: 'rw-json-value', title: 'Tagged Union JSON Value', section: 'rw-cpp',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Implement a minimal JSON value type that can hold null, a bool, a double, or a string, and report which kind it currently holds.\n\nProvide a way to construct each kind and a type() query. In C++ use std::variant; in Python model the same tagged shape explicitly.',
      examples: [
        { in: 'Value v(42.0); v.type()', out: '"number"', why: 'A double-constructed value reports the number tag.' },
        { in: 'Value v; v.type()', out: '"null"', why: 'A default-constructed JSON value is null, not empty or undefined.' }
      ],
      constraints: ['Exactly four kinds: null, bool, number, string.', 'type() must be O(1).'],
      approach: 'A JSON value is a sum type: it is exactly one of several kinds at a time. The C++ tool for that is std::variant, which stores a discriminant plus enough space for the largest alternative, and std::holds_alternative or index() tells you which arm is live. Order the variant alternatives deliberately, because index 0 is what a default-constructed variant holds — putting the null type first makes default construction mean null for free. In Python there is no variant, so you carry the tag yourself and keep the payload in one attribute.',
      keyInsight: 'A tagged union is a discriminant plus a payload. std::variant gives you both, and puts the default at alternative 0 — so list null first.',
      pitfalls: [
        'Using a raw union without a tag: you lose the ability to know which member is live, and non-trivial members like std::string will not be destroyed.',
        'Putting std::string first in the variant, which makes a default-constructed value an empty string rather than null.',
        'Comparing with == against a bool when the value holds a number — in C++ a double implicitly converts to bool and the check silently succeeds.'
      ],
      complexity: { time: 'O(1)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], timeAnswer: 0,
      starter: {
        cpp: '#include <variant>\n#include <string>\n\nclass Value {\n    // store the alternatives here\npublic:\n    Value();                    // null\n    Value(bool b);\n    Value(double d);\n    Value(std::string s);\n    std::string type() const;   // "null" | "bool" | "number" | "string"\n};',
        python: 'class Value:\n    def __init__(self, payload=None):\n        # record the tag and the payload\n        pass\n\n    def type(self):\n        # return "null" | "bool" | "number" | "string"\n        pass'
      },
      solution: {
        cpp: '#include <variant>\n#include <string>\n\nclass Value {\n    // null must be alternative 0 so a default variant is null\n    std::variant<std::monostate, bool, double, std::string> v_;\npublic:\n    Value() = default;\n    Value(bool b)        : v_(b) {}\n    Value(double d)      : v_(d) {}\n    Value(std::string s) : v_(std::move(s)) {}\n\n    std::string type() const {\n        switch (v_.index()) {\n            case 0:  return "null";\n            case 1:  return "bool";\n            case 2:  return "number";\n            default: return "string";\n        }\n    }\n};',
        python: 'class Value:\n    def __init__(self, payload=None):\n        self.payload = payload\n        if payload is None:\n            self.tag = "null"\n        elif isinstance(payload, bool):     # before int/float: bool IS an int\n            self.tag = "bool"\n        elif isinstance(payload, (int, float)):\n            self.tag = "number"\n        elif isinstance(payload, str):\n            self.tag = "string"\n        else:\n            raise TypeError("unsupported JSON type")\n\n    def type(self):\n        return self.tag'
      },
      checks: {
        cpp: [
          { re: 'variant\\s*<|union|enum', hint: 'Hold the alternatives in a std::variant (or a tag plus a union).' },
          { re: 'monostate|null', hint: 'Represent JSON null explicitly — std::monostate is the idiomatic empty alternative.' },
          { re: 'index\\s*\\(\\s*\\)|holds_alternative|get_if', hint: 'Query which alternative is live rather than guessing.' },
          { re: 'return', hint: 'type() returns the tag name.' }
        ],
        python: [
          { re: 'self\\.\\w+\\s*=', hint: 'Store the tag on the instance.' },
          { re: 'isinstance|type\\s*\\(', hint: 'Decide the tag from the payload type.' },
          { re: 'bool', hint: 'Check bool before int — in Python bool is a subclass of int.' },
          { re: 'return', hint: 'type() returns the tag name.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why does std::monostate come first in the variant?',
          opts: ['It is alphabetically first', 'A default-constructed variant holds alternative 0, so this makes the default value null', 'It is the smallest type', 'std::variant requires it'],
          correct: 1,
          why: 'std::variant default-constructs its first alternative. Putting monostate first makes a default-constructed Value mean JSON null, which is what the format says it should be.' },
        { q: 'In the Python version, why is the bool check before the number check?',
          opts: ['Booleans are more common', 'bool is a subclass of int, so isinstance(True, int) is True and the number branch would swallow it', 'It runs faster', 'Python evaluates in reverse order'],
          correct: 1,
          why: 'bool inherits from int in Python, so isinstance(True, (int, float)) is True. Checking bool first is the only way to tag it correctly.' }
      ]
    },

    {
      id: 'rw-varint-encode', title: 'MessagePack-style Integer Encoding', section: 'rw-cpp',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Encode a non-negative integer into MessagePack\'s tag-prefixed binary form and return the bytes.\n\nRules: values 0-127 encode as a single byte equal to the value. Values 128-255 encode as 0xcc followed by one byte. Values 256-65535 encode as 0xcd followed by two big-endian bytes. Everything larger encodes as 0xce followed by four big-endian bytes.',
      examples: [
        { in: 'encode(5)', out: '[0x05]', why: 'Below 128, so the value is its own tag — one byte total.' },
        { in: 'encode(200)', out: '[0xcc, 0xc8]', why: 'Needs 8 bits, so the uint8 tag plus the byte.' },
        { in: 'encode(1)', out: '[0x01]', why: 'Small values never use a wider form, even though 0xce would also be legal.' },
        { in: 'encode(65536)', out: '[0xce, 0x00, 0x01, 0x00, 0x00]', why: 'Exceeds 16 bits, so uint32, most significant byte first.' }
      ],
      constraints: ['Input is a non-negative integer below 2^32.', 'Always choose the shortest legal encoding.', 'Multi-byte integers are big-endian.'],
      approach: 'Pick the narrowest bucket the value fits in, emit the tag for that bucket, then emit the payload bytes most significant first. Big-endian output is produced by shifting right by 8*(k-1), 8*(k-2), ... and masking each result with 0xff. Do not memcpy the integer: that writes host byte order, which is little-endian on x86 and ARM, and the receiver will read the bytes backwards. The shortest-form rule matters because decoders are written against it and a needlessly wide encoding wastes exactly the bandwidth the format exists to save.',
      keyInsight: 'Shift-and-mask, most significant byte first. Never memcpy an integer onto a wire — that leaks host endianness.',
      pitfalls: [
        'Using memcpy or reinterpret_cast on the integer, which emits little-endian bytes on x86.',
        'Emitting little-endian order by shifting up instead of down.',
        'Always using the 4-byte form; decoders expect the shortest encoding.',
        'Getting the boundaries wrong — 127 is single-byte, 128 is not; 255 is uint8, 256 is not.'
      ],
      complexity: { time: 'O(1)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: {
        cpp: '#include <vector>\n#include <cstdint>\n\nstd::vector<uint8_t> encode(uint32_t n) {\n    std::vector<uint8_t> out;\n    // choose the tag, then append the payload big-endian\n    return out;\n}',
        python: 'def encode(n):\n    """Return a list of byte values."""\n    # choose the tag, then append the payload big-endian\n    pass'
      },
      solution: {
        cpp: '#include <vector>\n#include <cstdint>\n\nstd::vector<uint8_t> encode(uint32_t n) {\n    std::vector<uint8_t> out;\n    if (n < 128) {\n        out.push_back(uint8_t(n));            // positive fixint\n    } else if (n <= 0xff) {\n        out.push_back(0xcc);\n        out.push_back(uint8_t(n));\n    } else if (n <= 0xffff) {\n        out.push_back(0xcd);\n        out.push_back(uint8_t((n >> 8) & 0xff));\n        out.push_back(uint8_t(n & 0xff));\n    } else {\n        out.push_back(0xce);\n        out.push_back(uint8_t((n >> 24) & 0xff));\n        out.push_back(uint8_t((n >> 16) & 0xff));\n        out.push_back(uint8_t((n >> 8) & 0xff));\n        out.push_back(uint8_t(n & 0xff));\n    }\n    return out;\n}',
        python: 'def encode(n):\n    if n < 128:\n        return [n]\n    if n <= 0xff:\n        return [0xcc, n]\n    if n <= 0xffff:\n        return [0xcd, (n >> 8) & 0xff, n & 0xff]\n    return [0xce,\n            (n >> 24) & 0xff,\n            (n >> 16) & 0xff,\n            (n >> 8) & 0xff,\n            n & 0xff]'
      },
      checks: {
        cpp: [
          { re: '128|0x80', hint: 'Handle the single-byte fixint range below 128.' },
          { re: '0xcc|204', hint: 'Emit the uint8 tag 0xcc for values that need one payload byte.' },
          { re: '>>\\s*8', hint: 'Shift right to pull out the high bytes — big-endian order.' },
          { re: '0xff|255', hint: 'Mask each shifted byte with 0xff.' }
        ],
        python: [
          { re: '128|0x80', hint: 'Handle the single-byte fixint range below 128.' },
          { re: '0xcc|204', hint: 'Emit the uint8 tag 0xcc for values that need one payload byte.' },
          { re: '>>\\s*8', hint: 'Shift right to pull out the high bytes — big-endian order.' },
          { re: '0xff|255', hint: 'Mask each shifted byte with 0xff.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'memcpy|reinterpret_cast', hint: 'memcpy writes host byte order (little-endian on x86) — the wire format is big-endian. Shift and mask instead.' }],
        python: [{ re: 'to_bytes\\s*\\([^)]*little', hint: 'The wire format is big-endian; "little" produces reversed bytes.' }]
      },
      mcq: [
        { q: 'Why is memcpy of a uint32 onto the wire a bug?',
          opts: ['It is slower than shifting', 'It emits host byte order, which is little-endian on x86 and ARM, while the format is big-endian', 'It allocates memory', 'memcpy cannot copy integers'],
          correct: 1,
          why: 'memcpy reproduces the in-memory layout. On a little-endian CPU that puts the least significant byte first, so a big-endian reader decodes the value backwards.' },
        { q: 'What breaks if you always use the 0xce four-byte form?',
          opts: ['Nothing — it is still decodable, but it wastes the bandwidth the format exists to save', 'Decoding fails outright', 'The value overflows', 'Negative numbers become positive'],
          correct: 0,
          why: 'A conforming decoder still reads it. You just paid five bytes to send a number that fit in one, which defeats the point of a compact binary format.' }
      ]
    },

    {
      id: 'rw-ring-buffer', title: 'Fixed-Capacity Ring Buffer', section: 'rw-cpp',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Implement a fixed-capacity circular buffer for audio samples.\n\npush(x) adds a sample; when the buffer is full it overwrites the oldest sample. pop() removes and returns the oldest sample, reporting whether one was available. No allocation may happen after construction.',
      examples: [
        { in: 'cap 3; push 1,2,3,4; then pop three times', out: '2, 3, 4', why: 'Pushing the fourth sample into a full buffer drops the oldest (1) and advances the head.' },
        { in: 'cap 2; pop() on an empty buffer', out: 'false', why: 'An empty buffer reports failure rather than returning a garbage sample.' }
      ],
      constraints: ['Capacity is fixed at construction.', 'push and pop must be O(1).', 'No allocation after the constructor — this runs in an audio callback.'],
      approach: 'Keep a vector sized to capacity once, plus a head index and a live count. The tail is derived, not stored: tail = (head + count) % capacity. push writes at the tail; if the buffer was already full it also advances head, which is what makes the write overwrite the oldest sample instead of growing. pop reads at head, advances head, and decrements count. Deriving the tail from head and count is what removes the classic ambiguity where head == tail could mean either empty or full.',
      keyInsight: 'Store head and count, derive the tail. That removes the empty-versus-full ambiguity that a head/tail pair alone cannot resolve.',
      pitfalls: [
        'Storing head and tail without a count, so head == tail means both empty and full.',
        'Forgetting to advance head when overwriting, which silently corrupts ordering.',
        'Allocating or locking inside push — in a real audio callback that causes a dropout.',
        'Using % on a signed index that can go negative.'
      ],
      complexity: { time: 'O(1)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: {
        cpp: '#include <vector>\n#include <cstddef>\n\nclass RingBuffer {\n    std::vector<float> buf_;\n    size_t head_ = 0, count_ = 0;\npublic:\n    explicit RingBuffer(size_t cap) : buf_(cap) {}\n    void push(float s);\n    bool pop(float& out);\n};',
        python: 'class RingBuffer:\n    def __init__(self, cap):\n        self.buf = [0.0] * cap\n        self.head = 0\n        self.count = 0\n\n    def push(self, s):\n        pass\n\n    def pop(self):\n        """Return the oldest sample, or None if empty."""\n        pass'
      },
      solution: {
        cpp: '#include <vector>\n#include <cstddef>\n\nclass RingBuffer {\n    std::vector<float> buf_;\n    size_t head_ = 0, count_ = 0;\npublic:\n    explicit RingBuffer(size_t cap) : buf_(cap) {}\n\n    void push(float s) {\n        size_t tail = (head_ + count_) % buf_.size();\n        buf_[tail] = s;\n        if (count_ == buf_.size()) head_ = (head_ + 1) % buf_.size();\n        else ++count_;\n    }\n\n    bool pop(float& out) {\n        if (count_ == 0) return false;\n        out = buf_[head_];\n        head_ = (head_ + 1) % buf_.size();\n        --count_;\n        return true;\n    }\n};',
        python: 'class RingBuffer:\n    def __init__(self, cap):\n        self.buf = [0.0] * cap\n        self.head = 0\n        self.count = 0\n\n    def push(self, s):\n        tail = (self.head + self.count) % len(self.buf)\n        self.buf[tail] = s\n        if self.count == len(self.buf):\n            self.head = (self.head + 1) % len(self.buf)\n        else:\n            self.count += 1\n\n    def pop(self):\n        if self.count == 0:\n            return None\n        out = self.buf[self.head]\n        self.head = (self.head + 1) % len(self.buf)\n        self.count -= 1\n        return out'
      },
      checks: {
        cpp: [
          { re: '%', hint: 'Wrap the indices with modulo.' },
          { re: 'head_|head', hint: 'Track the head index.' },
          { re: 'count_|count|size_', hint: 'Track how many samples are live so empty and full are distinguishable.' },
          { re: 'return\\s+(false|true)|if\\s*\\(', hint: 'pop must report the empty case rather than returning garbage.' }
        ],
        python: [
          { re: '%', hint: 'Wrap the indices with modulo.' },
          { re: 'head', hint: 'Track the head index.' },
          { re: 'count', hint: 'Track how many samples are live so empty and full are distinguishable.' },
          { re: 'return', hint: 'pop returns the sample, or None when empty.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'push_back|new\\s|malloc', hint: 'Growing or allocating defeats the point — capacity is fixed and this runs in a realtime callback.' }],
        python: [{ re: '\\.append\\s*\\(', hint: 'Appending grows the buffer; capacity must stay fixed.' }]
      },
      mcq: [
        { q: 'Why store a count instead of just head and tail indices?',
          opts: ['It uses less memory', 'With head and tail alone, head == tail cannot distinguish empty from full', 'Modulo requires it', 'It makes pop faster'],
          correct: 1,
          why: 'A bare head/tail pair has n+1 states to represent in n slots. A count resolves the collision; the alternative is wasting a slot to keep the states distinct.' },
        { q: 'Why must push not allocate?',
          opts: ['Allocation is always forbidden in C++', 'push runs in a realtime audio callback where an unbounded pause causes an audible dropout', 'It would leak memory', 'std::vector cannot allocate'],
          correct: 1,
          why: 'Allocation can take a lock or hit the OS for unbounded time. In an audio callback with a hard deadline that is a click the user hears.' }
      ]
    },

    {
      id: 'rw-mmap-raii', title: 'RAII Wrapper for a Non-Memory Resource', section: 'rw-cpp',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Write an RAII wrapper that owns a resource handle: it releases the handle in its destructor, cannot be copied, and can be moved.\n\nAfter a move the source must be left in a state that is safe to destroy — that is, it must not release the same handle twice.',
      examples: [
        { in: 'Guard a(h); Guard b(std::move(a)); // a and b both destroyed', out: 'the handle is released exactly once', why: 'The move must null the source so its destructor becomes a no-op.' },
        { in: 'Guard a(h); Guard b(a);', out: 'compile error', why: 'Copying would give two owners of one handle, so the copy operations are deleted.' }
      ],
      constraints: ['Release exactly once.', 'Copy must not compile.', 'Move must leave the source safely destructible.'],
      approach: 'This is the Rule of Five applied to ownership. The destructor releases if the handle is live. The copy constructor and copy assignment are deleted, because two owners means a double release. The move constructor steals the handle and then nulls the source, which is the step people forget — without it both objects release. Move assignment must additionally release whatever it already held before taking the new handle, and must be safe when self-assigned. Mark the move operations noexcept so containers will move rather than copy your type when they reallocate.',
      keyInsight: 'Moving is stealing plus nulling the source. Omit the nulling and you get a double release that appears only under load.',
      pitfalls: [
        'Forgetting to null the source in the move constructor, causing a double release.',
        'Move assignment that leaks the handle it was already holding.',
        'Move assignment that breaks on self-assignment.',
        'Leaving move operations without noexcept, so std::vector copies instead of moving on reallocation.'
      ],
      complexity: { time: 'O(1)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: {
        cpp: 'class Guard {\n    int fd_ = -1;                 // -1 means "owns nothing"\npublic:\n    explicit Guard(int fd) : fd_(fd) {}\n    ~Guard();\n    // delete copy, implement move\n    int get() const { return fd_; }\n};',
        python: 'class Guard:\n    """The Python parallel is the context manager protocol."""\n    def __init__(self, fd):\n        self.fd = fd\n\n    def __enter__(self):\n        return self\n\n    def __exit__(self, exc_type, exc, tb):\n        pass'
      },
      solution: {
        cpp: '#include <utility>\n\nvoid release(int fd);            // provided elsewhere\n\nclass Guard {\n    int fd_ = -1;\npublic:\n    explicit Guard(int fd) : fd_(fd) {}\n\n    ~Guard() { if (fd_ != -1) release(fd_); }\n\n    Guard(const Guard&)            = delete;\n    Guard& operator=(const Guard&) = delete;\n\n    Guard(Guard&& o) noexcept : fd_(o.fd_) {\n        o.fd_ = -1;              // the source must no longer own it\n    }\n\n    Guard& operator=(Guard&& o) noexcept {\n        if (this != &o) {\n            if (fd_ != -1) release(fd_);   // drop what we already held\n            fd_ = o.fd_;\n            o.fd_ = -1;\n        }\n        return *this;\n    }\n\n    int get() const { return fd_; }\n};',
        python: 'class Guard:\n    """Python has no destructors you can rely on, so ownership is scoped\n    with the context manager protocol instead of RAII."""\n\n    def __init__(self, fd):\n        self.fd = fd\n\n    def __enter__(self):\n        return self\n\n    def __exit__(self, exc_type, exc, tb):\n        if self.fd is not None:\n            release(self.fd)\n            self.fd = None       # same idea: do not release twice\n        return False             # never swallow the exception\n\n\ndef release(fd):\n    pass'
      },
      checks: {
        cpp: [
          { re: '~\\w+\\s*\\(\\s*\\)', hint: 'Release the handle in the destructor.' },
          { re: 'delete\\s*;|=\\s*delete', hint: 'Delete the copy operations — two owners means a double release.' },
          { re: '&&', hint: 'Implement a move constructor taking an rvalue reference.' },
          { re: '=\\s*-1|=\\s*nullptr|=\\s*0', hint: 'Null the source after stealing from it.' }
        ],
        python: [
          { re: '__exit__|__enter__|contextmanager', hint: 'Use the context manager protocol — the Python parallel to RAII.' },
          { re: 'None', hint: 'Mark the handle released so it cannot be released twice.' },
          { re: 'def\\s', hint: 'Define the protocol methods.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'What goes wrong if the move constructor does not null the source?',
          opts: ['A memory leak', 'Both objects release the same handle when destroyed — a double free', 'The move silently becomes a copy', 'It fails to compile'],
          correct: 1,
          why: 'Both objects end up holding the same handle and both destructors run, so the resource is released twice. That is a double free, and it usually crashes far from the real cause.' },
        { q: 'Why mark the move operations noexcept?',
          opts: ['It makes them faster to call', 'std::vector will only move elements on reallocation if the move is noexcept; otherwise it copies to keep the strong exception guarantee', 'It is required by the standard', 'It prevents the move from being deleted'],
          correct: 1,
          why: 'Vector reallocation must preserve the strong guarantee. If your move can throw, vector cannot undo a partial move, so it copies instead — silently costing the performance you wrote the move for.' }
      ]
    },

    {
      id: 'rw-quantize-block', title: 'Block Quantisation and Dequantisation', section: 'rw-cpp',
      tier: 'master', difficulty: 'Hard',
      prompt: 'Quantise a block of floats to 8-bit integers with a single shared scale, then dequantise and return the reconstruction.\n\nUse a symmetric scheme: find the largest magnitude in the block, set scale = maxAbs / 127, and store round(x / scale) clamped to [-127, 127]. Dequantising is q * scale. If every value is zero, the scale is zero and the reconstruction is all zeros.',
      examples: [
        { in: '[1.0, -2.0, 4.0]', out: 'scale = 4/127; reconstruction ~= [1.0, -2.0, 4.0]', why: 'The largest magnitude maps exactly to 127, so it reconstructs with no error.' },
        { in: '[0.0, 0.0]', out: '[0.0, 0.0]', why: 'maxAbs is 0, so the scale is 0 — dividing by it would produce NaN, hence the guard.' }
      ],
      constraints: ['Symmetric quantisation, one scale per block.', 'Clamp to [-127, 127].', 'Handle the all-zero block without dividing by zero.'],
      approach: 'Two passes. First find maxAbs over the block, because the scale depends on the whole block. Then map each value with q = round(x / scale) and clamp, and reconstruct with q * scale. The all-zero case is the one that bites: maxAbs is 0, so scale is 0, and x / 0 is inf or NaN which then propagates through every downstream computation. Guard it and return zeros. The reason this is worth doing at all is bandwidth — storing one float scale plus n bytes instead of n floats cuts memory traffic roughly fourfold, and inference is memory-bound, so that is close to a fourfold speedup.',
      keyInsight: 'One scale per block is the whole trick: the error stays small because values within a block have similar magnitude, and you move a quarter of the bytes.',
      pitfalls: [
        'Dividing by a zero scale when the block is all zeros, producing NaN that spreads silently.',
        'Truncating instead of rounding, which doubles the average error.',
        'Forgetting to clamp, so a rounding edge produces 128 and overflows a signed byte.',
        'Using one scale for the entire tensor instead of per block, which destroys precision when magnitudes vary.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 2,
      starter: {
        cpp: '#include <vector>\n#include <cmath>\n\nstd::vector<float> quantizeRoundTrip(const std::vector<float>& block) {\n    // find maxAbs, derive the scale, quantise, dequantise\n    return {};\n}',
        python: 'def quantize_round_trip(block):\n    """Quantise to int8 with one shared scale, then dequantise."""\n    pass'
      },
      solution: {
        cpp: '#include <vector>\n#include <cmath>\n#include <algorithm>\n\nstd::vector<float> quantizeRoundTrip(const std::vector<float>& block) {\n    float maxAbs = 0.0f;\n    for (float x : block) maxAbs = std::max(maxAbs, std::fabs(x));\n\n    std::vector<float> out(block.size(), 0.0f);\n    if (maxAbs == 0.0f) return out;      // all-zero block: scale would be 0\n\n    const float scale = maxAbs / 127.0f;\n\n    for (size_t i = 0; i < block.size(); ++i) {\n        int q = int(std::lround(block[i] / scale));\n        q = std::max(-127, std::min(127, q));   // clamp\n        out[i] = float(q) * scale;\n    }\n    return out;\n}',
        python: 'def quantize_round_trip(block):\n    max_abs = max((abs(x) for x in block), default=0.0)\n    if max_abs == 0.0:\n        return [0.0] * len(block)     # scale would be 0\n\n    scale = max_abs / 127.0\n\n    out = []\n    for x in block:\n        q = round(x / scale)\n        q = max(-127, min(127, q))    # clamp\n        out.append(q * scale)\n    return out'
      },
      checks: {
        cpp: [
          { re: 'fabs|abs\\s*\\(|std::abs', hint: 'Find the largest magnitude in the block.' },
          { re: '127', hint: 'Map the largest magnitude onto 127.' },
          { re: 'round|lround|nearbyint', hint: 'Round rather than truncate.' },
          { re: 'max\\s*\\(|min\\s*\\(|clamp', hint: 'Clamp into the representable range.' },
          { re: '==\\s*0|!=\\s*0|< *1e-|maxAbs', hint: 'Guard the all-zero block so you never divide by a zero scale.' }
        ],
        python: [
          { re: 'abs\\s*\\(', hint: 'Find the largest magnitude in the block.' },
          { re: '127', hint: 'Map the largest magnitude onto 127.' },
          { re: 'round', hint: 'Round rather than truncate.' },
          { re: 'max\\s*\\(|min\\s*\\(', hint: 'Clamp into the representable range.' },
          { re: '==\\s*0|max_abs|if\\s', hint: 'Guard the all-zero block so you never divide by a zero scale.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why does quantisation speed up inference so much?',
          opts: ['Integer arithmetic is faster than floating point on modern CPUs', 'Inference is memory-bandwidth-bound, and 8-bit weights move a quarter of the bytes', 'It reduces the number of operations', 'It improves cache associativity'],
          correct: 1,
          why: 'The bottleneck is getting weights from memory to the ALU, not the arithmetic itself. Shrinking each weight from 4 bytes to 1 cuts the traffic that dominates the runtime.' },
        { q: 'Why one scale per block rather than one per tensor?',
          opts: ['It is simpler to implement', 'Values within a small block have similar magnitude, so a shared scale loses little; across a whole tensor the range is far wider and small values collapse to zero', 'Per-tensor scales use more memory', 'The hardware requires it'],
          correct: 1,
          why: 'The scale is set by the largest magnitude. Over a whole tensor one big outlier makes the scale huge, and every small weight quantises to 0. Blocking keeps the dynamic range local.' }
      ]
    },

    {
      id: 'rw-find-ub', title: 'Find the Undefined Behaviour', section: 'rw-cpp',
      tier: 'master', difficulty: 'Hard',
      prompt: 'The function below is meant to return the largest element of a vector, or 0 for an empty vector. It passes a simple test and is still wrong in two distinct ways.\n\nRewrite it correctly.\n\n    int largest(const std::vector<int>& v) {\n        int best;\n        for (size_t i = 0; i <= v.size() - 1; i++)\n            if (v[i] > best) best = v[i];\n        return best;\n    }',
      examples: [
        { in: 'largest({3, 9, 2})', out: '9', why: 'The happy path may appear to work, which is exactly why the bugs survive testing.' },
        { in: 'largest({})', out: '0', why: 'v.size() - 1 on an empty vector underflows to a huge value and the loop reads far out of bounds.' },
        { in: 'largest({-5, -2})', out: '-2', why: 'An uninitialised best often contains 0 in a debug build, which would wrongly return 0 here.' }
      ],
      constraints: ['Return 0 for an empty vector.', 'Must be correct for all-negative input.', 'No undefined behaviour.'],
      approach: 'Two defects. First, best is uninitialised, so reading it is undefined behaviour; in a debug build it is frequently 0, which is why all-negative input is the case that exposes it. Initialise from the first element instead of from 0 or INT_MIN. Second, v.size() returns an unsigned type, so for an empty vector v.size() - 1 wraps to the maximum size_t rather than -1, and the loop runs essentially forever reading out of bounds. Handle the empty case before the loop and iterate with a strict less-than. A range-for avoids the index arithmetic entirely, which is the real lesson: the safest index is the one you never write.',
      keyInsight: 'Unsigned arithmetic does not go negative, it wraps. size() - 1 on an empty container is the largest size_t, not -1.',
      pitfalls: [
        'Initialising best to 0, which breaks for all-negative input.',
        'Keeping <= with size() - 1 and only guarding the empty case, which still reads one past the end.',
        'Casting size() to int without checking for very large containers.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], timeAnswer: 2,
      starter: {
        cpp: '#include <vector>\n\nint largest(const std::vector<int>& v) {\n    // fix both defects\n    return 0;\n}',
        python: 'def largest(v):\n    """Return the largest element, or 0 for an empty list."""\n    pass'
      },
      solution: {
        cpp: '#include <vector>\n\nint largest(const std::vector<int>& v) {\n    if (v.empty()) return 0;          // no size() - 1 underflow\n\n    int best = v[0];                  // initialised from real data\n    for (size_t i = 1; i < v.size(); ++i)\n        if (v[i] > best) best = v[i];\n    return best;\n}',
        python: 'def largest(v):\n    if not v:\n        return 0\n\n    best = v[0]\n    for x in v[1:]:\n        if x > best:\n            best = x\n    return best'
      },
      checks: {
        cpp: [
          { re: 'empty\\s*\\(\\s*\\)|size\\s*\\(\\s*\\)\\s*==\\s*0|\\.size\\s*\\(\\s*\\)\\s*<\\s*1', hint: 'Handle the empty vector before any index arithmetic.' },
          { re: 'v\\s*\\[\\s*0\\s*\\]|front\\s*\\(\\s*\\)|:\\s*v', hint: 'Initialise from the first element, not from 0.' },
          { re: '<\\s*v\\.size|:\\s*v|begin', hint: 'Iterate with a strict less-than, or use a range-for.' },
          { re: 'return', hint: 'Return the result.' }
        ],
        python: [
          { re: 'if\\s+not\\s+v|len\\s*\\(\\s*v\\s*\\)\\s*==\\s*0|if\\s+v\\b', hint: 'Handle the empty list first.' },
          { re: 'v\\s*\\[\\s*0\\s*\\]|max\\s*\\(', hint: 'Start from the first element rather than 0.' },
          { re: 'for|max\\s*\\(', hint: 'Scan the rest of the list.' },
          { re: 'return', hint: 'Return the result.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: '<=\\s*\\w+\\.size\\s*\\(\\s*\\)\\s*-\\s*1', hint: 'That is the original underflow bug — size() is unsigned, so on an empty vector this wraps.' }],
        python: []
      },
      mcq: [
        { q: 'On an empty vector, what is v.size() - 1?',
          opts: ['-1', 'The largest representable size_t, because size() is unsigned and the subtraction wraps', '0', 'Undefined behaviour by itself'],
          correct: 1,
          why: 'size() returns size_t, an unsigned type. Unsigned arithmetic is modular, so 0 - 1 wraps to SIZE_MAX. The subtraction itself is well defined; using it as a loop bound is what reads out of bounds.' },
        { q: 'Which input exposes the uninitialised variable most reliably?',
          opts: ['An empty vector', 'A vector where every element is negative', 'A vector with one element', 'A sorted vector'],
          correct: 1,
          why: 'Uninitialised stack memory is often 0. With all-negative input, no element beats 0, so the function returns 0 instead of the real maximum — a wrong answer rather than a crash.' }
      ]
    }
  ];

  const Q = [
    { id: 'q-rw-001', section: 'rw-cpp', tier: 'advanced',
      q: 'In nlohmann/json, what does cfg["missing_key"] do when the key is absent?',
      opts: ['Throws std::out_of_range', 'Returns a null value without modifying cfg', 'Inserts a null value at that key and returns a reference to it', 'Returns a default-constructed int'],
      correct: 2,
      why: 'operator[] on a JSON object behaves like std::map: it default-constructs the element. That silently turns a typo into a null value. Use .at() when the key must exist, or .value(key, default) when it need not.',
      topic: 'nlohmann/json' },

    { id: 'q-rw-002', section: 'rw-cpp', tier: 'advanced',
      q: 'You want your own struct to work with a JSON library without editing that library\'s headers. What mechanism does nlohmann/json use?',
      opts: ['Virtual inheritance from a Serializable base', 'Free to_json and from_json functions in your type\'s namespace, found by argument-dependent lookup', 'A macro that must be invoked inside the library namespace', 'Runtime registration in a global map'],
      correct: 1,
      why: 'ADL finds free functions in the namespace of the argument type. That lets a library be extended by users without inheritance, without touching library headers, and with zero runtime cost.',
      topic: 'ADL' },

    { id: 'q-rw-003', section: 'rw-cpp', tier: 'intermediate',
      q: 'What is the main build-time cost of a header-only library?',
      opts: ['It cannot be optimised', 'Every translation unit that includes it re-parses and re-instantiates its templates', 'It forces dynamic linking', 'It disables inlining'],
      correct: 1,
      why: 'There is no separate compilation unit to compile once and link. The work is repeated per translation unit, which is why large header-only libraries dominate build times.',
      topic: 'compilation' },

    { id: 'q-rw-004', section: 'rw-cpp', tier: 'advanced',
      q: 'msgpack-c can parse without copying strings out of the buffer. What is the resulting constraint?',
      opts: ['The parsed object must not outlive the buffer it points into', 'The buffer must be null-terminated', 'Only ASCII is supported', 'The parse becomes single-threaded'],
      correct: 0,
      why: 'Zero-copy means the parsed object holds views into the original bytes. Destroy or reuse the buffer and every view dangles. That is the trade you accept in exchange for not copying.',
      topic: 'zero-copy' },

    { id: 'q-rw-005', section: 'rw-cpp', tier: 'advanced',
      q: 'What problem does an arena (zone) allocator solve for a parser?',
      opts: ['It compresses the parsed data', 'It makes allocation thread-safe automatically', 'It turns thousands of small allocations and frees into one bump-pointer region freed in a single step', 'It prevents fragmentation of the stack'],
      correct: 2,
      why: 'Parsing allocates many small short-lived nodes. An arena bumps a pointer per allocation and frees everything at once, which removes both per-node malloc overhead and per-node destruction.',
      topic: 'allocators' },

    { id: 'q-rw-006', section: 'rw-cpp', tier: 'master',
      q: 'Why is 4-bit quantisation a large speedup for LLM inference on a CPU?',
      opts: ['4-bit integer multiplication is faster than float multiplication', 'The workload is memory-bandwidth-bound, so moving one eighth of the bytes dominates the arithmetic cost', 'It allows more threads', 'It reduces the number of matrix multiplications'],
      correct: 1,
      why: 'Weight matrices are streamed from memory once per token and each weight is used a handful of times. The bottleneck is bandwidth, so shrinking the weights is close to a proportional speedup even though dequantisation adds arithmetic.',
      topic: 'quantisation' },

    { id: 'q-rw-007', section: 'rw-cpp', tier: 'advanced',
      q: 'Why is a multi-gigabyte model file mmap-ed rather than read into a buffer?',
      opts: ['mmap compresses the file', 'Pages load lazily on first touch and the OS page cache is shared between processes, so startup is fast and a second process pays almost nothing', 'It is the only way to read files larger than 2 GB', 'It avoids the need for a file descriptor'],
      correct: 1,
      why: 'A read copies the whole file into private memory up front. A mapping defers the work to first touch and lets several processes share one set of physical pages.',
      topic: 'mmap' },

    { id: 'q-rw-008', section: 'rw-cpp', tier: 'master',
      q: 'Two threads each increment their own std::atomic<long> and the pair sits in one struct. Throughput is worse than single-threaded. Why?',
      opts: ['Atomics are always slower than locks', 'False sharing: both atomics occupy the same 64-byte cache line, so every write invalidates the other core\'s copy', 'The compiler serialised the increments', 'std::atomic uses a global mutex'],
      correct: 1,
      why: 'Coherence works at cache-line granularity, not variable granularity. Independent variables sharing a line ping-pong that line between cores. Pad each to its own line with alignas(64).',
      topic: 'false sharing' },

    { id: 'q-rw-009', section: 'rw-cpp', tier: 'advanced',
      q: 'You loop over one field of a million objects. Why is struct-of-arrays faster than array-of-structs?',
      opts: ['It uses less total memory', 'Every cache line loaded contains only the field you are reading, instead of dragging the unused fields along', 'It allows the compiler to skip bounds checks', 'It reduces the number of iterations'],
      correct: 1,
      why: 'A cache line is filled regardless of how much of it you use. With interleaved structs most of each line is fields you ignore; with parallel arrays the whole line is useful data.',
      topic: 'data layout' },

    { id: 'q-rw-010', section: 'rw-cpp', tier: 'advanced',
      q: 'Which operation is safe inside a realtime audio callback?',
      opts: ['Writing into a preallocated fixed-size buffer', 'Calling new to grow a vector', 'Locking a mutex that a lower-priority thread may hold', 'Writing a log line to disk'],
      correct: 0,
      why: 'The callback has a hard deadline. Allocation, blocking locks and I/O can all pause for unbounded time. Preallocate everything and use lock-free structures for cross-thread handoff.',
      topic: 'realtime' },

    { id: 'q-rw-011', section: 'rw-cpp', tier: 'intermediate',
      q: 'Why do consecutive transcription windows overlap rather than abut?',
      opts: ['To make the audio louder', 'A word straddling a hard boundary is split, and both halves transcribe wrongly', 'To reduce memory usage', 'To keep the buffer aligned'],
      correct: 1,
      why: 'Any chunked pipeline over a continuous stream has this boundary problem. Overlapping windows give the model enough context on both sides of the seam to recover the token.',
      topic: 'streaming' },

    { id: 'q-rw-012', section: 'rw-cpp', tier: 'advanced',
      q: 'What does cppcheck do that a compiler warning does not?',
      opts: ['It executes the program', 'It performs deeper whole-function pattern analysis specifically hunting undefined behaviour and resource leaks, accepting slower analysis than a compiler can afford', 'It replaces the need for tests', 'It rewrites the code'],
      correct: 1,
      why: 'A compiler must stay fast because it runs on every build. A dedicated analyser can spend far more time per function and look for defect patterns the compiler does not attempt.',
      topic: 'static analysis' },

    { id: 'q-rw-013', section: 'rw-cpp', tier: 'master',
      q: 'How does Infer find a null dereference whose null originates three functions away?',
      opts: ['It runs the program with instrumented inputs', 'It computes a summary of each function\'s heap effects using separation logic and composes those summaries across call sites', 'It greps for null checks', 'It uses machine learning on the source text'],
      correct: 1,
      why: 'Interprocedural analysis based on separation logic builds a compositional proof per function, so a caller can be checked against the callee\'s summary without re-analysing it. That is what lets the null propagate across call boundaries.',
      topic: 'infer' },

    { id: 'q-rw-014', section: 'rw-cpp', tier: 'intermediate',
      q: 'Which pair of sanitizer flags catches out-of-bounds access and signed overflow at runtime?',
      opts: ['-O3 -march=native', '-fsanitize=address,undefined', '-Wall -Wextra', '-static -flto'],
      correct: 1,
      why: 'AddressSanitizer instruments memory access to catch overruns and use-after-free; UndefinedBehaviorSanitizer catches signed overflow, bad shifts and misaligned loads. Warnings are compile-time and cannot see these.',
      topic: 'sanitizers' },

    { id: 'q-rw-015', section: 'rw-cpp', tier: 'advanced',
      q: 'You hold a reference to v[0], then call v.push_back(x). What is the risk?',
      opts: ['Nothing, references into a vector are stable', 'push_back may reallocate the buffer, leaving the reference dangling', 'The reference silently becomes a copy', 'push_back throws if a reference exists'],
      correct: 1,
      why: 'Exceeding capacity moves the elements to a new allocation and frees the old one. Any reference, pointer or iterator into the old buffer dangles. Reserve first, or take the reference after you finish growing.',
      topic: 'iterator invalidation' },

    { id: 'q-rw-016', section: 'rw-cpp', tier: 'master',
      q: 'What is wrong with suppressing an analyser warning without a comment?',
      opts: ['Suppressions slow the build', 'You have recorded that the tool is wrong without recording the invariant that makes the code safe, so nobody can re-check it later', 'Suppressions are ignored by CI', 'It causes a compile error'],
      correct: 1,
      why: 'The suppression outlives the reasoning. If the invariant is never written down it cannot be re-validated when the surrounding code changes, and a real defect hides behind a legitimate-looking annotation.',
      topic: 'triage' },

    { id: 'q-rw-017', section: 'rw-cpp', tier: 'intermediate',
      q: 'MessagePack encodes multi-byte integers big-endian. Why can memcpy of a uint32 be wrong?',
      opts: ['memcpy cannot copy integers', 'memcpy reproduces host byte order, which is little-endian on x86 and ARM', 'memcpy adds padding', 'memcpy is undefined for unsigned types'],
      correct: 1,
      why: 'memcpy copies the in-memory representation. On a little-endian machine that puts the least significant byte first, so a big-endian reader decodes the value reversed. Shift and mask instead.',
      topic: 'endianness' },

    { id: 'q-rw-018', section: 'rw-cpp', tier: 'advanced',
      q: 'Why does std::vector copy rather than move your type during reallocation when the move constructor is not noexcept?',
      opts: ['Moving is only allowed for trivial types', 'To preserve the strong exception guarantee — a throwing move cannot be rolled back partway through', 'noexcept makes moves faster', 'It is a compiler bug'],
      correct: 1,
      why: 'If a move throws halfway through relocating elements, the vector cannot restore the original buffer because the moved-from elements are already modified. Copying is recoverable, so it copies unless the move promises not to throw.',
      topic: 'move semantics' },

    { id: 'q-rw-019', section: 'rw-cpp', tier: 'master',
      q: 'A block quantiser uses one scale per 32 weights instead of one per tensor. What does that buy?',
      opts: ['Less memory for the scales', 'Local dynamic range: one large outlier elsewhere in the tensor cannot force small weights in this block to quantise to zero', 'Faster dequantisation', 'Support for negative weights'],
      correct: 1,
      why: 'The scale is set by the largest magnitude it covers. Over an entire tensor a single outlier makes the scale huge and everything small rounds to 0. Per-block scales keep the range local and the error small.',
      topic: 'quantisation' },

    { id: 'q-rw-020', section: 'rw-cpp', tier: 'beginner',
      q: 'What does RAII actually guarantee?',
      opts: ['That memory is allocated on the stack', 'That a resource acquired in a constructor is released in the matching destructor, including when an exception unwinds the scope', 'That the object cannot be copied', 'That allocation never fails'],
      correct: 1,
      why: 'The guarantee is tied to scope exit, and scope exit includes exception unwinding. That is why RAII beats manual release: the cleanup path you would forget to write is the one the language runs for you.',
      topic: 'RAII' },

    { id: 'q-rw-021', section: 'rw-cpp', tier: 'intermediate',
      q: 'Which is the correct reading of "inference is memory-bound"?',
      opts: ['The model does not fit in RAM', 'Time is dominated by moving weights from memory to the CPU, not by the arithmetic performed on them', 'The process leaks memory', 'Memory allocation is the bottleneck'],
      correct: 1,
      why: 'Each weight is loaded and used only a few times, so the arithmetic units sit idle waiting on memory. That is why compressing the weights helps far more than optimising the multiply.',
      topic: 'performance' },

    { id: 'q-rw-022', section: 'rw-cpp', tier: 'advanced',
      q: 'You take a std::string_view of a temporary std::string. What happens?',
      opts: ['The view extends the temporary\'s lifetime', 'The temporary is destroyed at the end of the full expression and the view dangles', 'The view copies the characters', 'It fails to compile'],
      correct: 1,
      why: 'Views never own or extend anything. Binding one to a temporary leaves it pointing at freed memory as soon as the full expression ends — the same lifetime trap as a zero-copy msgpack object outliving its buffer.',
      topic: 'lifetime' }
  ];

  window.DB.lessons.push.apply(window.DB.lessons, L);
  window.DB.problems.push.apply(window.DB.problems, P);
  window.DB.questions.push.apply(window.DB.questions, Q);
})();
