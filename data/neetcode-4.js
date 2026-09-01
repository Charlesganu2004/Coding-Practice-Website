/* NeetCode part 4 — backtracking, graphs, advanced graphs (27 problems + 24 questions) */
(function () {
  const P = [ /* coding problems */

    /* ---------------- BACKTRACKING (9) ---------------- */

    {
      id: 'nc-subsets',
      title: 'Subsets',
      section: 'backtracking',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an array nums of unique integers, return all possible subsets (the power set). The solution set must not contain duplicate subsets; the subsets may be returned in any order.',
      examples: [
        { in: 'nums = [1,2,3]', out: '[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]] (any order)' },
        { in: 'nums = [0]', out: '[[],[0]]' }
      ],
      approach: 'The decision tree has one level per index. At level i the state is (index i, the partial subset built so far) and there are exactly two branches: take nums[i], or skip it. A leaf is reached when i == n, and every leaf is a distinct subset, so the tree has 2^n leaves and no pruning is possible or needed. Recurse: push nums[i], recurse on i+1, pop it (undo the choice), recurse on i+1 again. The pop is what makes the shared partial-subset buffer correct for the sibling branch. An equivalent iterative formulation loops over the 2^n bitmasks and reads bit i to decide inclusion.',
      keyInsight: 'Backtracking is just a depth-first walk of a decision tree where the partial answer is shared mutable state — every choice you push you must pop on the way out.',
      pitfalls: [
        'Storing a reference to the working buffer instead of a copy — every stored subset then ends up empty at the end.',
        'Forgetting to undo the choice after the recursive call, which leaks elements into sibling branches.',
        'Trying to "optimise" past O(2^n): the output itself has 2^n entries, so that is a hard floor.'
      ],
      complexity: { time: 'O(n * 2^n)', space: 'O(n)' },
      timeChoices: ['O(n^2)', 'O(n * 2^n)', 'O(n log n)', 'O(n!)'],
      timeAnswer: 1,
      starter: {
        cpp: 'vector<vector<int>> subsets(vector<int>& nums) {\n    // your code here\n}',
        python: 'def subsets(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<int>> subsets(vector<int>& nums) {\n    vector<vector<int>> res;\n    vector<int> cur;\n    function<void(int)> dfs = [&](int i) {\n        if (i == (int)nums.size()) { res.push_back(cur); return; }\n        cur.push_back(nums[i]);   // branch 1: take nums[i]\n        dfs(i + 1);\n        cur.pop_back();           // undo\n        dfs(i + 1);               // branch 2: skip nums[i]\n    };\n    dfs(0);\n    return res;\n}',
        python: 'def subsets(nums):\n    res, cur = [], []\n\n    def dfs(i):\n        if i == len(nums):\n            res.append(cur[:])\n            return\n        cur.append(nums[i])   # branch 1: take nums[i]\n        dfs(i + 1)\n        cur.pop()             # undo\n        dfs(i + 1)            # branch 2: skip nums[i]\n\n    dfs(0)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'push_back|emplace_back|insert\\(', hint: 'Collect each finished subset into the result vector.' },
          { re: 'pop_back\\(|resize\\(|erase\\(|1\\s*<<|for\\s*\\(', hint: 'Either undo the last choice after recursing, or enumerate the 2^n bitmasks with a loop.' },
          { re: 'return', hint: 'Return the collected subsets.' }
        ],
        python: [
          { re: 'append\\(|\\+=|\\+\\s*\\[', hint: 'Collect each finished subset into the result list.' },
          { re: 'pop\\(|\\[:\\]|list\\(|range\\(|for\\s+\\w+', hint: 'Undo the last choice after recursing, or enumerate the 2^n masks with a loop.' },
          { re: 'return', hint: 'Return the collected subsets.' }
        ]
      },
      mcq: [
        { q: 'Why must the current subset be copied when it is appended to the results?',
          opts: ['Copying is faster than moving', 'The buffer is shared mutable state and keeps changing as the recursion continues', 'Otherwise the subsets come out unsorted', 'To avoid integer overflow'],
          correct: 1,
          why: 'All branches write into one buffer. Storing a reference means every stored "subset" aliases that one buffer, which is empty once the recursion unwinds.' }
      ]
    },

    {
      id: 'nc-combination-sum',
      title: 'Combination Sum',
      section: 'backtracking',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an array of distinct positive integers candidates and a positive integer target, return all unique combinations of candidates whose elements sum to target. The same number may be chosen an unlimited number of times. Two combinations are the same if they use the same multiset of numbers.',
      examples: [
        { in: 'candidates = [2,3,6,7], target = 7', out: '[[2,2,3],[7]]' },
        { in: 'candidates = [2], target = 1', out: '[]' }
      ],
      approach: 'State is (index i, remaining target). The decision tree again has two branches per node, but the "take" branch recurses on the SAME index i (unlimited reuse) with remaining - candidates[i], while the "skip" branch moves to i+1 with remaining unchanged. Never letting the index move backwards is what prevents [2,3] and [3,2] from both appearing. Base cases prune the search: remaining == 0 is a solution leaf, and remaining < 0 or i == n is a dead leaf that is abandoned immediately. If you sort the candidates first you can prune harder — once candidates[i] > remaining, every later candidate is too big as well.',
      keyInsight: 'Reuse is expressed by recursing on the same index; uniqueness is enforced by never revisiting an earlier index.',
      pitfalls: [
        'Looping over all candidates from 0 at every level — that generates permutations of the same multiset.',
        'Checking remaining < 0 only after pushing, and forgetting to pop before returning.',
        'Assuming candidates are sorted when the problem does not say so — sort explicitly if you rely on the break-early prune.'
      ],
      complexity: { time: 'O(n^(target/min)) in the worst case', space: 'O(target/min)' },
      timeChoices: ['O(n log n)', 'O(n * target)', 'O(n^(target/min)) branching search', 'O(target^2)'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<vector<int>> combinationSum(vector<int>& candidates, int target) {\n    // your code here\n}',
        python: 'def combination_sum(candidates, target):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<int>> combinationSum(vector<int>& candidates, int target) {\n    vector<vector<int>> res;\n    vector<int> cur;\n    function<void(int,int)> dfs = [&](int i, int remain) {\n        if (remain == 0) { res.push_back(cur); return; }\n        if (remain < 0 || i == (int)candidates.size()) return;\n        cur.push_back(candidates[i]);\n        dfs(i, remain - candidates[i]);   // reuse the same candidate\n        cur.pop_back();\n        dfs(i + 1, remain);               // move on\n    };\n    dfs(0, target);\n    return res;\n}',
        python: 'def combination_sum(candidates, target):\n    res, cur = [], []\n\n    def dfs(i, remain):\n        if remain == 0:\n            res.append(cur[:])\n            return\n        if remain < 0 or i == len(candidates):\n            return\n        cur.append(candidates[i])\n        dfs(i, remain - candidates[i])   # reuse the same candidate\n        cur.pop()\n        dfs(i + 1, remain)               # move on\n\n    dfs(0, target)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'push_back|emplace_back', hint: 'Collect combinations that reach the target.' },
          { re: '-\\s*\\w+|<\\s*0|>\\s*\\w+|<=', hint: 'Track the remaining target (or the running sum) so you can stop when it is exhausted or exceeded.' },
          { re: 'return', hint: 'Return the list of combinations.' }
        ],
        python: [
          { re: 'append\\(', hint: 'Collect combinations that reach the target.' },
          { re: '-\\s*\\w+|<\\s*0|>\\s*\\w+|<=', hint: 'Track the remaining target (or the running sum) so you can stop when it is exhausted or exceeded.' },
          { re: 'return', hint: 'Return the list of combinations.' }
        ]
      },
      mcq: [
        { q: 'The "take" branch recurses on index i again instead of i+1. What does that encode?',
          opts: ['That candidates may be reused an unlimited number of times', 'That the array is sorted', 'That duplicates in the input are skipped', 'That the recursion is tail-recursive'],
          correct: 0,
          why: 'Staying on i lets the same value be chosen repeatedly; advancing to i+1 would allow it at most once.' }
      ]
    },

    {
      id: 'nc-permutations',
      title: 'Permutations',
      section: 'backtracking',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an array nums of distinct integers, return all possible permutations of its elements in any order.',
      examples: [
        { in: 'nums = [1,2,3]', out: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]] (any order)' },
        { in: 'nums = [0,1]', out: '[[0,1],[1,0]]' }
      ],
      approach: 'State is (the prefix built so far, the set of still-unused indices). Unlike subsets, the decision tree branches n ways at the root, n-1 ways at depth 1, and so on, giving n! leaves. At each node loop over every index, skip the ones already marked used, mark it, append its value, recurse, then unmark and pop. The used[] array is the state that distinguishes this tree from a plain product tree. An in-place variant swaps nums[start] with nums[i] and recurses on start+1, which uses no extra used[] array but permutes the input.',
      keyInsight: 'The branching factor shrinks by one at every level — that is the whole difference between n! permutations and n^n sequences.',
      pitfalls: [
        'Forgetting to reset used[i] = false after the recursive call, which silently truncates the output.',
        'Using a value-based visited set instead of an index-based one — that breaks the moment the input contains duplicates.',
        'Checking size against n inside the loop rather than at the top of the call, which misses the final permutation.'
      ],
      complexity: { time: 'O(n * n!)', space: 'O(n)' },
      timeChoices: ['O(n * n!)', 'O(2^n)', 'O(n^2)', 'O(n log n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'vector<vector<int>> permute(vector<int>& nums) {\n    // your code here\n}',
        python: 'def permute(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<int>> permute(vector<int>& nums) {\n    int n = nums.size();\n    vector<vector<int>> res;\n    vector<int> cur;\n    vector<bool> used(n, false);\n    function<void()> dfs = [&]() {\n        if ((int)cur.size() == n) { res.push_back(cur); return; }\n        for (int i = 0; i < n; i++) {\n            if (used[i]) continue;\n            used[i] = true;\n            cur.push_back(nums[i]);\n            dfs();\n            cur.pop_back();\n            used[i] = false;\n        }\n    };\n    dfs();\n    return res;\n}',
        python: 'def permute(nums):\n    n = len(nums)\n    res, cur = [], []\n    used = [False] * n\n\n    def dfs():\n        if len(cur) == n:\n            res.append(cur[:])\n            return\n        for i in range(n):\n            if used[i]:\n                continue\n            used[i] = True\n            cur.append(nums[i])\n            dfs()\n            cur.pop()\n            used[i] = False\n\n    dfs()\n    return res'
      },
      checks: {
        cpp: [
          { re: 'vector\\s*<\\s*bool|bool\\s+\\w+\\[|set<|swap\\(|unordered_set', hint: 'Track which elements are already placed (a used array, a set, or the swap trick).' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Try every unused element at each level.' },
          { re: 'push_back|emplace_back', hint: 'Collect a permutation once its length equals n.' }
        ],
        python: [
          { re: 'used|visited|set\\(|remove\\(|pop\\(|permutations', hint: 'Track which elements are already placed (a used list, a set, or removal from a pool).' },
          { re: 'for\\s+\\w+|while\\s+', hint: 'Try every unused element at each level.' },
          { re: 'append\\(|return', hint: 'Collect a permutation once its length equals n.' }
        ]
      },
      mcq: [
        { q: 'Why is a used[] array indexed by position rather than a set of values the more robust choice?',
          opts: ['It uses less memory', 'It keeps the output sorted', 'It still works when the input contains repeated values', 'It removes the need to backtrack'],
          correct: 2,
          why: 'A value set cannot distinguish two equal elements, so with duplicates it would refuse to place the second copy at all.' }
      ]
    },

    {
      id: 'nc-subsets-ii',
      title: 'Subsets II',
      section: 'backtracking',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given an integer array nums that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets; return them in any order.',
      examples: [
        { in: 'nums = [1,2,2]', out: '[[],[1],[1,2],[1,2,2],[2],[2,2]] (any order)' },
        { in: 'nums = [0]', out: '[[],[0]]' }
      ],
      approach: 'Sort first so equal values sit next to each other. Then use the start-index formulation: at a node with state (start, partial subset) record the partial subset immediately, then loop i from start to n-1 and recurse with start = i+1. Duplicates are killed by the level-local guard "if i > start and nums[i] == nums[i-1], continue": within one node of the decision tree, a value is allowed to open only its first branch. Deeper levels may still take another copy, because there i == start and the guard does not fire. That is precisely the difference between "use the same value twice in one subset" (allowed) and "explore two identical sibling branches" (forbidden).',
      keyInsight: 'Deduplicate by branch, not by result: the i > start guard blocks identical siblings while leaving the deeper take-another-copy path open.',
      pitfalls: [
        'Skipping the sort — the guard only works when equal values are adjacent.',
        'Writing "i > 0" instead of "i > start", which also forbids taking a second copy at a deeper level.',
        'Deduplicating at the end with a hash set of serialised subsets: correct but wastes the whole point and blows up memory.'
      ],
      complexity: { time: 'O(n * 2^n)', space: 'O(n)' },
      timeChoices: ['O(n^2)', 'O(2^n / n)', 'O(n!)', 'O(n * 2^n)'],
      timeAnswer: 3,
      starter: {
        cpp: 'vector<vector<int>> subsetsWithDup(vector<int>& nums) {\n    // your code here\n}',
        python: 'def subsets_with_dup(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<int>> subsetsWithDup(vector<int>& nums) {\n    sort(nums.begin(), nums.end());\n    vector<vector<int>> res;\n    vector<int> cur;\n    function<void(int)> dfs = [&](int start) {\n        res.push_back(cur);\n        for (int i = start; i < (int)nums.size(); i++) {\n            if (i > start && nums[i] == nums[i - 1]) continue;  // skip identical sibling\n            cur.push_back(nums[i]);\n            dfs(i + 1);\n            cur.pop_back();\n        }\n    };\n    dfs(0);\n    return res;\n}',
        python: 'def subsets_with_dup(nums):\n    nums.sort()\n    res, cur = [], []\n\n    def dfs(start):\n        res.append(cur[:])\n        for i in range(start, len(nums)):\n            if i > start and nums[i] == nums[i - 1]:\n                continue  # skip identical sibling\n            cur.append(nums[i])\n            dfs(i + 1)\n            cur.pop()\n\n    dfs(0)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'sort\\(|stable_sort\\(|map<|unordered_map<', hint: 'Sort so equal values are adjacent (or count occurrences instead).' },
          { re: 'continue|break|if\\s*\\(', hint: 'Skip a value that would open a second identical branch at the same level.' },
          { re: 'push_back|emplace_back', hint: 'Record the partial subset at every node.' }
        ],
        python: [
          { re: 'sort\\(|sorted\\(|Counter|dict\\(|\\{\\s*\\}', hint: 'Sort so equal values are adjacent (or count occurrences instead).' },
          { re: 'continue|break|if\\s', hint: 'Skip a value that would open a second identical branch at the same level.' },
          { re: 'append\\(', hint: 'Record the partial subset at every node.' }
        ]
      },
      mcq: [
        { q: 'Why is the duplicate guard written as "i > start" and not "i > 0"?',
          opts: ['To keep the loop in bounds', 'i > 0 would also block taking a legitimate second copy at a deeper level', 'It makes the sort unnecessary', 'The two are equivalent'],
          correct: 1,
          why: 'At a deeper level i equals start for the first candidate, so i > start lets [2,2] form while still blocking two identical branches from one node.' }
      ]
    },

    {
      id: 'nc-combination-sum-ii',
      title: 'Combination Sum II',
      section: 'backtracking',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given a collection of candidate numbers (which may contain duplicates) and a target, find all unique combinations that sum to the target. Each number in candidates may be used at most once in a combination.',
      examples: [
        { in: 'candidates = [10,1,2,7,6,1,5], target = 8', out: '[[1,1,6],[1,2,5],[1,7],[2,6]]' },
        { in: 'candidates = [2,5,2,1,2], target = 5', out: '[[1,2,2],[5]]' }
      ],
      approach: 'Sort, then walk the start-index decision tree where the state is (start, remaining). Each element may be used at most once, so the recursive call is always dfs(i + 1, remaining - candidates[i]). Two prunes matter. First, the duplicate prune: "if i > start and candidates[i] == candidates[i-1], continue" removes identical sibling branches, exactly as in Subsets II. Second, the sorted-order prune: "if candidates[i] > remaining, break" abandons the whole rest of the loop, because with a sorted array every later candidate is at least as large and can only overshoot. Together they turn an exponential blow-up into a search that is usually tiny.',
      keyInsight: 'Sorting buys you two different prunes at once — adjacency for deduplication, and monotonicity for the break-early cut.',
      pitfalls: [
        'Using continue instead of break on the overshoot test — correct, but it throws away the prune.',
        'Recursing on i instead of i+1, which allows reusing the same physical element.',
        'Deduplicating with a set of sorted tuples afterwards instead of pruning during the search.'
      ],
      complexity: { time: 'O(n * 2^n) worst case, far less after pruning', space: 'O(n)' },
      timeChoices: ['O(n log n)', 'O(n * 2^n) worst case', 'O(n * target)', 'O(n^3)'],
      timeAnswer: 1,
      starter: {
        cpp: 'vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {\n    // your code here\n}',
        python: 'def combination_sum2(candidates, target):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {\n    sort(candidates.begin(), candidates.end());\n    vector<vector<int>> res;\n    vector<int> cur;\n    function<void(int,int)> dfs = [&](int start, int remain) {\n        if (remain == 0) { res.push_back(cur); return; }\n        for (int i = start; i < (int)candidates.size(); i++) {\n            if (i > start && candidates[i] == candidates[i - 1]) continue;  // dedup prune\n            if (candidates[i] > remain) break;                              // sorted prune\n            cur.push_back(candidates[i]);\n            dfs(i + 1, remain - candidates[i]);\n            cur.pop_back();\n        }\n    };\n    dfs(0, target);\n    return res;\n}',
        python: 'def combination_sum2(candidates, target):\n    candidates.sort()\n    res, cur = [], []\n\n    def dfs(start, remain):\n        if remain == 0:\n            res.append(cur[:])\n            return\n        for i in range(start, len(candidates)):\n            if i > start and candidates[i] == candidates[i - 1]:\n                continue  # dedup prune\n            if candidates[i] > remain:\n                break     # sorted prune\n            cur.append(candidates[i])\n            dfs(i + 1, remain - candidates[i])\n            cur.pop()\n\n    dfs(0, target)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'sort\\(|stable_sort\\(|map<|unordered_map<', hint: 'Sort (or count) so duplicates can be handled at each level.' },
          { re: 'continue|break', hint: 'Prune identical sibling branches, and stop once a candidate overshoots the remaining target.' },
          { re: 'push_back|emplace_back', hint: 'Collect combinations that hit the target exactly.' }
        ],
        python: [
          { re: 'sort\\(|sorted\\(|Counter', hint: 'Sort (or count) so duplicates can be handled at each level.' },
          { re: 'continue|break', hint: 'Prune identical sibling branches, and stop once a candidate overshoots the remaining target.' },
          { re: 'append\\(', hint: 'Collect combinations that hit the target exactly.' }
        ]
      },
      mcq: [
        { q: 'On sorted candidates, why is "break" valid when candidates[i] exceeds the remaining target?',
          opts: ['Because the array might contain negatives', 'Because every later candidate is at least as large, so no later branch can succeed', 'Because the recursion depth is bounded', 'Because duplicates were already removed'],
          correct: 1,
          why: 'Monotonicity of the sorted array means the whole suffix overshoots; continue would test each one uselessly.' }
      ]
    },

    {
      id: 'nc-word-search',
      title: 'Word Search',
      section: 'backtracking',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically neighbouring). The same cell may not be used more than once in one path.',
      examples: [
        { in: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', out: 'true' },
        { in: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', out: 'false' }
      ],
      approach: 'DFS with backtracking on the grid. The state is (row, col, index k into word) plus the set of cells on the current path. From every cell that matches word[0] start a search: if board[r][c] != word[k] the branch dies immediately, which is the main prune; otherwise temporarily overwrite the cell with a sentinel such as # so the path cannot revisit it, recurse into the four neighbours with k+1, and then restore the character. Restoring is essential: the mark means "on the current path", not "seen at some point", so a cell that failed on one path must be free for a different path.',
      keyInsight: 'The visited mark is per-path state, so it must be undone on the way out — a global visited set would wrongly poison cells for later attempts.',
      pitfalls: [
        'Using a persistent visited matrix that is never cleared, which rejects words that legitimately reuse a cell on a different route.',
        'Checking bounds after indexing the board instead of before.',
        'Returning as soon as one neighbour returns false rather than trying all four.'
      ],
      complexity: { time: 'O(m * n * 4^L) where L is the word length', space: 'O(L)' },
      timeChoices: ['O(m * n)', 'O(m * n * L)', 'O(m * n * 4^L)', 'O(4^(m*n))'],
      timeAnswer: 2,
      starter: {
        cpp: 'bool exist(vector<vector<char>>& board, string word) {\n    // your code here\n}',
        python: 'def exist(board, word):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool exist(vector<vector<char>>& board, string word) {\n    int m = board.size(), n = board[0].size();\n    function<bool(int,int,int)> dfs = [&](int r, int c, int k) -> bool {\n        if (k == (int)word.size()) return true;\n        if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] != word[k]) return false;\n        char saved = board[r][c];\n        board[r][c] = \'#\';                     // mark: on current path\n        bool found = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1)\n                  || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);\n        board[r][c] = saved;                   // undo the mark\n        return found;\n    };\n    for (int r = 0; r < m; r++)\n        for (int c = 0; c < n; c++)\n            if (dfs(r, c, 0)) return true;\n    return false;\n}',
        python: 'def exist(board, word):\n    m, n = len(board), len(board[0])\n\n    def dfs(r, c, k):\n        if k == len(word):\n            return True\n        if r < 0 or c < 0 or r >= m or c >= n or board[r][c] != word[k]:\n            return False\n        saved = board[r][c]\n        board[r][c] = \'#\'                      # mark: on current path\n        found = (dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1)\n                 or dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1))\n        board[r][c] = saved                    # undo the mark\n        return found\n\n    for r in range(m):\n        for c in range(n):\n            if dfs(r, c, 0):\n                return True\n    return False'
      },
      checks: {
        cpp: [
          { re: '<\\s*0|>=|>\\s*=', hint: 'Bounds-check the row and column before touching the board.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Move to the four orthogonal neighbours.' },
          { re: 'visited|saved|tmp|temp|=\\s*\\x27#\\x27|insert\\(|erase\\(', hint: 'Mark the cell as being on the current path, then unmark it when the branch fails.' }
        ],
        python: [
          { re: '<\\s*0|>=|0\\s*<=', hint: 'Bounds-check the row and column before touching the board.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Move to the four orthogonal neighbours.' },
          { re: 'visited|saved|tmp|temp|add\\(|remove\\(|discard\\(', hint: 'Mark the cell as being on the current path, then unmark it when the branch fails.' }
        ]
      },
      mcq: [
        { q: 'What breaks if the cell mark is never restored after a failed branch?',
          opts: ['The search becomes infinite', 'Cells burned on a dead path stay blocked, so a valid word on a different route is missed', 'The complexity becomes exponential', 'Nothing — restoring is only a memory optimisation'],
          correct: 1,
          why: 'The mark encodes membership in the current path; leaving it set turns it into a global ban and produces false negatives.' }
      ]
    },

    {
      id: 'nc-palindrome-partitioning',
      title: 'Palindrome Partitioning',
      section: 'backtracking',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given a string s, partition it so that every substring of the partition is a palindrome. Return all possible palindrome partitionings of s.',
      examples: [
        { in: 's = "aab"', out: '[["a","a","b"],["aa","b"]]' },
        { in: 's = "a"', out: '[["a"]]' }
      ],
      approach: 'The decision tree is over cut positions. State is (start index, list of pieces chosen so far). From a node at start, the branches are the possible end positions end = start..n-1; a branch is taken only when s[start..end] is a palindrome, and that palindrome test is the prune that keeps the tree small. Recurse with start = end + 1, and pop the piece afterwards. Reaching start == n means every character has been consumed by some palindromic piece, so the current list is a valid partition. Precomputing an isPal[i][j] table with the standard interval DP (isPal[i][j] = s[i]==s[j] and (j-i<2 or isPal[i+1][j-1])) makes each test O(1) instead of O(n).',
      keyInsight: 'Every partition of a string of length n is a choice of cut positions, so the raw space is 2^(n-1); the palindrome test prunes it at the branch, not at the leaf.',
      pitfalls: [
        'Testing the palindrome only at the leaf, which explores all 2^(n-1) partitions before rejecting them.',
        'Off-by-one in substr — the piece is s[start..end] inclusive, length end - start + 1.',
        'Recursing with start = end instead of end + 1, which produces an infinite loop.'
      ],
      complexity: { time: 'O(n * 2^n)', space: 'O(n) plus O(n^2) for the palindrome table' },
      timeChoices: ['O(n^2)', 'O(n * 2^n)', 'O(n^3)', 'O(n!)'],
      timeAnswer: 1,
      starter: {
        cpp: 'vector<vector<string>> partition(string s) {\n    // your code here\n}',
        python: 'def partition(s):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<string>> partition(string s) {\n    int n = s.size();\n    vector<vector<bool>> isPal(n, vector<bool>(n, false));\n    for (int i = n - 1; i >= 0; i--)\n        for (int j = i; j < n; j++)\n            isPal[i][j] = (s[i] == s[j]) && (j - i < 2 || isPal[i + 1][j - 1]);\n    vector<vector<string>> res;\n    vector<string> cur;\n    function<void(int)> dfs = [&](int start) {\n        if (start == n) { res.push_back(cur); return; }\n        for (int end = start; end < n; end++) {\n            if (!isPal[start][end]) continue;   // prune non-palindromic cuts\n            cur.push_back(s.substr(start, end - start + 1));\n            dfs(end + 1);\n            cur.pop_back();\n        }\n    };\n    dfs(0);\n    return res;\n}',
        python: 'def partition(s):\n    n = len(s)\n    is_pal = [[False] * n for _ in range(n)]\n    for i in range(n - 1, -1, -1):\n        for j in range(i, n):\n            is_pal[i][j] = s[i] == s[j] and (j - i < 2 or is_pal[i + 1][j - 1])\n\n    res, cur = [], []\n\n    def dfs(start):\n        if start == n:\n            res.append(cur[:])\n            return\n        for end in range(start, n):\n            if not is_pal[start][end]:\n                continue  # prune non-palindromic cuts\n            cur.append(s[start:end + 1])\n            dfs(end + 1)\n            cur.pop()\n\n    dfs(0)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'substr\\(|\\.at\\(|\\[\\s*\\w+\\s*\\]', hint: 'Cut a piece s[start..end] and test it.' },
          { re: 'isPal|palind|rbegin|reverse|==\\s*s\\[|\\[\\s*\\w+\\s*\\]\\s*==\\s*\\w+\\[', hint: 'Check whether the piece is a palindrome (two pointers, reversal, or a precomputed table).' },
          { re: 'push_back|emplace_back', hint: 'Record a partition once the whole string is consumed.' }
        ],
        python: [
          { re: '\\[\\s*\\w+\\s*:|\\bslice\\b', hint: 'Cut a piece s[start:end+1] and test it.' },
          { re: '::-1|reversed\\(|is_pal|palind|==\\s*s\\[', hint: 'Check whether the piece is a palindrome (slice reversal, two pointers, or a precomputed table).' },
          { re: 'append\\(', hint: 'Record a partition once the whole string is consumed.' }
        ]
      },
      mcq: [
        { q: 'Precomputing an n x n palindrome table costs O(n^2). Why is that still a win?',
          opts: ['It reduces the number of partitions explored', 'It removes the recursion', 'It turns each of the exponentially many palindrome tests from O(n) into O(1)', 'It lets you skip the backtracking pop'],
          correct: 2,
          why: 'The number of tests is exponential in n, so amortising each one to O(1) with a one-off O(n^2) table strictly dominates.' }
      ]
    },

    {
      id: 'nc-letter-combinations',
      title: 'Letter Combinations of a Phone Number',
      section: 'backtracking',
      tier: 'beginner',
      difficulty: 'Medium',
      prompt: 'Given a string containing digits from 2 to 9, return all possible letter combinations that the number could spell on a classic phone keypad (2 -> abc, 3 -> def, 4 -> ghi, 5 -> jkl, 6 -> mno, 7 -> pqrs, 8 -> tuv, 9 -> wxyz). Return the answers in any order. An empty input returns an empty list.',
      examples: [
        { in: 'digits = "23"', out: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
        { in: 'digits = "2"', out: '["a","b","c"]' }
      ],
      approach: 'This is a pure Cartesian product, so the decision tree is uniform: the state is (index i into digits, string built so far), and at level i the branches are exactly the 3 or 4 letters mapped to digits[i]. Every leaf at depth len(digits) is a valid answer and nothing is ever pruned — there are no constraints to violate. Append a letter, recurse on i+1, pop it. The only real case to handle is the empty input, which must produce [] rather than [""].',
      keyInsight: 'A backtracking template with no failure condition degenerates into enumerating a Cartesian product — the shape of the recursion is identical, only the prune is missing.',
      pitfalls: [
        'Returning [""] for empty input instead of [].',
        'Indexing the keypad table with the raw character rather than digit - 2 (or a map keyed by the character).',
        'Building the string by concatenation at every node instead of push/pop, which is correct but allocates far more.'
      ],
      complexity: { time: 'O(n * 4^n)', space: 'O(n)' },
      timeChoices: ['O(n^2)', 'O(3^n) exactly', 'O(n * 4^n)', 'O(n log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<string> letterCombinations(string digits) {\n    // your code here\n}',
        python: 'def letter_combinations(digits):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<string> letterCombinations(string digits) {\n    if (digits.empty()) return {};\n    vector<string> pad = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};\n    vector<string> res;\n    string cur;\n    function<void(int)> dfs = [&](int i) {\n        if (i == (int)digits.size()) { res.push_back(cur); return; }\n        for (char ch : pad[digits[i] - \'0\']) {\n            cur.push_back(ch);\n            dfs(i + 1);\n            cur.pop_back();\n        }\n    };\n    dfs(0);\n    return res;\n}',
        python: 'def letter_combinations(digits):\n    if not digits:\n        return []\n    pad = {\'2\': \'abc\', \'3\': \'def\', \'4\': \'ghi\', \'5\': \'jkl\',\n           \'6\': \'mno\', \'7\': \'pqrs\', \'8\': \'tuv\', \'9\': \'wxyz\'}\n    res, cur = [], []\n\n    def dfs(i):\n        if i == len(digits):\n            res.append(\'\'.join(cur))\n            return\n        for ch in pad[digits[i]]:\n            cur.append(ch)\n            dfs(i + 1)\n            cur.pop()\n\n    dfs(0)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'abc|"abc"|pqrs', hint: 'Map each digit to its letters.' },
          { re: 'empty\\(\\)|size\\(\\)\\s*==\\s*0|!\\s*digits', hint: 'Return an empty list for an empty input.' },
          { re: 'push_back|emplace_back|\\+=', hint: 'Build each combination and collect it at full depth.' }
        ],
        python: [
          { re: 'abc|pqrs', hint: 'Map each digit to its letters.' },
          { re: 'not\\s+digits|len\\(\\s*digits\\s*\\)\\s*==\\s*0|==\\s*\\x27\\x27', hint: 'Return an empty list for an empty input.' },
          { re: 'append\\(|join\\(|\\+=|product\\(', hint: 'Build each combination and collect it at full depth.' }
        ]
      },
      mcq: [
        { q: 'Why does this problem need no pruning at all?',
          opts: ['Because the input is short', 'Because every leaf of the decision tree is a valid answer — there is no constraint to violate', 'Because the letters are sorted', 'Because the recursion is iterative under the hood'],
          correct: 1,
          why: 'It is a plain Cartesian product; pruning exists to cut branches that cannot lead to a solution, and here none exist.' }
      ]
    },

    {
      id: 'nc-n-queens',
      title: 'N-Queens',
      section: 'backtracking',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'Place n queens on an n x n chessboard so that no two attack each other, and return all distinct solutions. Each solution is a board drawn with Q for a queen and . for an empty square.',
      examples: [
        { in: 'n = 4', out: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' },
        { in: 'n = 1', out: '[["Q"]]' }
      ],
      approach: 'Fix one queen per row — that alone removes all row conflicts and cuts the state space from C(n^2, n) to n^n. The state is (current row r, the columns used, the two diagonal families used). At row r the branches are the n columns; a branch is legal only if column c is free, diagonal r - c is free and anti-diagonal r + c is free. Keeping those three as boolean arrays (offset the r - c index by n - 1 so it is non-negative) makes each legality test O(1), so the prune fires at the cheapest possible moment, before any recursion. Mark, recurse to r + 1, unmark. Reaching r == n means all n queens are placed, so render the board from the recorded column per row.',
      keyInsight: 'Two constant-time identities carry the whole algorithm: cells on one diagonal share r - c, cells on one anti-diagonal share r + c.',
      pitfalls: [
        'Indexing the r - c array without the +(n-1) offset, which is negative for half the board.',
        'Rescanning the partial board for conflicts at every placement — correct but O(n) per test and much slower.',
        'Forgetting to clear all three markers on the way out of a branch.'
      ],
      complexity: { time: 'O(n!) branches with O(1) checks, O(n^2) to render each solution', space: 'O(n)' },
      timeChoices: ['O(n^2)', 'O(2^n)', 'O(n!)', 'O(n^n) with no pruning possible'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<vector<string>> solveNQueens(int n) {\n    // your code here\n}',
        python: 'def solve_n_queens(n):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<string>> solveNQueens(int n) {\n    vector<vector<string>> res;\n    vector<int> pos(n, -1);\n    vector<bool> col(n, false), diag(2 * n - 1, false), anti(2 * n - 1, false);\n    function<void(int)> dfs = [&](int r) {\n        if (r == n) {\n            vector<string> board;\n            for (int i = 0; i < n; i++) {\n                string row(n, \'.\');\n                row[pos[i]] = \'Q\';\n                board.push_back(row);\n            }\n            res.push_back(board);\n            return;\n        }\n        for (int c = 0; c < n; c++) {\n            int d = r - c + n - 1, a = r + c;\n            if (col[c] || diag[d] || anti[a]) continue;   // O(1) prune\n            col[c] = diag[d] = anti[a] = true;\n            pos[r] = c;\n            dfs(r + 1);\n            col[c] = diag[d] = anti[a] = false;\n        }\n    };\n    dfs(0);\n    return res;\n}',
        python: 'def solve_n_queens(n):\n    res = []\n    pos = [-1] * n\n    cols, diag, anti = set(), set(), set()\n\n    def dfs(r):\n        if r == n:\n            res.append([\'.\' * c + \'Q\' + \'.\' * (n - c - 1) for c in pos])\n            return\n        for c in range(n):\n            if c in cols or (r - c) in diag or (r + c) in anti:\n                continue  # O(1) prune\n            cols.add(c); diag.add(r - c); anti.add(r + c)\n            pos[r] = c\n            dfs(r + 1)\n            cols.remove(c); diag.remove(r - c); anti.remove(r + c)\n\n    dfs(0)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'r\\s*-\\s*c|\\w+\\s*-\\s*\\w+|abs\\(', hint: 'Detect the main diagonal with row - col (or an absolute-difference test).' },
          { re: 'r\\s*\\+\\s*c|\\w+\\s*\\+\\s*\\w+', hint: 'Detect the anti-diagonal with row + col.' },
          { re: 'push_back|emplace_back', hint: 'Render and collect a board once all n rows are filled.' }
        ],
        python: [
          { re: 'r\\s*-\\s*c|\\w+\\s*-\\s*\\w+|abs\\(', hint: 'Detect the main diagonal with row - col (or an absolute-difference test).' },
          { re: 'r\\s*\\+\\s*c|\\w+\\s*\\+\\s*\\w+', hint: 'Detect the anti-diagonal with row + col.' },
          { re: 'append\\(', hint: 'Render and collect a board once all n rows are filled.' }
        ]
      },
      mcq: [
        { q: 'Placing exactly one queen per row is not a heuristic — why is it lossless?',
          opts: ['Because n queens on n rows cannot avoid sharing a row unless there is exactly one per row', 'Because queens cannot move diagonally', 'Because the board is square', 'Because it makes rendering easier'],
          correct: 0,
          why: 'With n queens and n rows, any solution with two in one row leaves a row empty and those two attack each other, so one-per-row loses no solutions.' }
      ]
    },

    /* ---------------- GRAPHS (12) ---------------- */

    {
      id: 'nc-number-of-islands',
      title: 'Number of Islands',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an m x n grid of characters where "1" is land and "0" is water, return the number of islands. An island is a maximal group of land cells connected horizontally or vertically; the grid is surrounded by water on all sides.',
      examples: [
        { in: 'grid = [["1","1","0","0"],["1","1","0","0"],["0","0","1","0"],["0","0","0","1"]]', out: '3' },
        { in: 'grid = [["0","0"],["0","0"]]', out: '0' }
      ],
      approach: 'Flood fill — a connected-components count via DFS (or BFS; either works, the grid is unweighted and we only need reachability). Scan every cell; when an unvisited land cell is found, increment the counter and launch a traversal that sinks the entire component by rewriting each reached "1" to "0". Sinking in place doubles as the visited marker, so no extra matrix is needed. Because every cell is enqueued or recursed on at most once, the whole scan is O(m*n). Union-find over the land cells is an equally valid alternative and gives the same count as the number of distinct roots.',
      keyInsight: 'Counting islands is counting connected components: the outer scan finds one seed per component, and the flood fill guarantees you never seed the same component twice.',
      pitfalls: [
        'Comparing grid[r][c] to the integer 1 instead of the character "1".',
        'Recursing before bounds-checking, which reads out of range on the border.',
        'Deep recursion on a huge all-land grid can overflow the stack — prefer an explicit BFS queue there.'
      ],
      complexity: { time: 'O(m * n)', space: 'O(m * n) worst case for the stack or queue' },
      timeChoices: ['O(m * n)', 'O(m * n * log(m * n))', 'O((m * n)^2)', 'O(m + n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int numIslands(vector<vector<char>>& grid) {\n    // your code here\n}',
        python: 'def num_islands(grid):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int numIslands(vector<vector<char>>& grid) {\n    if (grid.empty()) return 0;\n    int m = grid.size(), n = grid[0].size(), count = 0;\n    function<void(int,int)> sink = [&](int r, int c) {\n        if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] != \'1\') return;\n        grid[r][c] = \'0\';                     // visited marker\n        sink(r + 1, c); sink(r - 1, c);\n        sink(r, c + 1); sink(r, c - 1);\n    };\n    for (int r = 0; r < m; r++)\n        for (int c = 0; c < n; c++)\n            if (grid[r][c] == \'1\') { count++; sink(r, c); }\n    return count;\n}',
        python: 'def num_islands(grid):\n    from collections import deque\n    if not grid or not grid[0]:\n        return 0\n    m, n = len(grid), len(grid[0])\n    count = 0\n    for r in range(m):\n        for c in range(n):\n            if grid[r][c] != \'1\':\n                continue\n            count += 1\n            grid[r][c] = \'0\'\n            q = deque([(r, c)])\n            while q:                            # BFS flood fill\n                cr, cc = q.popleft()\n                for nr, nc in ((cr + 1, cc), (cr - 1, cc), (cr, cc + 1), (cr, cc - 1)):\n                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == \'1\':\n                        grid[nr][nc] = \'0\'\n                        q.append((nr, nc))\n    return count'
      },
      checks: {
        cpp: [
          { re: 'for\\s*\\(', hint: 'Scan every cell looking for an unvisited land seed.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Traverse the four orthogonal neighbours.' },
          { re: 'visited|=\\s*\\x270\\x27|queue|stack|parent|find', hint: 'Mark cells as consumed (or union them) so each component is counted once.' }
        ],
        python: [
          { re: 'for\\s+\\w+', hint: 'Scan every cell looking for an unvisited land seed.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Traverse the four orthogonal neighbours.' },
          { re: 'visited|=\\s*\\x270\\x27|deque|append\\(|pop\\(|parent|find', hint: 'Mark cells as consumed (or union them) so each component is counted once.' }
        ]
      },
      mcq: [
        { q: 'Why does the outer scan not overcount a large island many times?',
          opts: ['Because islands are convex', 'Because the flood fill erases the whole component before the scan moves on', 'Because the scan visits cells in row-major order', 'Because the counter is incremented after the fill'],
          correct: 1,
          why: 'By the time the scan reaches any other cell of that island it has already been rewritten to water, so it cannot seed a second count.' }
      ]
    },

    {
      id: 'nc-clone-graph',
      title: 'Clone Graph',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given a reference to a node in a connected undirected graph, return a deep copy of the graph. Each node holds an int val and a list of its neighbours (class Node { int val; vector<Node*> neighbors; }). Return null for a null input.',
      examples: [
        { in: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', out: 'a new 4-node graph with the same shape' },
        { in: 'adjList = [[]]', out: 'a single new node with value 1 and no neighbours' }
      ],
      approach: 'DFS (BFS works identically) over the graph, carrying a hash map from original node to its clone. The map is doing two jobs at once: it is the visited set that stops the traversal from looping forever on cycles, and it is the lookup that lets a second edge into an already-cloned node point at the same clone rather than making a duplicate. Order matters: create the clone and insert it into the map BEFORE recursing into the neighbours, otherwise a cycle re-enters the same node and recurses forever.',
      keyInsight: 'One map from old node to new node serves as both the visited set and the identity table — that is what makes shared and cyclic structure survive the copy.',
      pitfalls: [
        'Recursing into neighbours before registering the clone, which infinite-loops on any cycle.',
        'Keying the map by node value instead of node identity — values are not guaranteed unique in general graph problems.',
        'Copying the neighbour pointers from the original instead of the clones, producing a half-copied graph.'
      ],
      complexity: { time: 'O(V + E)', space: 'O(V)' },
      timeChoices: ['O(V^2)', 'O(V log V)', 'O(V + E)', 'O(E log V)'],
      timeAnswer: 2,
      starter: {
        cpp: 'Node* cloneGraph(Node* node) {\n    // your code here\n}',
        python: 'def clone_graph(node):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'Node* cloneGraph(Node* node) {\n    if (!node) return nullptr;\n    unordered_map<Node*, Node*> old2new;\n    function<Node*(Node*)> dfs = [&](Node* cur) -> Node* {\n        auto it = old2new.find(cur);\n        if (it != old2new.end()) return it->second;\n        Node* copy = new Node(cur->val);\n        old2new[cur] = copy;                 // register BEFORE recursing\n        for (Node* nei : cur->neighbors)\n            copy->neighbors.push_back(dfs(nei));\n        return copy;\n    };\n    return dfs(node);\n}',
        python: 'def clone_graph(node):\n    if not node:\n        return None\n    old_to_new = {}\n\n    def dfs(cur):\n        if cur in old_to_new:\n            return old_to_new[cur]\n        copy = Node(cur.val)\n        old_to_new[cur] = copy               # register BEFORE recursing\n        for nei in cur.neighbors:\n            copy.neighbors.append(dfs(nei))\n        return copy\n\n    return dfs(node)'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<', hint: 'Map every original node to its clone.' },
          { re: 'new\\s+Node|Node\\s*\\(', hint: 'Allocate a fresh node for each original.' },
          { re: 'neighbors|neighbours', hint: 'Wire the clone to the clones of its neighbours.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\(', hint: 'Map every original node to its clone.' },
          { re: 'Node\\s*\\(', hint: 'Allocate a fresh node for each original.' },
          { re: 'neighbors|neighbours', hint: 'Wire the clone to the clones of its neighbours.' }
        ]
      },
      mcq: [
        { q: 'What goes wrong if the clone is inserted into the map only after its neighbours are cloned?',
          opts: ['Neighbours end up in the wrong order', 'A cycle causes unbounded recursion because the node never looks visited', 'The values are copied incorrectly', 'Memory usage doubles'],
          correct: 1,
          why: 'The map is the visited set; registering late means a cycle re-enters the same node before it is recorded and the DFS never terminates.' }
      ]
    },

    {
      id: 'nc-max-area-of-island',
      title: 'Max Area of Island',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an m x n binary matrix grid where 1 is land and 0 is water, return the area of the largest island (the number of cells in the largest 4-directionally connected group of 1s). Return 0 if there is no island.',
      examples: [
        { in: 'grid = [[0,0,1,0],[1,1,0,0],[1,1,0,1]]', out: '4' },
        { in: 'grid = [[0,0,0],[0,0,0]]', out: '0' }
      ],
      approach: 'Same connected-components DFS as Number of Islands, but the traversal returns a size instead of nothing. Write the recursion so that an out-of-bounds or water cell contributes 0, and a land cell contributes 1 plus the sum of its four neighbours, sinking itself to 0 first so the component is counted exactly once. Take the maximum over all seeds. An iterative BFS that counts pops of the queue is equivalent; so is union-find with a size array, where the answer is the largest set size.',
      keyInsight: 'Returning the count up the recursion turns a visit-everything flood fill into an aggregate over each component at no extra cost.',
      pitfalls: [
        'Sinking the cell after the recursive calls rather than before, which double-counts cells and can loop forever.',
        'Resetting the running maximum inside the inner loop.',
        'Assuming diagonal adjacency — this problem is 4-directional only.'
      ],
      complexity: { time: 'O(m * n)', space: 'O(m * n) worst case' },
      timeChoices: ['O(m + n)', 'O(m * n)', 'O(m * n * log(m * n))', 'O((m * n)^2)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int maxAreaOfIsland(vector<vector<int>>& grid) {\n    // your code here\n}',
        python: 'def max_area_of_island(grid):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int maxAreaOfIsland(vector<vector<int>>& grid) {\n    if (grid.empty() || grid[0].empty()) return 0;\n    int m = grid.size(), n = grid[0].size(), best = 0;\n    function<int(int,int)> dfs = [&](int r, int c) -> int {\n        if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] == 0) return 0;\n        grid[r][c] = 0;                       // sink before recursing\n        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);\n    };\n    for (int r = 0; r < m; r++)\n        for (int c = 0; c < n; c++)\n            if (grid[r][c] == 1) best = max(best, dfs(r, c));\n    return best;\n}',
        python: 'def max_area_of_island(grid):\n    if not grid or not grid[0]:\n        return 0\n    m, n = len(grid), len(grid[0])\n\n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= m or c >= n or grid[r][c] == 0:\n            return 0\n        grid[r][c] = 0                        # sink before recursing\n        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)\n\n    best = 0\n    for r in range(m):\n        for c in range(n):\n            if grid[r][c] == 1:\n                best = max(best, dfs(r, c))\n    return best'
      },
      checks: {
        cpp: [
          { re: 'max\\(|>\\s*best|if\\s*\\(', hint: 'Keep the largest component size seen so far.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Explore the four orthogonal neighbours.' },
          { re: '=\\s*0|visited|queue|parent|size\\[', hint: 'Mark cells consumed (or union them with a size array) so nothing is counted twice.' }
        ],
        python: [
          { re: 'max\\(|>\\s*\\w+', hint: 'Keep the largest component size seen so far.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Explore the four orthogonal neighbours.' },
          { re: '=\\s*0|visited|deque|append\\(|parent', hint: 'Mark cells consumed (or union them with a size array) so nothing is counted twice.' }
        ]
      },
      mcq: [
        { q: 'Why must the cell be zeroed before the four recursive calls rather than after?',
          opts: ['To keep the grid sorted', 'Because a neighbour immediately recurses back and would re-count the cell', 'Because zero is falsy', 'It makes no difference for correctness'],
          correct: 1,
          why: 'Cell A recurses into B, which recurses back into A; if A is not yet zeroed it is counted again and the recursion can bounce forever.' }
      ]
    },

    {
      id: 'nc-pacific-atlantic',
      title: 'Pacific Atlantic Water Flow',
      section: 'graphs',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given an m x n matrix heights, the Pacific ocean touches the top and left edges and the Atlantic touches the bottom and right edges. Water flows from a cell to a 4-directional neighbour of equal or lower height, and flows off the grid into an adjacent ocean. Return the coordinates of every cell from which water can reach both oceans.',
      examples: [
        { in: 'heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]', out: '[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]] (any order)' },
        { in: 'heights = [[1]]', out: '[[0,0]]' }
      ],
      approach: 'Reverse the edges and run two multi-source DFS traversals (BFS is equally fine). Instead of asking, for each of the m*n cells, whether water flows out to an ocean — which would repeat work O(m*n) times — start at the ocean borders and walk UPHILL: from a cell you may move to a neighbour whose height is greater than or equal to the current one. The set of cells reached from the Pacific border is exactly the set that can drain into the Pacific; likewise for the Atlantic. The answer is the intersection of the two reachable sets. Each traversal marks every cell at most once, so the whole thing is O(m*n).',
      keyInsight: 'Searching backwards from the goal collapses m*n independent searches into two, because reachability in the reversed graph is exactly drainability in the original.',
      pitfalls: [
        'Using strictly greater than when walking uphill — equal heights still allow flow, so the comparison must be >=.',
        'Sharing one visited matrix between the two oceans.',
        'Seeding only the corners rather than the whole top row, bottom row, left column and right column.'
      ],
      complexity: { time: 'O(m * n)', space: 'O(m * n)' },
      timeChoices: ['O(m * n)', 'O((m * n)^2)', 'O(m * n * log(m * n))', 'O(m^2 + n^2)'],
      timeAnswer: 0,
      starter: {
        cpp: 'vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {\n    // your code here\n}',
        python: 'def pacific_atlantic(heights):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {\n    int m = heights.size(), n = heights[0].size();\n    vector<vector<bool>> pac(m, vector<bool>(n, false)), atl(m, vector<bool>(n, false));\n    function<void(int,int,vector<vector<bool>>&,int)> dfs =\n        [&](int r, int c, vector<vector<bool>>& seen, int prev) {\n            if (r < 0 || c < 0 || r >= m || c >= n) return;\n            if (seen[r][c] || heights[r][c] < prev) return;   // must be uphill or level\n            seen[r][c] = true;\n            int h = heights[r][c];\n            dfs(r + 1, c, seen, h); dfs(r - 1, c, seen, h);\n            dfs(r, c + 1, seen, h); dfs(r, c - 1, seen, h);\n        };\n    for (int c = 0; c < n; c++) { dfs(0, c, pac, INT_MIN); dfs(m - 1, c, atl, INT_MIN); }\n    for (int r = 0; r < m; r++) { dfs(r, 0, pac, INT_MIN); dfs(r, n - 1, atl, INT_MIN); }\n    vector<vector<int>> res;\n    for (int r = 0; r < m; r++)\n        for (int c = 0; c < n; c++)\n            if (pac[r][c] && atl[r][c]) res.push_back({r, c});\n    return res;\n}',
        python: 'def pacific_atlantic(heights):\n    m, n = len(heights), len(heights[0])\n    pac, atl = set(), set()\n\n    def dfs(r, c, seen, prev):\n        if r < 0 or c < 0 or r >= m or c >= n:\n            return\n        if (r, c) in seen or heights[r][c] < prev:   # must be uphill or level\n            return\n        seen.add((r, c))\n        h = heights[r][c]\n        dfs(r + 1, c, seen, h)\n        dfs(r - 1, c, seen, h)\n        dfs(r, c + 1, seen, h)\n        dfs(r, c - 1, seen, h)\n\n    for c in range(n):\n        dfs(0, c, pac, heights[0][c])\n        dfs(m - 1, c, atl, heights[m - 1][c])\n    for r in range(m):\n        dfs(r, 0, pac, heights[r][0])\n        dfs(r, n - 1, atl, heights[r][n - 1])\n    return [[r, c] for r, c in (pac & atl)]'
      },
      checks: {
        cpp: [
          { re: '>=|<=|<\\s*prev|>\\s*prev', hint: 'Water also flows between equal heights, so compare with >= (or <=) not strict.' },
          { re: 'vector\\s*<\\s*vector\\s*<\\s*bool|set<|bool\\s+\\w+\\[', hint: 'Keep one reachable set per ocean.' },
          { re: '&&|and\\b|count\\(', hint: 'The answer is the intersection of the two reachable sets.' }
        ],
        python: [
          { re: '>=|<=|<\\s*prev|>\\s*prev', hint: 'Water also flows between equal heights, so compare with >= (or <=) not strict.' },
          { re: 'set\\(|\\{\\s*\\}|visited|seen', hint: 'Keep one reachable set per ocean.' },
          { re: '&|and\\b|intersection', hint: 'The answer is the intersection of the two reachable sets.' }
        ]
      },
      mcq: [
        { q: 'Why does the traversal move to neighbours of GREATER or equal height?',
          opts: ['Because it is searching the reversed flow graph, from the ocean back to the sources', 'Because water flows uphill in this problem', 'Because it avoids revisiting cells', 'Because the grid is sorted by height'],
          correct: 0,
          why: 'Water flows downhill, so in the reversed graph an edge points uphill; reaching a cell from the border means the cell can drain to that border.' }
      ]
    },

    {
      id: 'nc-surrounded-regions',
      title: 'Surrounded Regions',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an m x n board of X and O, capture every region of Os that is completely surrounded by Xs by flipping those Os to X. A region is captured only if none of its cells touches the border. Modify the board in place.',
      examples: [
        { in: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]', out: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]' },
        { in: 'board = [["X"]]', out: '[["X"]]' }
      ],
      approach: 'Invert the condition and run DFS/BFS from the border. Directly testing "is this region enclosed?" needs the whole component before you can decide; instead observe that a region survives if and only if it touches the border. So launch a traversal from every O on the four edges, marking everything reachable with a temporary sentinel such as S. One final sweep then rewrites: S becomes O (it escaped), and any remaining O becomes X (it was enclosed). Two linear passes, no per-region bookkeeping. An iterative stack or queue is safer than recursion on a large board.',
      keyInsight: 'Marking the survivors from the border is easier than proving enclosure, because border-connectivity is a single reachability query.',
      pitfalls: [
        'Flipping Os to X during the traversal instead of using a distinct sentinel, which destroys the information needed for the final sweep.',
        'Seeding only the corners rather than every border cell.',
        'Forgetting to convert the sentinel back to O in the final pass.'
      ],
      complexity: { time: 'O(m * n)', space: 'O(m * n) worst case' },
      timeChoices: ['O(m * n)', 'O(m * n * log(m * n))', 'O((m * n)^2)', 'O(m + n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'void solve(vector<vector<char>>& board) {\n    // your code here\n}',
        python: 'def solve(board):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'void solve(vector<vector<char>>& board) {\n    if (board.empty() || board[0].empty()) return;\n    int m = board.size(), n = board[0].size();\n    function<void(int,int)> mark = [&](int r, int c) {\n        if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] != \'O\') return;\n        board[r][c] = \'S\';                    // survives: reachable from border\n        mark(r + 1, c); mark(r - 1, c);\n        mark(r, c + 1); mark(r, c - 1);\n    };\n    for (int r = 0; r < m; r++) { mark(r, 0); mark(r, n - 1); }\n    for (int c = 0; c < n; c++) { mark(0, c); mark(m - 1, c); }\n    for (int r = 0; r < m; r++)\n        for (int c = 0; c < n; c++)\n            board[r][c] = (board[r][c] == \'S\') ? \'O\' : \'X\';\n}',
        python: 'def solve(board):\n    if not board or not board[0]:\n        return\n    m, n = len(board), len(board[0])\n\n    def mark(r0, c0):\n        stack = [(r0, c0)]\n        while stack:\n            r, c = stack.pop()\n            if r < 0 or c < 0 or r >= m or c >= n or board[r][c] != \'O\':\n                continue\n            board[r][c] = \'S\'                 # survives: reachable from border\n            stack.extend([(r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)])\n\n    for r in range(m):\n        mark(r, 0)\n        mark(r, n - 1)\n    for c in range(n):\n        mark(0, c)\n        mark(m - 1, c)\n    for r in range(m):\n        for c in range(n):\n            board[r][c] = \'O\' if board[r][c] == \'S\' else \'X\''
      },
      checks: {
        cpp: [
          { re: 'n\\s*-\\s*1|m\\s*-\\s*1|size\\(\\)\\s*-\\s*1', hint: 'Seed the traversal from every border row and column.' },
          { re: '\\x27S\\x27|\\x27#\\x27|\\x27T\\x27|visited|seen', hint: 'Use a sentinel (or a visited set) so survivors stay distinguishable until the final sweep.' },
          { re: '\\x27X\\x27', hint: 'Rewrite the enclosed regions to X in a final pass.' }
        ],
        python: [
          { re: 'n\\s*-\\s*1|m\\s*-\\s*1|len\\(\\w+\\)\\s*-\\s*1|\\[-1\\]', hint: 'Seed the traversal from every border row and column.' },
          { re: '\\x27S\\x27|\\x27#\\x27|\\x27T\\x27|visited|seen', hint: 'Use a sentinel (or a visited set) so survivors stay distinguishable until the final sweep.' },
          { re: '\\x27X\\x27', hint: 'Rewrite the enclosed regions to X in a final pass.' }
        ]
      },
      mcq: [
        { q: 'Why is a third sentinel character used instead of flipping border-connected Os straight to X?',
          opts: ['To reduce memory', 'To keep the traversal iterative', 'Because those cells must end up as O, and the sweep needs to tell them apart from enclosed Os', 'Because X is reserved for walls'],
          correct: 2,
          why: 'The traversal marks survivors; without a distinct mark the final pass cannot distinguish an escaping O from an enclosed one.' }
      ]
    },

    {
      id: 'nc-rotting-oranges',
      title: 'Rotting Oranges',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'In an m x n grid, 0 is an empty cell, 1 is a fresh orange and 2 is a rotten orange. Every minute, any fresh orange 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes until no fresh orange remains, or -1 if that is impossible.',
      examples: [
        { in: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', out: '4' },
        { in: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', out: '-1' }
      ],
      approach: 'Multi-source BFS with explicit level processing. Push every initially rotten orange into the queue at once — that models simultaneous spread, and it is exactly why BFS beats DFS here: BFS expands in nondecreasing distance order, so the level index is the elapsed minute. Count the fresh oranges up front. Then, while the queue is non-empty and fresh remains, pop the entire current level (snapshot the queue size first), rot each fresh neighbour, decrement the fresh count, and increment the minute counter once per level. At the end, return the minute count if fresh hit zero, otherwise -1 because some fresh orange was unreachable.',
      keyInsight: 'One BFS level equals one minute, and seeding all sources at once makes the whole simultaneous spread a single traversal instead of one per source.',
      pitfalls: [
        'Incrementing the minute counter per popped cell rather than per level.',
        'Counting one extra minute for the final level — guard the loop with "fresh > 0" or subtract one at the end.',
        'Forgetting that a grid with no fresh oranges answers 0, not -1, even if there are no rotten ones.'
      ],
      complexity: { time: 'O(m * n)', space: 'O(m * n)' },
      timeChoices: ['O(m * n * log(m * n))', 'O(m * n)', 'O((m * n)^2)', 'O(m + n)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int orangesRotting(vector<vector<int>>& grid) {\n    // your code here\n}',
        python: 'def oranges_rotting(grid):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int orangesRotting(vector<vector<int>>& grid) {\n    int m = grid.size(), n = grid[0].size(), fresh = 0;\n    queue<pair<int,int>> q;\n    for (int r = 0; r < m; r++)\n        for (int c = 0; c < n; c++) {\n            if (grid[r][c] == 1) fresh++;\n            else if (grid[r][c] == 2) q.push({r, c});   // all sources at once\n        }\n    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};\n    int minutes = 0;\n    while (!q.empty() && fresh > 0) {\n        int sz = q.size();                              // one whole level = one minute\n        for (int i = 0; i < sz; i++) {\n            auto [r, c] = q.front(); q.pop();\n            for (int d = 0; d < 4; d++) {\n                int nr = r + dr[d], nc = c + dc[d];\n                if (nr < 0 || nc < 0 || nr >= m || nc >= n || grid[nr][nc] != 1) continue;\n                grid[nr][nc] = 2;\n                fresh--;\n                q.push({nr, nc});\n            }\n        }\n        minutes++;\n    }\n    return fresh == 0 ? minutes : -1;\n}',
        python: 'def oranges_rotting(grid):\n    from collections import deque\n    m, n = len(grid), len(grid[0])\n    q = deque()\n    fresh = 0\n    for r in range(m):\n        for c in range(n):\n            if grid[r][c] == 1:\n                fresh += 1\n            elif grid[r][c] == 2:\n                q.append((r, c))              # all sources at once\n    minutes = 0\n    while q and fresh:\n        for _ in range(len(q)):               # one whole level = one minute\n            r, c = q.popleft()\n            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):\n                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:\n                    grid[nr][nc] = 2\n                    fresh -= 1\n                    q.append((nr, nc))\n        minutes += 1\n    return minutes if fresh == 0 else -1'
      },
      checks: {
        cpp: [
          { re: 'queue|deque', hint: 'BFS from all rotten oranges at once.' },
          { re: 'size\\(\\)|sz|level|dist', hint: 'Process a whole level per minute (or store a time with each cell).' },
          { re: '-\\s*1|return\\s+-1', hint: 'Return -1 when a fresh orange is never reached.' }
        ],
        python: [
          { re: 'deque|queue', hint: 'BFS from all rotten oranges at once.' },
          { re: 'len\\(\\s*q|range\\(\\s*len|level|dist|time', hint: 'Process a whole level per minute (or store a time with each cell).' },
          { re: '-\\s*1|return\\s+-1', hint: 'Return -1 when a fresh orange is never reached.' }
        ]
      },
      mcq: [
        { q: 'Why is BFS, not DFS, the natural traversal for this problem?',
          opts: ['DFS cannot start from multiple sources', 'BFS visits cells in nondecreasing distance order, so the level number is the elapsed minute', 'DFS would revisit cells forever', 'BFS uses less memory on a grid'],
          correct: 1,
          why: 'The answer is the maximum shortest-time-to-rot; BFS produces those times directly, while DFS would have to relax and re-relax cells.' }
      ]
    },

    {
      id: 'nc-walls-and-gates',
      title: 'Walls and Gates',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'You are given an m x n grid of rooms where -1 is a wall, 0 is a gate, and 2147483647 (INF) is an empty room. Fill each empty room with the distance to its nearest gate, moving only 4-directionally through empty rooms. If a room cannot reach any gate, leave it as INF. Modify the grid in place.',
      examples: [
        { in: 'rooms = [[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]]', out: '[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]' },
        { in: 'rooms = [[-1]]', out: '[[-1]]' }
      ],
      approach: 'Multi-source BFS seeded with every gate. Running a separate BFS from each empty room would be O((m*n)^2); instead push all gates into one queue and expand outwards. Because BFS reaches a cell along a shortest path first, the first time a room is written its value is already the distance to the NEAREST gate, so the "is it still INF?" test doubles as the visited check and no cell is ever updated twice. Walls are never enqueued because they do not equal INF, and unreachable rooms simply keep their INF value.',
      keyInsight: 'Multi-source BFS computes, in one O(m*n) sweep, the distance to the nearest of many sources — the queue behaves as if a super-source were connected to every gate with a zero-cost edge.',
      pitfalls: [
        'Overwriting cells that already have a smaller distance — only write when the room is still INF.',
        'Enqueuing walls, or comparing against 0 instead of INF.',
        'Doing a per-room BFS, which is correct but quadratically slower.'
      ],
      complexity: { time: 'O(m * n)', space: 'O(m * n)' },
      timeChoices: ['O((m * n)^2)', 'O(m * n * log(m * n))', 'O(m * n)', 'O(m + n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'void wallsAndGates(vector<vector<int>>& rooms) {\n    // your code here\n}',
        python: 'def walls_and_gates(rooms):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'void wallsAndGates(vector<vector<int>>& rooms) {\n    if (rooms.empty() || rooms[0].empty()) return;\n    const int INF = 2147483647;\n    int m = rooms.size(), n = rooms[0].size();\n    queue<pair<int,int>> q;\n    for (int r = 0; r < m; r++)\n        for (int c = 0; c < n; c++)\n            if (rooms[r][c] == 0) q.push({r, c});      // every gate is a source\n    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};\n    while (!q.empty()) {\n        auto [r, c] = q.front(); q.pop();\n        for (int d = 0; d < 4; d++) {\n            int nr = r + dr[d], nc = c + dc[d];\n            if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue;\n            if (rooms[nr][nc] != INF) continue;        // wall, gate, or already set\n            rooms[nr][nc] = rooms[r][c] + 1;\n            q.push({nr, nc});\n        }\n    }\n}',
        python: 'def walls_and_gates(rooms):\n    from collections import deque\n    if not rooms or not rooms[0]:\n        return\n    INF = 2147483647\n    m, n = len(rooms), len(rooms[0])\n    q = deque((r, c) for r in range(m) for c in range(n) if rooms[r][c] == 0)\n    while q:\n        r, c = q.popleft()\n        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):\n            if 0 <= nr < m and 0 <= nc < n and rooms[nr][nc] == INF:\n                rooms[nr][nc] = rooms[r][c] + 1\n                q.append((nr, nc))'
      },
      checks: {
        cpp: [
          { re: 'queue|deque', hint: 'Use a BFS queue seeded with every gate.' },
          { re: '==\\s*0|!=\\s*0', hint: 'Find the gates (value 0) to seed the search.' },
          { re: '\\+\\s*1', hint: 'A neighbour is one step further than the cell you came from.' }
        ],
        python: [
          { re: 'deque|queue', hint: 'Use a BFS queue seeded with every gate.' },
          { re: '==\\s*0|!=\\s*0', hint: 'Find the gates (value 0) to seed the search.' },
          { re: '\\+\\s*1', hint: 'A neighbour is one step further than the cell you came from.' }
        ]
      },
      mcq: [
        { q: 'Why does the "still INF?" test suffice as the visited check?',
          opts: ['Because walls are also INF', 'Because BFS reaches every room along a shortest path first, so the first write is already optimal and final', 'Because the grid is small', 'Because gates are processed last'],
          correct: 1,
          why: 'In an unweighted graph BFS settles each node on first contact, so a room that already holds a number can never be improved.' }
      ]
    },

    {
      id: 'nc-course-schedule',
      title: 'Course Schedule',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'There are numCourses courses labelled 0 to numCourses-1 and a list prerequisites where prerequisites[i] = [a, b] means you must take course b before course a. Return true if you can finish all courses.',
      examples: [
        { in: 'numCourses = 2, prerequisites = [[1,0]]', out: 'true' },
        { in: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', out: 'false' }
      ],
      approach: 'This is cycle detection in a directed graph, solved here with a topological sort (Kahn BFS). Build the adjacency list b -> a and the in-degree of every node. Push all in-degree-0 nodes, then repeatedly pop a node, count it as scheduled, and decrement the in-degree of each successor, pushing any that reach zero. If the count of scheduled nodes equals numCourses the graph is a DAG and the answer is true; otherwise some nodes retain a positive in-degree forever, which is exactly the signature of a directed cycle. The DFS alternative uses three colours: a node currently on the recursion stack (gray) that is reached again proves a back edge and therefore a cycle — note that plain "already visited" is NOT enough in a directed graph, since a cross edge into a finished node is harmless.',
      keyInsight: 'A set of prerequisites is satisfiable exactly when the directed graph is acyclic, and Kahn topological sort reports acyclicity by counting how many nodes it manages to emit.',
      pitfalls: [
        'Reversing the edge direction — [a, b] means an edge b -> a.',
        'Using a single visited set for directed cycle detection instead of separating "on the stack" from "finished".',
        'Assuming the graph is connected; there may be isolated courses with no prerequisites.'
      ],
      complexity: { time: 'O(V + E)', space: 'O(V + E)' },
      timeChoices: ['O(V * E)', 'O(V + E)', 'O(V^2)', 'O(E log V)'],
      timeAnswer: 1,
      starter: {
        cpp: 'bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n    // your code here\n}',
        python: 'def can_finish(num_courses, prerequisites):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n    vector<vector<int>> adj(numCourses);\n    vector<int> indeg(numCourses, 0);\n    for (auto& p : prerequisites) { adj[p[1]].push_back(p[0]); indeg[p[0]]++; }\n    queue<int> q;\n    for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.push(i);\n    int scheduled = 0;\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        scheduled++;\n        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);\n    }\n    return scheduled == numCourses;   // fewer means a cycle blocked the rest\n}',
        python: 'def can_finish(num_courses, prerequisites):\n    from collections import deque\n    adj = [[] for _ in range(num_courses)]\n    indeg = [0] * num_courses\n    for a, b in prerequisites:\n        adj[b].append(a)\n        indeg[a] += 1\n    q = deque(i for i in range(num_courses) if indeg[i] == 0)\n    scheduled = 0\n    while q:\n        u = q.popleft()\n        scheduled += 1\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                q.append(v)\n    return scheduled == num_courses   # fewer means a cycle blocked the rest'
      },
      checks: {
        cpp: [
          { re: 'vector\\s*<\\s*vector|adj|unordered_map', hint: 'Build an adjacency list from the prerequisite pairs.' },
          { re: 'indeg|degree|queue|visit|color|state|stack', hint: 'Either count in-degrees for Kahn BFS or track on-stack state for DFS colouring.' },
          { re: 'return', hint: 'Report whether every course could be scheduled.' }
        ],
        python: [
          { re: 'adj|graph|defaultdict|\\[\\s*\\[\\s*\\]', hint: 'Build an adjacency list from the prerequisite pairs.' },
          { re: 'indeg|degree|deque|visit|color|state|stack', hint: 'Either count in-degrees for Kahn BFS or track on-stack state for DFS colouring.' },
          { re: 'return', hint: 'Report whether every course could be scheduled.' }
        ]
      },
      mcq: [
        { q: 'In a DIRECTED graph, why is "I have seen this node before" not sufficient evidence of a cycle?',
          opts: ['Because the graph may be disconnected', 'Because a node can be reached again by a cross or forward edge without any cycle existing', 'Because in-degrees may be zero', 'Because DFS visits nodes twice by design'],
          correct: 1,
          why: 'A cycle requires a back edge into a node still on the recursion stack; re-reaching a fully finished node is harmless.' }
      ]
    },

    {
      id: 'nc-course-schedule-ii',
      title: 'Course Schedule II',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'There are numCourses courses labelled 0 to numCourses-1 and a list prerequisites where prerequisites[i] = [a, b] means b must be taken before a. Return any valid ordering of all courses, or an empty array if no ordering exists.',
      examples: [
        { in: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', out: '[0,1,2,3] (or [0,2,1,3])' },
        { in: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', out: '[]' }
      ],
      approach: 'Same topological sort as Course Schedule, but now record the order in which nodes are emitted. Kahn BFS: build adjacency b -> a plus in-degrees, seed the queue with every in-degree-0 node, and append each popped node to the output while decrementing its successors. If the output ends up shorter than numCourses, a directed cycle exists and the answer is []. The DFS variant produces a valid order as the REVERSE of the post-order finish times, and still needs the gray/black colouring to detect a cycle.',
      keyInsight: 'A topological order is any linearisation in which every edge points forward; Kahn builds it greedily from the nodes that currently owe nothing.',
      pitfalls: [
        'Emitting the DFS post-order without reversing it.',
        'Returning a partial order when a cycle exists instead of an empty array.',
        'Confusing the direction of [a, b] and producing the exact reverse of a valid schedule.'
      ],
      complexity: { time: 'O(V + E)', space: 'O(V + E)' },
      timeChoices: ['O(V + E)', 'O(V^2)', 'O(E log V)', 'O(V * E)'],
      timeAnswer: 0,
      starter: {
        cpp: 'vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {\n    // your code here\n}',
        python: 'def find_order(num_courses, prerequisites):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {\n    vector<vector<int>> adj(numCourses);\n    vector<int> indeg(numCourses, 0);\n    for (auto& p : prerequisites) { adj[p[1]].push_back(p[0]); indeg[p[0]]++; }\n    queue<int> q;\n    for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.push(i);\n    vector<int> order;\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        order.push_back(u);\n        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);\n    }\n    if ((int)order.size() != numCourses) return {};   // cycle\n    return order;\n}',
        python: 'def find_order(num_courses, prerequisites):\n    from collections import deque\n    adj = [[] for _ in range(num_courses)]\n    indeg = [0] * num_courses\n    for a, b in prerequisites:\n        adj[b].append(a)\n        indeg[a] += 1\n    q = deque(i for i in range(num_courses) if indeg[i] == 0)\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                q.append(v)\n    return order if len(order) == num_courses else []   # cycle -> []'
      },
      checks: {
        cpp: [
          { re: 'indeg|degree|visit|color|state', hint: 'Track in-degrees (Kahn) or DFS colours.' },
          { re: 'push_back|emplace_back', hint: 'Record the order courses are finalised in.' },
          { re: 'size\\(\\)\\s*!=|size\\(\\)\\s*==|reverse\\(', hint: 'Return [] on a cycle; if you used DFS post-order, reverse it.' }
        ],
        python: [
          { re: 'indeg|degree|visit|color|state', hint: 'Track in-degrees (Kahn) or DFS colours.' },
          { re: 'append\\(', hint: 'Record the order courses are finalised in.' },
          { re: 'len\\(|\\[::-1\\]|reverse', hint: 'Return [] on a cycle; if you used DFS post-order, reverse it.' }
        ]
      },
      mcq: [
        { q: 'Using DFS instead of Kahn, why must the finish-order be reversed?',
          opts: ['Because DFS visits nodes in reverse alphabetical order', 'Because a node finishes only after all of its dependents finish, so the finish list is the reverse topological order', 'Because the recursion stack is a LIFO', 'It does not need to be reversed'],
          correct: 1,
          why: 'Post-order places a node after everything reachable from it; reversing puts each node before its successors, which is what a topological order requires.' }
      ]
    },

    {
      id: 'nc-redundant-connection',
      title: 'Redundant Connection',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'A tree on n nodes labelled 1..n had one extra edge added, producing a graph with n nodes and n edges. Given the edge list, return the edge that can be removed so the result is a tree. If several answers exist, return the one that appears last in the input.',
      examples: [
        { in: 'edges = [[1,2],[1,3],[2,3]]', out: '[2,3]' },
        { in: 'edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]', out: '[1,4]' }
      ],
      approach: 'Union-find (disjoint set union) processed in input order. Each edge asks: are these two endpoints already in the same component? Find both roots; if they differ, the edge joins two components, so union them and move on. If they are already equal, this edge closes a cycle in an undirected graph and is therefore redundant — and because edges are processed left to right, the first such edge encountered is the last one that could be removed, which is exactly what the problem asks for. Path compression plus union by rank or size makes each operation effectively O(alpha(n)).',
      keyInsight: 'In an undirected graph, an edge whose endpoints already share a union-find root is precisely an edge that closes a cycle.',
      pitfalls: [
        'Sizing the parent array to n instead of n+1 when labels start at 1.',
        'Unioning before checking whether the roots already match.',
        'Using DFS cycle detection without skipping the parent edge, which reports a cycle on every single undirected edge.'
      ],
      complexity: { time: 'O(n * alpha(n))', space: 'O(n)' },
      timeChoices: ['O(n^2)', 'O(n log n) strictly', 'O(n * alpha(n)), effectively linear', 'O(n!)'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<int> findRedundantConnection(vector<vector<int>>& edges) {\n    // your code here\n}',
        python: 'def find_redundant_connection(edges):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> findRedundantConnection(vector<vector<int>>& edges) {\n    int n = edges.size();\n    vector<int> parent(n + 1);\n    for (int i = 0; i <= n; i++) parent[i] = i;\n    function<int(int)> findRoot = [&](int x) {\n        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }\n        return x;\n    };\n    for (auto& e : edges) {\n        int a = findRoot(e[0]), b = findRoot(e[1]);\n        if (a == b) return e;      // already connected -> this edge closes a cycle\n        parent[a] = b;\n    }\n    return {};\n}',
        python: 'def find_redundant_connection(edges):\n    parent = list(range(len(edges) + 1))\n\n    def find_root(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n\n    for a, b in edges:\n        ra, rb = find_root(a), find_root(b)\n        if ra == rb:               # already connected -> this edge closes a cycle\n            return [a, b]\n        parent[ra] = rb\n    return []'
      },
      checks: {
        cpp: [
          { re: 'parent|root|dsu|union|rank|visited', hint: 'Use union-find (or a DFS that checks connectivity before adding the edge).' },
          { re: 'while\\s*\\(|for\\s*\\(|if\\s*\\(', hint: 'Walk to the representative of each endpoint.' },
          { re: 'return', hint: 'Return the first edge whose endpoints are already connected.' }
        ],
        python: [
          { re: 'parent|root|dsu|union|rank|visited', hint: 'Use union-find (or a DFS that checks connectivity before adding the edge).' },
          { re: 'while\\s|for\\s+\\w+|if\\s', hint: 'Walk to the representative of each endpoint.' },
          { re: 'return', hint: 'Return the first edge whose endpoints are already connected.' }
        ]
      },
      mcq: [
        { q: 'Why does scanning the edges left to right and returning the FIRST cycle-closing edge give the answer the problem wants?',
          opts: ['Because the input is sorted by label', 'Because union-find is order independent', 'Because every earlier edge was needed to build the tree, so the first redundant edge is the last removable one', 'Because the tree is rooted at node 1'],
          correct: 2,
          why: 'Edges before it all merged distinct components; the first edge that merges nothing is the one whose removal restores a tree and it appears last among valid answers.' }
      ]
    },

    {
      id: 'nc-connected-components',
      title: 'Number of Connected Components in an Undirected Graph',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given n nodes labelled 0..n-1 and a list of undirected edges, return the number of connected components in the graph.',
      examples: [
        { in: 'n = 5, edges = [[0,1],[1,2],[3,4]]', out: '2' },
        { in: 'n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]', out: '1' }
      ],
      approach: 'Union-find, counting down. Start with n components, one per node. For each edge, find the roots of both endpoints; if they differ, union them and decrement the component count, and if they match the edge is inside a component and changes nothing. The final count is the answer. The DFS/BFS alternative is equally valid: keep a visited array, loop over all nodes, and every time you find an unvisited node increment the counter and flood the whole component. Both are O(V + E) up to the inverse Ackermann factor.',
      keyInsight: 'Every edge either merges two components (count minus one) or is internal (count unchanged) — so the count never needs recomputing from scratch.',
      pitfalls: [
        'Decrementing the count for every edge instead of only for merging edges.',
        'Forgetting isolated nodes, which are components of size one.',
        'Building the adjacency list but only traversing from node 0 when the graph is disconnected.'
      ],
      complexity: { time: 'O(V + E * alpha(V))', space: 'O(V)' },
      timeChoices: ['O(V^2)', 'O(V + E), effectively linear', 'O(E log E)', 'O(V * E)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int countComponents(int n, vector<vector<int>>& edges) {\n    // your code here\n}',
        python: 'def count_components(n, edges):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int countComponents(int n, vector<vector<int>>& edges) {\n    vector<int> parent(n);\n    for (int i = 0; i < n; i++) parent[i] = i;\n    function<int(int)> findRoot = [&](int x) {\n        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }\n        return x;\n    };\n    int count = n;\n    for (auto& e : edges) {\n        int a = findRoot(e[0]), b = findRoot(e[1]);\n        if (a != b) { parent[a] = b; count--; }   // merging edge only\n    }\n    return count;\n}',
        python: 'def count_components(n, edges):\n    parent = list(range(n))\n\n    def find_root(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n\n    count = n\n    for a, b in edges:\n        ra, rb = find_root(a), find_root(b)\n        if ra != rb:                              # merging edge only\n            parent[ra] = rb\n            count -= 1\n    return count'
      },
      checks: {
        cpp: [
          { re: 'parent|root|union|dsu|visited|adj', hint: 'Use union-find, or a visited array with DFS/BFS from every unvisited node.' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Process every edge (or every node).' },
          { re: '--|-\\s*=\\s*1|\\+\\+|\\+\\s*=\\s*1', hint: 'Count down from n on each merge, or count up one per unvisited seed.' }
        ],
        python: [
          { re: 'parent|root|union|dsu|visited|adj|graph', hint: 'Use union-find, or a visited set with DFS/BFS from every unvisited node.' },
          { re: 'for\\s+\\w+|while\\s', hint: 'Process every edge (or every node).' },
          { re: '-=\\s*1|\\+=\\s*1', hint: 'Count down from n on each merge, or count up one per unvisited seed.' }
        ]
      },
      mcq: [
        { q: 'Starting the counter at n and decrementing on each successful union is correct because...',
          opts: ['every node begins as its own component and only a merging edge reduces the total', 'edges are given in sorted order', 'the graph is guaranteed connected', 'union-find always produces one component'],
          correct: 0,
          why: 'The count is an invariant: n singletons initially, minus one for each edge that actually joins two distinct sets.' }
      ]
    },

    {
      id: 'nc-graph-valid-tree',
      title: 'Graph Valid Tree',
      section: 'graphs',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given n nodes labelled 0..n-1 and a list of undirected edges, return true if the edges form a valid tree: the graph must be fully connected and contain no cycle.',
      examples: [
        { in: 'n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]', out: 'true' },
        { in: 'n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]', out: 'false' }
      ],
      approach: 'A graph on n nodes is a tree exactly when it has n-1 edges AND no cycle (the edge count then forces connectivity). So check the edge count first — an O(1) rejection — and then run union-find over the edges: if any edge finds both endpoints already sharing a root, that edge closes a cycle and the answer is false. Survive both tests and the graph is a tree. The DFS alternative walks from node 0 with a visited set, skipping the edge back to the immediate parent (this parent skip is what distinguishes undirected cycle detection from directed), and finally verifies that all n nodes were visited.',
      keyInsight: 'Edges = n-1 plus acyclic implies connected; edges = n-1 plus connected implies acyclic. You only ever have to verify two of the three properties.',
      pitfalls: [
        'Checking only for a cycle and forgetting connectivity (or vice versa) — a forest of two trees has no cycle but is not a tree.',
        'In the DFS version, failing to skip the parent edge and reporting a false cycle on every edge.',
        'Skipping by parent value when the graph could contain parallel edges; skip by edge identity if that is possible.'
      ],
      complexity: { time: 'O(n * alpha(n))', space: 'O(n)' },
      timeChoices: ['O(n^2)', 'O(n log n)', 'O(n), effectively linear', 'O(n * E)'],
      timeAnswer: 2,
      starter: {
        cpp: 'bool validTree(int n, vector<vector<int>>& edges) {\n    // your code here\n}',
        python: 'def valid_tree(n, edges):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool validTree(int n, vector<vector<int>>& edges) {\n    if ((int)edges.size() != n - 1) return false;   // wrong edge count -> not a tree\n    vector<int> parent(n);\n    for (int i = 0; i < n; i++) parent[i] = i;\n    function<int(int)> findRoot = [&](int x) {\n        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }\n        return x;\n    };\n    for (auto& e : edges) {\n        int a = findRoot(e[0]), b = findRoot(e[1]);\n        if (a == b) return false;                    // cycle\n        parent[a] = b;\n    }\n    return true;\n}',
        python: 'def valid_tree(n, edges):\n    if len(edges) != n - 1:            # wrong edge count -> not a tree\n        return False\n    parent = list(range(n))\n\n    def find_root(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n\n    for a, b in edges:\n        ra, rb = find_root(a), find_root(b)\n        if ra == rb:                   # cycle\n            return False\n        parent[ra] = rb\n    return True'
      },
      checks: {
        cpp: [
          { re: 'n\\s*-\\s*1|size\\(\\)\\s*!=|size\\(\\)\\s*==', hint: 'A tree on n nodes has exactly n-1 edges — check that.' },
          { re: 'parent|root|union|dsu|visited', hint: 'Detect a cycle with union-find, or DFS with a parent skip.' },
          { re: 'return\\s+false|return\\s+true', hint: 'Report the verdict.' }
        ],
        python: [
          { re: 'n\\s*-\\s*1|len\\(\\s*edges', hint: 'A tree on n nodes has exactly n-1 edges — check that.' },
          { re: 'parent|root|union|dsu|visited', hint: 'Detect a cycle with union-find, or DFS with a parent skip.' },
          { re: 'return\\s+False|return\\s+True', hint: 'Report the verdict.' }
        ]
      },
      mcq: [
        { q: 'If a graph on n nodes has exactly n-1 edges and no cycle, what follows?',
          opts: ['Nothing without checking connectivity separately', 'It must be connected, hence a tree', 'It must have a vertex of degree n-1', 'It must be bipartite but possibly disconnected'],
          correct: 1,
          why: 'A forest with k components on n nodes has exactly n-k edges; n-1 edges forces k=1, so the acyclic graph is connected.' }
      ]
    },

    /* ---------------- ADVANCED GRAPHS (6) ---------------- */

    {
      id: 'nc-network-delay-time',
      title: 'Network Delay Time',
      section: 'advanced-graphs',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'You are given a directed weighted graph of n nodes labelled 1..n as a list times where times[i] = [u, v, w] means a signal takes w time to travel from u to v. A signal is sent from node k. Return the time it takes for all n nodes to receive it, or -1 if some node never does.',
      examples: [
        { in: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', out: '2' },
        { in: 'times = [[1,2,1]], n = 2, k = 2', out: '-1' }
      ],
      approach: 'Single-source shortest paths with non-negative weights, so Dijkstra with a binary min-heap is the right tool at O(E log V). Keep dist[] initialised to infinity with dist[k] = 0 and a heap of (distance, node). Pop the smallest tentative distance; if it is stale (greater than the recorded dist) discard it, otherwise relax every outgoing edge and push improved neighbours. The answer is the maximum finalised distance over all n nodes, because the signal has reached everyone only once the slowest node is done; if any distance is still infinity, that node is unreachable and the answer is -1.',
      keyInsight: 'Dijkstra finalises nodes in nondecreasing distance order, so "time for everyone to receive it" is simply the last node finalised — the maximum of dist[].',
      pitfalls: [
        'Returning the sum of the distances instead of the maximum.',
        'Forgetting the lazy-deletion guard (skip a popped entry whose distance is worse than dist[node]), which makes the heap grow and can re-relax settled nodes.',
        'Off-by-one on 1-based labels when sizing the adjacency and distance arrays.'
      ],
      complexity: { time: 'O(E log V)', space: 'O(V + E)' },
      timeChoices: ['O(V * E)', 'O(V^3)', 'O(E log V)', 'O(V + E)'],
      timeAnswer: 2,
      starter: {
        cpp: 'int networkDelayTime(vector<vector<int>>& times, int n, int k) {\n    // your code here\n}',
        python: 'def network_delay_time(times, n, k):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int networkDelayTime(vector<vector<int>>& times, int n, int k) {\n    vector<vector<pair<int,int>>> adj(n + 1);\n    for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});\n    vector<int> dist(n + 1, INT_MAX);\n    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;\n    dist[k] = 0;\n    pq.push({0, k});\n    while (!pq.empty()) {\n        auto [d, u] = pq.top(); pq.pop();\n        if (d > dist[u]) continue;                 // stale heap entry\n        for (auto& [v, w] : adj[u])\n            if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }\n    }\n    int ans = 0;\n    for (int i = 1; i <= n; i++) {\n        if (dist[i] == INT_MAX) return -1;         // unreachable node\n        ans = max(ans, dist[i]);\n    }\n    return ans;\n}',
        python: 'def network_delay_time(times, n, k):\n    import heapq\n    adj = [[] for _ in range(n + 1)]\n    for u, v, w in times:\n        adj[u].append((v, w))\n    INF = float(\'inf\')\n    dist = [INF] * (n + 1)\n    dist[k] = 0\n    pq = [(0, k)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]:\n            continue                               # stale heap entry\n        for v, w in adj[u]:\n            if d + w < dist[v]:\n                dist[v] = d + w\n                heapq.heappush(pq, (dist[v], v))\n    ans = max(dist[1:])\n    return -1 if ans == INF else ans'
      },
      checks: {
        cpp: [
          { re: 'priority_queue|set<|multiset|deque|queue', hint: 'Dijkstra needs a min-priority queue (Bellman-Ford or SPFA also work here).' },
          { re: 'INT_MAX|1e9|INF|0x3f', hint: 'Initialise distances to infinity.' },
          { re: 'max\\(|>\\s*ans|return\\s+-1', hint: 'The answer is the largest finalised distance, or -1 if any node is unreachable.' }
        ],
        python: [
          { re: 'heapq|heappush|heappop|PriorityQueue|deque', hint: 'Dijkstra needs a min-priority queue (Bellman-Ford also works here).' },
          { re: 'inf|float\\(|1e9', hint: 'Initialise distances to infinity.' },
          { re: 'max\\(|return\\s+-1|-1\\s+if', hint: 'The answer is the largest finalised distance, or -1 if any node is unreachable.' }
        ]
      },
      mcq: [
        { q: 'After Dijkstra finishes from source k, what is the network delay time?',
          opts: ['The sum of all dist[i]', 'The maximum dist[i] over all nodes, or -1 if any is still infinity', 'dist[n]', 'The number of edges relaxed'],
          correct: 1,
          why: 'Every node receives the signal at its shortest-path time, so the whole network is covered when the slowest of those times elapses.' }
      ]
    },

    {
      id: 'nc-reconstruct-itinerary',
      title: 'Reconstruct Itinerary',
      section: 'advanced-graphs',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'You are given a list of airline tickets where tickets[i] = [from, to]. Reconstruct the itinerary in order, starting from JFK, using every ticket exactly once. If several valid itineraries exist, return the one that is smallest in lexical order when read as a single list of airports. The input always allows at least one valid itinerary.',
      examples: [
        { in: 'tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]', out: '["JFK","MUC","LHR","SFO","SJC"]' },
        { in: 'tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]', out: '["JFK","ATL","JFK","SFO","ATL","SFO"]' }
      ],
      approach: 'This is an Eulerian path (use every EDGE once, not every node), so the tool is Hierholzer algorithm, not ordinary DFS. Bucket the destinations per origin in a structure that always yields the smallest unused destination first — a min-heap, or a list sorted descending that you pop from the back. Then walk greedily: from the current airport keep taking the smallest unused ticket until the airport has none left, and only then append that airport to the route. Reverse the route at the end. The post-order append is the whole trick: a greedy walk can strand itself at a dead-end airport before all tickets are used, and appending on exit splices that stranded suffix into exactly the right place.',
      keyInsight: 'Hierholzer appends a node only when its edges are exhausted, so dead ends are pushed to the end of the reversed route instead of breaking the walk.',
      pitfalls: [
        'Appending the airport on entry rather than on exit, which fails whenever the greedy walk hits a dead end early.',
        'Forgetting to reverse the route at the end.',
        'Removing a destination from the container without also treating that ticket as consumed, causing an infinite loop on cycles.'
      ],
      complexity: { time: 'O(E log E)', space: 'O(E)' },
      timeChoices: ['O(E log E)', 'O(V^2)', 'O(E!)', 'O(V + E) with no sorting needed'],
      timeAnswer: 0,
      starter: {
        cpp: 'vector<string> findItinerary(vector<vector<string>>& tickets) {\n    // your code here\n}',
        python: 'def find_itinerary(tickets):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<string> findItinerary(vector<vector<string>>& tickets) {\n    unordered_map<string, priority_queue<string, vector<string>, greater<string>>> adj;\n    for (auto& t : tickets) adj[t[0]].push(t[1]);\n    vector<string> route;\n    function<void(string)> visit = [&](string u) {\n        while (!adj[u].empty()) {\n            string v = adj[u].top();\n            adj[u].pop();                       // consume the ticket\n            visit(v);\n        }\n        route.push_back(u);                     // append only when stuck\n    };\n    visit("JFK");\n    reverse(route.begin(), route.end());\n    return route;\n}',
        python: 'def find_itinerary(tickets):\n    from collections import defaultdict\n    adj = defaultdict(list)\n    for src, dst in sorted(tickets, reverse=True):\n        adj[src].append(dst)                    # smallest destination ends up last\n    route, stack = [], [\'JFK\']\n    while stack:\n        while adj[stack[-1]]:\n            stack.append(adj[stack[-1]].pop())  # consume the smallest unused ticket\n        route.append(stack.pop())               # append only when stuck\n    return route[::-1]'
      },
      checks: {
        cpp: [
          { re: 'sort\\(|priority_queue|multiset|set<|greater<', hint: 'Keep destinations in lexical order so the smallest unused one is taken first.' },
          { re: 'reverse\\(|rbegin', hint: 'Build the route in post-order and reverse it.' },
          { re: 'JFK', hint: 'The itinerary starts at JFK.' }
        ],
        python: [
          { re: 'sort|sorted\\(|heapq|heappush', hint: 'Keep destinations in lexical order so the smallest unused one is taken first.' },
          { re: '\\[::-1\\]|reverse|reversed\\(', hint: 'Build the route in post-order and reverse it.' },
          { re: 'JFK', hint: 'The itinerary starts at JFK.' }
        ]
      },
      mcq: [
        { q: 'Why can a purely greedy "always fly to the smallest airport" walk fail without Hierholzer post-order?',
          opts: ['It cannot handle repeated airports', 'It can strand itself at an airport with no unused tickets while tickets elsewhere remain', 'It is too slow', 'It ignores the JFK start requirement'],
          correct: 1,
          why: 'Greedy may enter a dead end early; post-order appending places that stranded suffix at the end of the reversed route so the rest of the walk still fits.' }
      ]
    },

    {
      id: 'nc-min-cost-connect-points',
      title: 'Min Cost to Connect All Points',
      section: 'advanced-graphs',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'You are given an array points where points[i] = [xi, yi] on a 2D plane. The cost of connecting two points is their Manhattan distance |xi - xj| + |yi - yj|. Return the minimum total cost to connect all points so that there is exactly one simple path between any two points.',
      examples: [
        { in: 'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]', out: '20' },
        { in: 'points = [[3,12],[-2,5],[-4,1]]', out: '18' }
      ],
      approach: 'Minimum spanning tree on a complete graph — Prim is the natural fit because the graph is dense (n^2/2 implicit edges) and the edges never need to be materialised. Keep dist[v] = cheapest known edge from the growing tree to v, start with dist[0] = 0, and repeat n times: pick the unvisited vertex with the smallest dist, add its dist to the total, mark it visited, and relax every other unvisited vertex against the direct distance to the newly added vertex. The dense O(n^2) scan is optimal here since building the edge list for Kruskal already costs O(n^2 log n). A heap-based Prim is also fine and is what the Python version shows.',
      keyInsight: 'On a dense or implicit complete graph, Prim with an O(n^2) scan beats Kruskal because you never have to enumerate and sort n^2 edges.',
      pitfalls: [
        'Adding the chosen vertex cost before marking it visited, or marking it before adding, in a way that double-counts the start vertex — dist[0] must be 0.',
        'Relaxing against the source vertex only, instead of the most recently added vertex.',
        'Using Euclidean distance; the problem specifies Manhattan.'
      ],
      complexity: { time: 'O(n^2)', space: 'O(n)' },
      timeChoices: ['O(n log n)', 'O(n^2)', 'O(n^3)', 'O(n^2 log n) and no better'],
      timeAnswer: 1,
      starter: {
        cpp: 'int minCostConnectPoints(vector<vector<int>>& points) {\n    // your code here\n}',
        python: 'def min_cost_connect_points(points):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int minCostConnectPoints(vector<vector<int>>& points) {\n    int n = points.size();\n    if (n <= 1) return 0;\n    vector<int> dist(n, INT_MAX);\n    vector<bool> inMst(n, false);\n    dist[0] = 0;\n    int total = 0;\n    for (int it = 0; it < n; it++) {\n        int u = -1;\n        for (int i = 0; i < n; i++)\n            if (!inMst[i] && (u == -1 || dist[i] < dist[u])) u = i;\n        inMst[u] = true;\n        total += dist[u];\n        for (int v = 0; v < n; v++) {\n            if (inMst[v]) continue;\n            int w = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);\n            if (w < dist[v]) dist[v] = w;\n        }\n    }\n    return total;\n}',
        python: 'def min_cost_connect_points(points):\n    import heapq\n    n = len(points)\n    if n <= 1:\n        return 0\n    visited = [False] * n\n    heap = [(0, 0)]\n    total = 0\n    added = 0\n    while added < n:\n        w, u = heapq.heappop(heap)\n        if visited[u]:\n            continue\n        visited[u] = True\n        total += w\n        added += 1\n        for v in range(n):\n            if not visited[v]:\n                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])\n                heapq.heappush(heap, (d, v))\n    return total'
      },
      checks: {
        cpp: [
          { re: 'abs\\(', hint: 'Manhattan distance is |dx| + |dy|.' },
          { re: 'inMst|visited|priority_queue|parent|used', hint: 'Grow a spanning tree (Prim) or union edges in sorted order (Kruskal).' },
          { re: '\\+=|total|sum', hint: 'Accumulate the weights of the chosen tree edges.' }
        ],
        python: [
          { re: 'abs\\(', hint: 'Manhattan distance is |dx| + |dy|.' },
          { re: 'visited|heapq|heappush|parent|used|in_mst', hint: 'Grow a spanning tree (Prim) or union edges in sorted order (Kruskal).' },
          { re: '\\+=|total|sum', hint: 'Accumulate the weights of the chosen tree edges.' }
        ]
      },
      mcq: [
        { q: 'Why is Prim usually preferred over Kruskal for this particular problem?',
          opts: ['Kruskal cannot handle Manhattan distance', 'The graph is complete, so Kruskal would have to build and sort about n^2/2 edges while Prim can scan them implicitly', 'Prim is always asymptotically faster', 'Kruskal needs the graph to be connected'],
          correct: 1,
          why: 'The edge set is implicit and dense; Prim relaxes distances on the fly in O(n^2) whereas Kruskal pays O(n^2 log n) just to sort.' }
      ]
    },

    {
      id: 'nc-swim-in-rising-water',
      title: 'Swim in Rising Water',
      section: 'advanced-graphs',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'Given an n x n grid where grid[r][c] is the elevation at that cell, water rises so that at time t every cell with elevation at most t is submerged. You start at (0,0) and may swim 4-directionally between adjacent submerged cells instantly. Return the least time t at which you can reach (n-1, n-1).',
      examples: [
        { in: 'grid = [[0,2],[1,3]]', out: '3' },
        { in: 'grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]', out: '16' }
      ],
      approach: 'A minimax (bottleneck) shortest path, solved with a Dijkstra-shaped search. The cost of a path is not the sum of its cells but the MAXIMUM elevation on it, and the answer is the minimum such maximum. Dijkstra still applies because the max operation, like addition, is monotone: extending a path can never lower its bottleneck. So run a min-heap keyed by the bottleneck so far, starting at (grid[0][0], 0, 0); when you pop the target the key is the answer. Relax a neighbour with key = max(current key, neighbour elevation). Alternatives that also work: binary search on t combined with a BFS reachability test, or union-find that adds cells in increasing elevation until start and end share a root.',
      keyInsight: 'Dijkstra generalises from sum-of-weights to any monotone non-decreasing path cost, so swapping + for max turns it into a bottleneck shortest path.',
      pitfalls: [
        'Adding elevations instead of taking the maximum.',
        'Marking cells visited on pop rather than on push is fine, but marking neither lets the heap blow up with duplicates.',
        'Forgetting that the start cell elevation itself counts toward the answer.'
      ],
      complexity: { time: 'O(n^2 log n)', space: 'O(n^2)' },
      timeChoices: ['O(n^2)', 'O(n^4)', 'O(n^2 log n)', 'O(n log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'int swimInWater(vector<vector<int>>& grid) {\n    // your code here\n}',
        python: 'def swim_in_water(grid):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int swimInWater(vector<vector<int>>& grid) {\n    int n = grid.size();\n    vector<vector<bool>> seen(n, vector<bool>(n, false));\n    priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>,\n                   greater<tuple<int,int,int>>> pq;\n    pq.push({grid[0][0], 0, 0});\n    seen[0][0] = true;\n    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};\n    while (!pq.empty()) {\n        auto [t, r, c] = pq.top(); pq.pop();\n        if (r == n - 1 && c == n - 1) return t;\n        for (int d = 0; d < 4; d++) {\n            int nr = r + dr[d], nc = c + dc[d];\n            if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc]) continue;\n            seen[nr][nc] = true;\n            pq.push({max(t, grid[nr][nc]), nr, nc});   // bottleneck, not sum\n        }\n    }\n    return -1;\n}',
        python: 'def swim_in_water(grid):\n    import heapq\n    n = len(grid)\n    seen = [[False] * n for _ in range(n)]\n    pq = [(grid[0][0], 0, 0)]\n    seen[0][0] = True\n    while pq:\n        t, r, c = heapq.heappop(pq)\n        if r == n - 1 and c == n - 1:\n            return t\n        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):\n            if 0 <= nr < n and 0 <= nc < n and not seen[nr][nc]:\n                seen[nr][nc] = True\n                heapq.heappush(pq, (max(t, grid[nr][nc]), nr, nc))   # bottleneck\n    return -1'
      },
      checks: {
        cpp: [
          { re: 'priority_queue|set<|sort\\(|parent', hint: 'Use a min-heap keyed by the bottleneck (or binary search + BFS, or union-find by elevation).' },
          { re: 'max\\(|>\\s*t|<\\s*t|mid', hint: 'The path cost is the maximum elevation on it, not the sum.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Move to the four orthogonal neighbours.' }
        ],
        python: [
          { re: 'heapq|heappush|heappop|sort|parent|bisect', hint: 'Use a min-heap keyed by the bottleneck (or binary search + BFS, or union-find by elevation).' },
          { re: 'max\\(|>\\s*t|<\\s*t|mid', hint: 'The path cost is the maximum elevation on it, not the sum.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Move to the four orthogonal neighbours.' }
        ]
      },
      mcq: [
        { q: 'Why is Dijkstra still valid when the path cost is a maximum instead of a sum?',
          opts: ['Because all elevations are distinct', 'Because the grid is square', 'Because max is monotone: extending a path never decreases its cost, which is all the greedy argument needs', 'Because the heap sorts the cells anyway'],
          correct: 2,
          why: 'Dijkstra requires only that extending a path cannot make it cheaper; both + on non-negative weights and max satisfy that.' }
      ]
    },

    {
      id: 'nc-alien-dictionary',
      title: 'Alien Dictionary',
      section: 'advanced-graphs',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'A list of words is written in an alien language whose letters are a permutation of the lowercase English alphabet, and the list is sorted according to that unknown order. Derive a letter order consistent with the list and return it as a string. If no valid order exists return the empty string; if several exist, return any of them.',
      examples: [
        { in: 'words = ["wrt","wrf","er","ett","rftt"]', out: '"wertf"' },
        { in: 'words = ["z","x","z"]', out: '"" (contradictory)' }
      ],
      approach: 'Topological sort over a graph whose nodes are the letters that actually appear. Compare only ADJACENT word pairs: because the order relation is transitive, the constraints between adjacent words already imply every non-adjacent one. For a pair (a, b), walk to the first position where they differ and add the edge a[i] -> b[i], counting the in-degree of b[i] once per distinct edge (use a set so a repeated pair does not inflate the in-degree). If they never differ but a is longer than b, the list is invalid — a prefix must sort before the longer word — so return "". Then run Kahn BFS; if fewer letters are emitted than exist, a cycle contradicts the ordering and the answer is "".',
      keyInsight: 'Only the FIRST differing character of an adjacent pair carries information; every later character is unconstrained by that pair.',
      pitfalls: [
        'Continuing past the first differing character and inventing constraints that do not exist.',
        'Missing the prefix case ["abc","ab"], which is invalid and must return "".',
        'Double counting a repeated edge in the in-degree, which leaves a node permanently blocked.',
        'Forgetting letters that appear in the words but in no constraint — they still belong in the output.'
      ],
      complexity: { time: 'O(C) where C is the total length of all words', space: 'O(1) — at most 26 nodes' },
      timeChoices: ['O(C) in the total input length', 'O(C log C)', 'O(C^2)', 'O(26!)'],
      timeAnswer: 0,
      starter: {
        cpp: 'string alienOrder(vector<string>& words) {\n    // your code here\n}',
        python: 'def alien_order(words):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'string alienOrder(vector<string>& words) {\n    unordered_map<char, unordered_set<char>> adj;\n    unordered_map<char, int> indeg;\n    for (const string& w : words)\n        for (char ch : w) { adj[ch]; indeg[ch] += 0; }\n    for (int i = 0; i + 1 < (int)words.size(); i++) {\n        const string& a = words[i];\n        const string& b = words[i + 1];\n        int len = min(a.size(), b.size());\n        if (a.size() > b.size() && a.compare(0, len, b, 0, len) == 0) return "";\n        for (int j = 0; j < len; j++) {\n            if (a[j] != b[j]) {\n                if (!adj[a[j]].count(b[j])) { adj[a[j]].insert(b[j]); indeg[b[j]]++; }\n                break;                       // only the first difference informs us\n            }\n        }\n    }\n    queue<char> q;\n    for (auto& kv : indeg) if (kv.second == 0) q.push(kv.first);\n    string order;\n    while (!q.empty()) {\n        char u = q.front(); q.pop();\n        order += u;\n        for (char v : adj[u]) if (--indeg[v] == 0) q.push(v);\n    }\n    return order.size() == indeg.size() ? order : "";\n}',
        python: 'def alien_order(words):\n    from collections import deque\n    adj = {c: set() for w in words for c in w}\n    indeg = {c: 0 for c in adj}\n    for a, b in zip(words, words[1:]):\n        n = min(len(a), len(b))\n        if len(a) > len(b) and a[:n] == b[:n]:\n            return \'\'\n        for i in range(n):\n            if a[i] != b[i]:\n                if b[i] not in adj[a[i]]:\n                    adj[a[i]].add(b[i])\n                    indeg[b[i]] += 1\n                break                        # only the first difference informs us\n    q = deque(c for c in indeg if indeg[c] == 0)\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                q.append(v)\n    return \'\'.join(order) if len(order) == len(indeg) else \'\''
      },
      checks: {
        cpp: [
          { re: 'break', hint: 'Stop at the first differing character of an adjacent word pair.' },
          { re: 'indeg|degree|visit|color|state', hint: 'Topologically sort the letter graph (Kahn in-degrees or DFS colouring).' },
          { re: 'size\\(\\)\\s*>|length\\(\\)\\s*>|return\\s*""', hint: 'Return "" for the invalid prefix case and for a cycle.' }
        ],
        python: [
          { re: 'break', hint: 'Stop at the first differing character of an adjacent word pair.' },
          { re: 'indeg|degree|visit|color|state', hint: 'Topologically sort the letter graph (Kahn in-degrees or DFS colouring).' },
          { re: 'len\\(\\s*a\\s*\\)|len\\(\\s*\\w+\\s*\\)\\s*>|return\\s+\\x27\\x27|return\\s+""', hint: 'Return "" for the invalid prefix case and for a cycle.' }
        ]
      },
      mcq: [
        { q: 'Why is comparing only adjacent word pairs enough to recover the full ordering?',
          opts: ['Because the words are all distinct', 'Because the alphabet has only 26 letters', 'Because the order relation is transitive, so adjacent constraints imply all the non-adjacent ones', 'Because the list is sorted by length'],
          correct: 2,
          why: 'If word i precedes j precedes k, the constraint between i and k adds nothing beyond the chain of adjacent constraints already recorded.' }
      ]
    },

    {
      id: 'nc-cheapest-flights-k-stops',
      title: 'Cheapest Flights Within K Stops',
      section: 'advanced-graphs',
      tier: 'master',
      difficulty: 'Medium',
      prompt: 'There are n cities connected by flights where flights[i] = [from, to, price]. Return the cheapest price from src to dst using at most k stops (that is, at most k+1 flights), or -1 if no such route exists.',
      examples: [
        { in: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1', out: '700' },
        { in: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0', out: '500' }
      ],
      approach: 'Bellman-Ford limited to k+1 rounds. At most k stops means at most k+1 edges, and Bellman-Ford round i computes the cheapest cost reachable using at most i edges — exactly the quantity the constraint bounds. Keep dist[] with dist[src] = 0, and in each round build a FRESH copy of the array so all relaxations in that round read the previous round values; writing in place would let a path of more than i edges leak into round i. After k+1 rounds, dist[dst] is the answer, or -1 if still infinite. Plain Dijkstra is unsafe here because the true state is (city, stops used): the cheapest way to reach a city may burn too many stops to be extendable, so a more expensive shorter-hop arrival must not be discarded.',
      keyInsight: 'Adding a resource constraint changes the state from "city" to "(city, hops used)", which is why the plain shortest-path greedy no longer applies but the round-limited Bellman-Ford does.',
      pitfalls: [
        'Relaxing in place instead of into a copy, which lets one round use more than one new edge.',
        'Running k rounds instead of k+1 — k stops permit k+1 flights.',
        'Using Dijkstra keyed only on cost with a plain visited set, which prunes an arrival that has fewer stops left to spend.'
      ],
      complexity: { time: 'O(k * E)', space: 'O(n)' },
      timeChoices: ['O(E log V)', 'O(k * E)', 'O(V^3)', 'O(V + E)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {\n    // your code here\n}',
        python: 'def find_cheapest_price(n, flights, src, dst, k):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {\n    const int INF = 1000000000;\n    vector<int> dist(n, INF);\n    dist[src] = 0;\n    for (int round = 0; round <= k; round++) {   // k stops -> k+1 edges\n        vector<int> next = dist;                 // fresh copy per round\n        for (auto& f : flights) {\n            if (dist[f[0]] == INF) continue;\n            next[f[1]] = min(next[f[1]], dist[f[0]] + f[2]);\n        }\n        dist = next;\n    }\n    return dist[dst] == INF ? -1 : dist[dst];\n}',
        python: 'def find_cheapest_price(n, flights, src, dst, k):\n    INF = float(\'inf\')\n    dist = [INF] * n\n    dist[src] = 0\n    for _ in range(k + 1):                       # k stops -> k+1 edges\n        nxt = dist[:]                            # fresh copy per round\n        for u, v, w in flights:\n            if dist[u] + w < nxt[v]:\n                nxt[v] = dist[u] + w\n        dist = nxt\n    return -1 if dist[dst] == INF else dist[dst]'
      },
      checks: {
        cpp: [
          { re: 'k\\s*\\+\\s*1|<=\\s*k|stops|steps|level', hint: 'Bound the search by k+1 edges (rounds, BFS levels, or a stops dimension in the state).' },
          { re: 'INF|INT_MAX|1e9|1000000000', hint: 'Initialise unreachable costs to infinity.' },
          { re: 'min\\(|<\\s*next|priority_queue|queue', hint: 'Relax edges into a fresh copy per round, or expand states by hop count.' }
        ],
        python: [
          { re: 'k\\s*\\+\\s*1|<=\\s*k|stops|steps|level', hint: 'Bound the search by k+1 edges (rounds, BFS levels, or a stops dimension in the state).' },
          { re: 'inf|float\\(|1e9', hint: 'Initialise unreachable costs to infinity.' },
          { re: '\\[:\\]|copy\\(|deque|heapq|min\\(', hint: 'Relax edges into a fresh copy per round, or expand states by hop count.' }
        ]
      },
      mcq: [
        { q: 'Why must each Bellman-Ford round read from a snapshot of the previous round instead of relaxing in place?',
          opts: ['To avoid integer overflow', 'Because in-place updates let a single round chain several new edges, breaking the at-most-i-edges guarantee', 'Because the edge list is unsorted', 'Because prices can be negative'],
          correct: 1,
          why: 'The whole method relies on round i meaning "at most i edges"; in-place relaxation can use an edge relaxed earlier in the same round and exceed the stop limit.' }
      ]
    }
  ];

  const Q = [ /* multiple-choice questions */

    /* ---- backtracking: pruning and the decision tree ---- */
    { id: 'q-bt-001', section: 'backtracking', tier: 'beginner',
      q: 'In the standard backtracking template, what is the purpose of undoing the last choice (pop_back / pop) after the recursive call returns?',
      opts: ['It frees memory that the recursion allocated', 'It prevents infinite recursion', 'It restores the shared partial-solution state so the next sibling branch starts clean', 'It is only needed when the input contains duplicates'],
      correct: 2,
      why: 'All branches write into one buffer. Without the undo, choices from a finished branch leak into its siblings and corrupt every later result.',
      topic: 'backtracking template' },

    { id: 'q-bt-002', section: 'backtracking', tier: 'advanced',
      q: 'A backtracking loop over sorted candidates contains "if (candidates[i] == candidates[i-1] && i > start) continue;". What does the i > start part buy you?',
      opts: ['It blocks two identical branches from the SAME node while still allowing a repeated value deeper in the path', 'It stops the recursion from exceeding the array length', 'It guarantees the output combinations come out sorted', 'It replaces the need for a visited array'],
      correct: 0,
      why: 'At a deeper level i equals start for the first candidate, so the guard does not fire and a second copy of the value can still be taken; writing i > 0 instead would wrongly forbid that.',
      topic: 'duplicate pruning' },

    { id: 'q-bt-003', section: 'backtracking', tier: 'intermediate',
      q: 'What distinguishes pruning from memoization in a search?',
      opts: ['Pruning caches results, memoization discards them', 'They are two names for the same optimisation', 'Pruning only works on trees, memoization only on graphs', 'Pruning abandons a subtree that provably contains no solution; memoization reuses the answer of a subproblem already solved'],
      correct: 3,
      why: 'Pruning removes work that cannot pay off at all; memoization removes work that has already been done. A search can use either, both, or neither.',
      topic: 'pruning vs memoization' },

    { id: 'q-bt-004', section: 'backtracking', tier: 'advanced',
      q: 'N-Queens keeps three boolean arrays for used columns, used r-c diagonals and used r+c anti-diagonals rather than rescanning the partial board. What is the main benefit?',
      opts: ['It reduces the number of solutions found', 'Each legality test becomes O(1), so pruning happens as early and as cheaply as possible', 'It converts the algorithm into dynamic programming', 'It eliminates the need to undo choices'],
      correct: 1,
      why: 'The number of legality tests is enormous; making each one constant time (and doing it before recursing) is where nearly all the speed comes from.',
      topic: 'constant-time feasibility checks' },

    { id: 'q-bt-005', section: 'backtracking', tier: 'intermediate',
      q: 'Generating all permutations of n distinct elements produces n! outputs. What does that imply about optimising the algorithm?',
      opts: ['No algorithm can beat O(n * n!) total work, so only constant-factor improvements are available', 'A bitmask DP reduces it to O(2^n) outputs', 'Sorting the input first reduces it to O(n log n)', 'Memoizing the recursion makes it polynomial'],
      correct: 0,
      why: 'The output size is itself n! items of length n, so writing the answer already costs O(n * n!); pruning helps only when the problem adds constraints that kill branches.',
      topic: 'output-size lower bounds' },

    { id: 'q-bt-006', section: 'backtracking', tier: 'advanced',
      q: 'In a grid path search such as Word Search, why is a visited mark that is never cleared a bug rather than an optimisation?',
      opts: ['It uses more memory than restoring the board', 'Clearing is required by the language', 'The mark means "on the current path"; leaving it set bans cells burned on failed paths and produces false negatives', 'It changes the complexity from polynomial to exponential'],
      correct: 2,
      why: 'A cell may be unusable on one path yet essential on another; a permanent mark conflates per-path state with global state.',
      topic: 'per-path vs global state' },

    { id: 'q-bt-007', section: 'backtracking', tier: 'intermediate',
      q: 'Which change to a backtracking search reduces the number of nodes explored rather than just the cost per node?',
      opts: ['Using an array instead of a linked list for the partial solution', 'Ordering the candidate choices so the most constrained option is tried first', 'Passing the partial solution by reference instead of by value', 'Replacing recursion with an explicit stack'],
      correct: 1,
      why: 'Most-constrained-first (a classic variable ordering heuristic) makes failures surface near the top of the tree, cutting whole subtrees; the other three only lower the constant factor.',
      topic: 'search ordering heuristics' },

    { id: 'q-bt-008', section: 'backtracking', tier: 'intermediate',
      q: 'Subsets can be written as a two-branch take/skip recursion or as a loop over start..n-1. What is true of both?',
      opts: ['Only the loop version can emit subsets in lexicographic order', 'The take/skip version uses O(n) space while the loop version uses O(2^n)', 'The loop version silently omits the empty subset', 'They enumerate the same 2^n leaves and differ only in the shape of the decision tree'],
      correct: 3,
      why: 'Both formulations are complete and non-redundant over the power set; the loop version simply merges the skip chain into one level, so the work is the same.',
      topic: 'equivalent decision trees' },

    /* ---- graphs: traversal choice and cycle detection ---- */
    { id: 'q-gr-001', section: 'graphs', tier: 'beginner',
      q: 'You need the fewest moves between two cells on an unweighted grid. Why is BFS the right choice over DFS?',
      opts: ['DFS cannot reach every cell', 'BFS expands nodes in nondecreasing distance order, so the first arrival at the target is already the shortest', 'BFS always uses less memory on grids', 'DFS would revisit cells infinitely'],
      correct: 1,
      why: 'BFS settles each node on first contact in an unweighted graph; DFS can reach the target by a long route first and would have to keep relaxing.',
      topic: 'BFS vs DFS' },

    { id: 'q-gr-002', section: 'graphs', tier: 'intermediate',
      q: 'Which situation genuinely favours DFS over BFS?',
      opts: ['Finding the shortest unweighted path', 'Finding the nearest of many sources', 'Level-by-level processing of a tree', 'Enumerating or testing paths, such as detecting a cycle or producing a topological order by finish time'],
      correct: 3,
      why: 'DFS naturally tracks the current path, which is what back-edge cycle detection and post-order topological sorting need; BFS owns shortest-path-by-hops instead.',
      topic: 'BFS vs DFS' },

    { id: 'q-gr-003', section: 'graphs', tier: 'intermediate',
      q: 'Detecting a cycle in an UNDIRECTED graph with DFS needs one piece of bookkeeping that the directed case does not. What is it?',
      opts: ['Skipping the edge back to the immediate parent, so one undirected edge is not mistaken for a cycle', 'A separate recursion-stack colour in addition to visited', 'An in-degree count for every node', 'Sorting each adjacency list'],
      correct: 0,
      why: 'Every undirected edge u-v is stored in both directions, so without the parent skip DFS immediately "rediscovers" u from v and reports a phantom cycle.',
      topic: 'undirected cycle detection' },

    { id: 'q-gr-004', section: 'graphs', tier: 'intermediate',
      q: 'During DFS on a DIRECTED graph, which condition correctly proves a cycle?',
      opts: ['Reaching a node that is already fully processed', 'Reaching any node that has been visited before', 'Reaching a node that is currently on the recursion stack', 'Reaching a node whose in-degree is zero'],
      correct: 2,
      why: 'Only a back edge into a node still on the stack closes a cycle; an edge into a finished node is a cross or forward edge and is harmless.',
      topic: 'directed cycle detection' },

    { id: 'q-gr-005', section: 'graphs', tier: 'intermediate',
      q: 'Kahn topological sort repeatedly removes in-degree-0 nodes. How does it report that the directed graph contains a cycle?',
      opts: ['The queue becomes empty on the very first iteration', 'A node is pushed onto the queue twice', 'Some in-degree goes negative', 'It emits fewer nodes than the graph has, because every node on a cycle keeps a positive in-degree forever'],
      correct: 3,
      why: 'Nodes inside a cycle depend on each other, so their in-degrees never reach zero and they are never emitted; comparing the emitted count with V is the test.',
      topic: 'topological sort' },

    { id: 'q-gr-006', section: 'graphs', tier: 'intermediate',
      q: 'Union-find is a natural fit for which of these tasks?',
      opts: ['Finding the shortest path in a weighted digraph', 'Answering "are these two nodes already connected?" while edges arrive one at a time', 'Producing a topological order', 'Detecting a back edge in a directed graph'],
      correct: 1,
      why: 'Disjoint set union maintains connectivity incrementally; it has no notion of edge direction or distance, so shortest paths and topological order are out of scope.',
      topic: 'union-find' },

    { id: 'q-gr-007', section: 'graphs', tier: 'advanced',
      q: 'When you need the distance to the NEAREST of many sources on an unweighted graph, what is the right technique?',
      opts: ['Run one BFS per source and take the minimum', 'Run DFS from an arbitrary source', 'Seed a single BFS queue with all sources at once, which is equivalent to a zero-cost super-source', 'Run Dijkstra with all weights set to 1'],
      correct: 2,
      why: 'Multi-source BFS answers all of them in one O(V+E) sweep; per-source BFS multiplies the cost by the number of sources, and Dijkstra adds a needless log factor.',
      topic: 'multi-source BFS' },

    { id: 'q-gr-008', section: 'graphs', tier: 'advanced',
      q: 'A graph on n nodes has exactly n-1 edges. Which additional single check proves it is a tree?',
      opts: ['That it contains no cycle (equivalently, that it is connected — with n-1 edges either one implies the other)', 'That every node has degree at least two', 'That it is bipartite', 'That some node has degree n-1'],
      correct: 0,
      why: 'A forest with k components on n nodes has n-k edges, so n-1 edges plus acyclicity forces k=1; equally, n-1 edges plus connectivity forces acyclicity.',
      topic: 'tree characterisation' },

    /* ---- advanced graphs: shortest-path algorithm selection ---- */
    { id: 'q-ag-001', section: 'advanced-graphs', tier: 'intermediate',
      q: 'All edge weights are non-negative and you need single-source shortest paths. Which algorithm is the right default?',
      opts: ['Dijkstra with a binary heap, O(E log V)', 'Bellman-Ford, O(V*E)', 'Floyd-Warshall, O(V^3)', 'Plain BFS, O(V+E)'],
      correct: 0,
      why: 'Dijkstra is the standard for non-negative weights; BFS is only correct when all weights are equal, and the other two solve harder problems at higher cost.',
      topic: 'shortest-path selection' },

    { id: 'q-ag-002', section: 'advanced-graphs', tier: 'advanced',
      q: 'Why does plain Dijkstra give wrong answers on "cheapest path using at most k edges", even with non-negative weights?',
      opts: ['Dijkstra cannot handle directed edges', 'Dijkstra requires a connected graph', 'The real state is (node, edges used); the cheapest arrival at a node may use too many edges to be extendable, so a costlier shorter-hop arrival must be kept', 'The heap comparison becomes ambiguous'],
      correct: 2,
      why: 'A resource constraint enlarges the state space; settling a node by cost alone discards the arrival that still has hops left to spend.',
      topic: 'constrained shortest paths' },

    { id: 'q-ag-003', section: 'advanced-graphs', tier: 'advanced',
      q: 'Some edge weights are negative and you must also detect whether a negative cycle exists. Which algorithm applies?',
      opts: ['Dijkstra with a Fibonacci heap', 'Bellman-Ford: relax all E edges V-1 times, then one extra pass — any further improvement proves a negative cycle', 'Prim', 'Multi-source BFS'],
      correct: 1,
      why: 'Dijkstra assumes settling a node is final, which negative edges break. Bellman-Ford makes no such assumption and its V-th pass is exactly the negative-cycle test.',
      topic: 'negative weights' },

    { id: 'q-ag-004', section: 'advanced-graphs', tier: 'advanced',
      q: 'You need a minimum spanning tree of a COMPLETE graph on n points whose weights are computed from coordinates. Which is the sensible choice?',
      opts: ['Kruskal, since sorting the edges is O(n log n) here', 'Dijkstra from every vertex', 'Floyd-Warshall, then pick the smallest entries', 'Prim with an O(n^2) dense scan, since materialising and sorting about n^2/2 edges for Kruskal costs more'],
      correct: 3,
      why: 'Kruskal must build and sort the edge list — O(n^2 log n) — while dense Prim relaxes distances implicitly in O(n^2) and never stores an edge list.',
      topic: 'MST algorithm selection' },

    { id: 'q-ag-005', section: 'advanced-graphs', tier: 'master',
      q: 'A path cost is defined as the MAXIMUM edge weight along the path, and you want to minimise it. How should Dijkstra be adapted?',
      opts: ['Negate the weights and run Bellman-Ford', 'Run BFS and stop at the first arrival', 'Keep the min-heap but make the relaxed key max(current key, neighbour weight) instead of a sum', 'Sort all edges and binary search on the answer only — Dijkstra cannot be adapted'],
      correct: 2,
      why: 'Dijkstra needs only that extending a path never lowers its cost; max is monotone, so swapping + for max yields a correct bottleneck shortest path.',
      topic: 'bottleneck shortest path' },

    { id: 'q-ag-006', section: 'advanced-graphs', tier: 'master',
      q: 'Hierholzer algorithm appends a node to the route only once its outgoing edges are exhausted, then reverses the route at the end. Why not append on entry?',
      opts: ['Appending on entry can strand the walk at a dead end while edges remain; post-order plus reversal splices that suffix into the right place', 'Appending on entry breaks the lexicographic tie-break', 'Post-order is required to keep the algorithm O(E)', 'Appending on entry double-counts the start node'],
      correct: 0,
      why: 'An Eulerian walk built greedily can get stuck; finishing a node only when it has no unused edges guarantees the stuck segment ends up at the tail of the reversed route.',
      topic: 'Eulerian paths' },

    { id: 'q-ag-007', section: 'advanced-graphs', tier: 'intermediate',
      q: 'You need shortest paths between ALL pairs of nodes in a dense graph of a few hundred vertices, possibly with negative edges but no negative cycle. What fits best?',
      opts: ['Dijkstra from every vertex', 'BFS from every vertex', 'Prim followed by tree distances', 'Floyd-Warshall, O(V^3), which handles negative edges directly'],
      correct: 3,
      why: 'Floyd-Warshall is simple, cache friendly on dense graphs and tolerates negative edges; repeated Dijkstra would need a Johnson reweighting step first.',
      topic: 'all-pairs shortest paths' },

    { id: 'q-ag-008', section: 'advanced-graphs', tier: 'advanced',
      q: 'In a lazy Dijkstra implementation, why is a popped entry discarded when its stored distance exceeds the recorded dist[node]?',
      opts: ['To keep the heap sorted', 'Because it is a stale copy left over from an earlier, worse relaxation of the same node', 'Because that node is unreachable', 'Because the graph contains negative edges'],
      correct: 1,
      why: 'Lazy deletion pushes a new entry on every improvement instead of decreasing a key, so old entries remain; skipping them keeps each node settled exactly once.',
      topic: 'Dijkstra implementation' }
  ];

  window.DB.problems.push(...P);
  window.DB.questions.push(...Q);
})();
