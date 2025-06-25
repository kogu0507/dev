// resourceLoader.js

/**
 * 指定されたCSSファイルを動的にHTMLに読み込みます。
 *
 * @param {string} url - 読み込むCSSファイルのURL
 * @returns {Promise<Event>} - CSSファイルの読み込みが完了したときに解決されるPromiseオブジェクト
 */
export function loadCssFile(url) {
    return new Promise((resolve, reject) => {
        // 同じURLのCSSが既に存在するかチェック（重複読み込み防止）
        if (document.querySelector(`link[href="${url}"]`)) {
            console.warn(`CSSファイル '${url}' は既に読み込まれています。`);
            resolve(new Event('alreadyloaded')); // 既に読み込まれている場合は解決して終了
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;

        link.onload = (event) => {
            console.log(`CSSファイル '${url}' が動的に読み込まれました。`);
            resolve(event);
        };

        link.onerror = (error) => {
            console.error(`CSSファイル '${url}' の読み込みに失敗しました。`, error);
            reject(new Error(`Failed to load CSS: ${url}`));
        };

        document.head.appendChild(link);
    });
}

/**
 * 指定されたJavaScriptファイルを動的にHTMLに読み込みます。
 *
 * @param {string} url - 読み込むJavaScriptファイルのURL
 * @param {object} [options] - 読み込みオプション
 * @param {boolean} [options.async=true] - スクリプトを非同期で読み込むか (デフォルト: true)。deferがtrueの場合、asyncは無視されます。
 * @param {boolean} [options.defer=false] - スクリプトをHTMLパース後に遅延実行するか (デフォルト: false)。asyncより優先されます。
 * @param {boolean} [options.isModule=false] - スクリプトをESモジュールとして読み込むか (type="module") (デフォルト: false)。
 * @returns {Promise<Event>} - JavaScriptファイルの読み込みが完了したときに解決されるPromiseオブジェクト
 */
export function loadScriptFile(url, options = {}) {
    return new Promise((resolve, reject) => {
        // 同じURLのスクリプトが既に存在するかチェック（重複読み込み防止）
        // ただし、モジュールか通常スクリプトかでtype属性が異なるため、両方チェック
        if (document.querySelector(`script[src="${url}"]`) || document.querySelector(`script[src="${url}"][type="module"]`)) {
            console.warn(`JavaScriptファイル '${url}' は既に読み込まれています。`);
            resolve(new Event('alreadyloaded')); // 既に読み込まれている場合は解決して終了
            return;
        }

        const script = document.createElement('script');
        script.src = url;

        // デフォルトオプションと渡されたオプションをマージ
        const defaultOptions = {
            async: true,
            defer: false,
            isModule: false
        };
        const mergedOptions = { ...defaultOptions, ...options };

        if (mergedOptions.isModule) {
            script.type = 'module';
            // モジュールの場合はasyncとdeferのデフォルト挙動が異なるため、明示的に指定しない限り設定しない
            // ブラウザのデフォルト挙動に任せるか、必要ならここでasync/deferを設定する
            if (mergedOptions.async) {
                script.async = true;
            }
            if (mergedOptions.defer) {
                // type="module"とdeferの組み合わせは通常冗長ですが、明示的に設定する
                script.defer = true;
            }
        } else {
            // 通常のスクリプトの場合
            if (mergedOptions.defer) {
                script.defer = true;
                // deferが指定された場合、asyncは無視されるため設定しない
            } else if (mergedOptions.async) {
                script.async = true;
            }
        }

        script.onload = (event) => {
            console.log(`JavaScriptファイル '${url}' が動的に読み込まれました。`);
            resolve(event);
        };

        script.onerror = (error) => {
            console.error(`JavaScriptファイル '${url}' の読み込みに失敗しました。`, error);
            reject(new Error(`Failed to load script: ${url}`));
        };

        document.head.appendChild(script);
    });
}

/*

.
├── index.html
├── resourceLoader.js
├── styles/
│   └── main.css
└── scripts/
    ├── app.js
    └── utility.js
    └── my-module.js



<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>動的リソースローダーの例</title>
    </head>
<body>
    <h1>動的なCSSとJavaScriptの読み込み</h1>
    <p>このページでは、JavaScriptを使ってCSSファイルとJavaScriptファイルを動的に読み込みます。</p>
    <button id="loadCssButton">CSSを読み込む</button>
    <button id="loadJsButton">JSを読み込む</button>
    <button id="loadModuleButton">モジュールJSを読み込む</button>

    <div id="dynamicContent" style="margin-top: 20px; padding: 10px; border: 1px dashed #ccc;">
        ここに動的なコンテンツが表示されます。
    </div>

    <script type="module">
        // resourceLoader.js から必要な関数をインポート
        import { loadCssFile, loadScriptFile } from './resourceLoader.js';

        document.getElementById('loadCssButton').addEventListener('click', () => {
            loadCssFile('./styles/main.css')
                .then(() => {
                    console.log('main.css の読み込みと適用が完了しました！');
                    document.getElementById('dynamicContent').textContent = 'CSSが適用されました！背景が緑になったはずです。';
                })
                .catch(error => {
                    console.error('CSS読み込みエラー:', error);
                    document.getElementById('dynamicContent').textContent = `CSS読み込みエラー: ${error.message}`;
                });
        });

        document.getElementById('loadJsButton').addEventListener('click', () => {
            // 通常のスクリプト (async: trueがデフォルト)
            loadScriptFile('./scripts/app.js')
                .then(() => {
                    console.log('app.js の実行が完了しました！');
                    document.getElementById('dynamicContent').textContent = 'app.js が実行されました！コンソールを確認してください。';
                    // app.jsで定義されたグローバル関数があればここで呼び出す
                    if (typeof sayHelloFromApp === 'function') {
                        sayHelloFromApp();
                    }
                })
                .catch(error => {
                    console.error('JS読み込みエラー:', error);
                    document.getElementById('dynamicContent').textContent = `JS読み込みエラー: ${error.message}`;
                });
        });

        document.getElementById('loadModuleButton').addEventListener('click', () => {
            // ESモジュール (type="module")
            loadScriptFile('./scripts/my-module.js', { isModule: true })
                .then(() => {
                    console.log('my-module.js の実行が完了しました！');
                    document.getElementById('dynamicContent').textContent = 'my-module.js が実行されました！コンソールを確認してください。';
                    // モジュールの場合は、エクスポートされた関数を直接呼び出すことはできないため、
                    // モジュール内でグローバルなサイドエフェクト（例：DOM操作）を行うか、
                    // 別途インポートして使用する必要があります。
                    // ここでは、my-module.js内で何かコンソールに出力されることを期待します。
                })
                .catch(error => {
                    console.error('モジュールJS読み込みエラー:', error);
                    document.getElementById('dynamicContent').textContent = `モジュールJS読み込みエラー: ${error.message}`;
                });
        });

        // ページロード時に自動的にCSSを読み込む例
        // loadCssFile('./styles/main.css');
    </script>

    </body>
</html>




*/