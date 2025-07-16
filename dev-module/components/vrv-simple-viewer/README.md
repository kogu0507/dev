# vrv-simple-viewer

`vrv-simple-viewer` は、VerovioToolkit を使って MEI データを手軽に SVG 表示できる Web コンポーネントです。小節や音符を `<script type="application/mei+xml">` 内に記述し、メタ情報を `data-` 属性で指定するだけで、あらゆるページに組み込めます。

---

## 特長

* **簡単組み込み**: HTML に CSS と JS を追加するだけ。Webpack やビルド構成は不要。
* **プリセット対応の楽譜定義**: `treble`, `bass`, `grand`, `alto`, `tenor` の五線定義を内蔵。属性で切り替えるだけ。
* **柔軟な拍子・調号・テンポ設定**: `data-meter`／`data-meter-count`・`data-meter-unit`・`data-key-signature`・`data-tempo` 属性を自由に指定。
* **Blob URL ワークアラウンド**: MEI を文字列から直接生成し、既存の `displaySvgFromUrl` API をそのまま流用。
* **テーマフリー**: SVG なので CSS でサイズ・色・余白を自在にカスタマイズ可能。

---

## ファイル構成

```
vrv-simple-viewer/
├── index.html        # サンプルページ
├── style.css         # 基本スタイル
└── script.js         # 初期化ロジック (ESM モジュール)
```

---

## セットアップ

1. リポジトリをクローン／ダウンロード
2. `index.html` と同階層に `style.css` と `script.js` を配置
3. `index.html` をブラウザで開くだけで動作します

```bash
git clone https://github.com/yourname/vrv-simple-viewer.git
cd vrv-simple-viewer
type index.html  # Windows
open index.html  # macOS/Linux
```

---

## 使い方

### 1. `<head>` にスタイルを読み込む

```html
<link rel="stylesheet" href="style.css">
```

### 2. 表示箇所にコンポーネントを追加

```html
<div class="vrv-simple-viewer"
     data-score-def-preset="treble"
     data-key-signature="2f"
     data-meter="sym='common'"
     data-tempo="120">
  <script type="application/mei+xml" data-mei-section="content">
    <measure n="1" right="dbl">
      <staff n="1"><layer n="1">
        <!-- 音符データ -->
      </layer></staff>
    </measure>
  </script>
</div>
```

### 3. ページ下部で ESM モジュールを読み込む

```html
<script type="module" src="script.js"></script>
```

これだけで `<div>` 内に SVG 楽譜が描画されます。

---

## 属性一覧

| 属性                                 | 型      | 説明                                                                               |
| ---------------------------------- | ------ | -------------------------------------------------------------------------------- |
| data-score-def-preset              | string | 楽譜定義プリセット（`treble,bass,grand,alto,tenor` のいずれか、複数カンマ区切り可）                        |
| data-key-signature                 | string | 調号（例: `2f` = 2つの♭）                                                               |
| data-meter                         | string | 拍子定義（例: `sym='common'`, `form='cut'`, `count='3' unit='8' form='num'` など MEI 準拠） |
| data-meter-count / data-meter-unit | number | 数値型の拍子指定（`data-meter` 未指定時のみ有効）                                                  |
| data-tempo                         | number | BPM（例: `120`）                                                                    |

---

## Content セクション

楽譜本体は必ず以下のタグで囲んでください。

```html
<script type="application/mei+xml" data-mei-section="content">
  <!-- <measure> や <note> を記述 -->
</script>
```

`data-mei-section="content"` がないと、スクリプトで読み取られません。

---

## カスタマイズ

* CSS で `.vrv-simple-viewer svg` の幅・高さを指定してレスポンシブ対応可能。
* `script.js` 内でロード済みの `mgr.setRenderOptions()` を呼ぶことで、高解像度オプションやモバイル用オプションを適用できます。

```js
mgr.setRenderOptions({ scale: 120, pageWidth: 2000 });
```

---

## 依存

* VerovioManager v2.4.3 (jsDelivr CDN)
* VerovioToolkit WASM (自動ロード)

---

## ライセンス

MIT

---

## 貢献

1. Fork
2. ブランチ作成 (`git checkout -b feature/...`)
3. コミット
4. PR を送信

ご要望・不具合報告は Issues へお願いします。
