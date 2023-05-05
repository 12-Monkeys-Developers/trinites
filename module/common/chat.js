import * as Dice from "./rolls.js";
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
    this.roll = null;
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
  withRoll(roll) {
    this.roll = roll;
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
    if (this.roll) {
      (data.type = CONST.CHAT_MESSAGE_TYPES.ROLL), (data.roll = this.roll);
    }

    // Set the flags parameter if necessary
    if (this.flags) {
      data.flags = this.flags;
    }

    // If it's a whisper
    if (this.data.isWhisper) {
      data.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
    }
    // Set the whisper and blind parameters according to the player roll mode settings
    else {
      switch (game.settings.get("core", "rollMode")) {
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
    }

    // Create the chat
    this.chatData = data;
    return this;
  }

  /**
   * Create the message content from the registered template.
   * @returns the message content or null if an error occurs.
   */
  async _createContent() {
    // Update the data to provide to the template
    const data = duplicate(this.data);
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
    //const actorId = $(event.currentTarget).parents(".chatroll").data("actorId");
    let actor = game.actors.get(element.closest(".carte.aura").dataset.actorId);
    //const actor = game.actors.get(actorId);

    // Get the message
    const messageId = mess._id;
    const message = game.messages.get(messageId);

    //event.preventDefault();

    // Aura déjà déployée
    if (element.classList.contains("deployee")) {
      console.log("Aura déjà déployée");
      return;
    }

    const auraId = element.closest(".carte.aura").dataset.itemId;

    let activation = await actor.activerAura(auraId, null);

    if (typeof activation === "object" && activation !== null) {
      /*
      element.title = activation.title;
      element.classList.add(activation.classList);
      element.closest(".carte.aura").getElementsByClassName("zone")[0].innerHTML = activation.zone;
      */
      // Create the chat message
      // Récupération des données de l'item
      let aura = actor.items.get(auraId);
      let souffleDispo = actor.canUseSouffle;

      // Récupération des données de l'item
      let cardData = {
        aura: aura,
        actorId: actor.id,
        souffleDispo: souffleDispo,
        isWhisper: message.isWhisper,
      };

      let newChatMessage = await new TrinitesChat(actor).withTemplate("systems/trinites/templates/partials/chat/carte-aura.hbs").withData(cardData).create();
      console.log("newMessage : ", newChatMessage);

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

    Dice.jetCompetence({
      actor: actor,
      type: "souffle",
      aura: aura,
      signe: "vierge",
      competence: "emprise",
      afficherDialog: false,
    });

    aura.update({ "system.deploiement": "cosme" });

    element.title = `Le Souffle est sans effet à cette portée d'aura`;
    element.classList.add("cosme");
    element.closest(".carte.aura").getElementsByClassName("zone")[0].innerHTML = "Cosme";
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
      await new DepenseKarmaFormApplication.open(actor, actor.system.trinite, typeKarma, "atout", coutPouvoir, atoutId);
    }

    if (activationOk) {
      carteAtoutActive({
        actor: actor,
        atoutId: atoutId,
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
    isWhisper: whisper,
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
    nomPersonnage: actor.name,
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-atout-active.hbs";

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
    isWhisper: whisper,
  };

  // Recupération du template
  const messageTemplate = "systems/trinites/templates/partials/chat/carte-aura.hbs";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(cardData).create();
  await chat.display();
}

export async function carteVerset({ actor = null, versetId = null, whisper = null } = {}) {
  let verset = actor.items.get(versetId);

  // Récupération des données de l'item
  let cardData = {
    verset: verset,
    actorId: actor.id,
    isWhisper: whisper,
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
