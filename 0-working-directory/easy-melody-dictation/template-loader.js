// template-loader.js
document.addEventListener('DOMContentLoaded', () => {
    // data-template-id 属性を持つすべての要素を取得
    const sectionsToPopulate = document.querySelectorAll('[data-template-id]');

    sectionsToPopulate.forEach(section => {
        const templateId = section.dataset.templateId; // data-template-idの値を取得

        // テンプレート要素を取得
        const template = document.getElementById(templateId);

        if (template) {
            // テンプレートの内容をクローン
            const clonedContent = template.content.cloneNode(true);

            // 既存のコンテンツをクリアして、クローンした内容を挿入
            section.innerHTML = '';
            section.appendChild(clonedContent);
        } else {
            console.warn(`テンプレートID "${templateId}" が見つかりません。`);
        }
    });
    
    // 表示／非表示のタイミングを知らせる
    document.dispatchEvent(new CustomEvent('templatesLoaded'));
});