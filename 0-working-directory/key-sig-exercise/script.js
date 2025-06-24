// key-sig-exercise/script.js

// 必要なモジュールをインポート
import { loadVerovio } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.0.1/verovio/loader.min.mjs';
import 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.0.1/components/simple-tab-component/script.min.js'; // タブコンポーネントのスクリプトをロード


// Verovioのツールキットインスタンスをグローバル（またはアクセス可能なスコープ）で保持
let verovioToolkit = null;

// keySpansをグローバルスコープで宣言
// DOMContentLoaded内で再取得し、更新されるようにする
let keySpans = [];

// =================================================================
// 共通データと状態管理 (window.commonMusicData, window.currentQuizState)
// =================================================================
window.commonMusicData = {
    // keySignatures の構造を、長調と短調の情報を分けて保持するように変更
    keySignatures: [
        { meiValue: "0s", nameMajorJp: "ハ長調", nameMajorEn: "C Major", nameMajorDe: "C-Dur", nameMinorJp: "イ短調", nameMinorEn: "A Minor", nameMinorDe: "a-Moll" },
        { meiValue: "1s", nameMajorJp: "ト長調", nameMajorEn: "G Major", nameMajorDe: "G-Dur", nameMinorJp: "ホ短調", nameMinorEn: "E Minor", nameMinorDe: "e-Moll" },
        { meiValue: "2s", nameMajorJp: "ニ長調", nameMajorEn: "D Major", nameMajorDe: "D-Dur", nameMinorJp: "ロ短調", nameMinorEn: "B Minor", nameMinorDe: "h-Moll" },
        { meiValue: "3s", nameMajorJp: "イ長調", nameMajorEn: "A Major", nameMajorDe: "A-Dur", nameMinorJp: "嬰ヘ短調", nameMinorEn: "F# Minor", nameMinorDe: "fis-Moll" },
        { meiValue: "4s", nameMajorJp: "ホ長調", nameMajorEn: "E Major", nameMajorDe: "E-Dur", nameMinorJp: "嬰ハ短調", nameMinorEn: "C# Minor", nameMinorDe: "cis-Moll" },
        { meiValue: "5s", nameMajorJp: "ロ長調", nameMajorEn: "B Major", nameMajorDe: "H-Dur", nameMinorJp: "嬰ト短調", nameMinorEn: "G# Minor", nameMinorDe: "gis-Moll" },
        { meiValue: "6s", nameMajorJp: "嬰ヘ長調", nameMajorEn: "F# Major", nameMajorDe: "Fis-Dur", nameMinorJp: "嬰ニ短調", nameMinorEn: "D# Minor", nameMinorDe: "dis-Moll" },
        { meiValue: "7s", nameMajorJp: "嬰ハ長調", nameMajorEn: "C# Major", nameMajorDe: "Cis-Dur", nameMinorJp: "嬰イ短調", nameMinorEn: "A# Minor", nameMinorDe: "ais-Moll" },
        { meiValue: "1f", nameMajorJp: "ヘ長調", nameMajorEn: "F Major", nameMajorDe: "F-Dur", nameMinorJp: "ニ短調", nameMinorEn: "D Minor", nameMinorDe: "d-Moll" },
        { meiValue: "2f", nameMajorJp: "変ロ長調", nameMajorEn: "Bb Major", nameMajorDe: "B-Dur", nameMinorJp: "ト短調", nameMinorEn: "G Minor", nameMinorDe: "g-Moll" },
        { meiValue: "3f", nameMajorJp: "変ホ長調", nameMajorEn: "Eb Major", nameMajorDe: "Es-Dur", nameMinorJp: "ハ短調", nameMinorEn: "C Minor", nameMinorDe: "c-Moll" },
        { meiValue: "4f", nameMajorJp: "変イ長調", nameMajorEn: "Ab Major", nameMajorDe: "As-Dur", nameMinorJp: "ヘ短調", nameMinorEn: "F Minor", nameMinorDe: "f-Moll" },
        { meiValue: "5f", nameMajorJp: "変ニ長調", nameMajorEn: "Db Major", nameMajorDe: "Des-Dur", nameMinorJp: "変ロ短調", nameMinorEn: "Bb Minor", nameMinorDe: "b-Moll" },
        { meiValue: "6f", nameMajorJp: "変ト長調", nameMajorEn: "Gb Major", nameMajorDe: "Ges-Dur", nameMinorJp: "変ホ短調", nameMinorEn: "Eb Minor", nameMinorDe: "es-Moll" },
        { meiValue: "7f", nameMajorJp: "変ハ長調", nameMajorEn: "Cb Major", nameMajorDe: "Ces-Dur", nameMinorJp: "変イ短調", nameMinorEn: "Ab Minor", nameMinorDe: "as-Moll" }
    ],
    baseMeiTemplate: `
        <mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.1">
            <meiHead><fileDesc><titleStmt><title></title></titleStmt><pubStmt/></fileDesc></meiHead>
            <music><body><mdiv><score>
                <scoreDef keysig="##KEY_SIG##">
                    <staffGrp>
                        <staffDef n="1" clef.shape="G" clef.line="2" lines="5"/>
                    </staffGrp>
                </scoreDef>
                <section>
                    <measure n="1">
                        <staff n="1">
                            <layer n="1">
                            </layer>
                        </staff>
                    </measure>
                </section>
            </score></mdiv></body>
        </music>
    `
};

