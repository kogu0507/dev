// tonejs/core/setup.js

// Tone.jsがグローバルスコープにロードされていることを前提としています。
// このモジュールを使用する前に、loader.jsでTone.jsをロードする必要があります。

/** AudioContext がすでに起動済みかどうか */
let _audioStarted = false;

/**
 * Tone.js の AudioContext をユーザー操作内で一度だけ再開します。
 * ユーザーのインタラクション（クリックなど）後に呼び出す必要があります。
 * 2 回目以降の呼び出しでは何もしません。
 *
 * @returns {Promise<void>} オーディオコンテキストが開始されると解決するPromise。
 * @throws {Error} Tone.jsがロードされていない場合、またはオーディオ初期化中にエラーが発生した場合にスローされます。
 */
export async function initToneAudio() {
    if (typeof Tone === 'undefined') {
        throw new Error('[core/setup] Tone.js がロードされていません。');
    }

    if (_audioStarted) {
        // すでに起動済みならスキップ
        return;
    }

    try {
        await Tone.start();
        _audioStarted = true;
        console.log("[core/setup] オーディオコンテキストが開始されました。");
    } catch (error) {
        console.error("[core/setup] オーディオの初期化中にエラーが発生しました:", error);
        throw error;
    }
}
