// tonejs/core/tempo.js

// Tone.jsがグローバルスコープにロードされていることを前提としています。
// このモジュールを使用する前に、loader.jsでTone.jsをロードする必要があります。


/**
* トランスポートのBPM（テンポ）を設定します。
 *
 * @param {number} bpm 設定するBPM。
 * @throws {Error} Tone.jsがロードされていない場合にスローされます。
 */
export function initTempo(bpm) {
    if (typeof Tone === 'undefined') {
        throw new Error("[core/tempo] Tone.js is not loaded. Cannot set tempo.");
    }
    
    // Tone.TransportのBPMを設定
    Tone.Transport.bpm.value = bpm;
    console.log(`[core/tempo] テンポが ${bpm} BPMに設定されました。`);
}

/**
 * 再生を開始します。
 * * @throws {Error} Tone.jsがロードされていない場合にスローされます。
 */
export function startTempo() {
    if (typeof Tone === 'undefined') {
        throw new Error("[core/tempo] Tone.js is not loaded. Cannot start tempo.");
    }
    
    // トランスポートを開始
    Tone.Transport.start();
    console.log("[core/tempo] 再生を開始しました。");
}

/**
 * 再生を停止します。
 * * @throws {Error} Tone.jsがロードされていない場合にスローされます。
 */
export function stopTempo() {
    if (typeof Tone === 'undefined') {
        throw new Error("[core/tempo] Tone.js is not loaded. Cannot stop tempo.");
    }
    
    // トランスポートを停止
    Tone.Transport.stop();
    console.log("[core/tempo] 再生を停止しました。");
}

/**
 * 現在のBPMを取得します。
 * * @returns {number} 現在のBPM。
 * @throws {Error} Tone.jsがロードされていない場合にスローされます。
 */
export function getBpm() {
    if (typeof Tone === 'undefined') {
        throw new Error("[core/tempo] Tone.js is not loaded. Cannot get BPM.");
    }
    
    return Tone.Transport.bpm.value;
}