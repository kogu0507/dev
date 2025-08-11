// tonejs/player/midi-player.js

import { getPlayRangeInSecondsFromOne } from '../core/play-range.js';
import { getBpm } from '../core/tempo.js';
import { initToneAudio } from '../core/setup.js';
import { createDefaultSynth } from '../core/synth.js';

// -------------------------------------------------------
// 内部状態
// -------------------------------------------------------
let _synth = null;
let _midiData = null;
let _timeSignature = null;

let _isPlaying = false;
let _isStopping = false;

let _onPlayStartCallback = () => {};
let _onPlayEndCallback = () => {};

let _watchdogId = null;
let _doneCalled = false;

// -------------------------------------------------------
export async function setupMidiPlayer(midiData, timeSignature) {
    if (!midiData || !timeSignature) {
        throw new Error('MIDI data and time signature are required for setup.');
    }

    await initToneAudio();

    if (!_synth) {
        _synth = createDefaultSynth();
    }
    _midiData = midiData;
    _timeSignature = timeSignature;
}

export function setOnPlayStart(callback) {
    _onPlayStartCallback = callback || (() => {});
}
export function setOnPlayEnd(callback) {
    _onPlayEndCallback = callback || (() => {});
}

export function isPlaying() {
    return _isPlaying;
}

/**
 * 指定された小節範囲のMIDIデータを再生します。
 * @param {number} startMeasure
 * @param {number} endMeasure
 * @param {Function} [onDone]
 */
export function playMidiRange(startMeasure, endMeasure, onDone) {
    if (!_midiData || !_timeSignature) {
        throw new Error('Midi player has not been set up. Call setupMidiPlayer first.');
    }

    if (_isPlaying) {
        console.warn('[midi-player] Already playing. Stopping current playback before starting new one.');
        stopMidiPlayback(); // 一度クリーンに
    }

    _isPlaying = true;
    _isStopping = false;
    _doneCalled = false;

    try { _onPlayStartCallback(); } catch (e) { console.error(e); }

    const { startSeconds, durationSeconds } = getPlayRangeInSecondsFromOne(
        startMeasure,
        endMeasure,
        _timeSignature.beatsPerMeasure
    );
    const endSeconds = startSeconds + durationSeconds;

    console.log(`BPM: ${getBpm()}`);
    console.log(`Playing from measure ${startMeasure} to ${endMeasure}`);
    console.log(`Time range: ${startSeconds.toFixed(2)}s to ${endSeconds.toFixed(2)}s`);

    // クリーンアップ
    try { Tone.Transport.stop(); } catch {}
    try { Tone.Transport.cancel(0); } catch {}

    // ノートをスケジュール（callback の引数 time を使って鳴らす）
    _midiData.tracks.forEach(track => {
        track.notes.forEach(note => {
            if (note.time >= startSeconds && note.time < endSeconds) {
                Tone.Transport.schedule((time) => {
                    _synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
                }, note.time); // 曲頭からの絶対 Transport 時間（秒）
            }
        });
    });

    // ★ 終了イベント：渡された time を停止処理に渡す（Tone のお作法）
    Tone.Transport.scheduleOnce((time /* transport 時刻 */) => {
        safeStopAndFinish(onDone, time);
    }, endSeconds);

    // ウォッチドッグ（取りこぼし保険）
    _watchdogId = setTimeout(() => {
        if (!_isPlaying || _doneCalled) return;
        console.warn('[midi-player] Watchdog fired. Forcing stop.');
        safeStopAndFinish(onDone, undefined /* 実時間側の保険なので time なしでもOK */);
    }, Math.max(0, (durationSeconds + 0.25) * 1000));

    // 再生開始（startSeconds から）
    Tone.Transport.start(undefined, startSeconds);

    // 内部：停止＋完了通知（1回だけ）
    function safeStopAndFinish(done, timeArg) {
        if (_doneCalled) return;
        _doneCalled = true;
        stopMidiPlayback(timeArg);
        try { done && done(); } catch (e) { console.error(e); }
    }
}

/**
 * MIDI再生を停止します。
 * @param {number|string} [timeArg] Transport が渡す time をそのまま受け取り可
 *   - scheduleOnce のコールバック内から呼ぶときは、その time を渡す
 *   - 手動停止やウォッチドッグからは省略でOK
 */
export function stopMidiPlayback(timeArg) {
    if (_isStopping) return;
    _isStopping = true;

    // ウォッチドッグ後始末
    if (_watchdogId) {
        clearTimeout(_watchdogId);
        _watchdogId = null;
    }

    if (_isPlaying) {
        _isPlaying = false;

        try {
            // ★ timeArg を渡して Transport を停止（Tone の警告回避 & 精度向上）
            if (timeArg !== undefined) {
                Tone.Transport.stop(timeArg);
                // その時点以降のイベントをキャンセル
                Tone.Transport.cancel(timeArg);
            } else {
                // 従来どおりの即時停止（手動停止など）
                Tone.Transport.stop();
                Tone.Transport.cancel(0);
            }
        } catch (e) {
            console.error(e);
        }

        try { _onPlayEndCallback(); } catch (e) { console.error(e); }
    }

    _isStopping = false;
}
