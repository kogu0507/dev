// script.js

import { loadVerovio } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.4.0//verovio/loader.min.js';
import { CoreProcessor } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.4.0//verovio/core-processor.min.js';
import { ScoreUIHandler } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.4.0//verovio/score-ui-handler.min.js';
import { defaultOptions } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.4.0//verovio/render-options.js';

// Tone.jsと@tonejs/midiのローダー
import { loadToneJs } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.4.0/tonejs/loader.min.mjs';
import { loadToneJsMidi } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@2.4.0/tonejs/tonejs-midi-loader.min.mjs';


let coreProcessor = null;
const uiHandler = new ScoreUIHandler();
let embeddedMeiString = null;

// ★ 定数で総小節数を定義します ★
// 現在は3小節、最終的には49小節になる予定ですが、MEIデータに合わせてここを調整してください。
const TOTAL_MEASURES_STATIC = 3; 
let totalMeasures = 0; // initializeVerovioでこの値にTOTAL_MEASURES_STATICを代入します

/**
 * Verovioを初期化し、埋め込みMEIデータを読み込みます。
 * この関数は一度だけ実行されることを想定しています。
 */
async function initializeVerovio() {
    if (!coreProcessor) {
        const toolkit = await loadVerovio();
        coreProcessor = new CoreProcessor(toolkit);
        // 必要に応じてデフォルトオプションを設定
        coreProcessor.setRenderOptions({
            ...defaultOptions,
            footer: 'none', // フッターを非表示にする
            header: 'none', // ヘッダーを非表示にする
            pageHeight: 1000, // 高さを十分に確保
            pageWidth: 1000,  // 幅を十分に確保
            adjustPageHeight: true, // コンテンツに合わせて高さを調整
        });

        const meiScriptTag = document.getElementById('embeddedMei');
        if (meiScriptTag) {
            embeddedMeiString = meiScriptTag.textContent;
            console.log('埋め込みMEIデータを取得しました。');

            // 定義した定数を総小節数として設定
            totalMeasures = TOTAL_MEASURES_STATIC;
            console.log(`設定された総小節数: ${totalMeasures}`);

        } else {
            console.error("ID 'embeddedMei' のMEIデータが見つかりませんでした。");
            uiHandler.showError("MEIデータが見つかりませんでした。", 'rdmQuestionTab');
        }
    }
}

/**
 * 指定された小節番号の楽譜をレンダリングして表示します。
 * @param {number} measureNumber - 表示する小節の番号 (1から始まる)
 * @param {string} targetElementId - レンダリングしたSVGを表示するDOM要素のID
 */
async function displayMeasure(measureNumber, targetElementId) {
    if (!coreProcessor || !embeddedMeiString) {
        await initializeVerovio(); // 未初期化の場合は初期化を試みる
        if (!coreProcessor || !embeddedMeiString) {
            uiHandler.showError("Verovioの初期化またはMEIデータの読み込みに失敗しました。", targetElementId);
            return;
        }
    }

    const targetDiv = document.getElementById(targetElementId);
    if (!targetDiv) {
        console.error(`ターゲット要素ID '${targetElementId}' が見つかりません。`);
        return;
    }

    uiHandler.clearMessage(targetElementId);
    targetDiv.classList.add('loading');
    // targetDiv.textContent = `小節 ${measureNumber} を読み込み中...`; // テキストはUIで見えないようにする

    try {
        if (measureNumber < 1 || measureNumber > totalMeasures) {
            uiHandler.showError(`小節番号 ${measureNumber} は範囲外です。1から${totalMeasures}の間で指定してください。`, targetElementId);
            return;
        }

        const svg = await coreProcessor.renderSvgFromMei(
            embeddedMeiString,
            { measureRange: `${measureNumber}-${measureNumber}` }
        );
        uiHandler.displaySvg(svg, targetElementId);
    } catch (e) {
        console.error(`小節 ${measureNumber} の表示エラー:`, e);
        uiHandler.showError(`小節 ${measureNumber} の表示に失敗しました。`, targetElementId);
    } finally {
        targetDiv.classList.remove('loading');
    }
}

/**
 * ランダムな小節番号を生成します。
 * @returns {number} 1からtotalMeasuresまでのランダムな小節番号
 */