window.currentQuizState = {
    correctKeySigMeiValue: null, // 正しい調号のMEI値（例: "1s"）
    correctKeySigInfo: null, // 正しい調号の完全な情報オブジェクト
    userMajorAnswerMeiValue: '', // ユーザーが選択した長調のMEI値
    userMinorAnswerMeiValue: '', // ユーザーが選択した短調のMEI値
    quizResult: { // 採点結果を保持
        isCorrect: false,
        userMajorAnswerMeiValue: null, // 採点時に使用したユーザー長調MEI
        userMinorAnswerMeiValue: null, // 採点時に使用したユーザー短調MEI
        correctKeySigMeiValue: null
    }
};

// =================================================================
// ヘルパー関数: 通知メッセージの表示/非表示を切り替える
// =================================================================
function showNotification(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        console.log(`[Notification] ${element.id || 'Unknown Element'} の表示を 表示 にしました。メッセージ: "${message}"`);
    } else {
        console.warn(`[Notification] 要素が見つかりませんでした。`);
    }
}

function hideNotification(element) {
    if (element) {
        element.style.display = 'none';
        console.log(`[Notification] ${element.id || 'Unknown Element'} の表示を 非表示 にしました。`);
    } else {
        console.warn(`[Notification] 要素が見つかりませんでした。`);
    }
}

// =================================================================
// Verovio レンダリング関数
// =================================================================
window.renderVerovioScore = async (targetElementId, meiString, statusElementId = null) => {
    console.log(`[renderVerovioScore] レンダリングを開始します。ターゲット: ${targetElementId}`);
    const viewerElement = document.getElementById(targetElementId);
    const currentStatusElement = statusElementId ? document.getElementById(statusElementId) : null;

    if (!viewerElement) {
        console.error(`[renderVerovioScore] ターゲット要素 '${targetElementId}' が見つかりません。`);
        if (currentStatusElement) currentStatusElement.textContent = `エラー: 表示ターゲットが見つかりません (${targetElementId})`;
        return;
    }

    //if (currentStatusElement) currentStatusElement.textContent = 'レンダリング中…';
    viewerElement.innerHTML = ''; // クリア

    try {
        if (!verovioToolkit) {
            console.log('[renderVerovioScore] Verovioツールキットを初期ロード中…');
            if (currentStatusElement) currentStatusElement.textContent = 'Verovio を初期ロード中…';
            verovioToolkit = await loadVerovio();
            console.log('[renderVerovioScore] Verovioツールキットのロードが完了しました。');
        }

        verovioToolkit.loadData(meiString);
        verovioToolkit.setOptions({
            adjustPageWidth: true,
            adjustPageHeight: true,
            footer: "none",
            //pageWidth: 800,
            //pageHeight: 600,
            scale: 80
        });
        console.log('[renderVerovioScore] Verovioオプションを設定しました。');

        const svg = verovioToolkit.renderToSVG(1, {});
        viewerElement.innerHTML = svg;
        //if (currentStatusElement) currentStatusElement.textContent = 'レンダリング完了！';
        console.log(`[renderVerovioScore] レンダリングが完了しました。SVGを '${targetElementId}' に挿入しました。`);
    } catch (err) {
        console.error('[renderVerovioScore] Verovio レンダリングエラー:', err);
        if (currentStatusElement) currentStatusElement.textContent = 'エラーが発生しました: ' + err.message;
    }
};


