/* ml.js — machine learning lessons, from-scratch drills and question bank.
 * Sections: ml-foundations, ml-modeling, ml-deep-learning, ml-systems.
 */
(function () {
  'use strict';

  const L = [
    {
      id: 'ml-l1', track: 'ml', section: 'ml-foundations', tier: 'beginner', order: 1,
      title: 'Bias, variance, and what overfitting actually is',
      summary: 'The one decomposition that explains most model failures.',
      minutes: 13,
      body: '<p>Expected prediction error splits into three parts: <b>bias</b> squared, <b>variance</b>, and irreducible noise.</p>' +
        '<ul><li><b>Bias</b> — error from the model being too simple to represent the truth. A line fitting a curve.</li>' +
        '<li><b>Variance</b> — error from the model being so flexible it fits the noise in this particular sample.</li>' +
        '<li><b>Noise</b> — irreducible. No model removes it.</li></ul>' +
        '<h3>Reading the learning curve</h3>' +
        '<table><thead><tr><th>Train error</th><th>Validation error</th><th>Diagnosis</th><th>Action</th></tr></thead><tbody>' +
        '<tr><td>High</td><td>High, close to train</td><td>Underfitting (bias)</td><td>Bigger model, better features, train longer</td></tr>' +
        '<tr><td>Low</td><td>Much higher</td><td>Overfitting (variance)</td><td>More data, regularisation, simpler model</td></tr>' +
        '<tr><td>Low</td><td>Low</td><td>Working</td><td>Ship it</td></tr>' +
        '<tr><td>High</td><td>Lower than train</td><td>Bug or leakage</td><td>Investigate — this should not happen</td></tr>' +
        '</tbody></table>' +
        '<p>That last row is worth internalising: validation error below training error usually means your validation set is contaminated or the split is wrong.</p>' +
        '<h3>More data is not always the answer</h3>' +
        '<p>More data reduces variance. It does essentially nothing for bias — a linear model fed ten times more data is still a line. Diagnose which one you have before spending money on labelling.</p>' +
        '<h3>Regularisation trades one for the other</h3>' +
        '<pre class="code"># L2 (ridge): shrinks all weights toward zero, keeps them all\nloss = mse + lambda_ * sum(w**2)\n\n# L1 (lasso): drives some weights exactly to zero -> feature selection\nloss = mse + lambda_ * sum(abs(w))</pre>' +
        '<p>L1 produces sparsity because its gradient is constant in magnitude, so it keeps pushing a small weight all the way to zero. L2\'s gradient shrinks with the weight, so it approaches zero without arriving.</p>'
    },
    {
      id: 'ml-l2', track: 'ml', section: 'ml-foundations', tier: 'intermediate', order: 2,
      title: 'Validation, and the leakage that invalidates it',
      summary: 'Why your offline metric was great and production was not.',
      minutes: 13,
      body: '<h3>The point of a held-out set</h3>' +
        '<p>Any metric computed on data the model trained on is optimistic. The validation set exists to estimate performance on data you have not seen — and that estimate is only honest if the set really is unseen.</p>' +
        '<h3>Leakage: the four common forms</h3>' +
        '<p><b>1. Target leakage.</b> A feature that encodes the answer, often because it is recorded after the event you are predicting.</p>' +
        '<pre class="code"># predicting whether a customer will churn\nfeatures = ["tenure", "plan", "cancellation_reason"]   # only exists if they churned</pre>' +
        '<p><b>2. Preprocessing leakage.</b> Fitting a scaler or imputer on the whole dataset before splitting, so validation statistics inform the training transform.</p>' +
        '<pre class="code"># COMMON MISTAKE\nX = scaler.fit_transform(X)          # saw the validation rows\nX_tr, X_va = train_test_split(X)\n\n# FIX\nX_tr, X_va = train_test_split(X)\nX_tr = scaler.fit_transform(X_tr)    # fit on train only\nX_va = scaler.transform(X_va)        # transform validation with train stats</pre>' +
        '<p><b>3. Temporal leakage.</b> Random splitting time-series data lets the model train on the future and predict the past. Split by time.</p>' +
        '<p><b>4. Group leakage.</b> The same user, patient or document appearing in both splits. Group-aware splitting fixes it.</p>' +
        '<h3>Cross-validation</h3>' +
        '<p>k-fold gives k estimates instead of one, which matters when the dataset is small enough that a single split is noisy. Use <b>stratified</b> folds for imbalanced classification so every fold has the rare class, and never use plain k-fold on time series — use a forward-chaining split where each fold trains only on the past.</p>'
    },
    {
      id: 'ml-l3', track: 'ml', section: 'ml-modeling', tier: 'intermediate', order: 1,
      title: 'Metrics: when accuracy lies',
      summary: 'Precision, recall, F1, ROC-AUC, PR-AUC, and choosing between them.',
      minutes: 14,
      body: '<h3>The setup that breaks accuracy</h3>' +
        '<p>Fraud is 0.1% of transactions. Predict "not fraud" for everything and you score 99.9% accuracy while catching nothing. Accuracy is only meaningful when classes are balanced and the two error types cost about the same.</p>' +
        '<h3>The confusion matrix</h3>' +
        '<pre class="code">                 predicted +    predicted -\nactual +            TP             FN        &lt;- missed positives\nactual -            FP             TN\n\nprecision = TP / (TP + FP)     of what I flagged, how much was right\nrecall    = TP / (TP + FN)     of what was there, how much did I find\nF1        = harmonic mean of the two</pre>' +
        '<h3>Choosing by the cost of being wrong</h3>' +
        '<ul><li><b>Recall matters more</b> when a miss is expensive: disease screening, fraud detection. A false alarm costs a follow-up; a miss costs far more.</li>' +
        '<li><b>Precision matters more</b> when a false alarm is expensive: spam filtering, automated account bans. A missed spam is an annoyance; a blocked real email is a serious failure.</li></ul>' +
        '<h3>ROC-AUC versus PR-AUC</h3>' +
        '<p>ROC plots true positive rate against false positive rate. Its problem under heavy imbalance is that the false positive rate has a huge denominator, so thousands of false positives barely move the curve — ROC-AUC can look excellent for a useless model.</p>' +
        '<p>PR-AUC plots precision against recall, and precision has the number of predicted positives in its denominator. It reacts to exactly the failure that matters. <b>Under strong imbalance, prefer PR-AUC.</b></p>' +
        '<h3>The threshold is a separate decision</h3>' +
        '<p>A classifier outputs a score. The 0.5 cutoff is a default, not a law. Pick the threshold from the precision-recall curve using your actual cost ratio — this is often the cheapest available improvement to a deployed model.</p>'
    },
    {
      id: 'ml-l4', track: 'ml', section: 'ml-deep-learning', tier: 'advanced', order: 1,
      title: 'Backpropagation and why training breaks',
      summary: 'The chain rule, vanishing gradients, and what the fixes actually fix.',
      minutes: 15,
      body: '<h3>Backprop is the chain rule with bookkeeping</h3>' +
        '<p>The forward pass computes and caches intermediate values. The backward pass walks the graph in reverse, multiplying local derivatives. Nothing more exotic than that.</p>' +
        '<pre class="code"># one dense layer, both directions\n# forward\nz = W @ x + b\na = relu(z)\n\n# backward, given da (gradient of the loss w.r.t. a)\ndz = da * (z &gt; 0)          # ReLU derivative: 1 where z &gt; 0, else 0\ndW = dz @ x.T\ndb = dz\ndx = W.T @ dz             # what gets passed to the previous layer</pre>' +
        '<h3>Vanishing gradients</h3>' +
        '<p>Each layer multiplies the gradient by its local derivative. Sigmoid saturates and its derivative peaks at 0.25, so ten sigmoid layers scale the gradient by at most 0.25^10 — roughly one in a million. Early layers stop learning.</p>' +
        '<p>The fixes and what each one does:</p>' +
        '<ul><li><b>ReLU</b>: derivative is exactly 1 for positive inputs, so nothing shrinks.</li>' +
        '<li><b>Residual connections</b>: <code>y = f(x) + x</code> gives the gradient a path with derivative 1 straight back to earlier layers.</li>' +
        '<li><b>Batch norm</b>: keeps activations in the range where derivatives are healthy.</li>' +
        '<li><b>Careful initialisation</b> (He, Xavier): sets the initial scale so activations neither explode nor collapse across depth.</li></ul>' +
        '<h3>Exploding gradients</h3>' +
        '<p>The same multiplication running the other way. The standard fix is gradient clipping: rescale the gradient when its norm exceeds a threshold.</p>' +
        '<h3>Attention, briefly</h3>' +
        '<p>Attention computes a weighted average of values, where the weights come from the similarity of a query to each key.</p>' +
        '<pre class="code">Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d_k)) @ V</pre>' +
        '<p>The <code>sqrt(d_k)</code> divisor exists because dot products of high-dimensional vectors grow with dimension, which would push softmax into a saturated region where gradients vanish. Every token attends to every other, so cost is quadratic in sequence length — which is why long context is expensive.</p>'
    },
    {
      id: 'ml-l5', track: 'ml', section: 'ml-systems', tier: 'advanced', order: 1,
      title: 'Models in production: skew, drift, and evaluation',
      summary: 'Where offline accuracy stops predicting online behaviour.',
      minutes: 13,
      body: '<h3>Train/serve skew</h3>' +
        '<p>The most common production failure is not a bad model, it is features computed differently in training and serving. Training reads a batch table in pandas; serving computes the same feature in application code. The two drift apart and the model receives inputs it never saw.</p>' +
        '<p>The fix is structural: compute features once, in shared code or a feature store, so training and serving cannot disagree.</p>' +
        '<h3>Drift</h3>' +
        '<ul><li><b>Data drift</b>: the input distribution moves. Detectable without labels, by comparing recent feature distributions with the training distribution.</li>' +
        '<li><b>Concept drift</b>: the relationship between inputs and target moves. Requires labels to detect, and it is the more dangerous kind because the inputs still look normal.</li></ul>' +
        '<h3>Offline metrics do not settle it</h3>' +
        '<p>A model with better AUC can perform worse in production: it may be better on a distribution that no longer matters, or optimise a proxy that diverges from the business outcome. An A/B test measures the thing you actually care about.</p>' +
        '<h3>Practical A/B points</h3>' +
        '<ul><li>Randomise on a stable unit (user, not request) or the same user sees both arms.</li>' +
        '<li>Decide the metric and duration up front; peeking and stopping at significance inflates false positives.</li>' +
        '<li>Watch guardrail metrics — latency, error rate, revenue — not just the target metric.</li></ul>' +
        '<h3>What to monitor</h3>' +
        '<p>Input distributions, prediction distributions, latency, and the label-dependent metrics once labels arrive. A sudden shift in the <em>prediction</em> distribution is often the earliest signal available, because it needs no labels.</p>'
    }
  ];

  const P = [
    {
      id: 'ml-p1', title: 'Linear Regression by Gradient Descent', section: 'ml-foundations',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Fit y = w*x + b to paired data using gradient descent.\n\nRun a fixed number of iterations with a fixed learning rate and return the learned w and b. Use mean squared error.',
      examples: [
        { in: 'x = [1,2,3], y = [2,4,6]', out: 'w approaches 2, b approaches 0', why: 'A perfectly linear relationship, so the loss can reach zero.' },
        { in: 'a learning rate that is too large', out: 'the parameters diverge', why: 'Each step overshoots the minimum and the error grows instead of shrinking.' }
      ],
      constraints: ['Use MSE.', 'Update both parameters each iteration.', 'No numerical libraries required.'],
      approach: 'MSE is L = (1/n) * sum((w*x + b - y)^2). Differentiate with respect to each parameter: dL/dw = (2/n) * sum((pred - y) * x) and dL/db = (2/n) * sum(pred - y). Each iteration computes predictions, computes both gradients over the whole dataset, then steps each parameter in the direction that decreases the loss: w -= lr * dw. The essential detail is that both gradients must be computed from the same set of predictions before either parameter is updated — updating w and then recomputing predictions before computing db is a different algorithm and converges differently. The learning rate controls step size: too small and it crawls, too large and each step overshoots so the loss grows without bound.',
      keyInsight: 'Compute both gradients from the same predictions, then update both. Sequential updates are a different algorithm.',
      pitfalls: [
        'Updating w and then recomputing predictions before computing the gradient for b.',
        'Forgetting the 2/n factor, which silently rescales the effective learning rate.',
        'Using an unscaled learning rate on unscaled features, which diverges immediately.',
        'Summing instead of averaging, so the gradient magnitude depends on dataset size.'
      ],
      complexity: { time: 'O(n) per iteration', space: 'O(1)' },
      timeChoices: ['O(1) per iteration', 'O(log n) per iteration', 'O(n) per iteration', 'O(n^2) per iteration'], timeAnswer: 2,
      starter: {
        python: 'def fit(x, y, lr=0.01, iters=1000):\n    """Return (w, b) fitted by gradient descent."""\n    pass',
        cpp: '#include <vector>\n#include <utility>\n\nstd::pair<double,double> fit(const std::vector<double>& x,\n                             const std::vector<double>& y,\n                             double lr = 0.01, int iters = 1000);'
      },
      solution: {
        python: 'def fit(x, y, lr=0.01, iters=1000):\n    w, b = 0.0, 0.0\n    n = len(x)\n    for _ in range(iters):\n        # one set of predictions drives BOTH gradients\n        preds = [w * xi + b for xi in x]\n        errors = [p - yi for p, yi in zip(preds, y)]\n\n        dw = (2.0 / n) * sum(e * xi for e, xi in zip(errors, x))\n        db = (2.0 / n) * sum(errors)\n\n        w -= lr * dw          # update both only after both are computed\n        b -= lr * db\n    return w, b',
        cpp: '#include <vector>\n#include <utility>\n#include <cstddef>\n\nstd::pair<double,double> fit(const std::vector<double>& x,\n                             const std::vector<double>& y,\n                             double lr = 0.01, int iters = 1000) {\n    double w = 0.0, b = 0.0;\n    const size_t n = x.size();\n\n    for (int it = 0; it < iters; ++it) {\n        double dw = 0.0, db = 0.0;\n        for (size_t i = 0; i < n; ++i) {\n            double err = (w * x[i] + b) - y[i];   // same predictions for both\n            dw += err * x[i];\n            db += err;\n        }\n        dw *= 2.0 / double(n);\n        db *= 2.0 / double(n);\n\n        w -= lr * dw;\n        b -= lr * db;\n    }\n    return {w, b};\n}'
      },
      checks: {
        python: [
          { re: 'for', hint: 'Iterate the gradient-descent loop.' },
          { re: 'w\\s*-=|w\\s*=\\s*w\\s*-', hint: 'Step w against its gradient.' },
          { re: 'b\\s*-=|b\\s*=\\s*b\\s*-', hint: 'Step b against its gradient.' },
          { re: 'lr|learning', hint: 'Scale each step by the learning rate.' },
          { re: 'return', hint: 'Return the fitted parameters.' }
        ],
        cpp: [
          { re: 'for', hint: 'Iterate the gradient-descent loop.' },
          { re: 'w\\s*-=|w\\s*=\\s*w\\s*-', hint: 'Step w against its gradient.' },
          { re: 'b\\s*-=|b\\s*=\\s*b\\s*-', hint: 'Step b against its gradient.' },
          { re: 'lr|learning', hint: 'Scale each step by the learning rate.' },
          { re: 'return', hint: 'Return the fitted parameters.' }
        ]
      },
      antiChecks: { python: [], cpp: [] },
      mcq: [
        { q: 'Why compute both gradients before updating either parameter?', opts: ['It is faster', 'The gradient is defined at one point in parameter space; updating w first evaluates db at a different point, which is a different algorithm', 'To save memory', 'It makes no difference'], correct: 1, why: 'Batch gradient descent takes one step in the direction of the gradient at the current parameters. Interleaving updates changes the trajectory and the convergence guarantees.' },
        { q: 'The loss grows every iteration. What is the most likely cause?', opts: ['Too few iterations', 'The learning rate is too large, so each step overshoots the minimum', 'The data is not linear', 'A missing bias term'], correct: 1, why: 'Divergence is the signature of too large a step. Each update jumps past the minimum to a point with higher loss, and the effect compounds.' }
      ]
    },
    {
      id: 'ml-p2', title: 'Sigmoid and Binary Cross-Entropy', section: 'ml-foundations',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Implement the sigmoid function and binary cross-entropy loss.\n\nsigmoid(z) = 1 / (1 + e^-z). BCE for one example is -(y*log(p) + (1-y)*log(1-p)), averaged over the batch.\n\nBoth must be numerically stable for large-magnitude inputs.',
      examples: [
        { in: 'sigmoid(0)', out: '0.5', why: 'The curve is symmetric about zero.' },
        { in: 'sigmoid(-800)', out: '≈0 with no overflow', why: 'A naive exp(800) overflows to infinity; the branch avoids computing it.' },
        { in: 'bce(y=1, p=0)', out: 'a large finite number, not infinity', why: 'log(0) is -inf, so p must be clipped away from the endpoints.' }
      ],
      constraints: ['No overflow for large |z|.', 'No log(0).', 'Average over the batch.'],
      approach: 'Two numerical hazards. For sigmoid, exp(-z) overflows when z is a large negative number. Branch on the sign: for z >= 0 use 1/(1+exp(-z)), where the exponent is negative and safe; for z < 0 use exp(z)/(1+exp(z)), where again the exponent is negative. Both are algebraically identical, and each avoids the overflow the other would hit. For cross-entropy, a confident wrong prediction gives log(0) = -infinity, which poisons the gradient. Clip the probability into [eps, 1-eps] before taking logs, which bounds the loss at a large finite value. In production frameworks you avoid both by fusing the sigmoid into the loss and working in log-space, which is why the API is called binary_cross_entropy_with_logits.',
      keyInsight: 'Branch sigmoid on the sign of z so the exponent is always negative; clip probabilities before log so a confident mistake is finite.',
      pitfalls: [
        'Computing exp(-z) unconditionally, which overflows for large negative z.',
        'Taking log(p) without clipping, producing inf or nan the moment a prediction is confidently wrong.',
        'Clipping so aggressively that gradients disappear.',
        'Summing rather than averaging, making the loss scale with batch size.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 2,
      starter: {
        python: 'import math\n\ndef sigmoid(z):\n    pass\n\ndef bce(y_true, y_pred):\n    """Mean binary cross-entropy over two equal-length lists."""\n    pass',
        cpp: '#include <vector>\n#include <cmath>\n\ndouble sigmoid(double z);\ndouble bce(const std::vector<double>& yTrue, const std::vector<double>& yPred);'
      },
      solution: {
        python: 'import math\n\ndef sigmoid(z):\n    # branch so the exponent is always negative -> no overflow\n    if z >= 0:\n        return 1.0 / (1.0 + math.exp(-z))\n    e = math.exp(z)\n    return e / (1.0 + e)\n\n\ndef bce(y_true, y_pred):\n    eps = 1e-15                      # keep p away from 0 and 1\n    total = 0.0\n    for y, p in zip(y_true, y_pred):\n        p = min(max(p, eps), 1.0 - eps)\n        total += -(y * math.log(p) + (1.0 - y) * math.log(1.0 - p))\n    return total / len(y_true)       # mean, not sum',
        cpp: '#include <vector>\n#include <cmath>\n#include <algorithm>\n\ndouble sigmoid(double z) {\n    // branch so the exponent is always negative -> no overflow\n    if (z >= 0.0) return 1.0 / (1.0 + std::exp(-z));\n    double e = std::exp(z);\n    return e / (1.0 + e);\n}\n\ndouble bce(const std::vector<double>& yTrue, const std::vector<double>& yPred) {\n    const double eps = 1e-15;        // keep p away from 0 and 1\n    double total = 0.0;\n    for (size_t i = 0; i < yTrue.size(); ++i) {\n        double p = std::min(std::max(yPred[i], eps), 1.0 - eps);\n        total += -(yTrue[i] * std::log(p) + (1.0 - yTrue[i]) * std::log(1.0 - p));\n    }\n    return total / double(yTrue.size());   // mean, not sum\n}'
      },
      checks: {
        python: [
          { re: 'exp', hint: 'Use the exponential in sigmoid.' },
          { re: 'if|max\\s*\\(|min\\s*\\(', hint: 'Guard against overflow and log(0).' },
          { re: 'log', hint: 'Cross-entropy uses logarithms.' },
          { re: 'len|/', hint: 'Average the loss over the batch.' },
          { re: 'return', hint: 'Return both results.' }
        ],
        cpp: [
          { re: 'exp', hint: 'Use the exponential in sigmoid.' },
          { re: 'if|std::max|std::min', hint: 'Guard against overflow and log(0).' },
          { re: 'log', hint: 'Cross-entropy uses logarithms.' },
          { re: 'size\\s*\\(\\s*\\)|/', hint: 'Average the loss over the batch.' },
          { re: 'return', hint: 'Return both results.' }
        ]
      },
      antiChecks: { python: [], cpp: [] },
      mcq: [
        { q: 'Why branch sigmoid on the sign of z?', opts: ['It is faster', 'exp of a large positive number overflows; branching ensures the exponent passed to exp is always negative', 'To handle complex numbers', 'To avoid division'], correct: 1, why: 'exp(-z) with z = -800 is exp(800), which overflows to infinity. The algebraically equivalent form for negative z keeps the exponent negative and finite.' },
        { q: 'Why clip predictions before taking the log?', opts: ['To improve accuracy', 'A prediction of exactly 0 or 1 gives log(0) = -infinity, which makes the loss and its gradient unusable', 'To normalise the output', 'To speed up training'], correct: 1, why: 'One confidently wrong prediction would produce an infinite loss and a nan gradient that propagates through every parameter. Clipping bounds it at a large finite penalty.' }
      ]
    },
    {
      id: 'ml-p3', title: 'Precision, Recall and F1', section: 'ml-modeling',
      tier: 'intermediate', difficulty: 'Easy',
      prompt: 'Given lists of true and predicted binary labels, compute precision, recall and F1.\n\nHandle the degenerate cases: if nothing was predicted positive, precision is 0; if there were no actual positives, recall is 0; if precision and recall are both 0, F1 is 0.',
      examples: [
        { in: 'true=[1,1,0,0], pred=[1,0,0,0]', out: 'precision 1.0, recall 0.5, F1 0.667', why: 'One correct flag out of one flagged; one found out of two present.' },
        { in: 'pred is all zeros', out: 'precision 0, recall 0, F1 0', why: 'Zero denominators must not raise — this is the model that predicts the majority class.' }
      ],
      constraints: ['No division by zero.', 'F1 is the harmonic mean.'],
      approach: 'Count the three quantities that matter: true positives where both are 1, false positives where predicted is 1 and true is 0, and false negatives where predicted is 0 and true is 1. True negatives appear in none of these formulas, which is precisely why these metrics survive class imbalance while accuracy does not. Precision is TP/(TP+FP) and recall is TP/(TP+FN). Every denominator can be zero — a model that never predicts positive has TP+FP = 0 — so guard each one. F1 is the harmonic mean, 2PR/(P+R), which is used rather than the arithmetic mean because it is dragged down by whichever of the two is worse, so scoring well requires both.',
      keyInsight: 'True negatives appear in none of these formulas. That is exactly why they survive class imbalance and accuracy does not.',
      pitfalls: [
        'Dividing without guarding, so an all-negative prediction raises instead of scoring 0.',
        'Using the arithmetic mean for F1, which rewards a model with perfect precision and near-zero recall.',
        'Swapping the precision and recall denominators — a genuinely common slip under interview pressure.'
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], timeAnswer: 2,
      starter: {
        python: 'def prf1(y_true, y_pred):\n    """Return (precision, recall, f1)."""\n    pass',
        cpp: '#include <vector>\n#include <tuple>\n\nstd::tuple<double,double,double> prf1(const std::vector<int>& yTrue,\n                                      const std::vector<int>& yPred);'
      },
      solution: {
        python: 'def prf1(y_true, y_pred):\n    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)\n    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)\n    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)\n    # note: true negatives never appear -> immune to class imbalance\n\n    precision = tp / (tp + fp) if (tp + fp) else 0.0\n    recall    = tp / (tp + fn) if (tp + fn) else 0.0\n    f1 = (2 * precision * recall / (precision + recall)\n          if (precision + recall) else 0.0)     # harmonic mean\n    return precision, recall, f1',
        cpp: '#include <vector>\n#include <tuple>\n#include <cstddef>\n\nstd::tuple<double,double,double> prf1(const std::vector<int>& yTrue,\n                                      const std::vector<int>& yPred) {\n    int tp = 0, fp = 0, fn = 0;\n    for (size_t i = 0; i < yTrue.size(); ++i) {\n        if (yTrue[i] == 1 && yPred[i] == 1) ++tp;\n        else if (yTrue[i] == 0 && yPred[i] == 1) ++fp;\n        else if (yTrue[i] == 1 && yPred[i] == 0) ++fn;\n    }\n    // true negatives never appear -> immune to class imbalance\n\n    double precision = (tp + fp) ? double(tp) / (tp + fp) : 0.0;\n    double recall    = (tp + fn) ? double(tp) / (tp + fn) : 0.0;\n    double f1 = (precision + recall)\n              ? 2.0 * precision * recall / (precision + recall)   // harmonic mean\n              : 0.0;\n    return {precision, recall, f1};\n}'
      },
      checks: {
        python: [
          { re: 'tp|true_pos', hint: 'Count true positives.' },
          { re: 'fp|false_pos', hint: 'Count false positives.' },
          { re: 'fn|false_neg', hint: 'Count false negatives.' },
          { re: 'if|else', hint: 'Guard every zero denominator.' },
          { re: '2\\s*\\*', hint: 'F1 is the harmonic mean: 2PR/(P+R).' }
        ],
        cpp: [
          { re: 'tp|truePos', hint: 'Count true positives.' },
          { re: 'fp|falsePos', hint: 'Count false positives.' },
          { re: 'fn|falseNeg', hint: 'Count false negatives.' },
          { re: 'if|\\?', hint: 'Guard every zero denominator.' },
          { re: '2\\.0\\s*\\*|2\\s*\\*', hint: 'F1 is the harmonic mean: 2PR/(P+R).' }
        ]
      },
      antiChecks: { python: [], cpp: [] },
      mcq: [
        { q: 'Why is F1 the harmonic rather than the arithmetic mean?', opts: ['It is easier to compute', 'The harmonic mean is dominated by the smaller value, so a model cannot score well by maximising one metric and ignoring the other', 'It bounds the result to [0,1]', 'Convention only'], correct: 1, why: 'Precision 1.0 with recall 0.01 averages to 0.5 arithmetically but gives F1 of about 0.02. The harmonic mean refuses to reward that trade.' },
        { q: 'Why do these metrics survive class imbalance when accuracy does not?', opts: ['They are normalised differently', 'True negatives appear in none of the formulas, so a huge easy negative class cannot inflate the score', 'They use logarithms', 'They require a balanced dataset'], correct: 1, why: 'Accuracy counts true negatives in its numerator, so predicting the majority class scores well. Precision and recall ignore them entirely.' }
      ]
    },
    {
      id: 'ml-p4', title: 'K-Means Clustering', section: 'ml-modeling',
      tier: 'advanced', difficulty: 'Hard',
      prompt: 'Implement k-means for one-dimensional points.\n\nStart from k given initial centroids, then alternate: assign each point to its nearest centroid, and move each centroid to the mean of its assigned points. Stop when assignments stop changing or after a maximum number of iterations. Return the final centroids.',
      examples: [
        { in: 'points [1,2,10,11], k=2, init [0,100]', out: 'centroids near 1.5 and 10.5', why: 'The two natural groups are recovered despite poor initialisation.' },
        { in: 'a centroid ends up with no points', out: 'it must be handled, not divided by zero', why: 'An empty cluster is common with bad initialisation and crashes a naive mean.' }
      ],
      constraints: ['Handle empty clusters.', 'Stop on convergence or at max iterations.', 'Return the final centroids.'],
      approach: 'K-means alternates two steps that each reduce the same objective, the total squared distance from points to their assigned centroid. The assignment step fixes the centroids and assigns every point to the nearest one; the update step fixes the assignment and moves each centroid to the mean of its members, which is the point minimising squared distance to them. Because each step can only lower the objective and there are finitely many assignments, it always terminates — but only at a local optimum, which is why the result depends on initialisation and why k-means++ or several restarts are standard. The case that breaks a naive implementation is an empty cluster: taking the mean of nothing divides by zero, so leave that centroid where it is, or reseed it to the point furthest from any centroid.',
      keyInsight: 'Each step lowers the same objective, so it always converges — but only to a local optimum, so initialisation decides the answer.',
      pitfalls: [
        'Dividing by zero when a cluster receives no points.',
        'Never checking for convergence, so it always runs the maximum iterations.',
        'Assuming the result is the global optimum — it is not, so restart from several initialisations.',
        'Updating centroids inside the assignment loop, which makes it a different algorithm.'
      ],
      complexity: { time: 'O(n*k) per iteration', space: 'O(n + k)' },
      timeChoices: ['O(n) per iteration', 'O(n*k) per iteration', 'O(n^2) per iteration', 'O(k^2) per iteration'], timeAnswer: 1,
      starter: {
        python: 'def kmeans(points, centroids, max_iters=100):\n    """Return the final centroids."""\n    pass',
        cpp: '#include <vector>\n\nstd::vector<double> kmeans(const std::vector<double>& points,\n                           std::vector<double> centroids,\n                           int maxIters = 100);'
      },
      solution: {
        python: 'def kmeans(points, centroids, max_iters=100):\n    centroids = list(centroids)\n    k = len(centroids)\n    prev = None\n\n    for _ in range(max_iters):\n        # 1. assignment step: nearest centroid for every point\n        labels = []\n        for p in points:\n            best, best_d = 0, abs(p - centroids[0])\n            for i in range(1, k):\n                d = abs(p - centroids[i])\n                if d < best_d:\n                    best, best_d = i, d\n            labels.append(best)\n\n        if labels == prev:      # converged: assignments stopped changing\n            break\n        prev = labels\n\n        # 2. update step: each centroid becomes the mean of its members\n        for i in range(k):\n            members = [p for p, l in zip(points, labels) if l == i]\n            if members:                       # empty cluster -> leave it put\n                centroids[i] = sum(members) / len(members)\n\n    return centroids',
        cpp: '#include <vector>\n#include <cmath>\n#include <cstddef>\n\nstd::vector<double> kmeans(const std::vector<double>& points,\n                           std::vector<double> centroids,\n                           int maxIters = 100) {\n    const size_t k = centroids.size();\n    std::vector<int> labels(points.size(), -1), prev;\n\n    for (int it = 0; it < maxIters; ++it) {\n        // 1. assignment step\n        for (size_t p = 0; p < points.size(); ++p) {\n            int best = 0;\n            double bestD = std::fabs(points[p] - centroids[0]);\n            for (size_t i = 1; i < k; ++i) {\n                double d = std::fabs(points[p] - centroids[i]);\n                if (d < bestD) { bestD = d; best = int(i); }\n            }\n            labels[p] = best;\n        }\n\n        if (labels == prev) break;    // converged\n        prev = labels;\n\n        // 2. update step\n        std::vector<double> sum(k, 0.0);\n        std::vector<int>    cnt(k, 0);\n        for (size_t p = 0; p < points.size(); ++p) {\n            sum[labels[p]] += points[p];\n            cnt[labels[p]] += 1;\n        }\n        for (size_t i = 0; i < k; ++i)\n            if (cnt[i] > 0) centroids[i] = sum[i] / cnt[i];   // guard empty\n    }\n    return centroids;\n}'
      },
      checks: {
        python: [
          { re: 'for', hint: 'Iterate the two-step loop.' },
          { re: 'abs|dist|\\*\\*\\s*2', hint: 'Measure distance to each centroid.' },
          { re: 'min|<|best', hint: 'Assign each point to its nearest centroid.' },
          { re: 'sum|mean|/', hint: 'Move each centroid to the mean of its members.' },
          { re: 'if', hint: 'Guard the empty-cluster case.' },
          { re: 'return', hint: 'Return the final centroids.' }
        ],
        cpp: [
          { re: 'for', hint: 'Iterate the two-step loop.' },
          { re: 'fabs|abs|dist', hint: 'Measure distance to each centroid.' },
          { re: '<|best', hint: 'Assign each point to its nearest centroid.' },
          { re: 'sum|/', hint: 'Move each centroid to the mean of its members.' },
          { re: 'if', hint: 'Guard the empty-cluster case.' },
          { re: 'return', hint: 'Return the final centroids.' }
        ]
      },
      antiChecks: { python: [], cpp: [] },
      mcq: [
        { q: 'Why does k-means always terminate?', opts: ['It is capped at 100 iterations', 'Both steps monotonically reduce the same objective and there are finitely many possible assignments', 'The centroids always converge to the global optimum', 'Distances are bounded'], correct: 1, why: 'Assignment and update each weakly decrease total squared distance, and there is a finite number of assignments, so it cannot cycle forever.' },
        { q: 'Two runs on identical data give different clusters. Why?', opts: ['A bug', 'K-means converges to a local optimum that depends on the initial centroids', 'The data changed', 'Floating-point error'], correct: 1, why: 'The objective is non-convex. Different starts land in different local minima, which is why k-means++ initialisation and multiple restarts are standard practice.' }
      ]
    }
  ];

  const Q = [
    { id: 'q-ml-001', section: 'ml-foundations', tier: 'beginner', topic: 'bias-variance',
      q: 'Training error is low and validation error is far higher. What is happening?',
      opts: ['Underfitting — the model is too simple', 'Overfitting — the model has fit noise specific to the training sample', 'The learning rate is too low', 'The data is not normalised'],
      correct: 1, why: 'A large train/validation gap is the definition of overfitting. Address it with more data, regularisation, or a simpler model — not with more training.' },

    { id: 'q-ml-002', section: 'ml-foundations', tier: 'intermediate', topic: 'bias-variance',
      q: 'Your model underfits. Will collecting ten times more data help?',
      opts: ['Yes, more data always helps', 'No — more data reduces variance, but underfitting is a bias problem that needs a more expressive model or better features', 'Only if the data is balanced', 'Only for neural networks'],
      correct: 1, why: 'A linear model fed ten times more data is still linear. Diagnose which error dominates before spending on labelling.' },

    { id: 'q-ml-003', section: 'ml-foundations', tier: 'intermediate', topic: 'regularisation',
      q: 'Why does L1 regularisation produce exactly-zero weights while L2 does not?',
      opts: ['L1 is applied after training', 'L1\'s gradient has constant magnitude, so it keeps pushing a small weight to zero; L2\'s gradient shrinks with the weight and only approaches zero', 'L2 is weaker', 'L1 uses a different optimiser'],
      correct: 1, why: 'The derivative of |w| is ±1 regardless of size, so the penalty does not weaken as w shrinks. The derivative of w² is 2w, which vanishes as w does.' },

    { id: 'q-ml-004', section: 'ml-foundations', tier: 'advanced', topic: 'leakage',
      q: 'You fit a StandardScaler on the full dataset and then split into train and validation. What is wrong?',
      opts: ['Nothing', 'The scaler saw the validation rows, so validation statistics leaked into the training transform and the estimate is optimistic', 'Scaling should come last', 'It slows training'],
      correct: 1, why: 'Any transform with learned parameters must be fitted on training data only, then applied to validation. Otherwise the held-out set is no longer held out.' },

    { id: 'q-ml-005', section: 'ml-foundations', tier: 'advanced', topic: 'validation',
      q: 'Why is random k-fold wrong for time-series data?',
      opts: ['Folds would be unbalanced', 'It lets the model train on future observations and predict past ones, which cannot happen in production', 'It is too slow', 'Time series cannot be cross-validated'],
      correct: 1, why: 'Random splitting destroys temporal order. Use forward chaining, where each fold trains only on data preceding its validation window.' },

    { id: 'q-ml-006', section: 'ml-foundations', tier: 'master', topic: 'leakage',
      q: 'Validation error is consistently LOWER than training error. What does this suggest?',
      opts: ['An excellent model', 'A bug or leakage — this should not normally happen and warrants investigation', 'Strong regularisation, always', 'Too small a learning rate'],
      correct: 1, why: 'Dropout can produce a small version of this, but a persistent gap in that direction usually means a contaminated split or a metric computed on the wrong set.' },

    { id: 'q-ml-007', section: 'ml-foundations', tier: 'intermediate', topic: 'gradient descent',
      q: 'The loss increases every epoch. What is the most likely cause?',
      opts: ['Too few epochs', 'The learning rate is too high, so each step overshoots the minimum', 'Too much data', 'Missing regularisation'],
      correct: 1, why: 'Divergence is the classic signature of an oversized step. Reduce the learning rate by an order of magnitude before changing anything else.' },

    { id: 'q-ml-008', section: 'ml-foundations', tier: 'advanced', topic: 'feature scaling',
      q: 'Why does gradient descent converge slowly on unscaled features?',
      opts: ['Large numbers are slow to compute', 'Features on very different scales make the loss surface elongated, so a step size suitable for one direction is far wrong for another', 'It causes overflow', 'It only affects tree models'],
      correct: 1, why: 'The contours become long narrow valleys. The optimiser zigzags across the narrow direction while crawling along the long one. Trees are unaffected because they split on thresholds.' },

    { id: 'q-ml-009', section: 'ml-modeling', tier: 'beginner', topic: 'metrics',
      q: 'A fraud model has 99.9% accuracy on data that is 0.1% fraud. What have you learned?',
      opts: ['It is an excellent model', 'Almost nothing — predicting "not fraud" always would score the same', 'It is overfitting', 'The classes are balanced'],
      correct: 1, why: 'The majority-class baseline achieves the same number. Under imbalance, use precision, recall and PR-AUC, which ignore the easy true negatives.' },

    { id: 'q-ml-010', section: 'ml-modeling', tier: 'intermediate', topic: 'metrics',
      q: 'For a disease screening test, which metric matters most?',
      opts: ['Precision — false alarms are costly', 'Recall — a missed case is far more costly than a false alarm that leads to a follow-up test', 'Accuracy', 'Specificity'],
      correct: 1, why: 'Choose the metric from the cost of each error type. A missed diagnosis can be fatal; a false positive costs a confirmatory test.' },

    { id: 'q-ml-011', section: 'ml-modeling', tier: 'advanced', topic: 'metrics',
      q: 'Why prefer PR-AUC over ROC-AUC under severe class imbalance?',
      opts: ['PR-AUC is easier to compute', 'The false positive rate has a huge denominator when negatives dominate, so thousands of false positives barely move ROC; precision reacts to them directly', 'ROC-AUC is only for regression', 'They are equivalent'],
      correct: 1, why: 'With a million negatives, 1,000 false positives is an FPR of 0.001 and the ROC curve looks superb. Precision would be badly damaged by exactly those 1,000.' },

    { id: 'q-ml-012', section: 'ml-modeling', tier: 'intermediate', topic: 'ensembles',
      q: 'What is the essential difference between bagging and boosting?',
      opts: ['Bagging is for classification, boosting for regression', 'Bagging trains models independently in parallel to reduce variance; boosting trains them sequentially, each correcting the previous, to reduce bias', 'Boosting uses more memory', 'Bagging requires deeper trees'],
      correct: 1, why: 'Random forest averages independent high-variance trees. Gradient boosting fits each new weak learner to the residual errors of the ensemble so far, which is why it is more prone to overfitting.' },

    { id: 'q-ml-013', section: 'ml-modeling', tier: 'advanced', topic: 'trees',
      q: 'What does a decision tree optimise when choosing a split?',
      opts: ['Total tree depth', 'The reduction in impurity — Gini or entropy — achieved by partitioning the node', 'The number of leaves', 'Mean squared error of the features'],
      correct: 1, why: 'It greedily picks the feature and threshold giving the largest impurity decrease. Greedy and local, which is why a single tree is unstable and ensembles help so much.' },

    { id: 'q-ml-014', section: 'ml-modeling', tier: 'master', topic: 'imbalance',
      q: 'Which is generally the weakest response to class imbalance?',
      opts: ['Adjusting the decision threshold using the precision-recall curve', 'Randomly oversampling the minority class by duplicating rows', 'Using class weights in the loss function', 'Collecting more minority-class examples'],
      correct: 1, why: 'Duplicating rows adds no information and encourages memorisation of the copies. Threshold tuning and class weighting are cheaper and usually more effective.' },

    { id: 'q-ml-015', section: 'ml-modeling', tier: 'advanced', topic: 'PCA',
      q: 'What does PCA actually compute?',
      opts: ['The features most correlated with the target', 'Orthogonal directions of maximum variance in the input data, ignoring the target entirely', 'A clustering of the samples', 'The features with the fewest missing values'],
      correct: 1, why: 'PCA is unsupervised. A direction of low variance may still be the one that predicts your target, which is why blind PCA before a supervised model can discard the signal.' },

    { id: 'q-ml-016', section: 'ml-modeling', tier: 'intermediate', topic: 'knn',
      q: 'What is the main cost characteristic of k-nearest-neighbours?',
      opts: ['Expensive to train, cheap to predict', 'Trivial to train, expensive to predict — every query compares against the whole training set', 'Expensive in both', 'Cheap in both'],
      correct: 1, why: 'Training just stores the data. Each prediction is O(n·d) without an index, which is why kNN struggles at serving time on large datasets.' },

    { id: 'q-ml-017', section: 'ml-deep-learning', tier: 'advanced', topic: 'vanishing gradients',
      q: 'Why do deep sigmoid networks train badly?',
      opts: ['Sigmoid is slow to compute', 'Its derivative peaks at 0.25, so gradients shrink multiplicatively with depth and early layers stop learning', 'It cannot represent non-linear functions', 'It requires more memory'],
      correct: 1, why: 'Ten layers scale the gradient by at most 0.25^10, about one in a million. ReLU has derivative 1 for positive inputs, which is the main reason it replaced sigmoid in hidden layers.' },

    { id: 'q-ml-018', section: 'ml-deep-learning', tier: 'advanced', topic: 'residuals',
      q: 'How do residual connections help very deep networks?',
      opts: ['They reduce the parameter count', 'y = f(x) + x gives the gradient a path with derivative 1 straight back to earlier layers', 'They normalise activations', 'They add regularisation'],
      correct: 1, why: 'The identity term means the gradient reaches earlier layers undiminished regardless of what f does, which is what made networks hundreds of layers deep trainable.' },

    { id: 'q-ml-019', section: 'ml-deep-learning', tier: 'master', topic: 'attention',
      q: 'Why is the dot product divided by sqrt(d_k) in scaled dot-product attention?',
      opts: ['To normalise to probabilities', 'Dot products grow with dimension, and large values push softmax into a saturated region where gradients vanish', 'To reduce computation', 'To handle variable sequence lengths'],
      correct: 1, why: 'With d_k dimensions the dot product has variance proportional to d_k. Unscaled, softmax becomes nearly one-hot and its gradient nearly zero.' },

    { id: 'q-ml-020', section: 'ml-deep-learning', tier: 'advanced', topic: 'dropout',
      q: 'What does dropout do, and when is it active?',
      opts: ['Removes features permanently before training', 'Randomly zeroes activations during training only, preventing co-adaptation; it is disabled at inference', 'Reduces the learning rate over time', 'Removes duplicate training rows'],
      correct: 1, why: 'Forgetting to switch to eval mode at inference is a real and common bug: predictions become random because units are still being dropped.' },

    { id: 'q-ml-021', section: 'ml-deep-learning', tier: 'advanced', topic: 'batch norm',
      q: 'Why does batch normalisation behave differently at training and inference time?',
      opts: ['It is disabled at inference', 'During training it normalises using the current batch statistics; at inference it uses running averages, since predictions must not depend on other samples in the batch', 'It uses a different learning rate', 'It only applies to convolutions'],
      correct: 1, why: 'A prediction that changes depending on which other inputs happen to be batched with it would be unusable, so inference uses fixed running estimates.' },

    { id: 'q-ml-022', section: 'ml-deep-learning', tier: 'intermediate', topic: 'initialisation',
      q: 'Why not initialise all neural network weights to zero?',
      opts: ['Zero causes division errors', 'Every neuron in a layer would compute the same output and receive the same gradient, so they stay identical and the layer has the capacity of one unit', 'It trains too slowly', 'Zero is not a valid weight'],
      correct: 1, why: 'Symmetry must be broken for units to learn different features. Random initialisation with a variance chosen by depth (He, Xavier) does that while keeping activations well-scaled.' },

    { id: 'q-ml-023', section: 'ml-deep-learning', tier: 'master', topic: 'transformers',
      q: 'Why is self-attention expensive for long sequences?',
      opts: ['It uses many parameters', 'Every token attends to every other, so time and memory scale quadratically with sequence length', 'It cannot be parallelised', 'It requires recurrence'],
      correct: 1, why: 'The attention matrix is n×n. Doubling the context quadruples the cost, which is the constraint every long-context technique is trying to work around.' },

    { id: 'q-ml-024', section: 'ml-systems', tier: 'advanced', topic: 'train-serve skew',
      q: 'What is train/serve skew?',
      opts: ['A difference between training and serving hardware', 'Features computed differently in the training pipeline and in production, so the model sees inputs it was never trained on', 'Overfitting to the training set', 'Drift in the target variable'],
      correct: 1, why: 'It is the most common production failure and it is a code-duplication problem: the fix is computing features once in shared code or a feature store.' },

    { id: 'q-ml-025', section: 'ml-systems', tier: 'advanced', topic: 'drift',
      q: 'What distinguishes concept drift from data drift?',
      opts: ['Concept drift is faster', 'Data drift changes the input distribution; concept drift changes the input-to-target relationship, so inputs can look completely normal', 'Concept drift only affects deep models', 'They are the same thing'],
      correct: 1, why: 'Data drift is detectable without labels by comparing feature distributions. Concept drift needs labels, which is what makes it more dangerous and slower to catch.' },

    { id: 'q-ml-026', section: 'ml-systems', tier: 'master', topic: 'A/B testing',
      q: 'Why randomise an A/B test on user rather than on request?',
      opts: ['It is easier to implement', 'Otherwise the same user experiences both variants, contaminating the comparison and any per-user metric', 'It needs fewer samples', 'Request-level randomisation is not possible'],
      correct: 1, why: 'Per-request assignment mixes the treatments within a single user session, so behavioural effects cannot be attributed and per-user metrics become meaningless.' },

    { id: 'q-ml-027', section: 'ml-systems', tier: 'master', topic: 'evaluation',
      q: 'Your new model has better offline AUC but performs worse in an A/B test. What is the most likely explanation?',
      opts: ['The A/B test is wrong', 'Offline AUC measured a proxy on a historical distribution; the online metric reflects current traffic and the actual objective', 'The model is overfitting the test set', 'AUC is never useful'],
      correct: 1, why: 'Offline evaluation optimises a proxy on past data. When they disagree, the online experiment measures what you actually care about and generally wins the argument.' },

    { id: 'q-ml-028', section: 'ml-systems', tier: 'advanced', topic: 'monitoring',
      q: 'Which signal gives the earliest warning of a production problem, before labels arrive?',
      opts: ['Accuracy', 'A shift in the input or prediction distribution, which needs no ground truth', 'F1 score', 'Training loss'],
      correct: 1, why: 'Label-dependent metrics lag by however long labels take to arrive. Distribution monitoring is available immediately and catches broken feature pipelines within minutes.' },

    { id: 'q-ml-029', section: 'ml-systems', tier: 'intermediate', topic: 'thresholds',
      q: 'Where should a classifier\'s decision threshold come from?',
      opts: ['Always 0.5', 'The precision-recall curve, chosen using the relative cost of false positives and false negatives', 'The mean predicted probability', 'Cross-validation accuracy'],
      correct: 1, why: '0.5 is an arbitrary default. Tuning the threshold against real error costs is often the cheapest available improvement to a deployed model, and needs no retraining.' },

    { id: 'q-ml-030', section: 'ml-foundations', tier: 'master', topic: 'curse of dimensionality',
      q: 'What breaks distance-based methods in very high dimensions?',
      opts: ['Floating-point precision', 'Distances between points concentrate, so nearest and farthest neighbours become nearly equidistant and "nearest" stops being meaningful', 'Memory limits', 'Distances become negative'],
      correct: 1, why: 'The ratio of nearest to farthest distance approaches 1 as dimension grows. This is why kNN and k-means degrade badly without dimensionality reduction or a learned metric.' }
  ];

  window.DB.lessons.push.apply(window.DB.lessons, L);
  window.DB.problems.push.apply(window.DB.problems, P);
  window.DB.questions.push.apply(window.DB.questions, Q);
})();
