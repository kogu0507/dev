// flashcard.js
// =======================
// ES6 クラスによるフラッシュカード実装サンプル（最終調整版）
// ・複数のフラッシュカードセットに対応 (quizSetId で localStorage キーを分離)
// ・状態をまとめて localStorage 保存
// ・即時保存 + debounce + pagehide イベントによる確実な保存
// ・console.log 多め
// ・JSDocコメント追加

// --- 集約状態のロード／セーブ関連 ---

/**
 * localStorageに状態を保存する際のキーのプレフィックス。
 * 各フラッシュカードセットのIDと組み合わせて使用されます。
 * @type {string}
 */
const STORAGE_KEY_PREFIX = 'flashcard_quiz_state_';

/**
 * 現在実際に使用されているlocalStorageのキー。
 * loadState関数によって設定されます。
 * @type {string}
 */
export let actualStorageKey = ''; // エントリーポイントからアクセスできるように export

/**
 * ロードされた全てのカードの学習状態を保持するオブジェクト。
 * カードIDをキーとし、`{ memorized: boolean, wrongCount: number }` の形式で値を持ちます。
 * @type {Object.<string, {memorized: boolean, wrongCount: number}>}
 */
export let flashcardState = {}; // エントリーポイントからアクセスできるように export

/**
 * 指定された quizSetId に基づいて localStorage から状態をロードします。
 * quizSetId はページ全体のフラッシュカードセットを識別するために使われます。
 * @param {string} quizSetId - 現在のフラッシュカードセットを一意に識別するID。
 */
export function loadState(quizSetId) {
    if (!quizSetId) {
        console.error('[State] quizSetId が指定されていません。状態をロードできません。');
        return;
    }
    actualStorageKey = STORAGE_KEY_PREFIX + quizSetId;
    console.log(`[State] Loading state from localStorage for key: "${actualStorageKey}"`);

    const json = localStorage.getItem(actualStorageKey);
    try {
        flashcardState = json ? JSON.parse(json) : {};
        console.log('[State] Loaded:', flashcardState);
    } catch (e) {
        console.error('[State] localStorage のパースエラー:', e, '不正なデータを削除しました。');
        flashcardState = {}; // エラー時は初期化
        localStorage.removeItem(actualStorageKey); // 不正なデータを削除
    }
}

let saveTimer = null;
/**
 * 現在の flashcardState を localStorage に保存します。
 * 保存はデバウンス（一定時間遅延）されるか、即時に行われます。
 * 保存後、全てのカードの学習状況表示を更新します。
 * @param {boolean} [debounce=true] - trueの場合、一定時間（300ms）の遅延後に保存します。falseの場合、即時保存します。
 * @param {CardCollection|null} [collection=null] - 保存後に状態表示を更新するために使用するCardCollectionインスタンス。
 */
export function saveState(debounce = true, collection = null) {
    if (!actualStorageKey) {
        console.warn('[State] actualStorageKey が設定されていません。保存をスキップします。');
        return;
    }

    const performSave = () => {
        console.log('[State] Save triggered');
        localStorage.setItem(actualStorageKey, JSON.stringify(flashcardState));
        console.log('[State] Saved state:', flashcardState);
        if (collection) {
            updateAllCardStatusDisplays(collection); // 保存時に全ての表示を更新
        }
    };

    if (debounce) {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(performSave, 300);
    } else {
        if (saveTimer) clearTimeout(saveTimer); // 即時保存の場合はdebounceタイマーをクリア
        performSave();
    }
}

// NOTE: window.addEventListener('pagehide', ...) は HTML のエントリーポイントに移動します。

/**
 * 特定のカテゴリのカードの状態をHTMLに表示するヘルパー関数。
 * CardCollection が持つカード情報と flashcardState を同期して表示します。
 * @param {CardCollection} collection - 表示するカードを持つCardCollectionインスタンス。
 * @param {HTMLElement} containerEl - ステータスを表示するDOM要素。
 * @param {string} [categoryFilter=''] - 表示するカードのカテゴリをフィルタリングする文字列 (オプション)。
 */
