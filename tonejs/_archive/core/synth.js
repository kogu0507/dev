// tonejs/core/synth.js

/**
 * デフォルト設定のTone.Synthインスタンスを作成し、出力に接続します。
 * この関数はTone.jsがグローバルスコープにロードされていることを前提とします。
 *
 * @returns {Tone.Synth} 設定済みのTone.Synthインスタンス。
 * @throws {Error} Tone.jsがロードされていない場合にスローされます。
 */
export function createDefaultSynth() {
    // Tone.jsが利用可能かチェック
    if (typeof Tone === 'undefined') {
        console.error("[core/synth] Tone.jsがロードされていません。シンセを作成できません。");
        throw new Error("Tone.js is not loaded. Cannot create synth.");
    }

    // デフォルトのシンセサイザーを作成し、メイン出力に接続
    const synth = new Tone.Synth().toDestination();
    console.log("[core/synth] デフォルトシンセサイザーが作成されました。");
    return synth;
}

/**
 * 指定されたシンセサイザーを使用して、特定の音を鳴らします。
 *
 * @param {Tone.Synth} synth
 * 音を鳴らすために使用するTone.Synthのインスタンス。
 * @param {string} note
 * 鳴らす音の音名（例: "C4", "A#3"）。
 * @param {string} duration
 * 音の長さ（例: "8n" = 8分音符, "4n" = 4分音符）。
 */
export function playSynthNote(synth, note, duration = "8n") {
    if (!synth || typeof synth.triggerAttackRelease !== 'function') {
        console.error("[core/synth] 無効なシンセサイザーインスタンスが渡されました。");
        return;
    }

    synth.triggerAttackRelease(note, duration);
    console.log(`[core/synth] シンセで ${note} (${duration}) の音が鳴りました！`);
}

/**
 * 読み込みテストを目的とした、シンセでC4の音を鳴らす関数です。
 * 実際のアプリケーションでは、この関数はテストやデバッグでのみ使用することを推奨します。
 *
 * @param {Tone.Synth} synth
 * 音を鳴らすために使用するTone.Synthのインスタンス。
 */
export function playSynthTestSound(synth) {
    playSynthNote(synth, "C4", "8n");
}


// 将来的に、FMSynthやAMSynthなど、他の種類のシンセサイザーを作成する関数をここに追加できます。
// 例:
/*
export function createFMSynth() {
    if (typeof Tone === 'undefined') {
        console.error("[core/synth] Tone.jsがロードされていません。FMSynthを作成できません。");
        throw new Error("Tone.js is not loaded. Cannot create FMSynth.");
    }
    const fmSynth = new Tone.FMSynth().toDestination();
    console.log("[core/synth] FMシンセサイザーが作成されました。");
    return fmSynth;
}
*/
