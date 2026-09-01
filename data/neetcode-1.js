/* NeetCode roadmap, part 1: arrays & hashing, two pointers, sliding window. */
(function () {
  const P = [ /* coding problems */

    /* ---------------------------------------------------------------- */
    /* arrays-hashing                                                    */
    /* ---------------------------------------------------------------- */

    {
      id: 'nc-contains-duplicate',
      title: 'Contains Duplicate',
      section: 'arrays-hashing',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given an integer array nums, return true if any value appears at least twice, and false if every element is distinct.',
      examples: [
        { in: 'nums = [1,2,3,1]', out: 'true' },
        { in: 'nums = [1,2,3,4]', out: 'false' },
        { in: 'nums = []',        out: 'false' }
      ],
      approach: 'Sweep the array once, keeping a hash set of the values already seen. Before inserting the current value, ask whether the set already contains it; if it does you have found a duplicate and can return immediately. If the sweep finishes with no hit, every value was distinct.',
      keyInsight: 'Membership is the whole question, so the right container is the one whose only job is membership: a hash set answers "have I seen this?" in O(1) average time.',
      pitfalls: [
        'Comparing every pair with two nested loops. That is O(n^2) and will time out on large inputs.',
        'Sorting first is correct but costs O(n log n) time; it is only preferable when you are not allowed extra memory.',
        'Inserting the value before testing it, which makes every element look like a duplicate of itself.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'bool containsDuplicate(vector<int>& nums) {\n    // your code here\n}',
        python: 'def contains_duplicate(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool containsDuplicate(vector<int>& nums) {\n    unordered_set<int> seen;\n    for (int v : nums) {\n        if (seen.count(v)) return true;\n        seen.insert(v);\n    }\n    return false;\n}',
        python: 'def contains_duplicate(nums):\n    seen = set()\n    for v in nums:\n        if v in seen:\n            return True\n        seen.add(v)\n    return False'
      },
      checks: {
        cpp: [
          { re: 'unordered_set|unordered_map|set\\s*<|map\\s*<|sort\\s*\\(', hint: 'Track what you have already seen (hash set) or sort so equal values become neighbours.' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Scan the array.' },
          { re: 'return', hint: 'Return true on a repeat and false when the scan finishes.' }
        ],
        python: [
          { re: 'set\\s*\\(|\\{\\s*\\}|dict\\s*\\(|sorted\\s*\\(|Counter|\\.sort\\s*\\(', hint: 'Track what you have already seen (set/dict) or sort so equal values become neighbours.' },
          { re: 'for\\s+\\w+|while\\s', hint: 'Scan the array.' },
          { re: 'return', hint: 'Return True on a repeat and False when the scan finishes.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'for[\\s\\S]{0,140}for\\s*\\(', hint: 'Nested loops compare every pair in O(n^2). One pass with a hash set is enough.' }],
        python: [{ re: 'for[\\s\\S]{0,140}\\n\\s+for\\s', hint: 'Nested loops compare every pair in O(n^2). One pass with a set is enough.' }]
      },
      mcq: [
        { q: 'When is sorting the better choice than a hash set for this problem?',
          opts: ['When the array is very large', 'When duplicates are rare', 'When you must use O(1) extra space and may modify the input', 'Never, sorting is always worse'],
          correct: 2,
          why: 'Sorting is in-place O(1) auxiliary space but O(n log n) time; the hash set trades O(n) memory for O(n) time. The memory constraint is what decides.' }
      ]
    },

    {
      id: 'nc-valid-anagram',
      title: 'Valid Anagram',
      section: 'arrays-hashing',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given two strings s and t, return true if t is an anagram of s, that is, t uses exactly the same letters as s with exactly the same multiplicities.',
      examples: [
        { in: 's = "anagram", t = "nagaram"', out: 'true' },
        { in: 's = "rat", t = "car"',         out: 'false' },
        { in: 's = "aa", t = "a"',            out: 'false' }
      ],
      approach: 'Reject immediately if the lengths differ. Then count each character of s in a map, and walk t decrementing those counts. If a count would drop below zero, t has a character s does not have enough of, so return false. Surviving the whole walk with equal lengths means every count landed back at zero.',
      keyInsight: 'An anagram is exactly an equality of multisets, and a frequency table is the cheapest representation of a multiset. Equal length plus no negative count implies all counts are zero.',
      pitfalls: [
        'Forgetting the length check. Without it, "aab" vs "ab" can still pass a one-sided count comparison.',
        'Sorting both strings works and is easy to reason about, but costs O(n log n) instead of O(n).',
        'Assuming lowercase ASCII when the follow-up asks about Unicode; a fixed array of 26 slots breaks there, a hash map does not.'
      ],
      complexity: { time: 'O(n)', space: 'O(1) for a fixed alphabet, O(k) for k distinct characters' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(26n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'bool isAnagram(string s, string t) {\n    // your code here\n}',
        python: 'def is_anagram(s, t):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool isAnagram(string s, string t) {\n    if (s.size() != t.size()) return false;\n    unordered_map<char,int> cnt;\n    for (char c : s) cnt[c]++;\n    for (char c : t) {\n        if (--cnt[c] < 0) return false;\n    }\n    return true;\n}',
        python: 'def is_anagram(s, t):\n    if len(s) != len(t):\n        return False\n    counts = {}\n    for c in s:\n        counts[c] = counts.get(c, 0) + 1\n    for c in t:\n        if counts.get(c, 0) == 0:\n            return False\n        counts[c] -= 1\n    return True'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<|int\\s+\\w+\\s*\\[|vector\\s*<\\s*int|sort\\s*\\(', hint: 'Build a frequency table (map or 26-slot array), or sort both strings.' },
          { re: 'size\\s*\\(\\)|length\\s*\\(\\)|sort\\s*\\(', hint: 'Compare lengths first, or sort both strings so a direct comparison is valid.' },
          { re: 'return', hint: 'Return the verdict.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\s*\\(|Counter|defaultdict|sorted\\s*\\(|\\[\\s*0\\s*\\]\\s*\\*', hint: 'Build a frequency table (dict/Counter/list) or sort both strings.' },
          { re: 'len\\s*\\(|sorted\\s*\\(|Counter', hint: 'Compare lengths first, or use a construction where length is implicitly compared.' },
          { re: 'return', hint: 'Return the verdict.' }
        ]
      },
      mcq: [
        { q: 'Why does the length check make a single decrementing pass sufficient?',
          opts: ['It speeds up the loop', 'Equal totals plus no negative count force every count to zero', 'It avoids hash collisions', 'It handles Unicode correctly'],
          correct: 1,
          why: 'The counts start summing to len(s) and each of the len(t) decrements removes one. If none went negative and the totals matched, nothing can be left over.' }
      ]
    },

    {
      id: 'nc-two-sum',
      title: 'Two Sum',
      section: 'arrays-hashing',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given an integer array nums and an integer target, return the indices of the two numbers that add up to target. Exactly one valid answer exists and you may not use the same element twice.',
      examples: [
        { in: 'nums = [2,7,11,15], target = 9', out: '[0,1]' },
        { in: 'nums = [3,2,4], target = 6',     out: '[1,2]' },
        { in: 'nums = [3,3], target = 6',       out: '[0,1]' }
      ],
      approach: 'Walk the array once holding a hash map from value to the index where it was seen. At index i with value v, look up target - v. If the complement is already in the map you have the pair, so return the stored index and i. Otherwise record v -> i and move on.',
      keyInsight: 'Turn "find a partner" into "have I already seen my partner?". Storing what you have passed makes the lookup O(1) and collapses the quadratic search into one pass.',
      pitfalls: [
        'Inserting the current value before querying, which lets an element pair with itself when target == 2*v.',
        'Returning the values rather than the indices.',
        'Sorting to use two pointers. That works for the value pair but destroys the original indices unless you carry them along.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(1)'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<int> twoSum(vector<int>& nums, int target) {\n    // your code here\n}',
        python: 'def two_sum(nums, target):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int,int> seen;\n    for (int i = 0; i < (int)nums.size(); i++) {\n        int need = target - nums[i];\n        if (seen.count(need)) return {seen[need], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}',
        python: 'def two_sum(nums, target):\n    seen = {}\n    for i, v in enumerate(nums):\n        if target - v in seen:\n            return [seen[target - v], i]\n        seen[v] = i\n    return []'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<|sort\\s*\\(', hint: 'Remember the values you have passed in a hash map (or sort with paired indices).' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Scan the array.' },
          { re: 'return', hint: 'Return the two indices.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\s*\\(|defaultdict|sorted\\s*\\(|enumerate', hint: 'Remember the values you have passed in a dict (or sort with paired indices).' },
          { re: 'for\\s+\\w+|while\\s', hint: 'Scan the array.' },
          { re: 'return', hint: 'Return the two indices.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'for[\\s\\S]{0,140}for\\s*\\(', hint: 'Two nested loops is the O(n^2) brute force. One pass with a map is enough.' }],
        python: [{ re: 'for[\\s\\S]{0,140}\\n\\s+for\\s', hint: 'Two nested loops is the O(n^2) brute force. One pass with a dict is enough.' }]
      },
      mcq: [
        { q: 'Why is the complement looked up before the current value is inserted?',
          opts: ['To save memory', 'To avoid pairing an element with itself', 'To keep the map ordered', 'It makes no difference'],
          correct: 1,
          why: 'If you insert first, then when target == 2*nums[i] the lookup finds the element you just added and returns [i, i].' }
      ]
    },

    {
      id: 'nc-group-anagrams',
      title: 'Group Anagrams',
      section: 'arrays-hashing',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an array of lowercase strings, group the anagrams together. Return the groups in any order.',
      examples: [
        { in: 'strs = ["eat","tea","tan","ate","nat","bat"]', out: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
        { in: 'strs = [""]',    out: '[[""]]' },
        { in: 'strs = ["a"]',   out: '[["a"]]' }
      ],
      approach: 'Give every string a canonical key that is identical for anagrams and different otherwise, then bucket the strings by that key in a hash map. Two natural keys work: the sorted characters of the string, or a 26-slot letter-count vector serialised into a string. Finally return the map values.',
      keyInsight: 'Grouping by an equivalence relation becomes a hash-map problem the moment you can compute a canonical representative of each class in O(len) time.',
      pitfalls: [
        'Comparing every pair of strings for anagram-ness, which is O(n^2 * len).',
        'Building the count key without a separator. Counts 1,11 and 11,1 both stringify to "111" unless you delimit them.',
        'Forgetting that the empty string is its own valid group.'
      ],
      complexity: { time: 'O(n * len) with count keys, O(n * len log len) with sorted keys', space: 'O(n * len)' },
      timeChoices: ['O(n^2 * len)', 'O(n * len)', 'O(n log n)', 'O(len^2)'],
      timeAnswer: 1,
      starter: {
        cpp: 'vector<vector<string>> groupAnagrams(vector<string>& strs) {\n    // your code here\n}',
        python: 'def group_anagrams(strs):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<string>> groupAnagrams(vector<string>& strs) {\n    unordered_map<string, vector<string>> groups;\n    for (const string& s : strs) {\n        array<int,26> cnt{};\n        for (char c : s) cnt[c - \'a\']++;\n        string key;\n        for (int i = 0; i < 26; i++) {\n            key += \'#\';\n            key += to_string(cnt[i]);\n        }\n        groups[key].push_back(s);\n    }\n    vector<vector<string>> res;\n    for (auto& kv : groups) res.push_back(kv.second);\n    return res;\n}',
        python: 'def group_anagrams(strs):\n    groups = {}\n    for s in strs:\n        counts = [0] * 26\n        for c in s:\n            counts[ord(c) - ord(\'a\')] += 1\n        key = tuple(counts)\n        groups.setdefault(key, []).append(s)\n    return list(groups.values())'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<', hint: 'Bucket the strings in a hash map keyed by a canonical form.' },
          { re: 'sort\\s*\\(|26|to_string|array\\s*<|vector\\s*<\\s*int', hint: 'Build the key by sorting the characters or by counting the 26 letters.' },
          { re: 'push_back|emplace_back|insert', hint: 'Append each string to its bucket.' },
          { re: 'return', hint: 'Return the collected groups.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\s*\\(|defaultdict', hint: 'Bucket the strings in a dict keyed by a canonical form.' },
          { re: 'sorted\\s*\\(|tuple\\s*\\(|ord\\s*\\(|Counter|\\.sort\\s*\\(', hint: 'Build the key by sorting the characters or by counting the 26 letters.' },
          { re: 'append|setdefault|\\+=', hint: 'Append each string to its bucket.' },
          { re: 'return', hint: 'Return the collected groups.' }
        ]
      },
      mcq: [
        { q: 'A candidate keys the map by the sum of character codes. What goes wrong?',
          opts: ['It is too slow', 'It uses too much memory', 'Different letter multisets can share a sum, so unrelated words collide', 'It cannot handle the empty string'],
          correct: 2,
          why: 'A sum is not a canonical form of a multiset: "ad" and "bc" both total the same, so the grouping would merge non-anagrams.' }
      ]
    },

    {
      id: 'nc-top-k-frequent',
      title: 'Top K Frequent Elements',
      section: 'arrays-hashing',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an integer array nums and an integer k, return the k most frequent elements. The answer is guaranteed to be unique and may be returned in any order.',
      examples: [
        { in: 'nums = [1,1,1,2,2,3], k = 2', out: '[1,2]' },
        { in: 'nums = [1], k = 1',           out: '[1]' },
        { in: 'nums = [4,4,5,5,6], k = 1',   out: '[4] or [5] (ties are excluded by the guarantee)' }
      ],
      approach: 'Count frequencies in a hash map. Note that a frequency is an integer between 1 and n, so use it as an index: build an array of buckets where buckets[f] holds every value that occurred exactly f times. Then walk the buckets from f = n downwards, emitting values until you have k of them.',
      keyInsight: 'When the sort key is a small bounded integer you do not need a comparison sort at all. Bucketing by frequency gives O(n) where a heap gives O(n log k) and a full sort gives O(n log n).',
      pitfalls: [
        'Sizing the bucket array to k or to the number of distinct values instead of n + 1, so the maximum frequency has no slot.',
        'Sorting the whole frequency map, which is correct but O(n log n) rather than O(n).',
        'Using a max-heap of size n. The O(n log k) version keeps a min-heap of size k and pops the smallest, not a heap of everything.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n log n)', 'O(n log k)', 'O(n)', 'O(k log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<int> topKFrequent(vector<int>& nums, int k) {\n    // your code here\n}',
        python: 'def top_k_frequent(nums, k):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> topKFrequent(vector<int>& nums, int k) {\n    unordered_map<int,int> freq;\n    for (int v : nums) freq[v]++;\n    int n = nums.size();\n    vector<vector<int>> buckets(n + 1);\n    for (auto& kv : freq) buckets[kv.second].push_back(kv.first);\n    vector<int> res;\n    for (int f = n; f >= 1 && (int)res.size() < k; f--) {\n        for (int v : buckets[f]) {\n            res.push_back(v);\n            if ((int)res.size() == k) break;\n        }\n    }\n    return res;\n}',
        python: 'def top_k_frequent(nums, k):\n    freq = {}\n    for v in nums:\n        freq[v] = freq.get(v, 0) + 1\n    buckets = [[] for _ in range(len(nums) + 1)]\n    for v, f in freq.items():\n        buckets[f].append(v)\n    res = []\n    for f in range(len(nums), 0, -1):\n        for v in buckets[f]:\n            res.append(v)\n            if len(res) == k:\n                return res\n    return res'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<', hint: 'Count how often each value appears.' },
          { re: 'priority_queue|nth_element|sort\\s*\\(|bucket|vector\\s*<\\s*vector', hint: 'Select the top k with buckets, a heap, or a sort of the counts.' },
          { re: 'return', hint: 'Return the k values.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\s*\\(|Counter|defaultdict', hint: 'Count how often each value appears.' },
          { re: 'heap|sorted\\s*\\(|\\.sort\\s*\\(|most_common|bucket|\\[\\s*\\[\\s*\\]', hint: 'Select the top k with buckets, a heap, or a sort of the counts.' },
          { re: 'return', hint: 'Return the k values.' }
        ]
      },
      mcq: [
        { q: 'Why can frequencies be bucketed into a plain array instead of sorted?',
          opts: ['Because k is small', 'Because every frequency is an integer in [1, n], so it can index an array of size n + 1', 'Because hash maps are already sorted', 'Because the answer is unique'],
          correct: 1,
          why: 'Counting-sort style bucketing needs a bounded integer key. Frequencies are bounded by n, so the key doubles as an array index and no comparisons are needed.' }
      ]
    },

    {
      id: 'nc-product-except-self',
      title: 'Product of Array Except Self',
      section: 'arrays-hashing',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an integer array nums, return an array answer where answer[i] is the product of every element of nums except nums[i]. Solve it without using division and in O(n) time.',
      examples: [
        { in: 'nums = [1,2,3,4]',    out: '[24,12,8,6]' },
        { in: 'nums = [-1,1,0,-3,3]', out: '[0,0,9,0,0]' },
        { in: 'nums = [2,3]',        out: '[3,2]' }
      ],
      approach: 'The answer at i is (product of everything left of i) times (product of everything right of i). Make one left-to-right pass writing the running prefix product into answer[i] before multiplying nums[i] into it. Then make one right-to-left pass keeping a running suffix product and multiplying it into answer[i] before absorbing nums[i]. The output array carries the prefix pass, so no extra arrays are needed.',
      keyInsight: 'Split the answer into two independent directional scans. Writing the running product before updating it is what keeps element i out of its own answer.',
      pitfalls: [
        'Dividing the total product by nums[i]. That breaks on a single zero and is undefined on two zeros.',
        'Updating the running product before writing it, which includes nums[i] in its own answer.',
        'Allocating separate prefix and suffix arrays. It is correct but the output array plus one scalar suffices.'
      ],
      complexity: { time: 'O(n)', space: 'O(1) extra, not counting the output' },
      timeChoices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(2^n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<int> productExceptSelf(vector<int>& nums) {\n    // your code here\n}',
        python: 'def product_except_self(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> productExceptSelf(vector<int>& nums) {\n    int n = nums.size();\n    vector<int> res(n, 1);\n    int prefix = 1;\n    for (int i = 0; i < n; i++) {\n        res[i] = prefix;\n        prefix *= nums[i];\n    }\n    int suffix = 1;\n    for (int i = n - 1; i >= 0; i--) {\n        res[i] *= suffix;\n        suffix *= nums[i];\n    }\n    return res;\n}',
        python: 'def product_except_self(nums):\n    n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix\n        prefix *= nums[i]\n    suffix = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= suffix\n        suffix *= nums[i]\n    return res'
      },
      checks: {
        cpp: [
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Scan forward to accumulate prefix products.' },
          { re: '\\*=|\\*', hint: 'Multiply running products into the answer.' },
          { re: 'n\\s*-\\s*1|rbegin|--|-\\s*=\\s*1|reverse', hint: 'A second scan must run backwards for the suffix products.' },
          { re: 'return', hint: 'Return the answer array.' }
        ],
        python: [
          { re: 'for\\s+\\w+|while\\s', hint: 'Scan forward to accumulate prefix products.' },
          { re: '\\*=|\\*', hint: 'Multiply running products into the answer.' },
          { re: 'range\\s*\\([^\\)]*-\\s*1|reversed|\\[::-1\\]', hint: 'A second scan must run backwards for the suffix products.' },
          { re: 'return', hint: 'Return the answer array.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: '/=|\\w\\s*/\\s*\\w', hint: 'Division is banned here and fails outright when the array contains a zero.' }],
        python: [{ re: '/=|\\w\\s*/\\s*\\w', hint: 'Division is banned here and fails outright when the array contains a zero.' }]
      },
      mcq: [
        { q: 'Exactly one element of nums is 0. What does the answer look like?',
          opts: ['All entries are 0', 'Every entry is 0 except at the zero index, which holds the product of the rest', 'The answer is undefined', 'Every entry equals the product of all non-zero values'],
          correct: 1,
          why: 'Any window that includes the zero multiplies to 0; only the slot that excludes it survives, holding the product of the other elements.' }
      ]
    },

    {
      id: 'nc-valid-sudoku',
      title: 'Valid Sudoku',
      section: 'arrays-hashing',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given a 9x9 board where empty cells are the character dot, determine whether the currently filled cells are valid: no digit repeats within a row, a column, or one of the nine 3x3 sub-boxes. The board does not need to be solvable.',
      examples: [
        { in: 'a board whose first row is ["5","3",".",".","7",".",".",".","."] and is otherwise consistent', out: 'true' },
        { in: 'the same board with the top-left 5 changed to 8, colliding with the 8 in the same sub-box',    out: 'false' }
      ],
      approach: 'Sweep all 81 cells once. For a filled cell at (r, c) holding digit d, compute its box index b = (r / 3) * 3 + c / 3 and check three membership sets: seen-in-row-r, seen-in-column-c, seen-in-box-b. If d is in any of them the board is invalid; otherwise insert d into all three and continue.',
      keyInsight: 'The three constraints are independent memberships over the same sweep, so one pass with three families of sets does the job. The box index is pure integer division: dividing a coordinate by 3 collapses three consecutive lines into one band.',
      pitfalls: [
        'Getting the box formula wrong. r / 3 + c / 3 is not injective; you need (r / 3) * 3 + c / 3.',
        'Treating the dot cells as a digit and reporting a false collision.',
        'Trying to check solvability. The task is only about the digits already present.'
      ],
      complexity: { time: 'O(81) = O(1)', space: 'O(81) = O(1)' },
      timeChoices: ['O(1), the board has fixed size', 'O(n^2)', 'O(n log n)', 'O(9!)'],
      timeAnswer: 0,
      starter: {
        cpp: 'bool isValidSudoku(vector<vector<char>>& board) {\n    // your code here\n}',
        python: 'def is_valid_sudoku(board):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool isValidSudoku(vector<vector<char>>& board) {\n    bool rows[9][9] = {}, cols[9][9] = {}, boxes[9][9] = {};\n    for (int r = 0; r < 9; r++) {\n        for (int c = 0; c < 9; c++) {\n            if (board[r][c] == \'.\') continue;\n            int d = board[r][c] - \'1\';\n            int b = (r / 3) * 3 + c / 3;\n            if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;\n            rows[r][d] = cols[c][d] = boxes[b][d] = true;\n        }\n    }\n    return true;\n}',
        python: 'def is_valid_sudoku(board):\n    rows = [set() for _ in range(9)]\n    cols = [set() for _ in range(9)]\n    boxes = [set() for _ in range(9)]\n    for r in range(9):\n        for c in range(9):\n            v = board[r][c]\n            if v == \'.\':\n                continue\n            b = (r // 3) * 3 + c // 3\n            if v in rows[r] or v in cols[c] or v in boxes[b]:\n                return False\n            rows[r].add(v)\n            cols[c].add(v)\n            boxes[b].add(v)\n    return True'
      },
      checks: {
        cpp: [
          { re: 'unordered_set|set\\s*<|bool\\s+\\w+\\s*\\[|vector\\s*<|int\\s+\\w+\\s*\\[', hint: 'Keep membership structures for rows, columns and boxes.' },
          { re: '/\\s*3|3\\s*\\*|\\*\\s*3', hint: 'Derive the sub-box index from the coordinates using division by 3.' },
          { re: 'return', hint: 'Return false on the first collision, true at the end.' }
        ],
        python: [
          { re: 'set\\s*\\(|\\{\\s*\\}|dict\\s*\\(|defaultdict|Counter|\\[\\s*0\\s*\\]\\s*\\*', hint: 'Keep membership structures for rows, columns and boxes.' },
          { re: '//\\s*3|3\\s*\\*|\\*\\s*3|/\\s*3', hint: 'Derive the sub-box index from the coordinates using division by 3.' },
          { re: 'return', hint: 'Return False on the first collision, True at the end.' }
        ]
      },
      mcq: [
        { q: 'Why is the sub-box index (r / 3) * 3 + c / 3 rather than r / 3 + c / 3?',
          opts: ['It is faster', 'It keeps the index under 9', 'The multiply spreads the row band so each (row band, column band) pair gets a distinct index', 'Both formulas work'],
          correct: 2,
          why: 'r/3 and c/3 are each 0..2. Adding them collapses (0,2), (1,1) and (2,0) to the same value; multiplying the row band by 3 makes the pair a base-3 number, which is unique.' }
      ]
    },

    {
      id: 'nc-encode-decode-strings',
      title: 'Encode and Decode Strings',
      section: 'arrays-hashing',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Design an algorithm to serialise a list of strings into a single string, and to deserialise that string back into the original list. The strings may contain any characters, including any delimiter you might pick.',
      examples: [
        { in: 'encode(["neet","code","love","you"])', out: '"4#neet4#code4#love3#you"' },
        { in: 'decode("4#neet4#code4#love3#you")',    out: '["neet","code","love","you"]' },
        { in: 'encode(["", "a#b"])',                  out: '"0#3#a#b"' }
      ],
      approach: 'Prefix each string with its length and a single separator character: length, then the separator, then the raw bytes. To decode, scan forward to the first separator, parse the digits before it as a length L, take exactly L characters after the separator as the next string, then jump the cursor past them and repeat.',
      keyInsight: 'A pure delimiter can always appear inside the payload, so it cannot be trusted. Length prefixing makes the parse unambiguous because the decoder never has to search inside the payload at all.',
      pitfalls: [
        'Joining with a comma or a rare character and splitting on it. Any character you pick can legally occur in the data.',
        'Searching for the separator globally instead of only up to the first one after the cursor, which will find separators that live inside a payload.',
        'Losing empty strings. The length prefix handles them correctly: 0 followed by the separator and nothing.'
      ],
      complexity: { time: 'O(total characters) to encode and to decode', space: 'O(total characters)' },
      timeChoices: ['O(n log n)', 'O(total characters)', 'O(n^2)', 'O(1)'],
      timeAnswer: 1,
      starter: {
        cpp: 'string encode(vector<string>& strs) {\n    // your code here\n}\n\nvector<string> decode(string s) {\n    // your code here\n}',
        python: 'def encode(strs):\n    # your code here\n    pass\n\n\ndef decode(s):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'string encode(vector<string>& strs) {\n    string out;\n    for (const string& s : strs) {\n        out += to_string(s.size());\n        out += \'#\';\n        out += s;\n    }\n    return out;\n}\n\nvector<string> decode(string s) {\n    vector<string> res;\n    int i = 0;\n    while (i < (int)s.size()) {\n        int j = i;\n        while (s[j] != \'#\') j++;\n        int len = stoi(s.substr(i, j - i));\n        res.push_back(s.substr(j + 1, len));\n        i = j + 1 + len;\n    }\n    return res;\n}',
        python: 'def encode(strs):\n    out = []\n    for s in strs:\n        out.append(str(len(s)) + \'#\' + s)\n    return \'\'.join(out)\n\n\ndef decode(s):\n    res = []\n    i = 0\n    while i < len(s):\n        j = s.index(\'#\', i)\n        length = int(s[i:j])\n        res.append(s[j + 1:j + 1 + length])\n        i = j + 1 + length\n    return res'
      },
      checks: {
        cpp: [
          { re: 'size\\s*\\(\\)|length\\s*\\(\\)|to_string', hint: 'Write each string length into the encoding.' },
          { re: 'substr|stoi|atoi', hint: 'Decode by reading the length then slicing exactly that many characters.' },
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Loop over the encoded string.' },
          { re: 'return', hint: 'Return the encoded string and the decoded list.' }
        ],
        python: [
          { re: 'len\\s*\\(|str\\s*\\(', hint: 'Write each string length into the encoding.' },
          { re: 'int\\s*\\(|index\\s*\\(|find\\s*\\(|\\[\\s*\\w+\\s*:', hint: 'Decode by reading the length then slicing exactly that many characters.' },
          { re: 'while\\s|for\\s+\\w+', hint: 'Loop over the encoded string.' },
          { re: 'return', hint: 'Return the encoded string and the decoded list.' }
        ]
      },
      mcq: [
        { q: 'Why does length prefixing work when a delimiter alone does not?',
          opts: ['It is shorter', 'Digits cannot appear in the payload', 'The decoder never scans inside a payload, it jumps over it by a known count', 'It sorts the strings'],
          correct: 2,
          why: 'After reading the length the decoder consumes exactly that many characters blindly, so payload bytes are never interpreted as structure.' }
      ]
    },

    {
      id: 'nc-longest-consecutive',
      title: 'Longest Consecutive Sequence',
      section: 'arrays-hashing',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given an unsorted array of integers, return the length of the longest run of consecutive integers present in the array. The run does not need to be contiguous in the array. Solve it in O(n) time.',
      examples: [
        { in: 'nums = [100,4,200,1,3,2]',      out: '4' },
        { in: 'nums = [0,3,7,2,5,8,4,6,0,1]',  out: '9' },
        { in: 'nums = []',                     out: '0' }
      ],
      approach: 'Put every value into a hash set. Then, for each value v in the set, only start counting if v - 1 is absent, which means v is the smallest element of its run. From such a start, walk upward with v + 1, v + 2, ... while each is present, and record the longest walk.',
      keyInsight: 'The start-of-run test is what keeps this linear. Every value is walked over at most once across all runs, because a walk is only ever launched from the unique minimum of its run. Without that test the same run is rewalked from each of its members and the cost becomes quadratic.',
      pitfalls: [
        'Omitting the v - 1 check and walking from every value, which is O(n^2) on a single long run.',
        'Sorting first. That is a correct O(n log n) solution but misses the required linear bound.',
        'Mishandling duplicates. Deduplicating via the set is what makes them free.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(n * maxValue)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int longestConsecutive(vector<int>& nums) {\n    // your code here\n}',
        python: 'def longest_consecutive(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int longestConsecutive(vector<int>& nums) {\n    unordered_set<int> s(nums.begin(), nums.end());\n    int best = 0;\n    for (int v : s) {\n        if (s.count(v - 1)) continue;\n        int len = 1;\n        while (s.count(v + len)) len++;\n        best = max(best, len);\n    }\n    return best;\n}',
        python: 'def longest_consecutive(nums):\n    s = set(nums)\n    best = 0\n    for v in s:\n        if v - 1 in s:\n            continue\n        length = 1\n        while v + length in s:\n            length += 1\n        if length > best:\n            best = length\n    return best'
      },
      checks: {
        cpp: [
          { re: 'unordered_set|unordered_map|set\\s*<|map\\s*<', hint: 'A hash set gives O(1) "is this number present?" queries.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Look at the neighbouring integers v - 1 and v + 1.' },
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Walk upward from the start of each run.' },
          { re: 'return', hint: 'Return the longest run length.' }
        ],
        python: [
          { re: 'set\\s*\\(|\\{\\s*\\}|dict\\s*\\(', hint: 'A set gives O(1) "is this number present?" queries.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'Look at the neighbouring integers v - 1 and v + 1.' },
          { re: 'while\\s|for\\s+\\w+', hint: 'Walk upward from the start of each run.' },
          { re: 'return', hint: 'Return the longest run length.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'sort\\s*\\(', hint: 'Sorting gives a correct O(n log n) answer, but the target here is the O(n) hash-set method.' }],
        python: [{ re: 'sorted\\s*\\(|\\.sort\\s*\\(', hint: 'Sorting gives a correct O(n log n) answer, but the target here is the O(n) set method.' }]
      },
      mcq: [
        { q: 'Why is the total work linear even though the inner while loop can run many times?',
          opts: ['The while loop is bounded by a constant', 'A walk starts only at a run minimum, so each value is visited by at most one walk', 'Hash sets make loops free', 'Because duplicates are removed'],
          correct: 1,
          why: 'Each run has exactly one element with no predecessor in the set, so the inner walks partition the values instead of overlapping. The total inner work is O(n).' }
      ]
    },

    {
      id: 'nc-longest-common-prefix',
      title: 'Longest Common Prefix',
      section: 'arrays-hashing',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return the empty string.',
      examples: [
        { in: 'strs = ["flower","flow","flight"]', out: '"fl"' },
        { in: 'strs = ["dog","racecar","car"]',    out: '""' },
        { in: 'strs = ["interspecies","interstellar","interstate"]', out: '"inters"' }
      ],
      approach: 'Take the first string as a candidate prefix. For each remaining string, walk both from index 0 while the characters agree and neither string is exhausted, then truncate the candidate to the matched length. If the candidate ever becomes empty you can stop early, because a prefix can only shrink.',
      keyInsight: 'The common prefix is monotone: it never grows as you fold in more strings. That makes a single left-to-right fold with early exit both correct and optimal.',
      pitfalls: [
        'Indexing past the end of a shorter string. Bound the walk by both lengths.',
        'Forgetting the empty input, or an empty string inside the input, which forces the answer to be empty.',
        'Comparing whole strings for equality instead of character by character; that only finds an exact match, not a prefix.'
      ],
      complexity: { time: 'O(total characters)', space: 'O(1) extra beyond the returned prefix' },
      timeChoices: ['O(n * m) where m is the shortest length', 'O(n^2)', 'O(n log n)', 'O(m log n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'string longestCommonPrefix(vector<string>& strs) {\n    // your code here\n}',
        python: 'def longest_common_prefix(strs):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'string longestCommonPrefix(vector<string>& strs) {\n    if (strs.empty()) return "";\n    string prefix = strs[0];\n    for (size_t i = 1; i < strs.size(); i++) {\n        size_t j = 0;\n        while (j < prefix.size() && j < strs[i].size() && prefix[j] == strs[i][j]) j++;\n        prefix = prefix.substr(0, j);\n        if (prefix.empty()) return "";\n    }\n    return prefix;\n}',
        python: 'def longest_common_prefix(strs):\n    if not strs:\n        return \'\'\n    prefix = strs[0]\n    for s in strs[1:]:\n        j = 0\n        while j < len(prefix) and j < len(s) and prefix[j] == s[j]:\n            j += 1\n        prefix = prefix[:j]\n        if not prefix:\n            return \'\'\n    return prefix'
      },
      checks: {
        cpp: [
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Compare the strings position by position.' },
          { re: 'size\\s*\\(\\)|length\\s*\\(\\)|empty\\s*\\(\\)', hint: 'Respect the shortest string so you never read past its end.' },
          { re: 'return', hint: 'Return the common prefix, possibly empty.' }
        ],
        python: [
          { re: 'for\\s+\\w+|while\\s|zip\\s*\\(', hint: 'Compare the strings position by position.' },
          { re: 'len\\s*\\(|min\\s*\\(|zip\\s*\\(|not\\s', hint: 'Respect the shortest string so you never read past its end.' },
          { re: 'return', hint: 'Return the common prefix, possibly empty.' }
        ]
      },
      mcq: [
        { q: 'What justifies stopping the whole scan as soon as the candidate prefix becomes empty?',
          opts: ['The input is sorted', 'The common prefix only shrinks as more strings are folded in, so it can never recover', 'The remaining strings must be identical', 'It is only an optimisation for random input'],
          correct: 1,
          why: 'The common prefix of a set is the intersection of prefixes, which is monotone non-increasing. Once it is empty, no later string can lengthen it.' }
      ]
    },

    /* ---------------------------------------------------------------- */
    /* two-pointers                                                      */
    /* ---------------------------------------------------------------- */

    {
      id: 'nc-valid-palindrome',
      title: 'Valid Palindrome',
      section: 'two-pointers',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given a string s, return true if it reads the same forwards and backwards after converting all letters to lowercase and removing every character that is not alphanumeric.',
      examples: [
        { in: 's = "A man, a plan, a canal: Panama"', out: 'true' },
        { in: 's = "race a car"',                     out: 'false' },
        { in: 's = " "',                              out: 'true' }
      ],
      approach: 'Put one pointer at each end. Advance the left pointer past any non-alphanumeric character and retreat the right pointer the same way, then compare the two characters case-insensitively. On a mismatch return false; otherwise step both inward. When the pointers meet or cross, every mirrored pair matched.',
      keyInsight: 'Palindromy is a statement about mirrored pairs, so converge two pointers from the ends rather than building a filtered copy. The skipping loops keep the O(1) space property.',
      pitfalls: [
        'Not re-checking left < right inside the skip loops, which can run the pointers past each other on a string of only punctuation.',
        'Comparing case-sensitively, or treating digits as non-alphanumeric.',
        'Building a cleaned copy of the string. Correct, but it costs O(n) space when O(1) is available.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(1)'],
      timeAnswer: 1,
      starter: {
        cpp: 'bool isPalindrome(string s) {\n    // your code here\n}',
        python: 'def is_palindrome(s):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool isPalindrome(string s) {\n    int l = 0, r = (int)s.size() - 1;\n    while (l < r) {\n        while (l < r && !isalnum((unsigned char)s[l])) l++;\n        while (l < r && !isalnum((unsigned char)s[r])) r--;\n        if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) return false;\n        l++;\n        r--;\n    }\n    return true;\n}',
        python: 'def is_palindrome(s):\n    l, r = 0, len(s) - 1\n    while l < r:\n        while l < r and not s[l].isalnum():\n            l += 1\n        while l < r and not s[r].isalnum():\n            r -= 1\n        if s[l].lower() != s[r].lower():\n            return False\n        l += 1\n        r -= 1\n    return True'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Converge two pointers from the two ends.' },
          { re: 'isalnum|isalpha|isdigit|remove_if|erase', hint: 'Skip characters that are not alphanumeric.' },
          { re: 'tolower|toupper', hint: 'Compare case-insensitively.' },
          { re: 'return', hint: 'Return the verdict.' }
        ],
        python: [
          { re: 'while\\s|for\\s+\\w+|\\[::-1\\]|reversed', hint: 'Converge two pointers from the two ends (or compare against the reverse).' },
          { re: 'isalnum|isalpha|isdigit|filter|join', hint: 'Skip characters that are not alphanumeric.' },
          { re: 'lower\\s*\\(|upper\\s*\\(|casefold', hint: 'Compare case-insensitively.' },
          { re: 'return', hint: 'Return the verdict.' }
        ]
      },
      mcq: [
        { q: 'Why must the inner skip loops also test that left is still less than right?',
          opts: ['For speed', 'To keep the pointers from running off the string when everything is punctuation', 'To handle uppercase letters', 'It is redundant with the outer loop'],
          correct: 1,
          why: 'On an input like ",,,," no character is alphanumeric, so an unguarded skip loop walks past the end and indexes out of range.' }
      ]
    },

    {
      id: 'nc-two-sum-ii',
      title: 'Two Sum II - Input Array Is Sorted',
      section: 'two-pointers',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given a 1-indexed array of integers sorted in non-decreasing order, find the two numbers that add up to a specific target and return their 1-based indices. There is exactly one solution and you may not use O(n) extra space.',
      examples: [
        { in: 'numbers = [2,7,11,15], target = 9', out: '[1,2]' },
        { in: 'numbers = [2,3,4], target = 6',     out: '[1,3]' },
        { in: 'numbers = [-1,0], target = -1',     out: '[1,2]' }
      ],
      approach: 'Start with one pointer at the smallest element and one at the largest. Their sum is the current candidate. If the sum is too small the only way to increase it is to move the left pointer right; if it is too large the only way to decrease it is to move the right pointer left. When the sum equals the target, report the 1-based indices.',
      keyInsight: 'Sortedness turns the sum into a monotone control: moving left up strictly increases the sum, moving right down strictly decreases it. Each move safely eliminates an entire row or column of the pair space, so the search is linear rather than quadratic.',
      pitfalls: [
        'Moving the wrong pointer, which discards the pair you were looking for.',
        'Returning 0-based indices when the problem is 1-indexed.',
        'Using a hash map. It works but violates the O(1) space constraint that sortedness lets you meet.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'vector<int> twoSum(vector<int>& numbers, int target) {\n    // your code here\n}',
        python: 'def two_sum_sorted(numbers, target):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> twoSum(vector<int>& numbers, int target) {\n    int l = 0, r = (int)numbers.size() - 1;\n    while (l < r) {\n        int sum = numbers[l] + numbers[r];\n        if (sum == target) return {l + 1, r + 1};\n        if (sum < target) l++;\n        else r--;\n    }\n    return {};\n}',
        python: 'def two_sum_sorted(numbers, target):\n    l, r = 0, len(numbers) - 1\n    while l < r:\n        total = numbers[l] + numbers[r]\n        if total == target:\n            return [l + 1, r + 1]\n        if total < target:\n            l += 1\n        else:\n            r -= 1\n    return []'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Loop while the two pointers have not met.' },
          { re: '\\+\\+|--|\\+=\\s*1|-=\\s*1', hint: 'Move exactly one pointer per comparison.' },
          { re: '<|>', hint: 'Compare the current sum against the target to decide which pointer moves.' },
          { re: 'return', hint: 'Return the 1-based indices.' }
        ],
        python: [
          { re: 'while\\s|for\\s+\\w+', hint: 'Loop while the two pointers have not met.' },
          { re: '\\+=\\s*1|-=\\s*1|\\+\\s*1|-\\s*1', hint: 'Move exactly one pointer per comparison.' },
          { re: '<|>', hint: 'Compare the current sum against the target to decide which pointer moves.' },
          { re: 'return', hint: 'Return the 1-based indices.' }
        ]
      },
      mcq: [
        { q: 'The current sum is greater than the target. Why is it safe to discard the right element entirely?',
          opts: ['It is the largest value', 'Paired with anything at or right of the left pointer it can only overshoot further, so no valid pair uses it', 'The array might contain duplicates', 'It is only safe if all values are positive'],
          correct: 1,
          why: 'The left pointer is at the smallest remaining value. If even that pairing overshoots, every other surviving partner is at least as large, so the right element cannot be in the answer.' }
      ]
    },

    {
      id: 'nc-three-sum',
      title: '3Sum',
      section: 'two-pointers',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] with distinct indices that sum to zero. The solution set must not contain duplicate triplets.',
      examples: [
        { in: 'nums = [-1,0,1,2,-1,-4]', out: '[[-1,-1,2],[-1,0,1]]' },
        { in: 'nums = [0,1,1]',          out: '[]' },
        { in: 'nums = [0,0,0,0]',        out: '[[0,0,0]]' }
      ],
      approach: 'Sort the array. Fix the first element with an outer loop, then solve the remaining two-sum-to--nums[i] on the sorted suffix with converging pointers. Skip a fixed element that equals its predecessor, and after recording a hit advance the left pointer past its duplicates. You may also break out entirely once the fixed element is positive, since a sorted suffix of positives cannot reach zero.',
      keyInsight: 'Sorting is what buys both things you need: the two-pointer sweep inside the loop, and duplicate suppression by simple neighbour comparison. Deduplicating with a set of triplets works but sorting makes it structural instead of accidental.',
      pitfalls: [
        'Emitting duplicate triplets because you skipped duplicates only for the fixed element and not for the moving pointers.',
        'Skipping duplicates before recording a hit rather than after, which drops legitimate triplets such as [0,0,0].',
        'Continuing when nums[i] > 0. Correct but wasteful, since the sorted remainder is all positive.',
        'Integer overflow when summing three large values in C++; widen to long long if the constraints allow it.'
      ],
      complexity: { time: 'O(n^2)', space: 'O(1) extra beyond the output and the sort' },
      timeChoices: ['O(n log n)', 'O(n^2)', 'O(n^3)', 'O(n^2 log n)'],
      timeAnswer: 1,
      starter: {
        cpp: 'vector<vector<int>> threeSum(vector<int>& nums) {\n    // your code here\n}',
        python: 'def three_sum(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<int>> threeSum(vector<int>& nums) {\n    sort(nums.begin(), nums.end());\n    vector<vector<int>> res;\n    int n = nums.size();\n    for (int i = 0; i + 2 < n; i++) {\n        if (nums[i] > 0) break;\n        if (i > 0 && nums[i] == nums[i - 1]) continue;\n        int l = i + 1, r = n - 1;\n        while (l < r) {\n            int sum = nums[i] + nums[l] + nums[r];\n            if (sum < 0) {\n                l++;\n            } else if (sum > 0) {\n                r--;\n            } else {\n                res.push_back({nums[i], nums[l], nums[r]});\n                l++;\n                while (l < r && nums[l] == nums[l - 1]) l++;\n                r--;\n            }\n        }\n    }\n    return res;\n}',
        python: 'def three_sum(nums):\n    nums.sort()\n    res = []\n    n = len(nums)\n    for i in range(n - 2):\n        if nums[i] > 0:\n            break\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        l, r = i + 1, n - 1\n        while l < r:\n            total = nums[i] + nums[l] + nums[r]\n            if total < 0:\n                l += 1\n            elif total > 0:\n                r -= 1\n            else:\n                res.append([nums[i], nums[l], nums[r]])\n                l += 1\n                while l < r and nums[l] == nums[l - 1]:\n                    l += 1\n                r -= 1\n    return res'
      },
      checks: {
        cpp: [
          { re: 'sort\\s*\\(', hint: 'Sort first so the inner search can use two pointers.' },
          { re: 'for\\s*\\(', hint: 'Fix one element with an outer loop.' },
          { re: 'while\\s*\\(', hint: 'Converge two pointers over the suffix.' },
          { re: '==\\s*nums|!=\\s*nums|set\\s*<|unique', hint: 'Suppress duplicate triplets, by neighbour comparison or by a set.' }
        ],
        python: [
          { re: 'sort\\s*\\(|sorted\\s*\\(', hint: 'Sort first so the inner search can use two pointers.' },
          { re: 'for\\s+\\w+', hint: 'Fix one element with an outer loop.' },
          { re: 'while\\s', hint: 'Converge two pointers over the suffix.' },
          { re: '==\\s*nums|!=\\s*nums|set\\s*\\(|tuple\\s*\\(', hint: 'Suppress duplicate triplets, by neighbour comparison or by a set.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'for[\\s\\S]{0,200}for[\\s\\S]{0,200}for\\s*\\(', hint: 'Three nested loops is the O(n^3) brute force. Sort, fix one element, then sweep two pointers.' }],
        python: [{ re: 'for[\\s\\S]{0,200}\\n\\s+for[\\s\\S]{0,200}\\n\\s+for\\s', hint: 'Three nested loops is the O(n^3) brute force. Sort, fix one element, then sweep two pointers.' }]
      },
      mcq: [
        { q: 'Why is the duplicate skip for the left pointer done after recording a triplet, not before?',
          opts: ['It is faster that way', 'Skipping first would drop valid triplets such as [0,0,0]', 'It keeps the array sorted', 'Both orders are equivalent'],
          correct: 1,
          why: 'The first occurrence of a repeated value is a legitimate member of the triplet. You must record it, then skip only the extra copies that would reproduce the same triplet.' }
      ]
    },

    {
      id: 'nc-container-most-water',
      title: 'Container With Most Water',
      section: 'two-pointers',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an array height where height[i] is the height of a vertical line at position i, pick two lines that together with the x-axis form a container holding the most water. Return that maximum area.',
      examples: [
        { in: 'height = [1,8,6,2,5,4,8,3,7]', out: '49' },
        { in: 'height = [1,1]',               out: '1' },
        { in: 'height = [4,3,2,1,4]',         out: '16' }
      ],
      approach: 'Place pointers at both ends, which maximises the width. The area is min(height[l], height[r]) * (r - l). Record it, then move the pointer at the shorter line inward. Repeat until the pointers meet, keeping the best area seen.',
      keyInsight: 'Moving either pointer always shrinks the width by one, so a move can only pay off by increasing the height cap. That cap is set by the shorter line, so keeping the shorter line can never help: every pair using it is already dominated by the pair you just measured.',
      pitfalls: [
        'Moving the taller line, or moving both. Either can skip the optimal pair.',
        'Using the sum or the maximum of the two heights instead of the minimum. Water spills over the shorter side.',
        'Assuming the answer involves the two tallest lines. Width matters just as much.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'int maxArea(vector<int>& height) {\n    // your code here\n}',
        python: 'def max_area(height):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int maxArea(vector<int>& height) {\n    int l = 0, r = (int)height.size() - 1, best = 0;\n    while (l < r) {\n        int h = min(height[l], height[r]);\n        best = max(best, h * (r - l));\n        if (height[l] < height[r]) l++;\n        else r--;\n    }\n    return best;\n}',
        python: 'def max_area(height):\n    l, r = 0, len(height) - 1\n    best = 0\n    while l < r:\n        best = max(best, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]:\n            l += 1\n        else:\n            r -= 1\n    return best'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Converge two pointers from the ends.' },
          { re: 'min\\s*\\(|\\?\\s*|<|>', hint: 'The usable height is the smaller of the two lines.' },
          { re: 'max\\s*\\(|>\\s*best|>\\s*\\w+', hint: 'Track the best area seen.' },
          { re: 'return', hint: 'Return the maximum area.' }
        ],
        python: [
          { re: 'while\\s|for\\s+\\w+', hint: 'Converge two pointers from the ends.' },
          { re: 'min\\s*\\(|<|>', hint: 'The usable height is the smaller of the two lines.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Track the best area seen.' },
          { re: 'return', hint: 'Return the maximum area.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'for[\\s\\S]{0,140}for\\s*\\(', hint: 'Checking every pair is the O(n^2) brute force. One converging sweep is enough.' }],
        python: [{ re: 'for[\\s\\S]{0,140}\\n\\s+for\\s', hint: 'Checking every pair is the O(n^2) brute force. One converging sweep is enough.' }]
      },
      mcq: [
        { q: 'Why can the shorter line be discarded when the pointers move?',
          opts: ['It is never part of any container', 'Every remaining pair using it has smaller width and no greater height cap, so it is dominated', 'Because the array is sorted', 'Because water always flows left'],
          correct: 1,
          why: 'The pair just measured gave the shorter line its widest possible partner. Any other partner is closer, and the height cap is still bounded by that same short line, so the area cannot improve.' }
      ]
    },

    {
      id: 'nc-trapping-rain-water',
      title: 'Trapping Rain Water',
      section: 'two-pointers',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much rain water can be trapped after it rains.',
      examples: [
        { in: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', out: '6' },
        { in: 'height = [4,2,0,3,2,5]',             out: '9' },
        { in: 'height = [3,2,1]',                   out: '0' }
      ],
      approach: 'Water above column i is min(maxLeft(i), maxRight(i)) - height[i]. Rather than precompute both arrays, converge two pointers while carrying running leftMax and rightMax. At each step operate on the side whose current bar is shorter: that side is the binding constraint, so its running max is already the true limiting wall and the contribution can be committed immediately.',
      keyInsight: 'You never need the exact value of the far wall, only the guarantee that it is at least as tall as the near one. When height[l] < height[r], some wall on the right is at least height[r] > height[l], so leftMax alone determines the water at l.',
      pitfalls: [
        'Updating the running maximum after adding water, which can produce a negative contribution.',
        'Advancing the taller side, which breaks the guarantee that the far wall dominates.',
        'Adding height[i] itself into the total. Only the air above a bar holds water.',
        'Assuming a strict inequality is required. Using height[l] <= height[r] also works; the tie is handled either way because the contribution is zero at the wall.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n) time and O(n) space', 'O(n) time and O(1) space', 'O(n log n) time', 'O(n^2) time'],
      timeAnswer: 1,
      starter: {
        cpp: 'int trap(vector<int>& height) {\n    // your code here\n}',
        python: 'def trap(height):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int trap(vector<int>& height) {\n    int l = 0, r = (int)height.size() - 1;\n    int leftMax = 0, rightMax = 0, total = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            leftMax = max(leftMax, height[l]);\n            total += leftMax - height[l];\n            l++;\n        } else {\n            rightMax = max(rightMax, height[r]);\n            total += rightMax - height[r];\n            r--;\n        }\n    }\n    return total;\n}',
        python: 'def trap(height):\n    if not height:\n        return 0\n    l, r = 0, len(height) - 1\n    left_max = 0\n    right_max = 0\n    total = 0\n    while l < r:\n        if height[l] < height[r]:\n            left_max = max(left_max, height[l])\n            total += left_max - height[l]\n            l += 1\n        else:\n            right_max = max(right_max, height[r])\n            total += right_max - height[r]\n            r -= 1\n    return total'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Sweep the elevation map.' },
          { re: 'max\\s*\\(|>\\s*\\w+Max|stack|priority_queue', hint: 'Track the tallest wall seen so far on each side (or use a monotonic stack).' },
          { re: '\\+=|\\+\\s*=', hint: 'Accumulate the trapped water.' },
          { re: 'return', hint: 'Return the total volume.' }
        ],
        python: [
          { re: 'while\\s|for\\s+\\w+', hint: 'Sweep the elevation map.' },
          { re: 'max\\s*\\(|stack|append', hint: 'Track the tallest wall seen so far on each side (or use a monotonic stack).' },
          { re: '\\+=', hint: 'Accumulate the trapped water.' },
          { re: 'return', hint: 'Return the total volume.' }
        ]
      },
      mcq: [
        { q: 'When height[l] < height[r], why is leftMax alone enough to settle the water above index l?',
          opts: ['Because leftMax is always the global maximum', 'Because height[r] guarantees a right wall at least as tall as height[l], so the min is decided on the left', 'Because water only flows left', 'Because rightMax has not been computed yet'],
          correct: 1,
          why: 'The formula needs min(leftMax, rightMax). Since rightMax is at least height[r] > height[l], the right side cannot be the binding constraint at l, so the answer is leftMax - height[l].' }
      ]
    },

    {
      id: 'nc-remove-duplicates-sorted',
      title: 'Remove Duplicates from Sorted Array',
      section: 'two-pointers',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given a sorted integer array nums, remove the duplicates in place so that each unique value appears once, keeping the relative order. Return the number k of unique elements; the first k slots of nums must hold them.',
      examples: [
        { in: 'nums = [1,1,2]',           out: '2, nums begins [1,2]' },
        { in: 'nums = [0,0,1,1,1,2,2,3,3,4]', out: '5, nums begins [0,1,2,3,4]' },
        { in: 'nums = [7]',               out: '1, nums begins [7]' }
      ],
      approach: 'Use a slow write pointer and a fast read pointer. The slow pointer marks the next free slot in the compacted prefix. Sweep the fast pointer forward; whenever it finds a value different from the last one written, copy it to the slow slot and advance the slow pointer. Return the slow pointer as the count.',
      keyInsight: 'Fast/slow is the general in-place compaction pattern: the fast pointer reads the original array, the slow pointer defines the output prefix, and the slow pointer can never overtake the fast one, so no unread data is ever clobbered.',
      pitfalls: [
        'Comparing nums[i] to nums[i - 1] in the original array instead of to the last written value; both work here only because the array is sorted.',
        'Forgetting the empty array, where the answer is 0.',
        'Erasing elements from the middle of the container, which is O(n) per removal and O(n^2) overall.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(k) where k is the number of unique values'],
      timeAnswer: 0,
      starter: {
        cpp: 'int removeDuplicates(vector<int>& nums) {\n    // your code here\n}',
        python: 'def remove_duplicates(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int removeDuplicates(vector<int>& nums) {\n    if (nums.empty()) return 0;\n    int k = 1;\n    for (size_t i = 1; i < nums.size(); i++) {\n        if (nums[i] != nums[k - 1]) {\n            nums[k] = nums[i];\n            k++;\n        }\n    }\n    return k;\n}',
        python: 'def remove_duplicates(nums):\n    if not nums:\n        return 0\n    k = 1\n    for i in range(1, len(nums)):\n        if nums[i] != nums[k - 1]:\n            nums[k] = nums[i]\n            k += 1\n    return k'
      },
      checks: {
        cpp: [
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Sweep the array with the fast pointer.' },
          { re: '!=|==', hint: 'Compare the current value with the last value kept.' },
          { re: 'nums\\s*\\[[^\\]]*\\]\\s*=|unique\\s*\\(', hint: 'Write kept values into the front of the array.' },
          { re: 'return', hint: 'Return the count of unique values.' }
        ],
        python: [
          { re: 'for\\s+\\w+|while\\s', hint: 'Sweep the array with the fast pointer.' },
          { re: '!=|==', hint: 'Compare the current value with the last value kept.' },
          { re: 'nums\\s*\\[[^\\]]*\\]\\s*=', hint: 'Write kept values into the front of the list.' },
          { re: 'return', hint: 'Return the count of unique values.' }
        ]
      },
      mcq: [
        { q: 'Why can the slow write pointer never destroy data the fast pointer still needs?',
          opts: ['Because the array is sorted', 'Because slow starts at 0', 'Because slow advances at most once per fast step, so it always trails or equals fast', 'Because duplicates are adjacent'],
          correct: 2,
          why: 'Each iteration advances fast by one and slow by zero or one, so slow <= fast is an invariant. Writing at slow only ever overwrites a slot the fast pointer has already read.' }
      ]
    },

    {
      id: 'nc-move-zeroes',
      title: 'Move Zeroes',
      section: 'two-pointers',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given an integer array nums, move all the zeroes to the end while keeping the relative order of the non-zero elements. Do it in place without making a copy of the array.',
      examples: [
        { in: 'nums = [0,1,0,3,12]', out: '[1,3,12,0,0]' },
        { in: 'nums = [0]',          out: '[0]' },
        { in: 'nums = [1,2,3]',      out: '[1,2,3]' }
      ],
      approach: 'Keep a slow pointer at the next slot that should receive a non-zero value. Sweep a fast pointer across the array; on every non-zero value, swap it with the slot at the slow pointer and advance the slow pointer. Because everything between slow and fast is zero, the swap simply pushes a zero rightwards and the non-zero order is preserved.',
      keyInsight: 'Swapping instead of writing gives you the zero-filling tail for free, and the invariant "everything in [slow, fast) is zero" is exactly what makes the swap order-preserving.',
      pitfalls: [
        'Swapping every element rather than only the non-zero ones, which reorders the non-zero values.',
        'Copying non-zeroes forward and then filling the tail with zeroes is also correct, but forgetting the fill step leaves stale values behind.',
        'Sorting or partitioning with an unstable scheme, which loses the required relative order.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(z) where z is the number of zeroes'],
      timeAnswer: 2,
      starter: {
        cpp: 'void moveZeroes(vector<int>& nums) {\n    // your code here\n}',
        python: 'def move_zeroes(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'void moveZeroes(vector<int>& nums) {\n    int k = 0;\n    for (size_t i = 0; i < nums.size(); i++) {\n        if (nums[i] != 0) swap(nums[k++], nums[i]);\n    }\n}',
        python: 'def move_zeroes(nums):\n    k = 0\n    for i in range(len(nums)):\n        if nums[i] != 0:\n            nums[k], nums[i] = nums[i], nums[k]\n            k += 1\n    return nums'
      },
      checks: {
        cpp: [
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'One sweep with a fast pointer is enough.' },
          { re: '!=\\s*0|==\\s*0', hint: 'Test whether the current value is zero.' },
          { re: 'swap\\s*\\(|nums\\s*\\[[^\\]]*\\]\\s*=|stable_partition', hint: 'Move non-zero values to the front, by swapping or by writing.' }
        ],
        python: [
          { re: 'for\\s+\\w+|while\\s', hint: 'One sweep with a fast pointer is enough.' },
          { re: '!=\\s*0|==\\s*0', hint: 'Test whether the current value is zero.' },
          { re: 'nums\\s*\\[[^\\]]*\\]\\s*=|nums\\s*\\[[^\\]]*\\]\\s*,', hint: 'Move non-zero values to the front, by swapping or by writing.' }
        ]
      },
      mcq: [
        { q: 'What invariant makes the swap safe for preserving the order of non-zero values?',
          opts: ['The array is sorted', 'Every slot between the write pointer and the read pointer holds a zero', 'The write pointer is always even', 'There is at most one zero'],
          correct: 1,
          why: 'Because the gap contains only zeroes, swapping the current non-zero into the write slot exchanges it with a zero. No non-zero element ever jumps over another.' }
      ]
    },

    {
      id: 'nc-sort-colors',
      title: 'Sort Colors',
      section: 'two-pointers',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an array nums with n objects coloured red, white or blue, represented by the integers 0, 1 and 2, sort them in place so that objects of the same colour are adjacent and ordered 0, 1, 2. You must not use a library sort, and one pass with constant extra space is expected.',
      examples: [
        { in: 'nums = [2,0,2,1,1,0]', out: '[0,0,1,1,2,2]' },
        { in: 'nums = [2,0,1]',       out: '[0,1,2]' },
        { in: 'nums = [0]',           out: '[0]' }
      ],
      approach: 'Dutch national flag. Maintain three regions with pointers low, mid and high: everything before low is 0, everything in [low, mid) is 1, everything after high is 2, and [mid, high] is unexamined. Look at nums[mid]. A 0 swaps into the low region and advances both low and mid. A 2 swaps down from high and only decrements high. A 1 is already in place, so just advance mid. Stop when mid passes high.',
      keyInsight: 'The asymmetry is the whole trick: after swapping with high you have not yet examined the value that arrived at mid, so mid must not advance. After swapping with low you have, because low <= mid means the incoming value is a known 1.',
      pitfalls: [
        'Advancing mid after swapping with high, which skips an unexamined value.',
        'Looping while mid < high instead of mid <= high, which leaves the final cell unprocessed.',
        'Counting occurrences and rewriting the array. That is correct and simple, but it is two passes, not one.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n log n)', 'O(n) in one pass', 'O(n^2)', 'O(3n) which is not linear'],
      timeAnswer: 1,
      starter: {
        cpp: 'void sortColors(vector<int>& nums) {\n    // your code here\n}',
        python: 'def sort_colors(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'void sortColors(vector<int>& nums) {\n    int low = 0, mid = 0, high = (int)nums.size() - 1;\n    while (mid <= high) {\n        if (nums[mid] == 0) {\n            swap(nums[low], nums[mid]);\n            low++;\n            mid++;\n        } else if (nums[mid] == 2) {\n            swap(nums[mid], nums[high]);\n            high--;\n        } else {\n            mid++;\n        }\n    }\n}',
        python: 'def sort_colors(nums):\n    low, mid, high = 0, 0, len(nums) - 1\n    while mid <= high:\n        if nums[mid] == 0:\n            nums[low], nums[mid] = nums[mid], nums[low]\n            low += 1\n            mid += 1\n        elif nums[mid] == 2:\n            nums[mid], nums[high] = nums[high], nums[mid]\n            high -= 1\n        else:\n            mid += 1\n    return nums'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Sweep the array once.' },
          { re: '==\\s*0|==\\s*2|==\\s*1', hint: 'Branch on which of the three values you are looking at.' },
          { re: 'swap\\s*\\(|nums\\s*\\[[^\\]]*\\]\\s*=', hint: 'Move values into their region, by swapping or by rewriting from counts.' }
        ],
        python: [
          { re: 'while\\s|for\\s+\\w+', hint: 'Sweep the array once.' },
          { re: '==\\s*0|==\\s*2|==\\s*1', hint: 'Branch on which of the three values you are looking at.' },
          { re: 'nums\\s*\\[[^\\]]*\\]\\s*=|nums\\s*\\[[^\\]]*\\]\\s*,', hint: 'Move values into their region, by swapping or by rewriting from counts.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'sort\\s*\\(\\s*nums', hint: 'A library sort is disallowed here and is O(n log n) anyway.' }],
        python: [{ re: 'nums\\.sort\\s*\\(|sorted\\s*\\(\\s*nums', hint: 'A library sort is disallowed here and is O(n log n) anyway.' }]
      },
      mcq: [
        { q: 'After swapping nums[mid] with nums[high], why must mid stay put?',
          opts: ['To keep the loop bounded', 'Because the value that just arrived at mid came from the unexamined region and could be anything', 'Because high decreased', 'It may advance; both versions are correct'],
          correct: 1,
          why: 'high borders the unexamined zone, so the incoming value has never been classified. Advancing mid would leave a 0 or a 2 stranded in the middle region.' }
      ]
    },

    /* ---------------------------------------------------------------- */
    /* sliding-window                                                    */
    /* ---------------------------------------------------------------- */

    {
      id: 'nc-best-time-buy-sell-stock',
      title: 'Best Time to Buy and Sell Stock',
      section: 'sliding-window',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'You are given an array prices where prices[i] is the price of a stock on day i. Choose one day to buy and a later day to sell to maximise your profit. Return the maximum profit, or 0 if no profitable transaction exists.',
      examples: [
        { in: 'prices = [7,1,5,3,6,4]', out: '5' },
        { in: 'prices = [7,6,4,3,1]',   out: '0' },
        { in: 'prices = [2,4,1]',       out: '2' }
      ],
      approach: 'Sweep the prices once carrying the minimum price seen so far. At each day, the best sale today is today minus that running minimum, so update the answer with it and then fold today into the running minimum. This is a degenerate sliding window whose left edge is the cheapest day so far and whose right edge is today.',
      keyInsight: 'You never need to consider buy days other than the running minimum, because for any sell day a cheaper earlier buy is strictly better. That collapses an O(n^2) pair search into one scalar carried across a single pass.',
      pitfalls: [
        'Returning max(prices) - min(prices) without checking the order. The minimum may occur after the maximum.',
        'Allowing a same-day or negative-profit transaction. The floor of the answer is 0.',
        'Initialising the running minimum to 0 rather than to the first price or to infinity.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int maxProfit(vector<int>& prices) {\n    // your code here\n}',
        python: 'def max_profit(prices):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int maxProfit(vector<int>& prices) {\n    int best = 0, minPrice = INT_MAX;\n    for (int p : prices) {\n        minPrice = min(minPrice, p);\n        best = max(best, p - minPrice);\n    }\n    return best;\n}',
        python: 'def max_profit(prices):\n    best = 0\n    min_price = float(\'inf\')\n    for p in prices:\n        if p < min_price:\n            min_price = p\n        elif p - min_price > best:\n            best = p - min_price\n    return best'
      },
      checks: {
        cpp: [
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'One pass over the prices.' },
          { re: 'min\\s*\\(|<\\s*\\w+', hint: 'Track the cheapest price seen so far.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Track the best profit seen so far.' },
          { re: 'return', hint: 'Return the maximum profit.' }
        ],
        python: [
          { re: 'for\\s+\\w+|while\\s', hint: 'One pass over the prices.' },
          { re: 'min\\s*\\(|<\\s*\\w+', hint: 'Track the cheapest price seen so far.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Track the best profit seen so far.' },
          { re: 'return', hint: 'Return the maximum profit.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'for[\\s\\S]{0,140}for\\s*\\(', hint: 'Trying every buy/sell pair is the O(n^2) brute force; one pass with a running minimum suffices.' }],
        python: [{ re: 'for[\\s\\S]{0,140}\\n\\s+for\\s', hint: 'Trying every buy/sell pair is the O(n^2) brute force; one pass with a running minimum suffices.' }]
      },
      mcq: [
        { q: 'Why is it enough to consider only the running minimum as the buy day?',
          opts: ['Prices are sorted', 'For any sell day, an earlier cheaper buy dominates every other earlier buy', 'The minimum is always on day 0', 'Because profit cannot be negative'],
          correct: 1,
          why: 'Profit is sell minus buy with the buy fixed to be earlier. Lowering the buy price never hurts, so the cheapest day so far is the only candidate worth keeping.' }
      ]
    },

    {
      id: 'nc-longest-substring-no-repeat',
      title: 'Longest Substring Without Repeating Characters',
      section: 'sliding-window',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given a string s, return the length of the longest substring that contains no repeated characters.',
      examples: [
        { in: 's = "abcabcbb"', out: '3' },
        { in: 's = "bbbbb"',    out: '1' },
        { in: 's = "pwwkew"',   out: '3' }
      ],
      approach: 'Slide a window whose invariant is "all characters inside are distinct". Extend the right edge one character at a time, recording the last index at which each character was seen. If the incoming character was last seen at or after the left edge, jump the left edge to one past that occurrence, which restores the invariant in a single step. Record the window length after each extension.',
      keyInsight: 'The left edge never needs to move backwards, so it advances at most n times overall and the whole scan is linear. Storing last-seen indices lets you repair a violation with a jump instead of a shrink loop.',
      pitfalls: [
        'Moving the left edge to last[c] instead of last[c] + 1, which leaves the duplicate inside.',
        'Ignoring the "at or after the left edge" test, which lets a stale index outside the window drag the left edge backwards and produce an over-long answer.',
        'Measuring the window as right - left instead of right - left + 1.'
      ],
      complexity: { time: 'O(n)', space: 'O(k) for the alphabet size' },
      timeChoices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(n * k)'],
      timeAnswer: 2,
      starter: {
        cpp: 'int lengthOfLongestSubstring(string s) {\n    // your code here\n}',
        python: 'def length_of_longest_substring(s):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int lengthOfLongestSubstring(string s) {\n    vector<int> last(128, -1);\n    int best = 0, left = 0;\n    for (int r = 0; r < (int)s.size(); r++) {\n        int c = (unsigned char)s[r];\n        if (last[c] >= left) left = last[c] + 1;\n        last[c] = r;\n        best = max(best, r - left + 1);\n    }\n    return best;\n}',
        python: 'def length_of_longest_substring(s):\n    last = {}\n    best = 0\n    left = 0\n    for r, c in enumerate(s):\n        if c in last and last[c] >= left:\n            left = last[c] + 1\n        last[c] = r\n        best = max(best, r - left + 1)\n    return best'
      },
      checks: {
        cpp: [
          { re: 'unordered_set|unordered_map|set\\s*<|map\\s*<|vector\\s*<\\s*int|int\\s+\\w+\\s*\\[', hint: 'Track which characters are in the window, or where each was last seen.' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Extend the right edge across the string.' },
          { re: '\\+\\s*1|\\+\\+|erase|while', hint: 'Advance the left edge to restore the no-duplicate invariant.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Record the best window length.' }
        ],
        python: [
          { re: 'set\\s*\\(|\\{\\s*\\}|dict\\s*\\(|defaultdict', hint: 'Track which characters are in the window, or where each was last seen.' },
          { re: 'for\\s+\\w+|while\\s', hint: 'Extend the right edge across the string.' },
          { re: '\\+\\s*1|\\+=\\s*1|remove|discard|del\\s', hint: 'Advance the left edge to restore the no-duplicate invariant.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Record the best window length.' }
        ]
      },
      mcq: [
        { q: 'Why is the test last[c] >= left needed instead of simply jumping to last[c] + 1?',
          opts: ['It handles the empty string', 'A last-seen index can lie left of the window, and jumping to it would move the left edge backwards', 'It avoids hash collisions', 'It is only a performance optimisation'],
          correct: 1,
          why: 'The map keeps indices forever, including for characters already slid out of the window. Without the guard, "abba" would move the left edge back and report a window containing a duplicate.' }
      ]
    },

    {
      id: 'nc-longest-repeating-char-replacement',
      title: 'Longest Repeating Character Replacement',
      section: 'sliding-window',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'You are given a string s of uppercase letters and an integer k. You may change at most k characters to any other uppercase letter. Return the length of the longest substring that can be made to contain a single repeated letter.',
      examples: [
        { in: 's = "ABAB", k = 2',   out: '4' },
        { in: 's = "AABABBA", k = 1', out: '4' },
        { in: 's = "AAAA", k = 0',   out: '4' }
      ],
      approach: 'Slide a window carrying a count of each letter inside it. A window is feasible when windowLength minus the count of its most frequent letter is at most k, because those are exactly the characters you would have to overwrite. Extend the right edge, update the counts, and while the window is infeasible advance the left edge and decrement its count. The answer is the largest feasible window seen.',
      keyInsight: 'The feasibility test compares the window against its own majority letter, so the window never has to guess which letter to keep. A neat consequence: the running maximum count never needs to be decreased, because a shorter window with a smaller majority can never beat the best answer already recorded.',
      pitfalls: [
        'Recomputing the maximum count by scanning all 26 letters inside the shrink loop, which is correct but adds a constant factor most interviewers will question.',
        'Forgetting to decrement the count of the character leaving on the left.',
        'Thinking the window always holds a valid string. It holds a string that is *convertible* within k edits, which is what is being maximised.'
      ],
      complexity: { time: 'O(n)', space: 'O(1) for a 26-letter alphabet' },
      timeChoices: ['O(n)', 'O(26n) which is not linear', 'O(n log n)', 'O(n^2)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int characterReplacement(string s, int k) {\n    // your code here\n}',
        python: 'def character_replacement(s, k):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int characterReplacement(string s, int k) {\n    vector<int> cnt(26, 0);\n    int left = 0, maxCount = 0, best = 0;\n    for (int r = 0; r < (int)s.size(); r++) {\n        maxCount = max(maxCount, ++cnt[s[r] - \'A\']);\n        while ((r - left + 1) - maxCount > k) {\n            cnt[s[left] - \'A\']--;\n            left++;\n        }\n        best = max(best, r - left + 1);\n    }\n    return best;\n}',
        python: 'def character_replacement(s, k):\n    count = {}\n    left = 0\n    max_count = 0\n    best = 0\n    for r in range(len(s)):\n        count[s[r]] = count.get(s[r], 0) + 1\n        max_count = max(max_count, count[s[r]])\n        while (r - left + 1) - max_count > k:\n            count[s[left]] -= 1\n            left += 1\n        best = max(best, r - left + 1)\n    return best'
      },
      checks: {
        cpp: [
          { re: 'vector\\s*<\\s*int|int\\s+\\w+\\s*\\[|unordered_map|map\\s*<|array\\s*<', hint: 'Count the letters inside the window.' },
          { re: 'for\\s*\\(', hint: 'Extend the right edge across the string.' },
          { re: 'while\\s*\\(|if\\s*\\(', hint: 'Shrink from the left while the window needs more than k replacements.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Track the most frequent letter and the best window length.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\s*\\(|Counter|defaultdict|\\[\\s*0\\s*\\]\\s*\\*', hint: 'Count the letters inside the window.' },
          { re: 'for\\s+\\w+', hint: 'Extend the right edge across the string.' },
          { re: 'while\\s|if\\s', hint: 'Shrink from the left while the window needs more than k replacements.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Track the most frequent letter and the best window length.' }
        ]
      },
      mcq: [
        { q: 'What quantity does the window keep at or below k?',
          opts: ['The number of distinct letters', 'The count of the most frequent letter', 'The window length minus the count of its most frequent letter', 'The number of shrink steps'],
          correct: 2,
          why: 'You keep the majority letter and overwrite everything else, so the edits needed are exactly length minus the majority count. Keeping that at most k is the invariant.' }
      ]
    },

    {
      id: 'nc-permutation-in-string',
      title: 'Permutation in String',
      section: 'sliding-window',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given two strings s1 and s2, return true if s2 contains a permutation of s1 as a contiguous substring.',
      examples: [
        { in: 's1 = "ab", s2 = "eidbaooo"',  out: 'true' },
        { in: 's1 = "ab", s2 = "eidboaoo"',  out: 'false' },
        { in: 's1 = "adc", s2 = "dcda"',     out: 'true' }
      ],
      approach: 'A permutation of s1 is any substring of length len(s1) with exactly the same letter counts. So slide a fixed-width window of that length across s2, adding the entering character and removing the leaving one, and compare the window count vector against the target count vector after each step. For a 26-letter alphabet that comparison is O(1).',
      keyInsight: 'This is a fixed-size window, so there is no shrink loop: every extension is paired with exactly one eviction and the length is constant by construction. Recognising that "permutation" means "equal frequency vector" is what removes the need to enumerate permutations.',
      pitfalls: [
        'Generating permutations of s1. There are len! of them and the approach dies immediately.',
        'Evicting before the window is full, or forgetting to evict once it is, which lets the window grow without bound.',
        'Comparing sorted substrings at every position, which is O(n * m log m) rather than O(n).',
        'Missing the early exit when s1 is longer than s2.'
      ],
      complexity: { time: 'O(len(s2))', space: 'O(1) for a fixed alphabet' },
      timeChoices: ['O(len(s1)!)', 'O(len(s2) * len(s1))', 'O(len(s2))', 'O(len(s2) log len(s2))'],
      timeAnswer: 2,
      starter: {
        cpp: 'bool checkInclusion(string s1, string s2) {\n    // your code here\n}',
        python: 'def check_inclusion(s1, s2):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool checkInclusion(string s1, string s2) {\n    int m = s1.size(), n = s2.size();\n    if (m > n) return false;\n    vector<int> need(26, 0), win(26, 0);\n    for (char c : s1) need[c - \'a\']++;\n    for (int i = 0; i < n; i++) {\n        win[s2[i] - \'a\']++;\n        if (i >= m) win[s2[i - m] - \'a\']--;\n        if (win == need) return true;\n    }\n    return false;\n}',
        python: 'def check_inclusion(s1, s2):\n    m, n = len(s1), len(s2)\n    if m > n:\n        return False\n    need = [0] * 26\n    win = [0] * 26\n    for c in s1:\n        need[ord(c) - 97] += 1\n    for i in range(n):\n        win[ord(s2[i]) - 97] += 1\n        if i >= m:\n            win[ord(s2[i - m]) - 97] -= 1\n        if win == need:\n            return True\n    return False'
      },
      checks: {
        cpp: [
          { re: 'vector\\s*<\\s*int|int\\s+\\w+\\s*\\[|array\\s*<|unordered_map|map\\s*<', hint: 'Build a frequency vector for s1 and one for the window.' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Slide the fixed-width window across s2.' },
          { re: '--|-=\\s*1|erase', hint: 'Evict the character leaving the window on the left.' },
          { re: '==|equal|memcmp', hint: 'Compare the window frequencies against the target.' }
        ],
        python: [
          { re: '\\[\\s*0\\s*\\]\\s*\\*|Counter|\\{\\s*\\}|dict\\s*\\(|defaultdict', hint: 'Build a frequency vector for s1 and one for the window.' },
          { re: 'for\\s+\\w+|while\\s', hint: 'Slide the fixed-width window across s2.' },
          { re: '-=\\s*1|del\\s|pop\\s*\\(', hint: 'Evict the character leaving the window on the left.' },
          { re: '==', hint: 'Compare the window frequencies against the target.' }
        ]
      },
      mcq: [
        { q: 'Why does this window need no shrink loop, unlike the longest-substring problems?',
          opts: ['The alphabet is small', 'The window width is fixed, so each entry is paired with exactly one eviction', 'The answer is a boolean', 'Because s1 is shorter than s2'],
          correct: 1,
          why: 'Fixed-width windows keep their invariant by construction. Variable-width windows must shrink because the size itself is what is being optimised or constrained.' }
      ]
    },

    {
      id: 'nc-minimum-window-substring',
      title: 'Minimum Window Substring',
      section: 'sliding-window',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'Given strings s and t, return the shortest substring of s that contains every character of t including multiplicities. If no such substring exists, return the empty string.',
      examples: [
        { in: 's = "ADOBECODEBANC", t = "ABC"', out: '"BANC"' },
        { in: 's = "a", t = "a"',               out: '"a"' },
        { in: 's = "a", t = "aa"',              out: '""' }
      ],
      approach: 'Load the required counts of t into a map and set missing = len(t). Extend the right edge: decrement the entering character in the map, and if its count was still positive before the decrement then that character satisfied a real requirement, so decrement missing. When missing hits zero the window is valid, so shrink from the left while it stays valid, recording the best window each time, and stop shrinking when removing a character pushes its count back above zero, which raises missing again.',
      keyInsight: 'Let counts go negative for surplus characters. The sign is then the bookkeeping: a positive count means still needed, zero or below means satisfied, so "was it positive before I touched it?" is exactly the test for whether a requirement changed state. That reduces validity to a single integer.',
      pitfalls: [
        'Recomputing validity by comparing whole maps on every step, which multiplies the cost by the alphabet size.',
        'Recording the answer after the shrink instead of before, so you report a window that is one character too short.',
        'Handling duplicates in t incorrectly, for example treating t = "AABC" as a set.',
        'Shrinking greedily to a fixed size instead of shrinking only while the window stays valid.'
      ],
      complexity: { time: 'O(len(s) + len(t))', space: 'O(distinct characters in t)' },
      timeChoices: ['O(len(s) * len(t))', 'O(len(s) + len(t))', 'O(len(s)^2)', 'O(len(s) log len(s))'],
      timeAnswer: 1,
      starter: {
        cpp: 'string minWindow(string s, string t) {\n    // your code here\n}',
        python: 'def min_window(s, t):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'string minWindow(string s, string t) {\n    if (t.empty() || s.size() < t.size()) return "";\n    vector<int> need(128, 0);\n    for (char c : t) need[(unsigned char)c]++;\n    int missing = t.size();\n    int left = 0, bestLen = INT_MAX, bestStart = 0;\n    for (int r = 0; r < (int)s.size(); r++) {\n        if (need[(unsigned char)s[r]] > 0) missing--;\n        need[(unsigned char)s[r]]--;\n        while (missing == 0) {\n            if (r - left + 1 < bestLen) {\n                bestLen = r - left + 1;\n                bestStart = left;\n            }\n            need[(unsigned char)s[left]]++;\n            if (need[(unsigned char)s[left]] > 0) missing++;\n            left++;\n        }\n    }\n    return bestLen == INT_MAX ? "" : s.substr(bestStart, bestLen);\n}',
        python: 'def min_window(s, t):\n    if not t or len(s) < len(t):\n        return \'\'\n    need = {}\n    for c in t:\n        need[c] = need.get(c, 0) + 1\n    missing = len(t)\n    left = 0\n    best_len = len(s) + 1\n    best_start = 0\n    for r in range(len(s)):\n        c = s[r]\n        if need.get(c, 0) > 0:\n            missing -= 1\n        need[c] = need.get(c, 0) - 1\n        while missing == 0:\n            if r - left + 1 < best_len:\n                best_len = r - left + 1\n                best_start = left\n            need[s[left]] += 1\n            if need[s[left]] > 0:\n                missing += 1\n            left += 1\n    if best_len == len(s) + 1:\n        return \'\'\n    return s[best_start:best_start + best_len]'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<|vector\\s*<\\s*int|int\\s+\\w+\\s*\\[|array\\s*<', hint: 'Hold the required character counts.' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Extend the right edge over s.' },
          { re: 'while\\s*\\(', hint: 'Shrink from the left while the window remains valid.' },
          { re: 'substr|return', hint: 'Return the best window as a substring, or the empty string.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\s*\\(|Counter|defaultdict', hint: 'Hold the required character counts.' },
          { re: 'for\\s+\\w+|while\\s', hint: 'Extend the right edge over s.' },
          { re: 'while\\s', hint: 'Shrink from the left while the window remains valid.' },
          { re: 'return', hint: 'Return the best window as a substring, or the empty string.' }
        ]
      },
      mcq: [
        { q: 'Why are the required counts allowed to go negative?',
          opts: ['To detect the end of the string', 'So a surplus character is tracked, and only a count returning above zero signals a lost requirement', 'To save memory', 'To handle uppercase and lowercase together'],
          correct: 1,
          why: 'A negative count records how many spare copies the window holds. Evicting a spare only raises the count toward zero; only crossing back above zero means the window truly lost a needed character.' }
      ]
    },

    {
      id: 'nc-sliding-window-maximum',
      title: 'Sliding Window Maximum',
      section: 'sliding-window',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'You are given an array nums and a window size k. The window slides one position at a time from the left end to the right end. Return an array of the maximum value in each window position.',
      examples: [
        { in: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', out: '[3,3,5,5,6,7]' },
        { in: 'nums = [1], k = 1',                  out: '[1]' },
        { in: 'nums = [9,8,7,6], k = 2',            out: '[9,8,7]' }
      ],
      approach: 'Keep a deque of indices whose values are strictly decreasing from front to back. Before pushing index i, pop the front if it has fallen out of the window, then pop from the back while its value is at most nums[i], since such an element can never be the maximum again while nums[i] is present. Push i. Once i reaches k - 1, the front of the deque is the index of the current window maximum.',
      keyInsight: 'An element is useless the moment a later, larger element joins the window, because it will leave first and be dominated for the rest of its life. Discarding those permanently is what makes each index enter and leave the deque exactly once, giving amortised O(1) per window.',
      pitfalls: [
        'Storing values rather than indices, which makes the expiry check impossible.',
        'Popping from the back on a strict less-than only, or on greater-than-or-equal, which either keeps useless duplicates forever or evicts the wrong element; popping while the back value is <= nums[i] is the safe rule.',
        'Emitting an answer before the window is full, that is before i reaches k - 1.',
        'Using a heap without lazy deletion, which can hold stale maxima that are no longer inside the window.'
      ],
      complexity: { time: 'O(n)', space: 'O(k)' },
      timeChoices: ['O(n * k)', 'O(n log k)', 'O(n)', 'O(n log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    // your code here\n}',
        python: 'def max_sliding_window(nums, k):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    deque<int> dq;\n    vector<int> res;\n    for (int i = 0; i < (int)nums.size(); i++) {\n        while (!dq.empty() && dq.front() <= i - k) dq.pop_front();\n        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();\n        dq.push_back(i);\n        if (i >= k - 1) res.push_back(nums[dq.front()]);\n    }\n    return res;\n}',
        python: 'from collections import deque\n\n\ndef max_sliding_window(nums, k):\n    dq = deque()\n    res = []\n    for i, v in enumerate(nums):\n        while dq and dq[0] <= i - k:\n            dq.popleft()\n        while dq and nums[dq[-1]] <= v:\n            dq.pop()\n        dq.append(i)\n        if i >= k - 1:\n            res.append(nums[dq[0]])\n    return res'
      },
      checks: {
        cpp: [
          { re: 'deque|list\\s*<|priority_queue|multiset', hint: 'Use a monotonic deque of indices (or a heap with lazy deletion).' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Sweep the array once.' },
          { re: 'pop_front|pop_back|pop\\s*\\(|erase', hint: 'Discard expired indices and dominated values.' },
          { re: 'push_back|emplace_back|push\\s*\\(|insert', hint: 'Record each window maximum in the output.' }
        ],
        python: [
          { re: 'deque|heap|list\\s*\\(|\\[\\s*\\]', hint: 'Use a monotonic deque of indices (or a heap with lazy deletion).' },
          { re: 'for\\s+\\w+|while\\s', hint: 'Sweep the array once.' },
          { re: 'popleft|pop\\s*\\(|del\\s', hint: 'Discard expired indices and dominated values.' },
          { re: 'append', hint: 'Record each window maximum in the output.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'max_element', hint: 'Recomputing max over each window is O(n*k). Keep a monotonic deque instead.' }],
        python: [{ re: 'max\\s*\\(\\s*nums\\s*\\[', hint: 'Recomputing max over each window slice is O(n*k). Keep a monotonic deque instead.' }]
      },
      mcq: [
        { q: 'Why can an element be discarded permanently when a larger element enters the window behind it?',
          opts: ['To save memory', 'It expires no later than the larger element and is dominated until then, so it is never a maximum again', 'Because the array is sorted', 'Because k is fixed'],
          correct: 1,
          why: 'The older index leaves the window first, and for its whole remaining life the newer larger value is also inside. It can never be the reported maximum, so it is safe to drop forever.' }
      ]
    },

    {
      id: 'nc-max-consecutive-ones-iii',
      title: 'Max Consecutive Ones III',
      section: 'sliding-window',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given a binary array nums and an integer k, return the length of the longest subarray consisting of only 1s after flipping at most k zeroes to ones.',
      examples: [
        { in: 'nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2',                 out: '6' },
        { in: 'nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3', out: '10' },
        { in: 'nums = [0,0,0], k = 0',                                 out: '0' }
      ],
      approach: 'Slide a window whose invariant is "the window contains at most k zeroes". Extend the right edge, incrementing a zero counter when a 0 enters. While the counter exceeds k, advance the left edge, decrementing the counter when the departing element is a 0. Record the window length after each restoration.',
      keyInsight: 'You never track which zeroes are flipped, only how many are inside. Reducing the constraint to a single counter is what lets the window be repaired in amortised O(1) per step; each index enters and leaves once, so the scan is linear.',
      pitfalls: [
        'Shrinking with an if instead of a while when the window can violate the bound by more than one. Here a single new zero breaks it by at most one, so if also works, but the while form is the safe habit.',
        'Decrementing the counter for every departing element instead of only for zeroes.',
        'Resetting the window to empty on a violation, which turns the linear scan into a quadratic one and can miss the answer.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n^2)', 'O(n log n)', 'O(n * k)', 'O(n)'],
      timeAnswer: 3,
      starter: {
        cpp: 'int longestOnes(vector<int>& nums, int k) {\n    // your code here\n}',
        python: 'def longest_ones(nums, k):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int longestOnes(vector<int>& nums, int k) {\n    int left = 0, zeros = 0, best = 0;\n    for (int r = 0; r < (int)nums.size(); r++) {\n        if (nums[r] == 0) zeros++;\n        while (zeros > k) {\n            if (nums[left] == 0) zeros--;\n            left++;\n        }\n        best = max(best, r - left + 1);\n    }\n    return best;\n}',
        python: 'def longest_ones(nums, k):\n    left = 0\n    zeros = 0\n    best = 0\n    for r in range(len(nums)):\n        if nums[r] == 0:\n            zeros += 1\n        while zeros > k:\n            if nums[left] == 0:\n                zeros -= 1\n            left += 1\n        best = max(best, r - left + 1)\n    return best'
      },
      checks: {
        cpp: [
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Extend the right edge across the array.' },
          { re: '==\\s*0|!=\\s*1|<\\s*1', hint: 'Detect the zeroes entering and leaving the window.' },
          { re: 'while\\s*\\(|if\\s*\\(', hint: 'Advance the left edge while more than k zeroes are inside.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Record the longest valid window.' }
        ],
        python: [
          { re: 'for\\s+\\w+|while\\s', hint: 'Extend the right edge across the array.' },
          { re: '==\\s*0|!=\\s*1|not\\s', hint: 'Detect the zeroes entering and leaving the window.' },
          { re: 'while\\s|if\\s', hint: 'Advance the left edge while more than k zeroes are inside.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Record the longest valid window.' }
        ]
      },
      mcq: [
        { q: 'What is the window invariant here?',
          opts: ['The window contains exactly k zeroes', 'The window contains at most k zeroes', 'The window contains only ones', 'The window length is at most k'],
          correct: 1,
          why: 'At most k, not exactly k. Requiring exactly k would wrongly reject an all-ones prefix, which needs no flips at all and may be the longest answer.' }
      ]
    },

    {
      id: 'nc-fruit-into-baskets',
      title: 'Fruit Into Baskets',
      section: 'sliding-window',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'You have two baskets, each holding a single type of fruit. Starting at any tree you must pick one fruit from every tree moving right until you reach a fruit you cannot carry. Given an array fruits of fruit types, return the maximum number of fruits you can pick.',
      examples: [
        { in: 'fruits = [1,2,1]',     out: '3' },
        { in: 'fruits = [0,1,2,2]',   out: '3' },
        { in: 'fruits = [1,2,3,2,2]', out: '4' }
      ],
      approach: 'The task is the longest contiguous subarray containing at most two distinct values. Slide a window carrying a map from fruit type to its count inside the window. Extend the right edge and increment the entering type. While the map holds more than two keys, advance the left edge, decrementing its type and erasing the key when its count reaches zero. Record the best window length.',
      keyInsight: 'Distinctness is tracked by the size of the count map, and the erase-at-zero step is what keeps that size honest. Leave a zero-count key in the map and the window will shrink far more than it should.',
      pitfalls: [
        'Decrementing without deleting the key at zero, so the map size overstates the number of distinct fruits.',
        'Tracking only the two most recent types, which fails on inputs like [3,3,3,1,2,1,1,2,3,3,4] where the earlier type is still inside the window.',
        'Returning the number of distinct types instead of the window length.'
      ],
      complexity: { time: 'O(n)', space: 'O(1), the map holds at most three keys' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n * types)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int totalFruit(vector<int>& fruits) {\n    // your code here\n}',
        python: 'def total_fruit(fruits):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int totalFruit(vector<int>& fruits) {\n    unordered_map<int,int> cnt;\n    int left = 0, best = 0;\n    for (int r = 0; r < (int)fruits.size(); r++) {\n        cnt[fruits[r]]++;\n        while ((int)cnt.size() > 2) {\n            if (--cnt[fruits[left]] == 0) cnt.erase(fruits[left]);\n            left++;\n        }\n        best = max(best, r - left + 1);\n    }\n    return best;\n}',
        python: 'def total_fruit(fruits):\n    count = {}\n    left = 0\n    best = 0\n    for r in range(len(fruits)):\n        count[fruits[r]] = count.get(fruits[r], 0) + 1\n        while len(count) > 2:\n            count[fruits[left]] -= 1\n            if count[fruits[left]] == 0:\n                del count[fruits[left]]\n            left += 1\n        best = max(best, r - left + 1)\n    return best'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<|unordered_set|set\\s*<', hint: 'Track the fruit types currently in the window and how many of each.' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Extend the right edge across the row of trees.' },
          { re: 'erase|size\\s*\\(\\)\\s*>|>\\s*2', hint: 'Shrink from the left while more than two types are inside, erasing exhausted types.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Record the longest valid window.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\s*\\(|Counter|defaultdict', hint: 'Track the fruit types currently in the window and how many of each.' },
          { re: 'for\\s+\\w+|while\\s', hint: 'Extend the right edge across the row of trees.' },
          { re: 'del\\s|pop\\s*\\(|len\\s*\\(|>\\s*2', hint: 'Shrink from the left while more than two types are inside, deleting exhausted types.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Record the longest valid window.' }
        ]
      },
      mcq: [
        { q: 'Why must a type be erased from the map once its count reaches zero?',
          opts: ['To save memory', 'Because the map size is the distinct-type counter, and a stale key inflates it', 'To keep the map sorted', 'To avoid negative counts'],
          correct: 1,
          why: 'The shrink condition reads the map size. A leftover key with count 0 makes the window look like it holds three types, so it keeps shrinking a window that is already valid.' }
      ]
    }
  ];

  const Q = [ /* multiple-choice questions */

    /* ---------------- arrays-hashing ---------------- */

    {
      id: 'q-ah-001',
      section: 'arrays-hashing',
      tier: 'beginner',
      q: 'You need to answer many "is this value present?" queries over a fixed collection of integers. Which container is the right default?',
      opts: ['A hash set', 'A sorted vector with binary search', 'A balanced BST', 'A linked list'],
      correct: 0,
      why: 'A hash set answers membership in O(1) average time. Binary search is O(log n) and needs the data sorted; a BST is O(log n) and buys ordering you were not asked for; a list is O(n).',
      topic: 'choosing a container'
    },
    {
      id: 'q-ah-002',
      section: 'arrays-hashing',
      tier: 'intermediate',
      q: 'What is the worst-case time for a single lookup in std::unordered_map, and when does it actually occur?',
      opts: ['O(1) always, the worst case is a myth', 'O(log n), because buckets are trees', 'O(n), when every key hashes to the same bucket', 'O(n log n), when the table rehashes'],
      correct: 2,
      why: 'Average O(1) assumes keys spread across buckets. Adversarial or badly distributed keys can collide into one bucket, degrading a lookup to a linear scan of that chain.',
      topic: 'hash map complexity'
    },
    {
      id: 'q-ah-003',
      section: 'arrays-hashing',
      tier: 'intermediate',
      q: 'Which condition most strongly signals that a counting or bucketing approach will beat sorting?',
      opts: ['The array contains negative numbers', 'The values are unique', 'The sort key is an integer from a small bounded range', 'The array is already partially sorted'],
      correct: 2,
      why: 'Bucketing needs the key to double as an array index, which requires a bounded integer range. Then the work is O(n + range) with no comparisons at all.',
      topic: 'counting sort vs comparison sort'
    },
    {
      id: 'q-ah-004',
      section: 'arrays-hashing',
      tier: 'intermediate',
      q: 'You want to group items by an equivalence relation with a hash map. What must the key satisfy?',
      opts: ['It must be smaller than the item', 'It must be identical for equivalent items and different for non-equivalent ones', 'It must be an integer', 'It must be produced by a cryptographic hash'],
      correct: 1,
      why: 'The key must be a canonical form of the equivalence class. If two non-equivalent items can share a key the grouping merges them; if two equivalent items differ it splits them.',
      topic: 'canonical keys'
    },
    {
      id: 'q-ah-005',
      section: 'arrays-hashing',
      tier: 'advanced',
      q: 'A prefix-and-suffix scan lets you answer "aggregate of everything except index i" in O(n). What property must the aggregation operation have for the two-scan trick to work?',
      opts: ['It must be invertible', 'It must be associative so partial results can be combined from both sides', 'It must be commutative', 'It must produce integers'],
      correct: 1,
      why: 'Associativity is what makes prefix(i) combined with suffix(i) equal the whole-minus-i aggregate. Invertibility is only needed for the total-divided-by-element shortcut, which is exactly the trick that fails on zeroes.',
      topic: 'prefix and suffix scans'
    },
    {
      id: 'q-ah-006',
      section: 'arrays-hashing',
      tier: 'advanced',
      q: 'A hash-set algorithm launches an inner walk from selected elements only. What makes the total cost linear rather than quadratic?',
      opts: ['The inner walk is bounded by a constant', 'Hash lookups are O(1), so any number of them is free', 'The launch condition ensures the inner walks visit disjoint elements', 'The set removes duplicates'],
      correct: 2,
      why: 'O(1) per lookup only bounds each step. Linearity comes from the total number of steps: a guard that starts a walk only from a run minimum makes the walks partition the data, so every element is touched a constant number of times.',
      topic: 'amortised analysis'
    },
    {
      id: 'q-ah-007',
      section: 'arrays-hashing',
      tier: 'intermediate',
      q: 'Sorting is available and correct for a problem, but the target complexity is O(n). What is the usual signal that a hash structure can replace the sort?',
      opts: ['The array is large', 'You only need equality and membership, never relative order', 'The values are floating point', 'Extra memory is forbidden'],
      correct: 1,
      why: 'Sorting buys ordering. If the algorithm never asks "which is bigger", only "have I seen this" or "how many of these", the ordering is unused and hashing removes the log n factor.',
      topic: 'when hashing replaces sorting'
    },
    {
      id: 'q-ah-008',
      section: 'arrays-hashing',
      tier: 'master',
      q: 'You store cumulative sums in a hash map to count subarrays summing to a target. Why must the map be seeded with the entry prefix-sum 0 mapped to count 1?',
      opts: ['To handle empty input', 'To account for subarrays that start at index 0, whose prefix before them is the empty prefix', 'To avoid collisions', 'To make the first lookup succeed faster'],
      correct: 1,
      why: 'A subarray from index 0 to i has sum prefix(i) minus the empty prefix, which is 0. Without seeding 0 with count 1, every valid subarray anchored at the start is missed.',
      topic: 'prefix sums with hash maps'
    },

    /* ---------------- two-pointers ---------------- */

    {
      id: 'q-tp-001',
      section: 'two-pointers',
      tier: 'intermediate',
      q: 'What property of the input makes converging two pointers a correct search strategy for a pair sum?',
      opts: ['All values are positive', 'The array has no duplicates', 'The array is sorted, so moving a pointer changes the sum monotonically', 'The target is positive'],
      correct: 2,
      why: 'Sortedness makes the sum a monotone function of each pointer. That is what lets one comparison eliminate a whole family of pairs; on unsorted data a move eliminates nothing.',
      topic: 'when two pointers apply'
    },
    {
      id: 'q-tp-002',
      section: 'two-pointers',
      tier: 'intermediate',
      q: 'In a converging two-pointer sweep, why is it valid to discard an element the moment its pointer moves?',
      opts: ['It has already been counted', 'Every remaining pair using it is dominated by the pair just evaluated', 'It is a duplicate', 'It is out of range'],
      correct: 1,
      why: 'The pointer being moved was just paired with its best possible remaining partner. If that pairing failed, every surviving partner is worse, so no optimal answer uses that element.',
      topic: 'exchange argument'
    },
    {
      id: 'q-tp-003',
      section: 'two-pointers',
      tier: 'beginner',
      q: 'What distinguishes the fast/slow pointer pattern from the converging pointer pattern?',
      opts: ['Both pointers start at opposite ends and move toward each other in fast/slow', 'Fast/slow uses two arrays', 'Both pointers start at the left; one reads and one defines the compacted output prefix', 'Fast/slow requires sorted input'],
      correct: 2,
      why: 'Fast/slow is the in-place compaction pattern: the fast pointer scans and the slow pointer marks where the next kept element goes, with slow <= fast as the safety invariant.',
      topic: 'fast and slow pointers'
    },
    {
      id: 'q-tp-004',
      section: 'two-pointers',
      tier: 'advanced',
      q: 'A three-pointer partition classifies values into three regions in one pass. Why does the middle pointer sometimes not advance after a swap?',
      opts: ['To keep the loop finite', 'Because the incoming value came from the unexamined region and has not been classified yet', 'Because the array is sorted', 'Because the swap already placed it correctly'],
      correct: 1,
      why: 'Swapping with the high side pulls in a value from the unscanned zone. It must be examined next iteration; swapping with the low side is different because that value is already known.',
      topic: 'Dutch national flag'
    },
    {
      id: 'q-tp-005',
      section: 'two-pointers',
      tier: 'advanced',
      q: 'A problem needs pairs summing to a target and must return original indices, but the input is unsorted. Which cost does sorting impose?',
      opts: ['Sorting cannot be used here at all', 'Sorting loses the original indices unless you sort (value, index) pairs, and adds an O(n log n) term', 'Sorting changes the answer', 'Sorting makes the two-pointer sweep quadratic'],
      correct: 1,
      why: 'You can still sort, but you must carry the indices along and you pay O(n log n). A hash map answers the same question in O(n) with the indices intact, which is why it is preferred there.',
      topic: 'two pointers vs hashing'
    },
    {
      id: 'q-tp-006',
      section: 'two-pointers',
      tier: 'advanced',
      q: 'Sorting an array and then sweeping two pointers inside an outer loop gives what overall complexity for the k = 3 sum problem?',
      opts: ['O(n log n)', 'O(n^3)', 'O(n^2 log n)', 'O(n^2)'],
      correct: 3,
      why: 'The sort contributes O(n log n), then each of n outer positions runs a linear sweep. O(n^2) dominates O(n log n), so the total is O(n^2).',
      topic: 'complexity of k-sum'
    },
    {
      id: 'q-tp-007',
      section: 'two-pointers',
      tier: 'intermediate',
      q: 'In a sorted array, what is the standard way to avoid emitting duplicate tuples without a set?',
      opts: ['Skip a candidate whose value equals the previous candidate, after the first has been used', 'Remove all duplicates from the array up front', 'Compare each new tuple against every tuple already emitted', 'Randomise the array first'],
      correct: 0,
      why: 'Sorting puts equal values adjacent, so a neighbour comparison is enough. Deleting duplicates up front is wrong when a tuple legitimately reuses a value, such as a triple of identical numbers.',
      topic: 'duplicate suppression'
    },
    {
      id: 'q-tp-008',
      section: 'two-pointers',
      tier: 'master',
      q: 'The two-pointer solution for trapping rain water uses O(1) space, while the prefix-max solution uses O(n). What does the two-pointer version exploit to avoid storing the arrays?',
      opts: ['That the heights are bounded', 'That comparing the two current bars proves which side is the binding minimum, so only that running max is needed', 'That water only accumulates in the middle', 'That the array is symmetric'],
      correct: 1,
      why: 'The water at a column is min(leftMax, rightMax) - height. If the near bar is shorter, the far side is guaranteed at least as tall, so the near running max already is the minimum and can be committed immediately.',
      topic: 'space optimisation'
    },

    /* ---------------- sliding-window ---------------- */

    {
      id: 'q-sw-001',
      section: 'sliding-window',
      tier: 'beginner',
      q: 'Which problem shape is the sliding-window pattern for?',
      opts: ['Optimising over contiguous subarrays or substrings under a monotone constraint', 'Finding any subset that sums to a target', 'Sorting an array in place', 'Searching a sorted array for a value'],
      correct: 0,
      why: 'The window is a contiguous range. If the answer may be non-contiguous, or the constraint does not degrade monotonically as the range grows, sliding a window is not valid.',
      topic: 'when sliding window applies'
    },
    {
      id: 'q-sw-002',
      section: 'sliding-window',
      tier: 'intermediate',
      q: 'A sliding window scans an array of length n with a nested while loop that advances the left edge. Why is the total work O(n) and not O(n^2)?',
      opts: ['The inner loop runs at most twice per step', 'The left edge only ever moves right, so across the whole run it advances at most n times', 'Because the window has a fixed size', 'Because each element is compared once'],
      correct: 1,
      why: 'This is amortised analysis: the right edge does n steps and the left edge does at most n steps in total over the entire scan, no matter how they are distributed, so the sum is O(n).',
      topic: 'amortised cost of a window'
    },
    {
      id: 'q-sw-003',
      section: 'sliding-window',
      tier: 'intermediate',
      q: 'What breaks the sliding-window approach for "longest subarray with sum at most k" when the array can contain negative numbers?',
      opts: ['The window becomes too large to store', 'The sum stops being monotone in the window size, so shrinking may not restore validity', 'Negative numbers cannot be summed', 'Hash maps do not accept negative keys'],
      correct: 1,
      why: 'The window pattern relies on "growing makes the constraint worse, shrinking makes it better". With negatives, extending the window can lower the sum, so an invalid window may become valid by growing, and the left edge cannot be advanced monotonically.',
      topic: 'when sliding window fails'
    },
    {
      id: 'q-sw-004',
      section: 'sliding-window',
      tier: 'intermediate',
      q: 'What is the structural difference between a fixed-size window and a variable-size window?',
      opts: ['Fixed-size windows need a hash map', 'Variable-size windows can only shrink', 'Variable-size windows cannot use counters', 'A fixed-size window pairs every entry with exactly one eviction, so it needs no shrink loop'],
      correct: 3,
      why: 'With a fixed width the invariant holds by construction. A variable window has to shrink because its size is what the constraint or objective is about.',
      topic: 'fixed vs variable windows'
    },
    {
      id: 'q-sw-005',
      section: 'sliding-window',
      tier: 'advanced',
      q: 'A window keeps a count map and shrinks while the map has more than two keys. What bug appears if counts are decremented but exhausted keys are never removed?',
      opts: ['Counts go negative', 'The window shrinks too aggressively because the key count overstates the distinct values', 'The window never shrinks', 'The answer is off by exactly one'],
      correct: 1,
      why: 'The shrink condition reads the map size, so a leftover key with count 0 still counts as a distinct value. The window keeps contracting even though it is already valid, and the reported maximum is too small.',
      topic: 'window state hygiene'
    },
    {
      id: 'q-sw-006',
      section: 'sliding-window',
      tier: 'advanced',
      q: 'Why does a monotonic deque beat a max-heap for reporting the maximum of every window of size k?',
      opts: ['A heap cannot store duplicates', 'A deque uses less memory than any heap', 'The deque gives amortised O(1) per element because dominated elements are dropped permanently, while a plain heap is O(log k) per operation and may hold expired maxima', 'A heap cannot find the maximum'],
      correct: 2,
      why: 'The deque exploits domination: an older, smaller element can never win again, so it is discarded once. A heap has no cheap way to delete an expired element and needs lazy deletion plus a log factor.',
      topic: 'monotonic deque'
    },
    {
      id: 'q-sw-007',
      section: 'sliding-window',
      tier: 'master',
      q: 'A minimum-window algorithm tracks a single integer of remaining requirements instead of comparing count maps. What does that integer let you avoid?',
      opts: ['Storing the string', 'Re-checking validity in O(alphabet) time on every edge move', 'Using a hash map at all', 'Shrinking the window'],
      correct: 1,
      why: 'Validity becomes an O(1) test. Without it every extension and every shrink would compare two frequency tables, multiplying the runtime by the alphabet size.',
      topic: 'O(1) validity tests'
    },
    {
      id: 'q-sw-008',
      section: 'sliding-window',
      tier: 'master',
      q: 'For "shortest subarray with sum at least k" on an array that may contain negative numbers, why is a plain sliding window insufficient?',
      opts: ['A prefix-sum array plus a monotonic deque is needed, because the prefix sums are no longer non-decreasing', 'The answer is always the whole array', 'A hash map of prefix sums solves it in O(1)', 'Sorting the array first fixes it'],
      correct: 0,
      why: 'With only non-negative values the prefix sums increase, which is exactly what licenses the monotone left edge. Negatives break that, and the standard fix is a deque of prefix-sum indices kept increasing, giving O(n).',
      topic: 'window variants and their limits'
    }
  ];

  window.DB.problems.push(...P);
  window.DB.questions.push(...Q);
})();
