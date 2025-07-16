
// VerovioManager と Tone.js ローダーをCDNからインポート
import { VerovioManager } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.3.0/verovio/verovio-manager.min.js';
import {
    defaultOptions,
    highResOptions,
    mobileOptions,
    printOptions,
    svgViewBox
} from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.3.0/verovio/render-options.js';
// Tone.jsと@tonejs/midiのローダー
import { loadToneJs } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.3.0/tonejs/loader.min.mjs';
import { loadToneJsMidi } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.3.0/tonejs/tonejs-midi-loader.min.mjs';


// Add default pname and oct to rhythm data for notes that don't have it
// This makes sure notes are always visible on the staff and playable.
// It's also good practice to define a default for notes.
const addDefaultNoteProperties = (rhythms) => {
    rhythms.forEach(rhythm => {
        rhythm.notes_data.forEach(note => {
            if (note.type === 'note') {
                if (note.pname === undefined) {
                    note.pname = 'g'; // Default pitch name
                }
                if (note.oct === undefined) {
                    note.oct = 4; // Default octave
                }
            }
        });
    });
    return rhythms;
};


function createMusicTag(noteData) {
    const type = noteData.type; // 'note', 'rest', 'beam', '/beam'
    const noteId = noteData.noteId; // note, rest のみ
    const dur = noteData.dur; // note, rest のみ

    let attributes = '';

    if (type === 'note') {
        attributes = `xml:id="${noteId}" dur="${dur}"`;
        if (noteData.pname !== undefined) {
            attributes += ` pname="${noteData.pname}"`;
        }
        if (noteData.oct !== undefined) {
            attributes += ` oct="${noteData.oct}"`;
        }
        if (noteData.dots !== undefined) {
            attributes += ` dots="${noteData.dots}"`;
        }
        return `<note ${attributes}/>`;
    } else if (type === 'rest') {
        attributes = `xml:id="${noteId}" dur="${dur}"`;
        return `<rest ${attributes}/>`;
    } else if (type === 'beam') {
        // <beam> タグは基本的に属性を持たず、開始タグのみ
        return `<beam>`;
    } else if (type === '/beam') {
        // </beam> タグは終了タグのみ
        return `</beam>`;
    } else {
        console.warn(`Unknown music object type: ${type}. Returning empty string.`);
        return '';
    }
}


/**
 * リズムデータをMEI文字列に変換し、
 * VerovioManagerで指定要素にSVGとして描画する関数
 *
 * @param {Object} rhythm       - 表示したいリズムのオブジェクト
 * @param {string} meiTemplate  - MEI XML のテンプレート文字列
 * @param {string} targetId     - SVGを差し込む要素のID
 */
async function renderRhythm(rhythm1, rhythm2, meiTemplate, targetId, tempo) {
    // TODO: rhythm2を追加したから、中のコードを調整

    // 1. リズムデータからMEI文字列を生成
    const meiString = generateMeiFromRhythm(rhythm1, rhythm2, meiTemplate, tempo)

    // 2. Data URI形式にエンコード
    const meiDataUri =
        'data:application/mei+xml;charset=utf-8,' +
        encodeURIComponent(meiString);

    try {
        // 3. VerovioManager経由で描画
        await verovioManager.displayMeiOnElement(meiDataUri, targetId);
    } catch (error) {
        console.error(`【renderRhythm】楽譜表示エラー (target: ${targetId}):`, error);
        // フォールバック表示
        const el = document.getElementById(targetId);
        if (el) {
            el.innerHTML = '<p>楽譜の表示中にエラーが発生しました。</p>';
        }
    }
}

// VerovioManagerのインスタンスをグローバルまたは適切なスコープで保持
let verovioManager;
let currentMeiData = ''; // 現在表示されているリズムのMEIデータを保持

// Tone.js と @tonejs/midi のインスタンスを保持
let Tone; // Tone.js ライブラリ全体
let Midi; // @tonejs/midi の Midi クラス
let synth; // Tone.js のシンセサイザー
let currentPart; // 現在再生中の Tone.js Part


