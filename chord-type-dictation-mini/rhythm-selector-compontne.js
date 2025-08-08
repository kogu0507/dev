// rhythm-selector-component.js
class RhythmSelectorComponent extends HTMLElement {
    constructor() { super(); }
    connectedCallback() { this.render(); this.addEventListeners(); }
    static get observedAttributes() { return ['data-urls-id', 'data-input-type', 'data-rhythm-selectortype', 'data-show-name']; }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) { this.render(); this.addEventListeners(); }
    }

    render() {
        const urlsId = this.dataset.urlsId;
        const inputType = this.dataset.inputType;
        const selectorType = this.dataset.rhythmSelectortype || 'default';
        const showName = this.dataset.showName !== 'false'; // 'false'以外の値はtrueと解釈


        const jsonScriptTag = document.getElementById(urlsId);

        if (!jsonScriptTag || jsonScriptTag.type !== 'application/json') {
            console.error(`エラー: IDが"${urlsId}"のJSONスクリプトタグが見つからないか、タイプが不正です。`, this);
            this.innerHTML = `<p style="color: red;">データロードエラー: ${urlsId} が見つかりません。</p>`;
            return;
        }

        try {
            const rhythmData = JSON.parse(jsonScriptTag.textContent);

            if (!rhythmData.rhythms || !Array.isArray(rhythmData.rhythms)) {
                console.error(`エラー: JSONデータに'rhythms'配列が見つからないか、形式が不正です。`, this, rhythmData);
                this.innerHTML = `<p style="color: red;">データ形式エラー: 'rhythms'配列がありません。</p>`;
                return;
            }

            let htmlContent = '';
            rhythmData.rhythms.forEach(rhythm => {
                // inputのname属性には selectorType を含めて、各セレクター内でラジオボタンが独立して機能するようにする
                const uniqueId = `rhythm-${selectorType}-${rhythm.id}`;
                const inputName = `rhythm-selection-${selectorType}`;

                htmlContent += `
                       <div class="rhythm-item">
                <input type="${inputType}" id="${uniqueId}" name="${inputName}" value="${rhythm.id}" data-rhythm-name="${rhythm.name}">
                <label for="${uniqueId}">
                    <img src="${rhythm.imageUrl}" alt="${rhythm.name}" class="rhythm-image-thumb">
                    ${showName ? `<span class="rhythm-name">${rhythm.name}</span>` : ''} </label>
            </div>
        `;



            });

            this.innerHTML = `
                    <style>
                        .rhythm-selector-component-container {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 15px;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            background-color: #f9f9f9;
                        }

                        .rhythm-item {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            cursor: pointer;
                            padding: 8px;
                            border: 1px solid #eee;
                            border-radius: 5px;
                            background-color: #fff;
                            transition: all 0.2s ease-in-out;
                            box-shadow: 1px 1px 3px rgba(0,0,0,0.05);
                        }

                        .rhythm-item:hover {
                            background-color: #e0e0e0;
                        }

                        .rhythm-item input[type="radio"],
                        .rhythm-item input[type="checkbox"] {
                            display: none;
                        }

                        .rhythm-item input[type="radio"]:checked + label,
                        .rhythm-item input[type="checkbox"]:checked + label {
                            border: 2px solid #007bff;
                            background-color: #e6f7ff;
                        }

                        .rhythm-item label {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            cursor: pointer;
                            padding: 5px;
                            border-radius: 3px;
                            border: 2px solid transparent;
                            height: 100%;
                            box-sizing: border-box;
                        }

                        .rhythm-image-thumb {
                            width: 60px;
                            height: auto;
                            margin-bottom: 5px;
                        }

                        .rhythm-name {
                            font-size: 0.9em;
                            color: #333;
                            text-align: center;
                            white-space: nowrap;
                        }
                    </style>
                    <div class="rhythm-selector-component-container"> ${htmlContent}
                    </div>
                `;
        } catch (e) {
            console.error('JSONデータのパースエラー:', e, this);
            this.innerHTML = `<p style="color: red;">JSONパースエラー: ${e.message}</p>`;
        }
    }

    addEventListeners() {
        this.addEventListener('change', (event) => {
            const inputType = this.dataset.inputType;
            const selectorType = this.dataset.rhythmSelectortype || 'default';
            const inputName = `rhythm-selection-${selectorType}`;

            const selectedRhythms = this.getSelectedRhythms(inputType, inputName);
            const customEvent = new CustomEvent('rhythmSelectChange', {
                detail: {
                    componentType: selectorType,
                    selectedRhythms: selectedRhythms
                }
            });
            this.dispatchEvent(customEvent);
        });
    }

    getSelectedRhythms(inputType, inputName) {
        const selected = [];
        const inputs = this.querySelectorAll(`input[name="${inputName}"]:checked`);

        inputs.forEach(input => {
            selected.push({
                id: input.value,
                name: input.dataset.rhythmName
            });
        });
        return selected;
    }
}