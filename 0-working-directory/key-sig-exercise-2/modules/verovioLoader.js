// modules/verovioLoader.js

import { loadVerovio } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.0.1/verovio/loader.min.mjs';

let toolkit = null;

/**
 * Verovio で MEI を SVG にレンダリングして挿入します。
 * @param {string} targetId - SVG を挿入する要素の ID
 * @param {string} meiString - MEI XML（文字列）
 * @param {string|null} statusId - ステータス表示用要素の ID
 */
export async function renderVerovio(targetId, meiString, statusId = null) {
  const viewer = document.getElementById(targetId);
  const status = statusId ? document.getElementById(statusId) : null;
  if (!viewer) return;

  // ステータス表示（あれば）
  if (status) status.textContent = 'レンダリング中…';

  try {
    if (!toolkit) {
      if (status) status.textContent = 'Verovio をロード中…';
      toolkit = await loadVerovio();
    }
    toolkit.loadData(meiString);
    toolkit.setOptions({
      adjustPageWidth: true,
      adjustPageHeight: true,
      footer: "none",
      scale: 80
    });
    const svg = toolkit.renderToSVG(1, {});
    viewer.innerHTML = svg;
    if (status) status.textContent = '';
  } catch (err) {
    if (status) status.textContent = 'エラー: ' + err.message;
    console.error('Verovioレンダリングエラー', err);
  }
}
