/* lld.js — low-level / object-oriented design.
 * Sections: lld-principles, lld-problems.
 */
(function () {
  'use strict';

  const L = [
    {
      id: 'lld-l1', track: 'lld', section: 'lld-principles', tier: 'intermediate', order: 1,
      title: 'SOLID, stated usefully',
      summary: 'Five principles, each with the smell it prevents and the fix.',
      minutes: 15,
      body: '<p>SOLID is usually taught as five slogans. Here is each one as a smell you can actually detect.</p>' +
        '<h3>S — Single Responsibility</h3>' +
        '<p><b>Smell:</b> the class name contains "and", or you change it for unrelated reasons.</p>' +
        '<pre class="code"># does two jobs: business rules AND persistence\nclass Order:\n    def total(self): ...\n    def save_to_database(self): ...\n\n# split by reason-to-change\nclass Order:           # pricing rules\n    def total(self): ...\nclass OrderRepository: # storage\n    def save(self, order): ...</pre>' +
        '<h3>O — Open/Closed</h3>' +
        '<p><b>Smell:</b> adding a feature means editing an existing switch or if-chain.</p>' +
        '<pre class="code"># every new shape edits this function\ndef area(shape):\n    if shape.kind == "circle": ...\n    elif shape.kind == "square": ...\n\n# new shapes are new classes; this function never changes\nclass Shape(ABC):\n    @abstractmethod\n    def area(self): ...</pre>' +
        '<h3>L — Liskov Substitution</h3>' +
        '<p><b>Smell:</b> a subclass overrides a method to raise, or to do nothing.</p>' +
        '<p>The canonical failure is Square inheriting Rectangle. Rectangle promises that setting width leaves height alone; Square cannot honour that. The types are related in geometry but not in behaviour, and inheritance models behaviour.</p>' +
        '<h3>I — Interface Segregation</h3>' +
        '<p><b>Smell:</b> implementers leave methods empty because the interface is too broad.</p>' +
        '<h3>D — Dependency Inversion</h3>' +
        '<p><b>Smell:</b> a class constructs its own collaborators, so you cannot test it without a database.</p>' +
        '<pre class="code">class Service:\n    def __init__(self):\n        self.db = PostgresDatabase()   # welded to Postgres\n\nclass Service:\n    def __init__(self, repo):          # inject it\n        self.repo = repo               # any implementation, including a fake</pre>' +
        '<p>Dependency inversion is the one that most changes how testable your design is, so if you only apply one under time pressure, apply that one.</p>'
    },
    {
      id: 'lld-l2', track: 'lld', section: 'lld-principles', tier: 'advanced', order: 2,
      title: 'The patterns that actually come up',
      summary: 'Strategy, Factory, Observer, State, Adapter — and why Singleton hurts.',
      minutes: 14,
      body: '<h3>Strategy — swap an algorithm</h3>' +
        '<pre class="code">class PricingStrategy(ABC):\n    @abstractmethod\n    def price(self, base): ...\n\nclass Regular(PricingStrategy):\n    def price(self, base): return base\n\nclass Member(PricingStrategy):\n    def price(self, base): return base * 0.9\n\ncheckout = Checkout(strategy=Member())</pre>' +
        '<p>Strategy is the direct answer to an if-chain over a "type" field, and it is the most frequently correct pattern in an interview.</p>' +
        '<h3>Factory — decide which class to build</h3>' +
        '<p>Use it when construction depends on runtime input. Keep the conditional in exactly one place, so adding a type touches one file.</p>' +
        '<h3>Observer — notify without coupling</h3>' +
        '<p>A subject holds a list of subscribers and calls them on change. It is the right answer whenever the requirement says "when X happens, also do Y and Z", and the list of consequences may grow.</p>' +
        '<h3>State — behaviour that depends on mode</h3>' +
        '<p>Vending machines, elevators and order lifecycles all have states with different legal transitions. Modelling each state as an object turns an unreadable transition matrix into small classes that each answer "what can happen next".</p>' +
        '<h3>Adapter — make an incompatible thing fit</h3>' +
        '<p>Wrap a third-party interface in the one your code already expects. It is the standard way to keep a vendor SDK from leaking through your whole codebase.</p>' +
        '<h3>Singleton — say why, not just what</h3>' +
        '<p>Singleton is global mutable state with better manners. It makes tests order-dependent, hides dependencies, and is awkward under concurrency. In an interview, name it, then say you would prefer to construct one instance and inject it. That answer scores better than the pattern itself.</p>'
    },
    {
      id: 'lld-l3', track: 'lld', section: 'lld-principles', tier: 'advanced', order: 3,
      title: 'Running the 45-minute design interview',
      summary: 'A repeatable order of moves, so you never freeze at the whiteboard.',
      minutes: 12,
      body: '<p>The failure mode is not ignorance, it is starting to draw classes before you know what the system does. Use a fixed order.</p>' +
        '<h3>1. Clarify (3–5 min)</h3>' +
        '<p>Ask about scale, who the actors are, and what is explicitly out of scope. Write the answers down. A design that solves the wrong problem cannot be rescued later.</p>' +
        '<h3>2. Actors and use cases (3 min)</h3>' +
        '<p>List who touches the system and what each one does. These become your public API.</p>' +
        '<h3>3. Entities (5 min)</h3>' +
        '<p>Pull the nouns out of the requirements. Ask of each: does it have identity and a lifecycle, or is it just a value? That decides class versus value type.</p>' +
        '<h3>4. The API (5 min)</h3>' +
        '<p>Write the method signatures before the bodies. This is where interviewers form most of their opinion — signatures show whether you have understood the domain.</p>' +
        '<h3>5. Relationships (10 min)</h3>' +
        '<p>Composition, aggregation or inheritance for each pair. Default to composition. Justify every inheritance edge with substitutability.</p>' +
        '<h3>6. Edge cases and concurrency (5 min)</h3>' +
        '<p>Empty, full, duplicate, concurrent. Naming these unprompted is the strongest signal you can send.</p>' +
        '<h3>7. Extension (3 min)</h3>' +
        '<p>Say how you would add the obvious next feature. If the answer is "edit three switch statements", revisit step 5.</p>' +
        '<blockquote>Say your assumptions out loud as you go. A stated wrong assumption gets corrected; a silent one sinks the whole design.</blockquote>'
    }
  ];

  const P = [
    {
      id: 'lld-parking', title: 'Design a Parking Lot', section: 'lld-problems',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Design a parking lot.\n\nRequirements: multiple levels; spots of several sizes (motorcycle, compact, large); a vehicle may only occupy a spot it fits in; park() returns a ticket, unpark() takes a ticket and returns the fee; the system reports available spots per size.\n\nSketch the classes with their key methods, and make park/unpark efficient.',
      examples: [
        { in: 'park(motorcycle) with only large spots free', out: 'a ticket for a large spot', why: 'Smaller vehicles may use larger spots; the reverse is not allowed.' },
        { in: 'park(bus) with the lot full', out: 'no ticket (empty optional / None)', why: 'Absence of capacity is a normal outcome, not an exception.' },
        { in: 'unpark(ticket) after 90 minutes', out: 'the fee for that duration', why: 'The ticket carries the entry time, so the fee is computed on exit.' }
      ],
      constraints: ['park and unpark should be O(1), not a scan of every spot.', 'A vehicle fits a spot of its own size or larger.'],
      approach: 'Entities: ParkingLot owns Levels, a Level owns Spots, a Spot has a size and an optional occupant, a Vehicle has a size, a Ticket links a vehicle to a spot with an entry time. The design decision that separates a good answer from a mediocre one is how you find a free spot. Scanning every spot is O(n) and is what most candidates write. Instead keep one free-list (a stack or queue) per spot size: park pops from the smallest size that fits and falls back to larger sizes, unpark pushes back. Both become O(1). Fee calculation is a separate concern — inject a FeeStrategy rather than hard-coding rates, because pricing is the thing most likely to change. Concurrency: the free lists are shared mutable state, so guard them, or use per-size lock-free structures if the interviewer pushes on scale.',
      keyInsight: 'Keep a free list per spot size instead of scanning. Park and unpark become O(1), and the fallback to larger sizes is just trying the next list.',
      pitfalls: [
        'Scanning all spots to find a free one, which is O(n) per park.',
        'Hard-coding the fee rules inside unpark instead of injecting a strategy.',
        'Modelling spot size with an int, losing the fits-in relationship that an enum plus a comparison expresses.',
        'Forgetting that the free lists are shared mutable state under concurrent parking.'
      ],
      complexity: { time: 'O(1)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: {
        cpp: '#include <string>\n#include <vector>\n#include <optional>\n\nenum class Size { Motorcycle, Compact, Large };\n\n// Vehicle, Spot, Ticket, Level, ParkingLot',
        python: 'from enum import IntEnum\n\nclass Size(IntEnum):\n    MOTORCYCLE = 0\n    COMPACT = 1\n    LARGE = 2\n\n# Vehicle, Spot, Ticket, Level, ParkingLot'
      },
      solution: {
        cpp: '#include <vector>\n#include <optional>\n#include <memory>\n#include <ctime>\n\nenum class Size { Motorcycle = 0, Compact = 1, Large = 2 };\n\nclass Vehicle {\n    Size size_;\npublic:\n    explicit Vehicle(Size s) : size_(s) {}\n    Size size() const { return size_; }\n    virtual ~Vehicle() = default;\n};\n\nstruct Spot {\n    int  id;\n    Size size;\n    bool free = true;\n};\n\nstruct Ticket {\n    int    spotId;\n    time_t entry;\n};\n\nclass FeeStrategy {                 // injected: pricing changes often\npublic:\n    virtual double fee(time_t entry, time_t exit) const = 0;\n    virtual ~FeeStrategy() = default;\n};\n\nclass ParkingLot {\n    std::vector<Spot> spots_;\n    // free list per size -> O(1) park, no scanning\n    std::vector<std::vector<int>> freeBySize_{3};\n    std::shared_ptr<FeeStrategy> fees_;\n\npublic:\n    explicit ParkingLot(std::shared_ptr<FeeStrategy> f) : fees_(std::move(f)) {}\n\n    void addSpot(int id, Size s) {\n        spots_.push_back({id, s, true});\n        freeBySize_[static_cast<int>(s)].push_back(id);\n    }\n\n    std::optional<Ticket> park(const Vehicle& v) {\n        // try own size first, then any larger size\n        for (int s = static_cast<int>(v.size()); s < 3; ++s) {\n            if (!freeBySize_[s].empty()) {\n                int id = freeBySize_[s].back();\n                freeBySize_[s].pop_back();\n                spots_[id].free = false;\n                return Ticket{id, std::time(nullptr)};\n            }\n        }\n        return std::nullopt;          // full is a normal outcome\n    }\n\n    double unpark(const Ticket& t) {\n        Spot& sp = spots_[t.spotId];\n        sp.free = true;\n        freeBySize_[static_cast<int>(sp.size)].push_back(sp.id);\n        return fees_->fee(t.entry, std::time(nullptr));\n    }\n\n    size_t available(Size s) const { return freeBySize_[static_cast<int>(s)].size(); }\n};',
        python: 'import time\nfrom abc import ABC, abstractmethod\nfrom enum import IntEnum\nfrom dataclasses import dataclass\n\nclass Size(IntEnum):\n    MOTORCYCLE = 0\n    COMPACT = 1\n    LARGE = 2\n\n@dataclass\nclass Vehicle:\n    size: Size\n\n@dataclass\nclass Spot:\n    id: int\n    size: Size\n    free: bool = True\n\n@dataclass\nclass Ticket:\n    spot_id: int\n    entry: float\n\nclass FeeStrategy(ABC):        # injected: pricing changes often\n    @abstractmethod\n    def fee(self, entry, exit_):\n        ...\n\nclass ParkingLot:\n    def __init__(self, fees):\n        self.spots = {}\n        self.free_by_size = {s: [] for s in Size}   # O(1) park, no scanning\n        self.fees = fees\n\n    def add_spot(self, spot_id, size):\n        self.spots[spot_id] = Spot(spot_id, size)\n        self.free_by_size[size].append(spot_id)\n\n    def park(self, vehicle):\n        # own size first, then any larger size\n        for s in range(vehicle.size, len(Size)):\n            bucket = self.free_by_size[Size(s)]\n            if bucket:\n                spot_id = bucket.pop()\n                self.spots[spot_id].free = False\n                return Ticket(spot_id, time.time())\n        return None            # full is a normal outcome, not an exception\n\n    def unpark(self, ticket):\n        spot = self.spots[ticket.spot_id]\n        spot.free = True\n        self.free_by_size[spot.size].append(spot.id)\n        return self.fees.fee(ticket.entry, time.time())\n\n    def available(self, size):\n        return len(self.free_by_size[size])'
      },
      checks: {
        cpp: [
          { re: 'class\\s+ParkingLot|struct\\s+ParkingLot', hint: 'Model the lot itself.' },
          { re: 'enum|Size', hint: 'Represent spot sizes as an enum so "fits in" is a comparison.' },
          { re: 'park', hint: 'Provide park().' },
          { re: 'unpark|leave|exit', hint: 'Provide unpark(), returning the fee.' },
          { re: 'optional|nullptr|null', hint: 'Express "no spot available" without throwing.' }
        ],
        python: [
          { re: 'class\\s+ParkingLot', hint: 'Model the lot itself.' },
          { re: 'Enum|IntEnum|Size', hint: 'Represent spot sizes as an enum so "fits in" is a comparison.' },
          { re: 'def\\s+park', hint: 'Provide park().' },
          { re: 'def\\s+unpark|def\\s+leave|def\\s+exit', hint: 'Provide unpark(), returning the fee.' },
          { re: 'None', hint: 'Express "no spot available" without raising.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why keep a free list per spot size rather than scanning for a free spot?', opts: ['It uses less memory', 'It makes park O(1) instead of O(n), and falling back to a larger size is just trying the next list', 'It avoids needing an enum', 'Scanning does not work with multiple levels'], correct: 1, why: 'Scanning is the default answer and is O(number of spots) on every park. Pre-bucketing free spots by size makes both park and unpark constant time.' },
        { q: 'Why inject a FeeStrategy rather than compute the fee inside unpark?', opts: ['It is faster', 'Pricing is the requirement most likely to change, and injecting it means new pricing does not touch the lot', 'It avoids floating point', 'Interviewers require a pattern'], correct: 1, why: 'Weekend rates, member discounts and EV surcharges all arrive later. Isolating the volatile rule is the Open/Closed principle applied where it actually pays.' }
      ]
    },
    {
      id: 'lld-lru', title: 'Design an LRU Cache', section: 'lld-problems',
      tier: 'advanced', difficulty: 'Medium',
      prompt: 'Design a fixed-capacity cache with get(key) and put(key, value), both O(1).\n\nWhen the cache is full, inserting a new key evicts the least recently used entry. A get counts as a use.',
      examples: [
        { in: 'capacity 2; put(1,1), put(2,2), get(1), put(3,3)', out: 'key 2 is evicted', why: 'get(1) made 1 the most recent, so 2 became least recently used.' },
        { in: 'put on an existing key', out: 'value updated, key becomes most recent, nothing evicted', why: 'An update is a use and does not change the entry count.' }
      ],
      constraints: ['Both operations must be O(1).', 'Capacity is fixed.', 'get counts as a use.'],
      approach: 'Two requirements pull in opposite directions: O(1) lookup by key, and O(1) identification and removal of the least recently used entry. No single structure gives both, so combine two. A hash map gives key to node in O(1). A doubly linked list in recency order gives O(1) removal from the middle and O(1) move to the front, because each node knows its neighbours and the map hands you the node directly. Head is most recent, tail is least. get moves the node to the head; put inserts at the head and, if over capacity, drops the tail and erases its key from the map. The doubly link is essential: with a singly linked list, unlinking a node requires finding its predecessor, which is O(n).',
      keyInsight: 'Hash map for O(1) lookup, doubly linked list for O(1) reordering. Neither structure alone can do both.',
      pitfalls: [
        'A singly linked list, making removal O(n) because you cannot reach the predecessor.',
        'Forgetting that get must also mark the entry as recently used.',
        'Evicting from the map but leaving the node in the list, or the reverse, so the two views drift apart.',
        'Not handling put on an existing key, which must update rather than insert a duplicate.'
      ],
      complexity: { time: 'O(1)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], timeAnswer: 0,
      starter: {
        cpp: '#include <unordered_map>\n#include <list>\n\nclass LRUCache {\npublic:\n    explicit LRUCache(int capacity);\n    int  get(int key);            // -1 if absent\n    void put(int key, int value);\n};',
        python: 'class LRUCache:\n    def __init__(self, capacity):\n        pass\n\n    def get(self, key):\n        """Return the value, or -1 if absent."""\n        pass\n\n    def put(self, key, value):\n        pass'
      },
      solution: {
        cpp: '#include <unordered_map>\n#include <list>\n#include <utility>\n\nclass LRUCache {\n    int cap_;\n    std::list<std::pair<int,int>> order_;                 // front = most recent\n    std::unordered_map<int, std::list<std::pair<int,int>>::iterator> map_;\n\npublic:\n    explicit LRUCache(int capacity) : cap_(capacity) {}\n\n    int get(int key) {\n        auto it = map_.find(key);\n        if (it == map_.end()) return -1;\n        // a read is a use: move to the front, O(1) via splice\n        order_.splice(order_.begin(), order_, it->second);\n        return it->second->second;\n    }\n\n    void put(int key, int value) {\n        auto it = map_.find(key);\n        if (it != map_.end()) {\n            it->second->second = value;                   // update in place\n            order_.splice(order_.begin(), order_, it->second);\n            return;\n        }\n        if ((int)map_.size() == cap_) {\n            map_.erase(order_.back().first);              // evict both views\n            order_.pop_back();\n        }\n        order_.emplace_front(key, value);\n        map_[key] = order_.begin();\n    }\n};',
        python: 'from collections import OrderedDict\n\nclass LRUCache:\n    """OrderedDict is exactly a hash map plus a doubly linked list, which is\n    why it is the right tool here — move_to_end and popitem are both O(1)."""\n\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.data = OrderedDict()\n\n    def get(self, key):\n        if key not in self.data:\n            return -1\n        self.data.move_to_end(key)        # a read is a use\n        return self.data[key]\n\n    def put(self, key, value):\n        if key in self.data:\n            self.data.move_to_end(key)    # update, do not duplicate\n        self.data[key] = value\n        if len(self.data) > self.cap:\n            self.data.popitem(last=False) # drop the least recently used'
      },
      checks: {
        cpp: [
          { re: 'unordered_map|map\\s*<', hint: 'Use a hash map for O(1) key lookup.' },
          { re: 'list|Node|prev', hint: 'Use a doubly linked list for O(1) reordering.' },
          { re: 'get', hint: 'Implement get().' },
          { re: 'put|insert', hint: 'Implement put().' },
          { re: 'splice|erase|pop_back|remove', hint: 'Evict the least recently used entry when full.' }
        ],
        python: [
          { re: 'OrderedDict|dict|\\{\\}', hint: 'Use a hash map for O(1) key lookup.' },
          { re: 'move_to_end|prev|next|list', hint: 'Maintain recency order in O(1).' },
          { re: 'def\\s+get', hint: 'Implement get().' },
          { re: 'def\\s+put', hint: 'Implement put().' },
          { re: 'popitem|pop|del', hint: 'Evict the least recently used entry when full.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'Why must the list be doubly linked?', opts: ['To iterate backwards', 'To unlink a node in O(1) — with a singly linked list you would have to scan for its predecessor', 'To store more data', 'It does not have to be'], correct: 1, why: 'The map hands you the node directly, but removing it requires rewiring its predecessor. Only a back pointer makes that O(1).' },
        { q: 'Why is OrderedDict the natural Python answer?', opts: ['It sorts keys', 'It is implemented as a hash map plus a doubly linked list, exactly the structure the problem calls for', 'It is thread-safe', 'It has a built-in capacity limit'], correct: 1, why: 'move_to_end and popitem(last=False) are the two operations the design needs, both O(1), because the underlying structure is the same combination you would build by hand.' }
      ]
    },
    {
      id: 'lld-vending', title: 'Design a Vending Machine', section: 'lld-problems',
      tier: 'intermediate', difficulty: 'Medium',
      prompt: 'Design a vending machine.\n\nIt accepts coins, lets the user select a product, dispenses the product with change if the payment is sufficient, and refunds on cancel. Selecting before paying enough, or selecting a sold-out slot, must be handled cleanly.\n\nModel the behaviour so that illegal transitions are impossible rather than merely checked.',
      examples: [
        { in: 'select() while in the Idle state', out: 'rejected — no money inserted', why: 'Each state defines which operations are legal, so this is not an if-check scattered through the code.' },
        { in: 'insert 100, select item costing 75', out: 'dispense item, return 25 change', why: 'The machine moves Idle to HasMoney to Dispensing and back to Idle.' },
        { in: 'cancel after inserting 100', out: 'refund 100, return to Idle', why: 'Cancel is legal in HasMoney and returns the balance.' }
      ],
      constraints: ['Illegal operations for the current mode must be rejected.', 'Change must be returned.', 'Sold-out slots must be handled.'],
      approach: 'This is the textbook case for the State pattern. The naive design has a mode field and every method starts with a chain of if-statements checking it; adding a state means editing every method, and it is easy to miss one. Instead give each state its own class implementing the same interface — insertCoin, select, cancel, dispense — and let the machine delegate to its current state object. Each state implements only the transitions that are legal from it and rejects the rest in one place. Adding a new state becomes adding a class rather than editing five methods. Keep inventory and the coin bank as separate collaborators so the state classes stay about transitions, not about stock levels.',
      keyInsight: 'A mode field with if-chains in every method becomes a State class per mode: each one only implements the transitions legal from it.',
      pitfalls: [
        'A single enum plus if-chains, which must be edited in every method when a state is added.',
        'Letting the state objects also own inventory and cash, which merges two responsibilities.',
        'Forgetting the sold-out and insufficient-change paths, which are the ones interviewers probe.',
        'Dispensing before confirming change can actually be made.'
      ],
      complexity: { time: 'O(1)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: {
        cpp: '#include <memory>\n\nclass VendingMachine;\n\nclass State {\npublic:\n    virtual void insertCoin(VendingMachine&, int) = 0;\n    virtual void select(VendingMachine&, int) = 0;\n    virtual void cancel(VendingMachine&) = 0;\n    virtual ~State() = default;\n};',
        python: 'from abc import ABC, abstractmethod\n\nclass State(ABC):\n    @abstractmethod\n    def insert_coin(self, machine, amount): ...\n    @abstractmethod\n    def select(self, machine, slot): ...\n    @abstractmethod\n    def cancel(self, machine): ...'
      },
      solution: {
        cpp: '#include <memory>\n#include <map>\n\nclass VendingMachine;\n\nclass State {\npublic:\n    virtual void insertCoin(VendingMachine&, int) = 0;\n    virtual void select(VendingMachine&, int) = 0;\n    virtual void cancel(VendingMachine&) = 0;\n    virtual ~State() = default;\n};\n\nclass Inventory {                       // separate collaborator\n    std::map<int,int> stock_;\n    std::map<int,int> price_;\npublic:\n    bool inStock(int slot) const {\n        auto it = stock_.find(slot);\n        return it != stock_.end() && it->second > 0;\n    }\n    int  price(int slot) const { return price_.at(slot); }\n    void take(int slot)        { --stock_[slot]; }\n};\n\nclass VendingMachine {\n    std::unique_ptr<State> state_;\n    Inventory inventory_;\n    int balance_ = 0;\npublic:\n    void setState(std::unique_ptr<State> s) { state_ = std::move(s); }\n    Inventory& inventory() { return inventory_; }\n    int  balance() const   { return balance_; }\n    void addBalance(int c) { balance_ += c; }\n    int  refund()          { int b = balance_; balance_ = 0; return b; }\n\n    // the machine only delegates; it holds no transition logic\n    void insertCoin(int c) { state_->insertCoin(*this, c); }\n    void select(int slot)  { state_->select(*this, slot); }\n    void cancel()          { state_->cancel(*this); }\n};\n\nclass IdleState : public State {\npublic:\n    void insertCoin(VendingMachine& m, int c) override;   // -> HasMoney\n    void select(VendingMachine&, int) override {}         // illegal: no money\n    void cancel(VendingMachine&) override {}              // nothing to refund\n};',
        python: 'from abc import ABC, abstractmethod\n\nclass State(ABC):\n    @abstractmethod\n    def insert_coin(self, machine, amount): ...\n    @abstractmethod\n    def select(self, machine, slot): ...\n    @abstractmethod\n    def cancel(self, machine): ...\n\n\nclass Inventory:                      # separate collaborator\n    def __init__(self):\n        self.stock = {}\n        self.price = {}\n\n    def in_stock(self, slot):\n        return self.stock.get(slot, 0) > 0\n\n    def take(self, slot):\n        self.stock[slot] -= 1\n\n\nclass IdleState(State):\n    def insert_coin(self, machine, amount):\n        machine.balance += amount\n        machine.state = HasMoneyState()\n\n    def select(self, machine, slot):\n        return "insert money first"    # illegal here, rejected in ONE place\n\n    def cancel(self, machine):\n        return 0\n\n\nclass HasMoneyState(State):\n    def insert_coin(self, machine, amount):\n        machine.balance += amount\n\n    def select(self, machine, slot):\n        if not machine.inventory.in_stock(slot):\n            return "sold out"\n        price = machine.inventory.price[slot]\n        if machine.balance < price:\n            return "insufficient funds"\n        machine.inventory.take(slot)\n        change = machine.balance - price\n        machine.balance = 0\n        machine.state = IdleState()\n        return ("dispensed", change)\n\n    def cancel(self, machine):\n        refund = machine.balance\n        machine.balance = 0\n        machine.state = IdleState()\n        return refund\n\n\nclass VendingMachine:\n    def __init__(self):\n        self.state = IdleState()      # the machine only delegates\n        self.inventory = Inventory()\n        self.balance = 0\n\n    def insert_coin(self, amount): return self.state.insert_coin(self, amount)\n    def select(self, slot):        return self.state.select(self, slot)\n    def cancel(self):              return self.state.cancel(self)'
      },
      checks: {
        cpp: [
          { re: 'class\\s+State|virtual', hint: 'Model each mode as a state class behind a common interface.' },
          { re: 'class\\s+VendingMachine', hint: 'Model the machine.' },
          { re: 'insertCoin|insert', hint: 'Support inserting coins.' },
          { re: 'select', hint: 'Support selecting a product.' },
          { re: 'cancel|refund', hint: 'Support cancelling with a refund.' }
        ],
        python: [
          { re: 'class\\s+\\w*State|ABC|abstractmethod', hint: 'Model each mode as a state class behind a common interface.' },
          { re: 'class\\s+VendingMachine', hint: 'Model the machine.' },
          { re: 'def\\s+insert', hint: 'Support inserting coins.' },
          { re: 'def\\s+select', hint: 'Support selecting a product.' },
          { re: 'def\\s+cancel|refund', hint: 'Support cancelling with a refund.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'What is the concrete advantage of State over an enum plus if-chains?', opts: ['It runs faster', 'Adding a mode means adding one class, instead of editing the conditional inside every method', 'It uses less memory', 'It avoids inheritance'], correct: 1, why: 'The if-chain approach spreads one concept across every method, so a new state means finding and updating all of them — and missing one is a silent bug.' },
        { q: 'Why keep Inventory separate from the state classes?', opts: ['To save memory', 'Transitions and stock are different responsibilities that change for different reasons', 'State classes cannot hold data', 'To allow multiple machines'], correct: 1, why: 'Single Responsibility: transition rules change when the workflow changes, stock changes when the catalogue changes. Merging them means both reasons touch one class.' }
      ]
    },
    {
      id: 'lld-ratelimit', title: 'Design a Rate Limiter', section: 'lld-problems',
      tier: 'advanced', difficulty: 'Hard',
      prompt: 'Design a rate limiter that allows at most N requests per client in any rolling window of W seconds.\n\nallow(clientId, now) returns true if the request is permitted. Explain the trade-off between your approach and a fixed-window counter.',
      examples: [
        { in: 'N=3, W=60; four requests in the same second', out: 'first three allowed, fourth denied', why: 'The window is rolling, so all four fall inside it.' },
        { in: 'N=3, W=60; 3 requests at t=0, one at t=61', out: 'the t=61 request is allowed', why: 'The earliest three have aged out of the rolling window.' },
        { in: 'fixed-window with N=3: 3 at t=59 and 3 at t=61', out: '6 allowed in 2 seconds', why: 'This is the burst at the boundary that a rolling window prevents.' }
      ],
      constraints: ['Rolling window, not fixed.', 'Amortised O(1) per request.', 'Memory must not grow without bound.'],
      approach: 'Keep a deque of timestamps per client. On each request, pop from the front every timestamp older than now minus W, then compare the remaining count with N: if it is below the limit, push the new timestamp and allow, otherwise deny. Each timestamp is pushed once and popped once, so the amortised cost is O(1) even though a single call can evict many. The contrast worth stating is the fixed-window counter: it just increments a per-interval counter, which is O(1) and tiny, but it permits up to 2N requests across an interval boundary — three at 0:59 and three at 1:01 is six in two seconds. The rolling log has no boundary artefact but stores up to N timestamps per client, so memory is O(clients * N); the token bucket sits between the two, allowing controlled bursts with O(1) state per client.',
      keyInsight: 'Evict expired timestamps from the front, then count. Each timestamp is pushed and popped once, so it is amortised O(1).',
      pitfalls: [
        'Using a fixed-window counter and not noticing it allows a 2N burst across the boundary.',
        'Scanning the whole timestamp list on each call instead of popping only what has expired.',
        'Never removing clients that go idle, so memory grows without bound.',
        'Recording the timestamp even when the request is denied, which extends the block indefinitely under sustained load.'
      ],
      complexity: { time: 'O(1)', space: 'O(n)' },
      timeChoices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], timeAnswer: 0,
      starter: {
        cpp: '#include <deque>\n#include <unordered_map>\n\nclass RateLimiter {\npublic:\n    RateLimiter(int maxRequests, double windowSeconds);\n    bool allow(int clientId, double now);\n};',
        python: 'from collections import deque, defaultdict\n\nclass RateLimiter:\n    def __init__(self, max_requests, window_seconds):\n        pass\n\n    def allow(self, client_id, now):\n        pass'
      },
      solution: {
        cpp: '#include <deque>\n#include <unordered_map>\n\nclass RateLimiter {\n    int    max_;\n    double window_;\n    std::unordered_map<int, std::deque<double>> hits_;\n\npublic:\n    RateLimiter(int maxRequests, double windowSeconds)\n        : max_(maxRequests), window_(windowSeconds) {}\n\n    bool allow(int clientId, double now) {\n        auto& q = hits_[clientId];\n\n        // drop everything that has aged out of the rolling window\n        while (!q.empty() && q.front() <= now - window_) q.pop_front();\n\n        if ((int)q.size() >= max_) return false;   // do NOT record a denial\n        q.push_back(now);\n        return true;\n    }\n};',
        python: 'from collections import deque, defaultdict\n\nclass RateLimiter:\n    def __init__(self, max_requests, window_seconds):\n        self.max = max_requests\n        self.window = window_seconds\n        self.hits = defaultdict(deque)\n\n    def allow(self, client_id, now):\n        q = self.hits[client_id]\n\n        # drop everything that has aged out of the rolling window\n        while q and q[0] <= now - self.window:\n            q.popleft()\n\n        if len(q) >= self.max:\n            return False        # do not record a denial, or the block never lifts\n        q.append(now)\n        return True'
      },
      checks: {
        cpp: [
          { re: 'deque|queue|list', hint: 'Keep timestamps in a structure with cheap removal at the front.' },
          { re: 'unordered_map|map', hint: 'Track each client separately.' },
          { re: 'while', hint: 'Evict expired timestamps.' },
          { re: 'return\\s+(false|true)', hint: 'Return whether the request is allowed.' }
        ],
        python: [
          { re: 'deque', hint: 'Keep timestamps in a structure with cheap removal at the front.' },
          { re: 'defaultdict|dict|\\{\\}', hint: 'Track each client separately.' },
          { re: 'while', hint: 'Evict expired timestamps.' },
          { re: 'return', hint: 'Return whether the request is allowed.' }
        ]
      },
      antiChecks: { cpp: [], python: [] },
      mcq: [
        { q: 'What is the flaw in a fixed-window counter?', opts: ['It uses too much memory', 'Requests clustered on either side of a boundary allow up to 2N in a period shorter than the window', 'It is O(n) per request', 'It cannot handle multiple clients'], correct: 1, why: 'The counter resets on a wall-clock boundary. N requests just before and N just after are 2N within a couple of seconds, which is exactly the burst the limit was meant to prevent.' },
        { q: 'Why is the sliding log amortised O(1) despite the while loop?', opts: ['The loop rarely runs', 'Each timestamp is pushed exactly once and popped exactly once over its lifetime', 'The deque is sorted', 'It is actually O(n)'], correct: 1, why: 'A single call can evict many entries, but the total eviction work across all calls is bounded by the total number of insertions, so the cost per request averages to constant.' }
      ]
    }
  ];

  const Q = [
    { id: 'q-lld-001', section: 'lld-principles', tier: 'intermediate', topic: 'SRP',
      q: 'What is the most reliable test for a Single Responsibility violation?',
      opts: ['The class is longer than 200 lines', 'The class has more than one reason to change — two unrelated requirements would both force edits to it', 'The class has more than five methods', 'The class name is a noun'],
      correct: 1, why: 'Length is a symptom, not the rule. The criterion is reasons to change: mixing pricing rules with database access means a schema change and a pricing change both touch the same class.' },

    { id: 'q-lld-002', section: 'lld-principles', tier: 'intermediate', topic: 'OCP',
      q: 'Which code smell most directly signals an Open/Closed violation?',
      opts: ['Long parameter lists', 'A switch or if-chain over a type field that must be edited every time a new type is added', 'Deep inheritance', 'Public fields'],
      correct: 1, why: 'Open for extension, closed for modification means new behaviour should arrive as new code. A type switch forces you to reopen and edit existing, tested code instead.' },

    { id: 'q-lld-003', section: 'lld-principles', tier: 'advanced', topic: 'LSP',
      q: 'Why does Square inheriting from Rectangle violate Liskov substitution?',
      opts: ['Squares are not rectangles geometrically', 'Rectangle promises that setting width leaves height unchanged, and Square cannot honour that promise', 'Square has fewer fields', 'It causes a compile error'],
      correct: 1, why: 'Inheritance models behavioural substitutability, not real-world taxonomy. Code written against Rectangle\'s contract breaks when handed a Square.' },

    { id: 'q-lld-004', section: 'lld-principles', tier: 'advanced', topic: 'DIP',
      q: 'What is the most practical benefit of dependency inversion?',
      opts: ['Faster execution', 'The class can be tested with a fake collaborator, because it receives its dependencies rather than constructing them', 'Smaller classes', 'Fewer files'],
      correct: 1, why: 'A class that constructs its own database cannot be unit tested without one. Injection is what makes the seam that a test double slots into.' },

    { id: 'q-lld-005', section: 'lld-principles', tier: 'intermediate', topic: 'ISP',
      q: 'What does an Interface Segregation violation look like in practice?',
      opts: ['An interface with one method', 'Implementers leaving methods empty or raising NotImplemented because the interface bundles unrelated capabilities', 'Two interfaces with the same method', 'An interface with no implementers'],
      correct: 1, why: 'A fat interface forces every implementer to care about everything. Empty overrides are the visible symptom, and they also break Liskov because the method does not do what its name says.' },

    { id: 'q-lld-006', section: 'lld-principles', tier: 'intermediate', topic: 'composition',
      q: 'Why is composition usually preferred over inheritance?',
      opts: ['It runs faster', 'It couples classes only through a narrow interface, and the relationship can change at runtime', 'It uses less memory', 'Inheritance is deprecated'],
      correct: 1, why: 'Inheritance exposes the base class\'s internals to every subclass and is fixed at compile time. Composition keeps the coupling to a stated interface and lets the collaborator be swapped.' },

    { id: 'q-lld-007', section: 'lld-principles', tier: 'advanced', topic: 'strategy',
      q: 'Which pattern directly replaces an if-chain that selects between algorithms?',
      opts: ['Singleton', 'Strategy', 'Adapter', 'Decorator'],
      correct: 1, why: 'Each branch becomes a class implementing a common interface, and the choice is made once by injecting the right one. Adding an algorithm stops meaning editing the chain.' },

    { id: 'q-lld-008', section: 'lld-principles', tier: 'advanced', topic: 'observer',
      q: 'Which requirement points at the Observer pattern?',
      opts: ['Objects must be created lazily', 'When one thing changes, an open-ended set of other components must react, without the subject knowing who they are', 'An interface must be adapted', 'Only one instance may exist'],
      correct: 1, why: 'The subject holds a list of subscribers and notifies them. Adding a consequence means registering another observer, not editing the subject.' },

    { id: 'q-lld-009', section: 'lld-principles', tier: 'master', topic: 'singleton',
      q: 'What is the strongest argument against Singleton in an interview?',
      opts: ['It is slow', 'It is global mutable state: it hides dependencies, makes tests order-dependent, and complicates concurrency', 'It cannot be implemented in C++', 'It requires inheritance'],
      correct: 1, why: 'The instance is reachable from anywhere, so nothing in a signature reveals the dependency and tests leak state into one another. Construct one instance and inject it instead.' },

    { id: 'q-lld-010', section: 'lld-principles', tier: 'advanced', topic: 'state',
      q: 'When is the State pattern the right answer?',
      opts: ['When an object has many fields', 'When an object behaves differently depending on its mode, and which operations are legal changes with that mode', 'When you need one instance', 'When wrapping a third-party API'],
      correct: 1, why: 'Elevators, vending machines and order lifecycles all have transitions where the legal operations differ. A class per state keeps each transition table in one readable place.' },

    { id: 'q-lld-011', section: 'lld-principles', tier: 'intermediate', topic: 'adapter',
      q: 'What problem does the Adapter pattern solve?',
      opts: ['Creating objects without naming the class', 'Making an existing incompatible interface usable through the interface your code already expects', 'Notifying subscribers of a change', 'Restricting to one instance'],
      correct: 1, why: 'It is the standard way to keep a vendor SDK from leaking through your codebase: one wrapper class translates, and swapping vendors touches only that class.' },

    { id: 'q-lld-012', section: 'lld-principles', tier: 'master', topic: 'interview process',
      q: 'What should you do first in a low-level design interview?',
      opts: ['Start drawing classes', 'Clarify requirements, scale and what is out of scope, and write the answers down', 'Pick the design patterns you will use', 'Write the database schema'],
      correct: 1, why: 'A design that solves the wrong problem cannot be recovered by good class structure. The clarifying questions are also part of what is being assessed.' },

    { id: 'q-lld-013', section: 'lld-problems', tier: 'advanced', topic: 'LRU',
      q: 'Why does an LRU cache need both a hash map and a doubly linked list?',
      opts: ['For redundancy', 'The map gives O(1) lookup by key; the doubly linked list gives O(1) removal and reordering by recency. Neither does both.', 'To support concurrent access', 'To reduce memory use'],
      correct: 1, why: 'A map cannot tell you which entry is least recently used; a list cannot find a key quickly. Combining them, with the map storing node pointers, makes both operations constant.' },

    { id: 'q-lld-014', section: 'lld-problems', tier: 'advanced', topic: 'parking lot',
      q: 'A parking lot design scans every spot to find a free one. What is the fix?',
      opts: ['Sort the spots by size', 'Maintain a free list per spot size, so finding and releasing a spot is O(1)', 'Use a database index', 'Cache the last free spot'],
      correct: 1, why: 'Pre-bucketing free spots by size turns the search into popping from the smallest list that fits, with a fallback to larger sizes. Release pushes back onto the right list.' },

    { id: 'q-lld-015', section: 'lld-problems', tier: 'master', topic: 'rate limiting',
      q: 'What does a rolling-window rate limiter fix that a fixed-window counter does not?',
      opts: ['Memory usage', 'The boundary burst: a fixed window permits up to 2N requests across the moment the counter resets', 'Support for multiple clients', 'Clock skew'],
      correct: 1, why: 'N requests just before the reset and N just after are 2N in a short span. A rolling window measures from the actual request time, so there is no boundary to exploit.' },

    { id: 'q-lld-016', section: 'lld-problems', tier: 'advanced', topic: 'concurrency',
      q: 'Your design keeps shared mutable state, such as a free list. What must you say about it?',
      opts: ['Nothing, single-threaded is assumed', 'Identify it as shared state and state how it is protected — a lock, a concurrent structure, or partitioning by key', 'Make every method static', 'Use a Singleton'],
      correct: 1, why: 'Naming shared mutable state and its protection unprompted is one of the strongest signals in a design interview, because it is the thing that actually breaks in production.' },

    { id: 'q-lld-017', section: 'lld-problems', tier: 'intermediate', topic: 'modelling',
      q: 'How do you decide whether a concept should be a class or a value type?',
      opts: ['By its number of fields', 'By whether it has identity and a lifecycle, or is fully described by its attributes', 'By whether it is mutable', 'By whether it is stored in a database'],
      correct: 1, why: 'Two orders with identical contents are still different orders, so Order has identity. Two money amounts of the same value are interchangeable, so Money is a value type.' },

    { id: 'q-lld-018', section: 'lld-problems', tier: 'advanced', topic: 'error handling',
      q: 'In a parking lot, what is the cleanest way to express "the lot is full"?',
      opts: ['Throw an exception', 'Return an empty optional or None — a full lot is an expected outcome, not an error', 'Return a null Ticket object', 'Return a ticket with id -1'],
      correct: 1, why: 'Exceptions are for the unexpected. A full lot is ordinary, and optional forces the caller to handle it without the cost and control-flow surprise of throwing.' },

    { id: 'q-lld-019', section: 'lld-problems', tier: 'master', topic: 'extensibility',
      q: 'You are asked how you would add a new pricing rule. The best answer is:',
      opts: ['Add an if-branch to the fee method', 'A new FeeStrategy implementation, injected — the lot itself does not change', 'A new subclass of ParkingLot', 'A configuration flag'],
      correct: 1, why: 'It demonstrates that the volatile rule was isolated on purpose. If the honest answer is "edit the fee method", the design has an Open/Closed problem worth admitting.' },

    { id: 'q-lld-020', section: 'lld-problems', tier: 'intermediate', topic: 'API design',
      q: 'Why write method signatures before implementations in a design interview?',
      opts: ['It is faster to type', 'Signatures show whether you have understood the domain, and they are what the interviewer evaluates most', 'Implementations are not required', 'It avoids compile errors'],
      correct: 1, why: 'The names, parameters and return types encode the model. Getting them right early also surfaces missing concepts before you have written any bodies.' }
  ];

  window.DB.lessons.push.apply(window.DB.lessons, L);
  window.DB.problems.push.apply(window.DB.problems, P);
  window.DB.questions.push.apply(window.DB.questions, Q);
})();
