// module/components/selection-component/script.js

//<script type="module" src="module/components/selection-component/script.js"></script> // jsDelivrを使えば？


const template = document.createElement('template');
template.innerHTML = `
<div class="selection-component-container">
  <div class="selection-header">
    <h3 class="selection-title">
      <slot name="title">お好みのオプションを選択</slot>
    </h3>
    <button class="view-all-button">
      <slot name="view-all">一覧で見る</slot>
    </button>
  </div>
  <div class="selection-cards-wrapper">
    <div class="selection-cards"></div>
  </div>
</div>
<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title">
        <slot name="modal-title">全オプション一覧</slot>
      </h3>
      <button class="modal-close-button">×</button>
    </div>
    <div class="modal-grid"></div>
    <div style="text-align:right; margin-top:20px">
      <button class="modal-close-button">閉じる</button>
    </div>
  </div>
</div>
`;

class SelectionComponent extends HTMLElement {
  constructor(mode) {
    super();
    this.mode = mode;
    this._uid = Math.random().toString(36).substr(2, 9);
    this.attachShadow({ mode: 'open' });

    // 外部 CSS を読み込む
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./style.css', import.meta.url).href;
    this.shadowRoot.appendChild(link);

    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._cards = this.shadowRoot.querySelector('.selection-cards');
    this._modal = this.shadowRoot.querySelector('.modal-overlay');
    this._modalGrid = this.shadowRoot.querySelector('.modal-grid');
    this._openBtn = this.shadowRoot.querySelector('.view-all-button');
    this._closeBtns = this.shadowRoot.querySelectorAll('.modal-close-button');
    this._initEvents();
  }

  connectedCallback() {
    this._renderOptions();
  }

  _initEvents() {
    this._openBtn.addEventListener('click', () => this._modal.classList.add('open'));
    this._closeBtns.forEach(b => b.addEventListener('click', () => this._modal.classList.remove('open')));
    this._modal.addEventListener('click', e => {
      if (e.target === this._modal) this._modal.classList.remove('open');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this._modal.classList.remove('open');
    });
  }

  _renderOptions() {
    this._cards.innerHTML = '';
    this._modalGrid.innerHTML = '';
    const mainName = `sel-${this._uid}`, modName = `selMod-${this._uid}`;

    this.querySelectorAll('[slot="option"]').forEach((o, i) => {
      const val = o.getAttribute('value') || i;
      const txt = o.textContent.trim();
      const desc = o.getAttribute('description') || '';
      const chk = o.hasAttribute('checked');
      const id1 = `i-${this.mode}-${val}-${this._uid}`;
      const id2 = `m-${id1}`;

      // メイン側 input + label
      const ip1 = document.createElement('input');
      ip1.type = this.mode;
      ip1.id = id1;
      ip1.name = mainName;
      ip1.value = val;
      if (chk) ip1.checked = true;
      ip1.classList.add('selection-card-input');

      const lb1 = document.createElement('label');
      lb1.htmlFor = id1;
      lb1.classList.add('selection-card');
      lb1.innerHTML = `<div class="card-content"><span>${txt}</span>${desc ? `<p>${desc}</p>` : ''}</div>`;

      // モーダル側 input + label
      const ip2 = ip1.cloneNode();
      ip2.id = id2;
      ip2.name = modName;

      const lb2 = lb1.cloneNode(true);
      lb2.htmlFor = id2;

      this._cards.append(ip1, lb1);
      this._modalGrid.append(ip2, lb2);
    });

    this._sync();
  }

  _sync() {
    const ms = [...this._cards.querySelectorAll('input')];
    const md = [...this._modalGrid.querySelectorAll('input')];

    ms.forEach((m, i) => m.onchange = () => {
      if (this.mode === 'radio') {
        ms.forEach((x, j) => md[j].checked = x.checked);
      } else {
        md[i].checked = m.checked;
      }
    });

    md.forEach((m, i) => m.onchange = () => {
      if (this.mode === 'radio') {
        md.forEach((x, j) => ms[j].checked = x.checked);
      } else {
        ms[i].checked = m.checked;
      }
    });
  }
}

customElements.define('radio-component',
  class extends SelectionComponent { constructor() { super('radio'); } }
);

customElements.define('checkbox-component',
  class extends SelectionComponent { constructor() { super('checkbox'); } }
);
