/* neetcode-7.js — tries, heap/priority queue, 2-D DP, plus the question banks
 * for trees and 1-D DP.
 */
(function () {
  'use strict';

  const P = [
    {
      id: 'nc-implement-trie', title: 'Implement a Trie', section: 'tries',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Implement a prefix tree supporting insert(word), search(word) which is true only for a complete inserted word, and startsWith(prefix) which is true if any inserted word begins with the prefix.',
      examples: [
        { in: 'insert("apple"); search("apple")', out: 'true', why: 'The word was inserted and its final node is marked terminal.' },
        { in: 'insert("apple"); search("app")', out: 'false', why: 'The path exists but "app" was never marked as a complete word.' },
        { in: 'insert("apple"); startsWith("app")', out: 'true', why: 'startsWith only requires the path to exist, not a terminal marker.' }
      ],
      constraints: ['Lowercase letters only.', 'Operations run in O(length of the string).'],
      approach: 'A trie is a tree where each edge is a character and each path from the root spells a prefix. A node holds a map or fixed array of children plus a boolean marking whether a word ends there. That boolean is the entire difference between search and startsWith: both walk the same path, but search additionally requires the terminal flag, which is why inserting "apple" does not make "app" a word. Every operation walks one node per character, so cost is O(length) and is completely independent of how many words the trie holds — that is what makes a trie beat a hash set for prefix queries, which a hash set cannot answer at all without scanning.',
      keyInsight: 'The terminal flag is the only thing separating search from startsWith. Both walk the identical path.',
      pitfalls: [
        'Omitting the terminal flag, making search and startsWith behave identically.',
        'Marking a node terminal on every insert step rather than only at the last character.',
        'Leaking nodes in C++ by using raw pointers with no destructor.'
      ],
      complexity: { time: 'O(m)', space: 'O(n*m)' },
      timeChoices: ['O(1)', 'O(m) where m is the word length', 'O(n) where n is the number of words', 'O(n*m)'], timeAnswer: 1,
      starter: {
        cpp: '#include <unordered_map>\n#include <string>\n#include <memory>\n\nclass Trie {\npublic:\n    Trie();\n    void insert(const std::string& word);\n    bool search(const std::string& word);\n    bool startsWith(const std::string& prefix);\n};',
        python: 'class Trie:\n    def __init__(self):\n        pass\n\n    def insert(self, word):\n        pass\n\n    def search(self, word):\n        pass\n\n    def starts_with(self, prefix):\n        pass'
      },
      solution: {
        cpp: '#include <unordered_map>\n#include <string>\n#include <memory>\n\nstruct TrieNode {\n    std::unordered_map<char, std::unique_ptr<TrieNode>> kids;\n    bool terminal = false;      // the ONLY difference between search/startsWith\n};\n\nclass Trie {\n    TrieNode root_;\n\n    TrieNode* walk(const std::string& s) {\n        TrieNode* cur = &root_;\n        for (char c : s) {\n            auto it = cur->kids.find(c);\n            if (it == cur->kids.end()) return nullptr;\n            cur = it->second.get();\n        }\n        return cur;\n    }\n\npublic:\n    void insert(const std::string& word) {\n        TrieNode* cur = &root_;\n        for (char c : word) {\n            auto& child = cur->kids[c];\n            if (!child) child = std::make_unique<TrieNode>();\n            cur = child.get();\n        }\n        cur->terminal = true;    // only the LAST node is marked\n    }\n\n    bool search(const std::string& word) {\n        TrieNode* n = walk(word);\n        return n && n->terminal;\n    }\n\n    bool startsWith(const std::string& prefix) {\n        return walk(prefix) != nullptr;\n    }\n};',
        python: 'class TrieNode:\n    __slots__ = ("kids", "terminal")\n\n    def __init__(self):\n        self.kids = {}\n        self.terminal = False    # the ONLY difference between search/starts_with\n\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def _walk(self, s):\n        cur = self.root\n        for c in s:\n            if c not in cur.kids:\n                return None\n            cur = cur.kids[c]\n        return cur\n\n    def insert(self, word):\n        cur = self.root\n        for c in word:\n            if c not in cur.kids:\n                cur.kids[c] = TrieNode()\n            cur = cur.kids[c]\n        cur.terminal = True      # only the LAST node is marked\n\n    def search(self, word):\n        node = self._walk(word)\n        return node is not None and node.terminal\n\n    def starts_with(self, prefix):\n        return self._walk(prefix) is not None'
      },
      checks: {
        cpp: [
          { re: 'struct\\s+\\w*Node|class\\s+\\w*Node|kids|children', hint: 'Model a node with child links.' },
          { re: 'terminal|isWord|isEnd', hint: 'Mark where complete words end.' },
          { re: 'insert', hint: 'Implement insert.' },
          { re: 'search', hint: 'Implement search.' },
          { re: 'startsWith|prefix', hint: 'Implement startsWith.' }
        ],
        python: [
          { re: 'kids|children|\\{\\s*\\}', hint: 'Model a node with child links.' },
          { re: 'terminal|is_word|is_end', hint: 'Mark where complete words end.' },
          { re: 'def\\s+insert', hint: 'Implement insert.' },
          { re: 'def\\s+search', hint: 'Implement search.' },
          { re: 'starts_with|prefix', hint: 'Implement starts_with.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why does a trie beat a hash set for prefix queries?',
          opts: ['It uses less memory', 'A hash set cannot answer prefix questions at all without scanning every key, while a trie walks one node per character', 'Hashing is slower', 'Tries are always sorted'],
          correct: 1, why: 'A hash destroys the structure of the key, so shared prefixes are not represented. The trie stores them explicitly, which is exactly what makes the query O(prefix length).' },
        { q: 'What is the cost of search in terms of the number of stored words n?',
          opts: ['O(n)', 'Independent of n — it depends only on the length of the query string', 'O(log n)', 'O(n log n)'],
          correct: 1, why: 'You walk one node per character regardless of how many words are stored, which is why tries scale well for autocomplete over large dictionaries.' }
      ]
    },
    {
      id: 'nc-kth-largest', title: 'Kth Largest Element in an Array', section: 'heap-pq',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Return the kth largest element in an unsorted array. This is the kth largest in sorted order, not the kth distinct value.\n\nAim to beat a full sort.',
      examples: [
        { in: 'nums = [3,2,1,5,6,4], k = 2', out: '5', why: 'Sorted descending gives 6,5,4,... so the second is 5.' },
        { in: 'nums = [3,3,3], k = 2', out: '3', why: 'Duplicates count separately; it is not the kth distinct value.' }
      ],
      constraints: ['1 <= k <= n.', 'Better than O(n log n) is possible.'],
      approach: 'Sorting costs O(n log n) and computes far more than you need. Keep a min-heap of size k instead: push each element and, whenever the heap exceeds k, pop the smallest. The heap then always holds the k largest elements seen so far, and its root is the smallest of those — which is exactly the kth largest overall. Each push and pop is O(log k), so the total is O(n log k), and space is O(k) rather than O(n). Use a min-heap rather than a max-heap: the point is to cheaply discard the smallest of the current best k, which is the root of a min-heap.',
      keyInsight: 'A min-heap capped at size k keeps the k largest, and its root is the kth largest. Capping is what makes it O(n log k).',
      pitfalls: [
        'Using a max-heap of all n elements, which is O(n) space and O(n + k log n) time.',
        'Letting the heap grow past k, losing the space advantage entirely.',
        'Treating it as the kth distinct value.'
      ],
      complexity: { time: 'O(n log k)', space: 'O(k)' },
      timeChoices: ['O(n)', 'O(n log k)', 'O(n log n)', 'O(k log n)'], timeAnswer: 1,
      starter: { cpp: '#include <queue>\n#include <vector>\n\nint findKthLargest(vector<int>& nums, int k) {\n    // your code here\n}', python: 'import heapq\n\ndef find_kth_largest(nums, k):\n    # your code here\n    pass' },
      solution: {
        cpp: '#include <queue>\n#include <vector>\n\nint findKthLargest(vector<int>& nums, int k) {\n    // min-heap of the k largest seen so far\n    priority_queue<int, vector<int>, greater<int>> heap;\n    for (int x : nums) {\n        heap.push(x);\n        if ((int)heap.size() > k) heap.pop();   // drop the smallest\n    }\n    return heap.top();                          // smallest of the k largest\n}',
        python: 'import heapq\n\ndef find_kth_largest(nums, k):\n    heap = []                      # min-heap of the k largest seen so far\n    for x in nums:\n        heapq.heappush(heap, x)\n        if len(heap) > k:\n            heapq.heappop(heap)    # drop the smallest\n    return heap[0]                 # smallest of the k largest'
      },
      checks: {
        cpp: [{ re: 'priority_queue|heap|nth_element|partial_sort', hint: 'Use a heap or a selection algorithm.' }, { re: 'for|while', hint: 'Process every element.' }, { re: 'k', hint: 'Bound the structure by k.' }, { re: 'return', hint: 'Return the kth largest.' }],
        python: [{ re: 'heapq|heappush|nlargest', hint: 'Use a heap.' }, { re: 'for|while|nlargest', hint: 'Process every element.' }, { re: 'k', hint: 'Bound the heap by k.' }, { re: 'return', hint: 'Return the kth largest.' }]
      },
      antiChecks: {
        cpp: [{ re: 'sort\\s*\\(\\s*nums\\.begin', hint: 'A full sort is O(n log n); the heap approach is O(n log k).' }],
        python: [{ re: 'sorted\\s*\\(|\\.sort\\s*\\(', hint: 'A full sort is O(n log n); the heap approach is O(n log k).' }]
      },
      mcq: [
        { q: 'Why a MIN-heap when looking for the kth LARGEST?',
          opts: ['It is a convention', 'The root of a min-heap is the smallest of the k largest, which is both the element to discard and the final answer', 'Max-heaps cannot be capped', 'To keep the array sorted'],
          correct: 1, why: 'You need cheap access to the weakest member of your current best k so it can be evicted. That is the min-heap root, and once every element is processed it is the answer.' },
        { q: 'When is O(n log k) meaningfully better than O(n log n)?',
          opts: ['Never', 'When k is much smaller than n — for k = 10 and n = 10 million the heap stays tiny and space is O(k)', 'Only for sorted input', 'Only when k equals n'],
          correct: 1, why: 'With small k, log k is nearly constant and memory is bounded by k rather than n, which also matters when the input is a stream too large to hold.' }
      ]
    },
    {
      id: 'nc-unique-paths', title: 'Unique Paths', section: 'dp-2d',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'A robot starts at the top-left of an m x n grid and can only move right or down. Return how many distinct paths reach the bottom-right corner.',
      examples: [
        { in: 'm = 3, n = 7', out: '28', why: 'Every path is a sequence of right and down moves; the count is the number of orderings.' },
        { in: 'm = 1, n = 5', out: '1', why: 'A single row leaves no choices — only right moves.' }
      ],
      constraints: ['Only right and down moves.', 'Grid dimensions are at least 1.'],
      approach: 'Subproblem: dp[i][j] is the number of distinct paths from the start to cell (i,j). Recurrence: the only ways into a cell are from directly above or directly left, and those path sets are disjoint, so dp[i][j] = dp[i-1][j] + dp[i][j-1]. Base case: the entire first row and first column are 1, since there is exactly one way to travel along an edge. Iteration order is row by row, left to right, which guarantees both predecessors are computed before they are read. Because each row depends only on the row above, the table collapses to a single array of length n updated in place, giving O(n) space.',
      keyInsight: 'Only two cells lead into any cell, and their path sets are disjoint — so the counts simply add.',
      pitfalls: [
        'Forgetting to initialise the first row and column to 1, which zeroes the whole table.',
        'Iterating in an order where a predecessor has not been computed yet.',
        'Using plain recursion without memoisation, which is exponential.'
      ],
      complexity: { time: 'O(m*n)', space: 'O(n)' },
      timeChoices: ['O(m+n)', 'O(m*n)', 'O(2^(m+n))', 'O(n log n)'], timeAnswer: 1,
      starter: { cpp: 'int uniquePaths(int m, int n) {\n    // your code here\n}', python: 'def unique_paths(m, n):\n    # your code here\n    pass' },
      solution: {
        cpp: '#include <vector>\n\nint uniquePaths(int m, int n) {\n    // one row: each cell already holds the value from the row above\n    std::vector<int> dp(n, 1);            // first row is all 1s\n    for (int i = 1; i < m; i++)\n        for (int j = 1; j < n; j++)\n            dp[j] += dp[j - 1];           // above + left\n    return dp[n - 1];\n}',
        python: 'def unique_paths(m, n):\n    # one row: each cell already holds the value from the row above\n    dp = [1] * n                    # first row is all 1s\n    for _ in range(1, m):\n        for j in range(1, n):\n            dp[j] += dp[j - 1]      # above + left\n    return dp[-1]'
      },
      checks: {
        cpp: [{ re: 'for[\\s\\S]{0,160}for', hint: 'Fill the table row by row.' }, { re: '\\+=|\\+', hint: 'Add the counts from above and from the left.' }, { re: 'vector|dp|\\[', hint: 'Keep a DP table or row.' }, { re: 'return', hint: 'Return the corner value.' }],
        python: [{ re: 'for[\\s\\S]{0,160}for', hint: 'Fill the table row by row.' }, { re: '\\+=|\\+', hint: 'Add the counts from above and from the left.' }, { re: 'dp|\\[', hint: 'Keep a DP table or row.' }, { re: 'return', hint: 'Return the corner value.' }]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why does the 2-D table collapse safely into one row?',
          opts: ['The grid is square', 'Each row depends only on the row immediately above, so updating in place left to right means dp[j-1] is already this row and dp[j] is still the row above', 'Because the answer is a single number', 'It does not, that is a bug'],
          correct: 1, why: 'At the moment of the update, dp[j] still holds the value from above and dp[j-1] has already been updated for this row — exactly the two operands the recurrence needs.' },
        { q: 'Why must the first row and column be initialised to 1?',
          opts: ['To avoid division by zero', 'There is exactly one path along an edge, and leaving them 0 makes every later sum 0', 'To mark them as visited', 'They should be initialised to 0'],
          correct: 1, why: 'Every interior value is a sum of earlier values. If the base cases are 0 the whole table stays 0, which is the most common bug on this problem.' }
      ]
    },
    {
      id: 'nc-lcs', title: 'Longest Common Subsequence', section: 'dp-2d',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Given two strings, return the length of their longest common subsequence — a sequence appearing in both in the same relative order, though not necessarily contiguously.',
      examples: [
        { in: 'text1 = "abcde", text2 = "ace"', out: '3', why: 'The subsequence "ace" appears in both in order.' },
        { in: 'text1 = "abc", text2 = "def"', out: '0', why: 'No common characters at all.' }
      ],
      constraints: ['Subsequence, not substring — gaps are allowed.', 'Return the length only.'],
      approach: 'Subproblem: dp[i][j] is the LCS length of the first i characters of text1 and the first j characters of text2. Recurrence: if the characters at positions i-1 and j-1 match, that character can safely join the LCS of the two shorter prefixes, so dp[i][j] = dp[i-1][j-1] + 1. If they do not match, one of the two characters must be discarded, and since you cannot know which, take the better of both options: max(dp[i-1][j], dp[i][j-1]). Base case: any prefix compared against an empty string gives 0, which is why the table has an extra row and column of zeros. Iterate rows outward so all three predecessors are ready.',
      keyInsight: 'On a match the answer extends the diagonal; on a mismatch you must drop one character, so take the better of the two drops.',
      pitfalls: [
        'Sizing the table m x n instead of (m+1) x (n+1), losing the empty-prefix base case.',
        'Confusing indices: dp[i][j] compares text1[i-1] with text2[j-1].',
        'Solving longest common substring instead, which resets to 0 on a mismatch rather than taking a max.'
      ],
      complexity: { time: 'O(m*n)', space: 'O(m*n)' },
      timeChoices: ['O(m+n)', 'O(m*n)', 'O(2^n)', 'O(n log n)'], timeAnswer: 1,
      starter: { cpp: 'int longestCommonSubsequence(string text1, string text2) {\n    // your code here\n}', python: 'def longest_common_subsequence(text1, text2):\n    # your code here\n    pass' },
      solution: {
        cpp: '#include <vector>\n#include <string>\n#include <algorithm>\n\nint longestCommonSubsequence(std::string text1, std::string text2) {\n    int m = text1.size(), n = text2.size();\n    // (m+1) x (n+1): row 0 and column 0 are the empty-prefix base case\n    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));\n\n    for (int i = 1; i <= m; i++)\n        for (int j = 1; j <= n; j++)\n            if (text1[i - 1] == text2[j - 1])\n                dp[i][j] = dp[i - 1][j - 1] + 1;        // extend the diagonal\n            else\n                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);  // drop one\n\n    return dp[m][n];\n}',
        python: 'def longest_common_subsequence(text1, text2):\n    m, n = len(text1), len(text2)\n    # (m+1) x (n+1): row 0 and column 0 are the empty-prefix base case\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if text1[i - 1] == text2[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1          # extend the diagonal\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # drop one\n\n    return dp[m][n]'
      },
      checks: {
        cpp: [{ re: 'for[\\s\\S]{0,160}for', hint: 'Fill the 2-D table.' }, { re: '==', hint: 'Compare the two characters.' }, { re: 'max\\s*\\(', hint: 'On a mismatch take the better of the two drops.' }, { re: '\\+\\s*1', hint: 'On a match extend the diagonal by one.' }, { re: 'return', hint: 'Return the bottom-right value.' }],
        python: [{ re: 'for[\\s\\S]{0,160}for', hint: 'Fill the 2-D table.' }, { re: '==', hint: 'Compare the two characters.' }, { re: 'max\\s*\\(', hint: 'On a mismatch take the better of the two drops.' }, { re: '\\+\\s*1', hint: 'On a match extend the diagonal by one.' }, { re: 'return', hint: 'Return the bottom-right value.' }]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'What changes if the problem asked for the longest common SUBSTRING?',
          opts: ['Nothing', 'A mismatch resets dp[i][j] to 0 instead of taking a max, and the answer is the table maximum rather than the corner', 'You would sort the strings', 'It becomes O(n^3)'],
          correct: 1, why: 'A substring must be contiguous, so a mismatch breaks the run entirely. The best run can end anywhere, so the answer is the maximum over the whole table.' },
        { q: 'Why does the table need m+1 rows and n+1 columns?',
          opts: ['For padding against out-of-bounds access', 'Row 0 and column 0 encode the base case of comparing against an empty prefix, which is 0', 'To store the reconstructed sequence', 'To make it square'],
          correct: 1, why: 'Every recurrence reads dp[i-1][...] or dp[...][j-1]. The zero row and column give those reads a defined value at the boundary.' }
      ]
    }
  ];

  const Q = [
    /* ---- trees ---- */
    { id: 'q-tr-001', section: 'trees', tier: 'beginner', topic: 'traversal',
      q: 'Which traversal of a binary search tree visits the values in sorted order?',
      opts: ['Pre-order', 'In-order', 'Post-order', 'Level order'],
      correct: 1, why: 'In-order visits left subtree, node, then right subtree. Combined with the BST invariant that left < node < right, that produces ascending order.' },

    { id: 'q-tr-002', section: 'trees', tier: 'intermediate', topic: 'BFS vs DFS',
      q: 'Which traversal do you need for level-order output?',
      opts: ['DFS with a stack', 'BFS with a queue, processing one level at a time', 'In-order recursion', 'Post-order recursion'],
      correct: 1, why: 'A queue visits nodes in the order they were discovered, which is level by level. Recording the queue size at the start of each round separates the levels.' },

    { id: 'q-tr-003', section: 'trees', tier: 'intermediate', topic: 'validation',
      q: 'Why is checking node.left < node < node.right at every node insufficient to validate a BST?',
      opts: ['It is sufficient', 'It only checks immediate children — a deep descendant can still violate the ordering with an ancestor', 'It fails for empty trees', 'It is too slow'],
      correct: 1, why: 'A node in the left subtree must be less than every ancestor it descends from, not just its parent. Pass down a valid (min, max) range instead.' },

    { id: 'q-tr-004', section: 'trees', tier: 'advanced', topic: 'complexity',
      q: 'What is the worst-case search time in an unbalanced BST?',
      opts: ['O(log n)', 'O(n), when the tree degenerates into a linked list', 'O(1)', 'O(n log n)'],
      correct: 1, why: 'Inserting already-sorted data produces a chain with no branching. Self-balancing trees such as AVL or red-black exist precisely to guarantee O(log n).' },

    { id: 'q-tr-005', section: 'trees', tier: 'advanced', topic: 'LCA',
      q: 'What makes finding the lowest common ancestor easier in a BST than in a general binary tree?',
      opts: ['BSTs are always balanced', 'The ordering tells you which way to go: the split point where the two targets diverge is the LCA', 'BSTs store parent pointers', 'It is not easier'],
      correct: 1, why: 'If both values are smaller than the node go left, if both are larger go right; the first node between them is the LCA. A general tree needs a full search of both subtrees.' },

    { id: 'q-tr-006', section: 'trees', tier: 'advanced', topic: 'diameter',
      q: 'When computing the diameter of a binary tree, why does the recursive function return height rather than diameter?',
      opts: ['Diameter cannot be computed recursively', 'Each node needs its children\'s heights to compute the path through itself, while the best diameter is tracked separately as a side effect', 'Height is faster to compute', 'They are the same quantity'],
      correct: 1, why: 'The longest path through a node is leftHeight + rightHeight. The parent needs height, so height is returned and the diameter is accumulated in an outer variable.' },

    { id: 'q-tr-007', section: 'trees', tier: 'master', topic: 'reconstruction',
      q: 'Why can a binary tree be reconstructed from preorder plus inorder, but not from preorder alone?',
      opts: ['Preorder is unordered', 'Preorder gives the root but not where the left subtree ends; inorder supplies that split point', 'Preorder loses the leaves', 'It can be reconstructed from preorder alone'],
      correct: 1, why: 'Preorder identifies each root. Locating that root in the inorder sequence partitions the remaining nodes into left and right subtrees, which is the missing information.' },

    /* ---- tries ---- */
    { id: 'q-ti-001', section: 'tries', tier: 'intermediate', topic: 'structure',
      q: 'What does each edge in a trie represent?',
      opts: ['A whole word', 'A single character, so a root-to-node path spells a prefix', 'A hash bucket', 'A comparison result'],
      correct: 1, why: 'Shared prefixes are stored once and shared by every word using them, which is what makes prefix queries cost only the length of the prefix.' },

    { id: 'q-ti-002', section: 'tries', tier: 'intermediate', topic: 'terminal flag',
      q: 'After inserting only "apple", why does search("app") return false while startsWith("app") returns true?',
      opts: ['The path does not exist', 'The path exists, but the node for "app" is not marked as the end of a complete word', 'search is case sensitive', 'startsWith is buggy'],
      correct: 1, why: 'Both walk the identical path. The terminal boolean is the only thing distinguishing a stored word from a mere prefix.' },

    { id: 'q-ti-003', section: 'tries', tier: 'advanced', topic: 'complexity',
      q: 'What does trie lookup cost depend on?',
      opts: ['The number of stored words', 'The length of the query string only', 'The alphabet size', 'The tree depth times the word count'],
      correct: 1, why: 'One node is visited per character regardless of dictionary size, which is why tries scale for autocomplete over millions of entries.' },

    { id: 'q-ti-004', section: 'tries', tier: 'advanced', topic: 'wildcards',
      q: 'How do you support a "." wildcard matching any single character in a trie search?',
      opts: ['Sort the children', 'Recurse into every child at that position instead of one, which branches the search', 'Convert the trie to a hash map', 'It is not possible'],
      correct: 1, why: 'A concrete character follows one edge; a wildcard must try all of them. Worst case the search degenerates toward exploring the whole trie.' },

    { id: 'q-ti-005', section: 'tries', tier: 'master', topic: 'word search',
      q: 'In Word Search II, why build a trie of the dictionary rather than searching the board once per word?',
      opts: ['Tries use less memory', 'One board traversal can match all words at once, pruning immediately when no word shares the current prefix', 'It avoids recursion', 'The board must be sorted'],
      correct: 1, why: 'Per-word search repeats the same board exploration for every shared prefix. The trie collapses that into a single traversal with early pruning.' },

    { id: 'q-ti-006', section: 'tries', tier: 'intermediate', topic: 'trade-offs',
      q: 'What is the main memory cost of a trie using a fixed 26-slot array per node?',
      opts: ['Nothing, it is optimal', 'Most slots are empty, so sparse dictionaries waste substantial space compared with a hash map per node', 'It cannot store long words', 'It requires sorting'],
      correct: 1, why: 'A fixed array gives O(1) child access but pays for 26 pointers whether or not they are used. A hash map per node trades a little speed for much less space on sparse data.' },

    /* ---- heap ---- */
    { id: 'q-hp-001', section: 'heap-pq', tier: 'beginner', topic: 'basics',
      q: 'What does a min-heap guarantee?',
      opts: ['The array is fully sorted', 'The smallest element is at the root; siblings are unordered relative to each other', 'Lookup by value is O(1)', 'Insertion is O(1) worst case'],
      correct: 1, why: 'The heap property only relates parents to children. That partial order is exactly why building a heap is cheaper than sorting.' },

    { id: 'q-hp-002', section: 'heap-pq', tier: 'intermediate', topic: 'complexity',
      q: 'What are the costs of push and pop on a binary heap of n elements?',
      opts: ['O(1) and O(1)', 'O(log n) and O(log n)', 'O(log n) and O(n)', 'O(n) and O(log n)'],
      correct: 1, why: 'Both restore the heap property by sifting along one root-to-leaf path, whose length is the tree height. Peeking at the root is O(1).' },

    { id: 'q-hp-003', section: 'heap-pq', tier: 'advanced', topic: 'top-k',
      q: 'For the k largest of n elements, why is a size-k min-heap better than sorting?',
      opts: ['It is not', 'O(n log k) beats O(n log n) and uses O(k) space, which also works when the input is a stream', 'It gives sorted output', 'Sorting cannot handle duplicates'],
      correct: 1, why: 'Sorting computes the full ordering when only k elements matter. With k much smaller than n the saving is large in both time and memory.' },

    { id: 'q-hp-004', section: 'heap-pq', tier: 'advanced', topic: 'max-heap in python',
      q: 'Python\'s heapq is a min-heap. How do you get max-heap behaviour?',
      opts: ['Pass reverse=True', 'Push negated values and negate again on pop', 'Use sorted() instead', 'It is impossible'],
      correct: 1, why: 'Negation inverts the ordering. For tuples, negate only the priority component so any tie-breaking fields keep their natural order.' },

    { id: 'q-hp-005', section: 'heap-pq', tier: 'advanced', topic: 'median stream',
      q: 'How do two heaps maintain a running median?',
      opts: ['One heap holding everything', 'A max-heap of the lower half and a min-heap of the upper half, kept balanced in size so the median sits at one or both roots', 'Two min-heaps', 'A heap plus a sorted array'],
      correct: 1, why: 'The two roots are the middle elements. Rebalancing after each insertion keeps the split at the median, giving O(log n) insert and O(1) query.' },

    { id: 'q-hp-006', section: 'heap-pq', tier: 'master', topic: 'heapify',
      q: 'Why is building a heap from an unsorted array O(n) rather than O(n log n)?',
      opts: ['It uses a different algorithm entirely', 'Sifting down from the bottom means most nodes are near the leaves and sift only a short distance; the sum of the work is linear', 'Because the array is already partially sorted', 'It is actually O(n log n)'],
      correct: 1, why: 'Half the nodes are leaves and do no work, a quarter sift at most one level, and so on. That series sums to O(n), unlike n successive O(log n) insertions.' },

    { id: 'q-hp-007', section: 'heap-pq', tier: 'advanced', topic: 'merge k lists',
      q: 'How does a heap help merge k sorted lists of n total elements?',
      opts: ['It sorts everything again', 'Keep one candidate from each list in a size-k heap; each pop yields the next smallest overall, giving O(n log k)', 'It removes duplicates', 'It is not applicable'],
      correct: 1, why: 'The heap answers "which of the k current heads is smallest" in O(log k). Concatenating and sorting would be O(n log n), which is worse when k is small.' },

    /* ---- 1-D DP ---- */
    { id: 'q-d1-001', section: 'dp-1d', tier: 'beginner', topic: 'when DP applies',
      q: 'What two properties must a problem have for dynamic programming to apply?',
      opts: ['Sorted input and no duplicates', 'Overlapping subproblems and optimal substructure', 'A recursive definition and a base case', 'Small input size'],
      correct: 1, why: 'Overlapping subproblems make caching worthwhile; optimal substructure means the optimum is built from optima of subproblems. Without the second, caching is correct but the recurrence is wrong.' },

    { id: 'q-d1-002', section: 'dp-1d', tier: 'intermediate', topic: 'memoisation',
      q: 'What is the difference between top-down memoisation and bottom-up tabulation?',
      opts: ['Only the space used', 'Top-down recurses and caches on demand, computing only reachable states; bottom-up fills the table iteratively and avoids recursion depth limits', 'Top-down is always faster', 'Bottom-up cannot handle 2-D problems'],
      correct: 1, why: 'They compute the same values. Top-down is easier to derive from the recurrence; bottom-up avoids stack overflow and makes space optimisation obvious.' },

    { id: 'q-d1-003', section: 'dp-1d', tier: 'intermediate', topic: 'house robber',
      q: 'In House Robber, what is the recurrence at index i?',
      opts: ['dp[i] = dp[i-1] + nums[i]', 'dp[i] = max(dp[i-1], dp[i-2] + nums[i])', 'dp[i] = max(nums[i], dp[i-1])', 'dp[i] = dp[i-1] + dp[i-2]'],
      correct: 1, why: 'Either you skip house i and keep the best through i-1, or you take it and add the best through i-2 since adjacent houses cannot both be robbed.' },

    { id: 'q-d1-004', section: 'dp-1d', tier: 'advanced', topic: 'coin change',
      q: 'Why does greedy fail on Coin Change but DP succeed?',
      opts: ['Greedy is slower', 'Taking the largest coin first can foreclose a better combination; DP evaluates every option for each amount', 'Greedy cannot handle duplicates', 'They both work'],
      correct: 1, why: 'With coins [1,3,4] and target 6, greedy gives 4+1+1 while the optimum is 3+3. The greedy choice is not safe, so all combinations must be considered.' },

    { id: 'q-d1-005', section: 'dp-1d', tier: 'advanced', topic: 'LIS',
      q: 'What makes the O(n log n) longest-increasing-subsequence algorithm work?',
      opts: ['It sorts the input first', 'It maintains an array of the smallest possible tail for each subsequence length, and binary-searches the position to replace', 'It uses a heap', 'It is a greedy algorithm'],
      correct: 1, why: 'The tails array is sorted, so binary search finds the insertion point in O(log n). Its length is the LIS length, though its contents are not necessarily a valid subsequence.' },

    { id: 'q-d1-006', section: 'dp-1d', tier: 'advanced', topic: 'space optimisation',
      q: 'When can a 1-D DP be reduced to a constant number of variables?',
      opts: ['Always', 'When each state depends only on a fixed number of immediately preceding states', 'Only for Fibonacci', 'Never'],
      correct: 1, why: 'Fibonacci and House Robber each look back at most two steps, so two variables suffice. A recurrence referring to arbitrary earlier indices, such as Coin Change, needs the full table.' },

    { id: 'q-d1-007', section: 'dp-1d', tier: 'master', topic: 'word break',
      q: 'In Word Break, what does dp[i] represent?',
      opts: ['The number of words in the first i characters', 'Whether the prefix of length i can be segmented entirely into dictionary words', 'The longest word ending at i', 'The index of the last word'],
      correct: 1, why: 'Defining the subproblem as a boolean over prefixes gives the recurrence: dp[i] is true when some j has dp[j] true and s[j:i] in the dictionary.' },

    /* ---- 2-D DP ---- */
    { id: 'q-d2-001', section: 'dp-2d', tier: 'intermediate', topic: 'table shape',
      q: 'Why do string DP tables usually have dimensions (m+1) x (n+1)?',
      opts: ['To avoid out-of-bounds reads', 'The extra row and column encode the empty-prefix base case, which the recurrence reads at the boundary', 'To make the table square', 'To store the reconstructed answer'],
      correct: 1, why: 'Recurrences reference dp[i-1] and dp[j-1]. The zero row and column give those references a defined base value instead of a special case.' },

    { id: 'q-d2-002', section: 'dp-2d', tier: 'intermediate', topic: 'LCS vs substring',
      q: 'How does the recurrence for longest common SUBSTRING differ from SUBSEQUENCE?',
      opts: ['They are identical', 'On a mismatch, substring resets the cell to 0 rather than taking the max of the neighbours', 'Substring uses a 1-D table', 'Subsequence resets to 0'],
      correct: 1, why: 'A substring must be contiguous, so a mismatch ends the run. The answer is then the maximum anywhere in the table rather than the bottom-right corner.' },

    { id: 'q-d2-003', section: 'dp-2d', tier: 'advanced', topic: 'edit distance',
      q: 'What do the three terms in the edit-distance recurrence correspond to?',
      opts: ['Left, right and middle', 'Deletion, insertion and substitution', 'Match, mismatch and skip', 'Add, multiply and compare'],
      correct: 1, why: 'dp[i-1][j] is a deletion, dp[i][j-1] an insertion and dp[i-1][j-1] a substitution. Take the minimum and add one unless the characters already match.' },

    { id: 'q-d2-004', section: 'dp-2d', tier: 'advanced', topic: 'space optimisation',
      q: 'When can a 2-D DP be reduced to a single row?',
      opts: ['Whenever the table is square', 'When each row depends only on the row immediately above, so the row can be updated in place', 'Only for counting problems', 'Never, the full table is always needed'],
      correct: 1, why: 'Unique Paths and LCS both qualify, cutting space from O(m*n) to O(n). Reconstructing the actual sequence rather than its length still needs the full table.' },

    { id: 'q-d2-005', section: 'dp-2d', tier: 'advanced', topic: 'knapsack',
      q: 'In 0/1 knapsack, what does dp[i][w] represent?',
      opts: ['The weight of item i', 'The maximum value achievable using the first i items within capacity w', 'The number of items that fit', 'The remaining capacity'],
      correct: 1, why: 'Two dimensions are needed because the answer depends on both which items are available and how much capacity remains. Each item is either taken or skipped.' },

    { id: 'q-d2-006', section: 'dp-2d', tier: 'master', topic: 'iteration order',
      q: 'When compressing 0/1 knapsack to one dimension, why iterate capacity in reverse?',
      opts: ['It is faster', 'Forward iteration would let the same item be used twice, silently turning it into the unbounded knapsack', 'To handle negative weights', 'The order does not matter'],
      correct: 1, why: 'Reverse iteration guarantees dp[w - weight] still holds the previous row\'s value, meaning the item has not yet been used in this pass.' },

    { id: 'q-d2-007', section: 'dp-2d', tier: 'master', topic: 'interval DP',
      q: 'What characterises an interval DP such as Burst Balloons?',
      opts: ['It iterates left to right once', 'The state is a range (i, j) and the transition picks a split point inside it, so subproblems are solved by increasing range length', 'It uses a heap', 'It has no base case'],
      correct: 1, why: 'Because a range depends on strictly shorter ranges, the iteration must go by length. Burst Balloons additionally reframes the choice as the LAST balloon burst, which makes the subproblems independent.' }
  ];

  window.DB.problems.push.apply(window.DB.problems, P);
  window.DB.questions.push.apply(window.DB.questions, Q);
})();
