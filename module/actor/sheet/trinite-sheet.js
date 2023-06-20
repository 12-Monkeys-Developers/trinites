import TrinitesActorSheet from "./actor-sheet.js";
import * as Roll from "../../common/rolls.js";
import * as Chat from "../../common/chat.js";
import { Log } from "../../common/log.js";

export default class TrinitesTriniteSheet extends TrinitesActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 745,
      height: 960,
      classes: ["trinites", "sheet", "actor", "trinite"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "profane" }],
    });
  }

  get template() {
    return "systems/trinites/templates/sheets/actors/trinite-sheet.html";
  }

  getData() {
    const data = super.getData();

    data.hasMetier = this.actor.hasMetier;
    data.hasVieAnterieure = this.actor.hasVieAnterieure;
    data.metierId = this.actor.metierId;
    data.vieAnterieureId = this.actor.vieAnterieureId;

    return data;
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
          return this._onDropMetierItem(event, itemData);
        case "vieAnterieure":
          return this._onDropVieAnterieureItem(event, itemData);
        case "aura":
          return this._onDropAuraItem(event, itemData);
        case "majeste":
          if(this.actor.affLvl("zodiaque")) return super._onDropItem(event, data);
          else return;
        case "jardin":
          if(this.actor.affLvl("zodiaque")) return super._onDropItem(event, data);
          else return;
        case "dragon":
          if(this.actor.affLvl("lameSoeur")) return super._onDropItem(event, data);
          else return;
        default:
          return super._onDropItem(event, data);
      }
    });
  }

  /**
   * Handle the drop of a metier item on the actor sheet
   *
   * @name _onDropMetierItem
   * @param {*} event
   * @param {*} itemData
   */
  async _onDropMetierItem(event, itemData) {
    event.preventDefault();

    if (!this.actor.isUnlocked) return;

    if (this.actor.hasMetier) {
      ui.notifications.warn(game.i18n.localize("TRINITES.notification.warning.metierExistant"));
      return;
    }

    Log.debug("_onDropMetierItem", itemData);

    this.actor.ajouterMetier(itemData);
  }

  /**
   * Handle the drop of a Vie Anterieure item on the actor sheet
   *
   * @name _onDropVieAnterieureItem
   * @param {*} event
   * @param {*} itemData
   */
  _onDropVieAnterieureItem(event, itemData) {
    event.preventDefault();

    if (!this.actor.isUnlocked) return;

    if (this.actor.hasVieAnterieure) {
      ui.notifications.warn(game.i18n.localize("TRINITES.notification.warning.vieAnterieureExistant"));
      return;
    }

    Log.info("_onDropVieAnterieureItem", itemData);

    this.actor.ajouterVieAnterieure(itemData);
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
  
      if (!this.actor.isUnlocked) return;

      itemData.system.deploiement = "cosme";

      await this.actor.createEmbeddedDocuments("Item", [itemData]);      
    }

  activateListeners(html) {
    super.activateListeners(html);

    // Tout ce qui suit nécessite que la feuille soit éditable
    if (!this.options.editable) return;

    if (this.actor) {
      if (this.actor.isOwner) {
            // Supprimer un domaine
        html.find(".suppr-domaine").click(this._onSupprimerDomaine.bind(this));

        // Jet de Lame-soeur
        html.find(".roll-lame").click(this._onJetLame.bind(this));

        // Supprime le métier
        html.find(".delete-metier").click(this._onSupprimerMetier.bind(this));

        // Supprime la vie antérieure
        html.find(".delete-vie-anterieure").click(this._onSupprimerVieAnterieure.bind(this));

        // Finalise la dépense des points de création
        html.find(".fa-user-lock").click(this._onEndCreation.bind(this));

        // Permet la dépense des points de création
        html.find(".fa-user-unlock").click(this._onAllowCreation.bind(this));

      }
    }
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
      defaultYes: false,
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

  _onJetLame(event) {
    event.preventDefault();

    let lame = {
      name: "Lame-Soeur",
      competence: "melee",
      degats: 4,
      portee: "",
      particularites: "",
      epee: true
    };

    Roll.jetCompetence({
      actor: this.actor,
      signe: "belier",
      competence: lame.competence,
      arme: lame,
      type: "lameSoeur"
    });
  }
 
  async _onSupprimerMetier(event) {
    event.preventDefault();
    this.actor.supprimerMetier();
  }

  async _onSupprimerVieAnterieure(event) {
    event.preventDefault();
    this.actor.supprimerVieAnterieure();
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
