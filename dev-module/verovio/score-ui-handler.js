// module/verovio/score-ui-handler.js

/**
 * ScoreUIHandler は DOM 操作を通じて
 * Verovio で生成した SVG をページに表示し、
 * ローディングやエラー表示を管理します。
 */
export class ScoreUIHandler {
  /**
   * 指定 ID の要素を取得し、存在を検証します。
   * @private
   * @param {string} elementId - 対象要素の ID
   * @returns {HTMLElement}
   * @throws {Error} 要素が見つからない場合
   */
  #getTargetElement(elementId) {
    const el = document.getElementById(elementId);
    if (!el) {
      throw new Error(`要素が見つかりません (ID: ${elementId})`);
    }
    return el;
  }

  /**
   * ローディングインジケータを表示します。
   * @param {string} elementId - 対象要素の ID
   */
  showLoading(elementId) {
    try {
      const el = this.#getTargetElement(elementId);
      // 既存コンテンツを置き換えてローディング表示
      el.innerHTML = `<div class="verovio-loading" style="text-align:center; padding:1em;">
        楽譜を読み込み中...
      </div>`;
    } catch (error) {
      console.warn(`showLoading エラー: ${error.message}`);
    }
  }

  /**
   * ローディングインジケータを非表示にします。
   * @param {string} elementId - 対象要素の ID
   */
  hideLoading(elementId) {
    try {
      const el = this.#getTargetElement(elementId);
      // loading クラスを持つ要素を削除
      const loader = el.querySelector('.verovio-loading');
      if (loader) loader.remove();
    } catch (error) {
      console.warn(`hideLoading エラー: ${error.message}`);
    }
  }

  /**
   * SVG を挿入して表示します。
   * @param {string} svgString - SVG の文字列
   * @param {string} elementId - 対象要素の ID
   */
  displaySvg(svgString, elementId) {
    try {
      const el = this.#getTargetElement(elementId);
      el.innerHTML = svgString;
      this.hideLoading(elementId);
    } catch (error) {
      console.error(`displaySvg エラー: ${error.message}`);
      this.showError('楽譜の表示に失敗しました。', elementId);
    }
  }

  /**
   * エラーメッセージを表示します。
   * @param {string} message - 表示するメッセージ
   * @param {string} elementId - 対象要素の ID
   */
  showError(message, elementId) {
    try {
      const el = this.#getTargetElement(elementId);
      el.innerHTML = `<div class="verovio-error" style="color:#c00; padding:1em; border:1px solid #c00; background:#fee;">
        ${message}
      </div>`;
      this.hideLoading(elementId);
    } catch (error) {
      console.error(`showError エラー: ${error.message}`);
      alert(message);
    }
  }
}
