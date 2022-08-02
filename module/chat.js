import * as Dice from "./dice.js";
import DepenseKarmaFormApplication from "./appli/DepenseKarmaFormApp.js";

export function addChatListeners(html) {
    html.on('click', 'button.dette', onDetteEsprit);
    html.on('click', 'a.activer.aura', onActiverAura);
    html.on('click', 'a.activer.souffle', onActiverSouffle);
    html.on('click', 'a.activer.verset', onActiverVerset);
    html.on('click', 'a.activer.atout', onActiverAtout);
    html.on('click', 'a.details.aura', onDetailsAura);
    html.on('click', 'a.details.souffle', onDetailsSouffle);
    html.on('click', 'a.details.atout', onDetailsAtout);
    html.on('click', 'a.details.verset', onDetailsVerset);
    
}

/*------------------------
---- Boutons d'action ----
------------------------*/

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
    // Uniquement le Karma d'une source
    else if(actor.sourceUnique(typeKarma)) {
        actor.consommerSourceKarma(actor.sourceUnique(typeKarma), coutPouvoir);
        activationOk = true;
    }
    else {
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
    // Uniquement le Karma d'une source
    else if(actor.sourceUnique(typeKarma)) {
        actor.consommerSourceKarma(actor.sourceUnique(typeKarma), coutPouvoir);
        activationOk = true;
    }
    else {
        new DepenseKarmaFormApplication(actor, actor.data.data.trinite, typeKarma, "verset", coutPouvoir, versetId).render(true);
    }

    if(activationOk) {
        carteVersetActive({
            actor: actor,
            versetId: versetId});
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
        ui.notifications.warn("Vous n'avez pas assez de Karma disponible utiliser cet atout !");
        return;
    }
    // Juste ce qu'il faut de Karma
    else if (karmaDisponible == coutPouvoir) {
        actor.viderKarma(typeKarma);
        activationOk = true;
    }
    // Uniquement le Karma d'une source
    else if(actor.sourceUnique(typeKarma)) {
        actor.consommerSourceKarma(actor.sourceUnique(typeKarma), coutPouvoir);
        activationOk = true;
    }
    else {
        new DepenseKarmaFormApplication(actor, actor.data.data.trinite, typeKarma, "atout", coutPouvoir, atoutId).render(true);
    }

    if(activationOk) {
        carteAtoutActive({
            actor: actor,
            atoutId: atoutId});
    }
}

function onDetailsAtout(event) {
    event.preventDefault();
    const element = event.currentTarget;
    
    if(element.innerHTML.includes("angle-right")) {
        element.closest(".carte.atout").getElementsByClassName("desc")[0].classList.add("visible");
        element.innerHTML = '<i class="fas fa-angle-down"></i>';
    }
    else {
        element.closest(".carte.atout").getElementsByClassName("desc")[0].classList.remove("visible");
        element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
}

function onDetailsVerset(event) {
    event.preventDefault();
    const element = event.currentTarget;
    
    if(element.innerHTML.includes("angle-right")) {
        element.closest(".carte.verset").getElementsByClassName("desc")[0].classList.add("visible");
        element.innerHTML = '<i class="fas fa-angle-down"></i>';
    }
    else {
        element.closest(".carte.verset").getElementsByClassName("desc")[0].classList.remove("visible");
        element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
}

function onDetailsAura(event) {
    event.preventDefault();
    const element = event.currentTarget;
    
    if(element.innerHTML.includes("angle-right")) {
        element.closest(".carte.aura").getElementsByClassName("desc")[0].classList.add("visible");
        element.innerHTML = '<i class="fas fa-angle-down"></i>';
    }
    else {
        element.closest(".carte.aura").getElementsByClassName("desc")[0].classList.remove("visible");
        element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
}

function onDetailsSouffle(event) {
    event.preventDefault();
    const element = event.currentTarget;
    
    if(element.innerHTML.includes("angle-right")) {
        element.closest(".carte.aura").getElementsByClassName("descSouffle")[0].classList.add("visible");
        element.innerHTML = '<i class="fas fa-angle-down"></i>';
    }
    else {
        element.closest(".carte.aura").getElementsByClassName("descSouffle")[0].classList.remove("visible");
        element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
}

/*------------------------------------
---- Affichage des cartes de chat ----
------------------------------------*/

export async function carteAtout({actor = null,
    atoutId = null,
    whisper = null} = {}) {

    let atout = actor.items.get(atoutId);

    // Récupération des données de l'item
    let cardData = {
        atout: atout.data,
        actorId: actor.id
    }

    // Recupération du template
    const messageTemplate = "systems/trinites/templates/partials/chat/carte-atout.hbs"; 

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: await renderTemplate(messageTemplate, cardData),
        roll: true
    }

    if(whisper) {
        chatData = ChatMessage.applyRollMode(chatData, "gmroll");
    }

    // Affichage du message
    await ChatMessage.create(chatData);
}

export async function carteAtoutActive({actor = null,
    atoutId = null} = {}) {

    console.log(actor);
    let atout = actor.items.get(atoutId);

    // Récupération des données de l'item
    let cardData = {
        atout: atout.data,
        nomPersonnage: actor.data.name
    }

    // Recupération du template
    const messageTemplate = "systems/trinites/templates/partials/chat/carte-atout-active.hbs"; 

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
    auraId = null,
    whisper = null} = {}) {

    let aura = actor.items.get(auraId);
    
    let souffleDispo = actor.data.type == "archonteRoi" || actor.data.data.themeAstral.affinite == "zodiaque";

    // Récupération des données de l'item
    let cardData = {
        aura: aura.data,
        actorId: actor.id,
        souffleDispo: souffleDispo
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

    if(whisper) {
        chatData = ChatMessage.applyRollMode(chatData, "gmroll");
    }

    // Affichage du message
    await ChatMessage.create(chatData);
}

export async function carteVerset({actor = null,
    versetId = null,
    whisper = null} = {}) {

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

    if(whisper) {
        chatData = ChatMessage.applyRollMode(chatData, "gmroll");
    }

    // Affichage du message
    await ChatMessage.create(chatData);
}

export async function carteVersetActive({actor = null,
    versetId = null} = {}) {

    let verset = actor.items.get(versetId);

    // Récupération des données de l'item
    let cardData = {
        verset: verset.data,
        nomPersonnage: actor.data.name
    }

    console.log(cardData);
    // Recupération du template
    const messageTemplate = "systems/trinites/templates/partials/chat/carte-verset-active.hbs"; 

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