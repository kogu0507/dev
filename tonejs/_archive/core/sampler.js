// tonejs/core/sampler.js
// SamplerはTone.jsがグローバルスコープにロードされていることを前提とします。

/**
 * サラマンダーグランドピアノのサンプルをロードしたTone.Samplerインスタンスを作成し、出力に接続します。
 * サンプルのロードには時間がかかる場合があります。
 *
 * @returns {Promise<Tone.Sampler>} ロードが完了したTone.Samplerインスタンスを解決するPromise。
 * @throws {Error} Tone.jsがロードされていない場合にスローされます。
 */
export function createSalamanderSampler() {
    if (typeof Tone === 'undefined') {
        console.error("[core/sampler] Tone.jsがロードされていません。サンプラーを作成できません。");
        throw new Error("Tone.js is not loaded. Cannot create sampler.");
    }

    // Tone.Samplerのインスタンスを作成し、サンプルをロード
    // サラマンダーグランドピアノのサンプルは、Tone.jsの公式デモページで利用されているCDNから取得します。
    return new Promise((resolve, reject) => {
        const sampler = new Tone.Sampler({
            urls: {
                "C1": "C1.mp3",
                "C2": "C2.mp3",
                "C3": "C3.mp3",
                "C4": "C4.mp3",
                "C5": "C5.mp3",
                "C6": "C6.mp3",
                "C7": "C7.mp3",
            },
            baseUrl: "https://tonejs.github.io/audio/salamander/", // サンプルのベースURL
            onload: () => {
                console.log("[core/sampler] サラマンダーサンプラーのサンプルがロードされました。");
                sampler.toDestination(); // メイン出力に接続
                resolve(sampler); // ロード完了後、サンプラーインスタンスを解決
            },
            onerror: (error) => {
                console.error("[core/sampler] サラマンダーサンプラーのロード中にエラーが発生しました:", error);
                reject(error); // エラー発生時、Promiseを拒否
            }
        });
    });
}

/**
 * 指定されたサンプラーを使用して、特定の音を鳴らします。
 *
 * @param {Tone.Sampler} sampler
 * 音を鳴らすために使用するTone.Samplerのインスタンス。
 * @param {string} note
 * 鳴らす音の音名（例: "C4", "A#3"）。
 * @param {string} duration
 * 音の長さ（例: "8n" = 8分音符, "4n" = 4分音符）。
 */
export function playSamplerNote(sampler, note, duration = "8n") {
    if (!sampler || typeof sampler.triggerAttackRelease !== 'function') {
        console.error("[core/sampler] 無効なサンプラーインスタンスが渡されました。");
        return;
    }

    sampler.triggerAttackRelease(note, duration);
    console.log(`[core/sampler] サンプラーで ${note} (${duration}) の音が鳴りました！`);
}

/**
 * 読み込みテストを目的とした、サンプラーでC4の音を鳴らす関数です。
 *
 * @param {Tone.Sampler} sampler
 * 音を鳴らすために使用するTone.Samplerのインスタンス。
 */
export function playSamplerTestSound(sampler) {
    playSamplerNote(sampler, "C4", "8n");
}
