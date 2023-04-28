
import TrinitesActorSheet from "./actor-sheet.js";
import * as Roll from "../../common/rolls.js";
import * as Chat from "../../common/chat.js";
import { Log } from "../../common/log.js";

export default class TrinitesPnjSheet extends TrinitesActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 744,
      height: 958,
      classes: ["trinites", "sheet", "actor", "pnj"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "profane" }]
    });
  }

  get template() {
         return "systems/trinites/templates/sheets/actors/pnj-sheet.html";
  }

  getData() {
    const data = super.getData();

    data.versets = data.items.filter((item) => item.type === "verset");    
    data.auras = data.items.filter(item => item.type === "aura");  
    data.atouts = data.items.filter((item) => item.type === "atout");
    data.pouvoirs = data.items.filter(item => item.type === "pouvoir");
    data.majestes = data.items.filter(item => item.type === "majeste");

    data.unlocked = this.actor.isUnlocked;
    data.isArchonteRoi = this.actor.isArchonteRoi;

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Lock/Unlock la fiche
    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

    // Régénérer des cases de vie en dépensant du Karma
    html.find(".regen").click(this._onRegenerationSante.bind(this));

    // Changer la zone de déploiement d'une aura
    html.find(".zone-deploiement").click(this._onZoneDeploimentAura.bind(this));

    // Jet de Lame noire
    if (this.actor.isArchonteRoi) html.find(".roll-lame").click(this._onJetLame.bind(this));

    // Carte - Atout
    html.find(".roll-atout").click(this._onCarteAtout.bind(this));

    // Carte - Aura
    html.find(".roll-aura").click(this._onCarteAura.bind(this));

    // Carte - Verset
    html.find(".roll-verset").click(this._onCarteVerset.bind(this));

    // Permet d'afficher la description
    html.find('.grid-atout .nom-atout').click(this._onItemSummary.bind(this));
    html.find('.grid-zodiaque .nom-aura').click(this._onItemSummary.bind(this));
    html.find('.grid-verset .nom-verset').click(this._onItemSummary.bind(this));
    html.find('.grid-pouvoir .nom-pouvoir').click(this._onItemSummary.bind(this));
  }

  /**
   * Handle dropping of an item reference or item data onto an Item Sheet
   *
   * @name _onDropItem
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  async _onDropItem(event, data) {
    Item.fromDropData(data).then((item) => {
      const itemData = duplicate(item);
      switch (itemData.type) {
        case "metier":
          return ;
        case "vieAnterieure":
          return ;
        case "aura":
          return this._onDropAuraItem(event, itemData);
        case "atout":
            if (this.actor.isArchonteRoi) super._onDropItem(event, data);
            else return;
        default:
          return super._onDropItem(event, data);
      }
    });
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
      type: "lameSoeur"
    });
  }

}
