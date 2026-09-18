/* =========================================================
   SOS Doméstico — script principal
   1) Dados dos assuntos rápidos (chips) + textos enviados ao chat
   2) Alternância entre a capa e a tela do chat
   3) Envio automático da mensagem ao tocar em um chip
   ========================================================= */

const TOPICS = [
  { title: "Queimadura", prompt: "Uma pessoa se queimou, o que eu faço?" },
  { title: "Corte / sangramento", prompt: "Uma pessoa se cortou e está sangrando, o que eu faço?" },
  { title: "Queda", prompt: "Uma pessoa caiu, o que eu faço?" },
  { title: "Engasgo", prompt: "Uma pessoa engasgou, o que eu faço?" },
  { title: "Choque elétrico", prompt: "Uma pessoa levou um choque elétrico, o que eu faço?" },
  { title: "Intoxicação", prompt: "Uma pessoa se intoxicou, o que eu faço?" },
  { title: "Picada / mordida", prompt: "Uma pessoa foi picada ou mordida por um animal, o que eu faço?" },
  { title: "Hemorragia externa", prompt: "Uma pessoa está com hemorragia externa, o que eu faço?" },
  { title: "Convulsão / epilepsia", prompt: "Uma pessoa está tendo uma convulsão, o que eu faço?" }
];

/* ---------- 1) Chips de assuntos rápidos ---------- */
(function initChatTopics() {
  const wrap = document.getElementById("chatTopics");
  if (!wrap) return;

  wrap.innerHTML = TOPICS.map((item, index) => `
    <button type="button" class="topic-chip" data-index="${index}">${item.title}</button>
  `).join("");

  wrap.querySelectorAll(".topic-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const item = TOPICS[Number(chip.dataset.index)];
      if (item) sendPrefilledMessage(item.prompt);
    });
  });
})();

/* ---------- 2) Alternância capa <-> chat ---------- */
const coverScreen = document.getElementById("coverScreen");
const chatScreen = document.getElementById("chatScreen");
const enterChatBtn = document.getElementById("enterChatBtn");
const chatBackBtn = document.getElementById("chatBackBtn");

function openChatScreen(prefillText) {
  coverScreen.hidden = true;
  chatScreen.hidden = false;
  document.body.style.overflow = "hidden";
  if (window.__initN8nChat) window.__initN8nChat();
  if (prefillText) sendPrefilledMessage(prefillText);
}

function closeChatScreen() {
  chatScreen.hidden = true;
  coverScreen.hidden = false;
  document.body.style.overflow = "";
}

if (enterChatBtn) enterChatBtn.addEventListener("click", () => openChatScreen());
if (chatBackBtn) chatBackBtn.addEventListener("click", closeChatScreen);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chatScreen.hidden) closeChatScreen();
});

/* ---------- 3) Envio automático da mensagem pré-definida ---------- */
function findChatInput() {
  const mount = document.getElementById("n8nChatMount");
  if (!mount) return null;
  return mount.querySelector("textarea, input[type='text']");
}

function sendPrefilledMessage(text) {
  let attempts = 0;
  const maxAttempts = 24; // ~6s no total
  const timer = setInterval(() => {
    attempts++;
    const field = findChatInput();
    if (field) {
      clearInterval(timer);
      const proto = field.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
      setter.call(field, text);
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.focus();

      setTimeout(() => {
        const mount = document.getElementById("n8nChatMount");
        const sendBtn = mount && mount.querySelector(
          "button[type='submit'], button[aria-label*='send' i], button[aria-label*='enviar' i]"
        );
        if (sendBtn) {
          sendBtn.click();
        } else {
          field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true }));
        }
      }, 200);
    } else if (attempts >= maxAttempts) {
      clearInterval(timer);
    }
  }, 250);
}
