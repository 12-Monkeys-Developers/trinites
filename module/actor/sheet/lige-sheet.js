
import TrinitesActorSheet from "./actor-sheet.js";
import * as Roll from "../../common/rolls.js";
import * as Chat from "../../common/chat.js";
import { Log } from "../../common/log.js";

export default class TrinitesLigeSheet extends TrinitesActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 744,
      height: 958,
      classes: ["trinites", "sheet", "actor", "lige"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "profane" }]
    });
  }

  get template() {
         return "systems/trinites/templates/sheets/actors/lige-sheet.html";
  }

  getData() {
    const data = super.getData();

    data.domaines = data.items.filter(item => item.type === "domaine");
    data.versets = data.items.filter(item => item.type === "verset");
    data.auras = data.items.filter(item => item.type === "aura");  
    data.pouvoirs = data.items.filter(item => item.type === "pouvoir");
    
    data.unlocked = true;
    return data;
  }

  /**
   * Handle dropping of an item reference or item data onto an Item Sheet
   *
   * @name _onDropItem
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  _onDropItem(event, data) {
    Item.fromDropData(data).then(item => {
      const itemData = duplicate(item);
      switch (itemData.type) {
        case "aura":
          return this._onDropAuraItem(event, itemData);
        default:
          return super._onDropItem(event, data);
      }
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Tout ce qui suit nécessite que la feuille soit éditable
    if (!this.options.editable) return;

    if (this.actor) {
      if (this.actor.isOwner) {
        // Régénérer des cases de vie en dépensant du Karma
        html.find(".regen").click(this._onRegenerationSante.bind(this));

        // Changer la zone de déploiement d'une aura
        html.find(".zone-deploiement").click(this._onZoneDeploimentAura.bind(this));

        // Carte - Aura
        html.find(".roll-aura").click(this._onCarteAura.bind(this));

        // Carte - Verset
        html.find(".roll-verset").click(this._onCarteVerset.bind(this));
       
        // Permet d'afficher la description
        html.find('.grid-zodiaque .nom-aura').click(this._onItemSummary.bind(this));
        html.find('.grid-verset .nom-verset').click(this._onItemSummary.bind(this));

      }
    }
  }

   /**
   * Handle the drop of a Aura item on the actor sheet
   *
   * @name _onDropAuraItem
   * @param {*} event
   * @param {*} itemData
   */
    async _onDropAuraItem(event, itemData) {
      event.preventDefault();
      itemData.system.deploiement = "cosme";
      await this.actor.createEmbeddedDocuments("Item", [itemData]);      
    }

  _onSupprimerDomaine(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let domaineId = element.closest(".domaine").dataset.itemId;
    const domaine = this.actor.items.get(domaineId);

    let content = `<p>Domaine : ${domaine.name}<br>Etes-vous certain de vouloir supprimer cet objet ?<p>`;
    let dlg = Dialog.confirm({
      title: "Confirmation de suppression",
      content: content,
      yes: () => domaine.delete(),
      // No: () =>, On ne fait rien sur le 'Non'
      defaultYes: false
    });
  }

  _onAjoutDomaineEtatEpuise(event) {
    event.preventDefault();
    const element = event.currentTarget;
    
    let domaineId = element.closest(".domaine").dataset.itemId;
    this.actor.changeDomaineEtatEpuise(domaineId, true);
  }

  _onSupprDomaineEtatEpuise(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let domaineId = element.closest(".domaine").dataset.itemId;
    this.actor.changeDomaineEtatEpuise(domaineId, false);
  }

  _onAjoutRichesseEtatEpuise(event) {
    event.preventDefault();
    this.actor.update({ "system.ressources.richesse.epuisee": true });
  }

  _onSupprRichesseEtatEpuise(event) {
    event.preventDefault();
    this.actor.update({ "system.ressources.richesse.epuisee": false });
  }

  _onCocherCaseDeVie(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let indexVie = element.dataset.index;
    let blessureVal = this.actor.system.nbBlessure !== indexVie ? indexVie : indexVie - 1;

    this.actor.update({ "system.nbBlessure": blessureVal });
  }

  _onRegenerationSante(event) {
    event.preventDefault();

    const typeKarma = "tenebre";

    let karmaDisponible = this.actor.karmaDisponible(typeKarma);
    let activationOk = false;

    // Pas assez de Karma
    if (karmaDisponible == 0) {
      ui.notifications.warn("Vous n'avez pas assez de Karma disponible pour utiliser la régénération !");
      return;
    }
    // Juste ce qu'il faut de Karma
    else if (karmaDisponible == 1) {
      this.actor.viderKarma(typeKarma);
      activationOk = true;
    }
    // Uniquement le Karma d'une source'
    else if (this.actor.sourceUnique(typeKarma)) {
      this.actor.consommerSourceKarma(this.actor.sourceUnique(typeKarma), 1);
      activationOk = true;
    } else {
      new DepenseKarmaFormApplication(this.actor, this.actor.data.data.trinite, typeKarma, "regen", 1, null).render(true);
    }

    if (activationOk) {
      this.actor.regeneration();
    }
  }

  _onJetLame(event) {
    event.preventDefault();
    // Const dataset = event.currentTarget.dataset;

    let lame = {
      competence: "melee",
      degats: 4,
      portee: "",
      particularites: "",
      epee: true
    };

    Roll.jetArme({
      actor: this.actor,
      signe: "belier",
      competence: lame.competence,
      arme: lame,
      type: "lameNoire"
    });
  }

  _onCarteAtout(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Chat.carteAtout({
      actor: this.actor,
      atoutId: dataset.itemId,
      whisper: !event.shiftKey
    });
  }

  _onCarteAura(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Chat.carteAura({
      actor: this.actor,
      auraId: dataset.itemId,
      whisper: !event.shiftKey
    });
  }

  /**
   * Manage the lock/unlock button on the sheet
   *
   * @name _onSheetChangelock
   * @param {*} event
   */
  async _onSheetChangelock(event) {
    event.preventDefault();

    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    if (flagData) await this.actor.unsetFlag(game.system.id, "SheetUnlocked");
    else await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    this.actor.sheet.render(true);
  }

  async _onEndCreation(event) {
    event.preventDefault();
    await this.actor.update({ "system.creation.finie": true });
  }

  async _onAllowCreation(event) {
    event.preventDefault();
    await this.actor.update({ "system.creation.finie": false });
  }

}
