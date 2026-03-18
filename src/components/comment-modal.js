class CommentModal extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {

        this.innerHTML = `
       <dialog class="comment-modal">
            <button class="close-button">&times</button>
            <div>
                <div data-i18n="send comment">Send a comment</div>
                <textarea matInput maxlength="10000" data-i18n="comment placeholder" placeholder></textarea>
                <button disabled class="send-comment-button" data-i18n="comment">Comment</button>
            </div>
        </dialog>`;

        let commentButton =  this.querySelector(".send-comment-button");
        let textArea =  this.querySelector("textarea");

        document.querySelectorAll(".comment-button").forEach((e) => {
            e.addEventListener("click", () => {
                document.querySelector(".comment-modal").showModal();
            });
        })

        commentButton.addEventListener("click", () => {
            Toastify({
                text: "Sent comment!",
                duration: 4000,
                style: {
                    background: "linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 100%)"
                },
                gravity: "bottom",
                position: "left",
                className: "toast",
            }).showToast();
            let msg = "PAD solver: " + textArea.value;
            textArea.value = "";
            fetch("https://script.google.com/macros/s/AKfycbzPXIT7QUAqrSfu8L_zR5Cmu7D-FlqDgSEyFYKYE__9KNN6cA50g53gIrnKHB67eNUM/exec",
                { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ feedback: msg }) }
            );
        });
        textArea.addEventListener("input", (e) => {
            commentButton.disabled = (e.target.value.trim().length == 0);
        });
    }
}

customElements.define('comment-modal', CommentModal);