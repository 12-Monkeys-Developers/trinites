import * as Dice from "./dice.js";

export function addChatListeners(html) {
    html.on('click', 'button.dette', onDetteEsprit);
    html.on('click', 'a.activer.aura', onActiverAura);
}

function onDetteEsprit(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.classList.contains("used"))
    {
        ui.notifications.warn('Vous avez déjà payé cette dette de Karma !');    
        return;
    }

    const esprit = element.dataset.esprit;
    const actorId = element.dataset.actorId;

    let actor = game.actors.get(actorId);
    if(esprit == "deva") {
        console.log(actor.data.data.trinite.deva.dettes);
        actor.update({"data.trinite.deva.dettes": actor.data.data.trinite.deva.dettes + 1});
    }

    if(esprit == 'archonte')
    {
        console.log(actor.data.data.trinite.archonte.dettes);
        actor.update({"data.trinite.archonte.dettes": actor.data.data.trinite.archonte.dettes + 1});
    }

    element.classList.add("used");
    element.innerHTML = "Dette de Karma payée";
}

function onActiverAura(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.classList.contains("deployee"))
    {
        return;
    }

    const actorId = element.closest(".carte.aura").dataset.actorId;
    let actor = game.actors.get(actorId);

    const auraId = element.closest(".carte.aura").dataset.itemId;
    let aura = actor.items.get(auraId);

    console.log();

    if(aura.data.data.deploiement != "") {
        ui.notifications.warn("Cette aura est déjà déployée !");
        return;
    }

    aura.update({"data.deploiement": "cosme"});


    element.title = `Vous avez déployée l'aura '${aura.data.name}'`;
    element.classList.add("deployee");
    element.closest(".carte.aura").getElementsByClassName("zone")[0].innerHTML = "Cosme";
}

export async function carteAtout({actor = null,
    atoutId = null} = {}) {

    let atout = actor.items.get(atoutId);

    // Récupération des données de l'item
    let cardData = {
        atout: atout.data,
        actorId: actor.id
    }

    console.log(cardData);
    // Recupération du template
    const messageTemplate = "systems/trinites/templates/partials/chat/carte-atout.hbs"; 

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: await renderTemplate(messageTemplate, cardData),
        roll: true
    }

    // Affichage du message
    await ChatMessage.create(chatData);
}

export async function carteAura({actor = null,
    auraId = null} = {}) {

    let aura = actor.items.get(auraId);

    console.log(actor.data.data.themeAstral.affinite);

    // Récupération des données de l'item
    let cardData = {
        aura: aura.data,
        actorId: actor.id,
        affinite: actor.data.data.themeAstral.affinite
    }

    console.log(cardData);
    // Recupération du template
    const messageTemplate = "systems/trinites/templates/partials/chat/carte-aura.hbs"; 

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: await renderTemplate(messageTemplate, cardData),
        roll: true
    }

    // Affichage du message
    await ChatMessage.create(chatData);
}

export async function carteVerset({actor = null,
    versetId = null} = {}) {

    let verset = actor.items.get(versetId);

    // Récupération des données de l'item
    let cardData = {
        verset: verset.data,
        actorId: actor.id
    }

    console.log(cardData);
    // Recupération du template
    const messageTemplate = "systems/trinites/templates/partials/chat/carte-verset.hbs"; 

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: await renderTemplate(messageTemplate, cardData),
        roll: true
    }

    // Affichage du message
    await ChatMessage.create(chatData);
}