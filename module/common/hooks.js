import { TrinitesChat } from "./chat.js ";

export default function registerHooks() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    if (message.isAuthor) {
      const buttonDette = html.querySelectorAll("button.dette");
      for (const actionButton of buttonDette) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onDetteEsprit(ev, message);
        });
      }
      const activerAura = html.querySelectorAll("a.activer.aura");
      for (const actionButton of activerAura) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onActiverAura(ev, message);
        });
      }
      const activerDragon = html.querySelectorAll("a.activer.dragon");
      for (const actionButton of activerDragon) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onActiverDragon(ev, message);
        });
      }
      const activerAtout = html.querySelectorAll("a.activer.atout");
      for (const actionButton of activerAtout) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onActiverAtout(ev, message);
        });
      }
      const activerMajeste = html.querySelectorAll("a.activer.majeste");
      for (const actionButton of activerMajeste) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onActiverMajeste(ev, message);
        });
      }
      const activerSouffle = html.querySelectorAll("a.activer.souffle");
      for (const actionButton of activerSouffle) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onActiverSouffle(ev, message);
        });
      }
      const activerVerset = html.querySelectorAll("a.activer.verset");
      for (const actionButton of activerVerset) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onActiverVerset(ev, message);
        });
      }
      const selectDice = html.querySelectorAll("dice-deva.deux-des");
      for (const actionButton of selectDice) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onSelectDice(ev, message);
        });
      }
      const selectDiceAr = html.querySelectorAll("dice-archonte.deux-des");
      for (const actionButton of selectDiceAr) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onSelectDice(ev, message);
        });
      }
      const detailsAtout = html.querySelectorAll("a.details.atout");
      for (const actionButton of detailsAtout) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onDetailsAtout(ev, message);
        });
      }
      const detailsDragon = html.querySelectorAll("a.details.dragon");
      for (const actionButton of detailsDragon) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onDetailsDragon(ev, message);
        });
      }
      const detailsAura = html.querySelectorAll("a.details.aura");
      for (const actionButton of detailsAura) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onDetailsAura(ev, message);
        });
      }
      const detailsMajeste = html.querySelectorAll("a.details.majeste");
      for (const actionButton of detailsMajeste) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onDetailsMajeste(ev, message);
        });
      }
      const detailsSouffle = html.querySelectorAll("a.details.souffle");
      for (const actionButton of detailsSouffle) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onDetailsSouffle(ev, message);
        });
      }
      const detailsVerset = html.querySelectorAll("a.details.verset");
      for (const actionButton of detailsVerset) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onDetailsVerset(ev, message);
        });
      }
      const detailsEffetsMajeste = html.querySelectorAll("a.details.effetsMajeste");
      for (const actionButton of detailsEffetsMajeste) {
        actionButton.addEventListener("click", async (ev) => {
          TrinitesChat.onDetailsEffetsMajeste(ev, message);
        });
      }
    }

    if (!message.isAuthor && !game.user.isGM) {
      html.find(".action").each((i, btn) => {
        btn.style.display = "none";
      });
    }
  });

  Hooks.on("preCreateActor", (doc, createData, options, userid) => {
    let createChanges = {};
    foundry.utils.mergeObject(createChanges, {
      "prototypeToken.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "prototypeToken.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    });

    if (doc.type === "trinite") {
      createChanges.prototypeToken.sight = { enabled: true, range: 1 };
      createChanges.prototypeToken.actorLink = true;
    }
    doc.updateSource(createChanges);
  });
}
