# Music Notation Formatter (`music-notation-formatter.mjs`)

`music-notation-formatter.mjs` は、Webページ上の音楽関連テキストを、美しく整形された音楽記号（シャープ、フラットなど）を含むHTMLに変換するためのJavaScriptモジュールです。

このモジュールは、通常のテキスト形式で記述された音名、調名、コードネームなどを、視覚的に優れた音楽記号フォント（例: **Noto Music**）と組み合わせることで、より専門的で読みやすい表示を実現します。

**本モジュールは、元のテキストがすでに読める状態であることを前提とし、それをより見やすく、美しく整形することに特化しています。**

-----

## 主な機能

1.  **厳密な記号変換マッピング**: 変換したい元のテキスト文字列（例: `"Cb Major"`, `"F# Minor"`, `"C##"`）と、それに対応する整形済みHTML文字列（例: `'C<span class="mnf-flat-symbol">♭</span> Major'`, `'F<span class="mnf-sharp-symbol">♯</span> Minor'`, `'C<span class="mnf-double-sharp-symbol">𝄪</span>'`）のペアを内部に保持します。これにより、意図しない変換を防ぎ、厳密な整形が可能です。
2.  **専用クラスによる記号のスタイリング**: シャープ (`♯`)、フラット (`♭`)、ダブルシャープ (`𝄪`)、ダブルフラット (`𝄫`)、ナチュラル (`♮`) などの各音楽記号は、変換時に専用のCSSクラス（例: `mnf-flat-symbol`）を持つ `<span>` タグで囲まれます。これにより、CSSで記号ごとに詳細なフォントや位置の調整が可能になります。
3.  **柔軟な適用タイミング**: JavaScriptから任意のタイミングで、指定したCSSセレクタに合致する要素に対し整形処理を実行できます。ページ読み込み時、言語切り替え時、動的なコンテンツ追加時など、多様なシナリオに対応します。
4.  **調名やコードネームの整形**: 日本語の「嬰ハ短調」のような調名を、`C<span class="mnf-sharp-symbol">♯</span> Minor` のように英語表記と音楽記号を組み合わせた形式に変換するのにも利用できます。同様に、コードネームの整形にも応用可能です。

-----

## 使い方

### 1\. CSSの準備

音楽記号を美しく表示するために、**Noto Music** フォントをロードし、変換された記号にスタイルを適用します。クラス名には、他のコードとの衝突を避けるために **`mnf-` プレフィックス** を使用することを推奨します。

```css
/* your-styles.css */

/* Google FontsからNoto Musicをロード */
@import url('https://fonts.googleapis.com/css2?family=Noto+Music&display=swap');

/* 音楽記号を表示する要素全般にNoto Musicを適用 */
.music-key-display,
.music-chord-display, /* 例: コードネーム表示用 */
span[data-key-type] { /* 特定のdata属性を持つ要素も対象に含める場合 */
    font-family: "Noto Music", sans-serif;
    /* font-size: 1.2em; */ /* 必要に応じて調整 */
}

/* 各記号に特化したスタイリング */
/* mnf-flat-symbol, mnf-sharp-symbol など、記号ごとに異なるクラスを使用 */
.mnf-flat-symbol,
.mnf-sharp-symbol,
.mnf-double-flat-symbol,
.mnf-double-sharp-symbol,
.mnf-natural-symbol {
    font-family: "Noto Music", sans-serif; /* 念のため再指定 */
}

.mnf-flat-symbol{
    /* 記号ごとの微調整（例: 縦位置の調整。フォントによって最適な値は異なります） */
    /* vertical-align: baseline; */
    /* position: relative; */
    /* top: 0.05em; */
    /* left: -0.05em; */ /* 文字と記号の間隔調整など */

}
.mnf-sharp-symbol{
    /* 記号ごとの微調整（例: 縦位置の調整。フォントによって最適な値は異なります） */
    /* vertical-align: baseline; */
    /* position: relative; */
    /* top: 0.05em; */
    /* left: -0.05em; */ /* 文字と記号の間隔調整など */

}
.mnf-double-flat-symbol{
    /* 記号ごとの微調整（例: 縦位置の調整。フォントによって最適な値は異なります） */
    /* vertical-align: baseline; */
    /* position: relative; */
    /* top: 0.05em; */
    /* left: -0.05em; */ /* 文字と記号の間隔調整など */

}
.mnf-double-sharp-symbol{
    /* 記号ごとの微調整（例: 縦位置の調整。フォントによって最適な値は異なります） */
    /* vertical-align: baseline; */
    /* position: relative; */
    /* top: 0.05em; */
    /* left: -0.05em; */ /* 文字と記号の間隔調整など */

}
.mnf-natural-symbol{
    /* 記号ごとの微調整（例: 縦位置の調整。フォントによって最適な値は異なります） */
    /* vertical-align: baseline; */
    /* position: relative; */
    /* top: 0.05em; */
    /* left: -0.05em; */ /* 文字と記号の間隔調整など */

}



```

