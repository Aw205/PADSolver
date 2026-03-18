class SettingsModal extends HTMLElement {

    constructor() {
        super();

        this.settingsMap = new Map();
        this.liveSettings = null;
    }

    connectedCallback() {

        this.innerHTML = `
        <dialog class="settings-modal">
           <button class="close-button">&times</button>
           <div style="font: 2rem kreon; color: gray;" data-i18n="settings">Settings</div>
           <div style="display:flex; flex-direction: column; gap: 0.5rem; margin-left: 1rem; padding: 1rem;">

            <div class="segment-container" data-key="boardAnimations">
                <div data-i18n="board animations"></div>
                <div class="segmented-buttons">
                    <button class="segment" data-value="slow" data-i18n="slow"></button>
                    <button class="segment" data-value="medium" data-i18n="medium"></button>
                    <button class="segment" data-value="fast" data-i18n="fast"></button>
                </div>

           </div>
            <div class="segment-container" data-key="pathPlayback">
                <div data-i18n="path playback"></div>
                <div class="segmented-buttons">
                    <button class="segment" data-value="slow" data-i18n="slow"></button>
                    <button class="segment" data-value="medium" data-i18n="medium"></button>
                    <button class="segment" data-value="fast" data-i18n="fast"></button>
                </div>
           </div>

           </div>

           <div style="display:flex;justify-content: right;">
           <button class="save-button" data-i18n="save"></button>
           </div>
           
        </dialog>`;

        const modal = this.querySelector('dialog');
        const saveButton = this.querySelector(".save-button");
        document.querySelectorAll('.settings-button').forEach((e) => {
            e.addEventListener('click', (event) => {
                modal.showModal();
            });

        });


        saveButton.addEventListener("click", () => {

            localStorage.setItem("settings", JSON.stringify(this.liveSettings));
            Toastify({
                text: "Saved settings",
                duration: 4000,
                style: {
                    background: "linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 100%)"
                },
                gravity: "bottom",
                position: "left",
                className: "toast",
            }).showToast();

            modal.close();


        });

        modal.addEventListener("toggle", () => {
            if (modal.open) {
                modal.querySelectorAll(".active").forEach((e) => {
                    e.classList.remove("active");
                });
                this.liveSettings = JSON.parse(localStorage.getItem("settings"));
                for (const [key, value] of Object.entries(this.liveSettings)) {
                    this.settingsMap.get(key).get(value).classList.add("active");
                }
            }
        })

        this.querySelectorAll(".segment-container").forEach((e) => {

            let key = e.dataset.key;
            let buttonMap = new Map();
            e.querySelectorAll(".segment").forEach((button) => {

                buttonMap.set(button.dataset.value, button);

                button.addEventListener("click", () => {
                    e.querySelector(".active")?.classList.remove("active");
                    button.classList.add("active");

                    this.liveSettings[key] = button.dataset.value;

                });
            });
            this.settingsMap.set(key, buttonMap);
        });
    }
}

customElements.define('settings-modal', SettingsModal);