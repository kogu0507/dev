// sample1-app.js (ミニアプリのモジュールファイル)

// initializeApp関数をエクスポートする
export function initializeApp(containerElement) {
    // このアプリに固有のCSSを動的にロード
    const cssPath = './sample1-app.css'; // またはCDNのURL
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);
    console.log('sample1-app.css がアプリ内で動的に読み込まれました。');

    // アプリのUIをコンテナ要素内に描画
    containerElement.innerHTML = `
        <h3>サンプル1アプリ</h3>
        <p>これは動的にロードされたミニアプリです！</p>
        <button class="close-button">アプリを閉じる</button>
    `;

    const closeButton = containerElement.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            containerElement.innerHTML = ''; // アプリの内容をクリア
            // 必要であればCSSも削除
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            // 起動ボタンを再表示するなど
            const activateButton = containerElement.closest('.mini-app-wrapper')?.querySelector('.activate-button');
            if (activateButton) {
                activateButton.style.display = 'block';
            }
        });
    }

    // 必要であれば、このアプリ固有の他のJSモジュールをimport()することも可能
    // const specificUtil = await import('./app-specific-util.js');
    // specificUtil.doSomething();
}