export function updateCardStatusDisplay(collection, containerEl, categoryFilter = '') {
    if (!containerEl || !collection) {
        // console.warn('[UI] Card status display container or collection not available for update.');
        return;
    }

    containerEl.innerHTML = ''; // 一度クリア

    const cardsToDisplay = categoryFilter
        ? collection.filterByCategory(categoryFilter)
        : collection.cards;

    if (cardsToDisplay.length === 0) {
        containerEl.innerHTML = '<p>表示するカードがありません。</p>';
        return;
    }

    cardsToDisplay.forEach(card => {
        const currentState = flashcardState[card.id] || { memorized: false, wrongCount: 0 };
        const isMemorized = currentState.memorized;
        const wrongCount = currentState.wrongCount;

        const item = document.createElement('div');
        item.classList.add('card-item');
        item.innerHTML = `
            <div>ID: ${card.id}</div>
            <div>カテゴリ: ${card.category}</div>
            <div>タグ: ${card.tags.join(', ')}</div>
            <div>間違い: ${wrongCount}</div>
            <div class="memorized-status ${isMemorized ? 'memorized' : 'unmemorized'}"> ${isMemorized ? '暗記済' : '未暗記'}
            </div>

        `;
        containerEl.appendChild(item);
    });
    // console.log('[UI] Card status display updated for container:', containerEl.id || containerEl.className);
}

/**
 * ページ内の全てのカードステータス表示コンテナを更新します。
 * @param {CardCollection} collection - 全てのカード情報を持つCardCollectionインスタンス。
 */
export function updateAllCardStatusDisplays(collection) {
    document.querySelectorAll('.card-status-list').forEach(listContainer => {
        const cardType = listContainer.dataset.cardType;
        updateCardStatusDisplay(collection, listContainer, cardType);
    });
}


/**
 * Card モデル
 * HTMLのdata属性からカードの基本情報を取得し、
 * グローバルな flashcardState を参照して学習状態を管理します。
 */
export class Card {
    /**
     * @param {HTMLElement} element - .memorize-card 要素
     */
    constructor(element) {
        // console.log('[Card] Initializing card from element:', element);
        this.element = element;
        this.id = element.dataset.id;
        this.tags = element.dataset.tags ? element.dataset.tags.split(',').map(tag => tag.trim()) : [];
        this.category = element.dataset.category || '';

        // 初期状態は flashcardState から取得
        const st = flashcardState[this.id] || {};
        this.memorized = !!st.memorized; // 既存の状態を保持
        this.wrongCount = st.wrongCount || 0; // 既存の状態を保持
        // console.log(`[Card:${this.id}] loaded state memorized=${this.memorized}, wrongCount=${this.wrongCount}`);
    }

    /**
     * 問題文とURLを取得します。
     * @param {string} [lang='jp'] - 取得する言語（'jp'など）。
     * @returns {{text: string|undefined, url: string|undefined}} 問題のテキストと画像のURL。
     */
    getQuestion(lang = 'jp') {
        const keyText = `questionText${lang.toLowerCase()}`;
        const text = this.element.dataset[keyText];
        const url = this.element.dataset.questionUrl;
        // console.log(`[Card:${this.id}] getQuestion(${lang}) =>`, { text: text, url: url, keyAttempted: keyText, actualDataset: this.element.dataset });
        return { text, url };
    }

    /**
     * 解答文とURLを取得します。
     * @param {string} [lang='jp'] - 取得する言語（'jp'など）。
     * @returns {{text: string|undefined, url: string|undefined}} 解答のテキストと画像のURL。
     */
    getAnswer(lang = 'jp') {
        const keyText = `answerText${lang.toLowerCase()}`;
        const text = this.element.dataset[keyText];
        const url = this.element.dataset.answerUrl;
        // console.log(`[Card:${this.id}] getAnswer(${lang}) =>`, { text: text, url: url, keyAttempted: keyText, actualDataset: this.element.dataset });
        return { text, url };
    }

    /**
     * 指定されたタグを持っているかを確認します。
     * @param {string} tag - 確認するタグ。
     * @returns {boolean} タグを持っている場合はtrue、そうでない場合はfalse。
     */
    hasTag(tag) {
        return this.tags.includes(tag);
    }

    /**
     * カードが暗記済みであるかを確認します。
     * グローバルな `flashcardState` から最新の状態を取得します。
     * @returns {boolean} 暗記済みであればtrue、そうでなければfalse。
     */
    isMemorized() {
        return !!(flashcardState[this.id] && flashcardState[this.id].memorized);
    }

