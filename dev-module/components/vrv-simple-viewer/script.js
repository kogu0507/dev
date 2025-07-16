// script.js
// ESM モジュールとして読み込まれるので import を使用します。
import { VerovioManager } from 'https://cdn.jsdelivr.net/gh/kogu0507/module@v2.4.3/verovio/verovio-manager.min.js';

// scoreDef のプリセット定義
const scoreDefPresets = {
    treble: `<staffGrp><staffDef n='1' lines='5' clef.shape='G' clef.line='2'/></staffGrp>`,
    bass: `<staffGrp><staffDef n='1' lines='5' clef.shape='F' clef.line='4'/></staffGrp>`,
    grand: `<staffGrp>
             <staffDef n='1' lines='5' clef.shape='G' clef.line='2'/>
             <staffDef n='2' lines='5' clef.shape='F' clef.line='4'/>
           </staffGrp>`,
    alto: `<staffGrp><staffDef n='1' lines='5' clef.shape='C' clef.line='3'/></staffGrp>`,
    tenor: `<staffGrp><staffDef n='1' lines='5' clef.shape='C' clef.line='4'/></staffGrp>`,
};

const defaultOptions = {

    adjustPageHeight: true,
    adjustPageWidth: true,
    breaks: 'encoded',
    spacingStaff: 5,
    spacingSystem: 15,
    footer: 'none',

    svgViewBox: true,
    pageMarginTop: 0,
    pageMarginRight: 0,
    pageMarginBottom: 0,
    pageMarginLeft: 0

};

(async () => {
    // VerovioManager を初期化
    const mgr = new VerovioManager();
    await mgr.initialize();

    // ページ上のすべての .vrv-simple-viewer 要素を取得
    const viewers = document.querySelectorAll('.vrv-simple-viewer');

    viewers.forEach(async (el, idx) => {
        // 要素に一意な ID を付与
        if (!el.id) el.id = `vrv-viewer-${idx}`;

        // 1. content セクションを先に取得しておく
        const contentScripts = Array.from(
            el.querySelectorAll('script[type="application/mei+xml"][data-mei-section="content"]')
        );
        // console.log(`contentScripts.length = ${contentScripts.length}`);

        // 2. ローディング表示を append する（innerHTML は上書きしない）
        const loading = document.createElement('div');
        loading.className = 'vrv-loading';
        loading.textContent = 'Loading score...';
        el.appendChild(loading);

        try {
            // メタ情報を data- 属性から取得
            const key = el.dataset.keySignature || '0';
            const meter = el.dataset.meter
                ? el.dataset.meter
                : `count='${el.dataset.meterCount || 4}' unit='${el.dataset.meterUnit || 4}'`;
            const presets = (el.dataset.scoreDefPreset || '')
                .split(',').map(s => s.trim()).filter(Boolean);
            const scoreDefSection = presets
                .map(name => scoreDefPresets[name] || '')
                .join('');
            const tempoTag = el.dataset.tempo
                ? `<tempo midi.bpm='${el.dataset.tempo}'/>`
                : '';

            // MEI XML 全体を文字列で組み立て
            const header =
                `<mei xmlns=\"http://www.music-encoding.org/ns/mei\" meiversion=\"5.1\">\n` +
                `  <meiHead><musicMeta>` +
                `<keySig sig=\"${key}\"/><timeSig ${meter}/>${tempoTag}` +
                `</musicMeta></meiHead>\n` +
                `<music><body><mdiv><score>\n`;
            const scoreDefOpen = `<scoreDef keysig=\"${key}\" ${meter}>`;
            const scoreDefClose = `</scoreDef>`;
            const sectionOpen = `<section>`;
            const sectionClose = `</section>`;
            const footer = `</score></mdiv></body></music></mei>`;

            // contentScripts から MEI 本文を結合
            let content = '';
            contentScripts.forEach(s => {
                content += s.textContent.trim() + '\n';
            });

            // 完成した MEI 文字列
            const meiString = header
                + scoreDefOpen + scoreDefSection + scoreDefClose + '\n'
                + sectionOpen + '\n'
                + content + sectionClose
                + footer;

            // 3. Blob URL ワークアラウンドでレンダリング
            const blob = new Blob([meiString], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            mgr.setRenderOptions(defaultOptions);
            await mgr.displaySvgFromUrl(url, el.id);

            console.log(meiString);


            // 4. ローディング表示を消し、URL を破棄
            loading.remove();
            URL.revokeObjectURL(url);

        } catch (err) {
            // エラー時はローディングを消してからエラーメッセージ
            loading.remove();
            el.innerHTML = `<div class=\"vrv-error\">Error: ${err.message}</div>`;
            console.error(err);
        }
    });
})();