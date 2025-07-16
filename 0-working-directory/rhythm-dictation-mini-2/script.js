/**
 * script.js
 * Rhythm Dictation Mini アプリケーションのメインスクリプトファイル。
 * アプリケーションの初期化、主要なDOM要素の取得、各コンポーネントの初期化、
 * および全体のロジックフローを管理する。
 */

import { initializeRhythmButtons } from './rhythmButtons.js';
import { initializeActivationButton } from './activationButton.js';
import {
    initializeVerovio,
    generateMeiFromRhythm,
    renderMeiToElement,
    playRhythmMidi,
    addDefaultNoteProperties
} from './verovioModule.js';

// Tone.jsと@tonejs/midiのローダー
import { loadToneJs } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.3.0/tonejs/loader.min.mjs';
import { loadToneJsMidi } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.3.0/tonejs/tonejs-midi-loader.min.mjs';

// グローバルなTone.jsとMidiのインスタンス
let Tone;
let Midi;
let synth; // Tone.jsのシンセサイザーインスタンス

// アプリケーションの状態変数
let currentVolume = 0.7; // 初期音量 (0.0 - 1.0)
let currentTempo = 80; // 初期テンポ (BPM)
let allRhythms = []; // rhythmData.jsonから読み込む全リズムデータ
let meiTemplateString = ''; // mei_template.xmlから読み込むMEIテンプレート文字列

let currentQuestionRhythm1 = null; // 現在の問題の1小節目リズムデータ
let currentQuestionRhythm2 = null; // 現在の問題の2小節目リズムデータ
let selectedRhythmIdFirstHalf = null; // ユーザーが選択した前半のリズムID
let selectedRhythmIdSecondHalf = null; // ユーザーが選択した後半のリズムID

/**
 * 新しい問題を生成し、楽譜を表示する関数。
 * ランダムなリズムを選択し、MEIを生成して表示する。
 */
async function generateNewQuestion() {
    console.log('新しい問題が生成されました！');
    if (allRhythms.length < 2) {
        console.error('リズムデータが不足しています。少なくとも2つのリズムが必要です。');
        document.getElementById('correct-answer-display').innerHTML = '<p style="color: red;">リズムデータが不足しています。</p>';
        return;
    }
    if (!meiTemplateString) {
        console.error('MEIテンプレートが読み込まれていません。');
        document.getElementById('correct-answer-display').innerHTML = '<p style="color: red;">MEIテンプレートの読み込みに失敗しました。</p>';
        return;
    }

    // 既存のSVGをクリア
    document.getElementById('correct-answer-display').innerHTML = '';
    document.getElementById('selected-answer-display').innerHTML = '';

    // ユーザー選択表示エリアをリセット
    document.querySelector('.first-half-display').innerHTML = '<p>前半</p>';
    document.querySelector('.second-half-display').innerHTML = '<p>後半</p>';

    // ユーザー選択ボタンもクリアし、再生成
    const userSelectButtonsContainer = document.querySelector('.user-select-buttons');
    userSelectButtonsContainer.innerHTML = ''; // 既存のボタンをクリア
    // 選択状態のボタンもリセット
    document.querySelectorAll('.rhythm-select-button.selected').forEach(btn => btn.classList.remove('selected'));

    // ユーザー選択リズムIDをリセット
    selectedRhythmIdFirstHalf = null;
    selectedRhythmIdSecondHalf = null;

    // ランダムに2つの異なるリズムを選択
    let rhythm1, rhythm2;
    do {
        rhythm1 = allRhythms[Math.floor(Math.random() * allRhythms.length)];
        rhythm2 = allRhythms[Math.floor(Math.random() * allRhythms.length)];
    } while (rhythm1.id === rhythm2.id); // 同じリズムが連続しないように

    currentQuestionRhythm1 = rhythm1;
    currentQuestionRhythm2 = rhythm2;

    // 正解MEIデータを生成し保持
    // meiTemplateString を generateMeiFromRhythm に渡すように変更
    const correctMeiData = generateMeiFromRhythm(currentQuestionRhythm1, currentQuestionRhythm2, currentTempo, meiTemplateString);

    // 「正解の楽譜」を正しい答えの場所にレンダリング
    await renderMeiToElement(correctMeiData, 'correct-answer-display');

    console.log('新しい問題が生成されました:');
    console.log('1小節目:', currentQuestionRhythm1.description);
    console.log('2小節目:', currentQuestionRhythm2.description);

    // ユーザー選択ボタンを再初期化 (新しい問題ごとにボタンを再生成するため)
    const firstHalfDisplay = document.querySelector('.first-half-display');
    const secondHalfDisplay = document.querySelector('.second-half-display');
    const rhythmPositionRadios = document.querySelectorAll('input[name="rhythm-position"]');
    initializeRhythmButtons(userSelectButtonsContainer, firstHalfDisplay, secondHalfDisplay, rhythmPositionRadios, handleUserRhythmSelected);

    //console.log("correctMeiData: ", correctMeiData);
}

