// key-sig-exercise/script.js

// 必要な外部モジュールをインポート
import 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.0.1/components/simple-tab-component/script.min.js'; // タブコンポーネントのスクリプトをロード

// ローカルモジュールからのインポート
import { keySignatures, baseMeiTemplate } from './data/keySignatures.js';
import { renderKeySelectTables, loadUiBuilderCss } from './modules/uiBuilder.js'; // loadUiBuilderCss をインポート
import { renderVerovioScore } from './modules/verovioRenderer.js'; // Verovioレンダリング関数をインポート
import { updateKeyNames, applyMusicKeyFormatting } from './modules/languageHandler.js'; // 言語処理関数をインポート







// keySpansをグローバルスコープで宣言 (DOMContentLoaded内で再取得し、更新されるようにする)
let keySpans = [];

// =================================================================
// 共通データと状態管理 (window.commonMusicData, window.currentQuizState)
// =================================================================
// data/keySignatures.js からインポートしたデータを window.commonMusicData に割り当てる
window.commonMusicData = {
    keySignatures: keySignatures,
    baseMeiTemplate: baseMeiTemplate
};

// クイズ状態管理は script.js 内に保持
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
// ヘルパー関数: 通知メッセージの表示/非表示を切り替える (script.js に残す)
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
// 新しい問題を生成し、出題タブの表示を更新する共通関数 (script.js に残す)
// =================================================================
window.generateNewQuestion = () => { // windowにアタッチして外部からアクセス可能にする
    console.log('[GenerateQuestion] 新しい問題の生成を開始します。');
    if (!window.commonMusicData || !renderVerovioScore || !window.currentQuizState) { // renderVerovioScore を直接参照
        console.error('[GenerateQuestion] エラー: 必要なデータまたは関数がロードされていません。');
        return;
    }

    // 各タブの通知メッセージを非表示にリセット
    hideNotification(document.getElementById('submit-notification'));
    hideNotification(document.getElementById('new-question-notification'));

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

    console.log('[GenerateQuestion] currentQuizState をリセットしました:', JSON.parse(JSON.stringify(window.currentQuizState)));
    console.log(`[GenerateQuestion] 選択された調号: ${selectedKeySigInfo.nameMajorEn} / ${selectedKeySigInfo.nameMinorEn} (MEI: ${selectedKeySigInfo.meiValue})`);

    // ユーザー解答ラジオボタンをリセット
    const allMajorRadios = document.querySelectorAll('input[name="majorKey"]');
    allMajorRadios.forEach(radio => radio.checked = false);

    const allMinorRadios = document.querySelectorAll('input[name="minorKey"]');
    allMinorRadios.forEach(radio => radio.checked = false);

    // 送信ボタンはデフォルトで無効にする
    document.getElementById('submitAnswerBtn').disabled = true;
    console.log('[GenerateQuestion] ユーザー解答ラジオボタンをリセットしました。');

    // 出題タブの楽譜をレンダリング
    const meiToRender = window.commonMusicData.baseMeiTemplate.replace('##KEY_SIG##', window.currentQuizState.correctKeySigMeiValue);
    console.log(`[GenerateQuestion] Verovioに渡すMEIの調号部分: ${window.currentQuizState.correctKeySigMeiValue}`);
    renderVerovioScore('question-viewer', meiToRender, 'question-status'); // renderVerovioScore を直接呼び出す
    const questionStatus = document.getElementById('question-status');
    if (questionStatus) {
        questionStatus.textContent = `譜例の調号を見て調名を答えましょう。`;
    }

    console.log('[GenerateQuestion] 新しい問題の生成が完了しました。');
};