/**
 * リズムデータとMEIテンプレートを組み合わせてMEI文字列を生成する関数
 * @param {Object} rhythm - rhythms配列から選択された単一のリズムオブジェクト
 * @param {string} meiTemplate - MEIのXMLテンプレート文字列
 * @param {number} tempo - 現在のテンポ（BPM）
 * @returns {string} 完全なMEI XML文字列
 */
function generateMeiFromRhythm(rhythm1, rhythm2, meiTemplate, tempo) {
    // 1小節目と２小節目のノートデータをMEIタグに変換
    const notesXml1 = rhythm1.notes_data.map(note => createMusicTag(note)).join('\n');
    const notesXml2 = rhythm2.notes_data.map(note => createMusicTag(note)).join('\n'); // rhythm2もnotes_dataを持つと仮定

    let meiString = meiTemplate.replace('##placeholder_note1##', notesXml1);
    meiString = meiString.replace('##placeholder_note2##', notesXml2);
    meiString = meiString.replace('##placeholder_tempo##', tempo); // テンポを挿入

    return meiString;
}

// リズムデータとMEIテンプレートを取得
const allRhythms = addDefaultNoteProperties(JSON.parse(document.getElementById('rhythmData').textContent).rhythms);
const meiTemplate = document.getElementById('meiTemplate').textContent;

let currentQuestionRhythm1 = null; // 現在の問題のリズムデータを保持
let currentQuestionRhythm2 = null; // 現在の問題のリズムデータを保持
let selectedAnswerRhythm = null; // ユーザーが選択した解答のリズムデータを保持

/**
 * 新しい問題を生成し、楽譜を表示する関数
 */
async function generateNewQuestion() {
    // 既存のSVGをクリア
    // question-score-display は正解表示のため、answerタブに移動
    //document.querySelector('.question-score-display').innerHTML = '';
    document.querySelector('.correct-answer-display').innerHTML = '';
    document.querySelector('.selected-answer-display').innerHTML = '';
    document.querySelector('.user-select-buttons').innerHTML = ''; // ユーザー選択ボタンもクリア

    // ランダムにリズムを選択
    const randomIndex1 = Math.floor(Math.random() * allRhythms.length);
    const randomIndex2 = Math.floor(Math.random() * allRhythms.length);
    currentQuestionRhythm1 = allRhythms[randomIndex1];
    currentQuestionRhythm2 = allRhythms[randomIndex2];

    // ユーザー選択ボタンを生成
    allRhythms.forEach(rhythm => {
        const button = document.createElement('button');
        button.textContent = rhythm.description;
        button.dataset.rhythmId = rhythm.id;
        button.classList.add('user-rhythm-select-button');
        document.querySelector('.user-select-buttons').appendChild(button);
    });
    // ユーザー選択ボタンのイベントリスナーを再初期化
    initializeButton('.user-rhythm-select-button', handleUserRhythmSelection, true);

    // 正解MEIデータを生成し保持
    currentMeiData = generateMeiFromRhythm(currentQuestionRhythm1, currentQuestionRhythm2, meiTemplate, currentTempo);


    // 「正解の楽譜」を正しい答えの場所にレンダリング
    await renderRhythm(
        currentQuestionRhythm1,
        currentQuestionRhythm2,
        meiTemplate,
        'correct-answer-display',
        currentTempo
    );

    console.log('新しい問題が生成されました:');
    console.log('1小節目:', currentQuestionRhythm1.description);
    console.log('2小節目:', currentQuestionRhythm2.description);
}


/**
 * ユーザーがリズムを選択した際のハンドラ
 * @param {Event} event - クリックイベント
 */
async function handleUserRhythmSelection(event) {
    // 選択されたボタンをハイライト（オプション）
    document.querySelectorAll('.user-rhythm-select-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');

    const selectedRhythmId = event.target.dataset.rhythmId;
    selectedAnswerRhythm = allRhythms.find(r => r.id === selectedRhythmId);

    console.log('ユーザーが選択:', selectedAnswerRhythm.description);

    // ここで選択された解答の楽譜をすぐに更新する
    if (selectedAnswerRhythm) {
        await renderRhythm(
            selectedAnswerRhythm1,
            selectedAnswerRhythm2,
            meiTemplate,
            'selected-answer-display',
            currentTempo
        );
    } else {
        document.getElementById('selected-answer-display').innerHTML =
            '<p>解答が選択されていません。</p>';
    }
}