/**
 * ユーザーがリズムボタンを選択した際のコールバック関数。
 * 選択されたリズムのIDと位置を状態変数に保存する。
 * @param {string} rhythmId - 選択されたリズムのID。
 * @param {string} selectedPosition - 'first' または 'second'。
 */
async function handleUserRhythmSelected(rhythmId, selectedPosition) {
    console.log(`ユーザーがリズム '${rhythmId}' を '${selectedPosition}' に選択しました。`);

    if (selectedPosition === 'first') {
        selectedRhythmIdFirstHalf = rhythmId;
    } else {
        selectedRhythmIdSecondHalf = rhythmId;
    }

    // ユーザー選択表示エリアの楽譜を更新（必要であれば）
    // この関数はrhythmButtons.jsでDOMを直接更新しているので、ここでは状態更新のみ
    // ただし、もしユーザー選択音源を再生する前に楽譜を結合して表示したい場合は、
    // ここで generateMeiFromRhythm と renderMeiToElement を呼び出す。
    // 例:
    // if (selectedRhythmIdFirstHalf && selectedRhythmIdSecondHalf) {
    //     const selectedRhythm1 = allRhythms.find(r => r.id === selectedRhythmIdFirstHalf);
    //     const selectedRhythm2 = allRhythms.find(r => r.id === selectedRhythmIdSecondHalf);
    //     const userMeiString = generateMeiFromRhythm(selectedRhythm1, selectedRhythm2, currentTempo, meiTemplateString);
    //     await renderMeiToElement(userMeiString, 'selected-answer-display');
    // }
}


/**
 * スライダーの初期化と、値が変更された際の表示更新・コールバック実行を行う関数。
 * @param {string} sliderId - input type="range" 要素のID。
 * @param {string} displayId - 値を表示するspan要素のID。
 * @param {function} [callback] - (オプション) 値が変更された際に実行するコールバック関数。引数として新しい値が渡される。
 */
function initializeSlider(sliderId, displayId, callback) {
    const sliderElement = document.getElementById(sliderId);
    const displayElement = document.getElementById(displayId);

    if (sliderElement && displayElement) {
        displayElement.textContent = sliderElement.value;

        sliderElement.addEventListener('input', () => {
            displayElement.textContent = sliderElement.value;
            if (callback && typeof callback === 'function') {
                callback(sliderElement.value);
            }
        });
    } else {
        console.warn(`ID '${sliderId}' のスライダーまたは ID '${displayId}' の表示要素が見つかりません。`);
    }
}

/**
 * 単一または複数のボタンにイベントリスナーを設定し、クリック時にコールバックを実行する関数。
 * @param {string} selector - ボタンを特定するためのCSSセレクター。
 * @param {function} callback - ボタンがクリックされた際に実行するコールバック関数。
 * @param {boolean} [isMultiple=false] - セレクターが複数の要素にマッチする場合にtrueを設定。
 */
function initializeButton(selector, callback, isMultiple = false) {
    if (isMultiple) {
        const buttons = document.querySelectorAll(selector);
        if (buttons.length > 0) {
            buttons.forEach(button => {
                // 既存のリスナーを削除することで、複数回初期化されても重複しないようにする
                button.removeEventListener('click', callback);
                button.addEventListener('click', callback);
            });
        } else {
            console.warn(`セレクター '${selector}' にマッチするボタンが見つかりません。`);
        }
    } else {
        const button = document.querySelector(selector);
        if (button) {
            // 既存のリスナーを削除することで、複数回初期化されても重複しないようにする
            button.removeEventListener('click', callback);
            button.addEventListener('click', callback);
        } else {
            console.warn(`セレクター '${selector}' のボタンが見つかりません。`);
        }
    }
}

