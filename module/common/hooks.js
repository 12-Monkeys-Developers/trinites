import { TrinitesChat } from "./chat.js ";

export default function registerHooks() {
  Hooks.on("renderChatLog", (app, html, data) => {
    html.on("click", "button.dette", TrinitesChat.onDetteEsprit);
    html.on("click", "a.activer.souffle", TrinitesChat.onActiverSouffle);
    html.on("click", "a.activer.verset", TrinitesChat.onActiverVerset);
    html.on("click", "a.activer.atout", TrinitesChat.onActiverAtout);
    html.on("click", "a.details.aura", TrinitesChat.onDetailsAura);
    html.on("click", "a.details.souffle", TrinitesChat.onDetailsSouffle);
    html.on("click", "a.details.atout", TrinitesChat.onDetailsAtout);
    html.on("click", "a.details.verset", TrinitesChat.onDetailsVerset);

    
  });

  Hooks.on("renderChatMessage", (message, html, data) => {
    html.find("a.activer.aura").click(ev => TrinitesChat.onActiverAura(ev, data.message));   
    html.find(".dice-deva.deux-des").click(ev => TrinitesChat.onSelectDice(ev, data.message));   
    html.find(".dice-archonte.deux-des").click(ev => TrinitesChat.onSelectDice(ev, data.message));
});


  Hooks.on('preCreateActor', (doc, createData, options, userid) => {
    let createChanges = {};
    mergeObject(createChanges, {
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
