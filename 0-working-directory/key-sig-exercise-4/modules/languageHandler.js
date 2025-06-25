// modules/languageHandler.js

// キー名と整形されたHTMLのマップ
const keyFormattingMap = {
    "Cb Major": 'C<span class="flat-symbol">♭</span> Major',
    "Db Major": 'D<span class="flat-symbol">♭</span> Major',
    "Eb Major": 'E<span class="flat-symbol">♭</span> Major',
    "Fb Major": 'F<span class="flat-symbol">♭</span> Major',
    "Gb Major": 'G<span class="flat-symbol">♭</span> Major',
    "Ab Major": 'A<span class="flat-symbol">♭</span> Major',
    "Bb Major": 'B<span class="flat-symbol">♭</span> Major',
    
    "C# Major": 'C<span class="sharp-symbol">♯</span> Major',
    "D# Major": 'D<span class="sharp-symbol">♯</span> Major',
    "E# Major": 'E<span class="sharp-symbol">♯</span> Major', 
    "F# Major": 'F<span class="sharp-symbol">♯</span> Major',
    "G# Major": 'G<span class="sharp-symbol">♯</span> Major',
    "A# Major": 'A<span class="sharp-symbol">♯</span> Major',
    "B# Major": 'B<span class="sharp-symbol">♯</span> Major', 

    "C Major": "C Major",
    "D Major": "D Major",
    "E Major": "E Major",
    "F Major": "F Major",
    "G Major": "G Major",
    "A Major": "A Major",
    "B Major": "B Major",

    "Cb Minor": 'C<span class="flat-symbol">♭</span> Minor',
    "Db Minor": 'D<span class="flat-symbol">♭</span> Minor',
    "Eb Minor": 'E<span class="flat-symbol">♭</span> Minor',
    "Fb Minor": 'F<span class="flat-symbol">♭</span> Minor',
    "Gb Minor": 'G<span class="flat-symbol">♭</span> Minor',
    "Ab Minor": 'A<span class="flat-symbol">♭</span> Minor',
    "Bb Minor": 'B<span class="flat-symbol">♭</span> Minor',
    
    "C# Minor": 'C<span class="sharp-symbol">♯</span> Minor',
    "D# Minor": 'D<span class="sharp-symbol">♯</span> Minor',
    "E# Minor": 'E<span class="sharp-symbol">♯</span> Minor', 
    "F# Minor": 'F<span class="sharp-symbol">♯</span> Minor',
    "G# Minor": 'G<span class="sharp-symbol">♯</span> Minor',
    "A# Minor": 'A<span class="sharp-symbol">♯</span> Minor',
    "B# Minor": 'B<span class="sharp-symbol">♯</span> Minor', 

    "C Minor": "C Minor",
    "D Minor": "D Minor",
    "E Minor": "E Minor",
    "F Minor": "F Minor",
    "G Minor": "G Minor",
    "A Minor": "A Minor",
    "B Minor": "B Minor",
};

/**
 * 渡されたオリジナルのキー名を、整形されたHTML文字列に変換します。
 * @param {string} originalKey - 整形前のキー名（例: "Cb Major"）
 * @returns {string} 整形されたHTML文字列、または変換できない場合は元の文字列
 */
function formatKeyName(originalKey) {
    // マップにキーが存在すれば、整形済みの文字列を返す
    return keyFormattingMap[originalKey] || originalKey;
}

/**
 * ページ内の全ての .music-key 要素を検索し、キー名を音楽記号付きで整形します。
 */
export function applyMusicKeyFormatting() {
    // ページ内の全ての .music-key クラスの要素を取得
    const musicKeyElements = document.querySelectorAll('.music-key');

    // 各要素をループして処理
    musicKeyElements.forEach(element => {
        const originalText = element.textContent.trim(); 
        const formattedHtml = formatKeyName(originalText);
        element.innerHTML = formattedHtml;
    });
}

/**
 * 選択された言語に基づいてキー名の表示を更新します。
 * この関数は window.commonMusicData に依存します。
 * @param {string} selectedLang - 選択された言語コード ('ja', 'en', 'de')
 */
export function updateKeyNames(selectedLang) {
    // すべてのキー名表示用の<span>要素を再取得
    const keyNameSpans = document.querySelectorAll('span[data-key-type][data-mei-value]');

    keyNameSpans.forEach(span => {
        const keyType = span.getAttribute('data-key-type');
        const meiValue = span.getAttribute('data-mei-value');

        // commonMusicData.keySignatures から対応するキー情報を見つける
        const keyInfo = window.commonMusicData.keySignatures.find(ks => ks.meiValue === meiValue);

        if (keyInfo) {
            let displayText = '';
            if (keyType === 'major') {
                switch (selectedLang) {
                    case 'ja':
                        displayText = keyInfo.nameMajorJp;
                        break;
                    case 'en':
                        displayText = keyInfo.nameMajorEn;
                        break;
                    case 'de':
                        displayText = keyInfo.nameMajorDe;
                        break;
                    default:
                        displayText = keyInfo.nameMajorJp; // デフォルトは日本語
                }
            } else if (keyType === 'minor') {
                switch (selectedLang) {
                    case 'ja':
                        displayText = keyInfo.nameMinorJp;
                        break;
                    case 'en':
                        displayText = keyInfo.nameMinorEn;
                        break;
                    case 'de':
                        displayText = keyInfo.nameMinorDe;
                        break;
                    default:
                        displayText = keyInfo.nameMinorJp; // デフォルトは日本語
                }
            }
            span.textContent = displayText;
        } else {
            console.warn(`[LanguageHandler] MEI値 '${meiValue}' のキー情報が見つかりませんでした。`);
        }
    });
    // 言語が更新された後、音楽記号の整形を適用
    applyMusicKeyFormatting();
}