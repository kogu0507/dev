````markdown
# selection-component

`radio-component` および `checkbox-component` は、カード形式でラジオ（単一選択）／チェックボックス（複数選択）のモダンな UI を提供する Web Component です。  
Shadow DOM によるスタイルのカプセル化と、モーダルによる一覧表示機能を備えています。

## ディレクトリ構造

```bash
module/
└── components/
    └── selection-component/
        ├── script.js       # Web Component 実装（ES module）
        ├── style.css       # コンポーネント用スタイル
        └── README.md       # このファイル
````

## インストール／読み込み

### ローカルで直接読み込む場合

```html
<!-- script.js が style.css を自動で読み込みます -->
<script type="module" src="module/components/selection-component/script.js"></script>
```

### npm パッケージ化例

```bash
npm install @your-org/selection-component
```

```js
import 'selection-component'; // package.json の "exports" に script.js を設定
```

## 使い方

HTML に直接タグを記述し、内部に `<div slot="option">` を並べるだけで動作します。

```html
<radio-component>
  <div slot="option" value="option1" description="最初の選択肢です。" checked>
    オプションA
  </div>
  <div slot="option" value="option2" description="便利な機能付き">
    オプションB
  </div>
  <div slot="option" value="option3">
    オプションC
  </div>
</radio-component>

<checkbox-component>
  <div slot="option" value="opt1">選択肢1</div>
  <div slot="option" value="opt2">選択肢2</div>
  <div slot="option" value="opt3">選択肢3</div>
</checkbox-component>
```

## スロットと属性

### `slot="option"` 要素（必須）

* **タグ**：`<div>` 推奨（他の要素でも可）
* **属性**

  * `value`（必須）：選択時に取得される値
  * `description`（任意）：カード下部に表示される説明文
  * `checked`（任意）：初期選択状態にする場合に指定
* **内容**：タグの中身がカードのラベルとして表示される

### コンポーネント本体のスロット（任意）

| slot 名        | 用途            | デフォルトテキスト    |
| ------------- | ------------- | ------------ |
| `title`       | コンポーネント上部の見出し | お好みのオプションを選択 |
| `view-all`    | 「一覧で見る」ボタン    | 一覧で見る        |
| `modal-title` | モーダルの見出し      | 全オプション一覧     |

```html
<radio-component>
  <span slot="title">好きなフードを選んでね</span>
  <span slot="view-all">すべて見る</span>
  <span slot="modal-title">選択肢一覧</span>
  <!-- ...option slot... -->
</radio-component>
```

## カスタマイズ

* **スタイル**
  `style.css` を直接編集、またはビルドパイプラインで Sass/PostCSS などを導入して変数化できます。
* **スクリプト**
  `script.js` 内のロジックを拡張し、カスタムイベント（例：`selection-change`）を発火させるなども可能です。

## ブラウザサポート

* Shadow DOM & Custom Elements に対応したモダンブラウザ
* 必要に応じて [@webcomponents/webcomponentsjs](https://github.com/webcomponents/polyfills) のポリフィルを導入してください

## ライセンス

MIT

```

---

- `<script>` のみ読み込めば内部で `style.css` をフェッチします。  
- スロットと属性を使って自由にカスタマイズ可能です。  
- README に使い方例やスロット一覧を載せておくと、他の開発者にも親切です。
```


























































# `selection-component`0

`radio-component` および `checkbox-component` は、モダンな選択肢UIを提供するWeb Componentです。ラジオボタンやチェックボックスの機能を、カード形式で視覚的に魅力的に表示します。

## ディレクトリ構造

```
module/
└── components/
    └── selection-component/
        ├── script.js
        ├── style.css
        └── README.md
```

## コンポーネント

### `radio-component`

単一選択のオプションを提供します。

### `checkbox-component`

複数選択のオプションを提供します。

## 利用方法

これらのコンポーネントは、HTMLに直接記述することで利用できます。各選択肢は `<div slot="option">` 要素として定義し、その中に表示するテキストを記述します。

### 例

```html
<radio-component>
  <div slot="option" value="option1" description="最初の選択肢です。" checked>オプションA</div>
  <div slot="option" value="option2" description="便利な機能付き">オプションB</div>
  <div slot="option" value="option3" description="おすすめの選択肢。">オプションC</div>
</radio-component>

<checkbox-component>
  <div slot="option" value="opt1">選択肢1</div>
  <div slot="option" value="opt2">選択肢2</div>
  <div slot="option" value="opt3">選択肢3</div>
