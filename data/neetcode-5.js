/* NeetCode part 5 - 1-D dynamic programming and 2-D dynamic programming */
(function () {
  const P = [

    /* ---------------- dp-1d ---------------- */

    {
      id: 'nc-climbing-stairs',
      title: 'Climbing Stairs',
      section: 'dp-1d',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'You are climbing a staircase with n steps. Each move you may climb either 1 or 2 steps. Return the number of distinct ways you can reach the top.',
      examples: [
        { in: 'n = 2', out: '2' },
        { in: 'n = 5', out: '8' }
      ],
      approach: 'SUBPROBLEM: dp[i] = the number of distinct ways to stand on step i, counting only the moves used to get there. RECURRENCE: the last move onto step i was either a single step from i-1 or a double step from i-2, and those two families of paths are disjoint and cover everything, so dp[i] = dp[i-1] + dp[i-2]. BASE CASE: dp[0] = 1 (one way to be at the ground - do nothing) and dp[1] = 1. ITERATION ORDER: sweep i from 2 up to n, because dp[i] reads only smaller indices, so every value it needs is already final. Since the recurrence looks back exactly two cells, you never need the whole array - carry two rolling variables and the space drops to O(1).',
      keyInsight: 'This is the prefix-state pattern: the answer for a prefix of length i depends only on a fixed window of earlier prefixes, so a fixed number of rolling variables replaces the table. It is Fibonacci wearing a staircase costume.',
      pitfalls: [
        'Setting dp[0] = 0. The empty path is one way, not zero ways, and using 0 collapses the whole sequence.',
        'Writing the plain recursion without memoisation - climb(n-1) + climb(n-2) re-solves the same subproblem exponentially many times.',
        'Updating the two rolling variables in the wrong order and overwriting the value you still need.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(n)', 'O(n log n)', 'O(2^n)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int climbStairs(int n) {\n    // your code here\n}',
        python: 'def climb_stairs(n):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int climbStairs(int n) {\n    int a = 1, b = 1;  // a = ways(i-2), b = ways(i-1)\n    for (int i = 2; i <= n; i++) {\n        int c = a + b;\n        a = b;\n        b = c;\n    }\n    return b;\n}',
        python: 'def climb_stairs(n):\n    a, b = 1, 1  # a = ways(i-2), b = ways(i-1)\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b'
      },
      checks: {
        cpp: [
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Build the answer up from small n with a loop (or memoise a recursion).' },
          { re: '\\+', hint: 'The count for step i is the sum of the counts for i-1 and i-2.' },
          { re: 'return', hint: 'Return the number of ways to reach step n.' }
        ],
        python: [
          { re: 'for\\s+\\w+|while\\s+', hint: 'Build the answer up from small n with a loop (or memoise a recursion).' },
          { re: '\\+', hint: 'The count for step i is the sum of the counts for i-1 and i-2.' },
          { re: 'return', hint: 'Return the number of ways to reach step n.' }
        ]
      },
      mcq: [
        { q: 'Why does the recurrence add dp[i-1] and dp[i-2] instead of multiplying them?',
          opts: ['Multiplication would overflow', 'The two ways of arriving at step i are disjoint alternatives, and disjoint cases add', 'Because addition is faster than multiplication', 'To keep the numbers small enough for an int'],
          correct: 1,
          why: 'Every path onto step i ends with either a 1-step or a 2-step move. Those sets of paths do not overlap and together they are all the paths, so their sizes add. Multiplication would be right only if you were combining independent choices made in sequence.' }
      ]
    },

    {
      id: 'nc-min-cost-climbing-stairs',
      title: 'Min Cost Climbing Stairs',
      section: 'dp-1d',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'You are given an integer array cost where cost[i] is the price of stepping off the i-th stair. Once you pay, you may move one or two stairs up. You may start on stair 0 or stair 1. Return the minimum total cost to reach the top, which is the position just past the last stair.',
      examples: [
        { in: 'cost = [10,15,20]', out: '15' },
        { in: 'cost = [1,100,1,1,1,100,1,1,100,1]', out: '6' }
      ],
      approach: 'SUBPROBLEM: dp[i] = the minimum cost to arrive at position i, where arriving does not yet include paying cost[i]. Position n (one past the end) is the top. RECURRENCE: you arrived at i either from i-1 (paying cost[i-1] to leave it) or from i-2 (paying cost[i-2]), so dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]). BASE CASE: dp[0] = dp[1] = 0, because starting on stair 0 or stair 1 is free - you only pay when you step off. ITERATION ORDER: i increasing from 2 to n, so both predecessors are already settled. The answer is dp[n], not dp[n-1]. Two rolling variables suffice.',
      keyInsight: 'Model the cost as paid on departure, not on arrival. Getting the accounting boundary right is what makes the base case dp[0] = dp[1] = 0 and the answer dp[n] instead of dp[n-1].',
      pitfalls: [
        'Returning dp[n-1]. The target is the floor past the last stair, so the loop must run one step further than the array.',
        'Paying cost[i] on arrival, which double-charges the first stair and breaks the free start.',
        'Forgetting that you may start on stair 1, and forcing the path through stair 0.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int minCostClimbingStairs(vector<int>& cost) {\n    // your code here\n}',
        python: 'def min_cost_climbing_stairs(cost):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int minCostClimbingStairs(vector<int>& cost) {\n    int n = cost.size();\n    int a = 0, b = 0;  // a = dp[i-2], b = dp[i-1]\n    for (int i = 2; i <= n; i++) {\n        int cur = min(b + cost[i - 1], a + cost[i - 2]);\n        a = b;\n        b = cur;\n    }\n    return b;\n}',
        python: 'def min_cost_climbing_stairs(cost):\n    a = b = 0  # a = dp[i-2], b = dp[i-1]\n    for i in range(2, len(cost) + 1):\n        a, b = b, min(b + cost[i - 1], a + cost[i - 2])\n    return b'
      },
      checks: {
        cpp: [
          { re: 'min\\s*\\(|<\\s*\\?|if\\s*\\(', hint: 'Each position takes the cheaper of its two predecessors.' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Sweep the stairs from the bottom up.' },
          { re: 'return', hint: 'Return the cost of reaching the floor past the last stair.' }
        ],
        python: [
          { re: 'min\\s*\\(|if\\s+', hint: 'Each position takes the cheaper of its two predecessors.' },
          { re: 'for\\s+\\w+|while\\s+', hint: 'Sweep the stairs from the bottom up.' },
          { re: 'return', hint: 'Return the cost of reaching the floor past the last stair.' }
        ]
      },
      mcq: [
        { q: 'Why is the answer dp[n] rather than dp[n - 1] when cost has n entries?',
          opts: ['Because arrays are 0-indexed', 'Because the goal is the position one past the last stair, which is index n', 'Because dp[n - 1] is always larger', 'Because the first stair is free'],
          correct: 1,
          why: 'The staircase has n stairs indexed 0..n-1, and the top is the landing after them, position n. Stopping at dp[n-1] answers a different question: the cost of standing on the last stair without stepping off it.' }
      ]
    },

    {
      id: 'nc-house-robber',
      title: 'House Robber',
      section: 'dp-1d',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'You are given an integer array nums where nums[i] is the amount of money in house i. Houses sit in a row and you cannot rob two adjacent houses. Return the maximum amount you can rob.',
      examples: [
        { in: 'nums = [1,2,3,1]', out: '4' },
        { in: 'nums = [2,7,9,3,1]', out: '12' }
      ],
      approach: 'SUBPROBLEM: dp[i] = the most money obtainable from the first i houses (nums[0..i-1]), with no constraint on whether house i-1 was taken. RECURRENCE: for house i-1 you have exactly two choices. Skip it, and you inherit dp[i-1]. Take it, and you collect nums[i-1] plus the best over the prefix that stops before its neighbour, dp[i-2]. So dp[i] = max(dp[i-1], dp[i-2] + nums[i-1]). BASE CASE: dp[0] = 0 (no houses, no money) and dp[1] = nums[0]. ITERATION ORDER: increasing i, since both predecessors are strictly smaller. Because only the last two values are ever read, keep two rolling variables for O(1) space.',
      keyInsight: 'The take-or-skip decision. Whenever an item can be included or excluded and including it forbids a neighbouring item, the recurrence is max(skip, value + best-that-respects-the-ban).',
      pitfalls: [
        'Thinking the answer is the larger of the even-index sum and the odd-index sum. [2,1,1,2] gives 4 by taking indices 0 and 3, which no fixed parity picks up.',
        'Writing dp[i] = max(dp[i-1], dp[i-2]) + nums[i-1], which pays for the current house even when you meant to skip it.',
        'Swapping the rolling variables before computing the new maximum.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(2^n)', 'O(n^2)', 'O(n)', 'O(log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'int rob(vector<int>& nums) {\n    // your code here\n}',
        python: 'def rob(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int rob(vector<int>& nums) {\n    int prev = 0, cur = 0;  // prev = dp[i-2], cur = dp[i-1]\n    for (int x : nums) {\n        int take = prev + x;\n        prev = cur;\n        cur = max(cur, take);\n    }\n    return cur;\n}',
        python: 'def rob(nums):\n    prev = cur = 0  # prev = dp[i-2], cur = dp[i-1]\n    for x in nums:\n        prev, cur = cur, max(cur, prev + x)\n    return cur'
      },
      checks: {
        cpp: [
          { re: 'max\\s*\\(|>\\s*\\?|if\\s*\\(', hint: 'At each house take the better of robbing it and skipping it.' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Walk the houses once.' },
          { re: 'return', hint: 'Return the best total.' }
        ],
        python: [
          { re: 'max\\s*\\(|if\\s+', hint: 'At each house take the better of robbing it and skipping it.' },
          { re: 'for\\s+\\w+|while\\s+', hint: 'Walk the houses once.' },
          { re: 'return', hint: 'Return the best total.' }
        ]
      },
      mcq: [
        { q: 'Why does dp[i] reach back to dp[i-2] instead of dp[i-1] when the current house is robbed?',
          opts: ['To halve the number of states', 'Because dp[i-1] may already include the adjacent house, which robbing house i-1 would forbid', 'Because dp[i-1] is not computed yet', 'To make the recurrence symmetric'],
          correct: 1,
          why: 'dp[i-1] is the best over a prefix that is allowed to end by robbing the immediate neighbour. Adding the current house to it could produce an illegal adjacent pair, so the take branch must build on dp[i-2], the last prefix guaranteed not to touch the neighbour.' }
      ]
    },

    {
      id: 'nc-house-robber-ii',
      title: 'House Robber II',
      section: 'dp-1d',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'The houses from House Robber are now arranged in a circle, so the first and last houses are adjacent and cannot both be robbed. Given nums, return the maximum amount you can rob without alerting the police.',
      examples: [
        { in: 'nums = [2,3,2]', out: '3' },
        { in: 'nums = [1,2,3,1]', out: '4' }
      ],
      approach: 'SUBPROBLEM: reuse the linear House Robber state - dp[i] = the best takings over a prefix of a straight row - and add one extra case split on top of it. The only thing the circle adds is that house 0 and house n-1 conflict. RECURRENCE: unchanged, dp[i] = max(dp[i-1], dp[i-2] + nums[i-1]) applied to a contiguous slice. BASE CASE: dp over an empty slice is 0. ITERATION ORDER: run the linear solver twice, once over nums[0..n-2] (this allows house 0 and bans the last house) and once over nums[1..n-1] (this bans house 0), then return the larger. Every legal circular selection omits at least one of the two conflicting houses, so one of the two runs contains it; and neither run can produce an illegal pair, so the maximum is exact. Guard n == 1 separately, since both slices would be empty.',
      keyInsight: 'Break a cyclic constraint by enumerating the small number of ways it can be satisfied, then solve each case with the ordinary linear DP. Case-split on the conflict, do not invent a circular recurrence.',
      pitfalls: [
        'Forgetting the n == 1 special case, which makes both slices empty and returns 0.',
        'Trying to force one pass with a wrap-around index, which quietly allows both endpoints.',
        'Assuming the two runs must both be feasible - it is fine for one to be worse, you only take the max.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int rob(vector<int>& nums) {\n    // your code here\n}',
        python: 'def rob(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int rob(vector<int>& nums) {\n    int n = nums.size();\n    if (n == 1) return nums[0];\n    auto line = [&](int lo, int hi) {\n        int prev = 0, cur = 0;\n        for (int i = lo; i <= hi; i++) {\n            int take = prev + nums[i];\n            prev = cur;\n            cur = max(cur, take);\n        }\n        return cur;\n    };\n    return max(line(0, n - 2), line(1, n - 1));\n}',
        python: 'def rob(nums):\n    if len(nums) == 1:\n        return nums[0]\n\n    def line(vals):\n        prev = cur = 0\n        for x in vals:\n            prev, cur = cur, max(cur, prev + x)\n        return cur\n\n    return max(line(nums[:-1]), line(nums[1:]))'
      },
      checks: {
        cpp: [
          { re: 'max\\s*\\(', hint: 'Take the better of the two cases, and the better of take/skip inside each.' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'You still need a linear sweep over a slice of the houses.' },
          { re: 'size\\s*\\(\\)|n\\s*-\\s*1|n\\s*-\\s*2', hint: 'Handle the first and last house conflict explicitly.' }
        ],
        python: [
          { re: 'max\\s*\\(', hint: 'Take the better of the two cases, and the better of take/skip inside each.' },
          { re: 'for\\s+\\w+|while\\s+', hint: 'You still need a linear sweep over a slice of the houses.' },
          { re: 'len\\s*\\(|\\[\\s*1\\s*:|:\\s*-\\s*1\\s*\\]', hint: 'Handle the first and last house conflict explicitly.' }
        ]
      },
      mcq: [
        { q: 'Why is running the linear solver on nums[0..n-2] and on nums[1..n-1] and taking the max correct?',
          opts: ['Because the optimum always uses the first house', 'Because every legal circular choice must skip house 0 or skip house n-1, and each run covers one of those worlds while never producing an illegal pair', 'Because the two runs give the same answer', 'Because the circle can be cut anywhere without changing the answer'],
          correct: 1,
          why: 'The only extra rule is that 0 and n-1 cannot both be taken, so every feasible selection omits at least one of them and therefore lives inside at least one of the two slices. Neither slice can create the forbidden pair, so no run overcounts and the maximum over the two is exactly the circular optimum.' }
      ]
    }

  ];
  const Q = [
  ];
  window.DB.problems.push(...P);
  window.DB.questions.push(...Q);
})();
