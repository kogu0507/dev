// module/library-loader.js
// —————————————————————————————————————————————————
// 汎用的に <script> を追加して外部ライブラリをロードするユーティリティ
// 既にロード済みなら再度読み込まない
// —————————————————————————————————————————————————

const loadedScripts = {};

/**
 * 外部スクリプトを動的に追加し、読み込み完了を待ちます。
 *
 * @param {string} name  識別用のキー（例: 'Tone.js', 'Verovio'）
 * @param {string} url   スクリプトのURL
 * @returns {Promise<void>}
 */
export function loadScript(name, url) {
  // すでに読み込み済みなら即解決
  if (loadedScripts[name]) {
    console.log(`[library-loader] ${name} is already loaded.`);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    script.onload = () => {
      console.log(`[library-loader] ${name} loaded from ${url}`);
      loadedScripts[name] = true;
      resolve();
    };

    script.onerror = (ev) => {
      const msg = `[library-loader] Error loading ${name} from ${url}`;
      console.error(msg, ev);
      reject(new Error(msg));
    };

    document.head.appendChild(script);
  });
}
