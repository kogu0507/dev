/*
 * ◆ tonejs-midi-loader.mjs
 * - 役割: Skypack経由で @tonejs/midi をロードし、Midi クラスを返す。
 * - 依存: なし
 * - 使い方:
 *   import { loadToneJsMidi } from './tonejs-midi-loader.mjs';
 *   const Midi = await loadToneJsMidi();
 *   const midi = new Midi();
 */

export async function loadToneJsMidi() {
    console.log('[tonejs-midi-loader] Skypack経由で @tonejs/midi をロード開始...');

    try {
        // SkypackからESMとしてインポート
        const module = await import('https://cdn.skypack.dev/@tonejs/midi@2.0.28');
        
        if (!module || typeof module.Midi !== 'function') {
            throw new Error('Midi クラスが見つかりません！');
        }

        console.log('[tonejs-midi-loader] @tonejs/midi ロード成功！');
        return module.Midi;

    } catch (e) {
        console.error('[tonejs-midi-loader] @tonejs/midi ロード失敗:', e);
        throw e;
    }
}
