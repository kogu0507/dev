// dev-module/verovio/verovio-manager.js

import { loadVerovio } from './loader.js';
import { CoreProcessor } from './core-processor.js';
import { ScoreUIHandler } from './score-ui-handler.js';
import { Transposer } from './transposer.js';

/**
 * VerovioManager は VerovioToolkit のロードから
 * コア処理、UI 表示、移調までを統合した
 * 高レベル API を提供します。
 */
export class VerovioManager {
  /** @private */
  #toolkit = null;
  /** @private */
  #coreProcessor = null;
  /** @private */
  #scoreUIHandler = null;
  /** @private */
  #transposer = null;

  /**
   * インスタンスを作成します。
   * 実際のロードは initialize() で行います。
   */
  constructor() {}

  /**
   * Verovio と関連モジュールを初期化します。
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.#toolkit) {
      console.warn('既に初期化済みです。');
      return;
    }
    try {
      this.#toolkit = await loadVerovio();
      this.#coreProcessor = new CoreProcessor(this.#toolkit);
      this.#scoreUIHandler = new ScoreUIHandler();
      this.#transposer = new Transposer(this.#toolkit);
      console.log('VerovioManager の初期化が完了しました。');
    } catch (error) {
      console.error('初期化中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * レンダリングオプションを設定します。
   * @param {object} options - setOptions 引数
   */
  setRenderOptions(options) {
    this.#ensureInit();
    this.#coreProcessor.setRenderOptions(options);
  }

  /**
   * MEI ファイルを URL から読み込み、指定要素に SVG を表示します。
   * @param {string} meiUrl
   * @param {string} targetId
   */
  async displayMeiOnElement(meiUrl, targetId) {
    this.#ensureInit();
    this.#scoreUIHandler.showLoading(targetId);
    try {
      const svg = await this.#coreProcessor.renderSvgFromUrl(meiUrl);
      this.#scoreUIHandler.displaySvg(svg, targetId);
    } catch (error) {
      console.error('表示エラー:', error);
      this.#scoreUIHandler.showError('楽譜の表示に失敗しました。', targetId);
    }
  }

  /**
   * MEI を指定量移調し、SVG を指定要素に表示します。
   * @param {string} meiUrl
   * @param {string} targetId
   * @param {number} semitones
   */
  async displayTransposedMeiOnElement(meiUrl, targetId, semitones) {
    this.#ensureInit();
    this.#scoreUIHandler.showLoading(targetId);
    try {
      const res = await fetch(meiUrl);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const mei = await res.text();
      const transposed = await this.#transposer.transposeMei(mei, semitones);
      const svg = this.#coreProcessor.renderSvgFromMei(transposed);
      this.#scoreUIHandler.displaySvg(svg, targetId);
    } catch (error) {
      console.error('移調表示エラー:', error);
      this.#scoreUIHandler.showError('移調表示に失敗しました。', targetId);
    }
  }

  /**
   * MEI から MIDI データを取得します。
   * @param {string} meiUrl
   * @returns {Promise<ArrayBuffer>}
   */
  async getMidiFromMei(meiUrl) {
    this.#ensureInit();
    return this.#coreProcessor.renderMidiFromUrl(meiUrl);
  }

  /** @private */
  #ensureInit() {
    if (!this.#toolkit) {
      throw new Error('initialize() を先に呼び出してください。');
    }
  }
}