/**
 * スライダーの初期化と、値が変更された際の表示更新・コールバック実行を行う関数。
 * @param {string} sliderId - input type="range" 要素のID。
 * @param {string} displayId - 値を表示するspan要素のID。
 * @param {function} [callback] - (オプション) 値が変更された際に実行するコールバック関数。引数として新しい値が渡される。
 */
function initializeSlider(sliderId, displayId, callback) {
    const sliderElement = document.getElementById(sliderId); // スライダー要素を取得
    const displayElement = document.getElementById(displayId); // 表示要素を取得

    // スライダーと表示要素が両方存在することを確認
    if (sliderElement && displayElement) {
        // 初期表示値を設定
        displayElement.textContent = sliderElement.value;

        // スライダーの値が変更された際のイベントリスナーを設定
        sliderElement.addEventListener('input', () => {
            displayElement.textContent = sliderElement.value; // 表示を更新
            // コールバック関数が指定されていれば実行
            if (callback && typeof callback === 'function') {
                callback(sliderElement.value);
            }
        });
    } else {
        // 要素が見つからない場合は警告をコンソールに出力
        console.warn(`ID '${sliderId}' のスライダーまたは ID '${displayId}' の表示要素が見つかりません。`);
    }
}

/**
 * 単一または複数のボタンにイベントリスナーを設定し、クリック時にコールバックを実行する関数。
 * @param {string} selector - ボタンを特定するためのCSSセレクター（例: '.my-button', '#submitButton'）。
 * @param {function} callback - ボタンがクリックされた際に実行するコールバック関数。
 * @param {boolean} [isMultiple=false] - (オプション) セレクターが複数の要素にマッチする場合にtrueを設定。デフォルトはfalse（単一要素）。
 */
function initializeButton(selector, callback, isMultiple = false) {
    if (isMultiple) {
        // 複数のボタンにイベントを設定する場合
        const buttons = document.querySelectorAll(selector);
        if (buttons.length > 0) {
            buttons.forEach(button => {
                button.removeEventListener('click', callback); // Prevent duplicate listeners
                button.addEventListener('click', callback);
            });
        } else {
            console.warn(`セレクター '${selector}' にマッチするボタンが見つかりません。`);
        }
    } else {
        // 単一のボタンにイベントを設定する場合
        const button = document.querySelector(selector);
        if (button) {
            button.removeEventListener('click', callback); // Prevent duplicate listeners
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

        if (Tone && Tone.Transport) { // Tone.js がロードされていれば
            //Tone.Transport.bpm.value = currentTempo;
        }
        // VerovioManager のオプション更新は表示のためであり、MIDI再生テンポには直接影響しないかも
        // verovioManager.setOption({ mpm: currentTempo });
    });

    // 音量スライダーの初期化
    initializeSlider('volumeRange', 'currentVolumeValue', (volumeValue) => {
        currentVolume = parseInt(volumeValue, 10) / 100;
        console.log(`新しい音量: ${currentVolume}%`);
        if (synth && Tone) { // シンセサイザーとToneがロードされていればゲインを調整
            // 音量をデシベルに変換して設定
            synth.volume.value = Tone.gainToDb(currentVolume);
        }
    });
}

/**
 * 各種ボタンのイベントリスナーを初期化する関数。
 */
