// script.js
/*
TODO: 1度問題。
C♮とC#みたいな増１度の時、楽譜の見た目が対応していない。強制的に臨時記号表示にするか？
*/

import { LANGUAGE, qualityTranslations, translateIntervalAnalysis, toggleLang, getTranslation, QUALITY } from './modules/localization.js';
import { loadVerovio } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.2.1/verovio/loader.min.mjs';


let verovioToolkit = null; // Verovioインスタンスを保持

// --- 共通の定数とヘルパー関数 ---

// 各音符の半音値（C0を基準とした相対値）
// Db, Eb, Gb, Ab, Bb を小文字の 'b' で統一
const noteSemitoneValue = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
    'A#': 10, 'Bb': 10, 'B': 11
};

// 自然音符の順序 (度数計算用)
const naturalNoteOrder = {
    'C': 1, 'D': 2, 'E': 3, 'F': 4, 'G': 5, 'A': 6, 'B': 7
};

// MIDI値から最も一般的なシャープ/ナチュラル表記へのマップ
const midiToSharpNoteName = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

// MIDI値から最も一般的なフラット/ナチュラル表記へのマップ
const midiToFlatNoteName = [
    'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
];

// 幹音のみのMIDI半音値
const naturalSemitoneValuesInOctave = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B


// Verovioの初期化
async function initializeAndRenderVerovio(bottomNote, topNote) {
    const verovioViewer = document.getElementById('verovioViewer');
    const verovioStatus = document.getElementById('verovioStatus'); // 日本語ステータス
    const verovioStatusEn = document.getElementById('verovioStatusEn'); // 英語ステータス

    // ロード中のUIフィードバック
    verovioStatus.textContent = '楽譜を生成中…';
    verovioStatusEn.textContent = 'Generating score…';
    verovioViewer.innerHTML = ''; // 既存の表示をクリア

    try {
        if (!verovioToolkit) {
            // Verovioがまだロードされていない場合のみロードと初期化
            verovioStatus.textContent = 'Verovio をロード中…';
            verovioStatusEn.textContent = 'Loading Verovio…';
            verovioToolkit = await loadVerovio();
            verovioStatus.textContent = 'Verovio 初期化完了。';
            verovioStatusEn.textContent = 'Verovio initialized.';
        }

        // ここで、渡された音符からMEI XML文字列を動的に作成します。
        // この createMeiFromNotes 関数は、あなたのアプリのロジックに合わせて実装してください。
        const meiData = createMeiFromNotes(bottomNote, topNote);

        verovioToolkit.loadData(meiData);
        verovioToolkit.setOptions({
            //pageWidth: 300,
            adjustPageWidth: true, // 表示領域に合わせて調整
            adjustPageHeight: true,
            footer: "none",
            pageMarginLeft: 0,
            // 右マージンを0にする
            pageMarginRight: 0,

            //noJustification: true,

            scale: 90


        });

        const svg = verovioToolkit.renderToSVG(1, {});
        verovioViewer.innerHTML = svg;
        verovioStatus.textContent = '楽譜のレンダリング完了！';
        verovioStatusEn.textContent = 'Score rendering complete!';

    } catch (error) {
        console.error('楽譜のロードまたはレンダリング中にエラー:', error);
        verovioStatus.textContent = `エラー: ${error.message}`;
        verovioStatusEn.textContent = `Error: ${error.message}`;
    }
    // finallyブロックは、この関数外の呼び出し元（例: ボタンクリックイベント）で、
    // ボタンの無効化解除などを行う場合に使用すると良いでしょう。
}

