// language-switcher.js

/**
 * ウェブページ上の言語切り替え機能を初期化します。
 * 翻訳したい要素には、`data-jp`, `data-en`, `data-de` などのデータ属性で
 * 各言語のテキストを持たせる必要があります。
 * 言語セレクターはIDが 'language-selector' である必要があります。
 */
export function initializeLanguageSwitcher() {
    // IDが 'language-selector' のHTML要素（ドロップダウンメニュー）を取得します。
    const languageSelector = document.getElementById('language-selector');

    // languageSelector が存在しない場合は、エラーをコンソールに出力し処理を終了
    if (!languageSelector) {
        console.error("エラー: ID 'language-selector' を持つ要素が見つかりません。言語セレクターがHTMLに存在することを確認してください。");
        return;
    }

    // 'data-jp'、'data-en'、または 'data-de' のいずれかの属性を持つすべてのHTML要素を選択します。
    // これにより、翻訳したいすべての要素が効率的に収集されます。
    const translatableElements = document.querySelectorAll('[data-jp], [data-en], [data-de]');

    /**
     * 指定された言語に基づいてページ上のテキストを更新する関数。
     * @param {string} lang - 表示する言語コード（例: "jp", "en", "de"）。
     */
    function setLanguage(lang) {
        // 翻訳可能な各要素に対してループ処理を行います。
        translatableElements.forEach(element => {
            // 要素が選択された言語のデータ属性を持っているか確認します。
            // 例: langが"en"の場合、element.hasAttribute('data-en') をチェックします。
            if (element.hasAttribute(`data-${lang}`)) {
                // 要素のテキストコンテンツを、対応するデータ属性の値で更新します。
                element.textContent = element.getAttribute(`data-${lang}`);
            } else {
                // オプション: 要素が選択された言語のデータ属性を持っていない場合、警告をコンソールに出力します。
                // これは、翻訳が不足している箇所をデバッグするのに役立ちます。
                console.warn(`要素に data-${lang} 属性がありません:`, element);
            }
        });
    }

    // ページがロードされたときに、ドロップダウンの初期選択に基づいて言語を設定します。
    setLanguage(languageSelector.value);

    // 言語セレクター（ドロップダウン）の選択が変更されたときにイベントをリッスンします。
    languageSelector.addEventListener('change', (event) => {
        // 選択された新しい言語の値を 'selectedLanguage' に格納します。
        const selectedLanguage = event.target.value;
        // 新しい言語でページ上のテキストを更新するために 'setLanguage' 関数を呼び出します。
        setLanguage(selectedLanguage);
    });
}