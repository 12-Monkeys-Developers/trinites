import * as Dice from "./dice.js";
import DepenseKarmaFormApplication from "./appli/DepenseKarmaFormApp.js";

export function addChatListeners(html) {
    html.on('click', 'button.dette', onDetteEsprit);
    html.on('click', 'a.activer.aura', onActiverAura);
    html.on('click', 'a.activer.souffle', onActiverSouffle);
    html.on('click', 'a.activer.verset', onActiverVerset);
    html.on('click', 'a.activer.atout', onActiverAtout);
}

function onDetteEsprit(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.classList.contains("used"))
    {
        ui.notifications.warn('Vous avez déjà payé cette dette de Karma !');    
        return;
    }

    let actor = game.actors.get(element.dataset.actorId);
    if(element.dataset.esprit == "deva") {
        actor.update({"data.trinite.deva.dettes": actor.data.data.trinite.deva.dettes + 1});
    }

    if(element.dataset.esprit == 'archonte')
    {
        actor.update({"data.trinite.archonte.dettes": actor.data.data.trinite.archonte.dettes + 1});
    }

    element.classList.add("used");
    element.innerHTML = "Dette de Karma payée";

    element.closest(".jet-comp").getElementsByClassName("carte")[0].classList.remove("hidden");
}

function onActiverAura(event) {
    event.preventDefault();
    const element = event.currentTarget;

    // Aura déjà déployée
    if (element.classList.contains("deployee")) { return; }

    let actor = game.actors.get(element.closest(".carte.aura").dataset.actorId);
    let auraId = element.closest(".carte.aura").dataset.itemId;
    let aura = actor.items.get(auraId);

    // Aura déjà déployée - test par sécurité
    if(aura.data.data.deploiement != "") {
        ui.notifications.warn("Cette aura est déjà déployée !");
        return;
    }

    let typeKarma = "neutre";
    let karmaDisponible = actor.karmaDisponible(typeKarma);
    let coutPouvoir = actor.coutPouvoir("zodiaque");
    let activationOk = false;

    // Pas assez de Karma
    if(karmaDisponible < coutPouvoir) {
        ui.notifications.warn("Vous n'avez pas assez de Karma disponible pour déployer cette aura !");
        return;
    }
    // Juste ce qu'il faut de Karma
    else if (karmaDisponible == coutPouvoir) {
        actor.viderKarma(typeKarma);
        activationOk = true;
    }
    // Uniquement le Karma de l'Esprit
    else if(typeKarma != actor.data.data.trinite.adam.karma.type && typeKarma != "neutre") {
        actor.consommerKarma(typeKarma, coutPouvoir);
        activationOk = true;
    }
    else {
        console.log("DialogKarma");
        new DepenseKarmaFormApplication(actor, actor.data.data.trinite, typeKarma, "aura", coutPouvoir, auraId).render(true);

         // MAJ de la carte - dialog
         element.title = `La fenêtre de sélection de Karma a été affichée`;
         element.classList.add("deployee");
         element.closest(".carte.aura").getElementsByClassName("zone")[0].innerHTML = "A déterminer";
    }

    if(activationOk) {
        aura.update({"data.deploiement": "cosme"});

        // MAJ de la carte
        element.title = `Vous avez déployée l'aura '${aura.data.name}'`;
        element.classList.add("deployee");
        element.closest(".carte.aura").getElementsByClassName("zone")[0].innerHTML = "Cosme";
    }
}

function onActiverSouffle(event) {
    event.preventDefault();
    const element = event.currentTarget;

    // Aura déjà déployée
    if (element.classList.contains("cosme")) { return; }

    let actor = game.actors.get(element.closest(".carte.aura").dataset.actorId);
    let aura = actor.items.get(element.closest(".carte.aura").dataset.itemId);

    if(aura.data.data.deploiement == "" || aura.data.data.deploiement == "cosme") {
        ui.notifications.warn("Le Souffle a déjà été déclenché !");
        return;
    }

    Dice.jetCompetence({
        actor: actor,
        type: "souffle",
        aura: aura.data,
        signe: "vierge",
        competence: "emprise",
        afficherDialog: false
    });

    aura.update({"data.deploiement": "cosme"});

    element.title = `Le Souffle est sans effet à cette portée d'aura`;
    element.classList.add("cosme");
    element.closest(".carte.aura").getElementsByClassName("zone")[0].innerHTML = "Cosme";
}

function onActiverVerset(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let actor = game.actors.get(element.closest(".carte.verset").dataset.actorId);

    const versetId = element.closest(".carte.verset").dataset.itemId;
    let verset = actor.items.get(versetId);
    let typeKarma = verset.data.data.karma;
    
    let karmaDisponible = actor.karmaDisponible(typeKarma);
    let coutPouvoir = actor.coutPouvoir("grandLivre");
    let activationOk = false;

    // Pas assez de Karma
    if(karmaDisponible < coutPouvoir) {
        ui.notifications.warn("Vous n'avez pas assez de Karma disponible pour réciter ce verset !");
        return;
    }
    // Juste ce qu'il faut de Karma
    else if (karmaDisponible == coutPouvoir) {
        actor.viderKarma(typeKarma);
        activationOk = true;
    }
    // Uniquement le Karma de l'Esprit
    else if(typeKarma != actor.data.data.trinite.adam.karma.type) {
        actor.consommerKarma(typeKarma, coutPouvoir);
        activationOk = true;
    }
    else {
        new DepenseKarmaFormApplication(actor, actor.data.data.trinite, typeKarma, "verset", coutPouvoir, versetId).render(true);
    }

    if(activationOk) {
        console.log("TODO - Enchainer sur la carte Verset activée dans le chat");
    }
}

function onActiverAtout(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let actor = game.actors.get(element.closest(".carte.atout").dataset.actorId);

    const atoutId = element.closest(".carte.atout").dataset.itemId;
    let atout = actor.items.get(atoutId);
    let typeKarma = atout.data.data.karma;
    
    let karmaDisponible = actor.karmaDisponible(typeKarma);
    let coutPouvoir = actor.coutPouvoir("lameSoeur");
    let activationOk = false;

    // Pas assez de Karma
    if(karmaDisponible < coutPouvoir) {
        ui.notifications.warn("Vous n'avez pas assez de Karma disponible activer cet atout !");
        return;
    }
    // Juste ce qu'il faut de Karma
    else if (karmaDisponible == coutPouvoir) {
        actor.viderKarma(typeKarma);
        activationOk = true;
    }
    // Uniquement le Karma de l'Esprit
    else if(typeKarma != actor.data.data.trinite.adam.karma.type) {
        actor.consommerKarma(typeKarma, coutPouvoir);
        activationOk = true;
    }
    else {
        new DepenseKarmaFormApplication(actor, actor.data.data.trinite, typeKarma, "atout", coutPouvoir, atoutId).render(true);
    }

    if(activationOk) {
        console.log("TODO - Enchainer sur la carte Atout activée dans le chat");
    }
}

/*------------------------------------
---- Affichage des cartes de chat ----
------------------------------------*/

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

    // Récupération des données de l'item
    let cardData = {
        aura: aura.data,
        actorId: actor.id,
        affinite: actor.data.data.themeAstral.affinite
    }

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