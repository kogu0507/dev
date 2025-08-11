// toggle-visibility.js
document.addEventListener('templatesLoaded', () => { // templatesLoaded イベントを待つ
    const toggleButtons = document.querySelectorAll('[data-toggle-target]');
    console.log("toggleButtons: ", toggleButtons); // ここでボタンが取得できるはず

    toggleButtons.forEach(button => {
        const toggleTextSpan = button.querySelector('[data-toggle-text="open"]');
        const targetClassName = button.dataset.toggleTarget;
        const targetElement = document.querySelector(`.${targetClassName}`);

        // 初期状態を設定
        if (targetElement) {
            targetElement.classList.add('is-hidden');
            if (toggleTextSpan) {
                toggleTextSpan.textContent = '開く';
            }
        }

        button.addEventListener('click', () => {
            if (targetElement) {
                targetElement.classList.toggle('is-hidden');
                if (toggleTextSpan) {
                    if (targetElement.classList.contains('is-hidden')) {
                        toggleTextSpan.textContent = '開く';
                    } else {
                        toggleTextSpan.textContent = '閉じる';
                    }
                }
            }
        });
    });
});