### 2\. JavaScriptモジュールの実装 (`music-notation-formatter.mjs`)

`music-notation-formatter.mjs` ファイルを作成し、以下のコードを記述します。

```javascript
// music-notation-formatter.mjs

// 変換マッピングデータ
const notationMap = {
    // フラット記号
    "Cb Major": 'C<span class="mnf-flat-symbol">♭</span> Major',
    "Db Major": 'D<span class="mnf-flat-symbol">♭</span> Major',
    "Eb Major": 'E<span class="mnf-flat-symbol">♭</span> Major',
    "Fb Major": 'F<span class="mnf-flat-symbol">♭</span> Major',
    "Gb Major": 'G<span class="mnf-flat-symbol">♭</span> Major',
    "Ab Major": 'A<span class="mnf-flat-symbol">♭</span> Major',
    "Bb Major": 'B<span class="mnf-flat-symbol">♭</span> Major',
    
    // シャープ記号
    "C# Major": 'C<span class="mnf-sharp-symbol">♯</span> Major',
    "D# Major": 'D<span class="mnf-sharp-symbol">♯</span> Major',
    "E# Major": 'E<span class="mnf-sharp-symbol">♯</span> Major', 
    "F# Major": 'F<span class="mnf-sharp-symbol">♯</span> Major',
    "G# Major": 'G<span class="mnf-sharp-symbol">♯</span> Major',
    "A# Major": 'A<span class="mnf-sharp-symbol">♯</span> Major',
    "B# Major": 'B<span class="mnf-sharp-symbol">♯</span> Major', 

    // ダブルシャープ記号 (𝄪)
    "C## Major": 'C<span class="mnf-double-sharp-symbol">𝄪</span> Major',
    "G## Major": 'G<span class="mnf-double-sharp-symbol">𝄪</span> Major',

    // ダブルフラット記号 (𝄫)
    "Dbb Major": 'D<span class="mnf-double-flat-symbol">𝄫</span> Major',
    "Ebb Major": 'E<span class="mnf-double-flat-symbol">𝄫</span> Major',

    // ナチュラル記号 (♮) - 特定の文脈で必要なら
    "Cnat Major": 'C<span class="mnf-natural-symbol">♮</span> Major', 

    // 通常の調名 (変換不要だがマッピングに含めることで一元管理)
    "C Major": "C Major",
    "D Major": "D Major",
    "E Major": "E Major",
    "F Major": "F Major",
    "G Major": "G Major",
    "A Major": "A Major",
    "B Major": "B Major",

    // 日本語の調名から英語 + 記号への変換例
    "嬰ハ短調": 'C<span class="mnf-sharp-symbol">♯</span> Minor',
    "変ホ長調": 'E<span class="mnf-flat-symbol">♭</span> Major',
    
    // コードネームの例
    "Cdim7": 'C<span class="mnf-diminished-symbol">o</span>7', // 減記号など
    "Cm7-5": 'C<span class="mnf-minor-symbol">m</span>7<span class="mnf-flat-symbol">♭</span>5', // マイナーやフラット5など
    // TODO: コードネームの変換はいくつかのスタイルを持つ？C△7とかCM7とかCmaj7とか色々あるよね

    // 必要に応じてさらに追加
};



/**
 * 元のテキストを音楽記号を含むHTMLに変換します。
 * マッピングにない場合は元のテキストを返します。
 * @param {string} originalText - 変換前のテキスト（例: "Cb Major", "嬰ハ短調"）
 * @returns {string} 整形されたHTML文字列、または元のテキスト
 */
function formatText(originalText) {
    return notationMap[originalText] || originalText;
}

/**
 * 指定されたCSSセレクタに一致する要素のテキスト内容を整形します。
 * @param {string} selector - 整形対象の要素を特定するCSSセレクタ
 */
function applyFormatting(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        const originalText = element.textContent.trim();
        const formattedHtml = formatText(originalText);
        element.innerHTML = formattedHtml;
    });
}

// モジュールの公開API
export const MusicNotationFormatter = {
    formatText,
    applyFormatting,
    // 必要に応じて、マッピングを動的に追加・変更するメソッドも追加可能
    // addNotationMapping: (original, formatted) => { notationMap[original] = formatted; }
};
```

