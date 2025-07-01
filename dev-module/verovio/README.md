# Verovio モジュール群

このリポジトリでは、Verovio Toolkit を Web アプリケーションで簡単かつ柔軟に利用できるように、責務ごとに分離したモジュール群を提供します。

---

## 目的

* Verovio Toolkit の初期化／ロード処理を抽象化
* MEI データの SVG／MIDI 生成ロジックを提供
* DOM 操作による楽譜表示およびエラー／ローディング管理
* 楽譜データの移調機能
* 各機能を統合した高レベル API で簡単に利用可能に
* レンダリングオプションのプリセット集で設定切り替えを容易に

---

## ディレクトリ構成

```
dev-module/
├── verovio/
│   ├── loader.js              # WASM ローダー
│   ├── core-processor.js      # MEI → SVG/MIDI 変換ロジック
│   ├── score-ui-handler.js    # DOM 操作による表示管理
│   ├── transposer.js          # MEI 移調機能
│   ├── render-options.js      # レンダリングオプションプリセット
│   └── verovio-manager.js     # 高レベル API（統合ファサード）
└── examples/
    ├── verovio-loader.html
    ├── core-processor-test.html
    ├── score-ui-handler-test.html
    ├── verovio-manager-test.html
    └── render-options-test.html
```

本番用ビルド時には `dev-module/` から `module/` へ `.min.js` 版を出力し、適宜パスを更新してください。

---

## モジュール一覧

### loader.js

* **責務**: Verovio の WASM スクリプトを動的に読み込み、オンランタイム初期化完了後に `Toolkit` インスタンスを返却します。
* **特徴**: キャッシュ保持、タイムアウト／ポーリング対応、オプション引数で URL・タイムアウト時間を変更可能。

### core-processor.js

* **責務**: Verovio Toolkit を使い、MEI → SVG／MIDI 変換を行います。
* **機能**:

  * `renderSvgFromUrl(url)`, `renderSvgFromMei(meiData)`
  * `renderMidiFromUrl(url)`, `renderMidiFromMei(meiData)`
  * `getPageCount()`

### score-ui-handler.js

* **責務**: DOM 操作で SVG 表示、ローディング表示、エラー表示を管理。
* **機能**:

  * `showLoading(elementId)`, `hideLoading(elementId)`
  * `displaySvg(svgString, elementId)`
  * `showError(message, elementId)`

### transposer.js

* **責務**: MEI データを半音または音楽的インターバル／トニック指定で移調。
* **機能**:

  * `transposeMei(meiData, semitonesOrString)`（数値または文字列で指定）

### render-options.js

* **責務**: コアレンダラー用のオプションプリセット集。
* **プリセット**:

  * `defaultOptions`, `highResOptions`, `mobileOptions`, `printOptions`

### verovio-manager.js

* **責務**: 上記モジュールを統合し、外部から簡単に利用できるファサードを提供。
* **機能**:

  * `initialize()` でロード・初期化
  * `setRenderOptions(options)`
  * `displayMeiOnElement(url, elementId)`
  * `displayTransposedMeiOnElement(url, elementId, semitonesOrString)`
  * `getMidiFromMei(url)`

---

## 使用例

以下のコードは、`VerovioManager` のインスタンスを作成すれば、
今回のモジュール群で提供される全機能を簡単に呼び出せる例です。

```js
import { VerovioManager } from './module/verovio/verovio-manager.min.js';

const manager = new VerovioManager();

// 1. 初期化（Toolkit のロード）
await manager.initialize();

// 2. オプション設定（必要に応じて）
manager.setRenderOptions({ pageWidth: 800, scale: 70 });

// 3. MEI → SVG 表示
await manager.displayMeiOnElement('path/to/score.mei', 'score-container');

// 4. 移調表示（例：長2度上）
await manager.displayTransposedMeiOnElement(
  'path/to/score.mei',
  'score-container',
  'M2'
);

// 5. MIDI データ取得
const midiArrayBuffer = await manager.getMidiFromMei('path/to/score.mei');
```

```htmlhtml
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { VerovioManager } from './module/verovio/verovio-manager.min.js';

    const manager = new VerovioManager();
    const meiUrl = 'path/to/sample.mei';
    const containerId = 'score-container';

    await manager.initialize();
    await manager.displayMeiOnElement(meiUrl, containerId);
    // manager.displayTransposedMeiOnElement(meiUrl, containerId, 'M2');
  </script>
</head>
<body>
  <div id="score-container"></div>
</body>
</html>
```

---

### CDN (jsDelivr) での読み込み例

npm パッケージや GitHub リポジトリが公開されている場合、jsDelivr を利用して直接モジュールを読み込むこともできます。
バージョン部分 (`@<version>`) は実際のリリースタグやコミット SHA に置き換えてください。

```html
<script type="module">
  import { VerovioManager } from 
    'https://cdn.jsdelivr.net/gh/<ユーザー名>/<リポジトリ名>@<version>/module/verovio/verovio-manager.min.js';

  (async () => {
    const manager = new VerovioManager();
    await manager.initialize();
    await manager.displayMeiOnElement('path/to/score.mei', 'score-container');
  })();
</script>
```

## ビルド

```bash
# 開発モードで単一ファイルを動作確認
npm run start

# 本番ビルド: dev-module/*.js → module/*.min.js
npm run build
```

---

## ライセンス

MIT © あなたの名前
