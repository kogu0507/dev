/**
 * prism-loader.js
 * ---------------------------------------------------------------------
 * 1.  <script type="module" src="..."></script> を入れるだけで動く
 * 2.  デフォルトで Okaidia テーマ + HTML/CSS/JavaScript をサポート
 * 3.  window.prismLoaderOptions でテーマ名や言語を上書き可能
 * 4.  ライブラリ取得元は公式 CDN (cdnjs.cloudflare.com)
 * --------------------------------------------------------------------
 *
 * 例) 追加言語やテーマを変えたい場合
 * <script>
 *   window.prismLoaderOptions = {
 *     theme: 'tomorrow',                 // Prism 同梱テーマ名 (拡張子抜き)
 *     languages: ['markup', 'css', 'javascript', 'python', 'php']
 *   };
 * </script>
 * <script type="module" src="https://kogu0507.github.io/dev/_module/prism-loader.mjs"></script>
 */

(async () => {
  /* ---------- ユーザー設定の取り込み ---------- */
  const defaults = {
    theme: 'okaidia',                         // prism-okaidia.min.css
    languages: ['markup', 'javascript', 'css']// prism-*.min.js を順に読込み
  };
  const opts = { ...defaults, ...(window.prismLoaderOptions || {}) };

  /* ---------- 定数 ---------- */
  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/';

  /* ---------- CSS 読込み ---------- */
  const css = document.createElement('link');
  css.rel  = 'stylesheet';
  css.href = `${CDN}themes/prism-${opts.theme}.min.css`;
  document.head.append(css);

  /* ---------- JS を順番どおりに読込むユーティリティ ---------- */
  const loadScript = src => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`[prism-loader] Failed: ${src}`));
    document.head.append(s);
  });

  try {
    /* ---------- Prism 本体 ---------- */
    await loadScript(`${CDN}prism.min.js`);

    /* ---------- 言語コンポーネント ---------- */
    for (const lang of opts.languages) {
      await loadScript(`${CDN}components/prism-${lang}.min.js`);
    }

    /* ---------- ハイライト実行 ---------- */
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();                  // 既存コードブロックを一括処理
      /*  動的に <pre><code> … </code></pre> を追加した場合は、
          Prism.highlightElement(codeNode) を随時呼び出すと良い */
    }
  } catch (err) {
    console.error('[prism-loader] 途中でエラーが発生しました', err);
  }
})();
