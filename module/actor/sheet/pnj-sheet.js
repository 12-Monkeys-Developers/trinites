
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

  /**
   * Handle dropping of an item reference or item data onto an Item Sheet
   *
   * @name _onDropItem
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   * @override
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
    
}