// 音符からMEIを生成するヘルパー関数
// あなたのアプリのロジックに合わせて実装が必要です。
function createMeiFromNotes(note1, note2) {
    // 例: "C4" -> "c", "4"
    const parseNote = (noteString) => {
        const matches = noteString.match(/^([A-Ga-g])([#b]?)([0-8])$/); // 音名、変化記号、オクターブに分割
        if (!matches) return null;

        let basePname = matches[1].toLowerCase(); // c, d, e, f, g, a, b
        let accid = '';
        if (matches[2] === '#') {
            accid = 's'; // sharp
        } else if (matches[2] === 'b') {
            accid = 'f'; // flat
        }

        return {
            pname: basePname,
            accid: accid, // 新しくaccid属性を追加
            oct: matches[3] // オクターブのインデックスが変わるので注意
        };
    };

    const parsedNote1 = parseNote(note1);
    const parsedNote2 = parseNote(note2);

    if (!parsedNote1 || !parsedNote2) {
        console.error("Invalid note format for MEI generation:", note1, note2);
        // エラーを投げるか、デフォルトのMEIを返すか、適切なエラーハンドリングを行う
        return `<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0"><music><body><mdiv><score><scoreDef><staffGrp><staffDef n="1" clef.shape="G" clef.line="2"/></staffGrp></scoreDef><section><measure n="1"><staff n="1"><layer n="1"><rest dur="4"/></layer></staff></measure></section></score></mdiv></body></music></mei>`;
    }


    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0">
    <meiHead>
        <fileDesc>
            <titleStmt><title>${note1}-${note2}</title></titleStmt>
            <pubStmt/>
        </fileDesc>
    </meiHead>
    <music>
        <body>
            <mdiv>
                <score>
                    <scoreDef>
                        <staffGrp>
                            <staffDef n="1" lines="5" clef.shape="G" clef.line="2" /> 
                        </staffGrp>
                    </scoreDef>
                    <section>
                        <measure n="1">
                            <staff n="1">
                                <layer n="1">
                                    <chord dur="1">
                                        <note pname="${parsedNote1.pname}" accid="${parsedNote1.accid}" oct="${parsedNote1.oct}" />
                                        <note pname="${parsedNote2.pname}" accid="${parsedNote2.accid}" oct="${parsedNote2.oct}" />
                                    </chord>
                                </layer>
                            </staff>
                        </measure>
                    </section>
                </score>
            </mdiv>
        </body>
    </music>
</mei>`;
}




/**
 * 音符文字列を解析し、音名とオクターブ番号を抽出する関数
 * @param {string} noteString - 例: "C#4", "Db5", "A3"
 * @returns {object|null} { noteName: string, octave: number } または null (解析失敗時)
 */
function parseNoteString(noteString) {
    const cleanedNote = noteString.trim();
    const match = cleanedNote.match(/^([A-G][#b]?)(-?\d+)$/i);
    if (!match) {
        return null;
    }
    let noteName = match[1];
    let octave = parseInt(match[2], 10);

    if (noteName.length > 1 && noteName[1].toLowerCase() === 'b') {
        noteName = noteName[0].toUpperCase() + 'b';
    } else {
        noteName = noteName.toUpperCase();
    }
    return { noteName, octave };
}

/**
 * 音符文字列からMIDI鍵盤番号を取得する関数
 * @param {string} noteString - 例: "C4", "C#4", "Db5"
 * @returns {number|null} MIDI鍵盤番号 (0-127) または null (解析失敗時)
 */
function getMidiKeyNumber(noteString) {
    const parsed = parseNoteString(noteString);
    if (!parsed) {
        return null;
    }
    let { noteName, octave } = parsed;

    const semitone = noteSemitoneValue[noteName];
    if (semitone === undefined) {
        return null;
    }

    return semitone + (octave + 1) * 12;
}

/**
 * 2つの音符間の幹音の度数を計算する関数 (例: CとEなら3度)
 * @param {string} bottomNote - 開始音符
 * @param {string} topNote - 終了音符
 * @returns {number|string} 幹音の度数 (1-8+) またはエラーメッセージ
 */
function getNaturalDegree(bottomNote, topNote) {
    const parsedBottom = parseNoteString(bottomNote);
    const parsedTop = parseNoteString(topNote);

    if (!parsedBottom || !parsedTop) {
        return "Invalid note format for degree calculation.";
    }

    const bottomNatural = parsedBottom.noteName[0];
    const topNatural = parsedTop.noteName[0];

    const bottomOrder = naturalNoteOrder[bottomNatural];
    const topOrder = naturalNoteOrder[topNatural];

    if (bottomOrder === undefined || topOrder === undefined) {
        return "Could not determine natural degree due to invalid natural note names.";
    }

    let degree = topOrder - bottomOrder + 1;
    const octaveDiff = parsedTop.octave - parsedBottom.octave;

    if (octaveDiff > 0) {
        degree += (octaveDiff * 7);
    } else if (octaveDiff < 0) {
        if (degree <= 0) {
            degree += 7;
        }
    }
    return degree;
}

/**
 * 幹音の度数と実際の半音数から音程の質を示す定数を判断する関数
 * @param {number} degree 幹音の度数
 * @param {number} semitones 半音数
 * @returns {string} 音程の質を表す定数 (例: QUALITY.MAJOR, QUALITY.MINOR)
 */
function getIntervalQuality(degree, semitones) {
    switch (degree) {
        case 1:
            if (semitones === 0) return QUALITY.PERFECT;
            if (semitones === 1) return QUALITY.AUGMENTED;
            break;
        case 2:
            if (semitones === 1) return QUALITY.MINOR;
            if (semitones === 2) return QUALITY.MAJOR;
            if (semitones === 3) return QUALITY.AUGMENTED;
            break;
        case 3:
            if (semitones === 3) return QUALITY.MINOR;
            if (semitones === 4) return QUALITY.MAJOR;
            if (semitones === 5) return QUALITY.AUGMENTED;
            break;
        case 4:
            if (semitones === 4) return QUALITY.DIMINISHED;
            if (semitones === 5) return QUALITY.PERFECT;
            if (semitones === 6) return QUALITY.AUGMENTED;
            break;
        case 5:
            if (semitones === 6) return QUALITY.DIMINISHED;
            if (semitones === 7) return QUALITY.PERFECT;
            if (semitones === 8) return QUALITY.AUGMENTED;
            break;
        case 6:
            if (semitones === 8) return QUALITY.MINOR;
            if (semitones === 9) return QUALITY.MAJOR;
            if (semitones === 10) return QUALITY.AUGMENTED;
            break;
        case 7:
            if (semitones === 10) return QUALITY.MINOR;
            if (semitones === 11) return QUALITY.MAJOR;
            if (semitones === 12) return QUALITY.AUGMENTED;
            break;
        case 8:
            if (semitones === 12) return QUALITY.PERFECT;
            break;
        case 9:
            if (semitones === 13) return QUALITY.MINOR;
            if (semitones === 14) return QUALITY.MAJOR;
            if (semitones === 15) return QUALITY.AUGMENTED;
            break;
        case 10:
            if (semitones === 15) return QUALITY.MINOR;
            if (semitones === 16) return QUALITY.MAJOR;
            if (semitones === 17) return QUALITY.AUGMENTED;
            break;
        case 11:
            if (semitones === 17) return QUALITY.PERFECT;
            if (semitones === 18) return QUALITY.AUGMENTED;
            break;
        case 12:
            if (semitones === 18) return QUALITY.DIMINISHED;
            if (semitones === 19) return QUALITY.PERFECT;
            if (semitones === 20) return QUALITY.AUGMENTED;
            break;
        case 13:
            if (semitones === 20) return QUALITY.MINOR;
            if (semitones === 21) return QUALITY.MAJOR;
            if (semitones === 22) return QUALITY.AUGMENTED;
            break;
    }
    return QUALITY.ERROR;
}

/**
 * 数字に英語の序数表記 (st, nd, rd, th) を付加する
 * @param {number} num - 数字
 * @returns {string} 序数表記が付加された文字列 (例: "1st", "2nd", "3rd", "4th")
 */
function getOrdinalSuffix(num) {
    const s = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

// --- 分析関数: analyzeInterval ---
/**
 * 2つの音符間の音楽的な関係を詳細に分析する関数
 * @param {string} bottomNote 開始音符 (例: "C4", "C#4", "Db5")
 * @param {string} topNote 終了音符 (例: "E4", "F#5")
 * @returns {object} 音程の詳細を含むオブジェクト、またはエラーオブジェクト
*/
function analyzeInterval(bottomNote, topNote) {
    const bottomMidi = getMidiKeyNumber(bottomNote);
    const topMidi = getMidiKeyNumber(topNote);

    if (bottomMidi === null || topMidi === null) {
        return { error: `Invalid note format or unknown note: '${bottomNote}' or '${topNote}'` };
    }
    if (bottomMidi > topMidi) {
        return { error: `Bottom note '${bottomNote}' is higher than top note '${topNote}'` };
    }

    const naturalDegree = getNaturalDegree(bottomNote, topNote);
    if (typeof naturalDegree === 'string') {
        return { error: naturalDegree };
    }

    const semitones = topMidi - bottomMidi;
    const keyCount = semitones + 1;

    const quality = getIntervalQuality(naturalDegree, semitones);
    if (quality === QUALITY.ERROR) {
        return { error: "Could not determine interval quality for given notes." };
    }

    let invertedDegree;
    if (naturalDegree >= 1 && naturalDegree <= 8) {
        if (naturalDegree === 1) invertedDegree = 8;
        else if (naturalDegree === 8) invertedDegree = 1;
        else invertedDegree = 9 - naturalDegree;
    } else {
        const simpleDegree = (naturalDegree - 1) % 7 + 1;
        invertedDegree = 9 - simpleDegree;
    }

    let invertedQuality;
    switch (quality) {
        case QUALITY.PERFECT: invertedQuality = QUALITY.PERFECT; break;
        case QUALITY.MAJOR: invertedQuality = QUALITY.MINOR; break;
        case QUALITY.MINOR: invertedQuality = QUALITY.MAJOR; break;
        case QUALITY.AUGMENTED: invertedQuality = QUALITY.DIMINISHED; break;
        case QUALITY.DIMINISHED: invertedQuality = QUALITY.AUGMENTED; break;
        default: invertedQuality = QUALITY.ERROR; break;
    }

    let invertedSemitones = 12 - (semitones % 12);
    if (semitones === 0) { // Perfect 1st -> Perfect 8th
        invertedSemitones = 12;
    } else if (semitones === 12 && naturalDegree === 8) { // Perfect 8th -> Perfect 1st
        invertedSemitones = 0;
    }

    const invertedKeyCount = invertedSemitones + 1;

    return {
        bottomNote: bottomNote,
        topNote: topNote,
        interval: {
            naturalDegree: naturalDegree,
            quality: quality,
            semitones: semitones,
            keyCount: keyCount,
            midiRange: [bottomMidi, topMidi]
        },
        invertedInterval: {
            naturalDegree: invertedDegree,
            quality: invertedQuality,
            semitones: invertedSemitones,
            keyCount: invertedKeyCount
        },
        isConsonant: (quality === QUALITY.PERFECT || quality === QUALITY.MAJOR || quality === QUALITY.MINOR) &&
            !((naturalDegree === 4 && semitones === 6) || (naturalDegree === 5 && semitones === 6) || (naturalDegree === 11 && semitones === 18)),
        isDissonant: !((quality === QUALITY.PERFECT || quality === QUALITY.MAJOR || quality === QUALITY.MINOR) &&
            !((naturalDegree === 4 && semitones === 6) || (naturalDegree === 5 && semitones === 6) || (naturalDegree === 11 && semitones === 18))),
        isPerfect: quality === QUALITY.PERFECT,
        isCompound: naturalDegree > 8
    };
}

// --- 新しい音符生成ロジック ---

/**
 * MIDI鍵盤番号と音符の種類設定に基づいて、音符文字列を生成する関数
 * @param {number} midiNum - MIDI鍵盤番号
 * @param {string} noteType - 'natural' (幹音のみ) or 'accidental' (派生音含む)
 * @returns {string|null} 音符文字列 (例: "C#4", "Db5", "C4") または null (無効な音符タイプの場合)
 */
function midiToStyledNoteString(midiNum, noteType) {
    const octave = Math.floor(midiNum / 12) - 1;
    const semitoneInOctave = midiNum % 12;

    if (noteType === 'natural') {
        if (!naturalSemitoneValuesInOctave.includes(semitoneInOctave)) {
            return null;
        }
        return `${midiToSharpNoteName[semitoneInOctave]}${octave}`;
    } else {
        const isSharpOnly = [0, 2, 4, 5, 7, 9, 11].includes(semitoneInOctave);
        const isFlatOnly = [1, 3, 6, 8, 10].includes(semitoneInOctave);

        if (isSharpOnly) {
            return `${midiToSharpNoteName[semitoneInOctave]}${octave}`;
        } else if (isFlatOnly) {
            if (Math.random() < 0.5) {
                return `${midiToSharpNoteName[semitoneInOctave]}${octave}`;
            } else {
                return `${midiToFlatNoteName[semitoneInOctave]}${octave}`;
            }
        }
        return null;
    }
}

/**
 * 指定された設定に基づいてランダムな音符のペアを生成する関数
 * @param {object} settings - アプリの設定
 * @param {string} settings.intervalType - 'simple' or 'compound'
 * @param {string} settings.noteType - 'natural' or 'accidental'
 * @param {string} settings.octaveRange - 'C3-C5', 'C2-C6', 'C1-C7'
 * @returns {{bottomNote: string, topNote: string}|null} 生成された音符のペア、またはnull (エラー時)
 */
function generateRandomNotes(settings) {
    const { intervalType, noteType, octaveRange } = settings;

    const [startNoteStr, endNoteStr] = octaveRange.split('-');
    const startMidi = getMidiKeyNumber(startNoteStr);
    const endMidi = getMidiKeyNumber(endNoteStr);

    if (startMidi === null || endMidi === null || startMidi > endMidi) {
        console.error("Invalid octave range settings:", octaveRange);
        return null;
    }

    //let minSemitones = 0;
    let minSemitones = 1; // ここを 0 から 1 に変更 １を出さない（増１度の表記問題）
    let maxSemitones = 12;
    if (intervalType === 'compound') {
        maxSemitones = 22;
    }

    const absoluteMaxSemitones = endMidi - startMidi;
    if (maxSemitones > absoluteMaxSemitones) {
        maxSemitones = absoluteMaxSemitones;
    }
    if (minSemitones > maxSemitones) {
        return null;
    }

    const maxAttempts = 500;

    for (let i = 0; i < maxAttempts; i++) {
        const bottomMidi = Math.floor(Math.random() * (endMidi - startMidi + 1)) + startMidi;
        const semitones = Math.floor(Math.random() * (maxSemitones - minSemitones + 1)) + minSemitones;
        const topMidi = bottomMidi + semitones;

        if (topMidi > endMidi) {
            continue;
        }

        const bottomNote = midiToStyledNoteString(bottomMidi, noteType);
        const topNote = midiToStyledNoteString(topMidi, noteType);

        if (bottomNote === null || topNote === null) {
            continue;
        }

        const analysis = analyzeInterval(bottomNote, topNote);

        if (!analysis.error && analysis.interval.quality !== QUALITY.ERROR) {
            if (intervalType === 'simple' && analysis.interval.naturalDegree > 8) {
                continue;
            }
            return { bottomNote, topNote };
        }
    }

    console.warn("Could not generate a valid note pair within limits after many attempts. Please loosen constraints.");
    return null;
}


// --- DOM操作とイベントリスナー ---

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const showAnswerButton = document.getElementById('showAnswerButton');
    const generatedBottomNoteSpan = document.getElementById('generatedBottomNote');
    const generatedTopNoteSpan = document.getElementById('generatedTopNote');
    const resultOutputDiv = document.getElementById('resultOutput');
    const answerOutputDiv = document.getElementById('answerOutput'); // answerOutput要素の参照を取得

    let currentGeneratedNotes = { bottomNote: 'C4', topNote: 'E4' }; // 現在表示中の音符ペア


    // 初期表示時に設定を読み込み、音符を生成して表示
    const loadSettingsAndGenerateNotes = async () => {
        const intervalType = document.querySelector('input[name="intervalType"]:checked')?.value || 'simple';
        const noteType = document.querySelector('input[name="noteType"]:checked')?.value || 'accidental';
        const octaveRangeElement = document.getElementById('octaveRange');
        const octaveRange = octaveRangeElement ? octaveRangeElement.value : 'G3-G5';

        const displayLanguageElement = document.querySelector('input[name="displayLanguage"]:checked');
        const displayLanguage = displayLanguageElement ? displayLanguageElement.value : 'ja';

        const settings = { intervalType, noteType, octaveRange, displayLanguage };
        const newNotes = generateRandomNotes(settings);

        location.hash = 'question'; // 質問タブに設定

        if (newNotes) {
            currentGeneratedNotes = newNotes;
            generatedBottomNoteSpan.textContent = newNotes.bottomNote;
            generatedTopNoteSpan.textContent = newNotes.topNote;
            // resultOutputDiv にはプレースホルダーを表示
            resultOutputDiv.innerHTML = '<p class="placeholder"><span class="lang-ja">「解答を表示」ボタンを押すと、ここに結果が表示されます。</span><span class="lang-en">Press the "Show Answer" button to display results here.</span></p>';
            // answerOutputDiv にもプレースホルダーを表示
            answerOutputDiv.innerHTML = '<p class="placeholder"><span class="lang-ja">ここに解答が表示されます。</span><span class="lang-en">The answer will be displayed here.</span></p>';

        } else {
            generatedBottomNoteSpan.textContent = '---';
            generatedTopNoteSpan.textContent = '---';
            const errorMessageHtml = '<p class="error-message"><span class="lang-ja">音符の生成に失敗しました。</span><span class="lang-en">Failed to generate notes.</span></p>';
            resultOutputDiv.innerHTML = errorMessageHtml;
            answerOutputDiv.innerHTML = errorMessageHtml;
            // 音符生成失敗時はVerovio表示もクリア
            document.getElementById('verovioViewer').innerHTML = '';
            document.getElementById('verovioStatus').textContent = '楽譜生成エラー。';
            document.getElementById('verovioStatusEn').textContent = 'Score generation error.';
        }
        toggleLang(`lang-${displayLanguage}`);

        // Verovioの初期化とレンダリング関数を呼び出す
        await initializeAndRenderVerovio(currentGeneratedNotes.bottomNote, currentGeneratedNotes.topNote);
    };

    /**
     * 詳細な解答をresultOutputに表示する関数
     */
    const displayResult = () => {
        const lang = document.querySelector('input[name="displayLanguage"]:checked').value;
        const analysisResult = analyzeInterval(currentGeneratedNotes.bottomNote, currentGeneratedNotes.topNote);
        const translatedResult = translateIntervalAnalysis(analysisResult, lang, QUALITY);

        resultOutputDiv.innerHTML = ''; // 要素をクリア

        if (translatedResult.error) {
            resultOutputDiv.innerHTML = `<p class="error-message">${getTranslation('error_analysis_failed', lang)}: ${translatedResult.error}</p>`;
            return;
        }

        const interval = translatedResult.interval;
        const invertedInterval = translatedResult.invertedInterval;

        resultOutputDiv.innerHTML = `
            <p><strong>${getTranslation('note_start', lang)}:</strong> ${interval.bottomNote}</p>
            <p><strong>${getTranslation('note_end', lang)}:</strong> ${interval.topNote}</p>
            ---
            <h3>${getTranslation('original_interval_title', lang)}</h3>
            <p><strong>${getTranslation('degree_name', lang)}:</strong> ${interval.name}</p>
            <p><strong>${getTranslation('natural_degree', lang)}:</strong> ${interval.naturalDegree}${lang === LANGUAGE.JA ? '度' : ''}</p>
            <p><strong>${getTranslation('quality', lang)}:</strong> ${interval.qualityName}</p>
            <p><strong>${getTranslation('semitones', lang)}:</strong> ${interval.semitones}</p>
            <p><strong>${getTranslation('key_count', lang)}:</strong> ${interval.keyCount}</p>
            <p><strong>${getTranslation('midi_range', lang)}:</strong> [${interval.midiRange[0]}, ${interval.midiRange[1]}]</p>
            ---
            <h3>${getTranslation('inverted_interval_title', lang)}</h3>
            <p><strong>${getTranslation('degree_name', lang)}:</strong> ${invertedInterval.name}</p>
            <p><strong>${getTranslation('natural_degree', lang)}:</strong> ${invertedInterval.naturalDegree}${lang === LANGUAGE.JA ? '度' : ''}</p>
            <p><strong>${getTranslation('quality', lang)}:</strong> ${invertedInterval.qualityName}</p>
            <p><strong>${getTranslation('semitones', lang)}:</strong> ${invertedInterval.semitones}</p>
            <p><strong>${getTranslation('key_count', lang)}:</strong> ${invertedInterval.keyCount}</p>
            ---
            <h3>${getTranslation('other_information_title', lang)}</h3>
            <p><strong>${getTranslation('consonant', lang)}:</strong> ${translatedResult.isConsonant ? getTranslation('yes', lang) : getTranslation('no', lang)}</p>
            <p><strong>${getTranslation('dissonant', lang)}:</strong> ${translatedResult.isDissonant ? getTranslation('yes', lang) : getTranslation('no', lang)}</p>
            <p><strong>${getTranslation('perfect', lang)}:</strong> ${translatedResult.isPerfect ? getTranslation('yes', lang) : getTranslation('no', lang)}</p>
            <p><strong>${getTranslation('compound', lang)}:</strong> ${translatedResult.isCompound ? getTranslation('yes', lang) : getTranslation('no', lang)}</p>
            `;
    };

    /**
     * 音程と転回音程のみをanswerOutputに表示する関数
     */
    const displayAnswerOnly = () => {
        const lang = document.querySelector('input[name="displayLanguage"]:checked').value;
        const analysisResult = analyzeInterval(currentGeneratedNotes.bottomNote, currentGeneratedNotes.topNote);
        const translatedResult = translateIntervalAnalysis(analysisResult, lang, QUALITY);

        answerOutputDiv.innerHTML = ''; // 要素をクリア

        if (translatedResult.error) {
            answerOutputDiv.innerHTML = `<p class="error-message">${getTranslation('error_analysis_failed', lang)}: ${translatedResult.error}</p>`;
            return;
        }

        const interval = translatedResult.interval;
        const invertedInterval = translatedResult.invertedInterval;

        answerOutputDiv.innerHTML = `
            <h3>${getTranslation('original_interval_title', lang)}</h3>
            <p>${interval.name}</p>
            ---
            <h3>${getTranslation('inverted_interval_title', lang)}</h3>
            <p>${invertedInterval.name}</p>
            `;
    };


    // 初期表示時に言語設定を日本語に合わせる（HTMLでchecked="ja"の場合）
    // クローラー対策として、HTMLは全言語で出力されているので、JSで非表示にする
    document.querySelectorAll('.lang-en').forEach(el => el.classList.add('js-hidden'));


    // 言語設定の変更が行われたとき
    const langRadios = document.querySelectorAll('input[name="displayLanguage"]');
    langRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === 'ja') {
                toggleLang('lang-ja');
            } else if (event.target.value === 'en') {
                toggleLang('lang-en');
            }
            // 言語が変わったら、表示も更新する
            loadSettingsAndGenerateNotes(); // 音符を再生成し、プレースホルダー表示に戻す
        });
    });

    // イベントリスナーの設定
    generateButton.addEventListener('click', loadSettingsAndGenerateNotes);
    
    showAnswerButton.addEventListener('click', () => {
        // URLハッシュを変更してタブ移動
        location.hash = 'answer';
        // resultOutputには詳細を、answerOutputには答えのみを表示
        displayResult();
        displayAnswerOnly();
    });
    
    // 設定変更時にも音符を再生成（よりスムーズなUXのため）
    document.querySelectorAll('.settings-section input[type="radio"], #octaveRange').forEach(element => {
        element.addEventListener('change', loadSettingsAndGenerateNotes);
    });

    // 初期ロード時に最初の音程を生成
    (async () => {
        await loadSettingsAndGenerateNotes();
    })();
});