/**
 * すべてのスライダーのイベントリスナーを初期化する関数。
 */
function initializeSliders() {
    // テンポスライダーの初期化
    initializeSlider('tempoRange', 'currentTempoValue', (tempoValue) => {
        currentTempo = parseInt(tempoValue, 10);
        console.log(`新しいテンポ: ${currentTempo} BPM`);
        if (Tone && Tone.Transport) {
            Tone.Transport.bpm.value = currentTempo; // Tone.js Transportのテンポを更新
        }
    });

    // 音量スライダーの初期化
    initializeSlider('volumeRange', 'currentVolumeValue', (volumeValue) => {
        currentVolume = parseInt(volumeValue, 10) / 100; // 0-100を0-1に変換
        console.log(`新しい音量: ${currentVolume * 100}%`);
        if (synth && Tone) {
            synth.volume.value = Tone.gainToDb(currentVolume); // シンセサイザーの音量を更新
        }
    });
}

/**
 * 各種ボタンのイベントリスナーを初期化する関数。
 */
function initializeButtons() {
    const questionMain = document.querySelector('.question-main');
    const activationButton = document.querySelector('.activation-button');

    // 「聴音を開始」ボタン (activationButton.jsで初期化されるため、ここでは呼び出しのみ)
    initializeActivationButton(activationButton, questionMain, synth, currentVolume);

    // 「出題音源を聴く（もう一度聴く）」と「解答音源を聴く」ボタン
    initializeButton('.play-correct-answer-button', async () => {
        console.log('「出題音源を聴く」または「解答音源を聴く」ボタンがクリックされました。');
        if (currentQuestionRhythm1 && currentQuestionRhythm2) {
            // meiTemplateString を generateMeiFromRhythm に渡すように変更
            const meiString = generateMeiFromRhythm(currentQuestionRhythm1, currentQuestionRhythm2, currentTempo, meiTemplateString);
            await playRhythmMidi(meiString, Tone, Midi, synth, currentVolume);
        } else {
            console.warn('再生する問題のMEIデータがありません。');
        }
    }, true); // 複数ボタンに適用するためtrueを指定

    // 「解答を送信」ボタン
    initializeButton('.show-answer', async () => {
        console.log('「解答を送信」ボタンがクリックされました。');

        // ユーザーが両方のリズムを選択しているか確認
        if (!selectedRhythmIdFirstHalf || !selectedRhythmIdSecondHalf) {
            console.warn('解答を送信するには、前半と後半の両方のリズムを選択してください。');
            // ユーザーに通知するUIを追加することも可能
            return;
        }

        const selectedRhythm1 = allRhythms.find(r => r.id === selectedRhythmIdFirstHalf);
        const selectedRhythm2 = allRhythms.find(r => r.id === selectedRhythmIdSecondHalf);

        if (selectedRhythm1 && selectedRhythm2) {
            // meiTemplateString を generateMeiFromRhythm に渡すように変更
            const userMeiString = generateMeiFromRhythm(selectedRhythm1, selectedRhythm2, currentTempo, meiTemplateString);
            await renderMeiToElement(userMeiString, 'selected-answer-display');
        } else {
            document.getElementById('selected-answer-display').innerHTML = '<p>選択された解答の表示中にエラーが発生しました。</p>';
        }

        // タブを解答タブに切り替える
        const answerTabButton = document.querySelector('.tab-button[data-tab="answer"]');
        if (answerTabButton) {
            answerTabButton.click(); // simple-tab-componentの機能を利用してタブを切り替える
        }
    });

    // 「ユーザー選択音源を聴く」ボタン
    initializeButton('.play-selected-answer-button', async () => {
        console.log('「ユーザー選択音源を聴く」ボタンがクリックされました。');
        if (selectedRhythmIdFirstHalf && selectedRhythmIdSecondHalf) {
            const selectedRhythm1 = allRhythms.find(r => r.id === selectedRhythmIdFirstHalf);
            const selectedRhythm2 = allRhythms.find(r => r.id === selectedRhythmIdSecondHalf);
            if (selectedRhythm1 && selectedRhythm2) {
                // meiTemplateString を generateMeiFromRhythm に渡すように変更
                const selectedMei = generateMeiFromRhythm(selectedRhythm1, selectedRhythm2, currentTempo, meiTemplateString);
                await playRhythmMidi(selectedMei, Tone, Midi, synth, currentVolume);
            } else {
                console.warn('選択されたリズムデータが見つかりません。');
            }
        } else {
            console.warn('ユーザーが前半と後半のリズムを両方選択していません。');
        }
    });

    // 「新しい問題を生成」ボタン
    initializeButton('.new-question-button', () => {
        console.log('「新しい問題を生成」ボタンがクリックされました。');
        generateNewQuestion(); // 新しい問題を生成
        // ユーザー選択をリセット
        selectedRhythmIdFirstHalf = null;
        selectedRhythmIdSecondHalf = null;
        // 解答表示エリアをクリア (generateNewQuestionでもクリアされるが念のため)
        document.getElementById('selected-answer-display').innerHTML = '<p>ここにあなたの選択が表示されます</p>';
        document.querySelector('.first-half-display').innerHTML = '<p>前半</p>';
        document.querySelector('.second-half-display').innerHTML = '<p>後半</p>';
        location.hash = 'question'; // questionタブに移動
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    // ページロード時にURLハッシュをクリアし、questionタブに移動
    if (window.location.hash) {
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
        console.log('URLハッシュをクリアしました。');
    }
    // simple-tab-componentが初期化された後にタブを切り替えるため、少し遅延させる
    setTimeout(() => {
        const questionTabButton = document.querySelector('.tab-button[data-tab="question"]');
        if (questionTabButton) {
            questionTabButton.click();
        }
    }, 100); // 100msの遅延

    // question-main を初期状態で非表示
    document.querySelector('.question-main').classList.add('visually-hidden');

    // Tone.js と @tonejs/midi のロード
    try {
        await loadToneJs(); // Tone.js のスクリプトをロード
        Tone = window.Tone; // グローバルな Tone オブジェクトを代入

        Midi = await loadToneJsMidi(); // @tonejs/midi の Midi クラスをロード
        console.log('Tone.js と @tonejs/midi のロードが完了しました。');

        // Tone.js シンセサイザーの初期化
        synth = new Tone.Synth().toDestination();
        synth.volume.value = Tone.gainToDb(currentVolume); // 初期音量設定
        Tone.Transport.bpm.value = currentTempo; // 初期テンポ設定

    } catch (error) {
        console.error('Tone.js または @tonejs/midi のロードに失敗しました:', error);
        document.body.innerHTML = '<p style="color: red;">音楽再生機能のロードに失敗しました。ページをリロードしてください。</p>';
        return;
    }

    // MEIテンプレートとリズムデータを外部ファイルから読み込む
    try {
        const rhythmResponse = await fetch('rhythms.json');
        if (!rhythmResponse.ok) {
            throw new Error(`Failed to load rhythms.json: ${rhythmResponse.statusText}`);
        }
        const rhythmData = await rhythmResponse.json();
        allRhythms = addDefaultNoteProperties(rhythmData.rhythms); // デフォルトプロパティを追加
        console.log('rhythms.json の読み込みが完了しました。');

        const meiTemplateResponse = await fetch('mei_template.xml'); // ファイル名を .mei から .xml に変更しました
        if (!meiTemplateResponse.ok) {
            throw new Error(`Failed to load mei_template.xml: ${meiTemplateResponse.statusText}`);
        }
        meiTemplateString = await meiTemplateResponse.text();
        console.log('mei_template.xml の読み込みが完了しました。');

    } catch (e) {
        console.error('データファイルの読み込みに失敗しました:', e);
        document.body.innerHTML = `<p style="color: red;">データファイルのロードに失敗しました: ${e.message}</p>`;
        return;
    }

    // VerovioManagerを初期化
    await initializeVerovio(meiTemplateString); // 読み込んだテンプレート文字列を渡す

    // スライダーとボタンの初期化
    initializeSliders();
    initializeButtons();

    // 初期化後、最初の問題を生成して表示
    generateNewQuestion();
});