// =================================================================
// 新しい問題を生成し、出題タブの表示を更新する共通関数 (修正)
// =================================================================
window.generateNewQuestion = () => {
    console.log('[generateNewQuestion] 新しい問題の生成を開始します。');
    if (!window.commonMusicData || !window.renderVerovioScore || !window.currentQuizState) {
        console.error('[generateNewQuestion] エラー: 必要なデータまたは関数がロードされていません。');
        return;
    }

    // 各タブの通知メッセージを非表示にリセット
    hideNotification(document.getElementById('submit-notification')); // 出題タブの通知
    hideNotification(document.getElementById('new-question-notification')); // 解答タブの通知

    const keySigs = window.commonMusicData.keySignatures;
    const randomIndex = Math.floor(Math.random() * keySigs.length);
    const selectedKeySigInfo = keySigs[randomIndex];

    // クイズ状態をリセットし、新しい問題を設定
    window.currentQuizState.correctKeySigMeiValue = selectedKeySigInfo.meiValue;
    window.currentQuizState.correctKeySigInfo = selectedKeySigInfo;
    window.currentQuizState.userMajorAnswerMeiValue = ''; // リセット
    window.currentQuizState.userMinorAnswerMeiValue = ''; // リセット
    window.currentQuizState.quizResult = { // quizResult全体をリセット
        isCorrect: false,
        userMajorAnswerMeiValue: null,
        userMinorAnswerMeiValue: null,
        correctKeySigMeiValue: null
    };

    console.log('[generateNewQuestion] currentQuizState をリセットしました:', JSON.parse(JSON.stringify(window.currentQuizState)));
    console.log(`[generateNewQuestion] 選択された調号: ${selectedKeySigInfo.nameMajorEn} / ${selectedKeySigInfo.nameMinorEn} (MEI: ${selectedKeySigInfo.meiValue})`);

    // ユーザー解答ラジオボタンをリセット
    const allMajorRadios = document.querySelectorAll('input[name="majorKey"]');
    allMajorRadios.forEach(radio => radio.checked = false); // 全てのラジオボタンのチェックを外す

    const allMinorRadios = document.querySelectorAll('input[name="minorKey"]');
    allMinorRadios.forEach(radio => radio.checked = false); // 全てのラジオボタンのチェックを外す

    // 送信ボタンはデフォルトで無効にする
    document.getElementById('submitAnswerBtn').disabled = true;
    console.log('[generateNewQuestion] ユーザー解答ラジオボタンをリセットしました。');

    // 出題タブの楽譜をレンダリング
    const meiToRender = window.commonMusicData.baseMeiTemplate.replace('##KEY_SIG##', window.currentQuizState.correctKeySigMeiValue);
    console.log(`[generateNewQuestion] Verovioに渡すMEIの調号部分: ${window.currentQuizState.correctKeySigMeiValue}`);
    window.renderVerovioScore('question-viewer', meiToRender, 'question-status');
    const questionStatus = document.getElementById('question-status');
    if (questionStatus) {
        questionStatus.textContent = `譜例の調号を見て調名を答えましょう。`;
    }

    console.log('[generateNewQuestion] 新しい問題の生成が完了しました。');
};

