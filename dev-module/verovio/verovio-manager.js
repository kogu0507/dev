// module/verovio/verovio-manager.js

import { loadVerovio } from './loader.min.js';
import { CoreProcessor } from './core-processor.min.js';
import { ScoreUIHandler } from './score-ui-handler.min.js';
import { Transposer } from './transposer.min.js';

/**
 * VerovioManager は VerovioToolkit のロードから
 * コア処理、UI 表示、移調までを統合した
 * 高レベル API を提供します。
 */
export class VerovioManager {
  /** @private */
  #toolkit = null;
  /** @private */
  #core = null;
  /** @private */
  #ui = null;
  /** @private */
  #transposer = null;
  /** @private */
  _initPromise = null;

  /**
   * Verovio および関連モジュールを初期化します。
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initPromise) {
      return this._initPromise;
    }
    this._initPromise = (async () => {
      this.#toolkit = await loadVerovio();
      this.#core = new CoreProcessor(this.#toolkit);
      this.#ui = new ScoreUIHandler();
      this.#transposer = new Transposer(this.#toolkit);
      console.log('VerovioManager initialized');
    })();
    return this._initPromise;
  }

  /** @private */
  _ensureInit() {
    if (!this.#toolkit) {
      throw new Error('initialize() を先に呼び出してください。');
    }
  }

  /**
   * レンダリングオプションを設定します。
   * @param {import('./render-options.js').RenderOptions} options
   */
  setRenderOptions(options) {
    this._ensureInit();
    this.#core.setRenderOptions(options);
  }

  /**
   * URL から MEI を読み込み、SVG を描画します。
   * @param {string} meiUrl      - MEI ファイルの URL
   * @param {string} targetId    - 表示先要素の ID
   * @param {object} [options]
   * @param {number} [options.page=1]
   * @param {string} [options.measureRange='start-end']
   */
  async displaySvgFromUrl(meiUrl, targetId, { page = 1, measureRange = 'start-end' } = {}) {
    this._ensureInit();
    this.#ui.showLoading(targetId);
    try {
      const svg = await this.#core.renderSvgFromUrl(meiUrl, { page, measureRange });
      this.#ui.displaySvg(svg, targetId);
    } catch (error) {
      console.error('displaySvgFromUrl error:', error);
      this.#ui.showError('楽譜の表示に失敗しました。', targetId);
      throw error;
    }
  }

  /**
   * URL から MEI を読み込み、MIDI を取得します。
   * @param {string} meiUrl
   * @param {object} [options]
   * @param {string} [options.measureRange]
   * @returns {Promise<ArrayBuffer>}
   */
  async getMidiFromUrl(meiUrl, { measureRange } = {}) {
    this._ensureInit();
    if (measureRange) {
      return this._getMidiRange(meiUrl, measureRange);
    }
    return this.#core.renderMidiFromUrl(meiUrl);
  }

  /** @private */
  async _getMidiRange(meiUrl, measureRange) {
    // 範囲指定を適用しつつ MEI を読み込む
    await this.#core.renderSvgFromUrl(meiUrl, { page: 1, measureRange });
    return this.#core.renderCurrentMidi();
  }

  /**
   * URL から MEI を読み込み、指定半音で移調した SVG を描画します。
   * @param {string} meiUrl
   * @param {string} targetId
   * @param {number} semitones
   * @param {object} [options]
   * @param {number} [options.page=1]
   * @param {string} [options.measureRange='start-end']
   */
  async displayTransposedSvgFromUrl(
    meiUrl,
    targetId,
    semitones,
    { page = 1, measureRange = 'start-end' } = {}
  ) {
    this._ensureInit();
    this.#ui.showLoading(targetId);
    try {
      const res = await fetch(meiUrl);
      if (!res.ok) throw new Error(`MEI fetch failed: ${res.status}`);
      const mei = await res.text();
      const transposed = await this.#transposer.transposeMei(mei, semitones);
      const svg = await this.#core.renderSvgFromMei(transposed, { page, measureRange });
      this.#ui.displaySvg(svg, targetId);
    } catch (error) {
      console.error('displayTransposedSvgFromUrl error:', error);
      this.#ui.showError('移調表示に失敗しました。', targetId);
      throw error;
    }
  }
}
