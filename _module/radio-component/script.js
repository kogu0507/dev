// https://kogu0507.github.io/module/dev/_module/radio-component/script.js

class RadioComponent extends HTMLElement {
    constructor() {
        super();
        // Shadow DOM を付与（カプセル化）
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // ラジオボタンのグループ名をユニーク生成（name 属性はグループ単位で共通に）
        const groupName = this.getAttribute('name') || `radio-${Math.random().toString(36).substr(2)}`;

        // ライト DOM の slot="option" 要素を取得
        const lightOptions = Array.from(this.querySelectorAll('[slot="option"]'));

        // Shadow DOM 内にラジオボタン群を入れるコンテナを作成
        const container = document.createElement('div');
        container.classList.add('radio-group');

        // 各 option 要素からラベル＋input を生成
        lightOptions.forEach((optEl, idx) => {
            const label = document.createElement('label');
            label.classList.add('radio-option');
            // ラジオ本体
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = groupName;
            input.value = optEl.textContent.trim();
            // 最初の要素を選択状態に（必要なければコメントアウト可）
            if (idx === 0) input.checked = true;
            // 選択肢テキスト
            const span = document.createElement('span');
            span.textContent = optEl.textContent.trim();

            // 組み立て
            label.appendChild(input);
            label.appendChild(span);
            container.appendChild(label);

            // ライト DOM 側の元データは隠しておく
            optEl.hidden = true;
        });

        // Shadow DOM にスタイルとコンテナを追加
        const style = document.createElement('style');
        style.textContent = `
        .radio-group {
          display: flex;         /* 横並びにする */
          gap: 1em;              /* 各項目の間隔 */
        }
        .radio-option {
          cursor: pointer;       /* ホバー時にポインター表示 */
          user-select: none;     /* テキスト選択を防止 */
          display: flex;
          align-items: center;   /* ラベルと input を縦中央揃え */
        }
        .radio-option input {
          margin-right: 0.3em;   /* ラジオボタンとテキストの間隔 */
        }
      `;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);
    }
}

// カスタム要素として登録
window.customElements.define('radio-component', RadioComponent);