</checkbox-component>
```

### スロットと属性

各 `<div slot="option">` 要素は、以下の属性をサポートしています。

* **`value` (必須):** 選択された際の値を定義します。
* **`description` (任意):** オプションの下に表示される説明文を定義します。
* **`checked` (任意):** 初期状態で選択されている場合に指定します。

また、コンポーネント自体も以下のスロットをサポートしています。

* **`slot="title"`:** コンポーネントのタイトルをカスタマイズします。デフォルトは「お好みのオプションを選択」です。
* **`slot="view-all"`:** 「一覧で見る」ボタンのテキストをカスタマイズします。デフォルトは「一覧で見る」です。
* **`slot="modal-title"`:** モーダルウィンドウのタイトルをカスタマイズします。デフォルトは「全オプション一覧」です。

## スタイル

コンポーネントのスタイルは、`style.css` に記述されており、カスタマイズ可能です。

## JavaScript

`script.js` にて、`SelectionComponent` クラスが定義されており、`radio-component` と `checkbox-component` がこのクラスを継承しています。

* **`_uid`**: 各コンポーネントに一意なIDを付与するために使用されます。
* **`_initEvents()`**: 「一覧で見る」ボタンのクリックイベントやモーダルの閉じるイベントなどを初期化します。
* **`_renderOptions()`**: `<div slot="option">` 要素からデータを取得し、カード形式のUIとモーダル内のグリッドUIを生成します。
* **`_sync()`**: メインのカード表示とモーダル内の表示で選択状態を同期させます。

---










## 次の作業
style.cssに分離するか検討して、分離するならする。ChatGPTにそうだんかかな。

## 今のコードをめも

```HTML
<!-- 利用例 -->
<radio-component>
  <div slot="option" value="option1" description="最初の選択肢です。" checked>オプションA</div>
  <div slot="option" value="option2" description="便利な機能付き">オプションB</div>
  <div slot="option" value="option3" description="おすすめの選択肢。">オプションC</div>
</radio-component>

<checkbox-component>
  <div slot="option" value="opt1">選択肢1</div>
  <div slot="option" value="opt2">選択肢2</div>
  <div slot="option" value="opt3">選択肢3</div>
</checkbox-component>

<script>
const template = document.createElement('template');
template.innerHTML = `
<style>
.selection-component-container {
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  border:1px solid #e0e0e0; border-radius:8px; padding:15px; margin-bottom:30px;
  background:#fcfcfc; box-shadow:0 4px 10px rgba(0,0,0,0.05);
}
.selection-header {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:15px; gap:10px; flex-wrap:wrap;
}
.selection-title { font-size:1.4em; color:#333; margin:0; }
.view-all-button {
  padding:8px 15px; border:1px solid #ccc; border-radius:5px;
  background:#fff; cursor:pointer; font-size:0.9em; color:#555;
  transition:all 0.3s ease;
}
.view-all-button:hover { background:#f0f0f0; border-color:#aaa; }
.selection-cards-wrapper {
  overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:10px;
}
.selection-cards {
  display:flex; gap:15px; padding:5px; min-width:fit-content;
}
.selection-card {
  flex-shrink:0; width:180px; border:2px solid #ddd; border-radius:8px;
  padding:15px; background:#fff; box-shadow:0 2px 5px rgba(0,0,0,0.05);
  cursor:pointer; transition:all 0.3s ease;
  display:flex; flex-direction:column; justify-content:space-between;
  text-align:center;
}
.selection-card:hover {
  border-color:#a0a0a0; box-shadow:0 4px 8px rgba(0,0,0,0.1);
}
.selection-card-input { display:none; }
.selection-card .card-content {
  flex-grow:1; display:flex; flex-direction:column; justify-content:center;
}
.selection-card span {
  display:block; font-size:1.1em; font-weight:bold;
  color:#444; margin-bottom:5px;
}
.selection-card p {
  font-size:0.85em; color:#666; line-height:1.4; margin-top:0;
}
.selection-card-input:checked + .selection-card {
  border-color:#0073aa; background:#e0f2f7;
  box-shadow:0 4px 8px rgba(0,0,0,0.15); transform:translateY(-2px);
}
.modal-overlay {
  display:none; position:fixed; top:0; left:0; width:100%; height:100%;
  background:rgba(0,0,0,0.6); z-index:1000;
}
.modal-overlay.open {
  display:flex; justify-content:center; align-items:center;
}
.modal-content {
  background:#fff; padding:25px; border-radius:10px;
  box-shadow:0 5px 15px rgba(0,0,0,0.3);
  max-width:90%; max-height:90%; overflow-y:auto; position:relative;
  width:600px;
}
.modal-header {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;
}
.modal-title { font-size:1.5em; margin:0; color:#333; }
.modal-close-button {
  background:none; border:none; font-size:2em; cursor:pointer; color:#888; line-height:1;
}
.modal-close-button:hover { color:#333; }
.modal-grid {
  display:grid; grid-template-columns:repeat(auto-fill, minmax(160px,1fr));
  gap:15px;
}
.modal-grid .selection-card { width:auto; min-height:120px; }
@media (max-width:768px) {
  .selection-header { flex-direction:column; align-items:flex-start; }
  .modal-content { width:95%; padding:20px; }
  .modal-grid { grid-template-columns:repeat(auto-fill, minmax(130px,1fr)); }
}
@media (max-width:480px) {
  .selection-card { width:150px; padding:10px; }
  .selection-card span { font-size:1em; }
  .selection-card p { font-size:0.8em; }
  .modal-grid { grid-template-columns:1fr; }
}
</style>
<div class="selection-component-container">
  <div class="selection-header">
    <h3 class="selection-title">
      <slot name="title">お好みのオプションを選択</slot>
    </h3>
    <button class="view-all-button">
      <slot name="view-all">一覧で見る</slot>
    </button>
  </div>
  <div class="selection-cards-wrapper">
    <div class="selection-cards"></div>
  </div>
</div>
<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title">
        <slot name="modal-title">全オプション一覧</slot>
      </h3>
      <button class="modal-close-button">×</button>
    </div>
    <div class="modal-grid"></div>
    <div style="text-align:right;margin-top:20px">
      <button class="modal-close-button">閉じる</button>
    </div>
  </div>
</div>
`;

