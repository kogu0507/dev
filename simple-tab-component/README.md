
## simple-tab-component/README.md

```markdown
# シンプルタブコンポーネント v2.0

Vanilla JavaScript & CSS で実装した、アクセシビリティ／複数インスタンス／ディープリンク対応のタブコンポーネントです。

## 目次

- [特徴](#特徴)
- [ファイル構成](#ファイル構成)
- [使い方](#使い方)
- [オプション (data属性)](#オプション-data属性)
- [アクセシビリティ](#アクセシビリティ)
- [ライセンス](#ライセンス)

---

## 特徴

- **バニラJS**: ライブラリ・フレームワーク不要  
- **アクセシビリティ**: `role`／`aria-*`／キーボード操作対応  
- **複数インスタンス**: ページ内に何個でも配置可能  
- **ディープリンク**: URLハッシュでタブを指定・同期  
- **カスタマイズ性**: CSSカスタムプロパティ／data属性で動作制御  

---

## ファイル構成

```

simple-tab-component/
├── index.html    # サンプルページ
├── script.js     # タブロジック (IIFE + クラス)
├── style.css     # スタイル (カスタムプロパティ対応)
└── README.md     # 本ドキュメント

````

---

## 使い方

1. `simple-tab-component/` フォルダをプロジェクトへコピー  
2. HTMLに以下のように記述し、`style.css` と `script.js` へのパスを調整  

   ```html
   <div class="simple-tab-component-container" data-default-tab="初期タブID" data-deep-link="true">
     <div class="tabs">
       <button class="tab-button" data-tab="tab1">タブ1</button>
       <button class="tab-button" data-tab="tab2">タブ2</button>
     </div>
     <div class="tab-content">
       <div id="tab1" class="tab-pane">...</div>
       <div id="tab2" class="tab-pane">...</div>
     </div>
   </div>
   <script src="path/to/simple-tab-component/script.js"></script>
````

---

## オプション (data属性)

* `data-default-tab="tabId"`: 初回表示するタブIDを指定
* `data-deep-link="false"`: URLハッシュによる切り替えを無効化（デフォルトは `true`）

---

## アクセシビリティ

* タブボタンに自動で `role="tab"`, `aria-selected`, `tabindex` 設定
* コンテナに `role="tablist"`
* パネルに `role="tabpanel"`, `aria-labelledby`
* キーボード: ←→／Home／End で移動

---

## ライセンス

MIT ライクに自由にお使いください。

```

---
