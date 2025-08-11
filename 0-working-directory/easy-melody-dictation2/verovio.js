// verovio.js
// VerovioManager を使って MEI → SVG/RDF → ノートデータ取得まで担います

import { VerovioManager } from "https://cdn.jsdelivr.net/gh/kogu0507/module@v2.8.0/verovio/verovio-manager.min.js";

let verovioMgr = null;

/**
 * VerovioManager の初期化
 */
export async function setupVerovioManager() {
  console.log("[ezmelo] verovio: setup start");
  verovioMgr = new VerovioManager({
    // TODO: オプションが必要ならここに

  });
  // VerovioManager 側の準備完了を待つ（initialize() を呼び出す）
  await verovioMgr.initialize();
  console.log("[ezmelo] verovio: initialized", verovioMgr);
}


/**
 * VerovioManager のレンダリングオプションを設定
 * @param {object} options - 設定したいレンダリングオプションのオブジェクト
 */
export function setVerovioRenderOptions(options) {
  if (verovioMgr) {
    verovioMgr.setRenderOptions(options);
    console.log("[ezmelo] verovio: render options set", options);
  } else {
    console.warn("[ezmelo] verovio: VerovioManager not initialized. Call setupVerovioManager() first.");
  }
}


/**
 * SVG を指定コンテナに描画
 * @param {string} containerId    描画先要素の id
 * @param {object} [options={}]   レイアウトオプション（今はdisplaySvgFromUrlでは使わないが、setRenderOptionsで設定可能）
 * @param {string} meiUrl         MEI ファイルの URL
 */
export async function loadAndDisplayScore(containerId, options = {}, meiUrl) {
  console.log("[ezmelo] verovio: loadAndDisplayScore", { containerId, options, meiUrl });
  // displaySvgFromUrlはオプションを直接受け取ります
  // 例: { page: 1, measureRange: '' } など
  // 現状のoptionsはsetRenderOptionsで設定する用途なので、直接渡さない
  try {
    await verovioMgr.displaySvgFromUrl(meiUrl, containerId, options);
    console.log("[ezmelo] verovio: SVG rendered");
  } catch (err) {
    console.error("[ezmelo] verovio: render error", err);
    // UI側のエラー表示はVerovioManager内部で処理されるが、念のためcatch
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<div class="verovio-error">表示エラー: ${err.message}</div>`;
    }
  }
}

/**
 * MEI から演奏用ノートデータ (MIDI) を取得
 * @param {string} meiUrl MEI ファイルの URL
 * @returns {Promise<ArrayBuffer>} MIDIデータ
 */
export async function getPlayableScoreDataFromMei(meiUrl) {
  console.log("[ezmelo] verovio: getPlayableScoreDataFromMei", meiUrl);
  try {
    const data = await verovioMgr.getMidiFromUrl(meiUrl); // ここが変更点！
    console.log("[ezmelo] verovio: playable data (MIDI)", data);
    return data;
  } catch (err) {
    console.error("[ezmelo] verovio: noteData error", err);
    throw err;
  }
}