class SelectionComponent extends HTMLElement {
  constructor(mode) {
    super();
    this.mode = mode;
    this._uid = Math.random().toString(36).substr(2,9);
    this.attachShadow({mode:'open'}).appendChild(template.content.cloneNode(true));
    this._cards     = this.shadowRoot.querySelector('.selection-cards');
    this._modal     = this.shadowRoot.querySelector('.modal-overlay');
    this._modalGrid = this.shadowRoot.querySelector('.modal-grid');
    this._openBtn   = this.shadowRoot.querySelector('.view-all-button');
    this._closeBtns = this.shadowRoot.querySelectorAll('.modal-close-button');
    this._initEvents();
  }
  connectedCallback() {
    this._renderOptions();
  }
  _initEvents() {
    this._openBtn.addEventListener('click', ()=>this._modal.classList.add('open'));
    this._closeBtns.forEach(b=>b.addEventListener('click', ()=>this._modal.classList.remove('open')));
    this._modal.addEventListener('click', e=>{ if(e.target===this._modal) this._modal.classList.remove('open'); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') this._modal.classList.remove('open'); });
  }
  _renderOptions() {
    this._cards.innerHTML = '';
    this._modalGrid.innerHTML = '';
    const mainName = `sel-${this._uid}`, modName = `selMod-${this._uid}`;
    this.querySelectorAll('[slot="option"]').forEach((o,i) => {
      const val  = o.getAttribute('value') || i;
      const txt  = o.textContent.trim();
      const desc = o.getAttribute('description') || '';
      const chk  = o.hasAttribute('checked');
      const id1  = `i-${this.mode}-${val}-${this._uid}`;
      const id2  = `m-${id1}`;
      const ip1  = document.createElement('input');
      ip1.type   = this.mode;
      ip1.id     = id1;
      ip1.name   = mainName;
      ip1.value  = val;
      if(chk) ip1.checked = true;
      ip1.classList.add('selection-card-input');
      const lb1  = document.createElement('label');
      lb1.htmlFor = id1;
      lb1.classList.add('selection-card');
      lb1.innerHTML = `<div class="card-content"><span>${txt}</span>${desc?`<p>${desc}</p>`:''}</div>`;
      this._cards.append(ip1, lb1);
      const ip2 = ip1.cloneNode();
      ip2.id    = id2;
      ip2.name  = modName;
      const lb2 = lb1.cloneNode(true);
      lb2.htmlFor = id2;
      this._modalGrid.append(ip2, lb2);
    });
    this._sync();
  }
  _sync() {
    const ms = [...this._cards.querySelectorAll('input')];
    const md = [...this._modalGrid.querySelectorAll('input')];
    ms.forEach((m,i) => m.onchange = () => {
      if(this.mode==='radio') ms.forEach((x,j)=>md[j].checked = x.checked);
      else md[i].checked = m.checked;
    });
    md.forEach((m,i) => m.onchange = () => {
      if(this.mode==='radio') md.forEach((x,j)=>ms[j].checked = x.checked);
      else ms[i].checked = m.checked;
    });
  }
}

customElements.define('radio-component',   class extends SelectionComponent{ constructor(){ super('radio'); } } );
customElements.define('checkbox-component',class extends SelectionComponent{ constructor(){ super('checkbox'); } } );
</script>

```
