/* supplement.js — fills the coverage gaps the validator flagged:
 * sections with too few items to build an exam, sections with no coding
 * problem, and domains missing beginner-tier items for the placement exam.
 */
(function () {
  'use strict';

  const P = [
    {
      id: 'lld-strategy', title: 'Replace an If-Chain with Strategy', section: 'lld-principles',
      tier: 'beginner', difficulty: 'Easy',
      prompt: 'This function grows a new branch every time a discount type is added.\n\n    def price(base, kind):\n        if kind == "regular":  return base\n        elif kind == "member": return base * 0.9\n        elif kind == "staff":  return base * 0.7\n\nRestructure it so that adding a discount type means adding code, not editing this function.',
      examples: [
        { in: 'price(100) with the member strategy', out: '90.0', why: 'The strategy object supplies the rule; the caller supplies the amount.' },
        { in: 'adding a "student" discount', out: 'one new class, no existing file edited', why: 'That is the Open/Closed principle made concrete.' }
      ],
      constraints: ['Adding a discount must not require editing existing code.', 'All strategies share one interface.'],
      approach: 'Each branch of the conditional is really a different algorithm sharing one signature, which is exactly what Strategy models. Define an interface with a single price method, implement it once per discount type, and have the caller hold a reference to whichever instance it needs. The conditional disappears entirely: choosing the strategy happens once, at construction or configuration time, rather than on every call. The payoff is that a new discount is a new class in a new file, and no existing tested code is reopened. In C++ this is a pure virtual base with a unique_ptr; in Python an ABC, or simply any object with the right method since duck typing does not require the base class.',
      keyInsight: 'Each branch is an algorithm with a shared signature. Give it an interface and the conditional disappears.',
      pitfalls: [
        'Keeping a factory with the same if-chain inside it and calling the job done — the chain should exist in at most one place, and ideally be data-driven.',
        'Giving each strategy a different method name, which defeats the shared interface.',
        'Storing the discount as a raw number, which loses the ability to express rules that are not a simple multiplier.'
      ],
      complexity: { time: 'O(1)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: {
        python: 'from abc import ABC, abstractmethod\n\nclass PricingStrategy(ABC):\n    @abstractmethod\n    def price(self, base):\n        ...\n\n# implement the concrete strategies',
        cpp: '#include <memory>\n\nclass PricingStrategy {\npublic:\n    virtual double price(double base) const = 0;\n    virtual ~PricingStrategy() = default;\n};\n\n// implement the concrete strategies'
      },
      solution: {
        python: 'from abc import ABC, abstractmethod\n\nclass PricingStrategy(ABC):\n    @abstractmethod\n    def price(self, base):\n        ...\n\nclass Regular(PricingStrategy):\n    def price(self, base):\n        return base\n\nclass Member(PricingStrategy):\n    def price(self, base):\n        return base * 0.9\n\nclass Staff(PricingStrategy):\n    def price(self, base):\n        return base * 0.7\n\nclass Checkout:\n    def __init__(self, strategy):\n        self.strategy = strategy      # injected, not constructed here\n\n    def total(self, base):\n        return self.strategy.price(base)\n\n# adding Student is a new class — nothing above is edited',
        cpp: '#include <memory>\n#include <utility>\n\nclass PricingStrategy {\npublic:\n    virtual double price(double base) const = 0;\n    virtual ~PricingStrategy() = default;\n};\n\nclass Regular : public PricingStrategy {\npublic:\n    double price(double base) const override { return base; }\n};\n\nclass Member : public PricingStrategy {\npublic:\n    double price(double base) const override { return base * 0.9; }\n};\n\nclass Staff : public PricingStrategy {\npublic:\n    double price(double base) const override { return base * 0.7; }\n};\n\nclass Checkout {\n    std::unique_ptr<PricingStrategy> strategy_;\npublic:\n    explicit Checkout(std::unique_ptr<PricingStrategy> s)\n        : strategy_(std::move(s)) {}          // injected, not constructed here\n\n    double total(double base) const { return strategy_->price(base); }\n};'
      },
      checks: {
        python: [
          { re: 'class\\s+\\w+', hint: 'Define a class per discount type.' },
          { re: 'ABC|abstractmethod|Protocol|def\\s+price', hint: 'Share one interface across the strategies.' },
          { re: 'def\\s+price', hint: 'Every strategy implements the same method.' },
          { re: 'return', hint: 'Return the computed price.' }
        ],
        cpp: [
          { re: 'class\\s+\\w+|struct\\s+\\w+', hint: 'Define a class per discount type.' },
          { re: 'virtual', hint: 'Share one interface across the strategies.' },
          { re: 'price', hint: 'Every strategy implements the same method.' },
          { re: 'return', hint: 'Return the computed price.' }
        ]
      },
      antiChecks: {
        python: [{ re: 'elif\\s+kind|if\\s+kind\\s*==', hint: 'The if-chain on a type field is exactly what Strategy removes.' }],
        cpp: [{ re: 'else\\s+if\\s*\\(\\s*kind|switch\\s*\\(\\s*kind', hint: 'The if-chain on a type field is exactly what Strategy removes.' }]
      },
      mcq: [
        { q: 'A factory still needs to map a name to a strategy. Does that defeat the pattern?', opts: ['Yes, the conditional just moved', 'No — the point is that the choice exists in exactly one place instead of being repeated at every use, and it can be replaced by a lookup table', 'Yes, factories are an anti-pattern', 'Only in Python'], correct: 1, why: 'Something must map input to implementation. Confining it to one registry, ideally a dict, is the win; the failure would be leaving copies of the chain scattered through the code.' },
        { q: 'Why does Python not strictly need the ABC base class here?', opts: ['ABCs are deprecated', 'Duck typing means any object with a price method works; the ABC documents the contract and fails earlier', 'Python has no inheritance', 'Because the method is static'], correct: 1, why: 'Dispatch is by attribute lookup, not by declared type. The ABC buys an explicit contract and an error at instantiation rather than at call time.' }
      ]
    },
    {
      id: 'ml-dense-layer', title: 'Dense Layer Forward and Backward', section: 'ml-deep-learning',
      tier: 'advanced', difficulty: 'Hard',
      prompt: 'Implement the forward and backward pass of a single dense layer with a ReLU activation, for one input vector.\n\nForward: z = W·x + b, a = relu(z).\nBackward: given dA, the gradient of the loss with respect to a, return the gradients dW, db and dX.',
      examples: [
        { in: 'z has a negative component', out: 'that component contributes 0 to every gradient', why: 'The ReLU derivative is 0 wherever its input was negative, which blocks the gradient there.' },
        { in: 'dA of all ones with all-positive z', out: 'db equals dA, dW is the outer product of dA and x', why: 'db collects the raw gradient; dW scales it by the input that produced it.' }
      ],
      constraints: ['One sample, not a batch.', 'Return all three gradients.'],
      approach: 'The forward pass caches z, because the backward pass needs to know the sign of each pre-activation. Backward is the chain rule applied three times. First push the gradient back through the activation: dZ = dA * (z > 0), since the ReLU derivative is 1 where its input was positive and 0 otherwise — this is exactly why a unit whose pre-activation is negative learns nothing on that example. Then, since z = Wx + b, the derivative of z with respect to b is 1 so db = dZ; the derivative with respect to W picks up the input, giving dW as the outer product dZ x^T; and the derivative with respect to x picks up the weights, giving dX = W^T dZ, which is what propagates to the previous layer.',
      keyInsight: 'dZ = dA * (z > 0) is the whole activation step. After that, db is dZ, dW carries the input, and dX carries the weights.',
      pitfalls: [
        'Using a > 0 instead of z > 0 — equivalent for ReLU by luck, but wrong for any activation that can output zero from a positive input.',
        'Transposing dW, which then cannot be subtracted from W.',
        'Forgetting to cache z in the forward pass, making the backward pass impossible.'
      ],
      complexity: { time: 'O(n*m)', space: 'O(n*m)' },
      timeChoices: ['O(n)', 'O(n*m)', 'O(n^2*m)', 'O(1)'], timeAnswer: 1,
      starter: {
        python: 'def forward(W, b, x):\n    """Return (a, cache)."""\n    pass\n\ndef backward(dA, cache, W):\n    """Return (dW, db, dX)."""\n    pass',
        cpp: '#include <vector>\n\n// forward: a = relu(W*x + b); backward: gradients dW, db, dX'
      },
      solution: {
        python: 'def forward(W, b, x):\n    # W is m x n, x is length n, b is length m\n    z = [sum(W[i][j] * x[j] for j in range(len(x))) + b[i]\n         for i in range(len(W))]\n    a = [v if v > 0 else 0.0 for v in z]        # relu\n    return a, (z, x)                            # cache z: backward needs its sign\n\n\ndef backward(dA, cache, W):\n    z, x = cache\n    m, n = len(W), len(x)\n\n    # 1. through the activation: relu derivative is 1 where z > 0, else 0\n    dZ = [dA[i] if z[i] > 0 else 0.0 for i in range(m)]\n\n    # 2. z = Wx + b  ->  db = dZ, dW = outer(dZ, x), dX = W^T dZ\n    db = dZ[:]\n    dW = [[dZ[i] * x[j] for j in range(n)] for i in range(m)]\n    dX = [sum(W[i][j] * dZ[i] for i in range(m)) for j in range(n)]\n\n    return dW, db, dX',
        cpp: '#include <vector>\n#include <cstddef>\n\nstruct Cache { std::vector<double> z, x; };\n\nstd::vector<double> forward(const std::vector<std::vector<double>>& W,\n                            const std::vector<double>& b,\n                            const std::vector<double>& x,\n                            Cache& cache) {\n    size_t m = W.size(), n = x.size();\n    std::vector<double> z(m), a(m);\n    for (size_t i = 0; i < m; ++i) {\n        double s = b[i];\n        for (size_t j = 0; j < n; ++j) s += W[i][j] * x[j];\n        z[i] = s;\n        a[i] = s > 0.0 ? s : 0.0;              // relu\n    }\n    cache.z = z; cache.x = x;                  // backward needs the sign of z\n    return a;\n}\n\nvoid backward(const std::vector<double>& dA, const Cache& cache,\n              const std::vector<std::vector<double>>& W,\n              std::vector<std::vector<double>>& dW,\n              std::vector<double>& db,\n              std::vector<double>& dX) {\n    size_t m = W.size(), n = cache.x.size();\n\n    // 1. through the activation\n    std::vector<double> dZ(m);\n    for (size_t i = 0; i < m; ++i)\n        dZ[i] = cache.z[i] > 0.0 ? dA[i] : 0.0;\n\n    // 2. db = dZ, dW = outer(dZ, x), dX = W^T dZ\n    db = dZ;\n    dW.assign(m, std::vector<double>(n, 0.0));\n    for (size_t i = 0; i < m; ++i)\n        for (size_t j = 0; j < n; ++j)\n            dW[i][j] = dZ[i] * cache.x[j];\n\n    dX.assign(n, 0.0);\n    for (size_t j = 0; j < n; ++j)\n        for (size_t i = 0; i < m; ++i)\n            dX[j] += W[i][j] * dZ[i];\n}'
      },
      checks: {
        python: [
          { re: 'relu|>\\s*0', hint: 'Apply the ReLU and its derivative.' },
          { re: 'cache|z', hint: 'Cache the pre-activation for the backward pass.' },
          { re: 'dW|dw', hint: 'Compute the weight gradient.' },
          { re: 'dX|dx|db', hint: 'Compute the input and bias gradients.' },
          { re: 'return', hint: 'Return the gradients.' }
        ],
        cpp: [
          { re: 'relu|>\\s*0', hint: 'Apply the ReLU and its derivative.' },
          { re: 'cache|z', hint: 'Cache the pre-activation for the backward pass.' },
          { re: 'dW|dw', hint: 'Compute the weight gradient.' },
          { re: 'dX|dx|db', hint: 'Compute the input and bias gradients.' },
          { re: 'for', hint: 'Loop over the matrix dimensions.' }
        ]
      },
      antiChecks: { python: [], cpp: [] },
      mcq: [
        { q: 'Why must the forward pass cache z rather than only a?',
          opts: ['To save recomputation', 'The activation derivative depends on the sign of the pre-activation, which a alone cannot always recover', 'To support batching', 'It does not need to'],
          correct: 1, why: 'For ReLU you can recover it by luck, since a is 0 exactly when z was negative. For sigmoid or tanh you cannot, so caching z is the general habit.' },
        { q: 'A unit\'s pre-activation is negative for every training example. What happens?',
          opts: ['It learns faster', 'Its gradient is always zero, so its weights never update — the "dying ReLU" problem', 'It saturates at 1', 'It produces NaN'],
          correct: 1, why: 'The ReLU derivative is 0 there, so no gradient flows back through that unit at all. Leaky ReLU exists to keep a small non-zero slope for negative inputs.' }
      ]
    },
    {
      id: 'ml-train-test-split', title: 'Leakage-Free Train/Test Split', section: 'ml-systems',
      tier: 'beginner', difficulty: 'Easy',
      prompt: 'Split paired feature and label lists into training and test sets by a given ratio, shuffling first so any ordering in the data does not bias the split.\n\nFeatures and labels must stay aligned: row i of the features must keep its own label.',
      examples: [
        { in: '10 rows, ratio 0.8', out: '8 training rows, 2 test rows', why: 'The split index is floor(n * ratio).' },
        { in: 'data sorted by label', out: 'both sets contain a mix', why: 'Without shuffling, an ordered dataset puts one class entirely in the test set.' }
      ],
      constraints: ['Features and labels must remain aligned.', 'Shuffle before splitting.', 'No row may appear in both sets.'],
      approach: 'The trap is shuffling the two lists independently, which silently destroys the pairing and produces a model trained on mismatched labels — it fails quietly, with accuracy stuck near chance. Shuffle a list of indices once and apply that same permutation to both lists, or zip the pair together and shuffle the combined structure. Then slice at floor(n * ratio). Shuffling matters because real datasets are often sorted by label, date or source: splitting an ordered file directly can put an entire class into the test set. Two caveats worth stating: for time-series data you must NOT shuffle, because the split has to respect chronology, and for imbalanced classification you want a stratified split so both sets keep the class ratio.',
      keyInsight: 'Shuffle indices once and apply them to both lists. Shuffling the two independently breaks the pairing silently.',
      pitfalls: [
        'Shuffling features and labels separately, which destroys the correspondence.',
        'Shuffling time-series data, which leaks the future into the training set.',
        'Ignoring stratification on imbalanced data, so a rare class can vanish from one split.'
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(n)', 'O(n log n)', 'O(n^2)'], timeAnswer: 1,
      starter: {
        python: 'import random\n\ndef train_test_split(X, y, ratio=0.8, seed=0):\n    """Return (X_train, y_train, X_test, y_test)."""\n    pass',
        cpp: '#include <vector>\n#include <numeric>\n#include <random>\n\n// split X and y into train and test, keeping rows aligned'
      },
      solution: {
        python: 'import random\n\ndef train_test_split(X, y, ratio=0.8, seed=0):\n    n = len(X)\n    idx = list(range(n))\n    random.Random(seed).shuffle(idx)     # ONE permutation, applied to both\n\n    cut = int(n * ratio)\n    train, test = idx[:cut], idx[cut:]\n\n    X_train = [X[i] for i in train]\n    y_train = [y[i] for i in train]\n    X_test  = [X[i] for i in test]\n    y_test  = [y[i] for i in test]\n    return X_train, y_train, X_test, y_test',
        cpp: '#include <vector>\n#include <numeric>\n#include <random>\n#include <cstddef>\n\ntemplate <typename T>\nvoid trainTestSplit(const std::vector<T>& X, const std::vector<int>& y,\n                    double ratio, unsigned seed,\n                    std::vector<T>& Xtr, std::vector<int>& ytr,\n                    std::vector<T>& Xte, std::vector<int>& yte) {\n    size_t n = X.size();\n    std::vector<size_t> idx(n);\n    std::iota(idx.begin(), idx.end(), 0);\n\n    std::mt19937 rng(seed);\n    std::shuffle(idx.begin(), idx.end(), rng);   // ONE permutation for both\n\n    size_t cut = size_t(double(n) * ratio);\n    for (size_t k = 0; k < n; ++k) {\n        size_t i = idx[k];\n        if (k < cut) { Xtr.push_back(X[i]); ytr.push_back(y[i]); }\n        else         { Xte.push_back(X[i]); yte.push_back(y[i]); }\n    }\n}'
      },
      checks: {
        python: [
          { re: 'shuffle|sample|permutation', hint: 'Shuffle before splitting.' },
          { re: 'range|idx|index', hint: 'Permute indices so both lists stay aligned.' },
          { re: 'ratio|cut|int\\s*\\(', hint: 'Split at the ratio point.' },
          { re: 'return', hint: 'Return all four pieces.' }
        ],
        cpp: [
          { re: 'shuffle|random', hint: 'Shuffle before splitting.' },
          { re: 'iota|idx|index', hint: 'Permute indices so both lists stay aligned.' },
          { re: 'ratio|cut', hint: 'Split at the ratio point.' },
          { re: 'push_back|=', hint: 'Fill the output containers.' }
        ]
      },
      antiChecks: { python: [], cpp: [] },
      mcq: [
        { q: 'What goes wrong if you shuffle X and y separately?',
          opts: ['Nothing, they are the same length', 'Each row is paired with another row\'s label, so the model trains on noise and accuracy sits near chance', 'It raises an error', 'Only the test set is affected'],
          correct: 1, why: 'The failure is silent — the shapes still match. It typically shows up as a model that will not learn at all, which is a confusing symptom to debug.' },
        { q: 'When should you NOT shuffle before splitting?',
          opts: ['When the dataset is small', 'For time-series data, where the test set must come strictly after the training set', 'When classes are balanced', 'Never, always shuffle'],
          correct: 1, why: 'Shuffling a time series trains on the future to predict the past. That is impossible in production, so the offline score is meaningless.' }
      ]
    }
  ];

  const Q = [
    /* ---- tries: reach the exam threshold ---- */
    { id: 'q-ti-007', section: 'tries', tier: 'beginner', topic: 'when to use',
      q: 'Which requirement points at a trie rather than a hash set?',
      opts: ['Fast exact-match lookup', 'Answering "which stored words start with this prefix?"', 'Storing integers', 'Sorting the input'],
      correct: 1, why: 'Hashing destroys the key structure, so prefixes are not represented at all. A trie stores shared prefixes explicitly, which is what makes prefix queries cheap.' },

    { id: 'q-ti-008', section: 'tries', tier: 'advanced', topic: 'deletion',
      q: 'What is the subtlety when deleting a word from a trie?',
      opts: ['Nodes cannot be deleted', 'You may only remove nodes that are not a prefix of another word and have no children', 'You must rebuild the trie', 'Deletion is O(n) in the dictionary size'],
      correct: 1, why: 'Removing "app" must not break "apple". Clear the terminal flag, then prune upward only while a node has no children and is not itself terminal.' },

    { id: 'q-ti-009', section: 'tries', tier: 'master', topic: 'space',
      q: 'What is the worst case for trie memory?',
      opts: ['A dictionary of identical words', 'Words with no shared prefixes, where the trie stores roughly one node per character with no sharing at all', 'Very short words', 'Sorted input'],
      correct: 1, why: 'The saving comes entirely from shared prefixes. Random strings share almost nothing, so the trie degenerates to storing every character plus per-node child structures.' },

    /* ---- math-geometry: reach the exam threshold ---- */
    { id: 'q-mg-007', section: 'math-geometry', tier: 'beginner', topic: 'integer division',
      q: 'In C++, what does -7 / 2 evaluate to?',
      opts: ['-4', '-3', '-3.5', 'Undefined'],
      correct: 1, why: 'Integer division truncates toward zero, giving -3, and -7 % 2 is -1. Python floors instead, so -7 // 2 is -4 — a genuine cross-language trap.' },

    { id: 'q-mg-008', section: 'math-geometry', tier: 'intermediate', topic: 'ceiling division',
      q: 'How do you compute ceil(a / b) for positive integers using only integer arithmetic?',
      opts: ['a / b + 1', '(a + b - 1) / b', 'a / (b - 1)', '(a / b) * b'],
      correct: 1, why: 'Adding b-1 pushes any non-zero remainder up to the next multiple before truncation. Writing ceil on floating point risks precision errors for large values.' },

    { id: 'q-mg-009', section: 'math-geometry', tier: 'advanced', topic: 'gcd',
      q: 'What is the time complexity of the Euclidean algorithm for gcd(a, b)?',
      opts: ['O(min(a,b))', 'O(log min(a,b))', 'O(sqrt(a))', 'O(a*b)'],
      correct: 1, why: 'Each modulo step at least halves the larger argument within two iterations, so the number of steps is logarithmic in the input value.' },

    /* ---- ml-deep-learning ---- */
    { id: 'q-ml-031', section: 'ml-deep-learning', tier: 'intermediate', topic: 'activations',
      q: 'Why did ReLU largely replace sigmoid in hidden layers?',
      opts: ['It is bounded', 'Its derivative is exactly 1 for positive inputs, so gradients do not shrink multiplicatively with depth', 'It is smoother', 'It outputs probabilities'],
      correct: 1, why: 'Sigmoid saturates and its derivative peaks at 0.25, so deep stacks kill the gradient. ReLU passes it through unchanged wherever the unit is active.' },

    { id: 'q-ml-032', section: 'ml-deep-learning', tier: 'beginner', topic: 'basics',
      q: 'What does a loss function do?',
      opts: ['Selects the model architecture', 'Turns the gap between prediction and truth into a single number the optimiser can minimise', 'Splits the data', 'Normalises the inputs'],
      correct: 1, why: 'Training is optimisation, and optimisation needs a scalar objective. Choosing the loss is choosing what "wrong" means for your problem.' },

    /* ---- ml-systems ---- */
    { id: 'q-ml-033', section: 'ml-systems', tier: 'beginner', topic: 'basics',
      q: 'Why hold out a test set instead of measuring on the training data?',
      opts: ['To save computation', 'Performance on data the model has already seen is optimistic and says nothing about new inputs', 'To reduce overfitting directly', 'To balance the classes'],
      correct: 1, why: 'A model can memorise its training set. The held-out set is the only estimate of how it behaves on data it has never seen — which is the only thing production cares about.' },

    { id: 'q-ml-034', section: 'ml-systems', tier: 'beginner', topic: 'deployment',
      q: 'What is the most common cause of a model performing worse in production than offline?',
      opts: ['Slower hardware', 'Features computed differently in serving than in training', 'Too few parameters', 'The random seed changed'],
      correct: 1, why: 'Train/serve skew is a code-duplication bug, not a modelling one. It is why feature stores and shared transformation code exist.' },

    { id: 'q-ml-035', section: 'ml-systems', tier: 'advanced', topic: 'shadow deployment',
      q: 'What does a shadow deployment give you that an A/B test does not?',
      opts: ['Statistical significance', 'Real production traffic through the new model with its outputs discarded, so you can check latency and stability with zero user risk', 'A larger sample', 'Faster results'],
      correct: 1, why: 'Shadow mode validates that the system works on real inputs before anyone is exposed. It cannot measure user impact, which is what the A/B test is for.' },

    /* ---- LLD beginner tier for the placement exam ---- */
    { id: 'q-lld-021', section: 'lld-principles', tier: 'beginner', topic: 'encapsulation',
      q: 'What is the practical point of making a field private?',
      opts: ['It runs faster', 'The class controls every path that changes its state, so it can guarantee an invariant', 'It saves memory', 'It is required for inheritance'],
      correct: 1, why: 'An invariant you cannot enforce is only a comment. Routing all mutation through methods is what lets a class promise, for example, that its size always matches its contents.' },

    { id: 'q-lld-022', section: 'lld-principles', tier: 'beginner', topic: 'interfaces',
      q: 'What does programming to an interface mean?',
      opts: ['Using a GUI framework', 'Depending on what a collaborator can do, not on which concrete class it is, so the implementation can be swapped', 'Writing documentation first', 'Avoiding all inheritance'],
      correct: 1, why: 'It is what makes a test double substitutable for a database, and what lets a second implementation arrive without touching the caller.' },

    { id: 'q-lld-023', section: 'lld-problems', tier: 'beginner', topic: 'modelling',
      q: 'You are designing a library system. Which is most likely a distinct class rather than a field?',
      opts: ['The colour of a book cover', 'A Loan, which links a member to a copy with dates and its own lifecycle', 'The number of pages', 'The title string'],
      correct: 1, why: 'A loan has identity, state and behaviour that changes over time. The others are attributes describing something else.' },

    { id: 'q-lld-024', section: 'lld-problems', tier: 'beginner', topic: 'requirements',
      q: 'An interviewer says "design a parking lot" and nothing else. What is your first move?',
      opts: ['Start writing the ParkingLot class', 'Ask about vehicle types, levels, pricing and scale, and state your assumptions', 'Choose the design patterns', 'Draw the database schema'],
      correct: 1, why: 'The requirements are deliberately underspecified. Asking is part of what is being assessed, and a design built on wrong assumptions cannot be rescued later.' },

    /* ---- ML beginner tier for the placement exam ---- */
    { id: 'q-ml-036', section: 'ml-foundations', tier: 'beginner', topic: 'supervised learning',
      q: 'What distinguishes supervised from unsupervised learning?',
      opts: ['Supervised uses more data', 'Supervised learns from labelled examples of the correct output; unsupervised finds structure in unlabelled data', 'Unsupervised is always deep learning', 'Supervised runs faster'],
      correct: 1, why: 'The presence of a target is the dividing line. Classification and regression are supervised; clustering and dimensionality reduction are not.' },

    { id: 'q-ml-037', section: 'ml-modeling', tier: 'beginner', topic: 'classification vs regression',
      q: 'What separates a classification problem from a regression problem?',
      opts: ['The amount of data', 'Classification predicts a discrete category, regression predicts a continuous quantity', 'Classification is always harder', 'Regression cannot use neural networks'],
      correct: 1, why: 'The output type drives the loss function and the metrics: cross-entropy and accuracy for categories, squared error and R² for quantities.' },

    { id: 'q-ml-038', section: 'ml-foundations', tier: 'beginner', topic: 'features',
      q: 'What is a feature in machine learning?',
      opts: ['A bug that was intended', 'An individual measurable input the model uses to make its prediction', 'The model output', 'A type of neural network layer'],
      correct: 1, why: 'Features are the representation the model sees. Feature quality usually constrains performance far more than the choice of algorithm.' }
  ];

  window.DB.problems.push.apply(window.DB.problems, P);
  window.DB.questions.push.apply(window.DB.questions, Q);
})();
