// processor/core-processor.js

import { loadToneJsMidi } from './tonejs-midi-loader.js';
import { initTempo } from '../core/tempo.js';

/**
 * MIDIデータを解析し、Tone.jsのMidiオブジェクトに変換します。
 * さらに、楽曲のテンポと拍子記号の情報を抽出します。
 * @param {ArrayBuffer|string} midiData MIDIファイルのArrayBufferまたはBase64文字列。
 * @returns {Promise<{midi: object, timeSignature: object}>} Tone.jsのMidiオブジェクトと拍子記号を解決するPromise。
 */
export async function processMidiData(midiData) {
    try {
        const Midi = await loadToneJsMidi();
        const midi = new Midi(midiData);

        // MIDIヘッダーからテンポ情報を抽出し、tempo.jsに設定
        if (midi.header && midi.header.tempos && midi.header.tempos.length > 0) {
            const firstTempo = midi.header.tempos[0].bpm;
            initTempo(firstTempo);
            console.log(`[core-processor] MIDIからBPMを検出しました: ${firstTempo}`);
        } else {
            initTempo(120);
            console.warn('[core-processor] MIDIにテンポ情報が見つかりませんでした。デフォルトの120BPMを使用します。');
        }

        // MIDIヘッダーから拍子記号を抽出し、プレイレンジ計算のために返却する
        let timeSignature = { beatsPerMeasure: 4, subdivision: 4 }; // デフォルトは4/4拍子
        if (midi.header && midi.header.timeSignatures && midi.header.timeSignatures.length > 0) {
            const firstSignature = midi.header.timeSignatures[0];
            timeSignature = {
                // テストコードの形式に合わせ、`timeSignature`配列から取得
                beatsPerMeasure: firstSignature.timeSignature[0], // 分子
                subdivision: firstSignature.timeSignature[1] // 分母
            };
            console.log(`[core-processor] MIDIから拍子記号を検出しました: ${timeSignature.beatsPerMeasure}/${timeSignature.subdivision}`);
        } else {
            console.warn('[core-processor] MIDIに拍子記号が見つかりませんでした。デフォルトの4/4拍子を使用します。');
        }

        // 拍子記号も追加して返す
        return {
            midi: midi,
            timeSignature: timeSignature
        };
    } catch (e) {
        console.error('[core-processor] MIDIデータの解析に失敗しました:', e);
        throw e;
    }
}