function initializeButtons() {
    // 「聴音を開始」ボタン
    initializeButton('.activation-button', async (event) => {
        console.log('「聴音を開始」ボタンがクリックされました。');

        Tone.start(); // AudioContextを起動
        Tone.Transport.start();


        // ウォームアップ音
        const now = Tone.now();
        synth.triggerAttackRelease("C5", "8n", now, currentVolume);
        synth.triggerAttackRelease("E5", "8n", now + 0.1, currentVolume);
        synth.triggerAttackRelease("G5", "16n", now + 0.2, currentVolume);

        // ウォームアップ音が鳴り終わった後に表示を切り替える（オプション：短いディレイを入れる）
        // ウォームアップ音の再生時間に合わせて調整
        await Tone.Transport.scheduleOnce(() => {
            // 「聴音を開始」ボタンを非表示にする
            event.target.classList.add('visually-hidden');

            // question-main から visually-hidden を削除して表示する
            document.querySelector('.question-main').classList.remove('visually-hidden');

            Tone.Transport.stop();
            //console.log('ウォームアップ後、Tone.Transportを停止しました。');

            // 最初の問題を生成
            //generateNewQuestion();
        }, now + 0.5); // ウォームアップ音の再生が完了する少し後 (例: 0.5秒後)
    });

    // 「出題音源を聴く（もう一度聴く）」と「解答音源を聴く」ボタン
    initializeButton('.play-correct-answer-button', async () => {
        console.log('「出題音源を聴く」または「解答音源を聴く」ボタンがクリックされました。');
        if (currentMeiData) {
            await playMidiFromMei(currentMeiData);
        } else {
            console.warn('再生するMEIデータがありません。');
        }
    }, true); // 複数ボタンに適用するためtrueを指定

    // 「解答を送信」ボタン
    initializeButton('.show-answer', async () => {
        console.log('「解答を送信」ボタンがクリックされました。');

        // ユーザー選択譜のレンダリングは handleUserRhythmSelection で既に行われるため、ここではタブ移動のみ
        location.hash = 'answer'; // answerタブに移動
    });

    // 「ユーザー選択音源を聴く」ボタン
    initializeButton('.play-selected-answer-button', async () => {
        console.log('「ユーザー選択音源を聴く」ボタンがクリックされました。');
        if (selectedAnswerRhythm) {
            const selectedMei = generateMeiFromRhythm(selectedAnswerRhythm, meiTemplate);
            await playMidiFromMei(selectedMei);
        } else {
            console.warn('ユーザーが解答を選択していません。');
        }
    });

    // 「新しい問題を生成」ボタン
    initializeButton('.new-question-button', () => {
        console.log('「新しい問題を生成」ボタンがクリックされました。');
        generateNewQuestion(); // 新しい問題を生成
        selectedAnswerRhythm = null; // ユーザー選択をリセット
        // 解答表示エリアをクリア
        document.getElementById('selected-answer-display').innerHTML = '';
        location.hash = 'question'; // questionタブに移動
    });
}


// テンポと音量を保持する変数
let currentTempo = 120; // デフォルトテンポ
let currentVolume = 0.7; // デフォルト音量 (0.0 - 1.0)


/**
 * MEI の生文字列を受け取り、
 * 1) Data URI に変換
 * 2) getMidiFromMei で ArrayBuffer を取得
 * 3) @tonejs/midi でパースし、Tone.js で再生
 */
