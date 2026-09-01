/* flashcards.js — spaced-repetition deck.
 * Cards favour retrieval of a mechanism or a trade-off over definitions,
 * because "why does this work" is what transfers to an unseen problem.
 */
(function () {
  'use strict';

  const C = [];
  let n = 0;
  const add = (section, track, tier, front, back) => {
    C.push({ id: 'fc-' + String(++n).padStart(3, '0'), section, track, tier, front, back });
  };

  /* ---------------- DSA patterns ---------------- */
  add('arrays-hashing', 'dsa', 'beginner', 'When does a hash map turn an O(n^2) scan into O(n)?', 'When the inner loop is asking "have I already seen X?". Storing what you have passed makes that lookup O(1).');
  add('arrays-hashing', 'dsa', 'intermediate', 'Worst-case lookup in a hash map, and when does it happen?', 'O(n), when every key collides into one bucket. Average is O(1); the worst case needs adversarial or badly distributed keys.');
  add('arrays-hashing', 'dsa', 'intermediate', 'When does counting/bucketing beat sorting?', 'When the sort key is an integer from a small bounded range, so it can double as an array index. Then the work is O(n + range) with no comparisons.');
  add('arrays-hashing', 'dsa', 'advanced', 'Product of array except self, without division?', 'Two passes: prefix products left to right, then multiply by suffix products right to left, accumulating the suffix in a single variable.');
  add('two-pointers', 'dsa', 'beginner', 'What precondition do converging two pointers usually need?', 'A sorted array. Sorted order is what makes moving a pointer a decision you can never regret.');
  add('two-pointers', 'dsa', 'intermediate', 'In Container With Most Water, why move the pointer at the SHORTER wall?', 'Area is limited by the shorter wall. Moving the taller one can only keep or reduce the height while reducing width, so it can never improve.');
  add('two-pointers', 'dsa', 'advanced', 'How do you avoid duplicate triplets in 3Sum?', 'Sort first, then skip over equal adjacent values at each level after recording a hit.');
  add('sliding-window', 'dsa', 'intermediate', 'What invariant does a variable-size window maintain?', 'The window is always valid. Expand right to include new elements; shrink from the left as soon as the constraint breaks.');
  add('sliding-window', 'dsa', 'advanced', 'Why is a sliding window O(n) despite the inner while loop?', 'Each index enters and leaves the window at most once, so the total pointer movement is bounded by 2n.');
  add('sliding-window', 'dsa', 'advanced', 'When can you NOT use a sliding window?', 'When elements can be negative in a sum problem, because shrinking the window no longer reliably decreases the total. Use prefix sums with a hash map instead.');
  add('stack', 'dsa', 'intermediate', 'What problem shape signals a monotonic stack?', '"Next greater/smaller element" questions. The stack holds indices whose answer is still unknown, and each is popped once, giving O(n).');
  add('stack', 'dsa', 'advanced', 'Why is a monotonic stack O(n) when it has a nested while loop?', 'Every index is pushed exactly once and popped at most once, so total work is linear regardless of how many pops occur in one iteration.');
  add('binary-search', 'dsa', 'beginner', 'Complexity of binary search, and its precondition?', 'O(log n), and the data must be sorted — or the predicate must be monotone.');
  add('binary-search', 'dsa', 'advanced', 'What is "binary search on the answer"?', 'When you cannot search the input but CAN cheaply test "is X feasible?", and feasibility is monotone in X, binary search the answer space instead. Koko Eating Bananas is the canonical case.');
  add('binary-search', 'dsa', 'advanced', 'Why write mid = lo + (hi - lo) / 2?', 'Computing (lo + hi) / 2 can overflow a signed int for large indices. The subtraction form cannot.');
  add('linked-list', 'dsa', 'intermediate', 'How do you find the middle of a linked list in one pass?', 'Fast and slow pointers: advance one by two and one by one. When the fast pointer reaches the end, the slow one is at the middle.');
  add('linked-list', 'dsa', 'intermediate', 'What is a dummy head node for?', 'It removes the special case where the operation modifies the first node, so insertion and deletion need no branch for the head.');
  add('linked-list', 'dsa', 'advanced', 'How does Floyd cycle detection find the cycle START?', 'After the pointers meet, reset one to the head and advance both one step at a time. They meet again at the entrance to the cycle.');
  add('trees', 'dsa', 'beginner', 'Which traversal yields a BST in sorted order?', 'In-order: left, node, right.');
  add('trees', 'dsa', 'intermediate', 'How do you separate levels during a BFS traversal?', 'Record the queue size at the start of each round and process exactly that many nodes. Everything added during the round belongs to the next level.');
  add('trees', 'dsa', 'advanced', 'Why is checking only immediate children insufficient to validate a BST?', 'A node must respect every ancestor, not just its parent. Pass down a valid (min, max) range as you recurse.');
  add('trees', 'dsa', 'advanced', 'Worst-case height of an unbalanced BST?', 'O(n) — inserting sorted data produces a chain, which is why self-balancing trees exist.');
  add('tries', 'dsa', 'intermediate', 'What does trie lookup cost depend on?', 'Only the length of the query string, never the number of stored words. That is why tries scale for autocomplete.');
  add('tries', 'dsa', 'intermediate', 'What separates search from startsWith in a trie?', 'A boolean terminal flag on the node. Both walk the identical path; only search also requires the flag.');
  add('heap-pq', 'dsa', 'beginner', 'What does a min-heap actually guarantee?', 'Only that the root is the smallest. Siblings are unordered — that partial order is why heapify is cheaper than sorting.');
  add('heap-pq', 'dsa', 'advanced', 'For the k largest of n items, which heap and why?', 'A min-heap capped at size k. Its root is the weakest of your current best k, so it is both what to evict and, at the end, the answer. O(n log k).');
  add('heap-pq', 'dsa', 'master', 'Why is building a heap from an array O(n), not O(n log n)?', 'Sifting down from the bottom: half the nodes are leaves and do no work, a quarter move one level, and the series sums to O(n).');
  add('heap-pq', 'dsa', 'advanced', 'How do two heaps maintain a running median?', 'A max-heap of the lower half and a min-heap of the upper half, kept balanced in size. The median sits at one or both roots.');
  add('backtracking', 'dsa', 'intermediate', 'What are the three moves of a backtracking template?', 'Choose, explore, un-choose. Undoing the choice on the way out is what lets one shared state object serve the whole search.');
  add('backtracking', 'dsa', 'advanced', 'How do you avoid duplicate results when the input has duplicates?', 'Sort first, then at each level skip a candidate equal to the previous one unless the previous is currently in use.');
  add('graphs', 'dsa', 'beginner', 'Which structure does BFS use, and which does DFS use?', 'BFS a queue, DFS a stack (often the call stack). BFS gives shortest path in an unweighted graph; DFS goes deep and suits backtracking.');
  add('graphs', 'dsa', 'intermediate', 'How does cycle detection differ between directed and undirected graphs?', 'Undirected: a visited neighbour that is not your parent. Directed: a node currently on the recursion stack — merely visited is not enough.');
  add('graphs', 'dsa', 'advanced', 'What does a topological sort require, and what does it detect?', 'A directed acyclic graph. If Kahn\'s algorithm outputs fewer nodes than exist, the remainder form a cycle — so it doubles as cycle detection.');
  add('graphs', 'dsa', 'advanced', 'When is BFS a valid shortest-path algorithm?', 'When every edge has the same weight. With differing weights you need Dijkstra.');
  add('advanced-graphs', 'dsa', 'advanced', 'Why does Dijkstra fail with negative edge weights?', 'It finalises a node once popped, assuming no shorter route can appear later. A negative edge can create one, so use Bellman-Ford.');
  add('advanced-graphs', 'dsa', 'master', 'Time complexity of Dijkstra with a binary heap?', 'O((V + E) log V). Each edge can trigger a heap push, and each push or pop costs O(log V).');
  add('advanced-graphs', 'dsa', 'advanced', 'What does union-find answer efficiently?', '"Are these two nodes already connected?" — in near-constant amortised time with path compression and union by rank.');
  add('dp-1d', 'dsa', 'beginner', 'What two properties must hold for DP to apply?', 'Overlapping subproblems and optimal substructure. Without the second, caching is correct but the recurrence is wrong.');
  add('dp-1d', 'dsa', 'intermediate', 'What four things define a DP solution?', 'The subproblem definition in words, the recurrence, the base case, and the iteration order. Write them in that order every time.');
  add('dp-1d', 'dsa', 'advanced', 'Why does greedy fail on Coin Change?', 'With coins [1,3,4] and target 6, greedy takes 4+1+1 = three coins, but 3+3 is two. The greedy choice forecloses the optimum.');
  add('dp-1d', 'dsa', 'advanced', 'What is the O(n log n) LIS trick?', 'Maintain the smallest possible tail for each subsequence length. Binary-search where each element belongs and overwrite. The array length is the answer.');
  add('dp-2d', 'dsa', 'intermediate', 'Why are string DP tables sized (m+1) x (n+1)?', 'The extra row and column encode the empty-prefix base case that the recurrence reads at the boundary.');
  add('dp-2d', 'dsa', 'advanced', 'How does longest common SUBSTRING differ from SUBSEQUENCE in the recurrence?', 'Substring resets the cell to 0 on a mismatch instead of taking the max, and the answer is the table maximum rather than the corner.');
  add('dp-2d', 'dsa', 'master', 'When compressing 0/1 knapsack to 1-D, why iterate capacity backwards?', 'Forward iteration would reuse the same item within one pass, silently turning it into unbounded knapsack.');
  add('greedy', 'dsa', 'advanced', 'What must you show before trusting a greedy algorithm?', 'An exchange argument: that any optimal solution can be rewritten to include your greedy choice without becoming worse.');
  add('greedy', 'dsa', 'intermediate', 'In Kadane, why discard a negative running sum?', 'A negative prefix can only reduce whatever follows, so dropping it never loses the optimum.');
  add('greedy', 'dsa', 'advanced', 'To fit the most non-overlapping intervals, sort by what?', 'Earliest end time. Finishing soonest leaves the most room for everything else.');
  add('intervals', 'dsa', 'intermediate', 'Sort key for MERGING intervals versus SCHEDULING them?', 'Merging sorts by start; interval scheduling sorts by end. Using the wrong one produces plausible but wrong answers.');
  add('intervals', 'dsa', 'advanced', 'How do you find the minimum number of meeting rooms?', 'Peak concurrency. Sweep sorted start and end events, +1 on a start and -1 on an end, and record the maximum.');
  add('math-geometry', 'dsa', 'intermediate', 'How do you rotate a matrix 90 degrees clockwise in place?', 'Transpose, then reverse each row. The transpose inner loop must start at i or every swap undoes itself.');
  add('math-geometry', 'dsa', 'advanced', 'Why check overflow BEFORE the multiply when reversing an integer?', 'Signed overflow is undefined behaviour in C++, so you cannot detect it after the fact. Compare against INT_MAX/10 first.');
  add('bit-manipulation', 'dsa', 'beginner', 'What are x ^ x and x ^ 0?', '0 and x. Self-inverse with 0 as identity — the basis of nearly every XOR trick.');
  add('bit-manipulation', 'dsa', 'intermediate', 'What does n & (n - 1) do?', 'Clears the lowest set bit. Looping on it counts set bits in as many steps as there are set bits, and (n & (n-1)) == 0 tests for a power of two.');
  add('bit-manipulation', 'dsa', 'advanced', 'How do XOR and AND combine to add two integers?', 'XOR is the sum ignoring carries; AND shifted left by one is the carry. Repeat until the carry is zero.');

  /* ---------------- C++ ---------------- */
  add('cpp-core', 'cpp', 'beginner', 'Which initialisation form rejects narrowing?', 'Braces: int x{3.9} is a compile error, while int x = 3.9 silently truncates to 3.');
  add('cpp-core', 'cpp', 'beginner', 'What type does auto s = "hello" deduce?', 'const char*, not std::string. String literals are arrays of const char that decay to a pointer.');
  add('cpp-core', 'cpp', 'intermediate', 'Default way to pass a large read-only parameter?', 'const reference. No copy, and the compiler enforces that you do not modify it.');
  add('cpp-core', 'cpp', 'intermediate', 'How do you read `int* const p`?', 'Right to left: a const pointer to a mutable int. `const int* p` is a mutable pointer to a const int.');
  add('cpp-core', 'cpp', 'advanced', 'Why is returning a reference to a local undefined behaviour?', 'The local is destroyed at the closing brace, so the reference names freed stack memory. It often appears to work, which is what makes it dangerous.');
  add('cpp-core', 'cpp', 'advanced', 'const versus constexpr?', 'const means not modified through this name and may be computed at runtime. constexpr means available at compile time, which is what array bounds and template arguments need.');
  add('cpp-core', 'cpp', 'master', 'Why is undefined behaviour worse than a crash?', 'The optimiser assumes UB never happens, so it may delete the very check that would have caught it. The symptom then appears far from the cause, often only under optimisation.');
  add('cpp-memory', 'cpp', 'beginner', 'What frees a stack local?', 'Scope exit, automatically — including during exception unwinding. That guarantee is what RAII is built on.');
  add('cpp-memory', 'cpp', 'intermediate', 'What is a memory leak, precisely?', 'Allocated memory that nothing points to any more, so it can never be freed. Long-lived allocations are not leaks if something still references them.');
  add('cpp-memory', 'cpp', 'intermediate', 'Which smart pointer is the default choice?', 'unique_ptr. No reference count, no atomic overhead, and it documents that there is exactly one owner.');
  add('cpp-memory', 'cpp', 'advanced', 'Two shared_ptrs pointing at each other — what happens?', 'Neither reference count reaches zero, so neither is freed. Break the cycle by making one direction a weak_ptr.');
  add('cpp-memory', 'cpp', 'advanced', 'Why is RAII more reliable than a cleanup call at the end of a function?', 'A destructor runs on every exit path including exceptions and early returns. A cleanup statement only runs if control reaches it.');
  add('cpp-memory', 'cpp', 'master', 'What must a move constructor do after stealing the resource?', 'Null the source. Its destructor still runs, so leaving the pointer intact causes a double free.');
  add('cpp-memory', 'cpp', 'master', 'Why does vector copy instead of move when the move is not noexcept?', 'To preserve the strong exception guarantee — a throwing move cannot be rolled back partway through reallocation.');
  add('cpp-memory', 'cpp', 'advanced', 'What pairs with new[]?', 'delete[]. Mismatching new/delete forms is undefined behaviour, and free() never pairs with new because it does not run destructors.');
  add('cpp-oop', 'cpp', 'advanced', 'Why must a polymorphic base class have a virtual destructor?', 'Deleting a derived object through a base pointer otherwise runs only the base destructor, leaking every derived member.');
  add('cpp-oop', 'cpp', 'advanced', 'What is object slicing?', 'Copying a derived object into a base-typed variable discards the derived part, because the variable is only big enough for the base subobject.');
  add('cpp-oop', 'cpp', 'advanced', 'What does the override keyword actually buy you?', 'The compiler verifies you really are overriding a base virtual. Without it, a signature typo silently declares a new function and the base version keeps being called.');
  add('cpp-oop', 'cpp', 'intermediate', 'Why prefer a constructor initialiser list over assignment in the body?', 'Members are constructed directly with the right value rather than default-constructed and then assigned — and const and reference members can only be initialised, never assigned.');
  add('cpp-oop', 'cpp', 'master', 'What makes a C++ class abstract?', 'At least one pure virtual function, declared = 0. There is no abstract keyword.');
  add('cpp-modern', 'cpp', 'intermediate', 'What does std::optional solve that a sentinel does not?', 'Absence gets its own representation, so no legitimate value has to be sacrificed to mean "nothing".');
  add('cpp-modern', 'cpp', 'advanced', 'Main hazard of std::string_view?', 'It does not own the characters. Bind one to a temporary, or outlive the owning string, and it dangles.');
  add('cpp-modern', 'cpp', 'advanced', 'How does if constexpr differ from a normal if?', 'The untaken branch is discarded at instantiation, so it need not even compile for that type.');
  add('cpp-modern', 'cpp', 'advanced', 'What is the practical benefit of concepts?', 'Constraint failures are reported at the call site naming the requirement, instead of as errors deep inside the template body.');
  add('cpp-modern', 'cpp', 'master', 'What does it mean that ranges views are lazy?', 'No intermediate container is built. Elements flow through the whole pipeline one at a time as they are consumed.');
  add('cpp-modern', 'cpp', 'master', 'std::expected versus std::optional?', 'optional says something is missing; expected says why, carrying an error value. That is what lets a caller distinguish failure modes without exceptions.');
  add('rw-cpp', 'cpp', 'advanced', 'Why is a large model file mmap-ed rather than read?', 'Pages load lazily on first touch and the OS page cache is shared between processes, so startup is instant and a second process pays almost nothing.');
  add('rw-cpp', 'cpp', 'master', 'What is false sharing?', 'Independent variables sharing one 64-byte cache line. Every write invalidates the other core\'s copy, so more threads make it slower. Fix with alignas(64).');
  add('rw-cpp', 'cpp', 'master', 'Why does 4-bit quantisation speed up LLM inference so much?', 'Inference is memory-bandwidth-bound. Shrinking each weight from 4 bytes to half a byte cuts the traffic that dominates the runtime.');
  add('rw-cpp', 'cpp', 'advanced', 'Why is memcpy of an integer onto a wire format a bug?', 'It reproduces host byte order, little-endian on x86 and ARM, while most wire formats are big-endian. Shift and mask instead.');
  add('rw-cpp', 'cpp', 'advanced', 'What does nlohmann/json operator[] do on a missing key?', 'Inserts a default-constructed null and returns it — so a typo becomes silent data corruption. Use .at() when the key must exist.');

  /* ---------------- Python ---------------- */
  add('py-core', 'python', 'beginner', 'What does b = a do for a list in Python?', 'Binds a second name to the same list object. Nothing is copied, so mutating through either name is visible through both.');
  add('py-core', 'python', 'beginner', 'When should you use `is` rather than `==`?', 'Only for None, True and False. It tests identity, and it appears to work for small ints and short strings purely because of caching.');
  add('py-core', 'python', 'intermediate', 'When is a default argument evaluated?', 'Once, when the def statement runs — not per call. That is why a mutable default becomes shared state across calls.');
  add('py-core', 'python', 'advanced', 'Why do all the lambdas in [lambda: i for i in range(3)] print 2?', 'Closures capture the name, not the value. Bind eagerly with a default argument: lambda i=i: ...');
  add('py-core', 'python', 'intermediate', 'What happens when you iterate a generator twice?', 'The second iteration is empty. A generator holds one suspended execution and is consumed once.');
  add('py-core', 'python', 'advanced', 'What does copy.copy do to a list of lists?', 'Creates a new outer list holding the same inner list objects. Only deepcopy recurses.');
  add('py-core', 'python', 'master', 'Why is a bare `except:` dangerous?', 'It catches KeyboardInterrupt and SystemExit, so it swallows Ctrl-C and shutdown. Catch Exception, or the specific type.');
  add('py-core', 'python', 'advanced', 'Why does removing items while iterating a list skip elements?', 'The iterator advances by index. Removing shifts everything left, so the next element moves into the slot just visited and is stepped over.');
  add('py-data-model', 'python', 'advanced', 'What happens if you define __eq__ but not __hash__?', 'Python sets __hash__ to None, making instances unhashable and unusable in sets or as dict keys. Equal objects must hash equally.');
  add('py-data-model', 'python', 'advanced', 'Why return NotImplemented rather than False from __eq__ for a foreign type?', 'It lets Python try the reflected operation on the other operand before concluding they are unequal.');
  add('py-data-model', 'python', 'advanced', '__repr__ versus __str__?', '__repr__ targets developers and should be unambiguous; __str__ targets users. If you write only one, write __repr__ — str falls back to it.');
  add('py-data-model', 'python', 'master', 'What does functools.wraps preserve?', 'The wrapped function\'s __name__, __doc__ and signature. Without it the function reports itself as "wrapper" and introspection breaks.');
  add('py-data-model', 'python', 'master', 'What does returning True from __exit__ do?', 'Suppresses any exception raised in the with block. Doing it unintentionally silently hides real errors.');
  add('py-data-model', 'python', 'master', 'Why must @contextmanager wrap yield in try/finally?', 'An exception in the body propagates out through the yield. Without finally, the cleanup after it never runs.');
  add('py-data-model', 'python', 'advanced', 'What does @property give you over a plain attribute?', 'Validation or computation behind the attribute interface, so calling code never changes. That is why Python exposes plain attributes first.');
  add('py-stdlib-perf', 'python', 'beginner', 'Cost of `x in my_list` versus `x in my_set`?', 'O(n) versus O(1) average. If you test membership repeatedly, build a set once first.');
  add('py-stdlib-perf', 'python', 'intermediate', 'Why is building a string with += in a loop O(n^2)?', 'Strings are immutable, so each step allocates a new string and copies everything so far. Use "".join(parts).');
  add('py-stdlib-perf', 'python', 'intermediate', 'Why is list.pop(0) O(n)?', 'A list is a contiguous array, so every remaining element shifts down one slot. Use collections.deque and popleft for a queue.');
  add('py-stdlib-perf', 'python', 'advanced', 'Will threads speed up CPU-bound Python?', 'No. The GIL allows one thread to execute bytecode at a time. Use multiprocessing, or a native extension that releases the GIL. Threads do help for I/O.');
  add('py-stdlib-perf', 'python', 'intermediate', 'What kind of heap is heapq?', 'A min-heap. For max-heap behaviour push negated values, or tuples whose first element is the negated priority.');
  add('py-stdlib-perf', 'python', 'advanced', 'What does defaultdict(list) change?', 'A missing key is created with an empty list instead of raising KeyError — which also means a read can mutate the dict.');
  add('py-stdlib-perf', 'python', 'master', 'What does __slots__ buy, and what does it cost?', 'Removes the per-instance __dict__, cutting memory for many small objects. The cost is that you can no longer attach arbitrary attributes.');
  add('py-stdlib-perf', 'python', 'advanced', 'Is dict insertion order guaranteed?', 'Yes, since Python 3.7. It was an implementation detail in 3.6.');
  add('py-stdlib-perf', 'python', 'master', 'What workload does asyncio actually speed up?', 'I/O-bound work with many concurrent waits. There is no parallel CPU execution, so a blocking CPU call inside a coroutine stalls the whole event loop.');
  add('py-core', 'python', 'advanced', 'Which is truthy: [], "0", 0, {}?', 'Only "0". Any non-empty string is truthy, including "False". Empty containers and 0 are falsy.');

  /* ---------------- LLD ---------------- */
  add('lld-principles', 'lld', 'intermediate', 'Best test for a Single Responsibility violation?', 'More than one reason to change. If a schema change and a pricing change both edit the class, it has two responsibilities.');
  add('lld-principles', 'lld', 'intermediate', 'What code smell signals an Open/Closed violation?', 'A switch or if-chain over a type field that must be edited every time a new type is added.');
  add('lld-principles', 'lld', 'advanced', 'Why does Square inheriting Rectangle break Liskov?', 'Rectangle promises that setting width leaves height alone, and Square cannot honour that. Inheritance models behaviour, not taxonomy.');
  add('lld-principles', 'lld', 'advanced', 'Most practical benefit of dependency inversion?', 'The class can be tested with a fake, because it receives its collaborators rather than constructing them.');
  add('lld-principles', 'lld', 'advanced', 'Which pattern replaces an if-chain selecting between algorithms?', 'Strategy. Each branch becomes a class behind a common interface, and the choice is made once by injection.');
  add('lld-principles', 'lld', 'advanced', 'When is the State pattern the right answer?', 'When which operations are LEGAL changes with the object\'s mode — vending machines, elevators, order lifecycles.');
  add('lld-principles', 'lld', 'master', 'Strongest argument against Singleton?', 'It is global mutable state: dependencies are hidden from signatures, tests become order-dependent, and concurrency gets harder.');
  add('lld-principles', 'lld', 'master', 'What is the first move in a design interview?', 'Clarify requirements, scale and what is out of scope — and write the answers down. A design solving the wrong problem cannot be rescued.');
  add('lld-problems', 'lld', 'advanced', 'Why does an LRU cache need both a hash map and a doubly linked list?', 'The map gives O(1) lookup by key; the list gives O(1) reordering by recency. Neither structure does both.');
  add('lld-problems', 'lld', 'advanced', 'How do you make parking-lot allocation O(1)?', 'Keep a free list per spot size instead of scanning. Park pops from the smallest size that fits, falling back to larger lists.');
  add('lld-problems', 'lld', 'master', 'What does a rolling-window rate limiter fix?', 'The boundary burst. A fixed-window counter allows up to 2N requests across the moment it resets.');
  add('lld-problems', 'lld', 'advanced', 'How should "the lot is full" be expressed?', 'An empty optional or None. It is an expected outcome, not an exception.');
  add('lld-problems', 'lld', 'intermediate', 'Class or value type — how do you decide?', 'Does it have identity and a lifecycle, or is it fully described by its attributes? Two orders with identical contents are still different orders.');

  /* ---------------- ML ---------------- */
  add('ml-foundations', 'ml', 'beginner', 'Low training error, high validation error — what is it?', 'Overfitting. The model has fit noise specific to the training sample. More data, regularisation, or a simpler model.');
  add('ml-foundations', 'ml', 'intermediate', 'Will more data fix underfitting?', 'No. More data reduces variance; underfitting is a bias problem needing a more expressive model or better features.');
  add('ml-foundations', 'ml', 'intermediate', 'Why does L1 produce exactly-zero weights but L2 does not?', 'L1\'s gradient has constant magnitude so it keeps pushing to zero. L2\'s gradient is 2w, which shrinks as w does and only approaches zero.');
  add('ml-foundations', 'ml', 'advanced', 'What is preprocessing leakage?', 'Fitting a scaler or imputer before splitting, so validation statistics inform the training transform. Fit on train, then transform validation.');
  add('ml-foundations', 'ml', 'advanced', 'Why is random k-fold wrong for time series?', 'It trains on the future to predict the past, which cannot happen in production. Use forward chaining.');
  add('ml-foundations', 'ml', 'master', 'Validation error BELOW training error — what does it mean?', 'Usually a bug or leakage. Investigate the split before celebrating.');
  add('ml-foundations', 'ml', 'master', 'What breaks distance-based methods in high dimensions?', 'Distances concentrate — nearest and farthest neighbours become nearly equidistant, so "nearest" stops meaning anything.');
  add('ml-modeling', 'ml', 'beginner', '99.9% accuracy on 0.1% fraud — what have you learned?', 'Almost nothing. Predicting "not fraud" always scores the same. Use precision, recall and PR-AUC.');
  add('ml-modeling', 'ml', 'intermediate', 'Precision versus recall — how do you choose?', 'By the cost of each error. Recall for disease screening, where a miss is severe. Precision for spam filtering, where a false positive blocks real mail.');
  add('ml-modeling', 'ml', 'advanced', 'Why prefer PR-AUC over ROC-AUC under heavy imbalance?', 'The false positive rate has a huge denominator, so thousands of false positives barely move ROC. Precision reacts to them directly.');
  add('ml-modeling', 'ml', 'intermediate', 'Bagging versus boosting?', 'Bagging trains independently in parallel to cut variance. Boosting trains sequentially, each model correcting the last, to cut bias.');
  add('ml-modeling', 'ml', 'advanced', 'Why is F1 the harmonic and not the arithmetic mean?', 'The harmonic mean is dominated by the smaller value, so you cannot score well by maximising one metric and ignoring the other.');
  add('ml-modeling', 'ml', 'advanced', 'What does PCA optimise?', 'Directions of maximum variance in the inputs, ignoring the target entirely. A low-variance direction may still be the predictive one.');
  add('ml-deep-learning', 'ml', 'advanced', 'Why do deep sigmoid networks train badly?', 'Its derivative peaks at 0.25, so gradients shrink multiplicatively with depth. Ten layers scale by 0.25^10 and early layers stop learning.');
  add('ml-deep-learning', 'ml', 'advanced', 'How do residual connections help?', 'y = f(x) + x gives the gradient a path with derivative 1 straight back to earlier layers, regardless of what f does.');
  add('ml-deep-learning', 'ml', 'master', 'Why divide by sqrt(d_k) in attention?', 'Dot products grow with dimension. Unscaled, softmax saturates into a near one-hot distribution where the gradient vanishes.');
  add('ml-deep-learning', 'ml', 'advanced', 'Why must dropout be disabled at inference?', 'It randomly zeroes activations during training only. Leaving it on makes predictions random — a real and common bug.');
  add('ml-deep-learning', 'ml', 'advanced', 'Why not initialise all weights to zero?', 'Every neuron in a layer would compute the same output and get the same gradient, so they never differentiate. The layer has the capacity of one unit.');
  add('ml-deep-learning', 'ml', 'master', 'Why is self-attention expensive for long sequences?', 'Every token attends to every other, so the attention matrix is n×n — doubling the context quadruples time and memory.');
  add('ml-systems', 'ml', 'advanced', 'What is train/serve skew?', 'Features computed differently in training and production, so the model sees inputs it never trained on. Fix by computing features in shared code.');
  add('ml-systems', 'ml', 'advanced', 'Data drift versus concept drift?', 'Data drift moves the input distribution and is detectable without labels. Concept drift moves the input-to-target relationship and needs labels — so it is more dangerous.');
  add('ml-systems', 'ml', 'master', 'Why randomise an A/B test on user rather than request?', 'Otherwise one user sees both variants, contaminating the comparison and making per-user metrics meaningless.');
  add('ml-systems', 'ml', 'advanced', 'Earliest warning of a production problem, before labels arrive?', 'A shift in the input or prediction distribution. It needs no ground truth, so it catches a broken feature pipeline in minutes.');
  add('ml-systems', 'ml', 'intermediate', 'Where should a classification threshold come from?', 'The precision-recall curve, using your real cost ratio. 0.5 is an arbitrary default, and tuning it needs no retraining.');

  window.DB.flashcards.push.apply(window.DB.flashcards, C);
})();