function getRandomMeasureNumber() {
    if (totalMeasures === 0) {
        console.warn("総小節数がまだ設定されていません。デフォルト値を使用します。");
        return 1; // または適切なデフォルト値
    }
    return Math.floor(Math.random() * totalMeasures) + 1;
}

// DOM要素の取得
const rdmQuestionMain = document.querySelector('.rdm-question-main');
const activationButton = document.querySelector('.rdm-activation-button');
const playCorrectAnswerButtonQuestionTab = document.querySelector('#rdmQuestionTab .rdm-play-correct-answer-button');
const showAnswerButton = document.querySelector('.rdm-show-answer');
const newQuestionButton = document.querySelector('.rdm-new-question-button');

// 問題表示用のイメージ要素
const rdmFirstHalfImage = document.getElementById('rdmFirstHalfImage');
const rdmSecondHalfImage = document.getElementById('rdmSecondHalfImage');

// 現在出題中の小節番号を保持する変数
let currentQuestionMeasure = 0;

// アプリケーションの状態を管理するオブジェクト
const appState = {
    isActivated: false,
};

/**
 * 新しい問題を生成し、表示します。
 */
async function generateNewQuestion() {
    currentQuestionMeasure = getRandomMeasureNumber();
    console.log(`新しい問題（小節番号: ${currentQuestionMeasure}）を生成します。`);

    // ユーザー選択エリアの表示をクリア
    rdmFirstHalfImage.src = '';
    rdmSecondHalfImage.src = '';
    rdmFirstHalfImage.alt = '選択した前半のリズム';
    rdmSecondHalfImage.alt = '選択した後半のリズム';

    const instructionMessage = document.getElementById('rdmInstructionMessage');
    instructionMessage.textContent = "出題音源を聴いて、リズムを選択してください。";

    // 問題の表示は、現時点では楽譜画像としてではなく、今後のリズム画像ボタンの選択に委ねられます。
    // そのため、ここでは直接SVGを描画する処理は呼び出しません。
}

/**
 * 「聴音を開始」ボタンのクリックハンドラ
 */
activationButton.addEventListener('click', async () => {
    if (!appState.isActivated) {
        console.log("聴音を開始します。");
        activationButton.textContent = "準備中...";
        activationButton.disabled = true;

        await initializeVerovio(); // Verovioを初期化

        if (coreProcessor && embeddedMeiString) {
            appState.isActivated = true;
            activationButton.classList.add('rdm-visually-hidden'); // ボタンを非表示に
            rdmQuestionMain.classList.remove('rdm-visually-hidden'); // 問題セクションを表示
            await generateNewQuestion(); // 最初の問題を生成
            activationButton.textContent = "聴音を開始"; // テキストを元に戻すが、非表示なのでユーザーには見えない
            activationButton.disabled = false;
        } else {
            console.error("Verovioの初期化に失敗したため、開始できません。");
            activationButton.textContent = "エラーが発生しました";
            activationButton.disabled = false;
        }
    }
});

/**
 * 「出題音源を聴く（もう一度聴く）」ボタンのクリックハンドラ
 */
playCorrectAnswerButtonQuestionTab.addEventListener('click', async () => {
    if (currentQuestionMeasure > 0) {
        console.log(`問題音源を再生: 小節 ${currentQuestionMeasure}`);
        // TODO: Tone.jsを使用して、currentQuestionMeasureの音源を再生する処理をここに実装
    } else {
        console.warn("出題中の問題がありません。");
    }
});

/**
 * 「解答を送信」ボタンのクリックハンドラ
 */
showAnswerButton.addEventListener('click', () => {
    console.log("解答を送信しました。");
    // TODO: ユーザーの選択と正しい解答を比較し、結果を解答タブに表示する処理
    // そして、解答タブに切り替える処理
    document.querySelector('.simple-tab-component-container')._switchTab('rdmAnswerTab');
});

/**
 * 「新しい問題を生成」ボタンのクリックハンドラ
 */
newQuestionButton.addEventListener('click', async () => {
    console.log("新しい問題を生成します。");
    await generateNewQuestion(); // 新しい問題を生成
    document.querySelector('.simple-tab-component-container')._switchTab('rdmQuestionTab'); // 問題タブに戻る
});