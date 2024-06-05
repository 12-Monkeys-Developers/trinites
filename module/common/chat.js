import * as Roll from "./rolls.js";
import DepenseKarmaFormApplication from "../appli/DepenseKarmaFormApp.js";

export class TrinitesChat {
  /**
   * Constructor.
   * @param actor The emiter of the chat message.
   */
  constructor(actor) {
    this.actor = actor;
    this.chat = null;
    this.content = null;
    this.template = null;
    this.data = null;
    this.chatData = null;
    this.flags = null;
    this.rolls = null;
  }

  /**
   * Sets the specified message content.
   * @param content The content to set.
   * @returns the instance.
   */
  withContent(content) {
    this.content = content;
    return this;
  }

  /**
   * Sets the specified template used to create the message content.
   * @param template The path of the file template to set.
   * @returns the instance.
   */
  withTemplate(template) {
    this.template = template;
    return this;
  }

  /**
   * Sets the specified data used to create the message content.
   * @param data The data of the file template to set.
   * @returns the instance.
   */
  withData(data) {
    this.data = data;
    return this;
  }

  /**
   * Sets the flags parameter.
   * @param flags The flags parameter to set.
   * @returns the instance.
   */
  withFlags(flags) {
    this.flags = flags;
    return this;
  }

  /**
   * Indicates if the chat is a roll.
   * @param roll The roll.
   * @returns the instance.
   */
  withRolls(rolls) {
    this.rolls = rolls instanceof Array ? rolls : [rolls];    
    return this;
  }

  /**
   * Creates the chat message.
   * @return this instance.
   */
  async create() {
    // Retrieve the message content
    if (!this.content && this.template && this.data) {
      this.content = await this._createContent();
    }

    // Exit if message content can't be created
    if (!this.content) {
      return null;
    }

    // Create the chat data
    const data = {
      user: game.user.id,
      speaker: {
        actor: this.actor.id,
        alias: this.actor.name,
        scene: null,
        token: null
      },
      content: this.content
    };

    // Set the roll parameter if necessary
    if (this.rolls) {
      data.rollMode = this.data.rollMode;
      data.type = CONST.CHAT_MESSAGE_STYLES.OTHER; 
      data.rolls = this.rolls;
    }

    // Set the flags parameter if necessary
    if (this.flags) {
      data.flags = this.flags;
    }

    // Si rollMode n'est pas défini, on prend celui par défaut (celui du chat)
    let visibilityMode = this.data.rollMode ?? game.settings.get('core', 'rollMode');

    // Visibilité des jet des PNJs en fonction de l'option choisie
    if (this.actor.type === "pnj" && game.user.isGM) {
      let visibilityChoice = game.settings.get("trinites", "visibiliteJetsPNJ");
      if (visibilityChoice === "public") visibilityMode = "publicroll";
      else if (visibilityChoice === "private") visibilityMode = "gmroll";
      else if (visibilityChoice === "depends") visibilityMode = game.settings.get('core', 'rollMode');
    }

    // Le joueur a choisi de chuchoter au le MJ
    if (this.data.isWhisper) visibilityMode = "gmroll";

    switch (visibilityMode) {
      case "gmroll":
        data.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
        break;
      case "blindroll":
        data.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
        data.blind = true;
        break;
      case "selfroll":
        data.whisper = [game.user.id];
        break;
    }

    data.rollMode = visibilityMode;

    // Create the chat
    this.chatData = data;
    // console.log('chat create', this);
    return this;
  }

  /**
   * Create the message content from the registered template.
   * @returns the message content or null if an error occurs.
   */
  async _createContent() {
    // Update the data to provide to the template
    const data = foundry.utils.duplicate(this.data);
    //TODO owner pour faire quoi ?
    data.owner = this.actor.id; 

    // Call the template renderer.
    return await renderTemplate(this.template, data);
  }

  /**
   * @description Displays the chat message
   * @returns this instance
   */
  async display() {
    // Create the chat
    this.chat = await ChatMessage.create(this.chatData);
    return this;
  }

  /*------------------------
    ---- Boutons d'action ----
    ------------------------*/

  static onDetteEsprit(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.classList.contains("used")) {
      ui.notifications.warn("Vous avez déjà payé cette dette de Karma !");
      return;
    }

    let actor = game.actors.get(element.dataset.actorId);
    if (element.dataset.esprit == "deva") {
      actor.update({ "system.trinite.deva.dettes": actor.system.trinite.deva.dettes + 1 });
    }

    if (element.dataset.esprit == "archonte") {
      actor.update({ "system.trinite.archonte.dettes": actor.system.trinite.archonte.dettes + 1 });
    }

    element.classList.add("used");
    element.innerHTML = "Dette de Karma payée";

