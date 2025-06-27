// modules/localization.js

/**
 * 表示言語の種類を表す定数
 * @readonly
 * @enum {string}
 */
export const LANGUAGE = {
    JA: "ja",
    EN: "en"
};

/**
 * 音程の質を表す定数。
 * analyzeInterval関数での分類と、qualityTranslationsのキーとして使用されます。
 * @readonly
 * @enum {string}
 */
export const QUALITY = {
    PERFECT: "PERFECT",
    MAJOR: "MAJOR",
    MINOR: "MINOR",
    AUGMENTED: "AUGMENTED",
    DIMINISHED: "DIMINISHED",
    ERROR: "ERROR"
};

/**
 * 音程の質に対する多言語翻訳マップ
 * @type {Object.<string, Object.<string, string>>}
 */
export const qualityTranslations = {
    [LANGUAGE.JA]: {
        "PERFECT": "完全",
        "MAJOR": "長",
        "MINOR": "短",
        "AUGMENTED": "増",
        "DIMINISHED": "減",
        "ERROR": "エラー" // QUALITY.ERROR も翻訳対象に含める
    },
    [LANGUAGE.EN]: {
        "PERFECT": "Perfect",
        "MAJOR": "Major",
        "MINOR": "Minor",
        "AUGMENTED": "Augmented",
        "DIMINISHED": "Diminished",
        "ERROR": "Error"
    }
};


/**
 * その他の静的文字列の多言語翻訳マップ
 * @type {Object.<string, Object.<string, string>>}
 */
const stringTranslations = {
    [LANGUAGE.JA]: {
        'placeholder_initial_result': '「解答を表示」ボタンを押すと、ここに結果が表示されます。',
        'error_generation_failed': '音符の生成に失敗しました。',
        'error_analysis_failed': '分析に失敗しました', // ★追加: エラー表示用
        'original_interval_title': '音程（原音程）',
        'inverted_interval_title': '転回音程',
        'other_information_title': 'その他の情報',
        'note_start': '開始音符',
        'note_end': '終了音符',
        'midi_range': 'MIDI範囲',
        'degree_name': '度数名',
        'natural_degree': '幹音の度数',
        'quality': '種類',
        'semitones': '半音数',
        'key_count': '鍵盤数',
        'consonant': '協和音程',
        'dissonant': '不協和音程',
        'perfect': '完全音程',
        'compound': '複音程',
        'yes': 'はい',
        'no': 'いいえ'
    },
    [LANGUAGE.EN]: {
        'placeholder_initial_result': 'Press the "Show Answer" button to display results here.',
        'error_generation_failed': 'Failed to generate notes.',
        'error_analysis_failed': 'Analysis failed', // ★追加: エラー表示用
        'original_interval_title': 'Original Interval',
        'inverted_interval_title': 'Inverted Interval',
        'other_information_title': 'Other Information',
        'note_start': 'Start Note',
        'note_end': 'End Note',
        'midi_range': 'MIDI Range',
        'degree_name': 'Name',
        'natural_degree': 'Natural Degree',
        'quality': 'Quality',
        'semitones': 'Semitones',
        'key_count': 'Key Count',
        'consonant': 'Consonant',
        'dissonant': 'Dissonant',
        'perfect': 'Perfect',
        'compound': 'Compound',
        'yes': 'Yes',
        'no': 'No'
    }
};

/**
 * 指定されたキーに対応する翻訳文字列を取得する関数。
 * @param {string} key - 翻訳する文字列のキー。
 * @param {string} [lang=LANGUAGE.JA] - 翻訳対象の言語コード (例: 'ja', 'en')。
 * @returns {string} 翻訳された文字列、またはキーが見つからない場合はフォールバック（例: 英語、またはキー自体）。
 */