    /**
     * カードの暗記状態を設定し、localStorageに保存します。
     * @param {boolean} flag - trueで暗記済みに設定、falseで未暗記に設定。
     * @param {CardCollection} collection - 状態保存後に表示を更新するために使用するCardCollectionインスタンス。
     */
    setMemorized(flag, collection) {
        // console.log(`[Card:${this.id}] setMemorized =>`, flag);
        // flashcardState を更新
        if (flashcardState[this.id]?.memorized !== flag) {
            flashcardState[this.id] = {
                ...flashcardState[this.id], // 既存のプロパティを保持 (wrongCountなど)
                memorized: flag
            };
            saveState(true, collection); // collection を渡す
        } else {
            console.log(`[Card:${this.id}] Memorized status unchanged. No save triggered.`);
        }
    }

    /**
     * カードの間違い回数を1増やし、localStorageに保存します。
     * @param {CardCollection} collection - 状態保存後に表示を更新するために使用するCardCollectionインスタンス。
     */
    incrementWrongCount(collection) {
        // console.log(`[Card:${this.id}] incrementWrongCount`);
        // flashcardState を更新
        flashcardState[this.id] = {
            ...flashcardState[this.id],
            memorized: flashcardState[this.id]?.memorized || false, // memorizeが未定義の場合に備える
            wrongCount: (flashcardState[this.id]?.wrongCount || 0) + 1
        };
        // console.log(`[Card:${this.id}] new wrongCount =>`, flashcardState[this.id].wrongCount);
        saveState(true, collection); // collection を渡す
    }
}

/**
 * CardCollection: ページ上のカード群を管理し、フィルタリング機能を提供します。
 */
export class CardCollection {
    /**
     * @param {string} selector - '.memorize-card' 要素のセレクタ。
     */
    constructor(selector) {
        console.log('[Collection] Initializing collection with selector:', selector);
        this.cards = Array.from(document.querySelectorAll(selector))
            .map(el => new Card(el));
        console.log('[Collection] Total cards:', this.cards.length);
    }

    /**
     * 指定されたカテゴリに属するカードをフィルタリングして返します。
     * @param {string} category - フィルタリングするカテゴリ名。
     * @returns {Card[]} フィルタリングされたカードの配列。
     */
    filterByCategory(category) {
        // console.log('[Collection] filterByCategory:', category);
        return this.cards.filter(card => card.category === category);
    }

    /**
     * 未暗記のカードのみをフィルタリングして返します。
     * Cardクラスの `isMemorized()` メソッドが `flashcardState` を参照するため、常に最新の状態を反映します。
     * @returns {Card[]} 未暗記のカードの配列。
     */
    filterUnmemorized() {
        // console.log('[Collection] filterUnmemorized');
        return this.cards.filter(card => !card.isMemorized());
    }

    /**
     * 全てのカードの暗記状態を一括で変更し、localStorageに保存します。
     * @param {boolean} flag - trueで暗記済み、falseで未暗記に設定。
     */
    markAll(flag) {
        console.log('[Collection] markAll =>', flag);
        let changed = false;
        this.cards.forEach(card => {
            if (flashcardState[card.id]?.memorized !== flag) { // 変更がある場合のみ更新
                flashcardState[card.id] = {
                    ...flashcardState[card.id],
                    wrongCount: flashcardState[card.id]?.wrongCount || 0, // 既存の間違い数を保持
                    memorized: flag
                };
                changed = true;
            }
        });
        if (changed) {
            saveState(false, this); // 変更があった場合のみ即時保存, this (CardCollection) を渡す
            console.log('[Collection] All cards marked. State saved immediately.');
        } else {
            console.log('[Collection] No cards changed their memorized status. No save triggered.');
        }
    }

    /**
     * カードの重み付けされた候補リストを生成します。
     * 未暗記のカードを優先し、間違い回数やタグに基づく重みを適用します。
     * @param {Object} [weights={}] - タグごとの重みを定義するオブジェクト (例: `{ difficult: 1.5, review: 1.2 }`)。
     * @returns {Card[]} 重み付けされ、複製されたカードの配列。候補がない場合は全カードの複製を返します。
     */
    getWeightedCandidates(weights = {}) {
        // console.log('[Collection] getWeightedCandidates with weights:', weights);
        const pool = this.filterUnmemorized();
        const weighted = [];
        pool.forEach(card => {
            let weight = 1;
            card.tags.forEach(tag => {
                if (weights[tag]) {
                    // console.log(`[Collection] applying weight ${weights[tag]} for tag ${tag}`);
                    weight *= weights[tag];
                }
            });
            // CardStateからwrongCountを取得
            const currentWrongCount = flashcardState[card.id]?.wrongCount || 0;
            // 間違い回数が多いほど重みを増やす
            weight *= (1 + currentWrongCount * 0.1);
            // console.log(`[Collection] card ${card.id} base weight =>`, weight);
            for (let i = 0; i < Math.ceil(weight); i++) {
                weighted.push(card);
            }
        });
        // console.log('[Collection] weighted pool size:', weighted.length);
        // 未暗記の候補がなければ、全てのカードを対象にする (Memorized含む)
        return weighted.length ? weighted : this.cards.slice();
    }
}