    let elt = element.closest(".jet-comp");
    if (!elt) elt = element.closest(".jet-arme");

    let elemSouffle = elt.getElementsByClassName("carte")[0];
    if (elemSouffle) {
      elemSouffle.classList.remove("hidden");
    }
  }

  static async onActiverAura(event, mess) {
    event.preventDefault();
    const element = event.currentTarget;
    // Get the actor who has sent the chat message
    let actor = game.actors.get(element.closest(".carte.aura").dataset.actorId);

    // Get the message
    const messageId = mess._id;
    const message = game.messages.get(messageId);

    // Aura déjà déployée
    if (element.classList.contains("deployee")) {
      console.log("Aura déjà déployée");
      return;
    }

    const auraId = element.closest(".carte.aura").dataset.itemId;

    let activation = await actor.activerAura(auraId, null);

    if (typeof activation === "object" && activation !== null) {
      // Récupération des données de l'item
      let aura = actor.items.get(auraId);
      let souffleDispo = actor.canUseSouffle;

      // Récupération des données de l'item
      let cardData = {
        aura: aura,
        actorId: actor.id,
        souffleDispo: souffleDispo,
        isWhisper: message.isWhisper
      };

      let newChatMessage = await new TrinitesChat(actor).withTemplate("systems/trinites/templates/partials/chat/carte-aura.hbs").withData(cardData).create();

      await message.update({ content: newChatMessage.content });
    }
  }

  static onActiverSouffle(event) {
    event.preventDefault();
    const element = event.currentTarget;

    // Aura déjà déployée
    if (element.classList.contains("cosme")) {
      return;
    }

    let actor = game.actors.get(element.closest(".carte.aura").dataset.actorId);
    let aura = actor.items.get(element.closest(".carte.aura").dataset.itemId);

    if (aura.system.deploiement == "" || aura.system.deploiement == "cosme") {
      ui.notifications.warn("Le Souffle a déjà été déclenché !");
      return;
    }

    Roll.jetCompetence({
      actor: actor,
      type: "souffle",
      aura: aura,
      signe: "vierge",
      competence: "emprise",
      afficherDialog: false
    });

    aura.update({ "system.deploiement": "cosme" });

    element.title = `Le Souffle est sans effet à cette portée d'aura`;
    element.classList.add("cosme");
    element.closest(".carte.aura").getElementsByClassName("zone")[0].innerHTML = "Cosme";
  }

  static onActiverMajeste(event) {
    event.preventDefault();
    const element = event.currentTarget;

    // Aura déjà déployée
    if (element.classList.contains("cosme")) {
      return;
    }

    let actor = game.actors.get(element.closest(".carte.majeste").dataset.actorId);
    let majeste = actor.items.get(element.closest(".carte.majeste").dataset.itemId);
    
    let auras = actor.items.filter((item) => item.type === "aura");
    for(let aura of auras){
        aura.update({ "system.deploiement": "cosme" });
    }
    
    actor.viderKarma("neutre");

    carteMajesteActive({
      actor: actor,
      majesteId: majeste.id,
    });
    
  }

  // Activer un verset dans le la fenêtre de chat
  static onActiverVerset(event) {
    event.preventDefault();
    const element = event.currentTarget;
    // Shift + Click si le verset a été murmuré
    const murmure = event.shiftKey;
    const options = {};
    options["murmure"] = murmure;

    let actor = game.actors.get(element.closest(".carte.verset").dataset.actorId);
    const versetId = element.closest(".carte.verset").dataset.itemId;

    actor.reciterVerset(versetId, options);
  }

  static async onActiverAtout(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let actor = game.actors.get(element.closest(".carte.atout").dataset.actorId);

    const atoutId = element.closest(".carte.atout").dataset.itemId;
    let atout = actor.items.get(atoutId);
    let typeKarma = atout.system.karma;

    let karmaDisponible = actor.karmaDisponible(typeKarma);
    let coutPouvoir = actor.coutPouvoir("lameSoeur");
    let activationOk = false;

    // Pas assez de Karma
    if (karmaDisponible < coutPouvoir) {
      ui.notifications.warn("Vous n'avez pas assez de Karma disponible pour utiliser cet atout !");
      return;
    }
    // Juste ce qu'il faut de Karma
    else if (karmaDisponible == coutPouvoir) {
      actor.viderKarma(typeKarma);
      activationOk = true;
    }
    // Uniquement le Karma d'une source
    else if (actor.sourceUnique(typeKarma)) {
      actor.consommerSourceKarma(actor.sourceUnique(typeKarma), coutPouvoir);
      activationOk = true;
    } else {
      await DepenseKarmaFormApplication.open(actor, actor.system.trinite, typeKarma, "atout", coutPouvoir, atoutId);
    }

    if (activationOk) {
      carteAtoutActive({
        actor: actor,
        atoutId: atoutId,
      });
    }
  }

  static onActiverDragon(event) {
    event.preventDefault();
    const element = event.currentTarget;

    // Aura déjà déployée
    if (element.classList.contains("cosme")) {
      return;
    }

    let actor = game.actors.get(element.closest(".carte.dragon").dataset.actorId);
    let dragon = actor.items.get(element.closest(".carte.dragon").dataset.itemId);
    let typeKarma = "dragon";

    let karmaDisponible = actor.karmaDisponible(typeKarma);
    let coutPouvoir = 1;
    let activationOk = false;

    // Pas assez de Karma
    if (karmaDisponible < coutPouvoir) {
      ui.notifications.warn("Le Dragon n'a pas assez de Karma disponible pour utiliser ce pouvoir !");
      return;
    }
    // Juste ce qu'il faut de Karma
    else if (karmaDisponible == coutPouvoir) {
      actor.viderKarma(typeKarma);
      activationOk = true;
    }
    // Uniquement le Karma d'une source
    else {
      actor.consommerSourceKarma("dragon", coutPouvoir);
      activationOk = true;
    }

    if (activationOk) {
      carteDragonActive({
        actor: actor,
        dragonId:  dragon.id,
    });
  }
  }

  static onDetailsAtout(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.innerHTML.includes("angle-right")) {
      element.closest(".carte.atout").getElementsByClassName("desc")[0].classList.add("visible");
      element.innerHTML = '<i class="fas fa-angle-down"></i>';
    } else {
      element.closest(".carte.atout").getElementsByClassName("desc")[0].classList.remove("visible");
      element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
  }

  static onDetailsVerset(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.innerHTML.includes("angle-right")) {
      element.closest(".carte.verset").getElementsByClassName("desc")[0].classList.add("visible");
      element.innerHTML = '<i class="fas fa-angle-down"></i>';
    } else {
      element.closest(".carte.verset").getElementsByClassName("desc")[0].classList.remove("visible");
      element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
  }

  static onDetailsAura(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.innerHTML.includes("angle-right")) {
      element.closest(".carte.aura").getElementsByClassName("desc")[0].classList.add("visible");
      element.innerHTML = '<i class="fas fa-angle-down"></i>';
    } else {
      element.closest(".carte.aura").getElementsByClassName("desc")[0].classList.remove("visible");
      element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
  }

  static onDetailsMajeste(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.innerHTML.includes("angle-right")) {
      element.closest(".carte.majeste").getElementsByClassName("desc")[0].classList.add("visible");
      element.innerHTML = '<i class="fas fa-angle-down"></i>';
    } else {
      element.closest(".carte.majeste").getElementsByClassName("desc")[0].classList.remove("visible");
      element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
  }

  static onDetailsDragon(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.innerHTML.includes("angle-right")) {
      element.closest(".carte.dragon").getElementsByClassName("desc")[0].classList.add("visible");
      element.innerHTML = '<i class="fas fa-angle-down"></i>';
    } else {
      element.closest(".carte.dragon").getElementsByClassName("desc")[0].classList.remove("visible");
      element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
  }

  static onDetailsEffetsMajeste(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.innerHTML.includes("angle-right")) {
      element.closest(".carte.majeste").getElementsByClassName("descEffet")[0].classList.add("visible");
      element.innerHTML = '<i class="fas fa-angle-down"></i>';
    } else {
      element.closest(".carte.majeste").getElementsByClassName("descEffet")[0].classList.remove("visible");
      element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
  }

  static onDetailsSouffle(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.innerHTML.includes("angle-right")) {
      element.closest(".carte.aura").getElementsByClassName("descSouffle")[0].classList.add("visible");
      element.innerHTML = '<i class="fas fa-angle-down"></i>';
    } else {
      element.closest(".carte.aura").getElementsByClassName("descSouffle")[0].classList.remove("visible");
      element.innerHTML = '<i class="fas fa-angle-right"></i>';
    }
  }

  static async onSelectDice(event, mess) {
    event.preventDefault();
    
    const messageId = mess._id;
    const message = game.messages.get(messageId);

    const selectedDice = event.currentTarget;

    const actorId = $(event.currentTarget).parents(".jet-comp").data("actorId");
    const actor = game.actors.get(actorId);

    const type = selectedDice.classList.contains("de-un") ? "de-un" : "de-deux";
    selectedDice.classList.toggle("dice-selected");

    let otherDice = type === "de-un" ? $(event.currentTarget).parents(".jet-comp").find(".de-deux") : $(event.currentTarget).parents(".jet-comp").find(".de-un");
    if (otherDice.length > 0) {
      if (otherDice[0].classList.contains("dice-selected")) {
        otherDice[0].classList.toggle("dice-selected");
      }
    }
    
    if (actor.isTrinite) {
      // Clic sur dé Deva
      if (type === "de-un") {
        let elem = $(event.currentTarget).parents(".jet-comp").find(".dette.deva");
        if (elem.length > 0) elem[0].classList.toggle("not-displayed");

        let otherDette = $(event.currentTarget).parents(".jet-comp").find(".dette.archonte");
        if (otherDette.length > 0) otherDette[0].classList.add("not-displayed");

        // Gestion accélération/ralentissement si c'est un succès
        let resultatDeva = message.getFlag("world", "resultatDeva");
        if (resultatDeva === "reussite" || resultatDeva === "detteDeva") {
          const hasModificateurs = message.getFlag("world", "modificateurs");
          if (hasModificateurs) {
            const acceleration = message.getFlag("world", "acceleration");
            const ralentissement = message.getFlag("world", "ralentissement");
            if (acceleration) await actor.setFlag("world", "acceleration", acceleration);
            if (ralentissement) await actor.setFlag("world", "ralentissement", ralentissement);
          }
        }
      }
      // Clic sur dé Archonte
      else {
        let elem = $(event.currentTarget).parents(".jet-comp").find(".dette.archonte");
        if (elem.length > 0) elem[0].classList.toggle("not-displayed"); 

        let otherDette = $(event.currentTarget).parents(".jet-comp").find(".dette.deva");
        if (otherDette.length > 0) otherDette[0].classList.add("not-displayed");

        // Gestion accélération/ralentissement si c'est un succès
        let resultatArchonte = message.getFlag("world", "resultatArchonte");
        if (resultatArchonte === "reussite" || resultatArchonte === "detteArchonte") {
          const hasModificateurs = message.getFlag("world", "modificateurs");
          if (hasModificateurs) {
            const acceleration = message.getFlag("world", "acceleration");
            const ralentissement = message.getFlag("world", "ralentissement");
            if (acceleration) await actor.setFlag("world", "acceleration", acceleration);
            if (ralentissement) await actor.setFlag("world", "ralentissement", ralentissement);
          }
        }
      }
    }
  }
}