export function getTranslation(key, lang = LANGUAGE.JA) {
    if (stringTranslations[lang] && stringTranslations[lang][key]) {
        return stringTranslations[lang][key];
    }
    // 指定言語にない場合は英語（または別のデフォルト）を試す
    if (stringTranslations[LANGUAGE.EN] && stringTranslations[LANGUAGE.EN][key]) {
        return stringTranslations[LANGUAGE.EN][key];
    }
    // どちらの言語にもない場合はキー自体を返す（デバッグ用）
    return key;
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

/**
 * 音程分析結果を特定の言語に翻訳する関数。
 * Quality定数（QUALITY.PERFECTなど）は外部から渡されると想定。
 *
 * @param {object} analysisResult - `analyzeInterval` 関数から返される分析結果オブジェクト。
 * @param {string} [lang=LANGUAGE.JA] - 翻訳対象の言語コード (例: 'ja', 'en')。
 * @param {object} QUALITY_CONST - 外部から QUALITY 定数を渡すためのオブジェクト。
 * @returns {object} 翻訳された音程の詳細を含むオブジェクト、またはエラーオブジェクト。
 */
export function translateIntervalAnalysis(analysisResult, lang = LANGUAGE.JA, QUALITY_CONST) {
    if (analysisResult.error) {
        return { error: analysisResult.error };
    }

    // QUALITY_CONST が undefined の場合に備えて、デフォルト値またはエラーハンドリングを追加することを検討しても良いでしょう。
    // 今回は、常に有効な QUALITY 定数が渡されることを前提とします。

    const translateQuality = (q) => qualityTranslations[lang][q] || q;

    const interval = analysisResult.interval;
    const invertedInterval = analysisResult.invertedInterval;

    let intervalQualityName = translateQuality(interval.quality);
    let invertedQualityName = translateQuality(invertedInterval.quality);

    let intervalDegreeText;
    let invertedDegreeText;

    if (lang === LANGUAGE.JA) {
        intervalDegreeText = `${interval.naturalDegree}度`;
        invertedDegreeText = `${invertedInterval.naturalDegree}度`;
    } else { // 英語の場合
        intervalDegreeText = getOrdinalSuffix(interval.naturalDegree);
        invertedDegreeText = getOrdinalSuffix(invertedInterval.naturalDegree);
    }
    
    const intervalFullName = `${intervalQualityName} ${intervalDegreeText}`;
    const invertedFullName = `${invertedQualityName} ${invertedDegreeText}`;

    return {
        bottomNote: analysisResult.bottomNote,
        topNote: analysisResult.topNote,
        interval: {
            ...interval,
            name: intervalFullName,
            qualityName: intervalQualityName,
            degreeName: intervalDegreeText // `degreeName` も序数表記になったテキストを保持するように更新
        },
        invertedInterval: {
            ...invertedInterval,
            name: invertedFullName,
            qualityName: invertedQualityName,
            degreeName: invertedDegreeText // `degreeName` も序数表記になったテキストを保持するように更新
        },
        // これらのプロパティはanalysisResultから直接引き継ぐ
        isConsonant: analysisResult.isConsonant,
        isDissonant: analysisResult.isDissonant,
        isPerfect: analysisResult.isPerfect,
        isCompound: analysisResult.isCompound
    };
}

// ... (toggleLang はそのまま) ...


/**
 * 指定された言語クラスの要素を表示し、それ以外の言語クラスの要素を非表示にする関数。
 * @param {string} displayLangClass - 表示したい言語のクラス名 (例: "lang-ja", "lang-en")
 */
export function toggleLang(displayLangClass) {
    const allLangElements = document.querySelectorAll('[class*="lang-"]'); // lang-を含む全ての要素を取得

    allLangElements.forEach(element => {
        if (element.classList.contains(displayLangClass)) {
            element.classList.remove('js-hidden');
        } else {
            // lang-ja と lang-en の両方がある要素（例：ただのテキストノードなど）には影響しない
            if (element.classList.contains('lang-ja') || element.classList.contains('lang-en')) {
                element.classList.add('js-hidden');
            }
        }
    });
}