// =================================================================
// 解答タブの表示更新関数 (修正)
// =================================================================
function updateAnswerDisplay() {
    console.log('[updateAnswerDisplay] 解答タブの表示更新を開始します。');
    if (!window.currentQuizState || !window.commonMusicData || !window.renderVerovioScore) {
        const ansStatus = document.getElementById('answer-status');
        if (ansStatus) ansStatus.textContent = 'エラー: 必要なデータまたは関数がロードされていません。';
        console.error('[updateAnswerDisplay] エラー: currentQuizState, commonMusicData, または renderVerovioScore が見つかりません。');
        return;
    }

    // 「新しい問題生成完了」メッセージを非表示にリセット
    hideNotification(document.getElementById('new-question-notification'));

    const { quizResult, correctKeySigInfo } = window.currentQuizState;
    console.log('[updateAnswerDisplay] currentQuizState.quizResult:', JSON.parse(JSON.stringify(quizResult)));
    console.log('[updateAnswerDisplay] currentQuizState.correctKeySigInfo:', JSON.parse(JSON.stringify(correctKeySigInfo)));

    // DOM要素を関数内で再取得 (HTMLのid変更に対応)
    const answerFeedback = document.getElementById('answer-feedback');
    const displayUserMajorAnswer = document.getElementById('displayUserMajorAnswer'); // 新しいID
    const displayUserMinorAnswer = document.getElementById('displayUserMinorAnswer'); // 新しいID
    const displayCorrectAnswerJp = document.getElementById('displayCorrectAnswerJp');
    const displayCorrectAnswerEn = document.getElementById('displayCorrectAnswerEn');
    const displayCorrectAnswerDe = document.getElementById('displayCorrectAnswerDe');
    const answerViewer = document.getElementById('answer-viewer');
    const answerStatus = document.getElementById('answer-status');

    // 解答が送信されていない場合は、その旨を伝える
    // userMajorAnswerMeiValue と userMinorAnswerMeiValue の両方が空の場合を未解答と判断
    if (!correctKeySigInfo || (!quizResult.userMajorAnswerMeiValue && !quizResult.userMinorAnswerMeiValue)) {
        console.log('[updateAnswerDisplay] 解答がまだ送信されていません。');
        if (answerFeedback) answerFeedback.innerHTML = 'まだ解答が送信されていません。<br>「出題」タブで解答を選択し、**解答を送信**ボタンを押してください。';
        if (answerFeedback) answerFeedback.style.color = '#555';
        if (answerViewer) answerViewer.innerHTML = '';
        if (displayUserMajorAnswer) displayUserMajorAnswer.textContent = 'N/A';
        if (displayUserMinorAnswer) displayUserMinorAnswer.textContent = 'N/A';
        if (displayCorrectAnswerJp) displayCorrectAnswerJp.textContent = 'N/A';
        if (displayCorrectAnswerEn) displayCorrectAnswerEn.textContent = 'N/A';
        if (displayCorrectAnswerDe) displayCorrectAnswerDe.textContent = 'N/A';
        return;
    }

    console.log(`[Debug - Inside updateAnswerDisplay] displayUserMajorAnswer要素の存在: ${!!displayUserMajorAnswer}`);
    console.log(`[Debug - Inside updateAnswerDisplay] displayUserMinorAnswer要素の存在: ${!!displayUserMinorAnswer}`);
    console.log(`[Debug - Inside updateAnswerDisplay] displayCorrectAnswerJp要素の存在: ${!!displayCorrectAnswerJp}`);
    console.log(`[Debug - Inside updateAnswerDisplay] displayCorrectAnswerEn要素の存在: ${!!displayCorrectAnswerEn}`);
    console.log(`[Debug - Inside updateAnswerDisplay] displayCorrectAnswerDe要素の存在: ${!!displayCorrectAnswerDe}`);


    // ユーザーの解答の表示
    let userSelectedMajorName = "未選択";
    let userSelectedMinorName = "未選択";

    if (quizResult.userMajorAnswerMeiValue) {
        const selectedOption = window.commonMusicData.keySignatures.find(
            ks => ks.meiValue === quizResult.userMajorAnswerMeiValue
        );
        if (selectedOption) {
            userSelectedMajorName = selectedOption.nameMajorJp;
        }
    }
    if (quizResult.userMinorAnswerMeiValue) {
        const selectedOption = window.commonMusicData.keySignatures.find(
            ks => ks.meiValue === quizResult.userMinorAnswerMeiValue
        );
        if (selectedOption) {
            userSelectedMinorName = selectedOption.nameMinorJp;
        }
    }

    if (displayUserMajorAnswer) {
        displayUserMajorAnswer.textContent = userSelectedMajorName;
        console.log(`[updateAnswerDisplay] 表示ユーザー長調解答: ${userSelectedMajorName}`);
    }
    if (displayUserMinorAnswer) {
        displayUserMinorAnswer.textContent = userSelectedMinorName;
        console.log(`[updateAnswerDisplay] 表示ユーザー短調解答: ${userSelectedMinorName}`);
    }


    // 正解の表示
    if (displayCorrectAnswerJp) {
        displayCorrectAnswerJp.textContent = `${correctKeySigInfo.nameMajorJp} / ${correctKeySigInfo.nameMinorJp}`;
        console.log(`[updateAnswerDisplay] 表示正解(JP): ${displayCorrectAnswerJp.textContent}`);
    }
    if (displayCorrectAnswerEn) {
        // ここを修正: nameMajorEn と nameMinorEn を結合して表示
        displayCorrectAnswerEn.textContent = `${correctKeySigInfo.nameMajorEn} / ${correctKeySigInfo.nameMinorEn}`;
        console.log(`[updateAnswerDisplay] 表示正解(EN): ${displayCorrectAnswerEn.textContent}`); // 修正後のtextContentをログに出す
    }
    if (displayCorrectAnswerDe) {
        // ここを修正: nameMajorDe と nameMinorDe を結合して表示
        displayCorrectAnswerDe.textContent = `${correctKeySigInfo.nameMajorDe} / ${correctKeySigInfo.nameMinorDe}`;
        console.log(`[updateAnswerDisplay] 表示正解(DE): ${displayCorrectAnswerDe.textContent}`); // 修正後のtextContentをログに出す
    }

    // 正解/不正解のフィードバック
    if (answerFeedback) {
        if (quizResult.isCorrect) {
            answerFeedback.textContent = '🎉 正解です！素晴らしい！ 🎉';
            answerFeedback.style.color = 'green';
            console.log('[updateAnswerDisplay] フィードバック: 正解');
        } else {
            answerFeedback.textContent = '残念！不正解です。';
            answerFeedback.style.color = 'red';
            console.log('[updateAnswerDisplay] フィードバック: 不正解');
        }
    }

    // 正解の楽譜を表示
    let meiToRender = window.commonMusicData.baseMeiTemplate.replace('##KEY_SIG##', correctKeySigInfo.meiValue);
    console.log(`[updateAnswerDisplay] 解答タブでレンダリングするMEIの調号部分: ${correctKeySigInfo.meiValue}`);
    window.renderVerovioScore('answer-viewer', meiToRender, 'answer-status');

    console.log('[updateAnswerDisplay] 解答タブの表示更新が完了しました。');
}