/*------------------------------------
---- Affichage des cartes de chat ----
------------------------------------*/

export async function carteAtout({ actor = null, atoutId = null, whisper = null } = {}) {
  let atout = actor.items.get(atoutId);

  // Récupération des données de l'item
  let cardData = {
    atout: atout,
    actorId: actor.id,
    isWhisper: whisper
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-atout.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

export async function carteAtoutActive({ actor = null, atoutId = null } = {}) {
  let atout = actor.items.get(atoutId);

  // Récupération des données de l'item
  let cardData = {
    atout: atout,
    nomPersonnage: actor.name
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-atout-active.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

export async function carteDragon({ actor = null, dragonId = null, whisper = null } = {}) {
  let dragon = actor.items.get(dragonId);

  // Récupération des données de l'item
  let cardData = {
    dragon: dragon,
    actorId: actor.id,
    isWhisper: whisper
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-dragon.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

export async function carteDragonActive({ actor = null, dragonId = null } = {}) {
  let dragon = actor.items.get(dragonId);

  // Récupération des données de l'item
  let cardData = {
    dragon: dragon,
    nomPersonnage: actor.name
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-dragon-active.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

export async function carteAura({ actor = null, auraId = null, whisper = null } = {}) {
  let aura = actor.items.get(auraId);

  let souffleDispo = actor.canUseSouffle;

  // Récupération des données de l'item
  let cardData = {
    aura: aura,
    actorId: actor.id,
    souffleDispo: souffleDispo,
    isWhisper: whisper
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-aura.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

export async function carteMajeste({ actor = null, majesteId = null, whisper = null } = {}) {
  let majeste = actor.items.get(majesteId);

  // Récupération des données de l'item
  let cardData = {
    majeste: majeste,
    actorId: actor.id,
    isWhisper: whisper
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-majeste.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

export async function carteMajesteActive({ actor = null, majesteId = null } = {}) {
  let majeste = actor.items.get(majesteId);

  // Récupération des données de l'item
  let cardData = {
    majeste: majeste,
    nomPersonnage: actor.name
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-majeste-active.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

export async function carteVerset({ actor = null, versetId = null, whisper = null } = {}) {
  let verset = actor.items.get(versetId);

  // Récupération des données de l'item
  let cardData = {
    verset: verset,
    actorId: actor.id,
    isWhisper: whisper
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-verset.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

export async function carteVersetActive({ actor = null, versetId = null } = {}) {
  let verset = actor.items.get(versetId);

  // Récupération des données de l'item
  let cardData = {
    verset: verset,
    nomPersonnage: actor.name,
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-verset-active.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

