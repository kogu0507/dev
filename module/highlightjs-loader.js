// highlightjs-loader.js（修正版）

(function () {
  // —————————————————————————
  // 1. 設定セクション
  // —————————————————————————
  var highlightJsVersion = '11.11.0';    // highlight.js の CDN バージョン
  var theme              = 'github-dark'; // CSS テーマ
  var copyButtonVersion  = '0.1.1';       // highlightjs-copy の CDN バージョン

  // —————————————————————————
  // 2. DOM が完全に読み込まれてから処理を開始する
  //    （コードブロックが DOM に存在することを保証）
  // —————————————————————————
  document.addEventListener('DOMContentLoaded', function () {

    // —————————————————————————
    // 3. CSS を先に読み込む（並列で OK）
    // —————————————————————————

    // 3-1. highlight.js 用スタイル
    var hljsCss = document.createElement('link');
    hljsCss.rel  = 'stylesheet';
    hljsCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/'
                  + highlightJsVersion
                  + '/styles/' + theme + '.min.css';
    document.head.appendChild(hljsCss);

    // 3-2. highlightjs-copy 用スタイル
    var copyCss = document.createElement('link');
    copyCss.rel  = 'stylesheet';
    copyCss.href = 'https://unpkg.com/highlightjs-copy@'
                   + copyButtonVersion
                   + '/dist/highlightjs-copy.min.css';
    document.head.appendChild(copyCss);

    // —————————————————————————
    // 4. すでに Highlight.js が読み込まれている場合の処理
    //    → プラグインだけ読み込む or 何もしない
    // —————————————————————————
    if (window.hljs) {
      // hljs 本体はOK。プラグインが未読み込みなら読み込んで初期化。
      if (!window.CopyButtonPlugin) {
        loadCopyPluginAndInit();
      }
      // ここで return すると、以下の hljs 本体の再読み込みを防げる
      return;
    }

    // —————————————————————————
    // 5. Highlight.js 本体を読み込む（直列）
    // —————————————————————————
    var hljsScript = document.createElement('script');
    hljsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/'
                     + highlightJsVersion
                     + '/highlight.min.js';

    hljsScript.onload = function () {
      // hljs 本体の読み込み完了
      if (window.hljs && typeof hljs.highlightAll === 'function') {
        // プラグインの読み込み→初期化→ハイライト実行
        loadCopyPluginAndInit();
      } else {
        console.warn('highlight.js の読み込みは完了しましたが、hljs.highlightAll が見つかりません');
      }
    };

    hljsScript.onerror = function () {
      console.error('highlight.js の読み込みに失敗しました');
    };

    document.head.appendChild(hljsScript);

    // —————————————————————————
    // 6. highlightjs-copy プラグインを読み込み→初期化→ハイライト実行
    //    関数化して重複を避ける
    // —————————————————————————
    function loadCopyPluginAndInit() {
      // プラグインのスクリプト要素を生成
      var copyScript = document.createElement('script');
      copyScript.src = 'https://unpkg.com/highlightjs-copy@'
                       + copyButtonVersion
                       + '/dist/highlightjs-copy.min.js';

      copyScript.onload = function () {
        // CopyButtonPlugin がグローバルにあるかチェック
        if (window.CopyButtonPlugin) {
          // プラグインを登録してハイライト実行
          hljs.addPlugin(new CopyButtonPlugin());
        } else {
          console.warn('CopyButtonPlugin が見つかりません。コピー機能は無効化します。');
        }
        // いずれにせよハイライトのみ実行
        hljs.highlightAll();
      };

      copyScript.onerror = function () {
        console.error('highlightjs-copy の読み込みに失敗しました。コピー機能は無効化します。');
        // ハイライトのみ実行
        hljs.highlightAll();
      };

      document.head.appendChild(copyScript);
    }

  }); // end DOMContentLoaded

})();
