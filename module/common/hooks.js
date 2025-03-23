import { TrinitesChat } from "./chat.js ";

export default function registerHooks() {

  Hooks.on("renderChatMessage", (message, html, data) => {
    if (message.isAuthor) {
      html.find("button.dette").click(ev => TrinitesChat.onDetteEsprit(ev, data.message));
      html.find("a.activer.aura").click(ev => TrinitesChat.onActiverAura(ev, data.message));
      html.find("a.activer.atout").click(ev => TrinitesChat.onActiverAtout(ev, data.message));
      html.find("a.activer.dragon").click(ev => TrinitesChat.onActiverDragon(ev, data.message));
      html.find("a.activer.majeste").click(ev => TrinitesChat.onActiverMajeste(ev, data.message));
      html.find("a.activer.souffle").click(ev => TrinitesChat.onActiverSouffle(ev, data.message));
      html.find("a.activer.verset").click(ev => TrinitesChat.onActiverVerset(ev, data.message));
      html.find(".dice-deva.deux-des").click(ev => TrinitesChat.onSelectDice(ev, data.message));
      html.find(".dice-archonte.deux-des").click(ev => TrinitesChat.onSelectDice(ev, data.message));
      html.find("a.details.atout").click(ev => TrinitesChat.onDetailsAtout(ev, data.message));
      html.find("a.details.dragon").click(ev => TrinitesChat.onDetailsDragon(ev, data.message));
      html.find("a.details.aura").click(ev => TrinitesChat.onDetailsAura(ev, data.message));
      html.find("a.details.majeste").click(ev => TrinitesChat.onDetailsMajeste(ev, data.message));
      html.find("a.details.souffle").click(ev => TrinitesChat.onDetailsSouffle(ev, data.message));
      html.find("a.details.verset").click(ev => TrinitesChat.onDetailsVerset(ev, data.message));
      html.find("a.details.effetsMajeste").click(ev => TrinitesChat.onDetailsEffetsMajeste(ev, data.message));
    }

    if (!message.isAuthor && !game.user.isGM) {
      html.find(".action").each((i, btn) => {
        btn.style.display = "none";
      })
    }
});


  Hooks.on('preCreateActor', (doc, createData, options, userid) => {
    let createChanges = {};
    foundry.utils.mergeObject(createChanges, {
      'prototypeToken.displayName': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      'prototypeToken.disposition': CONST.TOKEN_DISPOSITIONS.NEUTRAL
    });
  
    if (doc.type === 'trinite') {
      createChanges.prototypeToken.sight= {enabled: true,range:1};
      createChanges.prototypeToken.actorLink = true;
    } 
    doc.updateSource(createChanges);
  });
}
