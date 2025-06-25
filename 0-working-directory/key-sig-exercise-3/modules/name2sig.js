// modules/name2sig.js

import { keySignatures, baseMeiTemplate } from '../data/keySignatures.js';
import { renderVerovio } from './verovioLoader.js';
import { showNotification, hideNotification } from '../utils/notification.js';
import { $, show, hide } from '../utils/dom.js';

/**
 * 質問生成／回答表示の内部状態
 * @property {number} correctIndex  正解のインデックス
 * @property {number} currentIndex  現在ユーザーが選択中のインデックス
 */
const state = {
  correctIndex: 0,
  currentIndex: 0,
};

/**
 * Verovio 質問ビューアを更新する
 */
function renderQuestionViewer() {
  const meiValue = keySignatures[state.currentIndex].meiValue;
  const meiXml = baseMeiTemplate.replace('##KEY_SIG##', meiValue);
  renderVerovio('name2sig-viewer', meiXml);
}

/**
 * Verovio 回答ビューアを更新し、回答パネルを表示する
 */
function renderAnswerViewer() {
  const correct = keySignatures[state.correctIndex];
  const user    = keySignatures[state.currentIndex];

  // ユーザーの回答表示
  $('#displayN2SUserAnswer').textContent =
    `${user.nameMajorJp} / ${user.nameMinorJp}`;
  // 正解の表示
  $('#displayN2SCorrectAnswer').textContent =
    `${correct.nameMajorJp} / ${correct.nameMinorJp}`;

  // 正解譜面をレンダリング
  const correctXml = baseMeiTemplate.replace('##KEY_SIG##', correct.meiValue);
  renderVerovio('name2sig-answer-viewer', correctXml);

  // パネル切り替え
  hide($('#question-n2s'));
  show($('#answer-n2s'));
}

/**
 * 新しい問題を生成し、質問パネルを初期化して表示
 */
function _generateName2SigQuestion() {
  // 通知をリセット
  hideNotification($('#name2sig-notification'));
  hide($('#new-n2s-notification'));

  // 正解インデックスをランダムに決定し、現在選択インデックスも同じに
  state.correctIndex = Math.floor(Math.random() * keySignatures.length);
  state.currentIndex = state.correctIndex;

  // UI セットアップ
  show($('#question-n2s'));
  hide($('#answer-n2s'));
  $('#submitName2SigBtn').disabled = true;
  $('#name2sig-status').textContent =
    '矢印で調号を調整し、解答を送信してください。';

  // 質問ビューアを描画
  renderQuestionViewer();
}

/**
 * 外部から呼び出せるようにエクスポート
 */
export function generateName2SigQuestion() {
  _generateName2SigQuestion();
}

/**
 * 調名→調号モードの初期化
 * - ボタンイベントのバインド
 * - 初回問題の自動生成
 */
export function initName2Sig() {
  const decBtn    = $('#decreaseAccBtn');
  const incBtn    = $('#increaseAccBtn');
  const submitBtn = $('#submitName2SigBtn');
  const genBtn    = $('#generate-n2s-question-btn');

  // フラットを減らすボタン
  decBtn.addEventListener('click', () => {
    if (state.currentIndex > 0) {
      state.currentIndex--;
      renderQuestionViewer();
      submitBtn.disabled = false;
    }
  });

  // シャープを増やすボタン
  incBtn.addEventListener('click', () => {
    if (state.currentIndex < keySignatures.length - 1) {
      state.currentIndex++;
      renderQuestionViewer();
      submitBtn.disabled = false;
    }
  });

  // 解答送信ボタン
  submitBtn.addEventListener('click', () => {
    showNotification($('#name2sig-notification'), '解答を送信しました！');
    renderAnswerViewer();
  });

  // 新しい問題生成ボタン
  genBtn.addEventListener('click', () => {
    _generateName2SigQuestion();
    showNotification($('#new-n2s-notification'), '新しい問題が生成されました！');
  });

  // 初期表示時に問題を生成
  _generateName2SigQuestion();
}
