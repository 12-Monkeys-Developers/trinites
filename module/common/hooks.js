import { TrinitesChat } from "./chat.js ";

export default function registerHooks() {
  Hooks.on("renderChatLog", (app, html, data) => {
    html.on("click", "button.dette", TrinitesChat.onDetteEsprit);
    html.on("click", "a.activer.aura", TrinitesChat.onActiverAura);
    html.on("click", "a.activer.souffle", TrinitesChat.onActiverSouffle);
    html.on("click", "a.activer.verset", TrinitesChat.onActiverVerset);
    html.on("click", "a.activer.atout", TrinitesChat.onActiverAtout);
    html.on("click", "a.details.aura", TrinitesChat.onDetailsAura);
    html.on("click", "a.details.souffle", TrinitesChat.onDetailsSouffle);
    html.on("click", "a.details.atout", TrinitesChat.onDetailsAtout);
    html.on("click", "a.details.verset", TrinitesChat.onDetailsVerset);
  });
}