// =================================================================
// 解答タブの表示更新関数 (script.js に残す)
// =================================================================
function updateAnswerDisplay() { // windowにアタッチせず、DOMContentLodedからのみ呼び出される想定
    console.log('[UpdateAnswerDisplay] 解答タブの表示更新を開始します。');
    if (!window.currentQuizState || !window.commonMusicData || !renderVerovioScore) { // renderVerovioScore を直接参照
        const ansStatus = document.getElementById('answer-status');
        if (ansStatus) ansStatus.textContent = 'エラー: 必要なデータまたは関数がロードされていません。';
        console.error('[UpdateAnswerDisplay] エラー: currentQuizState, commonMusicData, または renderVerovioScore が見つかりません。');
        return;
    }

    // 「新しい問題生成完了」メッセージを非表示にリセット
    hideNotification(document.getElementById('new-question-notification'));

    const { quizResult, correctKeySigInfo } = window.currentQuizState;
    console.log('[UpdateAnswerDisplay] currentQuizState.quizResult:', JSON.parse(JSON.stringify(quizResult)));
    console.log('[UpdateAnswerDisplay] currentQuizState.correctKeySigInfo:', JSON.parse(JSON.stringify(correctKeySigInfo)));

    // DOM要素を関数内で再取得
    const answerFeedback = document.getElementById('answer-feedback');
    const displayUserMajorAnswer = document.getElementById('displayUserMajorAnswer');
    const displayUserMinorAnswer = document.getElementById('displayUserMinorAnswer');
    const displayCorrectAnswerJp = document.getElementById('displayCorrectAnswerJp');
    const displayCorrectAnswerEn = document.getElementById('displayCorrectAnswerEn');
    const displayCorrectAnswerDe = document.getElementById('displayCorrectAnswerDe');
    const answerViewer = document.getElementById('answer-viewer');
    const answerStatus = document.getElementById('answer-status');

    // 解答が送信されていない場合は、その旨を伝える
    if (!correctKeySigInfo || (!quizResult.userMajorAnswerMeiValue && !quizResult.userMinorAnswerMeiValue)) {
        console.log('[UpdateAnswerDisplay] 解答がまだ送信されていません。');
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
        console.log(`[UpdateAnswerDisplay] 表示ユーザー長調解答: ${userSelectedMajorName}`);
    }
    if (displayUserMinorAnswer) {
        displayUserMinorAnswer.textContent = userSelectedMinorName;
        console.log(`[UpdateAnswerDisplay] 表示ユーザー短調解答: ${userSelectedMinorName}`);
    }

    // 正解の表示
    if (displayCorrectAnswerJp) {
        displayCorrectAnswerJp.textContent = `${correctKeySigInfo.nameMajorJp} / ${correctKeySigInfo.nameMinorJp}`;
        console.log(`[UpdateAnswerDisplay] 表示正解(JP): ${displayCorrectAnswerJp.textContent}`);
    }
    if (displayCorrectAnswerEn) {
        displayCorrectAnswerEn.textContent = `${correctKeySigInfo.nameMajorEn} / ${correctKeySigInfo.nameMinorEn}`;
        console.log(`[UpdateAnswerDisplay] 表示正解(EN): ${displayCorrectAnswerEn.textContent}`);
    }
    if (displayCorrectAnswerDe) {
        displayCorrectAnswerDe.textContent = `${correctKeySigInfo.nameMajorDe} / ${correctKeySigInfo.nameMinorDe}`;
        console.log(`[UpdateAnswerDisplay] 表示正解(DE): ${displayCorrectAnswerDe.textContent}`);
    }

    // 正解/不正解のフィードバック
    if (answerFeedback) {
        if (quizResult.isCorrect) {
            answerFeedback.textContent = '🎉 正解です！素晴らしい！ 🎉';
            answerFeedback.style.color = 'green';
            console.log('[UpdateAnswerDisplay] フィードバック: 正解');
        } else {
            answerFeedback.textContent = '残念！不正解です。';
            answerFeedback.style.color = 'red';
            console.log('[UpdateAnswerDisplay] フィードバック: 不正解');
        }
    }

    // 正解の楽譜を表示
    let meiToRender = window.commonMusicData.baseMeiTemplate.replace('##KEY_SIG##', correctKeySigInfo.meiValue);
    console.log(`[UpdateAnswerDisplay] 解答タブでレンダリングするMEIの調号部分: ${correctKeySigInfo.meiValue}`);
    renderVerovioScore('answer-viewer', meiToRender, 'answer-status'); // renderVerovioScore を直接呼び出す

    console.log('[UpdateAnswerDisplay] 解答タブの表示更新が完了しました。');
}


