// highlightjs-loader.js

;(function() {
  // ─── 設定 ─────────────────────────────────────────
  // highlight.js の CDN バージョンとテーマを指定
  var version = '11.11.0';
  var theme   = 'github-dark';

  // もし既に hljs が読み込まれていたら処理を中断
  if (window.hljs) return;

  // ─── CSS を追加 ─────────────────────────────────────
  // 1) highlight.js 用のテーマ
  var link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/' +
              version + '/styles/' + theme + '.min.css';
  document.head.appendChild(link);

  // 2) コピーボタン用のスタイル（大きく＆目立つように調整）
  var style = document.createElement('style');
  style.textContent = `
    /* コードブロック (<pre>) を relative にしてボタン配置を制御しやすく */
    pre {
      position: relative;
    }
    /* コピーボタンの基本スタイル */
    .hljs-copy-button {
      position: absolute;
      top: 0.5em;               /* 上から少し余裕を追加 */
      right: 0.5em;             /* 右からも余裕を追加 */
      padding: 0.5em 1em;       /* ボタン自体を大きく */
      font-size: 1em;           /* 見やすい文字サイズ */
      line-height: 1;           /* 高さを文字サイズに合わせる */
      border: none;             /* 枠線なし */
      border-radius: 4px;       /* 角を丸める */
      background: rgba(0, 0, 0, 0.7); /* 濃い背景でコントラストを強調 */
      color: #fff;              /* 白文字 */
      cursor: pointer;          /* ホバー時にポインター */
      opacity: 0.8;             /* やや半透明 */
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); /* 浮き上がり感 */
      transition: opacity 0.2s ease, transform 0.2s ease; /* アニメーション */
      z-index: 2;               /* コードテキストより手前に表示 */
    }
    /* ホバー／フォーカス時の視覚フィードバック */
    .hljs-copy-button:hover,
    .hljs-copy-button:focus {
      opacity: 1;               /* 完全に不透明化 */
      transform: scale(1.05);   /* 少し拡大 */
    }
  `;
  document.head.appendChild(style);

  // ─── highlight.js 本体を読み込み ────────────────────────
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/' +
               version + '/highlight.min.js';
  // 読み込み完了後にハイライト＆コピー機能を初期化
  script.onload = function() {
    if (window.hljs && typeof hljs.highlightAll === 'function') {
      // すべての <pre><code> をハイライト
      hljs.highlightAll();
      // ハイライト後にコピー機能を付与
      addCopyButtons();
    } else {
      console.warn('highlight.js の読み込みに失敗した可能性があります');
    }
  };
  script.onerror = function() {
    console.error('highlight.js の読み込みに失敗しました');
  };
  document.head.appendChild(script);

  // ─── コピー機能を追加 ────────────────────────────────────

  /**
   * すべての <pre><code> にコピー用ボタンを追加する
   */
  function addCopyButtons() {
    document.querySelectorAll('pre > code').forEach(function(codeBlock) {
      var pre = codeBlock.parentNode;

      // ボタン要素を作成
      var button = document.createElement('button');
      button.className = 'hljs-copy-button';
      button.type = 'button';
      button.innerText = 'Copy Code';                // ボタン文言をわかりやすく
      button.setAttribute('aria-label', 'コードをコピー'); // アクセシビリティ向上

      // <pre> の中にボタンを追加
      pre.appendChild(button);

      // クリック時の処理を登録
      button.addEventListener('click', function() {
        copyCodeToClipboard(codeBlock.innerText, button);
      });
    });
  }

  /**
   * テキストをクリップボードにコピーし、
   * 成功／失敗時にボタンの表示を一時的に変化させる
   *
   * @param {string} text
   * @param {HTMLButtonElement} button
   */
  function copyCodeToClipboard(text, button) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // 標準 API を使用
      navigator.clipboard.writeText(text).then(function() {
        showTemporaryMessage(button, '✔', 2000);
      }).catch(function(err) {
        console.error('clipboard API によるコピー失敗:', err);
        fallbackCopyText(text, button);
      });
    } else {
      // フォールバック
      fallbackCopyText(text, button);
    }
  }

  /**
   * execCommand を使ったフォールバックコピー
   */
  function fallbackCopyText(text, button) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left     = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      var successful = document.execCommand('copy');
      showTemporaryMessage(button, successful ? '✔' : '✖', 2000);
    } catch (err) {
      console.error('execCommand によるコピー失敗:', err);
      showTemporaryMessage(button, '✖', 2000);
    }

    document.body.removeChild(textarea);
  }

  /**
   * ボタンのテキストを一時的に置き換え、
   * 指定ミリ秒後に元に戻す
   */
  function showTemporaryMessage(button, message, duration) {
    var original = button.innerText;
    button.innerText = message;
    setTimeout(function() {
      button.innerText = original;
    }, duration);
  }

})();
