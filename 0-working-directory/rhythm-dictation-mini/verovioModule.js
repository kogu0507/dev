/**
 * verovioModule.js
 * VerovioManagerの初期化、MEIデータの生成、楽譜のレンダリング、MIDI再生を管理するモジュール。
 */

// VerovioManager とレンダリングオプションをCDNからインポート
import { VerovioManager } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.3.0/verovio/verovio-manager.min.js';
import {
    defaultOptions,
    highResOptions,
    mobileOptions,
    printOptions,
    svgViewBox
} from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.3.0/verovio/render-options.js';

let verovioManagerInstance;
let globalMeiTemplate = ''; // MEIテンプレートを保持
let currentPart = null; // 現在再生中の Tone.js Partを保持

/**
 * ノートデータにデフォルトのピッチ名とオクターブを追加する。
 * これにより、楽譜表示とMIDI再生が確実に行われる。
 * @param {Array<Object>} rhythms - リズムデータの配列。
 * @returns {Array<Object>} デフォルトプロパティが追加されたリズムデータの配列。
 */
export const addDefaultNoteProperties = (rhythms) => {
    rhythms.forEach(rhythm => {
        rhythm.notes_data.forEach(note => {
            if (note.type === 'note') {
                if (note.pname === undefined) {
                    note.pname = 'g'; // デフォルトのピッチ名
                }
                if (note.oct === undefined) {
                    note.oct = 4; // デフォルトのオクターブ
                }
            }
        });
    });
    return rhythms;
};

/**
 * リズムノートデータオブジェクトからMEI XMLタグを生成するヘルパー関数。
 * @param {Object} noteData - ノート、休符、またはビームのデータオブジェクト。
 * @returns {string} 生成されたMEI XML文字列。
 */
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
        return `<beam>`;
    } else if (type === '/beam') {
        return `</beam>`;
    } else {
        console.warn(`Unknown music object type: ${type}. Returning empty string.`);
        return '';
    }
}

/**
 * VerovioManagerを初期化し、レンダリングオプションを設定する。
 * @param {string} meiTemplate - MEI XMLのテンプレート文字列。
 */
export async function initializeVerovio(meiTemplate) {
    globalMeiTemplate = meiTemplate; // テンプレートをモジュール内に保持
    verovioManagerInstance = new VerovioManager();
    console.log('Verovio Toolkitを初期化中...');
    try {
        await verovioManagerInstance.initialize();
        console.log('Verovio Toolkitの初期化が完了しました。');

        // Verovio のレンダリングオプションを設定
        verovioManagerInstance.setRenderOptions(svgViewBox);
    } catch (error) {
        console.error('Verovio Toolkitの初期化に失敗しました:', error);
        // エラー表示ハンドリング
        const questionTab = document.getElementById('question');
        if (verovioManagerInstance && typeof verovioManagerInstance.showError === 'function') {
            verovioManagerInstance.showError('楽譜の読み込みに失敗しました。ページをリロードしてください。', questionTab);
        } else if (questionTab) {
            questionTab.innerHTML = '<p style="color: red;">楽譜の読み込みに失敗しました。ページをリロードしてください。</p>';
        }
    }
}

/**
 * リズムデータとMEIテンプレートを組み合わせてMEI文字列を生成する関数。
 * @param {Object} rhythm1 - 1小節目のリズムオブジェクト。
 * @param {Object} rhythm2 - 2小節目のリズムオブジェクト。
 * @param {number} tempo - 現在のテンポ（BPM）。
 * @returns {string} 完全なMEI XML文字列。
 */
export function generateMeiFromRhythm(rhythm1, rhythm2, tempo) {
    if (!globalMeiTemplate) {
        console.error('MEIテンプレートが初期化されていません。');
        return '';
    }
    if (!rhythm1 || !rhythm2) {
        console.warn('リズムデータが不足しているため、MEIを生成できません。');
        return '';
    }

    // 1小節目と２小節目のノートデータをMEIタグに変換
    const notesXml1 = rhythm1.notes_data.map(note => createMusicTag(note)).join('\n');
    const notesXml2 = rhythm2.notes_data.map(note => createMusicTag(note)).join('\n');

    let meiString = globalMeiTemplate.replace('##placeholder_note1##', notesXml1);
    meiString = meiString.replace('##placeholder_note2##', notesXml2);
    meiString = meiString.replace('##placeholder_tempo##', tempo); // テンポを挿入

    return meiString;
}

/**
 * 生成されたMEI文字列をVerovioManagerで指定要素にSVGとして描画する関数。
 * @param {string} meiString - 描画するMEI XML文字列。
 * @param {string} targetId - SVGを差し込む要素のID。
 */
export async function renderMeiToElement(meiString, targetId) {
    if (!verovioManagerInstance) {
        console.error('VerovioManagerが初期化されていません。');
        return;
    }
    if (!meiString) {
        console.warn(`MEI文字列が空のため、${targetId}に楽譜を描画できません。`);
        const el = document.getElementById(targetId);
        if (el) {
            el.innerHTML = '<p>楽譜データがありません。</p>';
        }
        return;
    }

    const meiDataUri = 'data:application/mei+xml;charset=utf-8,' + encodeURIComponent(meiString);

    try {
        await verovioManagerInstance.displayMeiOnElement(meiDataUri, targetId);
    } catch (error) {
        console.error(`【renderMeiToElement】楽譜表示エラー (target: ${targetId}):`, error);
        const el = document.getElementById(targetId);
        if (el) {
            el.innerHTML = '<p>楽譜の表示中にエラーが発生しました。</p>';
        }
    }
}

/**
 * MEI の文字列を受け取り、MIDIを生成し、Tone.jsで再生する。
 * @param {string} meiString - 再生したいリズムのMEI XML文字列。
 * @param {Object} Tone - Tone.jsのグローバルオブジェクト。
 * @param {Object} Midi - @tonejs/midiのMidiクラス。
 * @param {Object} synth - Tone.jsのシンセサイザーインスタンス。
 * @param {number} volume - 再生音量 (0.0 - 1.0)。
 */
export async function playRhythmMidi(meiString, Tone, Midi, synth, volume) {
    if (!verovioManagerInstance || !Tone || !Midi || !synth) {
        console.error('必要なモジュール（VerovioManager, Tone.js, @tonejs/midi, シンセサイザー）がまだ初期化されていません。');
        return;
    }
    if (!meiString) {
        console.warn('再生するMEIデータがありません。');
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
            currentPart.stop(); // Partを停止
            currentPart.dispose(); // Part のリソースを解放
            currentPart = null;
            console.log('既存のMIDI再生を停止し、リソースを解放しました。');
        }

        // Tone.Transport を停止し、既存のイベントをクリア
        Tone.Transport.stop();
        Tone.Transport.cancel(); // これで以前のスケジュールが全てクリアされる

        // Transport が停止している場合のみ開始
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
            console.log('Tone.Transport Started.');
        }

        const meiDataUri = 'data:application/mei+xml;charset=utf-8,' + encodeURIComponent(meiString);
        const midiBuffer = await verovioManagerInstance.getMidiFromMei(meiDataUri);

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
        if (Tone && Tone.Transport) {
            Tone.Transport.stop();
        }
    }
}
