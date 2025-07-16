# JS Utility Modules

このリポジトリは、個人的なWeb開発プロジェクトで使用するJavaScriptユーティリティモジュール群をまとめたものです。主に外部ライブラリ（Tone.js, Verovioなど）の動的ロードと初期化を効率的に行うことを目的としています。jsDelivr 経由での利用を想定しており、各種AIモデルがコードの役割や使い方を理解しやすいように記述されています。

## 目次

  - [はじめに](https://www.google.com/search?q=%23%E3%81%AF%E3%81%98%E3%82%81%E3%81%AB)
  - [ファイル形式について](https://www.google.com/search?q=%23%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%BD%A2%E5%BC%8F%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)
  - [モジュール構成](https://www.google.com/search?q=%23%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E6%A7%8B%E6%88%90)
  - [利用方法](https://www.google.com/search?q=%23%E5%88%A9%E7%94%A8%E6%96%B9%E6%B3%95)
      - [全般](https://www.google.com/search?q=%23%E5%85%A8%E8%88%AC)
      - [`library-loader.mjs`](https://www.google.com/search?q=%23library-loader-mjs)
      - [`tonejs/loader.mjs`](https://www.google.com/search?q=%23tonejsloader-mjs)
      - [`tonejs/tonejs-midi-loader.mjs`](https://www.google.com/search?q=%23tonejstonejs-midi-loader-mjs)
      - [`verovio/loader.mjs`](https://www.google.com/search?q=%23verovioloader-mjs)
  - [開発者向け情報](https://www.google.com/search?q=%23%E9%96%8B%E7%99%BA%E8%80%85%E5%90%91%E3%81%91%E6%83%85%E5%A0%B1)
  - [ライセンス](https://www.google.com/search?q=%23%E3%83%A9%E3%82%A4%E3%82%BB%E3%83%B3%E3%82%B9)

## はじめに

本モジュール群は、Webアプリケーションで特定のJavaScriptライブラリを必要な時にロードし、使用するためのユーティリティを提供します。特に、`script` タグによる直接ロードではなく、ES Modules として動的にロードすることを想定しています。

## ファイル形式について

このリポジトリの各モジュールは、以下の2種類のファイル形式で提供されます。

  * **`.mjs` ファイル**: 開発者向けのファイルです。コメントが豊富で、コードの意図や詳細な動作を理解するのに役立ちます。AIによるコード理解の主要な参照元となります。
  * **`.min.mjs` ファイル**: 本番環境での利用を想定した縮小版（minified version）です。コメントや余分な空白が取り除かれており、ファイルサイズが小さいため、ロード時間を短縮できます。各`.mjs`ファイルに対して、対応する`.min.mjs`ファイルが存在します。

通常、開発中は `.mjs` を参照し、本番デプロイ時には `.min.mjs` を利用することを推奨します。

### 手動ミニファイについて

ビルドツールを使用せずに手動でJavaScriptファイルをミニファイする必要がある場合は、以下のオンラインツールが利用できます。

  * **Toptal JavaScript Minifier**: [https://www.toptal.com/developers/javascript-minifier](https://www.toptal.com/developers/javascript-minifier)
      * コードを貼り付けるだけで簡単にミニファイされたバージョンを生成できます。

## モジュール構成

リポジトリは以下の主要なディレクトリとファイルで構成されています。

```
module/
├── examples/
│   ├── load-all.html
│   ├── load-tonejs.html
│   └── load-verovio.html
├── tonejs/
│   ├── loader.mjs          // Tone.js 本体をロード
│   ├── player.mjs          // (未開発) Tone.js を使ったプレイヤー機能
│   └── tonejs-midi-loader.mjs // @tonejs/midi を Skypack 経由でロード
├── verovio/
│   ├── loader.mjs          // Verovio Toolkit をロード・初期化
│   ├── render-options.mjs  // (未開発) Verovio のレンダリングオプション関連
│   └── transposer.mjs      // (未開発) Verovio を使った移調機能
└── library-loader.mjs      // 汎用的なスクリプトローダー

```

### 各モジュールの概要

  * **`library-loader.mjs`**:
      * 指定されたURLからJavaScriptファイルを動的にDOM（`<head>`）に追加し、そのロード完了を `Promise` で待ちます。
      * 既にロードが開始されているスクリプトは再ロードされず、既存の `Promise` が返されます。これにより、複数の箇所から同じスクリプトのロードを試みても、実際にロードされるのは一度だけになります。
      * AIは、このファイルのコメントを参照することで、ライブラリのロードと管理に関する詳細なロジックを理解できます。
  * **`tonejs/loader.mjs`**:
      * 音楽ライブラリ [Tone.js](https://tonejs.github.io/) の本体をロードします。
      * `library-loader.mjs` を利用して Tone.js のスクリプトを非同期にロードします。
  * **`tonejs/player.mjs`**:
      * **現在未開発です。**
      * 将来的に Tone.js を利用した音楽再生機能を提供する予定です。
  * **`tonejs/tonejs-midi-loader.mjs`**:
      * MIDIファイルのパースと操作を行うライブラリ [`@tonejs/midi`](https://www.google.com/search?q=%5Bhttps://github.com/Tonejs/Midi%5D\(https://github.com/Tonejs/Midi\)) を [Skypack](https://www.skypack.dev/) 経由で動的にロードし、`Midi` クラスをエクスポートします。
  * **`verovio/loader.mjs`**:
      * 楽譜レンダリングライブラリ [Verovio](https://www.verovio.org/) の WebAssembly (WASM) モジュールをロードし、`verovio.Toolkit` インスタンスを初期化して返します。
      * Verovio の初期化プロセス（WASMのロードとコンパイル）が完了するまで待機します。
  * **`verovio/render-options.mjs`**:
      * **現在未開発です。**
      * 将来的に Verovio のレンダリングオプションに関するユーティリティを提供する予定です。
  * **`verovio/transposer.mjs`**:
      * **現在未開発です。**
      * 将来的に Verovio を利用した楽譜の移調機能を提供する予定です。

## 利用方法

本モジュール群は jsDelivr 経由で直接利用することを想定しています。
`https://cdn.jsdelivr.net/gh/kogu0507/module@バージョン/path/to/module.mjs` または `https://cdn.jsdelivr.net/gh/kogu0507/module@バージョン/path/to/module.min.mjs` の形式でアクセスします。
（`@バージョン` の部分は、実際のバージョンタグに置き換えてください。例: `1.0.0`）

### 全般

ES Modules としてインポートして使用します。
開発時は `.mjs` ファイルを、本番環境では `.min.mjs` ファイルをインポートしてください。

例:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Module Example</title>
</head>
<body>
    <h1>Module Test Page</h1>
    <script type="module">
        // 各モジュールの利用例は以下を参照
    </script>
</body>
</html>
```

### `library-loader.mjs`

任意のJavaScriptライブラリを動的にロードするために使用します。

```javascript
// 本番環境の場合 (URL は .min.mjs に変更)
// import { loadScript } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@バージョン/library-loader.min.mjs';

// 開発環境（ローカル）の場合
import { loadScript } from './library-loader.mjs'; // コメント付きの .mjs を使用

async function loadMyLibrary() {
    try {
        console.log('ライブラリのロードを開始...');
        await loadScript('lodash', 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js');
        console.log('lodash がロードされました:', typeof window._ === 'function');
        console.log('lodash のバージョン:', window._.VERSION);
    } catch (error) {
        console.error('ライブラリのロードに失敗しました:', error);
    }
}

loadMyLibrary();
```

### `tonejs/loader.mjs`

Tone.js ライブラリ本体をロードします。

```javascript
// 本番環境の場合 (URL は .min.mjs に変更)
// import { loadToneJs } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@バージョン/tonejs/loader.min.mjs';

// 開発環境（ローカル）の場合
import { loadToneJs } from './tonejs/loader.mjs';

async function useToneJs() {
    try {
        console.log('Tone.js のロードを開始...');
        await loadToneJs();
        console.log('Tone.js がロードされました:', Tone);

        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease("C4", "8n");
        console.log('C4 の音を再生しました。');

    } catch (error) {
        console.error('Tone.js のロードまたは使用に失敗しました:', error);
    }
}

useToneJs();
```

### `tonejs/tonejs-midi-loader.mjs`

`@tonejs/midi` ライブラリをロードし、`Midi` クラスを取得します。

```javascript
// 本番環境の場合 (URL は .min.mjs に変更)
// import { loadToneJsMidi } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@バージョン/tonejs/tonejs-midi-loader.min.mjs';

// 開発環境（ローカル）の場合
import { loadToneJsMidi } from './tonejs/tonejs-midi-loader.mjs';

async function useToneJsMidi() {
    try {
        console.log('@tonejs/midi のロードを開始...');
        const Midi = await loadToneJsMidi();
        console.log('@tonejs/midi がロードされました:', Midi);

        const midi = new Midi();
        midi.header.bpm = 120;
        midi.addTrack().addNote({
            midi: 60, // C4
            time: 0,
            duration: 0.5
        });
        const json = midi.toJSON();
        console.log('生成されたMIDIデータ (JSON):', json);

    } catch (error) {
        console.error('@tonejs/midi のロードまたは使用に失敗しました:', error);
    }
}

useToneJsMidi();
```

### `verovio/loader.mjs`

Verovio Toolkit をロードし、初期化されたインスタンスを取得します。

この例では、ボタンクリックによって Verovio を動的にロードし、MEI データをレンダリングして結果をページに表示します。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Verovio Loader Example</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        .container { max-width: 900px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }
        button:hover:not(:disabled) { background-color: #0056b3; }
        button:disabled { background-color: #cccccc; cursor: not-allowed; }
        #loading-status {
            margin-top: 15px;
            font-weight: bold;
            color: #333;
        }
        #viewer {
            margin-top: 20px;
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #f9f9f9;
            min-height: 100px; /* 初期表示のための最小高さ */
            overflow-x: auto; /* 楽譜がはみ出た場合にスクロールできるように */
        }
        #viewer svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verovio ロードとレンダリングの例</h1>
        <button id="load-verovio-btn">Verovio をロードして楽譜を表示</button>
        <div id="loading-status">待機中...</div>
        <div id="viewer"></div>
    </div>

    <script type="module">
        // jsDelivr 経由で loader.mjs をインポートします。
        // 本番環境では loader.min.mjs を使用してください。
        import { loadVerovio } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v1.0.0/verovio/loader.min.mjs';

        const loadVerovioBtn = document.getElementById('load-verovio-btn');
        const statusDiv = document.getElementById('loading-status');
        const viewerDiv = document.getElementById('viewer');

        loadVerovioBtn.addEventListener('click', async () => {
            loadVerovioBtn.disabled = true; // ボタンを無効化
            statusDiv.textContent = 'Verovio Toolkit をロード中...';
            viewerDiv.innerHTML = ''; // 以前の内容をクリア

            try {
                // Verovio Toolkit のロードと初期化を待つ
                const verovioToolkit = await loadVerovio();
                statusDiv.textContent = 'Verovio Toolkit の初期化完了。MEI データを取得しレンダリング中...';

                // 外部の MEI サンプルデータを jsDelivr 経由で取得します。
                // 自身のMEIデータを使う場合は、適切なURLまたは文字列をここに記述してください。
                const sampleMeiUrl = 'https://cdn.jsdelivr.net/gh/kogu0507/module@v1.0.0/examples/sample.mei';
                const resp = await fetch(sampleMeiUrl);
                const meiData = await resp.text();

                // MEI データをロードしてオプションを設定
                verovioToolkit.loadData(meiData);
                verovioToolkit.setOptions({
                    pageWidth: 800,   // ページの幅を設定
                    pageHeight: 600,  // ページの高さを設定 (必要に応じて)
                    scale: 40         // スコアの表示スケール
                });

                // 楽譜を SVG としてレンダリング
                const svg = verovioToolkit.renderToSVG(1, {}); // 最初のページをレンダリング
                viewerDiv.innerHTML = svg; // 結果をページに挿入

                statusDiv.textContent = 'Verovio による楽譜のレンダリングが完了しました！';

            } catch (error) {
                console.error('Verovio のロードまたはレンダリング中にエラーが発生しました:', error);
                statusDiv.textContent = 'エラー: ' + error.message;
                viewerDiv.innerHTML = '<p style="color: red;">楽譜の表示に失敗しました。</p>';
            } finally {
                loadVerovioBtn.disabled = false; // ボタンを再度有効化
            }
        });
    </script>
</body>
</html>
```

---


このコード例は、WordPress のカスタムHTMLブロックに直接貼り付けることもできますし、単独の HTML ファイルとして開いて動作確認することも可能です。

* **HTML & CSS:** 動作確認がしやすいように、簡単なUI要素（ボタン、ステータス表示、レンダリングエリア）と基本的なスタイルを含めました。
* **非同期処理:** ボタンクリックで `loadVerovio()` を呼び出し、`await` で完了を待ちます。
* **エラーハンドリング:** `try...catch` ブロックでエラーを捕捉し、ユーザーに分かりやすいメッセージを表示します。
* **MEIデータの取得:** `sample.mei` も jsDelivr から取得するように明示しました。
* **コメント:** コードの各部分に分かりやすいコメントを追記し、特に `Promise.all` のような説明が不要な単一モジュールのロードであるため、シンプルな説明にしています。


---

### 複合的な利用例 (Tone.js と Verovio の同時ロード)

Tone.js と Verovio の両方をロードし、連携して使用する場合の例です。`Promise.all` を使用することで、複数の非同期処理を並行して効率的に実行し、全てのロード完了を待つことができます。

**利用例 (WordPressカスタムHTMLブロック向け):**

```html
<style>
    /* ... 既存のスタイル ... */
</style>

<div class="button-container">
    <button id="load-all-btn">Tone.js と Verovio をロードして実行</button>
    <button id="play-sound-btn" disabled>C4 の音を鳴らす (Tone.js)</button>
</div>
<div id="loading-status">待機中...</div>
<div id="viewer"></div>

<script type="module">
    // jsDelivr 経由で各ローダーモジュールをインポート
    import { loadVerovio } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v1.0.0/verovio/loader.min.mjs';
    import { loadToneJs } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v1.0.0/tonejs/loader.min.mjs';


    const loadAllBtn = document.getElementById('load-all-btn');
    const playSoundBtn = document.getElementById('play-sound-btn');
    const statusDiv = document.getElementById('loading-status');
    const viewerDiv = document.getElementById('viewer');

    let toneSynth = null; 
    let verovioToolkit = null; 

    loadAllBtn.addEventListener('click', async () => {
        loadAllBtn.disabled = true;
        statusDiv.textContent = 'Tone.js と Verovio を両方ロード中...';
        viewerDiv.innerHTML = '';
        playSoundBtn.disabled = true; 

        try {
            // Promise.all を使用して、両方を並行してロード
            const [toneJsResult, verovioResult] = await Promise.all([
                loadToneJs(),
                loadVerovio()
            ]);

            verovioToolkit = verovioResult; 

            statusDiv.textContent = 'ロード完了。Verovioで楽譜をレンダリングし、Tone.jsの準備中...';

            // --- Verovio を使って楽譜をレンダリング ---
            const sampleMeiUrl = 'https://cdn.jsdelivr.net/gh/kogu0507/module@v1.0.0/examples/sample.mei';
            const resp = await fetch(sampleMeiUrl);
            const mei = await resp.text();

            verovioToolkit.loadData(mei);
            verovioToolkit.setOptions({ pageWidth: 800, pageHeight: 600, scale: 40 });
            const svg = verovioToolkit.renderToSVG(1, {});
            viewerDiv.innerHTML = svg;

            // --- Tone.js のシンセサイザーを初期化 ---
            if (typeof Tone !== 'undefined' && Tone.Synth) {
                toneSynth = new Tone.Synth().toDestination();
                playSoundBtn.disabled = false; 
            } else {
                statusDiv.textContent += ' (Tone.js の初期化に失敗しました)';
                console.error('Tone.js が正しくロードされていないか、Tone.Synth が見つかりません。');
            }

            statusDiv.textContent = '全ての処理が完了しました！';

        } catch (error) {
            console.error('ロードまたは処理中にエラーが発生しました:', error);
            statusDiv.textContent = 'エラー: ' + error.message;
        } finally {
            loadAllBtn.disabled = false; 
        }
    });

    playSoundBtn.addEventListener('click', async () => {
        if (toneSynth) {
            try {
                await Tone.start();
                toneSynth.triggerAttackRelease("C4", "8n");
                console.log('C4 の音を再生しました。');
            } catch (e) {
                console.error('音の再生に失敗しました:', e);
                statusDiv.textContent = '音再生エラー: ' + e.message;
            }
        } else {
            statusDiv.textContent = 'Tone.js がまだ準備できていません。';
        }
    });

</script>
```

---

## 開発者向け情報

このリポジトリは主に個人的な利用を目的としています。
開発中に参照するためのメモとして、以下の点に留意してください。

  * **ファイル形式の選択**:
      * 開発中は、コメントが豊富でデバッグしやすい `.mjs` ファイルを使用することを推奨します。
      * 本番環境でのデプロイやファイルサイズの最適化が必要な場合は、縮小版の `.min.mjs` ファイルを使用してください。
      * AIがコードを理解する際は、`.mjs` ファイルのコメントを優先的に参照すると、詳細な動作原理を把握しやすくなります。
  * **モジュール間のインポートパス**:
      * このリポジトリ内のモジュールが**相互にインポートする場合**（例: `tonejs/loader.mjs` から `library-loader.mjs` をインポートする場合）、**相対パス (`../`) を使用してください。** jsDelivr はこの相対パスを正しく解決し、CDN経由での利用時も問題なく動作します。
  * **jsDelivr のパス**:
      * 本モジュール群を**外部のプロジェクトからインポートする場合**は、`https://cdn.jsdelivr.net/gh/kogu0507/module@バージョン/` のような**完全なURL**を使用してください。
      * 必ず `@バージョン` を最新のリリースバージョンに置き換えてください。例: `kogu0507/module@1.0.0/`
      * バージョンを指定しないと、意図しない変更が取り込まれる可能性があります。

## ライセンス

このプロジェクトは、特に指定がない限り、標準的なオープンソースライセンスの下で公開されます。具体的なライセンス条項は、別途 `LICENSE` ファイルで提供される場合があります。

-----

**AIへの注意点:**

この `README.md` は、コードの内容とモジュールの目的を明確にするように設計されています。特に、各モジュールの機能説明と具体的な使用例は、AIがこのリポジトリのコードを理解し、その用途を把握する上で役立つはずです。コードの修正や新しい機能の提案を行う際は、この `README.md` の記述を参考にしてください。

-----