// =================================================================
// DOMContentLoaded イベントリスナー
// =================================================================
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
    const languageSelector = document.getElementById('language-selector');

    console.log('[Logic] すべての主要DOM要素を取得しました。');

    // ==== ページロード時の強制的なタブ移動処理を追加 ====
    if (tabBtnIntro) {
        setTimeout(() => {
            console.log('[Logic] ページロード後の初期タブ強制切り替えを実行します。');
            tabBtnIntro.click();
            if (window.location.hash) {
                console.log('[Logic] URLハッシュをクリアします。');
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }, 100);
    }

    // --- 初期化処理 ---

    // ページロード時にUIテーブルを生成（CSSをロード→テーブル作成）
    if (loadUiBuilderCss) {
        loadUiBuilderCss();
    } else {
        console.error("[Logic] エラー: loadUiBuilderCss が定義されていません。");
    }
    renderKeySelectTables(); 
    console.log("[Logic] 調号選択テーブルが生成されました。");

    
    
    // ページロード時に最初の問題を生成
    if (window.generateNewQuestion) { // windowにアタッチされている関数を呼び出す
        console.log('[Logic] ページロード時に最初の問題を生成します。');
        window.generateNewQuestion();
    } else {
        console.error("[Logic] エラー: window.generateNewQuestion が定義されていません。");
        if (questionStatus) questionStatus.textContent = '初期化エラー: 問題生成関数がありません。';
    }

    // keySpansの初期化 (テーブル生成後に実行)
    keySpans = document.querySelectorAll('.music-key');

    // 初期言語の適用
    const initialLangRadio = document.querySelector('input[name="lang"]:checked');
    if (initialLangRadio) {
        const initialLang = initialLangRadio.value;
        console.log(`[Logic] 初期言語を '${initialLang}' に設定し、キー名表示を初期化します。`);
        updateKeyNames(initialLang); // modules/languageHandler.js からインポートした関数を呼び出す
    } else {
        console.warn('[Logic] 初期言語を選択するラジオボタンが見つかりませんでした。言語の初期化がスキップされます。');
    }

    // --- イベントリスナー設定 ---

    // 長調ラジオボタンの処理
    if (majorKeyGrid) {
        majorKeyGrid.addEventListener('change', (event) => {
            if (event.target.type === 'radio' && event.target.name === 'majorKey') {
                window.currentQuizState.userMajorAnswerMeiValue = event.target.value;
                console.log(`[Event: majorKey change] ユーザーが長調を選択: ${event.target.value}. currentQuizState.userMajorAnswerMeiValue を更新しました。`);
                if (submitAnswerBtn) {
                    const isMajorSelected = document.querySelector('input[name="majorKey"]:checked');
                    const isMinorSelected = document.querySelector('input[name="minorKey"]:checked');
                    submitAnswerBtn.disabled = !(isMajorSelected && isMinorSelected);
                }
                hideNotification(submitNotification);
            }
        });
    }

    // 短調ラジオボタンの処理
    if (minorKeyGrid) {
        minorKeyGrid.addEventListener('change', (event) => {
            if (event.target.type === 'radio' && event.target.name === 'minorKey') {
                window.currentQuizState.userMinorAnswerMeiValue = event.target.value;
                console.log(`[Event: minorKey change] ユーザーが短調を選択: ${event.target.value}. currentQuizState.userMinorAnswerMeiValue を更新しました。`);
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

            // 採点ロジック
            const isCorrect = (userMajorMei === correctMei) && (userMinorMei === correctMei);

            window.currentQuizState.quizResult = {
                isCorrect: isCorrect,
                userMajorAnswerMeiValue: userMajorMei,
                userMinorAnswerMeiValue: userMinorMei,
                correctKeySigMeiValue: correctMei
            };
            console.log('[Event: submitAnswerBtn click] 採点結果を currentQuizState に保存しました:', JSON.parse(JSON.stringify(window.currentQuizState.quizResult)));

            submitAnswerBtn.disabled = true;

            showNotification(submitNotification, '送信完了！解答タブを確認してください。');
            if (questionStatus) questionStatus.textContent = '解答が送信されました。';

            console.log('[Event: submitAnswerBtn click] 解答タブへの移動前に updateAnswerDisplay を呼び出します。');
            updateAnswerDisplay(); // script.js 内の関数を呼び出す

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
            window.generateNewQuestion(); // windowにアタッチされている関数を呼び出す
            showNotification(newQuestionNotification, '新しい問題が生成されました！');
            if (tabBtnIntro) {
                console.log('[Event: generateNewQuestionBtn click] 出題タブに自動移動を試みます。');
                tabBtnIntro.click();
            } else {
                console.error('[Event: generateNewQuestionBtn click] tabBtnIntro 要素が見つかりません。自動移動できませんでした。');
            }
        });
    }

    // --- タブ切り替え時のイベントハンドリング ---
    if (tabsContainer) {
        tabsContainer.addEventListener('tab:switched', (event) => {
            const currentTabId = event.detail.currentTabId;
            console.log(`[Event: tab:switched] タブが切り替わりました。現在のタブID: ${currentTabId}`);
            if (currentTabId === 'practice') {
                updateAnswerDisplay(); // script.js 内の関数を呼び出す
            }
        });
        console.log('[Logic] "tab:switched" イベントリスナーを設定しました。');
    } else {
        console.error('[Logic] .simple-tab-component-container が見つかりません。"tab:switched" イベントリスナーを設定できませんでした。');
    }

    const defaultTabId = tabsContainer ? tabsContainer.dataset.defaultTab : null;
    if (defaultTabId === 'practice') {
        console.log('[Logic] デフォルトタブが解答タブなので、初回ロード時に updateAnswerDisplay を呼び出します。');
        updateAnswerDisplay();
    } else {
        console.log(`[Logic] デフォルトタブは '${defaultTabId}' です。`);
    }

    // --- 言語選択 ---
    if (languageSelector) {
        languageSelector.addEventListener('change', (event) => {
            if (event.target.name === 'lang') {
                const selectedLang = event.target.value;
                updateKeyNames(selectedLang); // modules/languageHandler.js からインポートした関数を呼び出す
                console.log(`[Event: lang change] 言語が '${selectedLang}' に変更されました。キー名表示を更新します。`);
            }
        });
    } else {
        console.warn('[Logic] language-selector 要素が見つかりませんでした。言語切り替え機能が無効です。');
    }
});