async function playMidiFromMei(meiString) {
    // Tone.js とシンセサイザーが初期化されているか確認
    if (!verovioManager || !Tone || !Midi || !synth) {
        console.error('必要なモジュール（VerovioManager, Tone.js, @tonejs/midi, シンセサイザー）がまだ初期化されていません。');
        return;
    }

    try {
        // ユーザーインタラクションがあったときにのみ AudioContext を開始
        if (Tone.context.state !== 'running') {
            await Tone.start();
            console.log('AudioContext started');
        }

        // 既存の Part があれば停止・クリア
        if (currentPart) {
            //Tone.Transport.stop(); // Transport を停止
            currentPart.stop(); // Partを停止
            currentPart.dispose(); // Part のリソースを解放
            currentPart = null;
            console.log('既存のMIDI再生を停止し、リソースを解放しました。');
        }


        //console.log("Tone.Transport.state: ", Tone.Transport.state);

        // Transport が停止している場合のみ開始
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
            //console.log('Tone.Transport Started.');
        }


        const meiDataUri = 'data:application/mei+xml;charset=utf-8,' + encodeURIComponent(meiString);
        const midiBuffer = await verovioManager.getMidiFromMei(meiDataUri);

        // @tonejs/midi で MIDI バイナリをパース
        const midi = new Midi(midiBuffer);


        const notesToPlay = [];
        // MIDI ファイルのすべてのノートイベントを収集
        midi.tracks.forEach(track => {
            track.notes.forEach(note => {
                notesToPlay.push({
                    time: note.time,
                    midi: note.midi,
                    duration: note.duration,
                    velocity: note.velocity
                });
                console.log("note.time: ", note.time);
            });
        });


        // ノートを時間順にソート（必須ではないが、良い習慣）
        notesToPlay.sort((a, b) => a.time - b.time);

        // Tone.Part を作成し、ノートイベントをスケジュール
        currentPart = new Tone.Part((time, value) => {
            synth.triggerAttackRelease(
                Tone.Midi(value.midi).toNote(), // MIDI番号を音名に変換（例: 'C4'）
                value.duration,
                time,
                value.velocity
            );
        }, notesToPlay).start(0); // 0秒から再生開始

        // MIDIファイルの全体の長さを取得して、再生終了をスケジュール
        // これにより、再生終了時に Part を停止・クリアできる
        const totalDuration = midi.duration;
        Tone.Transport.scheduleOnce(() => {
            console.log('MIDI 再生が終了しました。');
            if (currentPart) {
                currentPart.dispose(); // Part のリソースを解放
                currentPart = null;
            }
            Tone.Transport.stop(); // 再生終了時にTransportも停止
        }, `+${totalDuration}`);

        // Tone.Transport のテンポを現在の設定に更新
        //Tone.Transport.bpm.value = currentTempo;

        // Tone.Transport を開始して再生を開始
        Tone.Transport.start();
        console.log('MIDI 再生を開始しました。');

    } catch (err) {
        console.error('MIDI 再生に失敗しました:', err);
        // エラーが発生した場合も、既存の Part をクリーンアップ
        if (currentPart) {
            currentPart.dispose();
            currentPart = null;
        }
        Tone.Transport.stop();
    }
}


// DOMContentLoadedのイベントリスナーをasyncにする
document.addEventListener('DOMContentLoaded', async () => {
    // ページロード時にURLハッシュをクリア
    if (window.location.hash) {
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
        console.log('URLハッシュをクリアしました。');
        location.hash = 'question'; // answerタブに移動

    }

    initializeSliders(); // スライダーの初期化
    initializeButtons(); // ボタンの初期化


    // question-main を初期状態で非表示
    document.querySelector('.question-main').classList.add('visually-hidden');

    // Tone.js と @tonejs/midi のロード
    // この順番が重要: Tone.js を先にロードする
    try {
        await loadToneJs(); // Tone.js のスクリプトをロード
        Tone = window.Tone; // グローバルな Tone オブジェクトを代入

        Midi = await loadToneJsMidi();
        console.log('Tone.js と @tonejs/midi のロードが完了しました。');

        // Tone.js シンセサイザーの初期化
        synth = new Tone.Synth().toDestination();
        synth.volume.value = Tone.gainToDb(currentVolume); // 初期音量設定
        //Tone.Transport.bpm.value = currentTempo; // 初期テンポ設定

    } catch (error) {
        console.error('Tone.js または @tonejs/midi のロードに失敗しました:', error);
        // 致命的なエラーなので、ユーザーに通知するなどの処理が必要
        document.body.innerHTML = '<p style="color: red;">音楽再生機能のロードに失敗しました。ページをリロードしてください。</p>';
        return; // これ以上処理を進めない
    }

    // VerovioManagerの初期化
    verovioManager = new VerovioManager();
    console.log('Verovio Toolkitを初期化中...');
    try {
        await verovioManager.initialize();
        console.log('Verovio Toolkitの初期化が完了しました。');

        // Verovio のレンダリングオプションを設定
        verovioManager.setRenderOptions(svgViewBox);

        // 初期化後、最初の問題を生成して表示
        generateNewQuestion();
    } catch (error) {
        console.error('Verovio Toolkitの初期化に失敗しました:', error);
        // エラー表示ハンドリング
        const questionTab = document.getElementById('question');
        if (verovioManager && typeof verovioManager.showError === 'function') {
            verovioManager.showError('楽譜の読み込みに失敗しました。ページをリロードしてください。', questionTab);
        } else {
            questionTab.innerHTML = '<p style="color: red;">楽譜の読み込みに失敗しました。ページをリロードしてください。</p>';
        }
    }
});
