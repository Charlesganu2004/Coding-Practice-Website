/* neetcode-6.js — greedy, intervals, math-geometry, bit-manipulation. */
(function () {
  'use strict';

  const P = [
    {
      id: 'nc-max-subarray', title: 'Maximum Subarray', section: 'greedy',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Given an integer array, return the largest sum of any contiguous non-empty subarray.',
      examples: [
        { in: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', out: '6', why: 'The subarray [4,-1,2,1] sums to 6.' },
        { in: 'nums = [-3,-1,-2]', out: '-1', why: 'All negative, so the answer is the single largest element — the subarray must be non-empty.' }
      ],
      constraints: ['At least one element.', 'Values may be negative.', 'One pass, O(1) extra space.'],
      approach: 'Kadane\'s algorithm. Walk the array carrying the best sum of a subarray ending at the current index. At each element the decision is binary: extend the previous run, or start fresh here. Extending is only worth it while the running sum is positive, because a negative prefix can only hurt whatever follows — so cur = max(x, cur + x). Track the best value cur ever reached in a separate variable. Initialise both from the first element rather than from 0; starting at 0 assumes an empty subarray is allowed and returns 0 for an all-negative input.',
      keyInsight: 'A prefix with a negative sum can only hurt what follows, so drop it and start again.',
      pitfalls: [
        'Initialising best to 0, which returns 0 for an all-negative array.',
        'Resetting cur to 0 rather than to the current element.',
        'Confusing the running sum with the answer — the best may have occurred earlier.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(n)', 'O(n log n)', 'O(n^2)'], timeAnswer: 1,
      starter: { cpp: 'int maxSubArray(vector<int>& nums) {\n    // your code here\n}', python: 'def max_sub_array(nums):\n    # your code here\n    pass' },
      solution: {
        cpp: 'int maxSubArray(vector<int>& nums) {\n    int cur = nums[0], best = nums[0];\n    for (int i = 1; i < (int)nums.size(); i++) {\n        cur = max(nums[i], cur + nums[i]);   // extend, or start fresh\n        best = max(best, cur);\n    }\n    return best;\n}',
        python: 'def max_sub_array(nums):\n    cur = best = nums[0]\n    for x in nums[1:]:\n        cur = max(x, cur + x)      # extend, or start fresh\n        best = max(best, cur)\n    return best'
      },
      checks: {
        cpp: [{ re: 'for|while', hint: 'One pass over the array.' }, { re: 'max\\s*\\(', hint: 'Take the better of extending or restarting.' }, { re: 'nums\\s*\\[\\s*0\\s*\\]|front', hint: 'Initialise from the first element, not 0.' }, { re: 'return', hint: 'Return the best sum seen.' }],
        python: [{ re: 'for|while', hint: 'One pass over the array.' }, { re: 'max\\s*\\(', hint: 'Take the better of extending or restarting.' }, { re: 'nums\\s*\\[\\s*0\\s*\\]', hint: 'Initialise from the first element, not 0.' }, { re: 'return', hint: 'Return the best sum seen.' }]
      },
      antiChecks: {
        cpp: [{ re: 'for[\\s\\S]{0,140}for\\s*\\(', hint: 'Nested loops are the O(n^2) brute force; one pass is enough.' }],
        python: [{ re: 'for[\\s\\S]{0,140}\\n\\s+for\\s', hint: 'Nested loops are the O(n^2) brute force; one pass is enough.' }]
      },
      mcq: [
        { q: 'Why initialise best to nums[0] rather than 0?', opts: ['It is faster', 'Starting at 0 implicitly allows the empty subarray, so an all-negative input wrongly returns 0', 'To avoid overflow', 'It makes no difference'], correct: 1, why: 'The problem requires a non-empty subarray. With best = 0 and every element negative, no real subarray ever beats 0 and the answer is wrong.' },
        { q: 'What makes the greedy choice safe here?', opts: ['The array is sorted', 'A prefix with a negative running sum can only reduce any sum that extends it, so discarding it never loses the optimum', 'Every element is positive', 'It is not greedy'], correct: 1, why: 'That is the exchange argument: any optimal subarray extending a negative prefix would be at least as good without it, so dropping it is safe.' }
      ]
    },
    {
      id: 'nc-jump-game', title: 'Jump Game', section: 'greedy',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Each element of the array is the maximum jump length from that position. Starting at index 0, determine whether you can reach the last index.',
      examples: [
        { in: 'nums = [2,3,1,1,4]', out: 'true', why: 'Jump 1 to index 1, then 3 to the end.' },
        { in: 'nums = [3,2,1,0,4]', out: 'false', why: 'Every route lands on index 3, which has jump length 0.' }
      ],
      constraints: ['Non-negative jump lengths.', 'One pass.'],
      approach: 'Track the furthest index reachable so far. Scan left to right; if the current index exceeds that reach you can never arrive here, so return false immediately. Otherwise extend the reach to max(reach, i + nums[i]). If the loop completes, the last index was reachable. The greedy works because reachability is monotone: if you can reach index i you can reach every index before it, so the single furthest-reach number is a complete summary of everything achievable — there is no need to track which particular jumps got you there.',
      keyInsight: 'Reachability is monotone, so one number — the furthest index reachable — summarises every route.',
      pitfalls: [
        'Recursing over every possible jump, which is exponential.',
        'Updating reach before checking whether the current index is beyond it.',
        'Assuming a zero always blocks — it only blocks if nothing can jump over it.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(n)', 'O(n log n)', 'O(2^n)'], timeAnswer: 1,
      starter: { cpp: 'bool canJump(vector<int>& nums) {\n    // your code here\n}', python: 'def can_jump(nums):\n    # your code here\n    pass' },
      solution: {
        cpp: 'bool canJump(vector<int>& nums) {\n    int reach = 0;\n    for (int i = 0; i < (int)nums.size(); i++) {\n        if (i > reach) return false;          // cannot even get here\n        reach = max(reach, i + nums[i]);\n    }\n    return true;\n}',
        python: 'def can_jump(nums):\n    reach = 0\n    for i, n in enumerate(nums):\n        if i > reach:\n            return False        # cannot even get here\n        reach = max(reach, i + n)\n    return True'
      },
      checks: {
        cpp: [{ re: 'for|while', hint: 'Single pass.' }, { re: 'max\\s*\\(|>', hint: 'Track the furthest reachable index.' }, { re: 'return\\s+(false|true)', hint: 'Report reachability.' }],
        python: [{ re: 'for|while', hint: 'Single pass.' }, { re: 'max\\s*\\(|>', hint: 'Track the furthest reachable index.' }, { re: 'return', hint: 'Report reachability.' }]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why is a single "furthest reach" number sufficient?', opts: ['The array is sorted', 'Reachability is monotone — if index i is reachable so is every index before it — so the maximum reach captures everything', 'Because jumps are always 1', 'It is not sufficient'], correct: 1, why: 'There are no gaps below the furthest reach, so no information is lost by collapsing all routes into one number.' },
        { q: 'When does a 0 in the array actually block progress?', opts: ['Always', 'Only when no earlier index has enough reach to jump over it', 'Never', 'Only at index 0'], correct: 1, why: 'A zero stops you only if you are forced to land on it. If an earlier position can reach past it, it is irrelevant.' }
      ]
    },
    {
      id: 'nc-merge-intervals', title: 'Merge Intervals', section: 'intervals',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Given a list of intervals, merge all that overlap and return the resulting non-overlapping list, sorted by start.',
      examples: [
        { in: '[[1,3],[2,6],[8,10],[15,18]]', out: '[[1,6],[8,10],[15,18]]', why: '[1,3] and [2,6] overlap and merge into [1,6].' },
        { in: '[[1,4],[4,5]]', out: '[[1,5]]', why: 'Touching at a single point counts as overlapping here.' }
      ],
      constraints: ['Output must be sorted by start.', 'Touching intervals merge.'],
      approach: 'Sort by start time. That is what makes a single pass possible: once sorted, any interval that overlaps the one you are building must begin before the current end, so you only ever compare against the most recent merged interval rather than all of them. Walk the sorted list keeping the last merged interval; if the next start is at most the current end, extend the end to the max of the two ends, otherwise push the current one and start a new one. Taking the max matters because a fully contained interval such as [1,10] followed by [2,3] must not shrink the end.',
      keyInsight: 'Sorting by start means you only ever need to compare against the last merged interval, never all of them.',
      pitfalls: [
        'Forgetting to sort, which breaks the single-pass argument entirely.',
        'Setting the end to the new interval\'s end instead of the max, which shrinks it for a contained interval.',
        'Sorting by end time, which works for interval scheduling but not for merging.'
      ],
      complexity: { time: 'O(n log n)', space: 'O(n)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], timeAnswer: 1,
      starter: { cpp: 'vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    // your code here\n}', python: 'def merge(intervals):\n    # your code here\n    pass' },
      solution: {
        cpp: 'vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    if (intervals.empty()) return {};\n    sort(intervals.begin(), intervals.end());   // by start\n\n    vector<vector<int>> out;\n    out.push_back(intervals[0]);\n    for (size_t i = 1; i < intervals.size(); i++) {\n        if (intervals[i][0] <= out.back()[1])\n            out.back()[1] = max(out.back()[1], intervals[i][1]);  // max, not assign\n        else\n            out.push_back(intervals[i]);\n    }\n    return out;\n}',
        python: 'def merge(intervals):\n    if not intervals:\n        return []\n    intervals.sort()                  # by start\n\n    out = [intervals[0]]\n    for start, end in intervals[1:]:\n        if start <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], end)   # max, not assign\n        else:\n            out.append([start, end])\n    return out'
      },
      checks: {
        cpp: [{ re: 'sort', hint: 'Sort the intervals by start.' }, { re: 'for|while', hint: 'Single pass over the sorted list.' }, { re: 'max\\s*\\(', hint: 'Extend the end to the maximum of the two.' }, { re: 'push_back|return', hint: 'Build and return the merged list.' }],
        python: [{ re: 'sort', hint: 'Sort the intervals by start.' }, { re: 'for|while', hint: 'Single pass over the sorted list.' }, { re: 'max\\s*\\(', hint: 'Extend the end to the maximum of the two.' }, { re: 'append|return', hint: 'Build and return the merged list.' }]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why compare only against the most recently merged interval?', opts: ['To save memory', 'After sorting by start, any interval overlapping an earlier one must also overlap the most recent merged block, so earlier blocks cannot be affected', 'Because intervals never nest', 'It is only an approximation'], correct: 1, why: 'Sorted starts mean the merged blocks are finalised left to right. Nothing later can reach back past the current block.' },
        { q: 'Why take max(end, new_end) instead of assigning new_end?', opts: ['To handle negative numbers', 'A fully contained interval such as [2,3] inside [1,10] would otherwise shrink the merged end from 10 to 3', 'To keep the list sorted', 'They are equivalent'], correct: 1, why: 'Sorting by start says nothing about ends. A later interval can finish earlier, so assigning blindly loses coverage.' }
      ]
    },
    {
      id: 'nc-meeting-rooms-ii', title: 'Minimum Meeting Rooms', section: 'intervals',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Given meeting time intervals, return the minimum number of rooms required so that no two meetings in the same room overlap.',
      examples: [
        { in: '[[0,30],[5,10],[15,20]]', out: '2', why: '[0,30] overlaps both others, but [5,10] and [15,20] can share a room.' },
        { in: '[[7,10],[2,4]]', out: '1', why: 'They do not overlap, so one room suffices.' }
      ],
      constraints: ['A meeting ending at time t frees the room for one starting at t.'],
      approach: 'The answer is the maximum number of meetings simultaneously in progress. Two standard ways to compute it. The min-heap approach keeps the end times of currently occupied rooms: sort by start, and for each meeting pop every end that is at or before the new start (those rooms are now free), then push this end; the heap size is the rooms in use and the answer is its maximum. The sweep-line approach is simpler and faster: separate and sort the start and end times, then walk both with two pointers, incrementing a counter on each start and decrementing on each end, and record the peak. Both are O(n log n) dominated by the sort.',
      keyInsight: 'The answer is the peak number of concurrent meetings, so you never need to know which meeting is in which room.',
      pitfalls: [
        'Counting an end exactly equal to a start as an overlap, which over-allocates rooms.',
        'Sorting the intervals as pairs when the sweep needs starts and ends sorted independently.',
        'Trying to track room assignments, which is far more work than the question asks.'
      ],
      complexity: { time: 'O(n log n)', space: 'O(n)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], timeAnswer: 1,
      starter: { cpp: 'int minMeetingRooms(vector<vector<int>>& intervals) {\n    // your code here\n}', python: 'def min_meeting_rooms(intervals):\n    # your code here\n    pass' },
      solution: {
        cpp: 'int minMeetingRooms(vector<vector<int>>& intervals) {\n    int n = intervals.size();\n    vector<int> starts(n), ends(n);\n    for (int i = 0; i < n; i++) { starts[i] = intervals[i][0]; ends[i] = intervals[i][1]; }\n    sort(starts.begin(), starts.end());\n    sort(ends.begin(), ends.end());\n\n    int rooms = 0, best = 0, e = 0;\n    for (int s = 0; s < n; s++) {\n        // an end exactly at this start frees the room: <= not <\n        while (e < n && ends[e] <= starts[s]) { rooms--; e++; }\n        rooms++;\n        best = max(best, rooms);\n    }\n    return best;\n}',
        python: 'import heapq\n\ndef min_meeting_rooms(intervals):\n    if not intervals:\n        return 0\n    intervals.sort(key=lambda iv: iv[0])\n\n    heap = []                      # end times of rooms in use\n    best = 0\n    for start, end in intervals:\n        # an end exactly at this start frees the room: <= not <\n        while heap and heap[0] <= start:\n            heapq.heappop(heap)\n        heapq.heappush(heap, end)\n        best = max(best, len(heap))\n    return best'
      },
      checks: {
        cpp: [{ re: 'sort', hint: 'Sort start and end times.' }, { re: 'while|for', hint: 'Sweep through the events.' }, { re: '<=', hint: 'An end equal to a start frees the room.' }, { re: 'max\\s*\\(', hint: 'Track the peak concurrency.' }],
        python: [{ re: 'sort|heapq|heappush', hint: 'Sort, or use a heap of end times.' }, { re: 'while|for', hint: 'Sweep through the events.' }, { re: '<=', hint: 'An end equal to a start frees the room.' }, { re: 'max\\s*\\(|len', hint: 'Track the peak concurrency.' }]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why does a meeting ending at time t not conflict with one starting at t?',
          opts: ['It does conflict', 'Intervals are half-open in this problem — the room is free at the instant the previous meeting ends', 'Because times are integers', 'Because the list is sorted'], correct: 1, why: 'Using < instead of <= treats the boundary as an overlap and allocates an extra room. This off-by-one is the most common failure on this problem.' },
        { q: 'Why does the sweep never need to know which room each meeting is in?',
          opts: ['Rooms are interchangeable and only the peak concurrency is asked for', 'Because meetings are sorted', 'Because there is only one room', 'It does need to know'], correct: 0, why: 'The question asks how many rooms, not which. The maximum number of simultaneously active meetings is exactly that number.' }
      ]
    },
    {
      id: 'nc-rotate-image', title: 'Rotate Image', section: 'math-geometry',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Rotate an n x n matrix by 90 degrees clockwise, in place.\n\nYou may not allocate another matrix.',
      examples: [
        { in: '[[1,2,3],[4,5,6],[7,8,9]]', out: '[[7,4,1],[8,5,2],[9,6,3]]', why: 'The first column, bottom to top, becomes the first row.' },
        { in: '[[1,2],[3,4]]', out: '[[3,1],[4,2]]', why: 'The same decomposition works for any n.' }
      ],
      constraints: ['In place — no second matrix.', 'Square matrix.'],
      approach: 'A clockwise rotation decomposes into two simple in-place operations: transpose the matrix, then reverse each row. Transposing swaps element (i,j) with (j,i), which reflects across the main diagonal; reversing each row then reflects horizontally, and the two reflections compose into a 90-degree rotation. The essential implementation detail is that the transpose loop must start its inner index at i, not at 0 — iterating the full square swaps every pair twice and returns the matrix to where it started. For counter-clockwise, transpose and then reverse the columns instead.',
      keyInsight: 'Rotation is two reflections: transpose, then reverse each row. The inner transpose loop must start at i.',
      pitfalls: [
        'Running the transpose over the full square, which double-swaps and undoes itself.',
        'Reversing the columns instead of the rows, which rotates the wrong way.',
        'Allocating a second matrix, which the problem forbids.'
      ],
      complexity: { time: 'O(n^2)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)'], timeAnswer: 2,
      starter: { cpp: 'void rotate(vector<vector<int>>& matrix) {\n    // your code here\n}', python: 'def rotate(matrix):\n    # modify matrix in place\n    pass' },
      solution: {
        cpp: 'void rotate(vector<vector<int>>& matrix) {\n    int n = matrix.size();\n    for (int i = 0; i < n; i++)\n        for (int j = i; j < n; j++)          // start at i, or every swap undoes itself\n            swap(matrix[i][j], matrix[j][i]);\n\n    for (int i = 0; i < n; i++)\n        reverse(matrix[i].begin(), matrix[i].end());\n}',
        python: 'def rotate(matrix):\n    n = len(matrix)\n    for i in range(n):\n        for j in range(i, n):              # start at i, or every swap undoes itself\n            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n\n    for row in matrix:\n        row.reverse()'
      },
      checks: {
        cpp: [{ re: 'swap|=', hint: 'Transpose by swapping across the diagonal.' }, { re: 'reverse', hint: 'Reverse each row.' }, { re: 'for[\\s\\S]{0,120}for', hint: 'Nested loops over the matrix.' }],
        python: [{ re: 'matrix\\s*\\[|=', hint: 'Transpose by swapping across the diagonal.' }, { re: 'reverse|\\[::-1\\]', hint: 'Reverse each row.' }, { re: 'for[\\s\\S]{0,120}for', hint: 'Nested loops over the matrix.' }]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why must the inner transpose loop start at i rather than 0?', opts: ['For speed', 'Starting at 0 visits every pair twice, so each swap is undone and the matrix is unchanged', 'To avoid out-of-bounds access', 'To handle non-square matrices'], correct: 1, why: 'Swapping (i,j) with (j,i) and later (j,i) with (i,j) restores the original. Only the upper triangle should be visited.' },
        { q: 'How do you rotate counter-clockwise instead?', opts: ['Transpose twice', 'Transpose, then reverse the columns rather than the rows', 'Reverse the rows, then transpose the result twice', 'Rotate clockwise three times, which is the only way'], correct: 1, why: 'Both rotations are two reflections; only the axis of the second reflection changes. Three clockwise rotations also work but do three times the work.' }
      ]
    },
    {
      id: 'nc-single-number', title: 'Single Number', section: 'bit-manipulation',
      tier: 'intermediate', difficulty: 'Easy',
      prompt: 'Every element in the array appears exactly twice except one, which appears once. Return that element.\n\nUse O(1) extra space and linear time.',
      examples: [
        { in: 'nums = [4,1,2,1,2]', out: '4', why: 'The pairs cancel and 4 remains.' },
        { in: 'nums = [7]', out: '7', why: 'A single element XORed with the 0 identity is itself.' }
      ],
      constraints: ['Exactly one element appears once, all others exactly twice.', 'O(1) extra space.'],
      approach: 'XOR has three properties that make this a one-liner: x ^ x is 0, x ^ 0 is x, and it is commutative and associative so order does not matter. XOR every element together and each duplicated pair annihilates itself regardless of where the two copies sit, leaving only the element that has no partner. Start the accumulator at 0, which is the identity. A hash map also solves it in linear time but uses O(n) space, which the constraint rules out.',
      keyInsight: 'x ^ x = 0 and x ^ 0 = x, and XOR is order-independent — so every pair cancels wherever it sits.',
      pitfalls: [
        'Starting the accumulator at anything other than 0.',
        'Using a hash map, which is linear time but O(n) space and so fails the constraint.',
        'Assuming the array is sorted.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(n)', 'O(n log n)', 'O(n^2)'], timeAnswer: 1,
      starter: { cpp: 'int singleNumber(vector<int>& nums) {\n    // your code here\n}', python: 'def single_number(nums):\n    # your code here\n    pass' },
      solution: {
        cpp: 'int singleNumber(vector<int>& nums) {\n    int acc = 0;                 // 0 is the XOR identity\n    for (int x : nums) acc ^= x; // pairs cancel, the loner survives\n    return acc;\n}',
        python: 'def single_number(nums):\n    acc = 0                      # 0 is the XOR identity\n    for x in nums:\n        acc ^= x                 # pairs cancel, the loner survives\n    return acc'
      },
      checks: {
        cpp: [{ re: '\\^', hint: 'Use XOR.' }, { re: 'for|while|accumulate', hint: 'Combine every element.' }, { re: 'return', hint: 'Return the accumulator.' }],
        python: [{ re: '\\^|reduce|xor', hint: 'Use XOR.' }, { re: 'for|reduce', hint: 'Combine every element.' }, { re: 'return', hint: 'Return the accumulator.' }]
      },
      antiChecks: {
        cpp: [{ re: 'unordered_map|unordered_set|map\\s*<|set\\s*<', hint: 'A hash structure is O(n) space; the constraint asks for O(1).' }],
        python: [{ re: 'Counter|dict\\(|\\{\\s*\\}|set\\s*\\(', hint: 'A hash structure is O(n) space; the constraint asks for O(1).' }]
      },
      mcq: [
        { q: 'Which XOR property makes the order of the array irrelevant?', opts: ['Distributivity', 'Commutativity and associativity, so the pairs cancel wherever they appear', 'Idempotence', 'Transitivity'], correct: 1, why: 'Because the operation can be reordered and regrouped freely, every x ^ x can be brought together and collapsed to 0.' },
        { q: 'If every element appeared three times except one, would XOR still work?', opts: ['Yes, unchanged', 'No — XOR cancels pairs, so three copies leave one behind; you need per-bit counting modulo 3', 'Yes, if you XOR twice', 'Only for positive numbers'], correct: 1, why: 'x ^ x ^ x = x, so triples do not vanish. The generalisation counts set bits at each position modulo 3 and rebuilds the answer.' }
      ]
    },
    {
      id: 'nc-counting-bits', title: 'Counting Bits', section: 'bit-manipulation',
      tier: 'advanced', difficulty: 'Easy',
      prompt: 'Given an integer n, return an array of length n+1 where element i is the number of 1 bits in the binary representation of i.\n\nSolve it in O(n) total, not O(n log n).',
      examples: [
        { in: 'n = 5', out: '[0,1,1,2,1,2]', why: '0b100 has one set bit, 0b101 has two.' },
        { in: 'n = 0', out: '[0]', why: 'Zero has no set bits.' }
      ],
      constraints: ['O(n) total time.', 'Return values for every i from 0 to n.'],
      approach: 'Counting each number independently costs O(log n) each, giving O(n log n). To reach O(n), reuse the answers already computed. Clearing the lowest set bit of i gives i & (i - 1), a strictly smaller number whose count you have already recorded, so dp[i] = dp[i & (i-1)] + 1. Each entry is then one array lookup and one addition. The alternative recurrence dp[i] = dp[i >> 1] + (i & 1) works equally well: shifting right removes the lowest bit, and you add it back if it was set.',
      keyInsight: 'i & (i - 1) clears the lowest set bit, giving a smaller index whose answer is already known.',
      pitfalls: [
        'Counting each number independently, which is O(n log n).',
        'Getting the recurrence backwards and indexing a value not yet computed.',
        'Forgetting that the array has n+1 entries, not n.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], timeAnswer: 0,
      starter: { cpp: 'vector<int> countBits(int n) {\n    // your code here\n}', python: 'def count_bits(n):\n    # your code here\n    pass' },
      solution: {
        cpp: 'vector<int> countBits(int n) {\n    vector<int> dp(n + 1, 0);\n    for (int i = 1; i <= n; i++)\n        dp[i] = dp[i & (i - 1)] + 1;   // clear lowest set bit -> smaller, known\n    return dp;\n}',
        python: 'def count_bits(n):\n    dp = [0] * (n + 1)\n    for i in range(1, n + 1):\n        dp[i] = dp[i & (i - 1)] + 1    # clear lowest set bit -> smaller, known\n    return dp'
      },
      checks: {
        cpp: [{ re: '&|>>', hint: 'Use a bit trick to reach a smaller, already-computed index.' }, { re: 'for', hint: 'Fill the table in increasing order.' }, { re: 'dp|res|\\[', hint: 'Reuse previously computed counts.' }, { re: 'return', hint: 'Return the table.' }],
        python: [{ re: '&|>>', hint: 'Use a bit trick to reach a smaller, already-computed index.' }, { re: 'for|range', hint: 'Fill the table in increasing order.' }, { re: 'dp|res|\\[', hint: 'Reuse previously computed counts.' }, { re: 'return', hint: 'Return the table.' }]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'What does i & (i - 1) do?', opts: ['Sets the lowest bit', 'Clears the lowest set bit', 'Isolates the lowest set bit', 'Negates the number'], correct: 1, why: 'Subtracting 1 flips the lowest set bit to 0 and everything below it to 1; ANDing keeps only the higher bits. Repeatedly applying it counts set bits in O(popcount) steps.' },
        { q: 'Why does dp[i >> 1] + (i & 1) also work?', opts: ['It does not', 'Shifting right drops the lowest bit, so the count is that of the shifted value plus the dropped bit', 'It only works for even numbers', 'It is O(n log n)'], correct: 1, why: 'i >> 1 is strictly smaller so its answer is known, and (i & 1) restores the bit that the shift discarded.' }
      ]
    }
  ];

  const Q = [
    { id: 'q-greedy-001', section: 'greedy', tier: 'intermediate', topic: 'greedy validity',
      q: 'What must you establish before trusting a greedy algorithm?',
      opts: ['That the input is sorted', 'An exchange argument: that the locally best choice never rules out an optimal solution', 'That it runs in O(n)', 'That the array has no duplicates'],
      correct: 1, why: 'Greedy fails silently when the greedy choice is not safe. The exchange argument shows any optimal solution can be rewritten to include your choice without getting worse.' },

    { id: 'q-greedy-002', section: 'greedy', tier: 'intermediate', topic: 'coin change',
      q: 'Why does greedy fail for coin change with denominations [1, 3, 4] and target 6?',
      opts: ['It does not fail', 'Greedy takes 4 then 1 then 1 for three coins, but 3 + 3 is two coins', 'The denominations are unsorted', 'The target is too small'],
      correct: 1, why: 'Taking the largest coin first forecloses the better combination. This is the canonical example of a greedy choice that is not safe, and why coin change needs DP.' },

    { id: 'q-greedy-003', section: 'greedy', tier: 'advanced', topic: 'interval scheduling',
      q: 'To fit the maximum number of non-overlapping intervals, what should you sort by?',
      opts: ['Start time ascending', 'End time ascending', 'Duration ascending', 'Start time descending'],
      correct: 1, why: 'Choosing the interval that finishes earliest leaves the most room for the rest. Sorting by start or by duration both produce counterexamples.' },

    { id: 'q-greedy-004', section: 'greedy', tier: 'advanced', topic: 'gas station',
      q: 'In the gas station problem, if the total gas is at least the total cost, what follows?',
      opts: ['Nothing useful', 'A valid starting station is guaranteed to exist, and it is the one after the point where the running deficit is lowest', 'Every station works', 'The answer is always station 0'],
      correct: 1, why: 'Sufficient total fuel guarantees a solution exists. The running-deficit argument then identifies it in one pass, without trying every start.' },

    { id: 'q-greedy-005', section: 'greedy', tier: 'master', topic: 'greedy vs DP',
      q: 'When should you reach for DP instead of greedy?',
      opts: ['When the input is large', 'When a locally optimal choice can prevent a globally optimal solution, so all combinations must be considered', 'When the answer is a number', 'When recursion is involved'],
      correct: 1, why: 'DP explores the whole space with memoisation. Greedy commits immediately, so it is only correct when that commitment provably costs nothing.' },

    { id: 'q-greedy-006', section: 'greedy', tier: 'intermediate', topic: 'kadane',
      q: 'In Kadane\'s algorithm, why reset the running sum when it goes negative?',
      opts: ['To avoid overflow', 'A negative prefix can only reduce the sum of anything that follows it, so discarding it never loses the optimum', 'To keep the sum positive for the output', 'To handle empty arrays'],
      correct: 1, why: 'Any subarray extending a negative prefix is strictly improved by dropping that prefix, so the greedy reset is safe.' },

    { id: 'q-greedy-007', section: 'greedy', tier: 'advanced', topic: 'partition labels',
      q: 'To split a string into maximal parts where each letter appears in only one part, what do you precompute?',
      opts: ['The frequency of each letter', 'The last index at which each letter occurs', 'The first index of each letter', 'A sorted copy of the string'],
      correct: 1, why: 'A part cannot end before the last occurrence of every letter it contains. Scanning while extending the boundary to the furthest last-index closes each part as early as legally possible.' },

    { id: 'q-int-001', section: 'intervals', tier: 'intermediate', topic: 'sorting key',
      q: 'For merging overlapping intervals, which sort key is correct?',
      opts: ['End time', 'Start time', 'Interval length', 'No sort is needed'],
      correct: 1, why: 'Sorting by start guarantees that overlapping intervals are adjacent in the sorted order, which is what makes a single left-to-right pass valid.' },

    { id: 'q-int-002', section: 'intervals', tier: 'advanced', topic: 'sweep line',
      q: 'What does a sweep-line algorithm compute for interval problems?',
      opts: ['The total covered length only', 'A running count of active intervals as you move through sorted event points, from which peaks and gaps fall out', 'The sorted order of intervals', 'The intersection of all intervals'],
      correct: 1, why: 'Treating starts as +1 and ends as -1 and walking the sorted events gives concurrency at every moment, which answers room-count, max-overlap and coverage questions uniformly.' },

    { id: 'q-int-003', section: 'intervals', tier: 'advanced', topic: 'boundaries',
      q: 'Two meetings are [1,5] and [5,9]. Do they overlap?',
      opts: ['Yes, they share the point 5', 'No, if intervals are half-open — the room frees exactly as the next begins', 'Only if the meetings are in the same room', 'Undefined'],
      correct: 1, why: 'This is the definition question to ask an interviewer. Under the usual convention they do not conflict, and using < instead of <= over-allocates a room.' },

    { id: 'q-int-004', section: 'intervals', tier: 'intermediate', topic: 'insert interval',
      q: 'Inserting one interval into an already-sorted non-overlapping list can be done in what time?',
      opts: ['O(n log n), you must re-sort', 'O(n) — the list is already sorted, so one pass suffices', 'O(log n)', 'O(n^2)'],
      correct: 1, why: 'Emit everything ending before the new interval, merge everything overlapping it, then emit the rest. No re-sorting is needed because the order is already established.' },

    { id: 'q-int-005', section: 'intervals', tier: 'master', topic: 'non-overlapping',
      q: 'To remove the fewest intervals so none overlap, what do you do?',
      opts: ['Remove the longest intervals first', 'Sort by end time and greedily keep each interval that starts at or after the last kept end', 'Sort by start and remove every second one', 'Use dynamic programming only'],
      correct: 1, why: 'Maximising what you keep minimises what you remove, and earliest-finish-first is the optimal greedy for maximising kept intervals.' },

    { id: 'q-int-006', section: 'intervals', tier: 'intermediate', topic: 'merge',
      q: 'When merging [1,10] with the next interval [2,3], what should the merged end be?',
      opts: ['3, the newer end', '10, the maximum of the two ends', '13, their sum', '2, the newer start'],
      correct: 1, why: 'Sorting by start says nothing about ends, so a contained interval can finish earlier. Assigning rather than taking the max silently shrinks the covered range.' },

    { id: 'q-mg-001', section: 'math-geometry', tier: 'intermediate', topic: 'matrix rotation',
      q: 'Which pair of operations rotates a square matrix 90 degrees clockwise in place?',
      opts: ['Reverse each row, then transpose', 'Transpose, then reverse each row', 'Transpose twice', 'Reverse each column, then reverse each row'],
      correct: 1, why: 'Transposing reflects across the main diagonal and reversing rows reflects horizontally; composing two reflections gives a rotation. The other order rotates anticlockwise.' },

    { id: 'q-mg-002', section: 'math-geometry', tier: 'advanced', topic: 'overflow',
      q: 'When reversing a 32-bit integer, why must you check for overflow before the final multiply?',
      opts: ['Because the input may be negative', 'Signed overflow is undefined behaviour in C++, so you must detect it before it happens rather than after', 'Because reversal changes the sign', 'It is not necessary'],
      correct: 1, why: 'You cannot test whether overflow occurred by inspecting the result — the behaviour is undefined. Compare against INT_MAX/10 before multiplying instead.' },

    { id: 'q-mg-003', section: 'math-geometry', tier: 'intermediate', topic: 'set matrix zeroes',
      q: 'Why can you not zero a row as soon as you find a zero while scanning the matrix?',
      opts: ['It is too slow', 'The zeroes you write are indistinguishable from original zeroes, so later scanning propagates them and blanks the whole matrix', 'Rows must be processed in reverse', 'It uses too much memory'],
      correct: 1, why: 'The classic fix is to record which rows and columns need zeroing first — often in the matrix\'s own first row and column — and apply the changes in a second pass.' },

    { id: 'q-mg-004', section: 'math-geometry', tier: 'advanced', topic: 'pow',
      q: 'What makes fast exponentiation O(log n)?',
      opts: ['It uses floating-point math', 'Squaring the base halves the remaining exponent at each step', 'It caches previous results', 'It uses a lookup table'],
      correct: 1, why: 'x^n is (x^2)^(n/2) for even n. Each step halves n, so the number of multiplications is logarithmic. Negative exponents invert the base first.' },

    { id: 'q-mg-005', section: 'math-geometry', tier: 'intermediate', topic: 'spiral',
      q: 'What is the cleanest way to traverse a matrix in spiral order?',
      opts: ['Recursion on submatrices only', 'Maintain four boundaries and shrink the appropriate one after traversing each edge', 'Sort the elements first', 'Rotate the matrix repeatedly'],
      correct: 1, why: 'Top, bottom, left and right boundaries make the bookkeeping explicit. The subtlety is re-checking that the boundaries have not crossed before the third and fourth edges, or a single row is emitted twice.' },

    { id: 'q-mg-006', section: 'math-geometry', tier: 'master', topic: 'happy number',
      q: 'Why does cycle detection solve the happy-number problem?',
      opts: ['The sequence always terminates', 'The sequence of digit-square sums is bounded, so it must eventually repeat; the repeat is either 1 or a cycle that never reaches 1', 'Because digits are finite', 'It does not, you need a set'],
      correct: 1, why: 'Boundedness guarantees a repeat by the pigeonhole principle. Floyd\'s tortoise and hare then detects it in O(1) space rather than storing every value seen.' },

    { id: 'q-bm-001', section: 'bit-manipulation', tier: 'beginner', topic: 'XOR',
      q: 'What is x ^ x, and what is x ^ 0?',
      opts: ['1 and x', '0 and x', 'x and 0', '0 and 1'],
      correct: 1, why: 'XOR is self-inverse and 0 is its identity. Together these two facts underlie almost every XOR trick, including finding a lone unpaired element.' },

    { id: 'q-bm-002', section: 'bit-manipulation', tier: 'intermediate', topic: 'bit tricks',
      q: 'What does n & (n - 1) compute?',
      opts: ['n with the lowest set bit cleared', 'n with all bits flipped', 'The lowest set bit in isolation', 'n divided by two'],
      correct: 0, why: 'Subtracting 1 turns the lowest set bit into 0 and all bits below it into 1; the AND keeps only the bits above. Looping on it counts set bits in as many steps as there are set bits.' },

    { id: 'q-bm-003', section: 'bit-manipulation', tier: 'intermediate', topic: 'power of two',
      q: 'Which expression tests whether a positive n is a power of two?',
      opts: ['n % 2 == 0', '(n & (n - 1)) == 0', 'n ^ (n - 1) == 0', 'n >> 1 == 0'],
      correct: 1, why: 'A power of two has exactly one set bit, so clearing the lowest set bit leaves zero. Guard n > 0 separately, since 0 also satisfies the expression.' },

    { id: 'q-bm-004', section: 'bit-manipulation', tier: 'advanced', topic: 'missing number',
      q: 'How does XOR find the missing number in 0..n?',
      opts: ['By summing and subtracting', 'XOR every index and every value together; each present number appears twice and cancels, leaving the missing one', 'By sorting first', 'By using a hash set'],
      correct: 1, why: 'It matches the arithmetic-sum approach in time but cannot overflow, which is why it is the preferred answer when the range is large.' },

    { id: 'q-bm-005', section: 'bit-manipulation', tier: 'master', topic: 'add without plus',
      q: 'When adding two integers with bitwise operations, what do XOR and AND each represent?',
      opts: ['XOR is the carry, AND is the sum', 'XOR is the sum without carries, and AND shifted left by one is the carry', 'Both give the sum', 'AND gives the sign'],
      correct: 1, why: 'XOR adds each bit position ignoring carries; AND finds positions where both bits are 1, which is exactly where a carry is generated, and shifting moves it to the next position. Repeat until the carry is zero.' },

    { id: 'q-bm-006', section: 'bit-manipulation', tier: 'advanced', topic: 'counting bits',
      q: 'Why is dp[i] = dp[i >> 1] + (i & 1) an O(n) solution to counting bits for 0..n?',
      opts: ['It uses a lookup table', 'i >> 1 is a strictly smaller index whose answer is already computed, so each entry costs O(1)', 'Shifting is free', 'It is actually O(n log n)'],
      correct: 1, why: 'Reusing a previously computed answer replaces the per-number O(log n) count with a single lookup and addition, giving O(n) overall.' },

    { id: 'q-bm-007', section: 'bit-manipulation', tier: 'master', topic: 'shifts',
      q: 'Why is left-shifting a signed integer into the sign bit dangerous in C++?',
      opts: ['It is slower than multiplication', 'It is undefined behaviour, so the compiler may assume it never happens and optimise accordingly', 'It always produces zero', 'It rounds toward zero'],
      correct: 1, why: 'Signed left shift that overflows is UB. Use unsigned types for bit manipulation, where the behaviour is defined as modular arithmetic.' }
  ];

  window.DB.problems.push.apply(window.DB.problems, P);
  window.DB.questions.push.apply(window.DB.questions, Q);
})();
