// module/verovio/transposer.js

/**
 * Transposer は MEI データを指定した半音数だけ移調し、
 * 移調済みの MEI 文字列を返します。
 */
export class Transposer {
  /** @private */
  #toolkit;

  /**
   * @param {verovio.Toolkit} toolkit - 初期化済みの Verovio Toolkit インスタンス
   */
  constructor(toolkit) {
    if (!toolkit) {
      throw new Error('Verovio Toolkit インスタンスが必要です。');
    }
    this.#toolkit = toolkit;
  }

  /**
   * 渡された MEI 文字列を半音単位で移調します。
   * @param {string} meiData - 元の MEI XML 文字列
   * @param {number} semitones - 移調量（半音数、正負整数）
   * @returns {Promise<string>} 移調後の MEI XML 文字列
   */
  async transposeMei(meiData, semitones) {
    // MEI データを読み込み
    this.#toolkit.loadData(meiData);
    // setOptions で移調量を設定
    this.#toolkit.setOptions({ transpose: String(semitones) });
    // getMEI を呼び出して移調済みの MEI を取得
    if (typeof this.#toolkit.getMEI === 'function') {
      return this.#toolkit.getMEI();
    } else {
      throw new Error('Toolkit に getMEI 関数が存在しません。移調後の MEI を取得できません。');
    }
  }
}
