// play-range.js

import { getBpm } from './tempo.js';

/**
 * 音楽の小節と拍をTone.jsのタイムフォーマットに変換するロジック。
 */

// 1拍の秒数を計算する
const getBeatDuration = (bpm) => {
    return 60 / bpm;
};

/**
 * 小節番号と拍を秒数に変換します。（0から開始）
 * @param {number} measure 小節番号（0から開始）
 * @param {number} beat 拍数（0から開始）
 * @param {number} beatsPerMeasure 1小節あたりの拍数（デフォルト: 4）
 * @returns {number} 変換された秒数
 */
const measureAndBeatToSeconds = (measure, beat, beatsPerMeasure = 4) => {
    const bpm = getBpm();
    if (bpm === 0) {
        console.error('BPMが設定されていません。先にテンポを設定してください。');
        return 0;
    }
    const totalBeats = (measure * beatsPerMeasure) + beat;
    return totalBeats * getBeatDuration(bpm);
};

/**
 * 小節の開始位置と長さを秒数に変換します。（0から開始）
 * @param {number} startMeasure 再生開始小節（0から開始）
 * @param {number} endMeasure 再生終了小節（0から開始）
 * @param {number} beatsPerMeasure 1小節あたりの拍数（デフォルト: 4）
 * @returns {{ startSeconds: number, durationSeconds: number }}
 */
const getPlayRangeInSeconds = (startMeasure, endMeasure, beatsPerMeasure = 4) => {
    const bpm = getBpm();
    if (bpm === 0) {
        console.error('BPMが設定されていません。先にテンポを設定してください。');
        return { startSeconds: 0, durationSeconds: 0 };
    }
    const beatDuration = getBeatDuration(bpm);

    const startTotalBeats = startMeasure * beatsPerMeasure;
    // 修正: 終了小節の終わりまでの拍数を計算するために、endMeasureに1を足す
    const endTotalBeats = (endMeasure + 1) * beatsPerMeasure;

    const startSeconds = startTotalBeats * beatDuration;
    const durationSeconds = (endTotalBeats - startTotalBeats) * beatDuration;

    return {
        startSeconds,
        durationSeconds
    };
};

/**
 * 1始まりの小節番号と拍を秒数に変換します。
 * この関数は、内部的に0始まりの関数を呼び出して処理します。
 * @param {number} measure 小節番号（1から開始）
 * @param {number} beat 拍数（0から開始）
 * @param {number} beatsPerMeasure 1小節あたりの拍数（デフォルト: 4）
 * @returns {number} 変換された秒数
 */
export const measureAndBeatToSecondsFromOne = (measure, beat, beatsPerMeasure = 4) => {
    if (measure < 1) {
        console.warn('小節番号は1以上を指定してください。');
        return 0;
    }
    return measureAndBeatToSeconds(measure - 1, beat, beatsPerMeasure);
};

/**
 * 1始まりの小節の開始位置と長さを秒数に変換します。
 * この関数は、内部的に0始まりの関数を呼び出して処理します。
 * @param {number} startMeasure 再生開始小節（1から開始）
 * @param {number} endMeasure 再生終了小節（1から開始）
 * @param {number} beatsPerMeasure 1小節あたりの拍数（デフォルト: 4）
 * @returns {{ startSeconds: number, durationSeconds: number }}
 */
export const getPlayRangeInSecondsFromOne = (startMeasure, endMeasure, beatsPerMeasure = 4) => {
    if (startMeasure < 1 || endMeasure < startMeasure) {
        console.warn('開始小節は1以上で、終了小節より前に指定してください。');
        return { startSeconds: 0, durationSeconds: 0 };
    }
    // ここでstartMeasureとendMeasureを0始まりに変換して内部関数に渡す
    return getPlayRangeInSeconds(startMeasure - 1, endMeasure - 1, beatsPerMeasure);
};