/**
 * FlashcardQuiz: 個々のフラッシュカードクイズの出題ロジックとUI操作を管理します。
 * 複数のクイズインスタンスをページ内に共存させることができます。
 */
export class FlashcardQuiz {
    /**
     * @param {CardCollection} collection - このクイズが利用するカード群（通常は全体のコレクション）。
     * @param {Object} options - クイズの設定オプション。
     * @param {number} [options.maxHistory=5] - 履歴に保持するカードの最大数。
     * @param {Object} [options.weights={}] - カード選択の重み付け設定。
     * @param {Object} uiElements - このクイズインスタンスが操作するUI要素のDOM参照。
     * @param {HTMLElement} uiElements.questionDisplay - 問題表示要素。
     * @param {HTMLElement} uiElements.answerDisplay - 解答表示要素。
     * @param {HTMLElement} uiElements.generateBtn - 次の問題ボタン。
     * @param {HTMLElement} uiElements.showAnswerBtn - 解答表示ボタン。
     * @param {string} [cardCategoryFilter=''] - このクイズが出題するカードのカテゴリ名。
     */
    constructor(collection, { maxHistory = 5, weights = {} } = {}, uiElements, cardCategoryFilter = '') {
        console.log('[Quiz] Initializing quiz for category:', cardCategoryFilter);
        this.collection = collection;
        this.maxHistory = maxHistory;
        this.weights = weights;
        this.history = [];
        this.currentCard = null;
        this.cardCategoryFilter = cardCategoryFilter;

        // UI要素をプロパティとして保持 (イベントリスナーの設定は外部で行う)
        this.questionDisplayEl = uiElements.questionDisplay;
        this.answerDisplayEl = uiElements.answerDisplay;
        this.generateBtn = uiElements.generateBtn; // 参照として持つが、イベント設定はしない
        this.showAnswerBtn = uiElements.showAnswerBtn; // 参照として持つが、イベント設定はしない
    }

    /**
     * 問題を生成し、UIに表示します。
     * `cardCategoryFilter` に基づいてカードをフィルタリングします。
     * @param {string} [lang='jp'] - 問題の言語。
     * @returns {Card|null} 生成されたカード、またはカードが見つからない場合はnull。
     */
    generateQuestion(lang = 'jp') {
        console.log('[Quiz] generateQuestion, category filter:', this.cardCategoryFilter, 'lang:', lang);

        let candidates = this.collection.cards;
        if (this.cardCategoryFilter) {
            candidates = this.collection.filterByCategory(this.cardCategoryFilter);
        }

        if (candidates.length === 0) {
            console.warn('[Quiz] No candidates found for the given category/filter.');
            if (this.questionDisplayEl) this.questionDisplayEl.innerHTML = '<p>表示するカードがありません。</p>';
            if (this.answerDisplayEl) this.answerDisplayEl.innerHTML = '';
            this.currentCard = null;
            return null;
        }

        // 重み付きリストを生成し、現在のカテゴリ候補でフィルタリング
        const weightedCandidates = this.collection.getWeightedCandidates(this.weights)
            .filter(card => candidates.includes(card));

        // 履歴除外
        const pool = weightedCandidates.filter(card => !this.history.includes(card));
        let list = pool.length ? pool : weightedCandidates; // 履歴除外で空になったら、重み付きリスト全体から選ぶ
        console.log('[Quiz] candidate list size after history filter:', list.length);

        if (list.length === 0 && this.history.length > 0) {
            console.warn('[Quiz] No unique cards left to display after history filtering. Resetting history and retrying.');
            this.history = []; // 履歴をリセットして再試行
            // 履歴リセット後、再度候補を生成
            const retryPool = weightedCandidates.filter(card => !this.history.includes(card));
            list = retryPool.length ? retryPool : weightedCandidates;
            if (list.length === 0) {
                console.error('[Quiz] Still no cards after history reset. Something is wrong.');
                if (this.questionDisplayEl) this.questionDisplayEl.innerHTML = '<p>エラー: 問題を生成できませんでした。</p>';
                if (this.answerDisplayEl) this.answerDisplayEl.innerHTML = '';
                this.currentCard = null;
                return null;
            }
        } else if (list.length === 0) {
            console.error('[Quiz] No cards available in the first place.');
            if (this.questionDisplayEl) this.questionDisplayEl.innerHTML = '<p>エラー: 問題を生成できませんでした。</p>';
            if (this.answerDisplayEl) this.answerDisplayEl.innerHTML = '';
            this.currentCard = null;
            return null;
        }


        // ランダム選択
        const idx = Math.floor(Math.random() * list.length);
        this.currentCard = list[idx];
        console.log('[Quiz] selected card:', this.currentCard.id);

        // 履歴追加
        this.history.push(this.currentCard);
        if (this.history.length > this.maxHistory) {
            const removed = this.history.shift();
            console.log('[Quiz] removed from history:', removed.id);
        }
        // 表示
        this._renderQuestion(lang);
        return this.currentCard;
    }

