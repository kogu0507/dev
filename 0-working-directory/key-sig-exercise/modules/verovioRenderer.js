// modules/verovioRenderer.js

// 外部モジュールからのインポート
import { loadVerovio } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.0.1/verovio/loader.min.mjs';

// Verovioのツールキットインスタンスをモジュール内で保持
let verovioToolkit = null;

/**
 * Verovio を使用して楽譜をレンダリングします。
 * @param {string} targetElementId - SVGを挿入するDOM要素のID
 * @param {string} meiString - レンダリングするMEI XML文字列
 * @param {string} [statusElementId=null] - ステータスメッセージを表示するDOM要素のID
 */
export async function renderVerovioScore(targetElementId, meiString, statusElementId = null) {
    console.log(`[VerovioRenderer] レンダリングを開始します。ターゲット: ${targetElementId}`);
    const viewerElement = document.getElementById(targetElementId);
    const currentStatusElement = statusElementId ? document.getElementById(statusElementId) : null;

    if (!viewerElement) {
        console.error(`[VerovioRenderer] ターゲット要素 '${targetElementId}' が見つかりません。`);
        if (currentStatusElement) currentStatusElement.textContent = `エラー: 表示ターゲットが見つかりません (${targetElementId})`;
        return;
    }

    viewerElement.innerHTML = ''; // 既存のコンテンツをクリア

    try {
        if (!verovioToolkit) {
            console.log('[VerovioRenderer] Verovioツールキットを初期ロード中…');
            if (currentStatusElement) currentStatusElement.textContent = 'Verovio を初期ロード中…';
            verovioToolkit = await loadVerovio(); // Verovioをロード
            console.log('[VerovioRenderer] Verovioツールキットのロードが完了しました。');
        }

        verovioToolkit.loadData(meiString); // MEIデータをロード
        verovioToolkit.setOptions({ // レンダリングオプションを設定
            adjustPageWidth: true,
            adjustPageHeight: true,
            footer: "none",
            scale: 80
        });
        console.log('[VerovioRenderer] Verovioオプションを設定しました。');

        const svg = verovioToolkit.renderToSVG(1, {}); // SVGをレンダリング
        viewerElement.innerHTML = svg; // SVGをDOMに挿入
        console.log(`[VerovioRenderer] レンダリングが完了しました。SVGを '${targetElementId}' に挿入しました。`);
    } catch (err) {
        console.error('[VerovioRenderer] Verovio レンダリングエラー:', err);
        if (currentStatusElement) currentStatusElement.textContent = 'エラーが発生しました: ' + err.message;
    }
}

// 必要であれば、ツールキットインスタンスを直接取得する関数もエクスポートできます
export function getVerovioToolkit() {
    return verovioToolkit;
}