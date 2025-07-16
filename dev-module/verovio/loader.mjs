// module/verovio/loader.mjs
// —————————————————————————————————————————————————
// Verovio の WASM モジュールを確実に初期化してから
// Toolkit インスタンスを返すローダー
// —————————————————————————————————————————————————

//import { loadScript } from '../library-loader.mjs'; // 開発用
import { loadScript } from '../library-loader.min.mjs'; // 開発用
//import { loadScript } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@バージョン/library-loader.min.mjs'; // 本番用

/**
 * Verovio Toolkit をロードして初期化完了を待つ
 * @returns {Promise<verovio.Toolkit>} 初期化済みの Toolkit インスタンス
 */
export function loadVerovio() {
  // すでに生成済みならキャッシュを返す
  if (window.__verovioToolkit) {
    return Promise.resolve(window.__verovioToolkit);
  }

  // まずスクリプト本体を読み込む
  return loadScript(
    'Verovio',
    'https://www.verovio.org/javascript/latest/verovio-toolkit-wasm.js'
  )
  .then(() => {
    // スクリプトはロードされたが、
    // verovio.module がまだない可能性があるのでポーリング
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timeout = 20000; // タイムアウト 20 秒

      function checkModule() {
        // Emscripten が生成した module オブジェクトがあるか？
        if (window.verovio && verovio.module) {
          const m = verovio.module;

          // 初期化完了コールバックを設定
          m.onRuntimeInitialized = () => {
            try {
              const tk = new verovio.toolkit();
              window.__verovioToolkit = tk;
              console.log('[verovio-loader] WASM 初期化完了, Toolkit 作成');
              resolve(tk);
            } catch (err) {
              console.error('[verovio-loader] Toolkit の生成でエラー', err);
              reject(err);
            }
          };

          // もしすでに run() 済みなら即座にインスタンス化
          if (m.calledRun) {
            try {
              const tk = new verovio.toolkit();
              window.__verovioToolkit = tk;
              console.log('[verovio-loader] 既に run 済み, Toolkit 作成');
              resolve(tk);
            } catch (err) {
              console.error('[verovio-loader] 既存 run からの生成エラー', err);
              reject(err);
            }
          }
        }
        else if (Date.now() - start > timeout) {
          // タイムアウト
          const msg = '[verovio-loader] module が初期化されませんでした（タイムアウト）';
          console.error(msg);
          reject(new Error(msg));
        }
        else {
          // まだ module が来ていない → 再チェック
          setTimeout(checkModule, 100);
        }
      }

      // 最初のチェック
      checkModule();
    });
  });
}
