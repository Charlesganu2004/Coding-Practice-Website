/* NeetCode part 2 — stack, binary search, linked list */
(function () {
  const P = [
    /* ---------------------------------------------------------------- stack */
    {
      id: 'nc-valid-parentheses',
      title: 'Valid Parentheses',
      section: 'stack',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given a string s containing only the characters ( ) [ ] { }, decide whether it is valid. A string is valid when every opening bracket is closed by the same type of bracket and brackets close in the correct order.',
      examples: [
        { in: 's = "()[]{}"', out: 'true' },
        { in: 's = "(]"', out: 'false' },
        { in: 's = "([)]"', out: 'false' },
        { in: 's = "((("', out: 'false' }
      ],
      approach: 'Scan left to right. An opening bracket is a promise you have not kept yet, so push it. A closing bracket must settle the most recent unkept promise, which is exactly the top of the stack: if the stack is empty or the top is not the matching opener, the string is invalid. After the scan, any bracket still on the stack was never closed, so the string is valid only when the stack is empty.',
      keyInsight: 'Nesting is last-in-first-out, which is the definition of a stack. The matching table maps each closer to its opener so one comparison decides correctness.',
      pitfalls: [
        'Returning true as soon as the loop ends. Leftover openers such as "(((" never trigger a mismatch, so the final empty-stack check is required.',
        'Popping without first checking that the stack is non-empty, which crashes on input like ")".',
        'Counting brackets instead of matching them: "([)]" has balanced counts but is still invalid.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
      timeAnswer: 2,
      starter: {
        cpp: 'bool isValid(string s) {\n    // your code here\n}',
        python: 'def is_valid(s):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool isValid(string s) {\n    stack<char> st;\n    unordered_map<char,char> match = {{\')\', \'(\'}, {\']\', \'[\'}, {\'}\', \'{\'}};\n    for (char c : s) {\n        if (match.count(c)) {\n            if (st.empty() || st.top() != match[c]) return false;\n            st.pop();\n        } else {\n            st.push(c);\n        }\n    }\n    return st.empty();\n}',
        python: 'def is_valid(s):\n    stack = []\n    match = {")": "(", "]": "[", "}": "{"}\n    for c in s:\n        if c in match:\n            if not stack or stack[-1] != match[c]:\n                return False\n            stack.pop()\n        else:\n            stack.append(c)\n    return not stack'
      },
      checks: {
        cpp: [
          { re: 'stack\\s*<|vector\\s*<|deque\\s*<|string\\s+\\w+\\s*;', hint: 'Keep the unclosed openers in a stack (std::stack, vector or even a string all work).' },
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Scan the characters of s.' },
          { re: 'empty\\(\\)|size\\(\\)\\s*==\\s*0|\\.size\\(\\)', hint: 'After the scan, the stack must be empty.' },
          { re: 'return', hint: 'Return true or false.' }
        ],
        python: [
          { re: '\\[\\s*\\]|list\\(|deque\\(', hint: 'Keep the unclosed openers in a list used as a stack.' },
          { re: 'for\\s+\\w+|while\\s', hint: 'Scan the characters of s.' },
          { re: 'not\\s+\\w+|len\\s*\\(|==\\s*\\[\\s*\\]', hint: 'After the scan, the stack must be empty.' },
          { re: 'return', hint: 'Return True or False.' }
        ]
      },
      mcq: [
        { q: 'Which input is rejected only by the check that runs AFTER the scan finishes?',
          opts: ['"(]"', '"(("', '")("', '"([)]"'],
          correct: 1,
          why: 'Unclosed openers never cause a mismatch inside the loop, so only the final empty-stack test catches them. The other three all fail on a mismatched or missing top during the scan.' }
      ]
    },

    {
      id: 'nc-min-stack',
      title: 'Min Stack',
      section: 'stack',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Design a stack that supports push, pop, top and retrieving the minimum element, with every operation running in O(1).',
      examples: [
        { in: 'push(-2), push(0), push(-3), getMin()', out: '-3' },
        { in: '...then pop(), top(), getMin()', out: 'top = 0, getMin = -2' }
      ],
      approach: 'A single running-minimum variable is not enough, because once the minimum is popped you have no way to recover the previous one. Instead keep a second stack that is pushed in lockstep with the main one: on each push, store min(newValue, currentMinimum). Level i of the auxiliary stack answers the question "what is the minimum of the first i+1 elements?", so getMin is just the top of that stack and pop simply discards both tops.',
      keyInsight: 'Store history, not a summary. Because a stack only ever removes the most recent element, a per-level minimum can be maintained in O(1) and unwinds automatically on pop.',
      pitfalls: [
        'Keeping one min variable and rescanning after the minimum is popped, which makes pop O(n).',
        'Pushing onto the minimum stack only when the new value is strictly smaller. That is a valid space optimisation but then pop must compare before discarding, and using <= on push (or == on pop) matters when duplicates of the minimum are stored.',
        'Forgetting that the auxiliary stack must be popped in the same call as the main stack.'
      ],
      complexity: { time: 'O(1) per operation', space: 'O(n)' },
      timeChoices: ['O(1) per operation', 'O(log n) per operation', 'O(n) for getMin', 'O(n) for push'],
      timeAnswer: 0,
      starter: {
        cpp: 'class MinStack {\npublic:\n    MinStack() {\n        // your code here\n    }\n    void push(int val) {\n        // your code here\n    }\n    void pop() {\n        // your code here\n    }\n    int top() {\n        // your code here\n    }\n    int getMin() {\n        // your code here\n    }\n};',
        python: 'class MinStack:\n    def __init__(self):\n        # your code here\n        pass\n\n    def push(self, val):\n        pass\n\n    def pop(self):\n        pass\n\n    def top(self):\n        pass\n\n    def getMin(self):\n        pass'
      },
      solution: {
        cpp: 'class MinStack {\n    vector<int> st;\n    vector<int> mins;\npublic:\n    MinStack() {}\n\n    void push(int val) {\n        st.push_back(val);\n        mins.push_back(mins.empty() ? val : min(val, mins.back()));\n    }\n\n    void pop() {\n        st.pop_back();\n        mins.pop_back();\n    }\n\n    int top() {\n        return st.back();\n    }\n\n    int getMin() {\n        return mins.back();\n    }\n};',
        python: 'class MinStack:\n    def __init__(self):\n        self.st = []\n        self.mins = []\n\n    def push(self, val):\n        self.st.append(val)\n        self.mins.append(val if not self.mins else min(val, self.mins[-1]))\n\n    def pop(self):\n        self.st.pop()\n        self.mins.pop()\n\n    def top(self):\n        return self.st[-1]\n\n    def getMin(self):\n        return self.mins[-1]'
      },
      checks: {
        cpp: [
          { re: 'vector\\s*<|stack\\s*<|deque\\s*<|pair\\s*<', hint: 'Store the elements, plus the minimum that was in force at each level.' },
          { re: 'min\\s*\\(|<\\s*|>\\s*', hint: 'Each push records the smaller of the new value and the previous minimum.' },
          { re: 'getMin', hint: 'Implement getMin.' },
          { re: 'void\\s+pop|pop\\s*\\(\\s*\\)', hint: 'Implement pop so the minimum unwinds with it.' }
        ],
        python: [
          { re: 'def\\s+push', hint: 'Implement push.' },
          { re: 'def\\s+getMin', hint: 'Implement getMin.' },
          { re: 'min\\s*\\(|if\\s+|<\\s*', hint: 'Each push records the smaller of the new value and the previous minimum.' },
          { re: 'append\\(|push_back|\\+=', hint: 'Record the per-level minimum alongside the value.' }
        ]
      },
      mcq: [
        { q: 'Why does a single "current minimum" integer fail?',
          opts: ['It cannot hold negative numbers', 'It makes push O(n)', 'When the minimum itself is popped there is no record of the previous minimum', 'It breaks the top operation'],
          correct: 2,
          why: 'After popping the smallest element the cache is stale and would have to be rebuilt by scanning the whole stack, which is O(n). A parallel stack keeps the answer for every prefix.' }
      ]
    },

    {
      id: 'nc-eval-rpn',
      title: 'Evaluate Reverse Polish Notation',
      section: 'stack',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'You are given an array of strings tokens representing an arithmetic expression in Reverse Polish Notation. Evaluate it and return the integer result. Valid operators are +, -, * and /. Division truncates toward zero. The expression is always valid.',
      examples: [
        { in: 'tokens = ["2","1","+","3","*"]', out: '9' },
        { in: 'tokens = ["4","13","5","/","+"]', out: '6' },
        { in: 'tokens = ["3","-4","/"]', out: '0' }
      ],
      approach: 'Push every number onto a stack. When an operator arrives, its two operands are the two most recently pushed values, so pop twice and push the result back. The critical detail is order: the FIRST pop is the right operand and the second pop is the left operand, because the stack reverses insertion order. Since the expression is valid, exactly one value remains at the end and that is the answer.',
      keyInsight: 'Reverse Polish Notation is a flat encoding of an expression tree in postfix order, and a stack replays that tree bottom-up without ever building it.',
      pitfalls: [
        'Swapping the operand order. It is invisible for + and * but silently wrong for - and /.',
        'Truncating division the wrong way. C++ integer division already truncates toward zero, but Python // floors, so -7 // 2 gives -4 instead of -3.',
        'Treating a leading minus sign as an operator: "-4" is a negative number, not the subtraction token.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int evalRPN(vector<string>& tokens) {\n    // your code here\n}',
        python: 'def eval_rpn(tokens):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int evalRPN(vector<string>& tokens) {\n    stack<long long> st;\n    for (const string& t : tokens) {\n        if (t == "+" || t == "-" || t == "*" || t == "/") {\n            long long b = st.top(); st.pop();\n            long long a = st.top(); st.pop();\n            if (t == "+") st.push(a + b);\n            else if (t == "-") st.push(a - b);\n            else if (t == "*") st.push(a * b);\n            else st.push(a / b);\n        } else {\n            st.push(stoll(t));\n        }\n    }\n    return (int)st.top();\n}',
        python: 'def eval_rpn(tokens):\n    stack = []\n    for t in tokens:\n        if t in ("+", "-", "*", "/"):\n            b = stack.pop()\n            a = stack.pop()\n            if t == "+":\n                stack.append(a + b)\n            elif t == "-":\n                stack.append(a - b)\n            elif t == "*":\n                stack.append(a * b)\n            else:\n                stack.append(int(a / b))\n        else:\n            stack.append(int(t))\n    return stack[-1]'
      },
      checks: {
        cpp: [
          { re: 'stack\\s*<|vector\\s*<|deque\\s*<', hint: 'Hold pending operands on a stack.' },
          { re: 'stoi|stoll|atoi|stringstream|stod', hint: 'Convert numeric tokens from string to a number.' },
          { re: '"\\+"|\'\\+\'|\\bplus\\b', hint: 'Recognise the operator tokens.' },
          { re: 'return', hint: 'Return the single value left on the stack.' }
        ],
        python: [
          { re: '\\[\\s*\\]|list\\(|deque\\(', hint: 'Hold pending operands on a stack.' },
          { re: 'int\\s*\\(|float\\s*\\(', hint: 'Convert numeric tokens from string to a number.' },
          { re: '"\\+"|\'\\+\'', hint: 'Recognise the operator tokens.' },
          { re: 'return', hint: 'Return the single value left on the stack.' }
        ]
      },
      mcq: [
        { q: 'For the token "/" you pop x first and y second. Which expression is correct?',
          opts: ['x / y', 'y / x', 'abs(x / y)', 'x // y'],
          correct: 1,
          why: 'A stack returns operands in reverse order, so the first pop is the right-hand operand. The left operand is the second pop, giving y / x.' }
      ]
    },

    {
      id: 'nc-generate-parentheses',
      title: 'Generate Parentheses',
      section: 'stack',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given n pairs of parentheses, generate all combinations of well-formed parentheses. Return the list in any order.',
      examples: [
        { in: 'n = 1', out: '["()"]' },
        { in: 'n = 2', out: '["(())","()()"]' },
        { in: 'n = 3', out: '["((()))","(()())","(())()","()(())","()()()"]' }
      ],
      approach: 'Build the string one character at a time and prune the moment a prefix can no longer become valid. Track how many openers and closers have been placed. You may place an opener whenever openCount is still below n. You may place a closer only when closeCount is strictly below openCount, because a closer with nothing open would be unmatched. When the string reaches length 2n it is guaranteed valid, so record it. Undo the character after each recursive call so the buffer is reused.',
      keyInsight: 'The stack here is implicit: closeCount < openCount is exactly the statement "the running stack of unmatched openers is non-empty", which is the validity condition checked incrementally instead of at the end.',
      pitfalls: [
        'Generating all 2^(2n) strings and filtering with a validity check. It is correct but exponentially wasteful compared with pruning.',
        'Allowing a closer when closeCount == openCount, which produces strings like "()" followed by ")".',
        'Forgetting to pop the character after the recursive call, so the buffer keeps growing.'
      ],
      complexity: { time: 'O(4^n / sqrt(n))', space: 'O(n) recursion depth plus output' },
      timeChoices: ['O(n^2)', 'O(2^n)', 'O(4^n / sqrt(n))', 'O(n!)'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<string> generateParenthesis(int n) {\n    // your code here\n}',
        python: 'def generate_parenthesis(n):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'void gpBacktrack(int openCount, int closeCount, int n, string& cur, vector<string>& res) {\n    if ((int)cur.size() == 2 * n) {\n        res.push_back(cur);\n        return;\n    }\n    if (openCount < n) {\n        cur.push_back(\'(\');\n        gpBacktrack(openCount + 1, closeCount, n, cur, res);\n        cur.pop_back();\n    }\n    if (closeCount < openCount) {\n        cur.push_back(\')\');\n        gpBacktrack(openCount, closeCount + 1, n, cur, res);\n        cur.pop_back();\n    }\n}\n\nvector<string> generateParenthesis(int n) {\n    vector<string> res;\n    string cur;\n    gpBacktrack(0, 0, n, cur, res);\n    return res;\n}',
        python: 'def generate_parenthesis(n):\n    res = []\n    cur = []\n\n    def backtrack(open_count, close_count):\n        if len(cur) == 2 * n:\n            res.append("".join(cur))\n            return\n        if open_count < n:\n            cur.append("(")\n            backtrack(open_count + 1, close_count)\n            cur.pop()\n        if close_count < open_count:\n            cur.append(")")\n            backtrack(open_count, close_count + 1)\n            cur.pop()\n\n    backtrack(0, 0)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'vector\\s*<\\s*string|push_back', hint: 'Collect the finished strings.' },
          { re: '<\\s*n|<\\s*\\w+\\s*\\)|<=', hint: 'Guard each choice: an opener needs openCount < n, a closer needs closeCount < openCount.' },
          { re: '\\(\\s*\\)|\\bgpBacktrack|\\w+\\s*\\(\\s*\\w+\\s*\\+\\s*1', hint: 'Recurse (or iterate) to extend the prefix.' }
        ],
        python: [
          { re: 'def\\s+\\w+|append\\(', hint: 'Build the strings incrementally.' },
          { re: '<\\s*n|<\\s*\\w+', hint: 'Guard each choice: an opener needs open_count < n, a closer needs close_count < open_count.' },
          { re: 'return|yield', hint: 'Return or yield the collection of valid strings.' }
        ]
      },
      mcq: [
        { q: 'What is the exact condition under which a closing parenthesis may be appended to the current prefix?',
          opts: ['closeCount < n', 'closeCount < openCount', 'openCount == n', 'the prefix length is even'],
          correct: 1,
          why: 'A closer must match an opener that is still unmatched, and the number of unmatched openers is openCount - closeCount. Using closeCount < n instead lets you emit ")" before any "(".' }
      ]
    },

    {
      id: 'nc-daily-temperatures',
      title: 'Daily Temperatures',
      section: 'stack',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given an array temperatures, return an array answer where answer[i] is the number of days you have to wait after day i to get a warmer temperature. If no future day is warmer, answer[i] is 0.',
      examples: [
        { in: 'temperatures = [73,74,75,71,69,72,76,73]', out: '[1,1,4,2,1,1,0,0]' },
        { in: 'temperatures = [30,40,50,60]', out: '[1,1,1,0]' },
        { in: 'temperatures = [30,60,90]', out: '[1,1,0]' }
      ],
      approach: 'Sweep left to right holding a stack of INDICES whose answers are still unknown. The temperatures at those indices are non-increasing from the bottom of the stack to the top, because any index is popped the instant a warmer day appears. When day i arrives, repeatedly pop every index j on top whose temperature is colder than temperatures[i] and set answer[j] = i - j. Then push i. Indices left on the stack at the end never found a warmer day and keep their default 0.',
      keyInsight: 'This is the canonical monotonic decreasing stack. Each index is pushed once and popped at most once, so the inner while loop costs O(n) in total and the whole scan is linear despite looking quadratic.',
      pitfalls: [
        'Storing temperatures instead of indices, which leaves you unable to compute the distance i - j.',
        'Popping on <= instead of <. Equal temperatures are not warmer, so an equal day must not resolve the pending index.',
        'Assuming the nested while loop makes it O(n^2). Amortised, the total number of pops is bounded by n.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'vector<int> dailyTemperatures(vector<int>& temperatures) {\n    // your code here\n}',
        python: 'def daily_temperatures(temperatures):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> dailyTemperatures(vector<int>& temperatures) {\n    int n = temperatures.size();\n    vector<int> res(n, 0);\n    stack<int> st;\n    for (int i = 0; i < n; i++) {\n        while (!st.empty() && temperatures[st.top()] < temperatures[i]) {\n            int j = st.top();\n            st.pop();\n            res[j] = i - j;\n        }\n        st.push(i);\n    }\n    return res;\n}',
        python: 'def daily_temperatures(temperatures):\n    res = [0] * len(temperatures)\n    stack = []\n    for i, t in enumerate(temperatures):\n        while stack and temperatures[stack[-1]] < t:\n            j = stack.pop()\n            res[j] = i - j\n        stack.append(i)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'stack\\s*<|vector\\s*<\\s*int\\s*>\\s*\\w+\\s*;|deque\\s*<', hint: 'Keep unresolved days on a stack.' },
          { re: 'while\\s*\\(', hint: 'Pop every colder pending day when a warmer day arrives.' },
          { re: '-\\s*\\w+|\\w+\\s*-', hint: 'The answer is the difference between the two indices.' },
          { re: 'return', hint: 'Return the answer array.' }
        ],
        python: [
          { re: '\\[\\s*\\]|list\\(|deque\\(', hint: 'Keep unresolved days on a stack.' },
          { re: 'while\\s', hint: 'Pop every colder pending day when a warmer day arrives.' },
          { re: '-\\s*\\w+', hint: 'The answer is the difference between the two indices.' },
          { re: 'return', hint: 'Return the answer array.' }
        ]
      },
      mcq: [
        { q: 'What ordering does the stack maintain during the scan?',
          opts: ['Indices sorted by temperature ascending', 'Values in increasing order', 'Indices whose temperatures are non-increasing from bottom to top', 'Nothing in particular'],
          correct: 2,
          why: 'An index survives on the stack only while no warmer day has been seen, so anything above it must be colder or equal. That invariant is what makes a single pass sufficient.' }
      ]
    },

    {
      id: 'nc-car-fleet',
      title: 'Car Fleet',
      section: 'stack',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'There are n cars heading to the same destination at position target. Car i starts at position[i] and drives at speed[i]. A faster car catches up to a slower one ahead and then travels at the slower speed, forming a fleet. Return the number of fleets that arrive at the destination.',
      examples: [
        { in: 'target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]', out: '3' },
        { in: 'target = 10, position = [3], speed = [3]', out: '1' },
        { in: 'target = 100, position = [0,2,4], speed = [4,2,1]', out: '1' }
      ],
      approach: 'Convert each car into the time it would need to reach the target on its own: t = (target - position) / speed. Sort the cars by starting position in DESCENDING order so you process them from the one closest to the target backwards. Walk through that order carrying the largest time seen so far. If the current car needs strictly more time than the slowest car ahead of it, it can never catch up, so it leads a new fleet and becomes the new slowest. Otherwise it catches the fleet ahead and merges, contributing nothing.',
      keyInsight: 'Position order plus arrival time is enough; you never simulate the driving. The running maximum acts as a monotonic stack whose top is the only thing that ever matters, so an explicit stack can be reduced to one variable.',
      pitfalls: [
        'Sorting by speed or by time instead of by position. Only a car behind another can be blocked.',
        'Using integer division for the time. Two cars with different real arrival times can share a truncated integer time and be merged incorrectly.',
        'Using >= instead of > when comparing times. A car that arrives at exactly the same moment is part of the same fleet.'
      ],
      complexity: { time: 'O(n log n)', space: 'O(n)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int carFleet(int target, vector<int>& position, vector<int>& speed) {\n    // your code here\n}',
        python: 'def car_fleet(target, position, speed):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int carFleet(int target, vector<int>& position, vector<int>& speed) {\n    int n = position.size();\n    vector<pair<int,int>> cars(n);\n    for (int i = 0; i < n; i++) cars[i] = {position[i], speed[i]};\n    sort(cars.begin(), cars.end(), greater<pair<int,int>>());\n    int fleets = 0;\n    double slowest = 0.0;\n    for (const auto& c : cars) {\n        double t = (double)(target - c.first) / c.second;\n        if (t > slowest) {\n            fleets++;\n            slowest = t;\n        }\n    }\n    return fleets;\n}',
        python: 'def car_fleet(target, position, speed):\n    cars = sorted(zip(position, speed), reverse=True)\n    fleets = 0\n    slowest = 0.0\n    for p, s in cars:\n        t = (target - p) / s\n        if t > slowest:\n            fleets += 1\n            slowest = t\n    return fleets'
      },
      checks: {
        cpp: [
          { re: 'sort\\s*\\(|stable_sort\\s*\\(|priority_queue', hint: 'Order the cars by starting position.' },
          { re: 'double|float|1\\.0|0\\.0', hint: 'Arrival time must be a real number, not integer division.' },
          { re: 'target\\s*-|-\\s*\\w+\\.first|-\\s*position', hint: 'Time to finish is (target - position) / speed.' },
          { re: 'return', hint: 'Return the fleet count.' }
        ],
        python: [
          { re: 'sorted\\s*\\(|\\.sort\\s*\\(|heap', hint: 'Order the cars by starting position.' },
          { re: '/\\s*\\w+', hint: 'Time to finish is (target - position) / speed, using true division.' },
          { re: 'target\\s*-', hint: 'Compute the remaining distance from the target.' },
          { re: 'return', hint: 'Return the fleet count.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: '//\\s*speed|/\\s*speed\\[|\\bint\\s+t\\s*=', hint: 'Integer division of the arrival time merges fleets that actually arrive at different moments — use a double.' }],
        python: [{ re: '//', hint: 'Floor division of the arrival time merges fleets that actually arrive at different moments — use / instead.' }]
      },
      mcq: [
        { q: 'Why are the cars processed from the position closest to the target backwards?',
          opts: ['To make the sort stable', 'Because a car can only ever be blocked by a car ahead of it, so the leader must be known first', 'Because the fastest car always arrives first', 'To avoid floating point error'],
          correct: 1,
          why: 'Blocking flows from front to back. Processing front-first means the running maximum arrival time already describes everything ahead of the current car, which is exactly what decides whether it merges.' }
      ]
    },

    {
      id: 'nc-largest-rectangle-histogram',
      title: 'Largest Rectangle in Histogram',
      section: 'stack',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'Given an array heights representing the bar heights of a histogram where each bar has width 1, return the area of the largest rectangle that fits entirely inside the histogram.',
      examples: [
        { in: 'heights = [2,1,5,6,2,3]', out: '10' },
        { in: 'heights = [2,4]', out: '4' },
        { in: 'heights = [2,1,2]', out: '3' }
      ],
      approach: 'Every maximal rectangle is limited by some bar that is its shortest bar. So for each index t, find how far left and right the rectangle of height heights[t] can extend before it hits a strictly shorter bar. A monotonic increasing stack of indices computes both bounds in one pass. Push indices while heights rise. When the incoming bar at index i is not taller than the stack top, pop index t: the right bound is i (the first bar that is too short) and the left bound is the new stack top L (or -1 if the stack is empty), so the rectangle occupies indices L+1 .. i-1 and its width is i - L - 1. Process a virtual bar of height 0 at index n so every bar still on the stack gets popped and measured.',
      keyInsight: 'The stack top after a pop is exactly the previous smaller element, so one scan yields both the left and the right boundary of every candidate rectangle. The height-0 sentinel removes the need for a separate draining loop.',
      pitfalls: [
        'Computing the width as i - t instead of i - L - 1. The rectangle extends left past t, all the way to the previous shorter bar.',
        'Forgetting the empty-stack case, where the left bound is -1 and the width becomes the whole prefix i.',
        'Skipping the sentinel, which loses every rectangle whose right edge is the end of the array (for example a strictly increasing histogram).',
        'Using < instead of <= when popping. With equal heights either works, but only if the width formula still reaches back to the earlier equal bar; <= is the safe default.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int largestRectangleArea(vector<int>& heights) {\n    // your code here\n}',
        python: 'def largest_rectangle_area(heights):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int largestRectangleArea(vector<int>& heights) {\n    int n = heights.size();\n    stack<int> st;\n    int best = 0;\n    for (int i = 0; i <= n; i++) {\n        int h = (i == n) ? 0 : heights[i];\n        while (!st.empty() && heights[st.top()] >= h) {\n            int t = st.top();\n            st.pop();\n            int left = st.empty() ? -1 : st.top();\n            best = max(best, heights[t] * (i - left - 1));\n        }\n        st.push(i);\n    }\n    return best;\n}',
        python: 'def largest_rectangle_area(heights):\n    n = len(heights)\n    stack = []\n    best = 0\n    for i in range(n + 1):\n        h = 0 if i == n else heights[i]\n        while stack and heights[stack[-1]] >= h:\n            t = stack.pop()\n            left = stack[-1] if stack else -1\n            best = max(best, heights[t] * (i - left - 1))\n        stack.append(i)\n    return best'
      },
      checks: {
        cpp: [
          { re: 'stack\\s*<|vector\\s*<\\s*int\\s*>\\s*\\w+\\s*;|deque\\s*<', hint: 'Keep a stack of indices with increasing heights.' },
          { re: 'while\\s*\\(', hint: 'Pop while the incoming bar is shorter than the stack top.' },
          { re: 'max\\s*\\(|>\\s*best|>\\s*\\w+\\s*\\)', hint: 'Track the best area seen.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'The width uses the index just past the previous shorter bar.' }
        ],
        python: [
          { re: '\\[\\s*\\]|list\\(|deque\\(', hint: 'Keep a stack of indices with increasing heights.' },
          { re: 'while\\s', hint: 'Pop while the incoming bar is shorter than the stack top.' },
          { re: 'max\\s*\\(|>\\s*\\w+', hint: 'Track the best area seen.' },
          { re: '-\\s*1|\\+\\s*1', hint: 'The width uses the index just past the previous shorter bar.' }
        ]
      },
      mcq: [
        { q: 'You pop index t while scanning at index i, and the new stack top is index L (or -1 if the stack is empty). What is the width of the rectangle of height heights[t]?',
          opts: ['i - t', 'i - L', 'i - L - 1', 't - L'],
          correct: 2,
          why: 'The rectangle covers exactly the indices strictly between L and i, that is L+1 through i-1, which is i - L - 1 bars. Using i - t ignores the part of the rectangle that extends to the left of t.' }
      ]
    },

    {
      id: 'nc-next-greater-element',
      title: 'Next Greater Element I',
      section: 'stack',
      tier: 'intermediate',
      difficulty: 'Easy',
      prompt: 'nums1 is a subset of nums2 and both contain distinct integers. For each value in nums1, find its next greater element in nums2: the first value to its right in nums2 that is larger than it. Return -1 when there is none.',
      examples: [
        { in: 'nums1 = [4,1,2], nums2 = [1,3,4,2]', out: '[-1,3,-1]' },
        { in: 'nums1 = [2,4], nums2 = [1,2,3,4]', out: '[3,-1]' }
      ],
      approach: 'Precompute the answer for every value of nums2 in one monotonic-stack pass, then look up each query in O(1). Scan nums2 left to right with a stack holding values whose next greater element is still unknown, kept decreasing from the bottom up. When value v arrives, every stack entry smaller than v has just found its answer, so pop them and record nxt[popped] = v. Then push v. Anything left on the stack has no next greater element. Finally map each element of nums1 through the table, defaulting to -1.',
      keyInsight: 'Answering the queries independently is O(n*m); resolving them all in one monotonic pass over nums2 is O(n+m). Because the values are distinct they make safe hash-map keys, so the stack can hold values rather than indices.',
      pitfalls: [
        'Searching nums2 from scratch for each element of nums1, which is the quadratic brute force.',
        'Forgetting the -1 default for values whose answer was never recorded.',
        'Assuming the answer is the maximum to the right. It is the FIRST larger value, not the largest.'
      ],
      complexity: { time: 'O(n + m)', space: 'O(m)' },
      timeChoices: ['O(n * m)', 'O(n + m)', 'O(m log m)', 'O(m^2)'],
      timeAnswer: 1,
      starter: {
        cpp: 'vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {\n    // your code here\n}',
        python: 'def next_greater_element(nums1, nums2):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {\n    unordered_map<int,int> nxt;\n    stack<int> st;\n    for (int v : nums2) {\n        while (!st.empty() && st.top() < v) {\n            nxt[st.top()] = v;\n            st.pop();\n        }\n        st.push(v);\n    }\n    vector<int> res;\n    res.reserve(nums1.size());\n    for (int v : nums1) res.push_back(nxt.count(v) ? nxt[v] : -1);\n    return res;\n}',
        python: 'def next_greater_element(nums1, nums2):\n    nxt = {}\n    stack = []\n    for v in nums2:\n        while stack and stack[-1] < v:\n            nxt[stack.pop()] = v\n        stack.append(v)\n    return [nxt.get(v, -1) for v in nums1]'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<', hint: 'Store value -> next greater value in a hash map.' },
          { re: 'stack\\s*<|vector\\s*<|deque\\s*<', hint: 'Use a decreasing monotonic stack over nums2.' },
          { re: 'while\\s*\\(', hint: 'Pop every pending smaller value when a larger one arrives.' },
          { re: '-\\s*1', hint: 'Values with no answer report -1.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\(', hint: 'Store value -> next greater value in a dict.' },
          { re: '\\[\\s*\\]|list\\(|deque\\(', hint: 'Use a decreasing monotonic stack over nums2.' },
          { re: 'while\\s', hint: 'Pop every pending smaller value when a larger one arrives.' },
          { re: '-\\s*1', hint: 'Values with no answer report -1.' }
        ]
      },
      mcq: [
        { q: 'After the monotonic pass over nums2 finishes, what is true of the values still on the stack?',
          opts: ['They are the largest values in nums2', 'They have no next greater element, so their answer is -1', 'They are duplicates', 'They appear in nums1'],
          correct: 1,
          why: 'A value leaves the stack only when a strictly larger value appears to its right. Anything still there was never overtaken, so its answer is -1.' }
      ]
    },

    /* -------------------------------------------------------- binary search */
    {
      id: 'nc-binary-search',
      title: 'Binary Search',
      section: 'binary-search',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given a sorted array of distinct integers nums and a value target, return the index of target, or -1 if it is not present. The algorithm must run in O(log n).',
      examples: [
        { in: 'nums = [-1,0,3,5,9,12], target = 9', out: '4' },
        { in: 'nums = [-1,0,3,5,9,12], target = 2', out: '-1' },
        { in: 'nums = [5], target = 5', out: '0' }
      ],
      approach: 'Maintain an inclusive window [lo, hi] that is the only region target could still be in. While lo <= hi, look at mid. If nums[mid] equals target you are done. If nums[mid] is smaller, everything at mid and to its left is too small, so move lo to mid + 1. Otherwise move hi to mid - 1. The loop ends when lo > hi, which means the window is empty and target is absent.',
      keyInsight: 'The invariant is "if target exists it lies in [lo, hi]". Every branch must preserve that AND shrink the window, which is why both updates skip past mid rather than landing on it.',
      pitfalls: [
        'Writing while (lo < hi) with an inclusive hi. That stops with one untested candidate left and reports a present target as missing.',
        'Computing mid as (lo + hi) / 2 in C++, which can overflow a signed int when both bounds are large. Use lo + (hi - lo) / 2.',
        'Setting lo = mid or hi = mid with an inclusive window, which can leave the window unchanged and loop forever.'
      ],
      complexity: { time: 'O(log n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int search(vector<int>& nums, int target) {\n    // your code here\n}',
        python: 'def search(nums, target):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int search(vector<int>& nums, int target) {\n    int lo = 0, hi = (int)nums.size() - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}',
        python: 'def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(|\\bsearch\\s*\\(', hint: 'Halve the search window repeatedly.' },
          { re: '/\\s*2|>>\\s*1', hint: 'Take the midpoint of the window.' },
          { re: '\\+\\s*1|-\\s*1', hint: 'Move the bound past mid so the window always shrinks.' },
          { re: 'return', hint: 'Return the index or -1.' }
        ],
        python: [
          { re: 'while\\s|for\\s', hint: 'Halve the search window repeatedly.' },
          { re: '//\\s*2|>>\\s*1|/\\s*2', hint: 'Take the midpoint of the window.' },
          { re: '\\+\\s*1|-\\s*1', hint: 'Move the bound past mid so the window always shrinks.' },
          { re: 'return', hint: 'Return the index or -1.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'find\\s*\\(\\s*\\w+\\.begin', hint: 'std::find is a linear scan — the point of this problem is the O(log n) halving.' }],
        python: [{ re: '\\.index\\s*\\(', hint: 'list.index is a linear scan — the point of this problem is the O(log n) halving.' }]
      },
      mcq: [
        { q: 'With an inclusive upper bound hi = n - 1, what is the correct loop condition?',
          opts: ['while (lo < hi)', 'while (lo <= hi)', 'while (lo != hi)', 'while (mid < hi)'],
          correct: 1,
          why: 'The window [lo, hi] is empty only when lo > hi. Stopping at lo == hi leaves exactly one untested element, so a target sitting there is reported as missing.' }
      ]
    },

    {
      id: 'nc-search-2d-matrix',
      title: 'Search a 2D Matrix',
      section: 'binary-search',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'You are given an m x n matrix where each row is sorted in ascending order and the first value of every row is greater than the last value of the previous row. Return true if target is in the matrix. The algorithm must run in O(log(m*n)).',
      examples: [
        { in: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', out: 'true' },
        { in: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13', out: 'false' },
        { in: 'matrix = [[1]], target = 1', out: 'true' }
      ],
      approach: 'The stated ordering means that reading the matrix row by row produces one globally sorted sequence of m*n values. So run an ordinary binary search over the flat index range [0, m*n - 1] and translate a flat index i into a cell on the fly: the row is i / n and the column is i % n, where n is the number of COLUMNS. No data is copied; only the indexing changes.',
      keyInsight: 'A row-major matrix with globally increasing rows is a sorted array wearing a costume. Reindexing rather than rebuilding keeps the space at O(1).',
      pitfalls: [
        'Dividing by m (the number of rows) instead of n. It coincidentally works on square matrices and breaks everywhere else.',
        'Doing two binary searches, one for the row and one inside it. That is also correct and O(log m + log n), but the row search needs care about which row can contain target.',
        'Assuming the matrix is non-empty. Guard against zero rows before reading matrix[0].size().'
      ],
      complexity: { time: 'O(log(m*n))', space: 'O(1)' },
      timeChoices: ['O(m * n)', 'O(m + log n)', 'O(log(m * n))', 'O(m log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'bool searchMatrix(vector<vector<int>>& matrix, int target) {\n    // your code here\n}',
        python: 'def search_matrix(matrix, target):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool searchMatrix(vector<vector<int>>& matrix, int target) {\n    if (matrix.empty() || matrix[0].empty()) return false;\n    int m = matrix.size(), n = matrix[0].size();\n    int lo = 0, hi = m * n - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        int v = matrix[mid / n][mid % n];\n        if (v == target) return true;\n        if (v < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return false;\n}',
        python: 'def search_matrix(matrix, target):\n    if not matrix or not matrix[0]:\n        return False\n    m, n = len(matrix), len(matrix[0])\n    lo, hi = 0, m * n - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        v = matrix[mid // n][mid % n]\n        if v == target:\n            return True\n        if v < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return False'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Binary search over the flattened index range.' },
          { re: '%\\s*\\w+|\\[\\s*\\w+\\s*\\]\\s*\\[', hint: 'Translate the flat index into a row and column.' },
          { re: '/\\s*2|>>\\s*1', hint: 'Take the midpoint of the window.' },
          { re: 'return', hint: 'Return true or false.' }
        ],
        python: [
          { re: 'while\\s|for\\s', hint: 'Binary search over the flattened index range.' },
          { re: '%\\s*\\w+|\\]\\s*\\[', hint: 'Translate the flat index into a row and column.' },
          { re: '//\\s*2|/\\s*2|>>\\s*1', hint: 'Take the midpoint of the window.' },
          { re: 'return', hint: 'Return True or False.' }
        ]
      },
      mcq: [
        { q: 'For an m x n matrix flattened in row-major order, which mapping turns a flat index i back into a cell?',
          opts: ['matrix[i % m][i / m]', 'matrix[i / m][i % m]', 'matrix[i % n][i / n]', 'matrix[i / n][i % n]'],
          correct: 3,
          why: 'Each row holds n entries, so you divide by the number of columns to get the row and take the remainder for the column. Dividing by m is the classic mix-up that only survives on square matrices.' }
      ]
    },

    {
      id: 'nc-koko-bananas',
      title: 'Koko Eating Bananas',
      section: 'binary-search',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Koko has piles of bananas and h hours before the guards return. She picks an eating speed k bananas per hour. Each hour she eats from one pile; if that pile has fewer than k bananas she eats it all and does not touch another pile that hour. Return the minimum integer k that lets her finish all the piles within h hours.',
      examples: [
        { in: 'piles = [3,6,7,11], h = 8', out: '4' },
        { in: 'piles = [30,11,23,4,20], h = 5', out: '30' },
        { in: 'piles = [30,11,23,4,20], h = 6', out: '23' }
      ],
      approach: 'This is BINARY SEARCH ON THE ANSWER, the pattern most people miss because nothing in the input is sorted. You do not search the array; you search the space of candidate answers, here k in [1, max(piles)]. Write a feasibility test: at speed k the time is the sum over piles of ceil(pile / k), and k is feasible when that total is at most h. The test is MONOTONE — if speed k works then every speed above k also works — so the candidate range looks like false, false, ..., false, true, true, ... and you binary search for the first true. Use the lo < hi shape with hi = mid on success and lo = mid + 1 on failure so lo converges to the smallest feasible speed.',
      keyInsight: 'Whenever the answer is an integer in a known range and "does candidate x work?" is monotone, you can binary search the range even though the input array is unsorted. Only the feasibility predicate needs to be sorted, not the data.',
      pitfalls: [
        'Starting lo at 0. Speed 0 never finishes and causes a division by zero.',
        'Setting hi to sum(piles). It is correct but wasteful; no speed above max(piles) helps, because a single pile still costs a whole hour.',
        'Computing ceil with floating point. Use the integer form (pile + k - 1) / k to avoid rounding surprises.',
        'Overflowing the hour count on large inputs — accumulate in a 64-bit integer in C++.'
      ],
      complexity: { time: 'O(n log(max(piles)))', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n log(max(piles)))', 'O(n * max(piles))'],
      timeAnswer: 2,
      starter: {
        cpp: 'int minEatingSpeed(vector<int>& piles, int h) {\n    // your code here\n}',
        python: 'def min_eating_speed(piles, h):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int minEatingSpeed(vector<int>& piles, int h) {\n    int lo = 1, hi = *max_element(piles.begin(), piles.end());\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        long long hours = 0;\n        for (int p : piles) hours += (p + mid - 1) / mid;\n        if (hours <= (long long)h) hi = mid;\n        else lo = mid + 1;\n    }\n    return lo;\n}',
        python: 'def min_eating_speed(piles, h):\n    lo, hi = 1, max(piles)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        hours = sum((p + mid - 1) // mid for p in piles)\n        if hours <= h:\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Binary search the candidate speeds.' },
          { re: 'max_element|max\\s*\\(|sort', hint: 'The upper bound of the search is the largest pile.' },
          { re: '\\+\\s*\\w+\\s*-\\s*1|ceil|\\+\\s*mid\\s*-', hint: 'Hours for one pile is the ceiling of pile / k.' },
          { re: '<=[\\s\\S]{0,24}\\bh\\b|>[\\s\\S]{0,24}\\bh\\b|hours?\\s*<=', hint: 'A speed is feasible when the total hours fit within h.' }
        ],
        python: [
          { re: 'while\\s|for\\s', hint: 'Binary search the candidate speeds.' },
          { re: 'max\\s*\\(|sort', hint: 'The upper bound of the search is the largest pile.' },
          { re: '\\+\\s*\\w+\\s*-\\s*1|ceil|-\\s*-', hint: 'Hours for one pile is the ceiling of pile / k.' },
          { re: '<=[\\s\\S]{0,24}\\bh\\b|>[\\s\\S]{0,24}\\bh\\b|hours?\\s*<=', hint: 'A speed is feasible when the total hours fit within h.' }
        ]
      },
      mcq: [
        { q: 'What property of the feasibility test makes binary search on the answer valid here?',
          opts: ['The piles array is sorted', 'If speed k finishes in time then every speed greater than k also finishes in time', 'The answer is always max(piles)', 'The number of piles is at most h'],
          correct: 1,
          why: 'Monotone feasibility turns the candidate range into a sorted sequence of false values followed by true values, so binary search can locate the first true. The input array itself never has to be sorted.' }
      ]
    },

    {
      id: 'nc-find-min-rotated',
      title: 'Find Minimum in Rotated Sorted Array',
      section: 'binary-search',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'An array of distinct integers sorted in ascending order was rotated between 1 and n times. Return its minimum element in O(log n) time.',
      examples: [
        { in: 'nums = [3,4,5,1,2]', out: '1' },
        { in: 'nums = [4,5,6,7,0,1,2]', out: '0' },
        { in: 'nums = [11,13,15,17]', out: '11' }
      ],
      approach: 'Use the lo < hi shape, which converges on a single surviving index rather than looking for an exact match. Compare nums[mid] with nums[hi]. If nums[mid] > nums[hi] then the rotation point is strictly to the right of mid, so the minimum is in (mid, hi] and you set lo = mid + 1. Otherwise the segment from mid to hi is already in order, so the minimum is at mid or to its left and you set hi = mid — never mid - 1, because mid itself might be the answer. When lo == hi, that index holds the minimum.',
      keyInsight: 'Compare against the RIGHT end, not the left. nums[mid] >= nums[lo] is true both for a rotated and for an unrotated segment, so the left comparison cannot tell them apart without an extra case; nums[hi] can.',
      pitfalls: [
        'Writing hi = mid - 1 in the second branch, which can discard the minimum itself.',
        'Comparing nums[mid] with nums[lo]. On an already sorted array like [1,2,3] that test sends you into the wrong half.',
        'Using while (lo <= hi) with hi = mid, which never terminates because the window can stop shrinking.'
      ],
      complexity: { time: 'O(log n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int findMin(vector<int>& nums) {\n    // your code here\n}',
        python: 'def find_min(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int findMin(vector<int>& nums) {\n    int lo = 0, hi = (int)nums.size() - 1;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (nums[mid] > nums[hi]) lo = mid + 1;\n        else hi = mid;\n    }\n    return nums[lo];\n}',
        python: 'def find_min(nums):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] > nums[hi]:\n            lo = mid + 1\n        else:\n            hi = mid\n    return nums[lo]'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Halve the window until one candidate is left.' },
          { re: '/\\s*2|>>\\s*1', hint: 'Take the midpoint.' },
          { re: 'nums\\s*\\[\\s*hi|nums\\s*\\[\\s*\\w+\\s*\\]\\s*[<>]', hint: 'Compare the middle value against a bound to decide which half survives.' },
          { re: 'return', hint: 'Return the minimum value.' }
        ],
        python: [
          { re: 'while\\s|for\\s', hint: 'Halve the window until one candidate is left.' },
          { re: '//\\s*2|/\\s*2|>>\\s*1', hint: 'Take the midpoint.' },
          { re: 'nums\\s*\\[\\s*\\w+\\s*\\]\\s*[<>]', hint: 'Compare the middle value against a bound to decide which half survives.' },
          { re: 'return', hint: 'Return the minimum value.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'min_element|sort\\s*\\(', hint: 'A linear min or a sort ignores the O(log n) requirement.' }],
        python: [{ re: '\\bmin\\s*\\(\\s*nums\\s*\\)|sorted\\s*\\(|\\.sort\\s*\\(', hint: 'A linear min or a sort ignores the O(log n) requirement.' }]
      },
      mcq: [
        { q: 'In the branch where nums[mid] <= nums[hi], why is the update hi = mid rather than hi = mid - 1?',
          opts: ['To avoid an infinite loop', 'Because mid itself may be the minimum', 'Because mid - 1 could be negative', 'It makes no difference'],
          correct: 1,
          why: 'That branch only proves the segment from mid to hi is in order, which means mid is the smallest value in it. Excluding mid would throw away the answer on an already sorted array.' }
      ]
    },

    {
      id: 'nc-search-rotated',
      title: 'Search in Rotated Sorted Array',
      section: 'binary-search',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'A sorted array of distinct integers was rotated at some unknown pivot. Given the rotated array nums and a value target, return the index of target or -1. The algorithm must run in O(log n).',
      examples: [
        { in: 'nums = [4,5,6,7,0,1,2], target = 0', out: '4' },
        { in: 'nums = [4,5,6,7,0,1,2], target = 3', out: '-1' },
        { in: 'nums = [1], target = 0', out: '-1' }
      ],
      approach: 'A rotated array always has at least one sorted half around any midpoint. Use the inclusive lo <= hi shape. At each step, if nums[lo] <= nums[mid] the LEFT half is sorted, so check whether target lies inside [nums[lo], nums[mid]) and keep that half, otherwise discard it. If the left half is not sorted then the RIGHT half must be, so check whether target lies inside (nums[mid], nums[hi]] and keep it, otherwise discard. Each iteration eliminates half the array, so the search stays logarithmic.',
      keyInsight: 'You never need to find the pivot first. Identifying which half is sorted, and then doing an ordinary range containment test inside that half, is enough to decide where to go.',
      pitfalls: [
        'Using < instead of <= for nums[lo] <= nums[mid]. When lo == mid, a strict comparison marks a one-element half as unsorted and sends you into the wrong branch.',
        'Getting the containment bounds inclusive on the wrong side. nums[mid] is already tested by the equality check, so the left test is target >= nums[lo] && target < nums[mid].',
        'Trying to locate the rotation point first with a fragile second binary search when one pass is enough.'
      ],
      complexity: { time: 'O(log n)', space: 'O(1)' },
      timeChoices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int searchRotated(vector<int>& nums, int target) {\n    // your code here\n}',
        python: 'def search_rotated(nums, target):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int searchRotated(vector<int>& nums, int target) {\n    int lo = 0, hi = (int)nums.size() - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[lo] <= nums[mid]) {\n            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;\n            else lo = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;\n            else hi = mid - 1;\n        }\n    }\n    return -1;\n}',
        python: 'def search_rotated(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[lo] <= nums[mid]:\n            if nums[lo] <= target < nums[mid]:\n                hi = mid - 1\n            else:\n                lo = mid + 1\n        else:\n            if nums[mid] < target <= nums[hi]:\n                lo = mid + 1\n            else:\n                hi = mid - 1\n    return -1'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Halve the window on every step.' },
          { re: '/\\s*2|>>\\s*1', hint: 'Take the midpoint.' },
          { re: 'nums\\s*\\[\\s*lo|nums\\s*\\[\\s*hi|nums\\s*\\[\\s*\\w+\\s*\\]\\s*<=', hint: 'Decide which half is sorted by comparing an endpoint with the midpoint.' },
          { re: '-\\s*1', hint: 'Return -1 when target is absent.' }
        ],
        python: [
          { re: 'while\\s|for\\s', hint: 'Halve the window on every step.' },
          { re: '//\\s*2|/\\s*2|>>\\s*1', hint: 'Take the midpoint.' },
          { re: 'nums\\s*\\[\\s*\\w+\\s*\\]\\s*<=|nums\\s*\\[\\s*\\w+\\s*\\]\\s*<', hint: 'Decide which half is sorted by comparing an endpoint with the midpoint.' },
          { re: '-\\s*1', hint: 'Return -1 when target is absent.' }
        ]
      },
      mcq: [
        { q: 'Why must the sorted-half test be nums[lo] <= nums[mid] rather than nums[lo] < nums[mid]?',
          opts: ['To handle duplicate values', 'Because when the window shrinks to one element lo == mid, and a strict test would wrongly call that half unsorted', 'To prevent overflow', 'Because the array might not be rotated'],
          correct: 1,
          why: 'With a two-element window mid equals lo, so nums[lo] < nums[mid] is false even though a single element is trivially sorted. The strict form sends the search into the wrong branch and misses the target.' }
      ]
    },

    {
      id: 'nc-time-map',
      title: 'Time Based Key-Value Store',
      section: 'binary-search',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Design a store with two operations. set(key, value, timestamp) stores a value at a given timestamp. get(key, timestamp) returns the value that was set for that key at the largest stored timestamp less than or equal to the query, or the empty string if none exists. Calls to set for a given key arrive with strictly increasing timestamps.',
      examples: [
        { in: 'set("foo","bar",1); get("foo",1)', out: '"bar"' },
        { in: 'get("foo",3) after only timestamp 1 was set', out: '"bar"' },
        { in: 'set("foo","bar2",4); get("foo",4); get("foo",5)', out: '"bar2" and "bar2"' },
        { in: 'get("foo",0) with the earliest stored timestamp being 1', out: '""' }
      ],
      approach: 'Store each key in a hash map pointing to a list of (timestamp, value) pairs. Because sets arrive in increasing timestamp order, appending keeps every list sorted for free, making set O(1). get is an upper-bound binary search over that list: whenever the middle timestamp is within budget, remember its value as the best candidate so far and move lo past mid to look for an even later valid entry; otherwise move hi below mid. When the window empties, the last remembered candidate is the answer, and no candidate at all means the empty string.',
      keyInsight: 'This is the "find the last element that satisfies a predicate" flavour of binary search. Saving the candidate before continuing right is what turns an exact-match search into an upper-bound search.',
      pitfalls: [
        'Searching for an exact timestamp match and returning empty otherwise. The query rarely matches exactly.',
        'Sorting the list on every set. The increasing-timestamp guarantee already keeps it sorted.',
        'Returning the smallest timestamp greater than or equal to the query, which is the opposite bound.',
        'Forgetting that a key may be absent entirely.'
      ],
      complexity: { time: 'O(1) for set, O(log n) for get', space: 'O(n)' },
      timeChoices: ['O(1) set, O(log n) get', 'O(log n) set, O(1) get', 'O(n) set, O(n) get', 'O(n log n) set, O(1) get'],
      timeAnswer: 0,
      starter: {
        cpp: 'class TimeMap {\npublic:\n    TimeMap() {\n        // your code here\n    }\n    void set(string key, string value, int timestamp) {\n        // your code here\n    }\n    string get(string key, int timestamp) {\n        // your code here\n    }\n};',
        python: 'class TimeMap:\n    def __init__(self):\n        # your code here\n        pass\n\n    def set(self, key, value, timestamp):\n        pass\n\n    def get(self, key, timestamp):\n        pass'
      },
      solution: {
        cpp: 'class TimeMap {\n    unordered_map<string, vector<pair<int,string>>> data;\npublic:\n    TimeMap() {}\n\n    void set(string key, string value, int timestamp) {\n        data[key].push_back({timestamp, value});\n    }\n\n    string get(string key, int timestamp) {\n        auto it = data.find(key);\n        if (it == data.end()) return "";\n        const vector<pair<int,string>>& arr = it->second;\n        int lo = 0, hi = (int)arr.size() - 1;\n        string best = "";\n        while (lo <= hi) {\n            int mid = lo + (hi - lo) / 2;\n            if (arr[mid].first <= timestamp) {\n                best = arr[mid].second;\n                lo = mid + 1;\n            } else {\n                hi = mid - 1;\n            }\n        }\n        return best;\n    }\n};',
        python: 'class TimeMap:\n    def __init__(self):\n        self.data = {}\n\n    def set(self, key, value, timestamp):\n        self.data.setdefault(key, []).append((timestamp, value))\n\n    def get(self, key, timestamp):\n        arr = self.data.get(key, [])\n        lo, hi = 0, len(arr) - 1\n        best = ""\n        while lo <= hi:\n            mid = (lo + hi) // 2\n            if arr[mid][0] <= timestamp:\n                best = arr[mid][1]\n                lo = mid + 1\n            else:\n                hi = mid - 1\n        return best'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<', hint: 'Index the per-key history by key.' },
          { re: 'while\\s*\\(|lower_bound|upper_bound|binary_search', hint: 'Binary search the timestamps rather than scanning.' },
          { re: '<=\\s*timestamp|<=\\s*\\w+', hint: 'Accept any stored timestamp at or below the query.' },
          { re: 'return', hint: 'Return the stored value or the empty string.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\(|defaultdict', hint: 'Index the per-key history by key.' },
          { re: 'while\\s|bisect', hint: 'Binary search the timestamps rather than scanning.' },
          { re: '<=\\s*timestamp|<=\\s*\\w+', hint: 'Accept any stored timestamp at or below the query.' },
          { re: 'return', hint: 'Return the stored value or the empty string.' }
        ]
      },
      mcq: [
        { q: 'Which loop body finds the value at the largest timestamp not exceeding the query?',
          opts: ['Return immediately when the timestamps are equal, otherwise return empty', 'Record the value whenever arr[mid].time <= query, then set lo = mid + 1', 'Record the value whenever arr[mid].time >= query, then set hi = mid - 1', 'Return arr[0] if its time is below the query'],
          correct: 1,
          why: 'This is an upper-bound search: any valid mid is a better answer than the previous candidate, so you save it and keep looking to the right for a later timestamp that is still within budget.' }
      ]
    },

    {
      id: 'nc-median-two-sorted',
      title: 'Median of Two Sorted Arrays',
      section: 'binary-search',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'Given two sorted arrays nums1 and nums2 of sizes m and n, return the median of the combined sorted array. The overall run time must be O(log(min(m, n))).',
      examples: [
        { in: 'nums1 = [1,3], nums2 = [2]', out: '2.0' },
        { in: 'nums1 = [1,2], nums2 = [3,4]', out: '2.5' },
        { in: 'nums1 = [], nums2 = [1]', out: '1.0' }
      ],
      approach: 'Search for a partition, not for a value. Always binary search the SHORTER array so the index range is O(log(min(m,n))). Pick i elements from nums1 for the left side; then j = (m + n + 1) / 2 - i elements must come from nums2 so the left side holds exactly half (rounded up) of everything. The partition is correct when both cross conditions hold: the last element taken from nums1 is at most the first element left in nums2, and vice versa. Use negative and positive infinity sentinels when a side is empty. If the left of nums1 is too big, move hi to i - 1; otherwise move lo to i + 1. Once correct, an odd total makes the median the larger of the two left ends, and an even total averages that with the smaller of the two right ends.',
      keyInsight: 'The median is defined purely by where the combined array splits in half, so you can binary search over split positions and never merge anything. Only one index is free because the second is forced by the half-size constraint.',
      pitfalls: [
        'Binary searching the longer array, which lets j fall outside [0, n].',
        'Forgetting the infinity sentinels for i == 0, i == m, j == 0 or j == n, which makes empty-side partitions crash.',
        'Using (m + n) / 2 for the half size. The +1 is what makes the odd case put the extra element on the left.',
        'Merging the arrays instead. It is easy and O(m + n), but it fails the stated logarithmic requirement.'
      ],
      complexity: { time: 'O(log(min(m, n)))', space: 'O(1)' },
      timeChoices: ['O(m + n)', 'O((m + n) log(m + n))', 'O(log(m * n))', 'O(log(min(m, n)))'],
      timeAnswer: 3,
      starter: {
        cpp: 'double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    // your code here\n}',
        python: 'def find_median_sorted_arrays(nums1, nums2):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);\n    int m = (int)nums1.size(), n = (int)nums2.size();\n    int half = (m + n + 1) / 2;\n    int lo = 0, hi = m;\n    while (lo <= hi) {\n        int i = lo + (hi - lo) / 2;\n        int j = half - i;\n        long long l1 = (i == 0) ? LLONG_MIN : nums1[i - 1];\n        long long r1 = (i == m) ? LLONG_MAX : nums1[i];\n        long long l2 = (j == 0) ? LLONG_MIN : nums2[j - 1];\n        long long r2 = (j == n) ? LLONG_MAX : nums2[j];\n        if (l1 <= r2 && l2 <= r1) {\n            if ((m + n) % 2 == 1) return (double)max(l1, l2);\n            return (double)(max(l1, l2) + min(r1, r2)) / 2.0;\n        }\n        if (l1 > r2) hi = i - 1;\n        else lo = i + 1;\n    }\n    return 0.0;\n}',
        python: 'def find_median_sorted_arrays(nums1, nums2):\n    if len(nums1) > len(nums2):\n        nums1, nums2 = nums2, nums1\n    m, n = len(nums1), len(nums2)\n    half = (m + n + 1) // 2\n    lo, hi = 0, m\n    while lo <= hi:\n        i = (lo + hi) // 2\n        j = half - i\n        l1 = float("-inf") if i == 0 else nums1[i - 1]\n        r1 = float("inf") if i == m else nums1[i]\n        l2 = float("-inf") if j == 0 else nums2[j - 1]\n        r2 = float("inf") if j == n else nums2[j]\n        if l1 <= r2 and l2 <= r1:\n            if (m + n) % 2 == 1:\n                return float(max(l1, l2))\n            return (max(l1, l2) + min(r1, r2)) / 2.0\n        if l1 > r2:\n            hi = i - 1\n        else:\n            lo = i + 1\n    return 0.0'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Binary search over the partition index.' },
          { re: 'LLONG_MIN|INT_MIN|LLONG_MAX|INT_MAX|numeric_limits', hint: 'Use sentinels for the empty side of a partition.' },
          { re: 'max\\s*\\(|min\\s*\\(', hint: 'The median comes from the extremes on either side of the split.' },
          { re: '2\\.0|/\\s*2|double', hint: 'The even case averages two values, so use floating point.' }
        ],
        python: [
          { re: 'while\\s|for\\s', hint: 'Binary search over the partition index.' },
          { re: 'inf|float\\s*\\(', hint: 'Use sentinels for the empty side of a partition.' },
          { re: 'max\\s*\\(|min\\s*\\(', hint: 'The median comes from the extremes on either side of the split.' },
          { re: '2\\.0|/\\s*2', hint: 'The even case averages two values, so use true division.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'sort\\s*\\(\\s*\\w+\\.begin|merge\\s*\\(', hint: 'Merging or sorting the two arrays is O(m + n) and misses the O(log(min(m, n))) requirement.' }],
        python: [{ re: 'sorted\\s*\\(|\\.sort\\s*\\(', hint: 'Merging or sorting the two arrays is O(m + n) and misses the O(log(min(m, n))) requirement.' }]
      },
      mcq: [
        { q: 'Once i elements are taken from nums1 for the left side, how many must come from nums2?',
          opts: ['(m + n) / 2 - i', '(m + n + 1) / 2 - i', 'i', 'n / 2 - i'],
          correct: 1,
          why: 'The left side must hold exactly ceil((m+n)/2) elements so that on an odd total the median sits at its right edge. The +1 before the halving is what produces that rounding up.' }
      ]
    },

    {
      id: 'nc-ship-packages',
      title: 'Capacity to Ship Packages Within D Days',
      section: 'binary-search',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'A conveyor belt has packages that must be shipped within days days. Packages are loaded onto the ship in the given order and the total weight loaded on any day may not exceed the ship capacity. Return the least capacity that lets everything ship in time.',
      examples: [
        { in: 'weights = [1,2,3,4,5,6,7,8,9,10], days = 5', out: '15' },
        { in: 'weights = [3,2,2,4,1,4], days = 3', out: '6' },
        { in: 'weights = [1,2,3,1,1], days = 4', out: '3' }
      ],
      approach: 'Another BINARY SEARCH ON THE ANSWER. The candidate capacities run from max(weights) (any smaller capacity cannot even carry the heaviest single package) up to sum(weights) (everything in one day). Feasibility is a greedy simulation: walk the packages in order, keep adding to the current day while the running load stays within the candidate capacity, and start a new day whenever the next package would overflow. The candidate works when the day count is at most days. Feasibility is monotone — a larger ship never needs more days — so binary search for the smallest feasible capacity with lo < hi, hi = mid on success and lo = mid + 1 on failure.',
      keyInsight: 'Same shape as Koko Eating Bananas: an unsorted input, but a monotone yes/no test over a numeric answer range. Identify the range endpoints from first principles and the rest is a textbook lower-bound search.',
      pitfalls: [
        'Starting lo at 1 or at 0. Any capacity below the heaviest package is infeasible and the greedy simulation would loop or miscount.',
        'Being greedy about which packages go together. The order is fixed, so you may only choose where to split.',
        'Off-by-one in the day count. Starting at need = 1 and incrementing on each overflow counts days correctly; starting at 0 undercounts by one.',
        'Returning mid from inside the loop. With the lo < hi shape the answer is lo after convergence.'
      ],
      complexity: { time: 'O(n log(sum(weights)))', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n log(sum(weights)))', 'O(n * days)'],
      timeAnswer: 2,
      starter: {
        cpp: 'int shipWithinDays(vector<int>& weights, int days) {\n    // your code here\n}',
        python: 'def ship_within_days(weights, days):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int shipWithinDays(vector<int>& weights, int days) {\n    int lo = *max_element(weights.begin(), weights.end());\n    int hi = accumulate(weights.begin(), weights.end(), 0);\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        int need = 1, cur = 0;\n        for (int w : weights) {\n            if (cur + w > mid) {\n                need++;\n                cur = 0;\n            }\n            cur += w;\n        }\n        if (need <= days) hi = mid;\n        else lo = mid + 1;\n    }\n    return lo;\n}',
        python: 'def ship_within_days(weights, days):\n    lo, hi = max(weights), sum(weights)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        need, cur = 1, 0\n        for w in weights:\n            if cur + w > mid:\n                need += 1\n                cur = 0\n            cur += w\n        if need <= days:\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(', hint: 'Binary search the candidate capacities.' },
          { re: 'max_element|accumulate|max\\s*\\(|sort', hint: 'The range runs from the heaviest package to the total weight.' },
          { re: 'for\\s*\\(', hint: 'Simulate loading the packages in order for a candidate capacity.' },
          { re: '<=\\s*days|>\\s*days|<=\\s*\\w+', hint: 'A capacity is feasible when the day count fits.' }
        ],
        python: [
          { re: 'while\\s', hint: 'Binary search the candidate capacities.' },
          { re: 'max\\s*\\(|sum\\s*\\(|sort', hint: 'The range runs from the heaviest package to the total weight.' },
          { re: 'for\\s+\\w+', hint: 'Simulate loading the packages in order for a candidate capacity.' },
          { re: '<=\\s*days|>\\s*days|<=\\s*\\w+', hint: 'A capacity is feasible when the day count fits.' }
        ]
      },
      mcq: [
        { q: 'Why is the lower bound of the capacity search max(weights) rather than 1?',
          opts: ['To make the search converge faster only', 'Because a capacity below the heaviest package can never ship that package at all', 'Because the answer is always the maximum', 'Because weights are positive'],
          correct: 1,
          why: 'Packages cannot be split, so any capacity smaller than the heaviest single package is infeasible for every number of days. Starting there keeps the feasibility predicate well defined across the whole range.' }
      ]
    },

    {
      id: 'nc-first-bad-version',
      title: 'First Bad Version',
      section: 'binary-search',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Versions 1..n were released in order and one bad version broke every version after it. You are given an API isBadVersion(v) that returns whether version v is bad. Find the first bad version using as few API calls as possible.',
      examples: [
        { in: 'n = 5, first bad = 4', out: '4' },
        { in: 'n = 1, first bad = 1', out: '1' },
        { in: 'n = 2, first bad = 1', out: '1' }
      ],
      approach: 'The version line reads good, good, ..., good, bad, bad, ..., bad, which is a sorted sequence of booleans. That is precisely what a lower-bound binary search consumes. Use the lo < hi shape over [1, n]. If mid is bad, the first bad version is mid or earlier, so set hi = mid — keeping mid, because it is still a candidate. If mid is good, everything up to and including mid is good, so set lo = mid + 1. When lo == hi the loop stops on the answer, and no extra API call is needed.',
      keyInsight: 'Binary search does not need numbers, only a monotone predicate. Here the predicate is isBadVersion, and the answer is the boundary where it flips from false to true.',
      pitfalls: [
        'Writing hi = mid - 1 when mid is bad, which can skip past the very first bad version.',
        'Using while (lo <= hi) together with hi = mid, which never terminates.',
        'Computing (lo + hi) / 2 in C++ when n is near INT_MAX, which overflows into a negative index.',
        'Making an extra API call after the loop. Convergence already proves lo is the boundary.'
      ],
      complexity: { time: 'O(log n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      timeAnswer: 1,
      starter: {
        cpp: 'bool isBadVersion(int version);\n\nint firstBadVersion(int n) {\n    // your code here\n}',
        python: 'def first_bad_version(n, is_bad_version):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool isBadVersion(int version);\n\nint firstBadVersion(int n) {\n    int lo = 1, hi = n;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (isBadVersion(mid)) hi = mid;\n        else lo = mid + 1;\n    }\n    return lo;\n}',
        python: 'def first_bad_version(n, is_bad_version):\n    lo, hi = 1, n\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if is_bad_version(mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Halve the version range instead of scanning it.' },
          { re: 'isBadVersion', hint: 'Query the API at the midpoint.' },
          { re: '/\\s*2|>>\\s*1', hint: 'Take the midpoint of the range.' },
          { re: 'return', hint: 'Return the first bad version.' }
        ],
        python: [
          { re: 'while\\s|for\\s', hint: 'Halve the version range instead of scanning it.' },
          { re: 'is_bad_version|isBadVersion', hint: 'Query the API at the midpoint.' },
          { re: '//\\s*2|/\\s*2|>>\\s*1', hint: 'Take the midpoint of the range.' },
          { re: 'return', hint: 'Return the first bad version.' }
        ]
      },
      mcq: [
        { q: 'When isBadVersion(mid) is true, which update is correct?',
          opts: ['hi = mid', 'hi = mid - 1', 'lo = mid', 'lo = mid + 1'],
          correct: 0,
          why: 'A bad mid means the boundary is at mid or to its left, and mid itself is still a candidate. Using mid - 1 discards the answer whenever mid IS the first bad version.' }
      ]
    },

    /* ---------------------------------------------------------- linked list */
    {
      id: 'nc-reverse-linked-list',
      title: 'Reverse Linked List',
      section: 'linked-list',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given the head of a singly linked list, reverse the list and return the new head.',
      examples: [
        { in: 'head = [1,2,3,4,5]', out: '[5,4,3,2,1]' },
        { in: 'head = [1,2]', out: '[2,1]' },
        { in: 'head = []', out: '[]' }
      ],
      approach: 'Carry three references: the node behind you (prev, initially null), the node you are on, and the node ahead. On each step, save the next pointer into a temporary FIRST, then flip the current node to point at prev, then slide prev and the cursor forward one node. When the cursor falls off the end, prev is the new head. The original head becomes the tail and correctly ends up pointing at null because prev started as null.',
      keyInsight: 'The order of the three writes is the whole problem. Overwriting next before saving it strands the rest of the list, so a single temporary is what makes an in-place O(1) reversal possible.',
      pitfalls: [
        'Writing head.next = prev before saving head.next, which loses every remaining node.',
        'Returning the original head. After reversal the original head is the tail; the new head is prev.',
        'Forgetting the empty-list case. Starting prev at null makes it fall out naturally.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'],
      timeAnswer: 0,
      starter: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* reverseList(ListNode* head) {\n    // your code here\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef reverse_list(head):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* reverseList(ListNode* head) {\n    ListNode* prev = nullptr;\n    while (head != nullptr) {\n        ListNode* nxt = head->next;\n        head->next = prev;\n        prev = head;\n        head = nxt;\n    }\n    return prev;\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef reverse_list(head):\n    prev = None\n    while head is not None:\n        nxt = head.next\n        head.next = prev\n        prev = head\n        head = nxt\n    return prev'
      },
      checks: {
        cpp: [
          { re: '->\\s*next\\s*=', hint: 'Rewrite each next pointer so it points backwards.' },
          { re: 'nullptr|NULL|\\b0\\b', hint: 'The old head must end up pointing at null.' },
          { re: 'return', hint: 'Return the new head.' }
        ],
        python: [
          { re: '\\.next\\s*=', hint: 'Rewrite each next pointer so it points backwards.' },
          { re: 'None', hint: 'The old head must end up pointing at None.' },
          { re: 'return', hint: 'Return the new head.' }
        ]
      },
      mcq: [
        { q: 'Why must the next pointer be copied into a temporary before it is overwritten?',
          opts: ['Otherwise the rest of the list becomes unreachable', 'Otherwise prev is corrupted', 'Otherwise the head node leaks', 'Otherwise the loop runs one extra iteration'],
          correct: 0,
          why: 'That pointer is the only reference to the remaining nodes. Once it is replaced by prev there is no way back, so the traversal stops after one node.' }
      ]
    },

    {
      id: 'nc-merge-two-lists',
      title: 'Merge Two Sorted Lists',
      section: 'linked-list',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'You are given the heads of two sorted linked lists. Splice them together into one sorted list by reusing the existing nodes, and return the head of the merged list.',
      examples: [
        { in: 'a = [1,2,4], b = [1,3,4]', out: '[1,1,2,3,4,4]' },
        { in: 'a = [], b = []', out: '[]' },
        { in: 'a = [], b = [0]', out: '[0]' }
      ],
      approach: 'Allocate a dummy node whose next pointer will eventually hold the real head, and keep a tail cursor on it. While both lists still have nodes, attach whichever head is smaller and advance that list. When one list runs out, attach the remainder of the other in one move — no loop needed, since it is already sorted. Return dummy.next.',
      keyInsight: 'The dummy head removes the "is the output list still empty?" branch from every iteration, so one loop body handles the first node and every later node identically.',
      pitfalls: [
        'Special-casing the first node instead of using a dummy, which multiplies the number of branches and the number of bugs.',
        'Forgetting to attach the leftover tail after the loop.',
        'Using < instead of <= when comparing, which is still correct here but silently destabilises the merge if the problem ever demands stability.',
        'Allocating brand new nodes when the problem asks you to splice existing ones.'
      ],
      complexity: { time: 'O(n + m)', space: 'O(1)' },
      timeChoices: ['O(n * m)', 'O(n + m)', 'O((n + m) log(n + m))', 'O(log(n + m))'],
      timeAnswer: 1,
      starter: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* mergeTwoLists(ListNode* a, ListNode* b) {\n    // your code here\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef merge_two_lists(a, b):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* mergeTwoLists(ListNode* a, ListNode* b) {\n    ListNode dummy(0);\n    ListNode* tail = &dummy;\n    while (a != nullptr && b != nullptr) {\n        if (a->val <= b->val) {\n            tail->next = a;\n            a = a->next;\n        } else {\n            tail->next = b;\n            b = b->next;\n        }\n        tail = tail->next;\n    }\n    tail->next = (a != nullptr) ? a : b;\n    return dummy.next;\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef merge_two_lists(a, b):\n    dummy = ListNode(0)\n    tail = dummy\n    while a is not None and b is not None:\n        if a.val <= b.val:\n            tail.next = a\n            a = a.next\n        else:\n            tail.next = b\n            b = b.next\n        tail = tail.next\n    tail.next = a if a is not None else b\n    return dummy.next'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(|mergeTwoLists\\s*\\(', hint: 'Walk both lists together (or recurse).' },
          { re: '->\\s*val\\s*<|->\\s*val\\s*>|<=|>=', hint: 'Compare the two current values to pick the next node.' },
          { re: '->\\s*next\\s*=', hint: 'Splice the chosen node onto the output.' },
          { re: 'return', hint: 'Return the merged head.' }
        ],
        python: [
          { re: 'while\\s|for\\s|def\\s+\\w+', hint: 'Walk both lists together (or recurse).' },
          { re: '\\.val\\s*<|\\.val\\s*>|<=|>=', hint: 'Compare the two current values to pick the next node.' },
          { re: '\\.next\\s*=', hint: 'Splice the chosen node onto the output.' },
          { re: 'return', hint: 'Return the merged head.' }
        ]
      },
      mcq: [
        { q: 'What does the dummy head node buy you?',
          opts: ['It makes the list circular', 'It stores the length of the merged list', 'It removes the special case for writing the first output node', 'It allows O(1) random access'],
          correct: 2,
          why: 'Without a sentinel every append needs an "is the output empty?" test. With one, you always write tail.next and return dummy.next at the end.' }
      ]
    },

    {
      id: 'nc-linked-list-cycle',
      title: 'Linked List Cycle',
      section: 'linked-list',
      tier: 'intermediate',
      difficulty: 'Easy',
      prompt: 'Given the head of a linked list, determine whether the list contains a cycle. Solve it using O(1) extra space.',
      examples: [
        { in: 'head = [3,2,0,-4] with the tail linked back to index 1', out: 'true' },
        { in: 'head = [1,2] with the tail linked back to index 0', out: 'true' },
        { in: 'head = [1] with no cycle', out: 'false' }
      ],
      approach: 'Run two cursors from the head: slow advances one node per step, fast advances two. If the list ends, fast (or fast.next) becomes null and there is no cycle. If there is a cycle both cursors eventually enter it, and because fast closes the gap by exactly one node per step it must land on slow rather than jumping over it. So meeting is guaranteed, and the meeting is what proves the cycle.',
      keyInsight: 'The relative speed of one node per step means the distance between the two cursors decreases by exactly one each iteration, which rules out fast stepping over slow forever.',
      pitfalls: [
        'Guarding the loop with only fast != null. Advancing fast twice dereferences fast.next as well, so both must be checked.',
        'Starting slow and fast on different nodes and then testing equality before either has moved, which reports a false cycle.',
        'Using a hash set of visited nodes. It works and is easier, but it costs O(n) space and the problem asks for O(1).'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'],
      timeAnswer: 0,
      starter: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nbool hasCycle(ListNode* head) {\n    // your code here\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef has_cycle(head):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nbool hasCycle(ListNode* head) {\n    ListNode* slow = head;\n    ListNode* fast = head;\n    while (fast != nullptr && fast->next != nullptr) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef has_cycle(head):\n    slow = head\n    fast = head\n    while fast is not None and fast.next is not None:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Traverse the list.' },
          { re: '->\\s*next\\s*->\\s*next|unordered_set|set\\s*<', hint: 'Either move a fast pointer two nodes at a time, or record visited nodes.' },
          { re: '==|!=|count\\(|find\\(', hint: 'Detect the meeting (or the repeat visit).' },
          { re: 'return', hint: 'Return true or false.' }
        ],
        python: [
          { re: 'while\\s|for\\s', hint: 'Traverse the list.' },
          { re: '\\.next\\.next|set\\s*\\(|\\{\\s*\\}', hint: 'Either move a fast pointer two nodes at a time, or record visited nodes.' },
          { re: 'is\\s|==|in\\s', hint: 'Detect the meeting (or the repeat visit).' },
          { re: 'return', hint: 'Return True or False.' }
        ]
      },
      mcq: [
        { q: 'What is the correct loop guard for a fast pointer that advances two nodes per step?',
          opts: ['while (fast != null)', 'while (fast != null && fast.next != null)', 'while (slow != null)', 'while (fast.next != null)'],
          correct: 1,
          why: 'fast.next.next dereferences two links, so both fast and fast.next must be non-null before the step. Checking only one of them null-dereferences at the end of an acyclic list.' }
      ]
    },

    {
      id: 'nc-reorder-list',
      title: 'Reorder List',
      section: 'linked-list',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given the head of a singly linked list L0 -> L1 -> ... -> Ln-1, reorder it in place to L0 -> Ln-1 -> L1 -> Ln-2 -> ... You may not change the node values, only the links.',
      examples: [
        { in: 'head = [1,2,3,4]', out: '[1,4,2,3]' },
        { in: 'head = [1,2,3,4,5]', out: '[1,5,2,4,3]' },
        { in: 'head = [1]', out: '[1]' }
      ],
      approach: 'Three classic steps composed. First find the middle with a slow and fast pointer. Second, cut the list by setting the middle node next pointer to null, then reverse the second half in place. Third, weave: repeatedly take one node from the front half and one from the reversed back half, saving both next pointers before rewriting anything. The weave loop ends when the reversed half is exhausted, which happens naturally because the front half is never shorter than the back half.',
      keyInsight: 'Every hard list problem is a composition of the three primitives: find the middle, reverse in place, and splice. Cutting the list before reversing is what stops the weave from creating a cycle.',
      pitfalls: [
        'Not terminating the first half. If the middle still points forward, the weave links a node back into a chain that points into it and you get an infinite list.',
        'Rewriting first.next before saving it, which loses the rest of the front half.',
        'Getting the middle off by one. Starting fast at head.next puts slow at the end of the first half for even lengths, which is what the cut needs.',
        'Copying the nodes into an array. It works but uses O(n) space.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nvoid reorderList(ListNode* head) {\n    // your code here\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef reorder_list(head):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nvoid reorderList(ListNode* head) {\n    if (head == nullptr || head->next == nullptr) return;\n\n    ListNode* slow = head;\n    ListNode* fast = head->next;\n    while (fast != nullptr && fast->next != nullptr) {\n        slow = slow->next;\n        fast = fast->next->next;\n    }\n\n    ListNode* second = slow->next;\n    slow->next = nullptr;\n    ListNode* prev = nullptr;\n    while (second != nullptr) {\n        ListNode* nxt = second->next;\n        second->next = prev;\n        prev = second;\n        second = nxt;\n    }\n\n    ListNode* first = head;\n    second = prev;\n    while (second != nullptr) {\n        ListNode* f = first->next;\n        ListNode* s = second->next;\n        first->next = second;\n        second->next = f;\n        first = f;\n        second = s;\n    }\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef reorder_list(head):\n    if head is None or head.next is None:\n        return\n\n    slow, fast = head, head.next\n    while fast is not None and fast.next is not None:\n        slow = slow.next\n        fast = fast.next.next\n\n    second = slow.next\n    slow.next = None\n    prev = None\n    while second is not None:\n        nxt = second.next\n        second.next = prev\n        prev = second\n        second = nxt\n\n    first, second = head, prev\n    while second is not None:\n        f = first.next\n        s = second.next\n        first.next = second\n        second.next = f\n        first = f\n        second = s'
      },
      checks: {
        cpp: [
          { re: '->\\s*next\\s*->\\s*next|size\\(\\)|vector\\s*<', hint: 'Find the middle (fast and slow pointers, or a length count).' },
          { re: 'while\\s*\\(', hint: 'Reverse the back half and then weave the two halves.' },
          { re: '->\\s*next\\s*=\\s*nullptr|->\\s*next\\s*=\\s*NULL|->\\s*next\\s*=\\s*0', hint: 'Cut the first half so it no longer points into the second.' },
          { re: '->\\s*next\\s*=', hint: 'Rewire the links in place.' }
        ],
        python: [
          { re: '\\.next\\.next|len\\s*\\(|\\[\\s*\\]', hint: 'Find the middle (fast and slow pointers, or a length count).' },
          { re: 'while\\s', hint: 'Reverse the back half and then weave the two halves.' },
          { re: '\\.next\\s*=\\s*None', hint: 'Cut the first half so it no longer points into the second.' },
          { re: '\\.next\\s*=', hint: 'Rewire the links in place.' }
        ]
      },
      mcq: [
        { q: 'What happens if you reverse the second half without first setting the middle node next pointer to null?',
          opts: ['Nothing, the result is the same', 'The reversal silently reverses the whole list', 'The weave produces a cycle because the front half still points into the back half', 'The middle element is dropped'],
          correct: 2,
          why: 'The tail of the untouched front half still references a node in the reversed section, so weaving joins the list back onto itself and traversal never terminates.' }
      ]
    },

    {
      id: 'nc-remove-nth-from-end',
      title: 'Remove Nth Node From End of List',
      section: 'linked-list',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given the head of a linked list, remove the nth node from the end of the list and return the head. Do it in one pass.',
      examples: [
        { in: 'head = [1,2,3,4,5], n = 2', out: '[1,2,3,5]' },
        { in: 'head = [1], n = 1', out: '[]' },
        { in: 'head = [1,2], n = 2', out: '[2]' }
      ],
      approach: 'Put a dummy node in front of the head so removing the real head needs no special case. Start two cursors at the dummy and advance the fast one n steps, opening a fixed gap of n nodes. Then advance both until fast lands on the last node, that is until fast.next is null. Because the gap is preserved, slow now sits exactly one node BEFORE the victim, so unlinking is simply slow.next = slow.next.next. Return dummy.next, which handles the case where the head itself was removed.',
      keyInsight: 'A fixed-size gap between two cursors converts "nth from the end" into "the cursor that falls off the end first tells me where the other one is". No length pass is required.',
      pitfalls: [
        'Advancing until fast is null instead of until fast.next is null. That overshoots by one and leaves slow ON the victim, so you delete the wrong node.',
        'Not using a dummy, which forces a separate branch when n equals the length and the head must go.',
        'Advancing fast n + 1 times from the dummy and then also looping to fast.next == null, which double-counts the offset.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(2n) which is worse than O(n)', 'O(n^2)', 'O(log n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* removeNthFromEnd(ListNode* head, int n) {\n    // your code here\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef remove_nth_from_end(head, n):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* removeNthFromEnd(ListNode* head, int n) {\n    ListNode dummy(0);\n    dummy.next = head;\n    ListNode* fast = &dummy;\n    ListNode* slow = &dummy;\n    for (int i = 0; i < n; i++) fast = fast->next;\n    while (fast->next != nullptr) {\n        fast = fast->next;\n        slow = slow->next;\n    }\n    slow->next = slow->next->next;\n    return dummy.next;\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef remove_nth_from_end(head, n):\n    dummy = ListNode(0, head)\n    fast = dummy\n    slow = dummy\n    for _ in range(n):\n        fast = fast.next\n    while fast.next is not None:\n        fast = fast.next\n        slow = slow.next\n    slow.next = slow.next.next\n    return dummy.next'
      },
      checks: {
        cpp: [
          { re: 'for\\s*\\(|while\\s*\\(', hint: 'Open a gap of n nodes, then walk both cursors.' },
          { re: '->\\s*next\\s*=', hint: 'Unlink the target node by rewiring its predecessor.' },
          { re: 'ListNode\\s+\\w+\\s*\\(|new\\s+ListNode|dummy|->\\s*next\\s*->\\s*next', hint: 'A dummy node in front of the head removes the special case for deleting the head.' },
          { re: 'return', hint: 'Return the (possibly new) head.' }
        ],
        python: [
          { re: 'for\\s|while\\s|range\\s*\\(', hint: 'Open a gap of n nodes, then walk both cursors.' },
          { re: '\\.next\\s*=', hint: 'Unlink the target node by rewiring its predecessor.' },
          { re: 'ListNode\\s*\\(|dummy|\\.next\\.next', hint: 'A dummy node in front of the head removes the special case for deleting the head.' },
          { re: 'return', hint: 'Return the (possibly new) head.' }
        ]
      },
      mcq: [
        { q: 'With both cursors starting at the dummy and fast advanced n steps, which stopping condition leaves slow on the node before the victim?',
          opts: ['fast == null', 'fast == slow', 'slow.next == null', 'fast.next == null'],
          correct: 3,
          why: 'Stopping when fast.next is null puts fast on the last node and, because the gap is n, slow lands exactly one node before the target. Stopping at fast == null advances everything one step too far and slow ends up on the victim itself.' }
      ]
    },

    {
      id: 'nc-copy-random-list',
      title: 'Copy List with Random Pointer',
      section: 'linked-list',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Each node of a linked list has a next pointer and a random pointer that may target any node in the list or be null. Build a deep copy: a new list of brand new nodes whose next and random pointers mirror the original structure and never point at an original node.',
      examples: [
        { in: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]] as [val, randomIndex]', out: 'an identical structure made of new nodes' },
        { in: 'head = [[1,1],[2,1]]', out: '[[1,1],[2,1]] over new nodes' },
        { in: 'head = []', out: '[]' }
      ],
      approach: 'Two passes and one hash map. In the first pass, walk the list and create a fresh node for every original, storing the association original -> clone. Do not touch any pointer yet, because a random pointer may target a node you have not reached. In the second pass, walk again and translate: clone[cur].next is clone[cur.next] and clone[cur].random is clone[cur.random], with null mapping to null. Return the clone of the head.',
      keyInsight: 'The map must be keyed on node IDENTITY, not on value. Values can repeat, and two different nodes with the same value must stay distinct in the copy.',
      pitfalls: [
        'Keying the map on the value, which merges duplicate-valued nodes into one clone.',
        'Trying to wire pointers during the first pass, which fails whenever a random pointer looks forward to a node that does not exist yet.',
        'Leaving a clone pointing at an original node, which is a shallow copy and fails the deep-copy requirement.',
        'Forgetting the null head and the null random cases.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'],
      timeAnswer: 0,
      starter: {
        cpp: 'struct Node {\n    int val;\n    Node* next;\n    Node* random;\n    Node(int x) : val(x), next(nullptr), random(nullptr) {}\n};\n\nNode* copyRandomList(Node* head) {\n    // your code here\n}',
        python: 'class Node:\n    def __init__(self, val=0, next=None, random=None):\n        self.val = val\n        self.next = next\n        self.random = random\n\n\ndef copy_random_list(head):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'struct Node {\n    int val;\n    Node* next;\n    Node* random;\n    Node(int x) : val(x), next(nullptr), random(nullptr) {}\n};\n\nNode* copyRandomList(Node* head) {\n    if (head == nullptr) return nullptr;\n    unordered_map<Node*, Node*> clone;\n    for (Node* cur = head; cur != nullptr; cur = cur->next) {\n        clone[cur] = new Node(cur->val);\n    }\n    for (Node* cur = head; cur != nullptr; cur = cur->next) {\n        clone[cur]->next = (cur->next != nullptr) ? clone[cur->next] : nullptr;\n        clone[cur]->random = (cur->random != nullptr) ? clone[cur->random] : nullptr;\n    }\n    return clone[head];\n}',
        python: 'class Node:\n    def __init__(self, val=0, next=None, random=None):\n        self.val = val\n        self.next = next\n        self.random = random\n\n\ndef copy_random_list(head):\n    if head is None:\n        return None\n    clone = {}\n    cur = head\n    while cur is not None:\n        clone[cur] = Node(cur.val)\n        cur = cur.next\n    cur = head\n    while cur is not None:\n        clone[cur].next = clone[cur.next] if cur.next is not None else None\n        clone[cur].random = clone[cur.random] if cur.random is not None else None\n        cur = cur.next\n    return clone[head]'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<|->\\s*next\\s*=\\s*new', hint: 'Associate each original node with its clone (a hash map, or the interleaving trick).' },
          { re: 'new\\s+Node|Node\\s*\\(', hint: 'Allocate a brand new node for every original.' },
          { re: '->\\s*random', hint: 'Translate the random pointers too.' },
          { re: 'return', hint: 'Return the clone of the head.' }
        ],
        python: [
          { re: '\\{\\s*\\}|dict\\(|defaultdict', hint: 'Associate each original node with its clone.' },
          { re: 'Node\\s*\\(', hint: 'Allocate a brand new node for every original.' },
          { re: '\\.random', hint: 'Translate the random pointers too.' },
          { re: 'return', hint: 'Return the clone of the head.' }
        ]
      },
      mcq: [
        { q: 'Why must the hash map be keyed on the node itself rather than on its value?',
          opts: ['Values may repeat, so distinct nodes would collapse into one clone', 'Values may be negative', 'Hash maps cannot store integers', 'It makes the copy shallow'],
          correct: 0,
          why: 'Node values are not unique. Keying on identity is the only way to translate an arbitrary next or random pointer into the one clone that corresponds to that exact original node.' }
      ]
    },

    {
      id: 'nc-add-two-numbers',
      title: 'Add Two Numbers',
      section: 'linked-list',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Two non-negative integers are stored as linked lists of single digits in reverse order, least significant digit first. Add them and return the sum as a linked list in the same format.',
      examples: [
        { in: 'l1 = [2,4,3], l2 = [5,6,4]  (342 + 465)', out: '[7,0,8]  (807)' },
        { in: 'l1 = [0], l2 = [0]', out: '[0]' },
        { in: 'l1 = [9,9,9,9], l2 = [9,9]  (9999 + 99)', out: '[8,9,0,0,1]  (10098)' }
      ],
      approach: 'Because the digits are stored least significant first, walking the lists forward is exactly the order in which you add by hand. Keep a carry and loop while either list still has a node OR the carry is non-zero. Each iteration sums the carry plus whichever digits exist, appends sum % 10 as a new node via a dummy-headed tail, and sets carry to sum / 10. Return dummy.next.',
      keyInsight: 'Making the loop condition include the carry removes the special final case where the addition produces one extra digit, as in 999 + 1.',
      pitfalls: [
        'Ending the loop when both lists are exhausted, which drops a trailing carry and turns 9999 + 99 into a four-digit answer.',
        'Converting the lists to integers first. It reads well but overflows on the long inputs the problem allows.',
        'Assuming the lists have the same length; guard every dereference.'
      ],
      complexity: { time: 'O(max(n, m))', space: 'O(max(n, m)) for the output' },
      timeChoices: ['O(n * m)', 'O(max(n, m))', 'O(n log n)', 'O(1)'],
      timeAnswer: 1,
      starter: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n    // your code here\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef add_two_numbers(l1, l2):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n    ListNode dummy(0);\n    ListNode* tail = &dummy;\n    int carry = 0;\n    while (l1 != nullptr || l2 != nullptr || carry != 0) {\n        int sum = carry;\n        if (l1 != nullptr) {\n            sum += l1->val;\n            l1 = l1->next;\n        }\n        if (l2 != nullptr) {\n            sum += l2->val;\n            l2 = l2->next;\n        }\n        carry = sum / 10;\n        tail->next = new ListNode(sum % 10);\n        tail = tail->next;\n    }\n    return dummy.next;\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef add_two_numbers(l1, l2):\n    dummy = ListNode(0)\n    tail = dummy\n    carry = 0\n    while l1 is not None or l2 is not None or carry != 0:\n        total = carry\n        if l1 is not None:\n            total += l1.val\n            l1 = l1.next\n        if l2 is not None:\n            total += l2.val\n            l2 = l2.next\n        carry, digit = divmod(total, 10)\n        tail.next = ListNode(digit)\n        tail = tail.next\n    return dummy.next'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(|addTwoNumbers\\s*\\(', hint: 'Walk both lists (or recurse) while digits or a carry remain.' },
          { re: '%\\s*10|10\\s*\\)|/\\s*10', hint: 'Split each column sum into a digit and a carry.' },
          { re: 'new\\s+ListNode|ListNode\\s*\\(', hint: 'Build the result out of new nodes.' },
          { re: 'return', hint: 'Return the head of the sum list.' }
        ],
        python: [
          { re: 'while\\s|for\\s|def\\s+\\w+', hint: 'Walk both lists (or recurse) while digits or a carry remain.' },
          { re: '%\\s*10|divmod|//\\s*10', hint: 'Split each column sum into a digit and a carry.' },
          { re: 'ListNode\\s*\\(', hint: 'Build the result out of new nodes.' },
          { re: 'return', hint: 'Return the head of the sum list.' }
        ]
      },
      mcq: [
        { q: 'Why does the loop condition include "or carry != 0"?',
          opts: ['To handle empty input lists', 'To keep the lists aligned', 'Because the final carry can add one more digit, as in 99 + 1', 'To avoid an infinite loop'],
          correct: 2,
          why: 'When the last column overflows, the extra digit has no corresponding input node. Including the carry in the loop condition emits it without a special case after the loop.' }
      ]
    },

    {
      id: 'nc-find-duplicate',
      title: 'Find the Duplicate Number',
      section: 'linked-list',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'An array nums of n + 1 integers holds values in the range 1..n. Exactly one value is repeated, possibly many times. Return that value without modifying the array and using only constant extra space.',
      examples: [
        { in: 'nums = [1,3,4,2,2]', out: '2' },
        { in: 'nums = [3,1,3,4,2]', out: '3' },
        { in: 'nums = [2,2,2,2,2]', out: '2' }
      ],
      approach: 'Read the array as a linked list: node i has an edge to node nums[i]. Since every value lies in 1..n, index 0 is never a target, so the walk starting at 0 can never return to 0 and must instead run into a node with two incoming edges — the repeated value — which is the entrance of a cycle. Apply Floyd cycle detection. Phase one advances slow one step and fast two steps until they meet somewhere inside the cycle. Phase two resets slow to index 0 and advances both one step at a time; they meet exactly at the cycle entrance, which is the duplicate.',
      keyInsight: 'The pigeonhole principle guarantees a cycle, and the arithmetic of Floyd cycle detection guarantees that restarting one pointer at the origin makes the two meet at the entrance, which is the only node with two predecessors.',
      pitfalls: [
        'Sorting the array or using a hash set. Both are correct but violate the no-modification or the O(1) space constraint.',
        'Skipping phase two and returning the meeting point, which is somewhere in the cycle but usually not the entrance.',
        'Starting phase one with slow and fast both at index 0 and testing equality before moving, which terminates immediately.',
        'Assuming the duplicate appears exactly twice; it may appear many times.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int findDuplicate(vector<int>& nums) {\n    // your code here\n}',
        python: 'def find_duplicate(nums):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int findDuplicate(vector<int>& nums) {\n    int slow = 0, fast = 0;\n    do {\n        slow = nums[slow];\n        fast = nums[nums[fast]];\n    } while (slow != fast);\n    slow = 0;\n    while (slow != fast) {\n        slow = nums[slow];\n        fast = nums[fast];\n    }\n    return slow;\n}',
        python: 'def find_duplicate(nums):\n    slow = fast = 0\n    while True:\n        slow = nums[slow]\n        fast = nums[nums[fast]]\n        if slow == fast:\n            break\n    slow = 0\n    while slow != fast:\n        slow = nums[slow]\n        fast = nums[fast]\n    return slow'
      },
      checks: {
        cpp: [
          { re: 'nums\\s*\\[\\s*nums\\s*\\[|while\\s*\\(|for\\s*\\(', hint: 'Walk the array as a linked list, moving one cursor twice as fast.' },
          { re: 'while\\s*\\(|do\\s*\\{', hint: 'Loop until the two cursors meet, then again until they meet at the entrance.' },
          { re: '=\\s*0\\s*;|=\\s*0\\b', hint: 'Phase two restarts one cursor at index 0.' },
          { re: 'return', hint: 'Return the duplicated value.' }
        ],
        python: [
          { re: 'nums\\s*\\[\\s*nums\\s*\\[|while\\s|for\\s', hint: 'Walk the array as a linked list, moving one cursor twice as fast.' },
          { re: 'while\\s', hint: 'Loop until the two cursors meet, then again until they meet at the entrance.' },
          { re: '=\\s*0\\b', hint: 'Phase two restarts one cursor at index 0.' },
          { re: 'return', hint: 'Return the duplicated value.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'sort\\s*\\(|unordered_set|\\bset\\s*<', hint: 'Sorting modifies the array and a set costs O(n) space — both are excluded by the constraints.' }],
        python: [{ re: 'sorted\\s*\\(|\\.sort\\s*\\(|set\\s*\\(|Counter', hint: 'Sorting modifies the array and a set costs O(n) space — both are excluded by the constraints.' }]
      },
      mcq: [
        { q: 'Why is a cycle guaranteed when the array is read as the function i -> nums[i]?',
          opts: ['Because the array is sorted', 'Because all values are distinct', 'Because the array length is even', 'Because values lie in 1..n while indices run 0..n, so index 0 has no predecessor and some node must have two'],
          correct: 3,
          why: 'n + 1 indices map into only n distinct values, so by the pigeonhole principle two indices share a target. Index 0 is never a target, so the walk from 0 must enter that shared node, which is the cycle entrance and the duplicate.' }
      ]
    },

    {
      id: 'nc-lru-cache',
      title: 'LRU Cache',
      section: 'linked-list',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Design a cache with a fixed capacity that supports get(key) and put(key, value) in O(1) average time. get returns the stored value or -1. put inserts or updates a key and, when the capacity is exceeded, evicts the least recently used key. Both get and put count as a use.',
      examples: [
        { in: 'capacity = 2; put(1,1); put(2,2); get(1)', out: '1' },
        { in: '...then put(3,3) evicts key 2; get(2)', out: '-1' },
        { in: '...then put(4,4) evicts key 1; get(1), get(3), get(4)', out: '-1, 3, 4' }
      ],
      approach: 'Combine a hash map with a doubly linked list ordered by recency, most recent at the front. The map stores key -> node reference so lookups are O(1). On get, find the node, move it to the front, and return its value. On put, update and move to front if the key exists; otherwise insert at the front and, if the size now exceeds the capacity, remove the node at the back and erase its key from the map. In C++ a std::list plus splice does this without reallocating; in Python collections.OrderedDict is the same structure with move_to_end and popitem(last=False).',
      keyInsight: 'The hash map gives O(1) find; the DOUBLY linked list gives O(1) unlink, because removing an arbitrary node needs its predecessor. Neither structure alone can do both.',
      pitfalls: [
        'Using a singly linked list, where unlinking an arbitrary node requires an O(n) scan for its predecessor.',
        'Forgetting that get also refreshes recency, which makes eviction pick the wrong key.',
        'Erasing the evicted key from the list but not from the hash map, leaving a dangling reference.',
        'Forgetting to move an existing key to the front on an update, not just on an insert.'
      ],
      complexity: { time: 'O(1) average per operation', space: 'O(capacity)' },
      timeChoices: ['O(1) average per operation', 'O(log n) per operation', 'O(n) for put', 'O(n) for get'],
      timeAnswer: 0,
      starter: {
        cpp: 'class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // your code here\n    }\n    int get(int key) {\n        // your code here\n    }\n    void put(int key, int value) {\n        // your code here\n    }\n};',
        python: 'class LRUCache:\n    def __init__(self, capacity):\n        # your code here\n        pass\n\n    def get(self, key):\n        pass\n\n    def put(self, key, value):\n        pass'
      },
      solution: {
        cpp: 'class LRUCache {\n    int cap;\n    list<pair<int,int>> order;\n    unordered_map<int, list<pair<int,int>>::iterator> pos;\npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n\n    int get(int key) {\n        auto it = pos.find(key);\n        if (it == pos.end()) return -1;\n        order.splice(order.begin(), order, it->second);\n        return it->second->second;\n    }\n\n    void put(int key, int value) {\n        if (cap <= 0) return;\n        auto it = pos.find(key);\n        if (it != pos.end()) {\n            it->second->second = value;\n            order.splice(order.begin(), order, it->second);\n            return;\n        }\n        if ((int)order.size() == cap) {\n            pos.erase(order.back().first);\n            order.pop_back();\n        }\n        order.push_front({key, value});\n        pos[key] = order.begin();\n    }\n};',
        python: 'from collections import OrderedDict\n\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.data = OrderedDict()\n\n    def get(self, key):\n        if key not in self.data:\n            return -1\n        self.data.move_to_end(key)\n        return self.data[key]\n\n    def put(self, key, value):\n        if key in self.data:\n            self.data.move_to_end(key)\n        self.data[key] = value\n        if len(self.data) > self.cap:\n            self.data.popitem(last=False)'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<', hint: 'A hash map gives O(1) lookup from key to node.' },
          { re: 'list\\s*<|struct\\s+\\w+|prev', hint: 'A doubly linked list keeps the recency order with O(1) unlinking.' },
          { re: 'splice|erase|pop_back|remove', hint: 'Evict from the least-recently-used end.' },
          { re: '-\\s*1', hint: 'get returns -1 for a missing key.' }
        ],
        python: [
          { re: 'OrderedDict|\\{\\s*\\}|dict\\(', hint: 'A hash map (or OrderedDict) gives O(1) lookup from key to node.' },
          { re: 'move_to_end|prev|\\.next', hint: 'Refresh recency on every get and put.' },
          { re: 'popitem|del\\s|pop\\s*\\(', hint: 'Evict from the least-recently-used end.' },
          { re: '-\\s*1', hint: 'get returns -1 for a missing key.' }
        ]
      },
      mcq: [
        { q: 'Why does an LRU cache pair the hash map with a DOUBLY linked list?',
          opts: ['Doubly linked lists use less memory', 'Unlinking an arbitrary node in O(1) requires its predecessor pointer', 'Singly linked lists cannot store pairs', 'Hash maps require doubly linked buckets'],
          correct: 1,
          why: 'get must move a node found by hash lookup to the front in constant time. With only forward links you would have to scan from the head to find the predecessor, making the operation O(n).' }
      ]
    },

    {
      id: 'nc-merge-k-lists',
      title: 'Merge K Sorted Lists',
      section: 'linked-list',
      tier: 'master',
      difficulty: 'Hard',
      prompt: 'You are given an array of k linked lists, each sorted in ascending order. Merge them into one sorted linked list and return its head.',
      examples: [
        { in: 'lists = [[1,4,5],[1,3,4],[2,6]]', out: '[1,1,2,3,4,4,5,6]' },
        { in: 'lists = []', out: '[]' },
        { in: 'lists = [[]]', out: '[]' }
      ],
      approach: 'Merge in rounds, like a tournament. Pair up the lists and merge each pair with the ordinary two-list merge, halving the number of lists each round. After log k rounds a single list remains. Every round touches all n nodes once, so the total cost is O(n log k) instead of the O(n * k) you get from folding the lists one at a time into an ever-growing accumulator. A min-heap holding the current head of every list achieves the same bound and is the usual alternative.',
      keyInsight: 'Merging sequentially rescans the accumulated prefix k times. Pairwise merging makes each node participate in only log k merges, which is where the k drops to log k.',
      pitfalls: [
        'Folding left to right into one accumulator, which is O(n * k).',
        'Forgetting the odd list in a round. When the count is odd the last list must be carried forward untouched.',
        'Not handling an empty input array or lists that are individually null.',
        'Concatenating all values into an array and sorting. It is O(n log n), acceptable but it abandons the linked structure and uses O(n) extra space.'
      ],
      complexity: { time: 'O(n log k)', space: 'O(1) extra beyond the recursion or the round buffer' },
      timeChoices: ['O(n * k)', 'O(n log n)', 'O(n log k)', 'O(k^2)'],
      timeAnswer: 2,
      starter: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* mergeKLists(vector<ListNode*>& lists) {\n    // your code here\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef merge_k_lists(lists):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* mergeTwoSorted(ListNode* a, ListNode* b) {\n    ListNode dummy(0);\n    ListNode* tail = &dummy;\n    while (a != nullptr && b != nullptr) {\n        if (a->val <= b->val) {\n            tail->next = a;\n            a = a->next;\n        } else {\n            tail->next = b;\n            b = b->next;\n        }\n        tail = tail->next;\n    }\n    tail->next = (a != nullptr) ? a : b;\n    return dummy.next;\n}\n\nListNode* mergeKLists(vector<ListNode*>& lists) {\n    if (lists.empty()) return nullptr;\n    vector<ListNode*> cur = lists;\n    while (cur.size() > 1) {\n        vector<ListNode*> merged;\n        for (size_t i = 0; i < cur.size(); i += 2) {\n            ListNode* a = cur[i];\n            ListNode* b = (i + 1 < cur.size()) ? cur[i + 1] : nullptr;\n            merged.push_back(mergeTwoSorted(a, b));\n        }\n        cur = merged;\n    }\n    return cur[0];\n}',
        python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef merge_k_lists(lists):\n    if not lists:\n        return None\n\n    def merge_two(a, b):\n        dummy = ListNode(0)\n        tail = dummy\n        while a is not None and b is not None:\n            if a.val <= b.val:\n                tail.next = a\n                a = a.next\n            else:\n                tail.next = b\n                b = b.next\n            tail = tail.next\n        tail.next = a if a is not None else b\n        return dummy.next\n\n    cur = list(lists)\n    while len(cur) > 1:\n        merged = []\n        for i in range(0, len(cur), 2):\n            a = cur[i]\n            b = cur[i + 1] if i + 1 < len(cur) else None\n            merged.append(merge_two(a, b))\n        cur = merged\n    return cur[0]'
      },
      checks: {
        cpp: [
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Merge in rounds, or drive a heap over the list heads.' },
          { re: 'priority_queue|/\\s*2|\\+=\\s*2|mid|mergeTwo', hint: 'Either pair up the lists (divide and conquer) or use a min-heap.' },
          { re: '->\\s*next\\s*=', hint: 'Splice the existing nodes together.' },
          { re: 'return', hint: 'Return the merged head.' }
        ],
        python: [
          { re: 'while\\s|for\\s', hint: 'Merge in rounds, or drive a heap over the list heads.' },
          { re: 'heap|//\\s*2|,\\s*2\\)|merge_two|mid', hint: 'Either pair up the lists (divide and conquer) or use a min-heap.' },
          { re: '\\.next\\s*=', hint: 'Splice the existing nodes together.' },
          { re: 'return', hint: 'Return the merged head.' }
        ]
      },
      antiChecks: {
        cpp: [{ re: 'sort\\s*\\(\\s*\\w+\\.begin', hint: 'Dumping every value into a vector and sorting abandons the linked structure and costs O(n) extra space.' }],
        python: [{ re: 'sorted\\s*\\(|\\.sort\\s*\\(', hint: 'Dumping every value into a list and sorting abandons the linked structure and costs O(n) extra space.' }]
      },
      mcq: [
        { q: 'Why is folding the k lists one at a time into a single accumulator worse than pairwise merging?',
          opts: ['It uses more memory', 'The accumulator is rescanned on every merge, giving O(n * k)', 'It produces an unsorted result', 'It cannot handle empty lists'],
          correct: 1,
          why: 'After j folds the accumulator already holds most of the nodes, and each further merge walks all of them again. Pairwise merging makes every node participate in only log k merges, giving O(n log k).' }
      ]
    }
  ];

  const Q = [
    /* ---------------------------------------------------------------- stack */
    {
      id: 'q-stack-001',
      section: 'stack',
      tier: 'intermediate',
      q: 'A monotonic stack scan over an array of size n pushes each index once and pops it at most once, but the inner while loop can run many times in a single outer iteration. What is the total running time?',
      opts: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n sqrt(n))'],
      correct: 0,
      why: 'Amortised analysis: the inner loop body can only run as many times as there are pops, and there are at most n pops in the whole scan. Peak per-iteration cost does not determine total cost.',
      topic: 'monotonic stack'
    },
    {
      id: 'q-stack-002',
      section: 'stack',
      tier: 'intermediate',
      q: 'You want, for every index i, the index of the previous element strictly smaller than nums[i]. What should the stack contain and how should it be ordered?',
      opts: ['Indices whose values are strictly increasing from bottom to top', 'Indices whose values are strictly decreasing from bottom to top', 'Values sorted ascending, rebuilt each step', 'The k largest values seen so far'],
      correct: 0,
      why: 'To answer "previous smaller", pop everything at least as large as the incoming value; what survives is an increasing stack, and its top is exactly the previous smaller element.',
      topic: 'monotonic stack'
    },
    {
      id: 'q-stack-003',
      section: 'stack',
      tier: 'advanced',
      q: 'In Largest Rectangle in Histogram, why is a sentinel bar of height 0 processed after the last real bar?',
      opts: ['It prevents integer overflow', 'It makes the array length a power of two', 'It keeps the stack from ever being empty', 'It forces every bar still on the stack to be popped and measured'],
      correct: 3,
      why: 'Bars left on the stack at the end of the scan extend to the right edge of the histogram. A height-0 sentinel is smaller than all of them, so the ordinary pop-and-measure loop drains the stack instead of needing a separate cleanup pass.',
      topic: 'monotonic stack'
    },
    {
      id: 'q-stack-004',
      section: 'stack',
      tier: 'intermediate',
      q: 'A stack-based bracket matcher pushes openers, pops on a matching closer, and returns false on a mismatch or on a pop from an empty stack. Which additional check is still required for correctness?',
      opts: ['That the input length is even', 'That the stack is empty when the scan finishes', 'That the first character is an opening bracket', 'That the stack never exceeded n/2 entries'],
      correct: 1,
      why: 'Unclosed openers such as "(((" never trigger a mismatch inside the loop, so without the final empty-stack test the matcher accepts them.',
      topic: 'stack invariants'
    },
    {
      id: 'q-stack-005',
      section: 'stack',
      tier: 'intermediate',
      q: 'Which of these is NOT solvable in one linear monotonic-stack pass over the array?',
      opts: ['The kth smallest element of the array', 'The next greater element for every index', 'The span of consecutive preceding days with a lower price', 'The largest rectangle in a histogram'],
      correct: 0,
      why: 'A monotonic stack answers questions about the nearest element on one side that breaks an ordering. Order statistics such as the kth smallest are a global property and need selection or a heap, not a stack scan.',
      topic: 'monotonic stack'
    },
    {
      id: 'q-stack-006',
      section: 'stack',
      tier: 'advanced',
      q: 'Computing the next greater element for a CIRCULAR array is usually done by scanning indices 0 .. 2n-1 and indexing with i % n. Why does two passes suffice?',
      opts: ['Because the array is sorted after the first pass', 'Because the stack is emptied between passes', 'Because any element that wraps needs to look at most n - 1 positions ahead, which one extra pass covers', 'Because the second pass reverses the first'],
      correct: 2,
      why: 'The farthest an element can look before returning to itself is n - 1 steps. Repeating the array once gives every index that full window, and pushing only during the first pass keeps the results correct.',
      topic: 'monotonic stack'
    },
    {
      id: 'q-stack-007',
      section: 'stack',
      tier: 'advanced',
      q: 'When a monotonic stack pops entries on a strict comparison (pop while stackTop < incoming) rather than a non-strict one (pop while stackTop <= incoming), what changes for arrays containing duplicates?',
      opts: ['Nothing changes', 'Equal values are treated as not resolving the pending entry, so ties keep waiting for a strictly greater value', 'The stack stops being monotonic', 'The algorithm becomes quadratic'],
      correct: 1,
      why: 'The comparison encodes whether "equal" counts as satisfying the query. With strict pops, duplicates stay pending until something strictly larger arrives, which is exactly what "strictly warmer" or "strictly greater" problems require.',
      topic: 'monotonic stack'
    },
    {
      id: 'q-stack-008',
      section: 'stack',
      tier: 'beginner',
      q: 'You evaluate a postfix expression and, for a subtraction token, you pop x first and then y. Which expression is correct?',
      opts: ['x - y', 'abs(x - y)', 'x + y - x', 'y - x'],
      correct: 3,
      why: 'The stack returns operands in reverse order, so the first pop is the right-hand operand and the second is the left. Reversing them is invisible for + and * but wrong for - and /.',
      topic: 'stack evaluation'
    },

    /* -------------------------------------------------------- binary search */
    {
      id: 'q-bsearch-001',
      section: 'binary-search',
      tier: 'intermediate',
      q: 'Why is the midpoint written as lo + (hi - lo) / 2 rather than (lo + hi) / 2 in C++?',
      opts: ['It is measurably faster', 'lo + hi can overflow a signed 32-bit int when both bounds are large', 'It rounds toward hi instead of toward lo', 'It avoids a division instruction'],
      correct: 1,
      why: 'With lo and hi near INT_MAX the sum wraps to a negative value and the resulting index is out of range. The subtraction form never leaves the interval [lo, hi]. Python integers are unbounded, so the issue does not arise there.',
      topic: 'binary search pitfalls'
    },
    {
      id: 'q-bsearch-002',
      section: 'binary-search',
      tier: 'intermediate',
      q: 'You write hi = nums.size() - 1 and a loop body of hi = mid - 1 / lo = mid + 1, but guard the loop with while (lo < hi) and return -1 afterwards. What goes wrong?',
      opts: ['It overflows on large arrays', 'It loops forever on sorted input', 'It is correct but visits one extra element', 'It never examines the single candidate remaining when lo == hi'],
      correct: 3,
      why: 'With an inclusive upper bound the search window is empty only when lo > hi. Stopping at lo == hi leaves one live candidate untested, so a target sitting there is reported as missing.',
      topic: 'binary search invariants'
    },
    {
      id: 'q-bsearch-003',
      section: 'binary-search',
      tier: 'advanced',
      q: 'In a while (lo < hi) loop with mid computed by floor division, which pair of updates is guaranteed to terminate?',
      opts: ['hi = mid and lo = mid + 1', 'hi = mid and lo = mid', 'hi = mid - 1 and lo = mid', 'lo = mid and hi = mid - 1'],
      correct: 0,
      why: 'When hi == lo + 1, floor division makes mid == lo, so any branch that sets lo = mid leaves the window unchanged and spins forever. Pairing hi = mid with lo = mid + 1 always shrinks the window by at least one.',
      topic: 'binary search invariants'
    },
    {
      id: 'q-bsearch-004',
      section: 'binary-search',
      tier: 'advanced',
      q: 'Binary search on the answer (as used for minimum eating speed or minimum ship capacity) is valid under which condition?',
      opts: ['The input array must be sorted', 'The answer must equal the array maximum', 'The feasibility test must be monotone, so that if a candidate works then every larger candidate works too', 'The candidate range must be smaller than the array length'],
      correct: 2,
      why: 'Monotone feasibility turns the candidate range into a sorted sequence of false values followed by true values, which is exactly what binary search consumes. The input array itself is never sorted in these problems.',
      topic: 'binary search on the answer'
    },
    {
      id: 'q-bsearch-005',
      section: 'binary-search',
      tier: 'intermediate',
      q: 'For Koko Eating Bananas with h hours available, what are the tightest correct search bounds for the eating speed k?',
      opts: ['0 to sum(piles)', '1 to sum(piles) / h', '0 to max(piles)', '1 to max(piles)'],
      correct: 3,
      why: 'Speed 0 never finishes and divides by zero, so the lower bound is 1. Any speed above max(piles) still costs one hour per pile, so it can never beat max(piles), which is therefore always feasible and a valid upper bound.',
      topic: 'binary search on the answer'
    },
    {
      id: 'q-bsearch-006',
      section: 'binary-search',
      tier: 'advanced',
      q: 'Find Minimum in Rotated Sorted Array compares nums[mid] against nums[hi] instead of nums[lo]. Why?',
      opts: ['nums[lo] is usually the answer already', 'Comparing against nums[lo] cannot distinguish a rotated from an unrotated segment without an extra case', 'It avoids integer overflow', 'It halves the number of comparisons'],
      correct: 1,
      why: 'On an array that is not rotated, nums[mid] >= nums[lo] holds just as it does on a rotated one, so that test can send the search into the half without the minimum. Comparing with nums[hi] separates the two cases unambiguously.',
      topic: 'rotated arrays'
    },
    {
      id: 'q-bsearch-007',
      section: 'binary-search',
      tier: 'intermediate',
      q: 'You need the LAST element of a sorted array that is less than or equal to a query value. Which loop body finds it?',
      opts: ['Return immediately on an exact match, otherwise report failure', 'Binary search for the smallest element greater than or equal to the query', 'Whenever arr[mid] <= query, record mid as the best candidate and set lo = mid + 1', 'Whenever arr[mid] <= query, set hi = mid - 1'],
      correct: 2,
      why: 'This is an upper-bound search. Every mid that satisfies the predicate is a better answer than the previous candidate, so you save it and keep searching to the right for an even later element that still satisfies it.',
      topic: 'lower and upper bound'
    },
    {
      id: 'q-bsearch-008',
      section: 'binary-search',
      tier: 'intermediate',
      q: 'A sorted array contains duplicates and you want the index of the FIRST occurrence of target. What is the minimal change to a standard exact-match binary search?',
      opts: ['On a match, record the index and continue searching the left half instead of returning', 'On a match, return immediately', 'Sort the array again before searching', 'Scan left from the found index until the value changes'],
      correct: 0,
      why: 'Returning on the first match gives an arbitrary occurrence. Recording it and moving hi to mid - 1 keeps shrinking toward the leftmost one in O(log n); walking left afterwards is correct but degrades to O(n) on an array of equal values.',
      topic: 'lower and upper bound'
    },

    /* ---------------------------------------------------------- linked list */
    {
      id: 'q-llist-001',
      section: 'linked-list',
      tier: 'beginner',
      q: 'While reversing a singly linked list iteratively, why must you copy node.next into a temporary BEFORE assigning node.next = prev?',
      opts: ['Otherwise the rest of the list becomes unreachable', 'Otherwise prev is corrupted', 'Otherwise the head node is freed', 'Otherwise the loop runs one extra iteration'],
      correct: 0,
      why: 'The next pointer is the only reference you hold to the remaining nodes. Overwriting it first strands the tail, so the traversal ends after a single node.',
      topic: 'pointer manipulation'
    },
    {
      id: 'q-llist-002',
      section: 'linked-list',
      tier: 'beginner',
      q: 'What problem does a dummy (sentinel) head node solve in code that builds or edits a linked list?',
      opts: ['It makes traversal circular', 'It caches the list length', 'It removes the special case for writing or removing the FIRST node, so one loop body handles every node', 'It provides O(1) access by index'],
      correct: 2,
      why: 'Without a sentinel, every append needs an "is the output still empty?" branch and every deletion needs a separate "is it the head?" branch. With one, you always write through tail.next or prev.next and return dummy.next at the end.',
      topic: 'pointer manipulation'
    },
    {
      id: 'q-llist-003',
      section: 'linked-list',
      tier: 'intermediate',
      q: 'A fast pointer advances two nodes per step and a slow pointer one. What is the correct loop guard in a singly linked list?',
      opts: ['while (fast != null)', 'while (fast != null && fast.next != null)', 'while (slow != null)', 'while (fast.next != null)'],
      correct: 1,
      why: 'The step fast = fast.next.next dereferences two links, so both fast and fast.next must be non-null before it runs. Guarding on only one of them null-dereferences at the end of an acyclic list of the wrong parity.',
      topic: 'fast and slow pointers'
    },
    {
      id: 'q-llist-004',
      section: 'linked-list',
      tier: 'intermediate',
      q: 'To delete the nth node from the end in one pass, both cursors start on a dummy before the head and fast is advanced n steps. Then both advance until which condition, so that slow lands on the node BEFORE the target?',
      opts: ['fast == null', 'slow.next == null', 'fast == slow', 'fast.next == null'],
      correct: 3,
      why: 'Stopping when fast.next is null leaves fast on the last node, and the fixed gap of n puts slow exactly one node before the victim. Stopping at fast == null advances one step too far and slow ends up on the victim itself.',
      topic: 'two pointers on lists'
    },
    {
      id: 'q-llist-005',
      section: 'linked-list',
      tier: 'advanced',
      q: 'Reorder List splits the list at the middle, reverses the back half and weaves the two halves. What must be done to the front half immediately after the middle is found?',
      opts: ['Reverse it as well', 'Copy it into an array', 'Terminate it by setting the middle node next pointer to null', 'Advance its head by one node'],
      correct: 2,
      why: 'If the front half still points into the back half, the weave links the list back onto itself and traversal never ends. Cutting first makes the two halves genuinely independent.',
      topic: 'pointer manipulation'
    },
    {
      id: 'q-llist-006',
      section: 'linked-list',
      tier: 'advanced',
      q: 'Deep-copying a linked list whose nodes carry an extra arbitrary pointer is done with a hash map in two passes. What should the map be keyed on?',
      opts: ['The original node itself, mapped to its freshly allocated clone', 'The node value, mapped to the clone', 'The position in the list, mapped to the value', 'The clone, mapped to the original'],
      correct: 0,
      why: 'Values can repeat, so keying on value merges distinct nodes into one clone. Keying on node identity lets the second pass translate any original pointer, next or arbitrary, into the matching clone.',
      topic: 'deep copy'
    },
    {
      id: 'q-llist-007',
      section: 'linked-list',
      tier: 'advanced',
      q: 'Floyd cycle detection has found the meeting point of the slow and fast cursors inside a cycle. What is the next step to locate the node where the cycle BEGINS?',
      opts: ['Return the meeting point directly', 'Advance the fast pointer one more full lap', 'Count the cycle length and advance slow by that many nodes', 'Reset one cursor to the start and advance both one step at a time until they meet again'],
      correct: 3,
      why: 'The distance from the head to the entrance equals the distance from the meeting point to the entrance modulo the cycle length, so two cursors moving at the same speed from those two places meet exactly at the entrance. The meeting point itself is usually not the entrance.',
      topic: 'fast and slow pointers'
    },
    {
      id: 'q-llist-008',
      section: 'linked-list',
      tier: 'advanced',
      q: 'An LRU cache pairs a hash map with a linked list. Why must the list be doubly linked?',
      opts: ['A singly linked list cannot store key-value pairs', 'Unlinking an arbitrary node in O(1) requires a pointer to its predecessor, which only a doubly linked list provides', 'Doubly linked lists use less memory per node', 'Hash maps can only chain through doubly linked buckets'],
      correct: 1,
      why: 'get finds a node by hash lookup and must move it to the front in constant time. With only forward links you would have to scan from the head to find its predecessor, degrading the operation to O(n).',
      topic: 'cache design'
    }
  ];

  window.DB.problems.push(...P);
  window.DB.questions.push(...Q);
})();