    /**
     * 解答をUIに表示します。
     * @param {string} [lang='jp'] - 解答の言語。
     */
    showAnswer(lang = 'jp') {
        if (!this.currentCard) {
            console.warn('[Quiz] showAnswer called but currentCard is null');
            return;
        }
        console.log('[Quiz] showAnswer for card:', this.currentCard.id);
        this._renderAnswer(lang);
    }

    /**
     * 現在のカードの問題をUIにレンダリングします。
     * @private
     * @param {string} lang - 問題の言語。
     */
    _renderQuestion(lang) {
        if (!this.currentCard || !this.questionDisplayEl) return;

        const { text, url } = this.currentCard.getQuestion(lang);
        // console.log('[UI] Rendering question:', text, url);
        let htmlContent = '';
        if (text) {
            htmlContent += `<p>${text}</p>`;
        }
        if (url) {
            htmlContent += `<img src="${url}" alt="question"/>`;
        } else if (!text && !url) {
            htmlContent += `<p>問題テキストなし</p>`;
        }
        this.questionDisplayEl.innerHTML = htmlContent;
        if (this.answerDisplayEl) {
            this.answerDisplayEl.innerHTML = ''; // 解答をクリア
        }
    }

    /**
     * 現在のカードの解答をUIにレンダリングし、
     * 「暗記済み」チェックボックスと「間違えた」ボタンのイベントリスナーを設定します。
     * @private
     * @param {string} lang - 解答の言語。
     */
    _renderAnswer(lang) {
        if (!this.currentCard || !this.answerDisplayEl) return;

        const { text, url } = this.currentCard.getAnswer(lang);
        // console.log('[UI] Rendering answer:', text, url);
        let htmlContent = '';
        if (url) {
            htmlContent += `<img src="${url}" alt="answer"/>`;
        }
        if (text) {
            htmlContent += `<p>${text}</p>`;
        } else if (!text && !url) {
            htmlContent += `<p>解答テキストなし</p>`;
        }

        this.answerDisplayEl.innerHTML = `
            ${htmlContent}
            <div class="controls">
                <label>
                    <input type="checkbox" class="answer-mem-check" ${this.currentCard.isMemorized() ? 'checked' : ''}/> 暗記済み
                </label>
                <button class="wrong-btn">間違えた</button>
            </div>
        `;

        // クラス名で要素を取得し、イベントリスナーを設定
        const memCheck = this.answerDisplayEl.querySelector('.answer-mem-check');
        if (memCheck) {
            // ここで this.collection (現在の FlashcardQuiz インスタンスが使用している CardCollection) を渡す
            memCheck.addEventListener('change', e => this.currentCard.setMemorized(e.target.checked, this.collection));
        } else { console.warn('[UI] .answer-mem-check element not found in answerDisplay.'); }

        const wrongBtn = this.answerDisplayEl.querySelector('.wrong-btn');
        if (wrongBtn) {
            // ここで this.collection を渡す
            wrongBtn.addEventListener('click', () => this.currentCard.incrementWrongCount(this.collection));
        } else { console.warn('[UI] .wrong-btn element not found in answerDisplay.'); }
    }
}