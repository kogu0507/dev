// key-sig-exercise/script.js の内容

// 必要なモジュールをインポート
import { loadVerovio } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.0.1/verovio/loader.min.mjs';
import 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.0.1/components/simple-tab-component/script.min.js'; // タブコンポーネントのスクリプトをロード

// Verovioのツールキットインスタンスをグローバル（またはアクセス可能なスコープ）で保持
let verovioToolkit = null;

// =================================================================
// 共通データと状態管理 (window.commonMusicData, window.currentQuizState)
// =================================================================
window.commonMusicData = {
    keySignatures: [
        { meiValue: "0s", nameJp: "ハ長調 / イ短調", nameEn: "C Major / A Minor", nameDe: "C-Dur / a-Moll" },
        { meiValue: "1s", nameJp: "ト長調 / ホ短調", nameEn: "G Major / E Minor", nameDe: "G-Dur / e-Moll" },
        { meiValue: "2s", nameJp: "ニ長調 / ロ短調", nameEn: "D Major / B Minor", nameDe: "D-Dur / h-Moll" },
        { meiValue: "3s", nameJp: "イ長調 / 嬰ヘ短調", nameEn: "A Major / F# Minor", nameDe: "A-Dur / fis-Moll" },
        { meiValue: "4s", nameJp: "ホ長調 / 嬰ハ短調", nameEn: "E Major / C# Minor", nameDe: "E-Dur / cis-Moll" },
        { meiValue: "5s", nameJp: "ロ長調 / 嬰ト短調", nameEn: "B Major / G# Minor", nameDe: "H-Dur / gis-Moll" },
        { meiValue: "6s", nameJp: "嬰ヘ長調 / 嬰ニ短調", nameEn: "F# Major / D# Minor", nameDe: "Fis-Dur / dis-Moll" },
        { meiValue: "7s", nameJp: "嬰ハ長調 / 嬰イ短調", nameEn: "C# Major / A# Minor", nameDe: "Cis-Dur / ais-Moll" },
        { meiValue: "1f", nameJp: "ヘ長調 / ニ短調", nameEn: "F Major / D Minor", nameDe: "F-Dur / d-Moll" },
        { meiValue: "2f", nameJp: "変ロ長調 / ト短調", nameEn: "Bb Major / G Minor", nameDe: "B-Dur / g-Moll" },
        { meiValue: "3f", nameJp: "変ホ長調 / ハ短調", nameEn: "Eb Major / C Minor", nameDe: "Es-Dur / c-Moll" },
        { meiValue: "4f", nameJp: "変イ長調 / ヘ短調", nameEn: "Ab Major / F Minor", nameDe: "As-Dur / f-Moll" },
        { meiValue: "5f", nameJp: "変ニ長調 / 変ロ短調", nameEn: "Db Major / Bb Minor", nameDe: "Des-Dur / b-Moll" },
        { meiValue: "6f", nameJp: "変ト長調 / 変ホ短調", nameEn: "Gb Major / Eb Minor", nameDe: "Ges-Dur / es-Moll" },
        { meiValue: "7f", nameJp: "変ハ長調 / 変イ短調", nameEn: "Cb Major / Ab Minor", nameDe: "Ces-Dur / as-Moll" }
    ],
    baseMeiTemplate: `
        <mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0.0">
            <meiHead><fileDesc><titleStmt><title>Dynamic Key Sig Sample</title></titleStmt><pubStmt/></fileDesc></meiHead>
            <music><body><mdiv><score>
                <scoreDef keysig="##KEY_SIG##" meter.sym="common">
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
    correctKeySig: null, // 正しい調号のMEI値（例: "1s"）
    correctKeySigInfo: null, // 正しい調号の完全な情報オブジェクト
    userAnswer: null, // ユーザーが選択した調名 (例: "G Major / E Minor")
    quizResult: { // 採点結果を保持
        isCorrect: false,
        userKeySigMeiValue: null,
        correctKeySigMeiValue: null
    }
};

// =================================================================
// ヘルパー関数: 通知メッセージの表示/非表示を切り替える
// =================================================================
window.toggleNotification = (elementId, show) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
        console.log(`[Notification] ${elementId} の表示を ${show ? '表示' : '非表示'} にしました。`);
    } else {
        console.warn(`[Notification] 要素ID '${elementId}' が見つかりませんでした。`);
    }
};

// =================================================================
// Verovio レンダリング関数
// =================================================================
window.renderVerovioScore = async (meiString, targetElementId, statusElementId = null) => {
    console.log(`[renderVerovioScore] レンダリングを開始します。ターゲット: ${targetElementId}`);
    const viewerElement = document.getElementById(targetElementId);
    const currentStatusElement = statusElementId ? document.getElementById(statusElementId) : null; // statusElementIdがない場合はnull

    if (!viewerElement) {
        console.error(`[renderVerovioScore] ターゲット要素 '${targetElementId}' が見つかりません。`);
        if (currentStatusElement) currentStatusElement.textContent = `エラー: 表示ターゲットが見つかりません (${targetElementId})`;
        return;
    }

    if (currentStatusElement) currentStatusElement.textContent = 'レンダリング中…';
    viewerElement.innerHTML = ''; // クリア

    try {
        if (!verovioToolkit) {
            // まだロードされていない場合はここでロード
            console.log('[renderVerovioScore] Verovioツールキットを初期ロード中…');
            if (currentStatusElement) currentStatusElement.textContent = 'Verovio を初期ロード中…';
            verovioToolkit = await loadVerovio();
            console.log('[renderVerovioScore] Verovioツールキットのロードが完了しました。');
        }

        // MEI データをロードし、レンダリングオプションを設定
        verovioToolkit.loadData(meiString);
        verovioToolkit.setOptions({
            pageWidth: 800, // 必要に応じて調整
            pageHeight: 600, // 必要に応じて調整
            scale: 40 // 必要に応じて調整
        });
        console.log('[renderVerovioScore] Verovioオプションを設定しました。');

        // SVGを生成してビューアに表示
        const svg = verovioToolkit.renderToSVG(1, {}); // 最初のページをレンダリング
        viewerElement.innerHTML = svg;
        if (currentStatusElement) currentStatusElement.textContent = 'レンダリング完了！';
        console.log(`[renderVerovioScore] レンダリングが完了しました。SVGを '${targetElementId}' に挿入しました。`);
    } catch (err) {
        console.error('[renderVerovioScore] Verovio レンダリングエラー:', err);
        if (currentStatusElement) currentStatusElement.textContent = 'エラーが発生しました: ' + err.message;
    }
};

// =================================================================
// 新しい問題を生成し、出題タブの表示を更新する共通関数
// =================================================================
window.generateNewQuestion = () => {
    console.log('[generateNewQuestion] 新しい問題の生成を開始します。');
    if (!window.commonMusicData || !window.renderVerovioScore || !window.currentQuizState) {
        console.error('[generateNewQuestion] エラー: 必要なデータまたは関数がロードされていません。');
        return;
    }

    // 各タブの通知メッセージを非表示にリセット
    window.toggleNotification('submit-notification', false); // 出題タブ
    window.toggleNotification('new-question-notification', false); // 解答タブ

    const keySigs = window.commonMusicData.keySignatures;
    const randomIndex = Math.floor(Math.random() * keySigs.length);
    const selectedKeySigInfo = keySigs[randomIndex];

    // クイズ状態をリセットし、新しい問題を設定
    window.currentQuizState.correctKeySig = selectedKeySigInfo.meiValue;
    window.currentQuizState.correctKeySigInfo = selectedKeySigInfo;
    window.currentQuizState.userAnswer = null;
    window.currentQuizState.quizResult.isCorrect = false;
    window.currentQuizState.quizResult.userKeySigMeiValue = null;
    window.currentQuizState.quizResult.correctKeySigMeiValue = null;

    console.log('[generateNewQuestion] currentQuizState をリセットしました:', JSON.parse(JSON.stringify(window.currentQuizState)));
    console.log(`[generateNewQuestion] 選択された調号: ${selectedKeySigInfo.nameEn} (MEI: ${selectedKeySigInfo.meiValue})`);

    // 出題タブのプルダウンをリセット（DOMが既に存在する場合のみ）
    const userAnswerSelect = document.getElementById('user-answer-select');
    if (userAnswerSelect) {
        userAnswerSelect.value = "";
        console.log('[generateNewQuestion] ユーザー解答プルダウンをリセットしました。');
    }

    // 出題タブの楽譜をレンダリング
    const meiToRender = window.commonMusicData.baseMeiTemplate.replace('##KEY_SIG##', window.currentQuizState.correctKeySig);
    console.log(`[generateNewQuestion] Verovioに渡すMEIの調号部分: ${window.currentQuizState.correctKeySig}`);
    window.renderVerovioScore(meiToRender, 'question-viewer', 'question-status');
    const questionStatus = document.getElementById('question-status');
    if (questionStatus) {
        questionStatus.textContent = `譜例の調号を見て調名を答えましょう。`;
    }

    console.log('[generateNewQuestion] 新しい問題の生成が完了しました。');
};

// =================================================================
// 解答タブの表示更新関数
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
    window.toggleNotification('new-question-notification', false);

    const { quizResult, correctKeySigInfo } = window.currentQuizState;
    console.log('[updateAnswerDisplay] currentQuizState.quizResult:', JSON.parse(JSON.stringify(quizResult)));
    console.log('[updateAnswerDisplay] currentQuizState.correctKeySigInfo:', JSON.parse(JSON.stringify(correctKeySigInfo)));

    // DOM要素を関数内で再取得
    const answerFeedback = document.getElementById('answer-feedback');
    const displayUserAnswer = document.getElementById('display-user-answer');
    const displayCorrectAnswerJp = document.getElementById('display-correct-answer-jp');
    const displayCorrectAnswerEn = document.getElementById('display-correct-answer-en');
    const displayCorrectAnswerDe = document.getElementById('display-correct-answer-de');
    const answerViewer = document.getElementById('answer-viewer');
    const answerStatus = document.getElementById('answer-status'); // answerStatusもここで再取得

    // 解答が送信されていない場合は、その旨を伝える
    if (!correctKeySigInfo || quizResult.userKeySigMeiValue === null) {
        console.log('[updateAnswerDisplay] 解答がまだ送信されていません。');
        if (answerFeedback) answerFeedback.innerHTML = 'まだ解答が送信されていません。<br>「出題」タブで解答を選択し、**解答を送信**ボタンを押してください。';
        if (answerFeedback) answerFeedback.style.color = '#555';
        if (answerViewer) answerViewer.innerHTML = '';
        if (displayUserAnswer) displayUserAnswer.textContent = 'N/A';
        if (displayCorrectAnswerJp) displayCorrectAnswerJp.textContent = 'N/A';
        if (displayCorrectAnswerEn) displayCorrectAnswerEn.textContent = 'N/A';
        if (displayCorrectAnswerDe) displayCorrectAnswerDe.textContent = 'N/A';
        return;
    }

    console.log(`[Debug - Inside updateAnswerDisplay] displayUserAnswer要素の存在: ${!!displayUserAnswer}`);
    console.log(`[Debug - Inside updateAnswerDisplay] displayCorrectAnswerJp要素の存在: ${!!displayCorrectAnswerJp}`);
    console.log(`[Debug - Inside updateAnswerDisplay] displayCorrectAnswerEn要素の存在: ${!!displayCorrectAnswerEn}`);
    console.log(`[Debug - Inside updateAnswerDisplay] displayCorrectAnswerDe要素の存在: ${!!displayCorrectAnswerDe}`);


    // ユーザーの解答の表示
    let userSelectedName = "未選択";
    if (quizResult.userKeySigMeiValue) {
        const selectedOption = window.commonMusicData.keySignatures.find(
            ks => ks.meiValue === quizResult.userKeySigMeiValue
        );
        if (selectedOption) {
            userSelectedName = selectedOption.nameEn;
        }
    }
    if (displayUserAnswer) {
        displayUserAnswer.textContent = userSelectedName;
        console.log(`[updateAnswerDisplay] 表示ユーザー解答: ${userSelectedName}`);
    }

    // 正解の表示
    if (displayCorrectAnswerJp) {
        displayCorrectAnswerJp.textContent = correctKeySigInfo.nameJp;
        console.log(`[updateAnswerDisplay] 表示正解(JP): ${correctKeySigInfo.nameJp}`);
    }
    if (displayCorrectAnswerEn) {
        displayCorrectAnswerEn.textContent = correctKeySigInfo.nameEn;
        console.log(`[updateAnswerDisplay] 表示正解(EN): ${correctKeySigInfo.nameEn}`);
    }
    if (displayCorrectAnswerDe) {
        displayCorrectAnswerDe.textContent = correctKeySigInfo.nameDe;
        console.log(`[updateAnswerDisplay] 表示正解(DE): ${correctKeySigInfo.nameDe}`);
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
    window.renderVerovioScore(meiToRender, 'answer-viewer', 'answer-status');

    console.log('[updateAnswerDisplay] 解答タブの表示更新が完了しました。');
}


// =================================================================
// DOMContentLoaded イベントリスナー
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Logic] DOMContentLoaded イベント発生。スクリプトの実行を開始します。');

    // --- DOM要素の取得（初回ロード時のみ。関数内で再取得する要素はここから削除） ---
    const userAnswerSelect = document.getElementById('user-answer-select');
    const submitAnswerBtn = document.getElementById('submit-answer-btn');
    const questionStatus = document.getElementById('question-status');
    const submitNotification = document.getElementById('submit-notification');

    const generateNewQuestionBtn = document.getElementById('generate-new-question-btn');
    const newQuestionNotification = document.getElementById('new-question-notification');

    const tabBtnIntro = document.getElementById('tab-btn-intro');
    const tabBtnPractice = document.getElementById('tab-btn-practice');

    console.log('[Logic] すべての主要DOM要素を取得しました。');

    // --- 初期化処理 ---
    // プルダウンメニューのオプションを動的に生成（初回ロード時のみ）
    if (userAnswerSelect && window.commonMusicData && window.commonMusicData.keySignatures && userAnswerSelect.options.length <= 1) {
        console.log('[Logic] プルダウンメニューのオプションを生成します。');
        window.commonMusicData.keySignatures.forEach(keySig => {
            const option = document.createElement('option');
            option.value = keySig.meiValue;
            option.textContent = keySig.nameEn;
            userAnswerSelect.appendChild(option);
        });
        console.log('[Logic] プルダウンメニューのオプション生成完了。');
    } else {
        console.log('[Logic] プルダウンメニューは既に生成済みか、必要なデータがありません。');
    }

    // ページロード時に最初の問題を生成
    if (window.generateNewQuestion) {
        console.log('[Logic] ページロード時に最初の問題を生成します。');
        window.generateNewQuestion();
    } else {
        console.error("[Logic] エラー: window.generateNewQuestion が定義されていません。");
        if (questionStatus) questionStatus.textContent = '初期化エラー: 問題生成関数がありません。';
    }

    // --- イベントリスナー設定 ---

    // 出題タブ: ユーザーの解答を保存
    if (userAnswerSelect) {
        userAnswerSelect.addEventListener('change', (event) => {
            window.currentQuizState.userAnswer = event.target.value;
            console.log(`[Event: userAnswerSelect change] ユーザーが選択: ${event.target.value}. currentQuizState.userAnswer を更新しました。`);
            window.toggleNotification('submit-notification', false);
        });
    }

    // 出題タブ: 解答送信ボタンの処理
    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', () => {
            console.log('[Event: submitAnswerBtn click] 解答送信ボタンが押されました。');
            if (!window.currentQuizState.userAnswer) {
                if (questionStatus) questionStatus.textContent = '答えを選択してください。';
                console.warn('[Event: submitAnswerBtn click] ユーザーが答えを選択していません。');
                return;
            }

            window.currentQuizState.quizResult.userKeySigMeiValue = window.currentQuizState.userAnswer;
            window.currentQuizState.quizResult.correctKeySigMeiValue = window.currentQuizState.correctKeySig;
            window.currentQuizState.quizResult.isCorrect = (window.currentQuizState.userAnswer === window.currentQuizState.correctKeySig);
            console.log('[Event: submitAnswerBtn click] 採点結果を currentQuizState に保存しました:', JSON.parse(JSON.stringify(window.currentQuizState.quizResult)));

            window.toggleNotification('submit-notification', true);
            if (questionStatus) questionStatus.textContent = '解答が送信されました。';

            console.log('[Event: submitAnswerBtn click] 解答タブへの移動前に updateAnswerDisplay を呼び出します。');
            updateAnswerDisplay(); // 明示的に呼び出す

            if (tabBtnPractice) {
                console.log('[Event: submitAnswerBtn click] 解答タブに自動移動を試みます。');
                tabBtnPractice.click();
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
            window.toggleNotification('new-question-notification', true);
            if (tabBtnIntro) {
                console.log('[Event: generateNewQuestionBtn click] 出題タブに自動移動を試みます。');
                tabBtnIntro.click();
            } else {
                console.error('[Event: generateNewQuestionBtn click] tabBtnIntro 要素が見つかりません。自動移動できませんでした。');
            }
        });
    }

    // --- タブ切り替え時のイベントハンドリング ---
    const tabsContainer = document.querySelector('.simple-tab-component-container');
    if (tabsContainer) {
        tabsContainer.addEventListener('tab:switched', (event) => {
            const currentTabId = event.detail.currentTabId;
            console.log(`[Event: tab:switched] タブが切り替わりました。現在のタブID: ${currentTabId}`);
            if (currentTabId === 'practice') { // 解答タブのID
                updateAnswerDisplay(); // 解答タブに切り替わったら内容を更新
            }
        });
        console.log('[Logic] "tab:switched" イベントリスナーを設定しました。');
    } else {
        console.error('[Logic] .simple-tab-component-container が見つかりません。"tab:switched" イベントリスナーを設定できませんでした。');
    }

    // ページロード時のデフォルトタブが解答タブだった場合のために、初回ロード時にも更新を試みる
    const defaultTabId = tabsContainer ? tabsContainer.dataset.defaultTab : null;
    if (defaultTabId === 'practice') {
        console.log('[Logic] デフォルトタブが解答タブなので、初回ロード時に updateAnswerDisplay を呼び出します。');
        updateAnswerDisplay();
    } else {
        console.log(`[Logic] デフォルトタブは '${defaultTabId}' です。`);
    }
});