// =================================================================
// 言語選択
// =================================================================
function updateKeyNames(selectedLang) {
    // すべてのキー名表示用の<span>要素を再取得
    // data-key-type と data-mei-value 属性を持つspan要素を対象にする
    const keyNameSpans = document.querySelectorAll('span[data-key-type][data-mei-value]');

    keyNameSpans.forEach(span => {
        const keyType = span.getAttribute('data-key-type'); // 'major' または 'minor'
        const meiValue = span.getAttribute('data-mei-value'); // 例: '0s', '1f'

        // commonMusicData.keySignatures から対応するキー情報を見つける
        const keyInfo = window.commonMusicData.keySignatures.find(ks => ks.meiValue === meiValue);

        if (keyInfo) {
            let displayText = '';
            if (keyType === 'major') {
                // selectedLang に基づいて長調の名前を選択
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
                // selectedLang に基づいて短調の名前を選択
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
            // 見つからない場合は元のテキストを保持するか、空にするかなど
            // 例: span.textContent = '';
            console.warn(`[updateKeyNames] MEI値 '${meiValue}' のキー情報が見つかりませんでした。`);
        }
    });
    // 言語が更新された後、音楽記号の整形を適用
    applyMusicKeyFormatting();
}

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
function applyMusicKeyFormatting() {
  // ページ内の全ての .music-key クラスの要素を取得
  const musicKeyElements = document.querySelectorAll('.music-key');

  // 各要素をループして処理
  musicKeyElements.forEach(element => {
    // 要素のテキストコンテンツを取得
    // trim() で前後の空白を除去しておくと安全です
    const originalText = element.textContent.trim(); 
    
    // テキストコンテンツを整形
    const formattedHtml = formatKeyName(originalText);
    
    // 整形されたHTMLを要素のinnerHTMLに設定
    element.innerHTML = formattedHtml;
  });
}

// 例: 言語選択の変更など、特定のイベントで再実行する場合
// 実際には、言語選択のドロップダウンやボタンのイベントリスナー内で呼び出します
/*
const languageSelector = document.getElementById('language-select'); // 例
if (languageSelector) {
  languageSelector.addEventListener('change', () => {
    // 言語変更後のテキスト内容を更新する処理があれば、それらの後に呼び出します
    // 例: updateLanguageContent(); 
    applyMusicKeyFormatting(); // 再整形を実行
  });
}
*/




// =================================================================
// DOMContentLoaded イベントリスナー
// =================================================================
// script.js の DOMContentLoaded イベントリスナーの全体（修正後）

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Logic] DOMContentLoaded イベント発生。スクリプトの実行を開始します。');

    // --- DOM 要素の取得 ---
    const majorKeyGrid = document.getElementById('major-key-grid');
    const minorKeyGrid = document.getElementById('minor-key-grid');
    const submitAnswerBtn = document.getElementById('submitAnswerBtn');
    const questionStatus = document.getElementById('question-status');
    const submitNotification = document.getElementById('submit-notification');
    const generateNewQuestionBtn = document.getElementById('generate-new-question-btn');
    const newQuestionNotification = document.getElementById('new-question-notification');
    const tabBtnIntro = document.getElementById('tab-btn-intro');
    const tabBtnPractice = document.getElementById('tab-btn-practice');
    const tabsContainer = document.querySelector('.simple-tab-component-container');


    // 言語選択用の要素を取得
    const languageSelector = document.getElementById('language-selector');

    console.log('[Logic] すべての主要DOM要素を取得しました。');

    // ==== ページロード時の強制的なタブ移動処理を追加 ====
    // simple-tab-componentの初期化後に実行されるように少し遅延させるのが安全
    if (tabBtnIntro) { // tabBtnIntro が存在することを確認
        setTimeout(() => {
            console.log('[Logic] ページロード後の初期タブ強制切り替えを実行します。');
            tabBtnIntro.click(); // 出題タブボタンのクリックイベントを直接発火
            // URLハッシュも同時にクリアしたい場合は以下も追加
            if (window.location.hash) {
                console.log('[Logic] URLハッシュをクリアします。');
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }, 100); // 100ms程度の遅延
    }
    // ===========================================


    // --- 初期化処理 ---

    // ページロード時に最初の問題を生成
    if (window.generateNewQuestion) {
        console.log('[Logic] ページロード時に最初の問題を生成します。');
        window.generateNewQuestion();
    } else {
        console.error("[Logic] エラー: window.generateNewQuestion が定義されていません。");
        if (questionStatus) questionStatus.textContent = '初期化エラー: 問題生成関数がありません。';
    }

    // --- イベントリスナー設定 ---

    // 長調ラジオボタンの処理
    if (majorKeyGrid) {
        majorKeyGrid.addEventListener('change', (event) => {
            if (event.target.type === 'radio' && event.target.name === 'majorKey') {
                window.currentQuizState.userMajorAnswerMeiValue = event.target.value;
                console.log(`[Event: majorKey change] ユーザーが長調を選択: ${event.target.value}. currentQuizState.userMajorAnswerMeiValue を更新しました。`);
                // 両方が選択されたら送信ボタンを有効化
                if (submitAnswerBtn) {
                    const isMajorSelected = document.querySelector('input[name="majorKey"]:checked');
                    const isMinorSelected = document.querySelector('input[name="minorKey"]:checked');
                    submitAnswerBtn.disabled = !(isMajorSelected && isMinorSelected);
                }
                hideNotification(submitNotification);
            }
        });
    }

    // 短調ラジオボタンの処理 (majorKey と同様)
    if (minorKeyGrid) {
        minorKeyGrid.addEventListener('change', (event) => {
            if (event.target.type === 'radio' && event.target.name === 'minorKey') {
                window.currentQuizState.userMinorAnswerMeiValue = event.target.value;
                console.log(`[Event: minorKey change] ユーザーが短調を選択: ${event.target.value}. currentQuizState.userMinorAnswerMeiValue を更新しました。`);
                // 両方が選択されたら送信ボタンを有効化
                if (submitAnswerBtn) {
                    const isMajorSelected = document.querySelector('input[name="majorKey"]:checked');
                    const isMinorSelected = document.querySelector('input[name="minorKey"]:checked');
                    submitAnswerBtn.disabled = !(isMajorSelected && isMinorSelected);
                }
                hideNotification(submitNotification);
            }
        });
    }

    // 出題タブ: 解答送信ボタンの処理
    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', () => {
            console.log('[Event: submitAnswerBtn click] 解答送信ボタンが押されました。');
            if (!window.currentQuizState.userMajorAnswerMeiValue || !window.currentQuizState.userMinorAnswerMeiValue) {
                if (questionStatus) questionStatus.textContent = '長調と短調の両方を選択してください。';
                console.warn('[Event: submitAnswerBtn click] ユーザーが長調または短調を選択していません。');
                return;
            }

            const userMajorMei = window.currentQuizState.userMajorAnswerMeiValue;
            const userMinorMei = window.currentQuizState.userMinorAnswerMeiValue;
            const correctMei = window.currentQuizState.correctKeySigMeiValue;

            // 採点ロジック: ユーザーが選んだ長調と短調のMEI値が、正解の調号のMEI値と一致するか
            const isCorrect = (userMajorMei === correctMei) && (userMinorMei === correctMei);

            window.currentQuizState.quizResult = {
                isCorrect: isCorrect,
                userMajorAnswerMeiValue: userMajorMei,
                userMinorAnswerMeiValue: userMinorMei,
                correctKeySigMeiValue: correctMei
            };
            console.log('[Event: submitAnswerBtn click] 採点結果を currentQuizState に保存しました:', JSON.parse(JSON.stringify(window.currentQuizState.quizResult)));

            // ラジオボタン全体を無効化するより、submit後に新しい問題でリセットされるので不要
            // majorKeyGrid.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = true);
            // minorKeyGrid.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = true);
            submitAnswerBtn.disabled = true;

            showNotification(submitNotification, '送信完了！解答タブを確認してください。');
            if (questionStatus) questionStatus.textContent = '解答が送信されました。';

            console.log('[Event: submitAnswerBtn click] 解答タブへの移動前に updateAnswerDisplay を呼び出します。');
            updateAnswerDisplay(); // 明示的に呼び出す

            if (tabBtnPractice) { // tabBtnPractice が存在することを確認
                console.log('[Event: submitAnswerBtn click] 解答タブに自動移動を試みます。');
                tabBtnPractice.click(); // 解答タブボタンのクリックイベントを直接発火
            } else {
                console.error('[Event: submitAnswerBtn click] tabBtnPractice 要素が見つかりません。自動移動できませんでした。');
            }
        });
    }

    // 解答タブ: 新しい問題を生成ボタン
    if (generateNewQuestionBtn) {
        generateNewQuestionBtn.addEventListener('click', () => {
            console.log('[Event: generateNewQuestionBtn click] 新しい問題を生成ボタンが押されました。');
            window.generateNewQuestion();
            showNotification(newQuestionNotification, '新しい問題が生成されました！'); // 通知を表示
            if (tabBtnIntro) { // tabBtnIntro が存在することを確認
                console.log('[Event: generateNewQuestionBtn click] 出題タブに自動移動を試みます。');
                tabBtnIntro.click(); // 出題タブボタンのクリックイベントを直接発火
            } else {
                console.error('[Event: generateNewQuestionBtn click] tabBtnIntro 要素が見つかりません。自動移動できませんでした。');
            }
        });
    }

    // // --- タブ切り替え時のイベントハンドリング ---
    if (tabsContainer) {
        tabsContainer.addEventListener('tab:switched', (event) => {
            const currentTabId = event.detail.currentTabId;
            console.log(`[Event: tab:switched] タブが切り替わりました。現在のタブID: ${currentTabId}`);
            if (currentTabId === 'practice') {
                updateAnswerDisplay();
            }
        });
        console.log('[Logic] "tab:switched" イベントリスナーを設定しました。');
    } else {
        console.error('[Logic] .simple-tab-component-container が見つかりません。"tab:switched" イベントリスナーを設定できませんでした。');
    }

    // ページロード時のデフォルトタブが解答タブだった場合のために、初回ロード時にも更新を試みる
    // (この部分は tabBtnIntro.click() で初期タブが設定されるため、ほとんどの場合不要になるが、念のため残す)
    const defaultTabId = tabsContainer ? tabsContainer.dataset.defaultTab : null;
    if (defaultTabId === 'practice') {
        console.log('[Logic] デフォルトタブが解答タブなので、初回ロード時に updateAnswerDisplay を呼び出します。');
        updateAnswerDisplay();
    } else {
        console.log(`[Logic] デフォルトタブは '${defaultTabId}' です。`);
    }

    // --- 言語選択 --- (変更なしで動作するはずですが、`updateKeyNames`の変更に合わせて説明を調整)
    if (languageSelector) {
        languageSelector.addEventListener('change', (event) => {
            if (event.target.name === 'lang') {
                const selectedLang = event.target.value;
                updateKeyNames(selectedLang);
                console.log(`[Event: lang change] 言語が '${selectedLang}' に変更されました。キー名表示を更新します。`);
            }
        });

        const initialLangRadio = document.querySelector('input[name="lang"]:checked');
        if (initialLangRadio) {
            const initialLang = initialLangRadio.value;
            console.log(`[Logic] 初期言語を '${initialLang}' に設定し、キー名表示を初期化します。`);
            updateKeyNames(initialLang);
        } else {
            console.warn('[Logic] 初期言語を選択するラジオボタンが見つかりませんでした。言語の初期化がスキップされます。');
        }
    } else {
        console.warn('[Logic] language-selector 要素が見つかりませんでした。言語切り替え機能が無効です。');
    }
});