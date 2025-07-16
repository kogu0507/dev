# Verovio モジュール群

Web アプリケーションで Verovio Toolkit を簡単かつ柔軟に利用するためのモジュール集です。各責務を分離し、ビルド後は `.min.js` ファイルを配布できる構成になっています。

---

## 目的

* WASM ローダーの抽象化 (loader.min.js)
* MEI → SVG/MIDI 変換ロジックの提供 (core-processor.min.js)
* DOM 操作による楽譜表示およびローディング/エラー管理 (score-ui-handler.min.js)
* MEI の移調機能 (transposer.min.js)
* レンダリングオプションのプリセット集 (render-options.js)
* 高レベル API (`VerovioManager`) による統合利用 (verovio-manager.min.js)

---

## ディレクトリ構成

```
module/
├── verovio/
│   ├── loader.min.js               # WASM ローダー
│   ├── core-processor.min.js       # MEI → SVG/MIDI 変換ロジック
│   ├── score-ui-handler.min.js     # DOM 操作による表示管理
│   ├── transposer.min.js           # MEI 移調機能
│   ├── render-options.js           # レンダリングオプションプリセット
│   └── verovio-manager.min.js      # 高レベル API（Facade）
└── examples/
    └── 20250704-test.html          # 確認用テストページ
```

ビルド前は `module/verovio/*.js`、ビルド後は同名の `.min.js` が生成されます。

---

## モジュール一覧

### loader.min.js

* **責務**: Verovio の WASM スクリプトを動的読み込みし、`Toolkit` インスタンスを返します。
* **特徴**: キャッシュ保持、タイムアウト/ポーリング、オプション引数で URL・タイムアウト設定可能。

### core-processor.min.js

* **責務**: Verovio Toolkit を使い、MEI → SVG/MIDI 変換を行います。
* **主なメソッド**:

  * `renderSvgFromUrl(url, { page, measureRange })`
  * `renderSvgFromMei(meiString, { page, measureRange })`
  * `renderMidiFromUrl(url)`
  * `renderMidiFromMei(meiString)`
  * `getPageCount()`

### score-ui-handler.min.js

* **責務**: DOM 操作で SVG 挿入、ローディング/エラー表示を管理。
* **主なメソッド**:

  * `showLoading(elementId)`, `hideLoading(elementId)`
  * `displaySvg(svgString, elementId)`
  * `showError(message, elementId)`

### transposer.min.js

* **責務**: MEI データを指定半音で移調し、移調後の MEI を取得します。
* **主なメソッド**:

  * `transposeMei(meiString, semitones)` → `Promise<string>`

### render-options.js

* **責務**: CoreProcessor に渡すレンダリングオプションのプリセット集。
* **プリセット**:

  * `defaultOptions`, `highResOptions`, `mobileOptions`, `printOptions`, `svgViewBox`

### verovio-manager.min.js

* **責務**: 上記モジュールを統合し、簡単に利用できる高レベル API を提供。
* **主なメソッド**:

  * `initialize()` → `Promise<void>`
  * `setRenderOptions(options)`
  * `displaySvgFromUrl(meiUrl, elementId, options)`
  * `displayTransposedSvgFromUrl(meiUrl, elementId, semitones, options)`
  * `getMidiFromUrl(meiUrl, options)`

---

## 使用例

```js
import { VerovioManager } from './module/verovio/verovio-manager.min.js';
import { defaultOptions } from './module/verovio/render-options.js';

(async () => {
  const manager = new VerovioManager();
  await manager.initialize();
  manager.setRenderOptions(defaultOptions);

  // MEI → SVG 表示
  await manager.displaySvgFromUrl(
    'path/to/score.mei',
    'score-container',
    { page: 1, measureRange: '1-5' }
  );

  // 移調表示 (半音 +2)
  await manager.displayTransposedSvgFromUrl(
    'path/to/score.mei',
    'score-container',
    2,
    { page: 1, measureRange: 'start-end' }
  );

  // MIDI データ取得
  const midiBuffer = await manager.getMidiFromUrl('path/to/score.mei');
  // Blob → ダウンロードや再生に利用
})();
```

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { VerovioManager } from './module/verovio/verovio-manager.min.js';
    (async () => {
      const manager = new VerovioManager();
      await manager.initialize();
      await manager.displaySvgFromUrl('path/to/sample.mei', 'score-container');
    })();
  </script>
</head>
<body>
  <div id="score-container"></div>
</body>
</html>
```

---

## CDN(jsDelivr) での読み込み例

```html
<script type="module">
  import { VerovioManager } from
    'https://cdn.jsdelivr.net/gh/<ユーザー名>/<リポジトリ名>@<version>/module/verovio/verovio-manager.min.js';

  (async () => {
    const manager = new VerovioManager();
    await manager.initialize();
    await manager.displaySvgFromUrl('path/to/score.mei', 'score-container');
  })();
</script>
```

---

## ビルド

```bash
# 開発サーバー起動
npm run start

# 本番ビルド: dev-module → module/*.min.js
npm run build
```

---

## ライセンス

MIT © あなたの名前
