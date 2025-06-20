(function () {
    'use strict';

    /**
     * SimpleTabComponent
     * - 複数のコンテナに対応
     * - イベント委譲によるクリック処理
     * - キーボード操作サポート（左右／Home／End）
     * - ARIA属性によるアクセシビリティ強化
     * - ディープリンク（URLハッシュ）
     * - オプション（初期タブ指定・ディープリンク有無）
     * - コールバック hook onTabChange
     */
    class SimpleTabComponent {
        /**
         * @param {HTMLElement} container `.simple-tab-component-container`
         * @param {Object} options
         *   - defaultTab: (string) data-tab 属性と一致する初期タブID
         *   - deepLink: (boolean) URLハッシュでタブを切り替えるか
         *   - onTabChange: (function) タブ変更時のコールバック(新タブIDを引数に)
         */
        constructor(container, options = {}) {
            // デフォルトオプション
            const defaults = {
                defaultTab: null,
                deepLink: true,
                onTabChange: null
            };
            this.opts = Object.assign({}, defaults, options);
            this.container = container;
            this.tabList = container.querySelector('.tabs');
            this.tabButtons = Array.from(container.querySelectorAll('.tab-button'));
            this.tabPanes = Array.from(container.querySelectorAll('.tab-pane'));

            // 初期化処理
            this._setupAccessibility();
            this._bindEvents();
            this._initActiveTab();
        }

        /** ARIA属性やroleの設定 */
        _setupAccessibility() {
            // タブリスト全体にrole
            this.tabList.setAttribute('role', 'tablist');

            this.tabButtons.forEach((btn, idx) => {
                btn.setAttribute('role', 'tab');
                // idが無ければ自動付与
                if (!btn.id) {
                    btn.id = `stc-tab-${Math.random().toString(36).substr(2, 9)}`;
                }
                // aria-controls に対応するパネルIDを指定
                btn.setAttribute('aria-controls', btn.dataset.tab);
                // aria-selected と tabindex
                const isActive = btn.classList.contains('active');
                btn.setAttribute('aria-selected', isActive);
                btn.setAttribute('tabindex', isActive ? '0' : '-1');
            });

            this.tabPanes.forEach(pane => {
                pane.setAttribute('role', 'tabpanel');
                // aria-labelledby に対応するタブボタンのIDを指定
                const btn = this.container.querySelector(`.tab-button[data-tab="${pane.id}"]`);
                if (btn) {
                    pane.setAttribute('aria-labelledby', btn.id);
                }
            });
        }

        /** クリック／キーボード／ハッシュ変更のイベントをバインド */
        _bindEvents() {
            // クリックはイベント委譲
            this.tabList.addEventListener('click', event => {
                const btn = event.target.closest('.tab-button');
                if (!btn) return;
                event.preventDefault();
                this.activateTab(btn);
            });

            // キーボード操作対応
            this.tabList.addEventListener('keydown', event => {
                const key = event.key;
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
                event.preventDefault();

                // フォーカス中のタブボタンを探す
                const currentIndex = this.tabButtons.findIndex(b => b === document.activeElement);
                let newIndex = currentIndex;
                if (key === 'ArrowLeft') newIndex = (currentIndex - 1 + this.tabButtons.length) % this.tabButtons.length;
                if (key === 'ArrowRight') newIndex = (currentIndex + 1) % this.tabButtons.length;
                if (key === 'Home') newIndex = 0;
                if (key === 'End') newIndex = this.tabButtons.length - 1;

                const targetBtn = this.tabButtons[newIndex];
                targetBtn.focus();
                this.activateTab(targetBtn);
            });

            // ディープリンクでハッシュ変化を監視
            if (this.opts.deepLink) {
                window.addEventListener('hashchange', () => {
                    const hash = location.hash.slice(1);
                    const btn = this.tabButtons.find(b => b.dataset.tab === hash);
                    if (btn) {
                        this.activateTab(btn, false);
                    }
                });
            }
        }

        /** ページ読込時の初期アクティブタブを決定 */
        _initActiveTab() {
            let initialBtn = null;

            // 1. URLハッシュ優先
            if (this.opts.deepLink && location.hash) {
                const hash = location.hash.slice(1);
                initialBtn = this.tabButtons.find(b => b.dataset.tab === hash);
            }
            // 2. data-default-tab 属性
            if (!initialBtn && this.container.dataset.defaultTab) {
                initialBtn = this.tabButtons.find(b => b.dataset.tab === this.container.dataset.defaultTab);
            }
            // 3. HTML上の .active
            if (!initialBtn) {
                initialBtn = this.tabButtons.find(b => b.classList.contains('active'));
            }
            // 4. どれも無ければ最初のタブ
            if (!initialBtn) {
                initialBtn = this.tabButtons[0];
            }

            // 初期表示（URLハッシュ更新は不要）
            this.activateTab(initialBtn, false);
        }

        /**
         * タブをアクティブ化
         * @param {HTMLElement} button .tab-button
         * @param {boolean} updateHash URLハッシュも書き換えるか
         */
        activateTab(button, updateHash = true) {
            // すべてのボタン／パネルから active を削除
            this.tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
                b.setAttribute('tabindex', '-1');
            });
            this.tabPanes.forEach(p => p.classList.remove('active'));

            // 指定ボタンを active に
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            button.setAttribute('tabindex', '0');

            // 対応するパネルを active に
            const pane = this.container.querySelector(`#${button.dataset.tab}`);
            if (pane) {
                pane.classList.add('active');
            }

            // URLハッシュを書き換え（履歴を残さず）
            if (this.opts.deepLink && updateHash) {
                history.replaceState(null, '', `#${button.dataset.tab}`);
            }

            // コールバック呼び出し
            if (typeof this.opts.onTabChange === 'function') {
                this.opts.onTabChange(button.dataset.tab);
            }

            // 横スクロール領域内でアクティブボタンを中央付近に収める
            button.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    // DOM 準備ができたらすべてのコンテナを初期化
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.simple-tab-component-container')
            .forEach(container => {
                // data 属性からオプション取得
                const defaultTab = container.dataset.defaultTab || null;
                const deepLink = container.dataset.deepLink !== 'false';
                new SimpleTabComponent(container, {
                    defaultTab,
                    deepLink
                    // onTabChange: function(tabId) { /* 必要なら */ }
                });
            });
    });
})();
