// script.js (メインのローダー)
import { loadCssFile, loadScriptFile } from './resourceLoader.js'; // loadScriptFileは必要ないかも

document.addEventListener('DOMContentLoaded', () => {
    const appContainers = document.querySelectorAll('.mini-app-wrapper');

    appContainers.forEach(container => {
        const activateButton = container.querySelector('.activate-button');
        const appMain = container.querySelector('.app-main');

        if (activateButton && appMain) {
            activateButton.addEventListener('click', async () => {
                activateButton.style.display = 'none';

                const appId = appMain.dataset.appId;
                const appUrl = appMain.dataset.appUrl; // JSファイルだけあればOK

                if (appUrl) {
                    try {
                        // アプリのJSファイルだけを動的にインポート（アプリファイルないでCSSをロード）
                        const appModule = await import(appUrl);

                        if (appModule && typeof appModule.initializeApp === 'function') {
                            appModule.initializeApp(appMain);
                        } else {
                            console.error(`アプリID: ${appId} - initializeApp関数が見つからないか、エクスポートされていません。`);
                        }
                    } catch (error) {
                        console.error(`アプリID: ${appId} - アプリの読み込み中にエラーが発生しました:`, error);
                        appMain.innerHTML = '<p style="color: red;">アプリの読み込みに失敗しました。</p>';
                    }
                }
            });
        } else {
            console.error('必要な要素が見つかりません (activate-button または app-main)。コンテナ:', container);
        }
    });
});