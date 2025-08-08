// order-tap-game.js
// ES Module for a generic "Order Tap Game" component

export default class OrderTapGame {
  /**
   * @param {HTMLElement|string} container - DOM element or selector for the game root
   * @param {Object} options
   * @param {Array} options.problems - Array of problem objects
   * @param {string} [options.language='en'] - Initial language code
   * @param {Function|string} [options.sortBy] - Comparator function or key for sorting
   * @param {number} [options.displayCount] - Number of items to display per question
   * @param {Function} [options.onAnswer] - Callback after checking answer
   * @param {Function} [options.onHint] - Callback on hint request
   * @param {Function} [options.onReset] - Callback on reset
   * @param {Function} [options.onSkip] - Callback on skip
   * @param {Function} [options.onClear] - Callback on clear selection
   */
  constructor(container, options = {}) {
    // Resolve container
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    if (!this.container) {
      throw new Error(`Container element not found: ${container}`);
    }

    // Options and defaults
    const {
      problems = [],
      language = 'en',
      sortBy = null,
      displayCount = null,
      onAnswer = () => {},
      onHint = () => {},
      onReset = () => {},
      onSkip = () => {},
      onClear = () => {}
    } = options;

    this.originalProblems = problems.slice();
    this.language = language;
    this.onAnswer = onAnswer;
    this.onHint = onHint;
    this.onReset = onReset;
    this.onSkip = onSkip;
    this.onClear = onClear;
    this.displayCount = displayCount;

    // Build comparator
    if (typeof sortBy === 'function') {
      this.comparator = sortBy;
    } else if (typeof sortBy === 'string') {
      // sortBy is a path like 'metadata.orderKey'
      this.comparator = (a, b) => {
        const aVal = this._getByPath(a, sortBy);
        const bVal = this._getByPath(b, sortBy);
        return aVal - bVal;
      };
    } else {
      this.comparator = null;
    }

    // Initialize state
    this._resetState();

    // Render base UI
    this._renderBaseUI();

    // Load first problem
    this.next();
  }

  // PRIVATE: reset internal state
  _resetState() {
    this.problems = this.originalProblems.slice();
    if (this.comparator) {
      this.problems.sort(this.comparator);
    }
    this.total = 0;
    this.correctCount = 0;
  }

  // PRIVATE: render static UI elements
  _renderBaseUI() {
    const html = `
      <div class="otg-question"></div>
      <div class="otg-card-grid"></div>
      <div class="otg-controls">
        <button class="otg-submit">Submit</button>
        <button class="otg-clear">Clear</button>
        <button class="otg-skip">Skip</button>
        <button class="otg-hint">Hint</button>
      </div>
      <div class="otg-hint-display"></div>
      <div class="otg-result"></div>
      <div class="otg-score"></div>
    `;
    this.container.innerHTML = html;

    // Cache elements
    this.elQuestion = this.container.querySelector('.otg-question');
    this.elGrid = this.container.querySelector('.otg-card-grid');
    this.elSubmit = this.container.querySelector('.otg-submit');
    this.elClear = this.container.querySelector('.otg-clear');
    this.elSkip = this.container.querySelector('.otg-skip');
    this.elHintBtn = this.container.querySelector('.otg-hint');
    this.elHintDisplay = this.container.querySelector('.otg-hint-display');
    this.elResult = this.container.querySelector('.otg-result');
    this.elScore = this.container.querySelector('.otg-score');

    // Bind control events
    this.elSubmit.addEventListener('click', () => this.check());
    this.elClear.addEventListener('click', () => { this.clearSelection(); this.onClear(); });
    this.elSkip.addEventListener('click', () => { this.next(); this.onSkip(); });
    this.elHintBtn.addEventListener('click', () => { this._showHint(); this.onHint(this.current.hint); });

    this._updateScore();
  }

  // PUBLIC: clear current selection marks
  clearSelection() {
    this.userOrder = [];
    this.tappedSet.clear();
    this.elGrid.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
  }

  // PUBLIC: proceed to next problem
  next() {
    // Pick next problem (simple sequential)
    if (this.problems.length === 0) return;
    this.current = this.problems.shift();
    this.total++;
    this._renderProblem();
    this.onReset();
    this._updateScore();
  }

  // PUBLIC: check current answer
  check() {
    const correct = this._isCorrect();
    if (correct) this.correctCount++;
    this.elResult.textContent = correct ? 'Correct!': 'Wrong';
    this._updateScore();
    this.onAnswer({ correct, total: this.total, correctCount: this.correctCount, problem: this.current });
    return { correct, total: this.total, correctCount: this.correctCount };
  }

  // PUBLIC: reset current question (re-render)
  reset() {
    this.problems.unshift(this.current);
    this.total--;
    this.next();
  }

  // PUBLIC: set language and update UI labels
  setLanguage(lang) {
    this.language = lang;
    this._renderProblem();
  }

  // PUBLIC: replace problem set
  setProblems(problems) {
    this.originalProblems = problems.slice();
    this._resetState();
    this.next();
  }

  // PRIVATE: render the current problem
  _renderProblem() {
    // Question text
    this.elQuestion.textContent = this.current.questionText || this.current.label;

    // Prepare order array
    const items = this.current.items.slice(); // assume items: Array of objects
    if (this.comparator) items.sort(this.comparator);

    // Display grid
    this.elGrid.innerHTML = '';
    this.userOrder = [];
    this.tappedSet = new Set();

    items.forEach((item, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'otg-card';
      wrapper.dataset.idx = idx;
      // Label element with multilingual data
      const label = document.createElement('span');
      label.className = 'note-label';
      for (const [lng, txt] of Object.entries(item.labels)) {
        label.setAttribute(`data-${lng}`, txt);
      }
      label.textContent = item.labels[this.language] || Object.values(item.labels)[0];
      wrapper.appendChild(label);

      // Click handler
      wrapper.addEventListener('click', () => {
        if (this.tappedSet.has(idx)) return;
        this.tappedSet.add(idx);
        this.userOrder.push(idx);
        wrapper.classList.add('selected');
        const order = document.createElement('div');
        order.className = 'tap-order';
        order.textContent = this.userOrder.length;
        wrapper.appendChild(order);
      });
      this.elGrid.appendChild(wrapper);
    });

    // Clear previous messages
    this.elResult.textContent = '';
    this.elHintDisplay.textContent = '';
  }

  // PRIVATE: determine correctness
  _isCorrect() {
    // Compare userOrder to [0...n-1]
    return (
      this.userOrder.length === this.current.items.length &&
      this.userOrder.every((v,i) => v === i)
    );
  }

  // PRIVATE: show hint for current
  _showHint() {
    const hints = this.current.hints || [];
    const hint = hints[Math.floor(Math.random() * hints.length)] || '';
    this.elHintDisplay.textContent = hint;
  }

  // PRIVATE: update score display
  _updateScore() {
    this.elScore.textContent = `Score: ${this.correctCount}/${this.total}`;
  }

  // PRIVATE: utility to get nested property by path
  _getByPath(obj, path) {
    return path.split('.').reduce((o,key) => (o ? o[key] : undefined), obj);
  }
}
