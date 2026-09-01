/* NeetCode part 3 - trees, tries, heap / priority queue */
(function () {
  const P = [
    {
      id: 'nc-invert-tree',
      title: 'Invert Binary Tree',
      section: 'trees',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given the root of a binary tree, invert it by swapping the left and right child of every node, and return the root. TreeNode has fields val, left and right.',
      examples: [
        { in: 'root = [4,2,7,1,3,6,9]', out: '[4,7,2,9,6,3,1]' },
        { in: 'root = []', out: '[]' }
      ],
      approach: 'At every node, swap its two children, then recurse into both subtrees. A breadth-first walk with a queue does the same thing iteratively: pop a node, swap its children, push the children.',
      keyInsight: 'Inverting a tree is one local operation - swap children - applied at every node. The traversal is the whole algorithm.',
      pitfalls: [
        'Overwriting the left pointer before saving it, which loses the old left subtree.',
        'Forgetting the null base case and dereferencing a missing child.'
      ],
      complexity: { time: 'O(n)', space: 'O(h)' },
      timeChoices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)'],
      timeAnswer: 1,
      starter: {
        cpp: 'TreeNode* invertTree(TreeNode* root) {\n    // your code here\n}',
        python: 'def invert_tree(root):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'TreeNode* invertTree(TreeNode* root) {\n    if (!root) return nullptr;\n    TreeNode* old_left = root->left;\n    root->left = invertTree(root->right);\n    root->right = invertTree(old_left);\n    return root;\n}',
        python: 'def invert_tree(root):\n    if not root:\n        return None\n    root.left, root.right = invert_tree(root.right), invert_tree(root.left)\n    return root'
      },
      checks: {
        cpp: [
          { re: '->\\s*left', hint: 'You have to touch the left child.' },
          { re: '->\\s*right', hint: 'You have to touch the right child.' },
          { re: 'invert|swap|stack|queue|deque|while\\s*\\(', hint: 'Recurse, or drive an explicit stack / queue.' },
          { re: 'return', hint: 'Return the root of the inverted tree.' }
        ],
        python: [
          { re: '\\.left', hint: 'You have to touch the left child.' },
          { re: '\\.right', hint: 'You have to touch the right child.' },
          { re: 'invert|swap|stack|queue|deque|while\\s', hint: 'Recurse, or drive an explicit stack / queue.' },
          { re: 'return', hint: 'Return the root of the inverted tree.' }
        ]
      },
      mcq: [
        { q: 'Does it matter whether you swap the children before or after recursing?',
          opts: ['Yes - swapping after recursion inverts only the top level', 'No, as long as you do not lose a pointer while overwriting it', 'Yes - only post-order gives the right answer', 'It matters only for unbalanced trees'],
          correct: 1,
          why: 'Every node gets swapped exactly once either way. The only real hazard is assigning to left before you have read the old left pointer.' }
      ]
    },
    {
      id: 'nc-max-depth',
      title: 'Maximum Depth of Binary Tree',
      section: 'trees',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given the root of a binary tree, return its maximum depth: the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.',
      examples: [
        { in: 'root = [3,9,20,null,null,15,7]', out: '3' },
        { in: 'root = [1,null,2]', out: '2' }
      ],
      approach: 'Depth of a node is 1 plus the larger of the two child depths, with an empty subtree contributing 0. That recurrence is a direct post-order recursion. Level-order BFS counting the number of levels gives the same answer.',
      keyInsight: 'Height is defined by a recurrence on subtrees, so the recursive solution is the definition typed out.',
      pitfalls: [
        'Returning 1 for an empty tree instead of 0.',
        'Adding the child depths instead of taking the maximum - that is the diameter, not the depth.'
      ],
      complexity: { time: 'O(n)', space: 'O(h)' },
      timeChoices: ['O(h)', 'O(log n)', 'O(n)', 'O(n log n)'],
      timeAnswer: 2,
      starter: {
        cpp: 'int maxDepth(TreeNode* root) {\n    // your code here\n}',
        python: 'def max_depth(root):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int maxDepth(TreeNode* root) {\n    if (!root) return 0;\n    return 1 + max(maxDepth(root->left), maxDepth(root->right));\n}',
        python: 'def max_depth(root):\n    if not root:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))'
      },
      checks: {
        cpp: [
          { re: 'max\\s*\\(|\\?|if\\s*\\(|while\\s*\\(', hint: 'Take the larger of the two child depths, or count BFS levels.' },
          { re: '->\\s*left[\\s\\S]{0,200}->\\s*right|->\\s*right[\\s\\S]{0,200}->\\s*left|queue|stack', hint: 'Visit both subtrees.' },
          { re: 'return', hint: 'Return the depth.' }
        ],
        python: [
          { re: 'max\\s*\\(|if\\s|while\\s', hint: 'Take the larger of the two child depths, or count BFS levels.' },
          { re: '\\.left[\\s\\S]{0,200}\\.right|\\.right[\\s\\S]{0,200}\\.left|deque|stack|queue', hint: 'Visit both subtrees.' },
          { re: 'return', hint: 'Return the depth.' }
        ]
      },
      mcq: [
        { q: 'A tree of n nodes is a single downward path. How deep does the recursive depth computation go?',
          opts: ['O(log n)', 'O(sqrt n)', 'n frames', 'It does not recurse at all'],
          correct: 2,
          why: 'Recursion depth equals tree height, and a path-shaped tree has height n. That is why very deep trees can blow the call stack and need an iterative traversal.' }
      ]
    },
    {
      id: 'nc-diameter-tree',
      title: 'Diameter of Binary Tree',
      section: 'trees',
      tier: 'intermediate',
      difficulty: 'Easy',
      prompt: 'Given the root of a binary tree, return the length of its diameter: the number of edges on the longest path between any two nodes. The path does not have to pass through the root.',
      examples: [
        { in: 'root = [1,2,3,4,5]', out: '3' },
        { in: 'root = [1,2]', out: '1' }
      ],
      approach: 'Write one post-order helper that returns the height of a subtree. At each node, the best path that bends at that node has length leftHeight + rightHeight, so update a running maximum with that value and return 1 + max(leftHeight, rightHeight) to the parent.',
      keyInsight: 'Every candidate path has a unique highest node. Computing height once per node and recording the bend there covers all paths in a single O(n) pass.',
      pitfalls: [
        'Returning the bend value instead of the height, which corrupts the parent computation.',
        'Calling a separate height() from every node, which is O(n^2).',
        'Counting nodes rather than edges - the answer is edges.'
      ],
      complexity: { time: 'O(n)', space: 'O(h)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int diameterOfBinaryTree(TreeNode* root) {\n    // your code here\n}',
        python: 'def diameter_of_binary_tree(root):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int diameterOfBinaryTree(TreeNode* root) {\n    int best = 0;\n    function<int(TreeNode*)> height = [&](TreeNode* node) -> int {\n        if (!node) return 0;\n        int l = height(node->left);\n        int r = height(node->right);\n        best = max(best, l + r);\n        return 1 + max(l, r);\n    };\n    height(root);\n    return best;\n}',
        python: 'def diameter_of_binary_tree(root):\n    best = 0\n\n    def height(node):\n        nonlocal best\n        if not node:\n            return 0\n        l = height(node.left)\n        r = height(node.right)\n        best = max(best, l + r)\n        return 1 + max(l, r)\n\n    height(root)\n    return best'
      },
      checks: {
        cpp: [
          { re: 'max\\s*\\(|\\?', hint: 'Track the best left-height plus right-height seen so far.' },
          { re: '->\\s*left[\\s\\S]{0,300}->\\s*right|->\\s*right[\\s\\S]{0,300}->\\s*left', hint: 'Recurse into both subtrees.' },
          { re: 'return', hint: 'Return the diameter.' }
        ],
        python: [
          { re: 'max\\s*\\(', hint: 'Track the best left-height plus right-height seen so far.' },
          { re: '\\.left[\\s\\S]{0,300}\\.right|\\.right[\\s\\S]{0,300}\\.left', hint: 'Recurse into both subtrees.' },
          { re: 'return', hint: 'Return the diameter.' }
        ]
      },
      mcq: [
        { q: 'Why is the answer left height plus right height, with no plus one?',
          opts: ['Because the root is not counted as a node', 'Because the diameter is measured in edges, and each height already counts the edge down into that subtree', 'Because heights are 1-indexed', 'Because one side is always empty'],
          correct: 1,
          why: 'A subtree of height h hangs h edges below the bend node, so the two sides contribute l + r edges in total. Counting nodes instead would give l + r + 1.' }
      ]
    },
    {
      id: 'nc-balanced-tree',
      title: 'Balanced Binary Tree',
      section: 'trees',
      tier: 'intermediate',
      difficulty: 'Easy',
      prompt: 'Given the root of a binary tree, return true if it is height-balanced: for every node the heights of its two subtrees differ by at most 1.',
      examples: [
        { in: 'root = [3,9,20,null,null,15,7]', out: 'true' },
        { in: 'root = [1,2,2,3,3,null,null,4,4]', out: 'false' }
      ],
      approach: 'One post-order pass returns the height of each subtree, or a sentinel such as -1 meaning "something below is already unbalanced". As soon as a child reports the sentinel, or the two heights differ by more than 1, propagate the sentinel upward without further work.',
      keyInsight: 'Folding the failure flag into the height return value keeps the whole check to a single O(n) traversal instead of calling height() again at every node.',
      pitfalls: [
        'Checking only the root subtree heights - balance is required at every node.',
        'Calling a separate height() inside the recursion, which re-walks subtrees and degrades to O(n^2).'
      ],
      complexity: { time: 'O(n)', space: 'O(h)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
      timeAnswer: 0,
      starter: {
        cpp: 'bool isBalanced(TreeNode* root) {\n    // your code here\n}',
        python: 'def is_balanced(root):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool isBalanced(TreeNode* root) {\n    function<int(TreeNode*)> check = [&](TreeNode* node) -> int {\n        if (!node) return 0;\n        int l = check(node->left);\n        if (l < 0) return -1;\n        int r = check(node->right);\n        if (r < 0) return -1;\n        if (abs(l - r) > 1) return -1;\n        return 1 + max(l, r);\n    };\n    return check(root) >= 0;\n}',
        python: 'def is_balanced(root):\n    def check(node):\n        if not node:\n            return 0\n        l = check(node.left)\n        if l < 0:\n            return -1\n        r = check(node.right)\n        if r < 0:\n            return -1\n        if abs(l - r) > 1:\n            return -1\n        return 1 + max(l, r)\n\n    return check(root) >= 0'
      },
      checks: {
        cpp: [
          { re: 'abs\\s*\\(|>\\s*1|<=\\s*1|-\\s*1', hint: 'Compare the two subtree heights against a difference of 1.' },
          { re: 'max\\s*\\(|\\?', hint: 'The height of a node is 1 plus the taller child.' },
          { re: 'return', hint: 'Return whether the tree is balanced.' }
        ],
        python: [
          { re: 'abs\\s*\\(|>\\s*1|<=\\s*1|-\\s*1', hint: 'Compare the two subtree heights against a difference of 1.' },
          { re: 'max\\s*\\(', hint: 'The height of a node is 1 plus the taller child.' },
          { re: 'return', hint: 'Return whether the tree is balanced.' }
        ]
      },
      mcq: [
        { q: 'What is the cost of the naive version that computes height(node) freshly at every node?',
          opts: ['O(n)', 'O(n log n) on any tree', 'O(n^2) in the worst case, because a skewed tree re-walks nearly the whole tree at each level', 'O(2^n)'],
          correct: 2,
          why: 'Each height() call is linear in its subtree. On a path-shaped tree the subtree sizes are n, n-1, n-2, ... which sums to O(n^2). The single post-order pass avoids the repetition.' }
      ]
    },
    {
      id: 'nc-same-tree',
      title: 'Same Tree',
      section: 'trees',
      tier: 'beginner',
      difficulty: 'Easy',
      prompt: 'Given the roots p and q of two binary trees, return true if they have identical structure and identical values at every position.',
      examples: [
        { in: 'p = [1,2,3], q = [1,2,3]', out: 'true' },
        { in: 'p = [1,2], q = [1,null,2]', out: 'false' }
      ],
      approach: 'Compare the two nodes in lockstep. Both null means equal; exactly one null, or different values, means unequal; otherwise recurse on the two left children and the two right children and require both to agree.',
      keyInsight: 'Structural equality is itself recursive, so the three base cases plus one conjunction cover every input.',
      pitfalls: [
        'Checking values before checking for null and dereferencing a null pointer.',
        'Comparing left with right, which tests for a mirror image rather than equality.'
      ],
      complexity: { time: 'O(n)', space: 'O(h)' },
      timeChoices: ['O(1)', 'O(n)', 'O(n log n)', 'O(n^2)'],
      timeAnswer: 1,
      starter: {
        cpp: 'bool isSameTree(TreeNode* p, TreeNode* q) {\n    // your code here\n}',
        python: 'def is_same_tree(p, q):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool isSameTree(TreeNode* p, TreeNode* q) {\n    if (!p && !q) return true;\n    if (!p || !q) return false;\n    if (p->val != q->val) return false;\n    return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);\n}',
        python: 'def is_same_tree(p, q):\n    if p is None and q is None:\n        return True\n    if p is None or q is None:\n        return False\n    if p.val != q.val:\n        return False\n    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)'
      },
      checks: {
        cpp: [
          { re: '->\\s*val', hint: 'Compare the two node values.' },
          { re: '->\\s*left[\\s\\S]{0,200}->\\s*right|->\\s*right[\\s\\S]{0,200}->\\s*left', hint: 'Recurse on both pairs of children.' },
          { re: 'return', hint: 'Return the verdict.' }
        ],
        python: [
          { re: '\\.val', hint: 'Compare the two node values.' },
          { re: '\\.left[\\s\\S]{0,200}\\.right|\\.right[\\s\\S]{0,200}\\.left', hint: 'Recurse on both pairs of children.' },
          { re: 'return', hint: 'Return the verdict.' }
        ]
      },
      mcq: [
        { q: 'Why is the "exactly one of p and q is null" case checked separately?',
          opts: ['To keep the recursion tail-recursive', 'Because two trees can differ in shape while every present value matches, and dereferencing the null side would crash', 'Because null nodes have value 0', 'It is redundant and can be removed'],
          correct: 1,
          why: 'Shape is part of equality: [1,2] and [1,null,2] hold the same values but differ structurally. The check both detects that and protects the value comparison from a null dereference.' }
      ]
    },
    {
      id: 'nc-subtree-of-tree',
      title: 'Subtree of Another Tree',
      section: 'trees',
      tier: 'intermediate',
      difficulty: 'Easy',
      prompt: 'Given the roots root and subRoot of two binary trees, return true if some node of root, together with all of its descendants, forms a tree identical to subRoot.',
      examples: [
        { in: 'root = [3,4,5,1,2], subRoot = [4,1,2]', out: 'true' },
        { in: 'root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]', out: 'false' }
      ],
      approach: 'Reuse a same-tree helper. Walk every node of root; at each one, test whether the subtree rooted there is identical to subRoot. Return true on the first match, otherwise recurse into the left or right subtree.',
      keyInsight: 'It is two nested traversals: an outer one that chooses the candidate root and an inner one that compares. A subtree must include every descendant, so a partial match does not count.',
      pitfalls: [
        'Accepting a partial match, for example only the top few levels agreeing.',
        'Forgetting that an empty subRoot is trivially present, and that a null root cannot contain a non-empty subRoot.'
      ],
      complexity: { time: 'O(n * m)', space: 'O(h)' },
      timeChoices: ['O(n + m)', 'O(n * m)', 'O(n log m)', 'O(n^2 * m)'],
      timeAnswer: 1,
      starter: {
        cpp: 'bool isSubtree(TreeNode* root, TreeNode* subRoot) {\n    // your code here\n}',
        python: 'def is_subtree(root, sub_root):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool sameTree(TreeNode* a, TreeNode* b) {\n    if (!a && !b) return true;\n    if (!a || !b || a->val != b->val) return false;\n    return sameTree(a->left, b->left) && sameTree(a->right, b->right);\n}\n\nbool isSubtree(TreeNode* root, TreeNode* subRoot) {\n    if (!subRoot) return true;\n    if (!root) return false;\n    if (sameTree(root, subRoot)) return true;\n    return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);\n}',
        python: 'def is_subtree(root, sub_root):\n    def same(a, b):\n        if a is None and b is None:\n            return True\n        if a is None or b is None or a.val != b.val:\n            return False\n        return same(a.left, b.left) and same(a.right, b.right)\n\n    if sub_root is None:\n        return True\n    if root is None:\n        return False\n    if same(root, sub_root):\n        return True\n    return is_subtree(root.left, sub_root) or is_subtree(root.right, sub_root)'
      },
      checks: {
        cpp: [
          { re: '->\\s*val', hint: 'Somewhere you must compare node values.' },
          { re: '\\|\\||\\?|return\\s+true', hint: 'The match may sit in the left subtree or the right one.' },
          { re: 'left[\\s\\S]{0,300}right|right[\\s\\S]{0,300}left', hint: 'Both subtrees are candidates.' },
          { re: 'return', hint: 'Return the verdict.' }
        ],
        python: [
          { re: '\\.val', hint: 'Somewhere you must compare node values.' },
          { re: '\\bor\\b|any\\s*\\(|return\\s+True', hint: 'The match may sit in the left subtree or the right one.' },
          { re: '\\.left[\\s\\S]{0,300}\\.right|\\.right[\\s\\S]{0,300}\\.left', hint: 'Both subtrees are candidates.' },
          { re: 'return', hint: 'Return the verdict.' }
        ]
      },
      mcq: [
        { q: 'Which pair of trees shows why "the values of subRoot all appear below some node" is not enough?',
          opts: ['Two identical trees', 'root = [3,4,5,1,2,null,null,null,null,0] with subRoot = [4,1,2], where the candidate node has an extra child 0', 'A tree and its mirror', 'Any pair with different roots'],
          correct: 1,
          why: 'A subtree is a node plus all of its descendants. The extra child 0 hanging below 2 means the candidate subtree is strictly bigger than subRoot, so the answer is false even though every value of subRoot is present.' }
      ]
    },
    {
      id: 'nc-lca-bst',
      title: 'Lowest Common Ancestor of a BST',
      section: 'trees',
      tier: 'beginner',
      difficulty: 'Medium',
      prompt: 'Given the root of a binary search tree and two distinct nodes p and q that both exist in it, return their lowest common ancestor: the deepest node that has both p and q in its subtree (a node may be an ancestor of itself).',
      examples: [
        { in: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8', out: '6' },
        { in: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4', out: '2' }
      ],
      approach: 'Start at the root and walk down. If both values are smaller than the current node, the answer is entirely in the left subtree; if both are larger, go right. The first node where the two targets fall on opposite sides, or where one target equals the node, is the split point and therefore the LCA.',
      keyInsight: 'The BST ordering removes the search: you never have to explore both children, so the walk is O(h) with O(1) extra space.',
      pitfalls: [
        'Using the generic binary-tree LCA recursion and throwing away the ordering, turning O(h) into O(n).',
        'Using strict comparisons that skip past a node equal to p or q.'
      ],
      complexity: { time: 'O(h)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(h)', 'O(n)', 'O(n log n)'],
      timeAnswer: 1,
      starter: {
        cpp: 'TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n    // your code here\n}',
        python: 'def lowest_common_ancestor(root, p, q):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n    TreeNode* cur = root;\n    while (cur) {\n        if (p->val < cur->val && q->val < cur->val) cur = cur->left;\n        else if (p->val > cur->val && q->val > cur->val) cur = cur->right;\n        else return cur;\n    }\n    return nullptr;\n}',
        python: 'def lowest_common_ancestor(root, p, q):\n    cur = root\n    while cur:\n        if p.val < cur.val and q.val < cur.val:\n            cur = cur.left\n        elif p.val > cur.val and q.val > cur.val:\n            cur = cur.right\n        else:\n            return cur\n    return None'
      },
      checks: {
        cpp: [
          { re: '<|>', hint: 'Compare both targets with the current node value.' },
          { re: '->\\s*left', hint: 'Descend left when both targets are smaller.' },
          { re: '->\\s*right', hint: 'Descend right when both targets are larger.' },
          { re: 'return', hint: 'Return the ancestor node.' }
        ],
        python: [
          { re: '<|>', hint: 'Compare both targets with the current node value.' },
          { re: '\\.left', hint: 'Descend left when both targets are smaller.' },
          { re: '\\.right', hint: 'Descend right when both targets are larger.' },
          { re: 'return', hint: 'Return the ancestor node.' }
        ]
      },
      mcq: [
        { q: 'Why is the first node where p and q fall on opposite sides guaranteed to be their lowest common ancestor?',
          opts: ['Because it is the median of the tree', 'Because below that node the two targets are in different subtrees, so no deeper node contains both, and above it every node also contains both', 'Because BSTs are balanced', 'Because p and q are always leaves'],
          correct: 1,
          why: 'Once the paths to p and q diverge they never rejoin, so the split node is the deepest shared node. Every ancestor above it also contains both, but is not the lowest.' }
      ]
    },
    {
      id: 'nc-level-order',
      title: 'Binary Tree Level Order Traversal',
      section: 'trees',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given the root of a binary tree, return its level-order traversal as a list of lists: the values at depth 0, then depth 1, and so on, each level ordered left to right.',
      examples: [
        { in: 'root = [3,9,20,null,null,15,7]', out: '[[3],[9,20],[15,7]]' },
        { in: 'root = []', out: '[]' }
      ],
      approach: 'Push the root into a queue. On each iteration, record the current queue size - that is exactly one level - then pop that many nodes, collect their values into one list, and push their non-null children. Repeat until the queue empties.',
      keyInsight: 'Snapshotting the queue size at the top of each round is what separates the levels; without it the queue is just an undifferentiated stream of nodes.',
      pitfalls: [
        'Reading the queue size inside the loop after pushing children, which mixes two levels together.',
        'Pushing null children and then dereferencing them.',
        'Returning a flat list instead of a list per level.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(h)', 'O(n^2)'],
      timeAnswer: 0,
      starter: {
        cpp: 'vector<vector<int>> levelOrder(TreeNode* root) {\n    // your code here\n}',
        python: 'def level_order(root):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<vector<int>> levelOrder(TreeNode* root) {\n    vector<vector<int>> res;\n    if (!root) return res;\n    queue<TreeNode*> q;\n    q.push(root);\n    while (!q.empty()) {\n        int n = q.size();\n        vector<int> level;\n        for (int i = 0; i < n; i++) {\n            TreeNode* node = q.front();\n            q.pop();\n            level.push_back(node->val);\n            if (node->left) q.push(node->left);\n            if (node->right) q.push(node->right);\n        }\n        res.push_back(level);\n    }\n    return res;\n}',
        python: 'from collections import deque\n\ndef level_order(root):\n    if not root:\n        return []\n    res = []\n    dq = deque([root])\n    while dq:\n        level = []\n        for _ in range(len(dq)):\n            node = dq.popleft()\n            level.append(node.val)\n            if node.left:\n                dq.append(node.left)\n            if node.right:\n                dq.append(node.right)\n        res.append(level)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'queue|deque|vector\\s*<\\s*TreeNode|depth|level', hint: 'Process one level at a time with a queue, or DFS while tracking depth.' },
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Loop until every node has been visited.' },
          { re: 'push_back|emplace_back|resize', hint: 'Collect the values of each level.' },
          { re: 'return', hint: 'Return the list of levels.' }
        ],
        python: [
          { re: 'deque|queue|level|depth|\\[\\s*root\\s*\\]', hint: 'Process one level at a time with a queue, or DFS while tracking depth.' },
          { re: 'while\\s|for\\s', hint: 'Loop until every node has been visited.' },
          { re: 'append|insert|\\+=', hint: 'Collect the values of each level.' },
          { re: 'return', hint: 'Return the list of levels.' }
        ]
      },
      mcq: [
        { q: 'What is the peak queue size for a perfect binary tree with n nodes?',
          opts: ['O(1)', 'O(log n)', 'About n/2, the size of the bottom level', 'Exactly n'],
          correct: 2,
          why: 'The last level of a perfect tree holds roughly half the nodes, and BFS holds a whole level at once. That is why level-order costs O(n) space while DFS costs only O(h).' }
      ]
    },
    {
      id: 'nc-right-side-view',
      title: 'Binary Tree Right Side View',
      section: 'trees',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given the root of a binary tree, imagine standing to its right. Return the values of the nodes you can see, ordered from top to bottom - that is, the rightmost node of each level.',
      examples: [
        { in: 'root = [1,2,3,null,5,null,4]', out: '[1,3,4]' },
        { in: 'root = [1,null,3]', out: '[1,3]' }
      ],
      approach: 'Run a level-order traversal and record the last node dequeued in each level. Alternatively, do a DFS that visits right before left and appends a value the first time it reaches a new depth.',
      keyInsight: 'The visible node is a per-level property, so any traversal works as long as you can tell which node of a level you are looking at first or last.',
      pitfalls: [
        'Always following the right child, which fails when the right subtree is shorter than the left, as in [1,2,3,null,5,null,null].',
        'In the DFS version, comparing the result length to the depth incorrectly and skipping or duplicating a level.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(h)', 'O(n)', 'O(n log n)', 'O(n^2)'],
      timeAnswer: 1,
      starter: {
        cpp: 'vector<int> rightSideView(TreeNode* root) {\n    // your code here\n}',
        python: 'def right_side_view(root):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'vector<int> rightSideView(TreeNode* root) {\n    vector<int> res;\n    if (!root) return res;\n    queue<TreeNode*> q;\n    q.push(root);\n    while (!q.empty()) {\n        int n = q.size();\n        for (int i = 0; i < n; i++) {\n            TreeNode* node = q.front();\n            q.pop();\n            if (i == n - 1) res.push_back(node->val);\n            if (node->left) q.push(node->left);\n            if (node->right) q.push(node->right);\n        }\n    }\n    return res;\n}',
        python: 'from collections import deque\n\ndef right_side_view(root):\n    if not root:\n        return []\n    res = []\n    dq = deque([root])\n    while dq:\n        n = len(dq)\n        for i in range(n):\n            node = dq.popleft()\n            if i == n - 1:\n                res.append(node.val)\n            if node.left:\n                dq.append(node.left)\n            if node.right:\n                dq.append(node.right)\n    return res'
      },
      checks: {
        cpp: [
          { re: 'queue|deque|depth|level', hint: 'Work level by level, or DFS while tracking depth.' },
          { re: 'while\\s*\\(|for\\s*\\(', hint: 'Traverse every node.' },
          { re: 'push_back|emplace_back', hint: 'Record one value per level.' },
          { re: 'return', hint: 'Return the visible values top to bottom.' }
        ],
        python: [
          { re: 'deque|queue|depth|level', hint: 'Work level by level, or DFS while tracking depth.' },
          { re: 'while\\s|for\\s', hint: 'Traverse every node.' },
          { re: 'append|\\+=', hint: 'Record one value per level.' },
          { re: 'return', hint: 'Return the visible values top to bottom.' }
        ]
      },
      mcq: [
        { q: 'In the DFS version, which visiting order lets you append a node the first time you reach a new depth?',
          opts: ['Node, left, right', 'Left, node, right', 'Node, right, left', 'Left, right, node'],
          correct: 2,
          why: 'Visiting the right child before the left means the first node encountered at any depth is the rightmost one at that depth, so "is this depth new?" is the entire test.' }
      ]
    },
    {
      id: 'nc-count-good-nodes',
      title: 'Count Good Nodes in Binary Tree',
      section: 'trees',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'A node X in a binary tree is good if no node on the path from the root down to X has a value greater than X. Given the root, return the number of good nodes. The root is always good.',
      examples: [
        { in: 'root = [3,1,4,3,null,1,5]', out: '4' },
        { in: 'root = [3,3,null,4,2]', out: '3' }
      ],
      approach: 'Do a pre-order DFS carrying the maximum value seen so far on the path from the root. A node counts if its value is at least that maximum; then pass down the larger of the two to both children.',
      keyInsight: 'The predicate depends only on the path above the node, so a single downward-flowing parameter is enough - no post-order combination is needed.',
      pitfalls: [
        'Using strict greater-than, which wrongly rejects a node tied with its best ancestor.',
        'Sharing one mutable running maximum across siblings instead of passing it down by value, which leaks the left subtree maximum into the right subtree.'
      ],
      complexity: { time: 'O(n)', space: 'O(h)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(h)'],
      timeAnswer: 0,
      starter: {
        cpp: 'int goodNodes(TreeNode* root) {\n    // your code here\n}',
        python: 'def good_nodes(root):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int goodNodes(TreeNode* root) {\n    function<int(TreeNode*, int)> dfs = [&](TreeNode* node, int best) -> int {\n        if (!node) return 0;\n        int count = (node->val >= best) ? 1 : 0;\n        int nextBest = max(best, node->val);\n        return count + dfs(node->left, nextBest) + dfs(node->right, nextBest);\n    };\n    return dfs(root, INT_MIN);\n}',
        python: 'def good_nodes(root):\n    def dfs(node, best):\n        if not node:\n            return 0\n        count = 1 if node.val >= best else 0\n        next_best = max(best, node.val)\n        return count + dfs(node.left, next_best) + dfs(node.right, next_best)\n\n    return dfs(root, float(\'-inf\'))'
      },
      checks: {
        cpp: [
          { re: 'max\\s*\\(|>=|>|<', hint: 'Compare the node with the best value seen on the path.' },
          { re: '->\\s*left[\\s\\S]{0,300}->\\s*right|->\\s*right[\\s\\S]{0,300}->\\s*left|stack|queue', hint: 'Carry the running maximum into both subtrees.' },
          { re: 'return', hint: 'Return the count of good nodes.' }
        ],
        python: [
          { re: 'max\\s*\\(|>=|>|<', hint: 'Compare the node with the best value seen on the path.' },
          { re: '\\.left[\\s\\S]{0,300}\\.right|\\.right[\\s\\S]{0,300}\\.left|stack|deque', hint: 'Carry the running maximum into both subtrees.' },
          { re: 'return', hint: 'Return the count of good nodes.' }
        ]
      },
      mcq: [
        { q: 'Why must the running maximum be passed down as a parameter rather than kept in one shared variable that is updated and restored later?',
          opts: ['A shared variable is fine and is faster', 'Because the maximum along the left path must not affect the right subtree, and a parameter naturally scopes it to one root-to-node path', 'Because recursion cannot read outer variables', 'Because the maximum can be negative'],
          correct: 1,
          why: 'Goodness depends on the ancestors of a node, not on nodes visited earlier in the traversal. A by-value parameter gives each branch its own copy, which is exactly the path scope you want.' }
      ]
    },
    {
      id: 'nc-validate-bst',
      title: 'Validate Binary Search Tree',
      section: 'trees',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given the root of a binary tree, return true if it is a valid binary search tree: every value in a node left subtree is strictly less than the node, every value in its right subtree is strictly greater, and both subtrees are themselves valid BSTs.',
      examples: [
        { in: 'root = [2,1,3]', out: 'true' },
        { in: 'root = [5,1,4,null,null,3,6]', out: 'false' }
      ],
      approach: 'Recurse with an open interval (low, high) that the current node must fall inside. Going left tightens the high bound to the node value; going right tightens the low bound. Alternatively, run an in-order traversal and check that every value is strictly greater than the previous one.',
      keyInsight: 'The BST property is global, not a parent-child rule. The interval carries an ancestor constraint down to every descendant, which is precisely what the local check misses.',
      pitfalls: [
        'Only checking left.val < node.val < right.val, which accepts [5,1,4,null,null,3,6].',
        'Using int sentinels when node values can be INT_MIN or INT_MAX - use a wider type or an optional bound.',
        'Allowing equality, which lets duplicates through.'
      ],
      complexity: { time: 'O(n)', space: 'O(h)' },
      timeChoices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)'],
      timeAnswer: 1,
      starter: {
        cpp: 'bool isValidBST(TreeNode* root) {\n    // your code here\n}',
        python: 'def is_valid_bst(root):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'bool isValidBST(TreeNode* root) {\n    function<bool(TreeNode*, long long, long long)> check = [&](TreeNode* node, long long lo, long long hi) -> bool {\n        if (!node) return true;\n        if (node->val <= lo || node->val >= hi) return false;\n        return check(node->left, lo, node->val) && check(node->right, node->val, hi);\n    };\n    return check(root, LLONG_MIN, LLONG_MAX);\n}',
        python: 'def is_valid_bst(root):\n    def check(node, lo, hi):\n        if node is None:\n            return True\n        if not (lo < node.val < hi):\n            return False\n        return check(node.left, lo, node.val) and check(node.right, node.val, hi)\n\n    return check(root, float(\'-inf\'), float(\'inf\'))'
      },
      checks: {
        cpp: [
          { re: 'LLONG|LONG_MIN|INT_MIN|numeric_limits|long long|stack|prev|inorder|in_order|nullptr|NULL', hint: 'Either carry a (low, high) range down, or verify that the in-order sequence strictly increases.' },
          { re: '<|>', hint: 'Compare the node against its bounds or against the previous in-order value.' },
          { re: '->\\s*left[\\s\\S]{0,300}->\\s*right|->\\s*right[\\s\\S]{0,300}->\\s*left|while\\s*\\(', hint: 'Both subtrees have to be checked.' },
          { re: 'return', hint: 'Return the verdict.' }
        ],
        python: [
          { re: 'inf|stack|prev|last|inorder|in_order|None|sorted', hint: 'Either carry a (low, high) range down, or verify that the in-order sequence strictly increases.' },
          { re: '<|>', hint: 'Compare the node against its bounds or against the previous in-order value.' },
          { re: '\\.left[\\s\\S]{0,300}\\.right|\\.right[\\s\\S]{0,300}\\.left|while\\s', hint: 'Both subtrees have to be checked.' },
          { re: 'return', hint: 'Return the verdict.' }
        ]
      },
      mcq: [
        { q: 'Which tree is accepted by the local check left.val < node.val < right.val but is not a valid BST?',
          opts: ['[2,1,3]', '[5,1,4,null,null,3,6], where 3 sits in the right subtree of 5 but is smaller than 5', '[1]', '[1,null,2]'],
          correct: 1,
          why: 'Node 4 is greater than its left child 3 and less than its right child 6, so every parent-child pair looks fine. But 3 lies in the right subtree of 5 and must exceed 5, which only an inherited bound catches.' }
      ]
    },
    {
      id: 'nc-kth-smallest-bst',
      title: 'Kth Smallest Element in a BST',
      section: 'trees',
      tier: 'intermediate',
      difficulty: 'Medium',
      prompt: 'Given the root of a binary search tree and an integer k (1-indexed), return the k-th smallest value in the tree.',
      examples: [
        { in: 'root = [3,1,4,null,2], k = 1', out: '1' },
        { in: 'root = [5,3,6,2,4,null,null,1], k = 3', out: '3' }
      ],
      approach: 'Run an in-order traversal, which emits BST values in ascending order, and stop as soon as you have emitted k of them. An explicit stack version pushes the whole left spine, pops one node as the next smallest, then moves to that node right child.',
      keyInsight: 'You do not need to sort or even finish the traversal: in-order already produces sorted order, so the k-th value pops out after k steps.',
      pitfalls: [
        'Materialising the entire traversal into an array when only k values are needed.',
        'Off-by-one from treating k as 0-indexed.',
        'Descending into the right subtree before finishing the left spine, which breaks the ordering.'
      ],
      complexity: { time: 'O(h + k)', space: 'O(h)' },
      timeChoices: ['O(k)', 'O(h + k)', 'O(n log n)', 'O(n^2)'],
      timeAnswer: 1,
      starter: {
        cpp: 'int kthSmallest(TreeNode* root, int k) {\n    // your code here\n}',
        python: 'def kth_smallest(root, k):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'int kthSmallest(TreeNode* root, int k) {\n    stack<TreeNode*> st;\n    TreeNode* cur = root;\n    while (cur || !st.empty()) {\n        while (cur) {\n            st.push(cur);\n            cur = cur->left;\n        }\n        cur = st.top();\n        st.pop();\n        if (--k == 0) return cur->val;\n        cur = cur->right;\n    }\n    return -1;\n}',
        python: 'def kth_smallest(root, k):\n    stack = []\n    cur = root\n    while cur or stack:\n        while cur:\n            stack.append(cur)\n            cur = cur.left\n        cur = stack.pop()\n        k -= 1\n        if k == 0:\n            return cur.val\n        cur = cur.right'
      },
      checks: {
        cpp: [
          { re: 'stack|vector|inorder|in_order|recurs|kthSmallest|push', hint: 'In-order traversal, recursive or with an explicit stack.' },
          { re: '->\\s*left', hint: 'Exhaust the left subtree first - those are the smaller values.' },
          { re: '->\\s*right', hint: 'After a node, continue into its right subtree.' },
          { re: 'return', hint: 'Return the k-th value.' }
        ],
        python: [
          { re: 'stack|\\[\\s*\\]|inorder|in_order|append|yield|kth', hint: 'In-order traversal, recursive or with an explicit stack.' },
          { re: '\\.left', hint: 'Exhaust the left subtree first - those are the smaller values.' },
          { re: '\\.right', hint: 'After a node, continue into its right subtree.' },
          { re: 'return', hint: 'Return the k-th value.' }
        ]
      },
      mcq: [
        { q: 'If the tree is modified often and kthSmallest is called often, what changes the query cost from O(h + k) to O(h)?',
          opts: ['Caching the last answer', 'Storing in each node the number of nodes in its left subtree, so you can decide at each step whether to go left, stop, or go right with an adjusted k', 'Converting the tree to a linked list', 'Using a hash map from k to value'],
          correct: 1,
          why: 'With subtree sizes, comparing k against leftSize + 1 tells you which way to descend, so a query walks one root-to-node path. Inserts and deletes then have to maintain those counts.' }
      ]
    },
    {
      id: 'nc-build-tree-pre-in',
      title: 'Construct Binary Tree from Preorder and Inorder Traversal',
      section: 'trees',
      tier: 'advanced',
      difficulty: 'Medium',
      prompt: 'Given two integer arrays preorder and inorder representing the pre-order and in-order traversals of the same binary tree, with all values distinct, build and return the tree. TreeNode takes (val, left, right).',
      examples: [
        { in: 'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]', out: '[3,9,20,null,null,15,7]' },
        { in: 'preorder = [-1], inorder = [-1]', out: '[-1]' }
      ],
      approach: 'Consume preorder left to right: the next unused value is always the root of the current range. Look up its position in inorder to learn how the range splits, build the left subtree from the part before it and the right subtree from the part after it. A hash map from value to in-order index makes that lookup O(1).',
      keyInsight: 'Pre-order tells you which node comes next; in-order tells you where the boundary between the two subtrees is. Neither array alone determines the tree, but together they do.',
      pitfalls: [
        'Scanning inorder linearly for the root, which makes the build O(n^2).',
        'Advancing the pre-order pointer more than once per node, or building the right subtree before the left, which desynchronises the pointer.',
        'Getting the range bounds wrong on the empty case (low greater than high must produce null).'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)'],
      timeAnswer: 0,
      starter: {
        cpp: 'TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {\n    // your code here\n}',
        python: 'def build_tree(preorder, inorder):\n    # your code here\n    pass'
      },
      solution: {
        cpp: 'TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {\n    unordered_map<int,int> pos;\n    for (int i = 0; i < (int)inorder.size(); i++) pos[inorder[i]] = i;\n    int p = 0;\n    function<TreeNode*(int,int)> build = [&](int lo, int hi) -> TreeNode* {\n        if (lo > hi) return nullptr;\n        int val = preorder[p++];\n        TreeNode* node = new TreeNode(val);\n        int mid = pos[val];\n        node->left = build(lo, mid - 1);\n        node->right = build(mid + 1, hi);\n        return node;\n    };\n    return build(0, (int)inorder.size() - 1);\n}',
        python: 'def build_tree(preorder, inorder):\n    pos = {v: i for i, v in enumerate(inorder)}\n    idx = 0\n\n    def build(lo, hi):\n        nonlocal idx\n        if lo > hi:\n            return None\n        val = preorder[idx]\n        idx += 1\n        node = TreeNode(val)\n        mid = pos[val]\n        node.left = build(lo, mid - 1)\n        node.right = build(mid + 1, hi)\n        return node\n\n    return build(0, len(inorder) - 1)'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<|find\\s*\\(|distance|index|pos', hint: 'Locate the root inside the in-order range.' },
          { re: 'new\\s+TreeNode|TreeNode\\s*\\(', hint: 'Allocate a node for each value.' },
          { re: '->\\s*left[\\s\\S]{0,300}->\\s*right', hint: 'Build the left subtree before the right one so the pre-order pointer stays in sync.' },
          { re: 'return', hint: 'Return the root.' }
        ],
        python: [
          { re: '\\{|dict\\(|index\\s*\\(|enumerate|pop\\s*\\(', hint: 'Locate the root inside the in-order range.' },
          { re: 'TreeNode\\s*\\(', hint: 'Create a node for each value.' },
          { re: '\\.left[\\s\\S]{0,300}\\.right', hint: 'Build the left subtree before the right one so the pre-order pointer stays in sync.' },
          { re: 'return', hint: 'Return the root.' }
        ]
      },
      mcq: [
        { q: 'Why can a binary tree with distinct values not be reconstructed from its pre-order and post-order traversals alone?',
          opts: ['Because post-order is not well defined', 'Because a node with exactly one child gives no way to tell whether that child is the left or the right one', 'Because the two arrays have different lengths', 'It can be - the pair is sufficient'],
          correct: 1,
          why: 'In-order is what marks the boundary between the two subtrees. With pre-order and post-order, a single-child node is ambiguous, so several trees share the same pair.' }
      ]
    }
  ];
  const Q = [];
  window.DB.problems.push(...P);
  window.DB.questions.push(...Q);
})();
