
export let phrases;

class LanguageModal extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {

        this.innerHTML =
            `
            <dialog class="language-menu">
                <div data-lang="en">English</div>
                <div data-lang="ja">日本語</div>
                <div data-lang="ko">한국인</div>
            </dialog>`;

        const languageMenu = document.querySelector('.language-menu');
        document.querySelectorAll('.language-button').forEach((e) => {
            e.addEventListener('click', (event) => {
                languageMenu.showModal();
            });
        });

        for (let e of languageMenu.children) {
            e.addEventListener("click", () => {
                this.loadLanguage(e.dataset.lang);
                languageMenu.close();
            })
        }
        this.loadLanguage(navigator.language.split("-")[0]);
    }

    async loadLanguage(lang) {

        if(!["en","ja","ko"].includes(lang)){
            lang = "en";
        }
        const response = await fetch(`assets/locales/${lang}.json`);
        phrases = await response.json();

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;

            if (el.hasAttribute("placeholder")) {
                el.placeholder = phrases[key] || key;
            }
            else {
                el.textContent = phrases[key] || key;
            }
        });
    }
}

customElements.define('language-modal', LanguageModal);