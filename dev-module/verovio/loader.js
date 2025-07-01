// dev-module/verovio/loader.js

import { loadScript } from '../library-loader.min.js';

/**
 * loadVerovio のオプション定義
 * @typedef {Object} LoadVerovioOptions
 * @property {string} [scriptUrl] - Verovio WASM ローダースクリプトの URL
 * @property {number} [timeout] - モジュール初期化を待機する最大時間 (ms)
 * @property {number} [pollingInterval] - モジュール準備チェックの間隔 (ms)
 */

// モジュール内で保持する Toolkit インスタンスのキャッシュ
/** @type {verovio.Toolkit|null} */
let cachedToolkit = null;

/**
 * Verovio Toolkit をロード・初期化し、インスタンスを返します。
 * @param {LoadVerovioOptions} [options] - オーバーライド可能な設定
 * @returns {Promise<verovio.Toolkit>} - 初期化済みの Toolkit インスタンス
 */
export async function loadVerovio({
  scriptUrl = 'https://www.verovio.org/javascript/latest/verovio-toolkit-wasm.js',
  timeout = 20000,
  pollingInterval = 100
} = {}) {
  // 既に初期化済みのキャッシュがあれば返却
  if (cachedToolkit) {
    return cachedToolkit;
  }

  // Verovio WASM ローダースクリプトを読み込む
  try {
    await loadScript('Verovio', scriptUrl);
  } catch (err) {
    throw new Error(`Verovio スクリプトの読み込みに失敗しました: ${err.message}`);
  }

  // Emscripten モジュールの準備完了を待ち、Toolkit インスタンスを生成
  const toolkit = await new Promise((resolve, reject) => {
    const startTime = Date.now();

    function checkModule() {
      if (window.verovio && window.verovio.module) {
        const m = window.verovio.module;

        // Toolkit インスタンスを生成する共通関数
        const instantiate = () => {
          try {
            const tk = new window.verovio.toolkit();
            cachedToolkit = tk;
            resolve(tk);
          } catch (error) {
            reject(new Error(`Toolkit インスタンス生成エラー: ${error.message}`));
          }
        };

        // run 済みなら即生成、未なら onRuntimeInitialized を待機
        if (m.calledRun) {
          instantiate();
        } else {
          m.onRuntimeInitialized = instantiate;
        }
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Verovio モジュールの初期化がタイムアウトしました'));
      } else {
        setTimeout(checkModule, pollingInterval);
      }
    }

    checkModule();
  });

  console.log('[verovio-loader] Toolkit が初期化されました');
  return toolkit;
}