### 3\. HTMLでの利用

整形したいテキストを含む要素に、適切なクラス名（例: `music-key-display`）や属性を設定します。

```html
<label>
    <input type="radio" name="majorKey" value="7f">
    <span data-key-type="major" data-mei-value="7f" class="music-key-display">Cb Major</span>
</label>

<p class="music-key-display">F# Major</p>
<p class="music-key-display">嬰ハ短調</p>
<div class="music-chord-display">Cdim7</div>
```

### 4\. アプリケーションでの呼び出し (`main.js` またはエントリポイント)

モジュールをインポートし、適切なタイミングで整形関数を呼び出します。

```javascript
// main.js

// モジュールのインポート
import { MusicNotationFormatter } from './music-notation-formatter.mjs';

// 例: 言語切り替えなどでテキスト内容が変更される関数
function updateKeyNames(selectedLang) {
    // ここで共通データから言語に応じたテキストを取得し、span.textContent に設定する
    // 例: span.textContent = "Cb Major"; または "嬰ハ短調";
    
    // テキスト内容が更新された後、整形処理を呼び出す
    MusicNotationFormatter.applyFormatting('.music-key-display');
    MusicNotationFormatter.applyFormatting('.music-chord-display'); // コードネームも整形
}

// ページが完全に読み込まれたときに初期整形を実行
document.addEventListener('DOMContentLoaded', () => {
    // 初期言語設定に基づいてキー名を更新し、整形を適用する場合
    // const initialLang = 'ja'; // またはユーザーの環境設定などから取得
    // updateKeyNames(initialLang); 
    
    // 初期HTMLにすでに整形対象のテキストが含まれる場合は直接呼び出し
    MusicNotationFormatter.applyFormatting('.music-key-display');
    MusicNotationFormatter.applyFormatting('.music-chord-display');
});

// 例: 言語選択UIのイベントリスナーなど、動的にテキストが変更される場所
/*
const langSelectElement = document.getElementById('language-select');
if (langSelectElement) {
    langSelectElement.addEventListener('change', (event) => {
        const newLang = event.target.value;
        updateKeyNames(newLang); // 言語更新後に整形も実行
    });
}

TODO: 検討。
const htmlArr = document.querySelectorAll('.mnf-class');
mnf.update(htmlArr,mapGroup);
とかにして配列を渡すのは？ループは関数内部とか？
mapGroupを作っておけば、単なるフォーマットも翻訳も同じ関数なのでは？
*/

// 例: 新しい要素を動的に追加した場合など
/*
function addDynamicContent(keyName) {
    const newElement = document.createElement('p');
    newElement.classList.add('music-key-display');
    newElement.textContent = keyName; // 例: "G# Major"
    document.body.appendChild(newElement);

    // 新しく追加した要素だけを整形することも可能
    MusicNotationFormatter.applyFormatting('.music-key-display:last-child');
    // または、ページ全体を再スキャン
    // MusicNotationFormatter.applyFormatting('.music-key-display');
}
// addDynamicContent("G# Major");
*/
```

-----

## 拡張性

  * `notationMap` に新しい音楽用語、コードネーム、または言語に応じた記号のペアを追加することで、対応範囲を簡単に広げられます。
  * `applyFormatting` 関数はセレクタを受け取るため、特定の要素群にのみ整形を適用するといった柔軟な使い方が可能です。
  * `formatText` 関数は単一の文字列を変換するため、DOM操作を伴わない他の部分（例: ツールチップのテキスト生成、PDF出力用の文字列準備）でも利用できます。

-----
