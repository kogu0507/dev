// module/verovio/core-processor.js

// Verovio ローダーからインポートします
import { loadVerovio } from './loader.min.js';

/**
 * CoreProcessor は VerovioToolkit を使い、
 * MEI → SVG/MIDI の変換ロジックを提供します。
 */
export class CoreProcessor {
  /** @private @type {verovio.Toolkit} */
  #toolkit;
  /** @private @type {object} */
  #renderOptions = {};
  /** @private @type {string|null} */
  #meiData = null;

  /**
   * @param {verovio.Toolkit} toolkit - 初期化済み Verovio Toolkit インスタンス
   * @throws {Error} toolkit が渡されない場合
   */
  constructor(toolkit) {
    if (!toolkit) {
      throw new Error('Verovio Toolkit インスタンスが必要です。');
    }
    this.#toolkit = toolkit;
    // 初期オプションを適用
    this.#toolkit.setOptions(this.#renderOptions);
  }

  /**
   * @private
   * URL から MEI を取得して文字列で返します。
   * @param {string} url
   * @returns {Promise<string>}
   * @throws {Error} ネットワークエラー時
   */
  static async #fetchMei(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`MEI の取得に失敗: ${res.status} ${res.statusText}`);
    }
    return res.text();
  }

  /**
   * レンダリングオプションをマージして適用します。
   * @param {object} options - Verovio の setOptions に渡す設定オブジェクト
   */
  setRenderOptions(options) {
    this.#renderOptions = { ...this.#renderOptions, ...options };
    this.#toolkit.setOptions(this.#renderOptions);
  }

  /**
   * 現在ロードされている MEI データを返します。
   * @returns {string|null}
   */
  getCurrentMeiData() {
    return this.#meiData;
  }

  /**
   * @private
   * 指定した小節範囲を適用し、レイアウトを再計算します。
   * @param {string} range - 小節範囲 (例: "1-5" または "start-end")
   */
  async #applyMeasureRange(range) {
    this.#toolkit.select({ measureRange: range });
    // レイアウト再計算完了まで待機
    await this.#toolkit.redoLayout();
  }

  /**
   * MEI 文字列から SVG を生成します。
   * @param {string} mei - MEI XML 文字列
   * @param {object} [options]
   * @param {number} [options.page=1] - 取得ページ番号
   * @param {string} [options.measureRange='start-end'] - 小節範囲
   * @returns {Promise<string>} SVG 文字列
   * @throws {Error} MEI 未ロード時
   */
  async renderSvgFromMei(mei, { page = 1, measureRange = 'start-end' } = {}) {
    // MEI データを保存しロード
    this.#meiData = mei;
    this.#toolkit.loadData(mei);
    // 小節範囲を適用
    await this.#applyMeasureRange(measureRange);
    // SVG を返す
    return this.#toolkit.renderToSVG(page);
  }

  /**
   * URL から MEI をフェッチして SVG を生成します。
   * @param {string} url
   * @param {object} [options]
   * @returns {Promise<string>} SVG 文字列
   */
  async renderSvgFromUrl(url, options) {
    const mei = await CoreProcessor.#fetchMei(url);
    return this.renderSvgFromMei(mei, options);
  }

  /**
   * 現在ロード中の MEI から再レンダリングします。
   * 主に小節範囲変更後の更新用。
   * @param {object} [options]
   * @param {number} [options.page=1]
   * @param {string} [options.measureRange='start-end']
   * @returns {Promise<string>} SVG 文字列
   * @throws {Error} MEI 未ロード時
   */
  async renderCurrentSvg({ page = 1, measureRange = 'start-end' } = {}) {
    if (!this.#meiData) {
      throw new Error('MEI データがロードされていません。');
    }
    await this.#applyMeasureRange(measureRange);
    return this.#toolkit.renderToSVG(page);
  }

  /**
   * @private
   * Base64 文字列を ArrayBuffer に変換します。
   * @param {string} base64
   * @returns {ArrayBuffer}
   */
  static #decodeMidiBase64(base64) {
    const bin = atob(base64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * MEI 文字列から MIDI バイナリを生成します。
   * @param {string} mei - MEI XML 文字列
   * @returns {ArrayBuffer} MIDI データ
   */
  renderMidiFromMei(mei) {
    this.#meiData = mei;
    this.#toolkit.loadData(mei);
    const base64 = this.#toolkit.renderToMIDI();
    return CoreProcessor.#decodeMidiBase64(base64);
  }

  /**
   * URL から MEI を取得し MIDI バイナリを生成します。
   * @param {string} url
   * @returns {Promise<ArrayBuffer>} MIDI データ
   */
  async renderMidiFromUrl(url) {
    const mei = await CoreProcessor.#fetchMei(url);
    return this.renderMidiFromMei(mei);
  }

  /**
   * 現在ロード中の MEI から MIDI を再生成します。
   * @returns {ArrayBuffer}
   * @throws {Error} MEI 未ロード時
   */
  renderCurrentMidi() {
    if (!this.#meiData) {
      throw new Error('MEI データがロードされていません。');
    }
    const base64 = this.#toolkit.renderToMIDI();
    return CoreProcessor.#decodeMidiBase64(base64);
  }

  /**
   * 現在ロード中の総ページ数を返します。
   * @returns {number}
   */
  getPageCount() {
    return this.#toolkit.getPageCount();
  }
}
