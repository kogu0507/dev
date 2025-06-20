// highlightjs-loader.js

(function () {
  // 設定
  var version = '11.11.0'; // highlight.js のCDNバージョン
  var theme = 'github-dark'; // 利用するCSSテーマ

  // 既に読み込まれていたら何もしない
  if (window.hljs) return;

  // CSSリンクを追加
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/' + version +
              '/styles/' + theme + '.min.css';
  document.head.appendChild(link);

  // スクリプトを読み込んで、完了後に highlightAll 実行
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/' + version + '/highlight.min.js';
  script.onload = function () {
    if (window.hljs && typeof hljs.highlightAll === 'function') {
      hljs.highlightAll();
    } else {
      console.warn('highlight.js の読み込みに失敗したかもしれません');
    }
  };
  script.onerror = function () {
    console.error('highlight.js の読み込みに失敗しました');
  };
  document.head.appendChild(script);
})();
