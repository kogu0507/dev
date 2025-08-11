// tonejs/core/playlist-timer.js

import { getBpm } from './tempo.js';
// ★ MIDI 停止も一緒にやるために import（パスはあなたの構成に合わせて修正可）
import { stopMidiPlayback } from '../player/midi-player.js';

// -------------------------------------------------------
// 内部状態
// -------------------------------------------------------
let _playlist = [];
let _onPlayItemCallback = () => {};
let _onIntervalCallback = () => {};
let _onPlaylistEndCallback = () => {};
let _onStateChangeCallback = () => {};  // ← 追加：UI 同期などに使える

let _currentIndex = 0;
let _isPlaying = false;
let _intervalTimer = null;

// 状態フラグ
let _awaitingPlayComplete = false; // play ステップが完了コールバック待ちか
let _state = 'idle';               // 'idle' | 'running' | 'interval' | 'waiting-play-complete' | 'stopped' | 'finished'

// -------------------------------------------------------
// ユーティリティ
// -------------------------------------------------------
function setState(next) {
    _state = next;
    try { _onStateChangeCallback(_state, _currentIndex); } catch (e) { console.error(e); }
}

// -------------------------------------------------------
// API
// -------------------------------------------------------
/**
 * プレイリストを初期化します。
 * @param {Array<object>} playlist - 再生とインターバルのステップを含むプレイリスト配列
 */
export function setPlaylist(playlist) {
    if (!Array.isArray(playlist)) {
        throw new Error("Invalid playlist format. Must be an array.");
    }
    _playlist = playlist;
    _currentIndex = 0;
    _awaitingPlayComplete = false;
    setState('idle');
}

/**
 * 再生ステップ実行時に呼び出されるコールバックを設定します。
 * @param {Function} callback - (item, index) を引数に取る
 */
export function setOnPlayItem(callback) {
    _onPlayItemCallback = callback || (() => {});
}

/**
 * インターバルステップ実行時に呼び出されるコールバックを設定します。
 * @param {Function} callback - (item, index) を引数に取る
 */
export function setOnInterval(callback) {
    _onIntervalCallback = callback || (() => {});
}

/**
 * プレイリストが終了したときに呼び出されるコールバックを設定します。
 * @param {Function} callback
 */
export function setOnPlaylistEnd(callback) {
    _onPlaylistEndCallback = callback || (() => {});
}

/**
 * 状態変化時に通知を受け取るコールバック（任意）
 * @param {Function} callback - (state, currentIndex) を受け取る
 */
export function setOnStateChange(callback) {
    _onStateChangeCallback = callback || (() => {});
}

/**
 * プレイリストの実行を開始します。
 */
export function startPlaylist() {
    if (_isPlaying) {
        console.warn("[playlist-timer] Playlist is already running.");
        return;
    }
    if (_playlist.length === 0) {
        console.warn("[playlist-timer] Playlist is empty. Cannot start.");
        return;
    }

    _isPlaying = true;
    _currentIndex = 0;
    _awaitingPlayComplete = false;
    setState('running');
    executeNextItem();
}

/**
 * プレイリストの実行を停止します。
 * - インターバルタイマーをクリア
 * - MIDI 再生も確実に停止
 * - 状態を 'stopped' に遷移
 */
export function stopPlaylist() {
    if (!_isPlaying && _state !== 'waiting-play-complete') {
        // 実行中でも待ちでもない → 何もしない
        return;
    }

    _isPlaying = false;

    // インターバル中なら必ず止める
    if (_intervalTimer) {
        clearTimeout(_intervalTimer);
        _intervalTimer = null;
    }

    // 再生中なら必ず音を止める（待ちフラグは解除）
    if (_awaitingPlayComplete) {
        _awaitingPlayComplete = false;
    }
    try {
        stopMidiPlayback();
    } catch (e) {
        console.error('[playlist-timer] stopMidiPlayback failed:', e);
    }

    setState('stopped');
    console.log("[playlist-timer] Playlist stopped.");
}

/**
 * 現在の再生ステップが完了したことをタイマーに通知し、次のステップに進みます。
 */
export function playItemCompleted() {
    // 実行中で、かつ「play 完了待ち」のときだけ受け付ける
    if (!_isPlaying && !_awaitingPlayComplete) {
        return;
    }
    if (!_awaitingPlayComplete) {
        // 二度押し/二重発火ガード
        return;
    }

    console.log("[playlist-timer] Play item completed. Moving to next item.");
    _awaitingPlayComplete = false;
    _currentIndex++;
    executeNextItem();
}

// -------------------------------------------------------
// 内部：次のステップ実行
// -------------------------------------------------------
function executeNextItem() {
    // 停止要求が出ていれば何もしない
    if (!_isPlaying) {
        return;
    }

    // 最後まで行ったら終了
    if (_currentIndex >= _playlist.length) {
        console.log("[playlist-timer] Playlist finished.");
        _isPlaying = false;
        setState('finished');

        // 終了通知（UI 更新など）
        try { _onPlaylistEndCallback(); } catch (e) { console.error(e); }
        return;
    }

    const currentItem = _playlist[_currentIndex];

    if (currentItem.type === 'play') {
        // play ステップ：完了待ちモードに入る
        _awaitingPlayComplete = true;
        setState('waiting-play-complete');

        try {
            _onPlayItemCallback(currentItem, _currentIndex);
        } catch (e) {
            // コールバック内で例外が出たら、安全停止して状態を戻す
            console.error('[playlist-timer] onPlayItem callback threw:', e);
            _awaitingPlayComplete = false;
            _isPlaying = false;
            try { stopMidiPlayback(); } catch (ee) { console.error(ee); }
            setState('stopped');
            return;
        }

        console.log("[playlist-timer] Waiting for play item to complete...");
        return; // 完了は外部（playItemCompleted）から通知される
    }

    if (currentItem.type === 'interval') {
        setState('interval');

        try {
            _onIntervalCallback(currentItem, _currentIndex);
        } catch (e) {
            console.error('[playlist-timer] onInterval callback threw:', e);
            // 例外時は安全停止
            _isPlaying = false;
            try { stopMidiPlayback(); } catch (ee) { console.error(ee); }
            setState('stopped');
            return;
        }

        // インターバル（秒）→ ミリ秒
        const intervalMs = Math.max(0, (currentItem.duration || 0) * 1000);

        // 二重タイマーを避けるために必ずクリアしてから張る
        if (_intervalTimer) {
            clearTimeout(_intervalTimer);
            _intervalTimer = null;
        }

        _intervalTimer = setTimeout(() => {
            _intervalTimer = null;
            _currentIndex++;
            // インターバルが終わったら再度 running に戻す
            setState('running');
            executeNextItem();
        }, intervalMs);

        return;
    }

    // 不明な type はスキップ（ログだけ出して続行）
    console.warn('[playlist-timer] Unknown item type. Skipping:', currentItem);
    _currentIndex++;
    executeNextItem();
}
