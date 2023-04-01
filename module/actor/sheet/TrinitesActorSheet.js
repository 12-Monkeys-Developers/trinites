import * as Roll from "../../common/rolls.js";
import * as Chat from "../../common/chat.js";
import { Log } from "../../common/log.js";

export default class TrinitesActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 744,
      height: 958,
      classes: ["trinites", "sheet", "actor"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "profane" }]
    });
  }

  get template() {
    if (this.actor.type === "trinite") {
      Log.info(`type : ${this.actor.type} | Chargement du template systems/trinites/templates/sheets/actors/personnage-sheet.html`);
      return "systems/trinites/templates/sheets/actors/personnage-sheet.html";
    } else if (this.actor.type === "archonteRoi") {
      Log.info(`type : ${this.actor.type} | Chargement du template systems/trinites/templates/sheets/actors/archonteRoi-sheet.html`);
      return "systems/trinites/templates/sheets/actors/archonteRoi-sheet.html";
    }
    // Else {
    //    console.log(`Trinites | chargement du template systems/trinites/templates/sheets/actors/${this.actor.data.type}-sheet.html`);
    //    return `systems/trinites/templates/sheets/actors/${this.actor.data.type}-sheet.html`
    // }
  }

  getData() {
    const data = super.getData();
    data.config = game.trinites.config;

    data.domaines = data.items.filter(item => item.type === "domaine");
    data.versets = data.items.filter(item => item.type === "verset");
    data.auras = data.items.filter(item => item.type === "aura");
    data.atouts = data.items.filter(item => item.type === "atout");

    data.unlocked = this.actor.isUnlocked;
    data.hasMetier = this.actor.hasMetier;
    data.hasVieAnterieure = this.actor.hasVieAnterieure;

    return data;
  }

  /** @override */
  _onDrop(event) {
    event.preventDefault();
    if (!this.options.editable) return false;
    // Get dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch(err) {
      return false;
    }
    if (!data) return false;

    // Case 1 - Dropped Item
    if (data.type === "Item") {
      return this._onDropItem(event, data);
    }
    // Case 2 - Dropped Actor
    if (data.type === "Actor") {
      return false;
    }
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
        case "metier":
          return this._onDropMetierItem(event, itemData);
        case "vieAnterieure":
          return this._onDropVieAnterieureItem(event, itemData);  
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

    Log.info("_onDropMetierItem", itemData);

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

  activateListeners(html) {
    super.activateListeners(html);

    // Tout ce qui suit nécessite que la feuille soit éditable
    if (!this.options.editable) return;

    if (this.actor) {
      if (this.actor.isOwner) {
        // Supprimer un domaine
        html.find(".suppr-domaine").click(this._onSupprimerDomaine.bind(this));

        // Ajouter au domaine son statut épuisé
        html.find(".check-domaine").click(this._onAjoutDomaineEtatEpuise.bind(this));

        // Enlever au domaine son statut épuisé
        html.find(".uncheck-domaine").click(this._onSupprDomaineEtatEpuise.bind(this));

        // Ajouter à la richesse son statut épuisé
        html.find(".check-richesse").click(this._onAjoutRichesseEtatEpuise.bind(this));

        // Enlever à la richesse son statut épuisé
        html.find(".uncheck-richesse").click(this._onSupprRichesseEtatEpuise.bind(this));

        // Cocher une case de dommages
        html.find(".case-vie").click(this._onCocherCaseDeVie.bind(this));

        // Régénérer des cases de vie en dépensant du Karma
        html.find(".regen").click(this._onRegenerationSante.bind(this));

        // Changer la zone de déploiement d'une aura
        html.find(".zone-deploiement").click(this._onZoneDeploimentAura.bind(this));

        // Editer un item
        html.find(".edit-item").click(this._onEditerItem.bind(this));

        // Supprimer un item
        html.find(".suppr-item").click(this._onSupprimerItem.bind(this));

        // Jet de compétence
        html.find(".roll-comp").click(this._onJetCompetence.bind(this));

        // Jet de ressources
        html.find(".roll-ress").click(this._onJetRessource.bind(this));

        // Jet de Lame-soeur / Lame noire
        html.find(".roll-lame").click(this._onJetLame.bind(this));

        // Carte - Atout
        html.find(".roll-atout").click(this._onCarteAtout.bind(this));

        // Carte - Aura
        html.find(".roll-aura").click(this._onCarteAura.bind(this));

        // Carte - Verset
        html.find(".roll-verset").click(this._onCarteVerset.bind(this));

        // Lock/Unlock la fiche
        html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

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
    // Const element = event.currentTarget;

    let typeKarma = "";
    if (this.actor.type === "trinite") {
      switch (this.actor.system.etatSante) {
        case "endolori":
          typeKarma = "neutre";
          break;
        case "blesse":
          typeKarma = "lumiere";
          break;
        case "inconscient":
          typeKarma = "tenebre";
          break;
      }
    } else if (this.actor.type === "archonteRoi") {
      typeKarma = "tenebre";
    }

    let karmaDisponible = this.actor.karmaDisponible(typeKarma);
    let activationOk = false;

    // Pas assez de Karma
    if (karmaDisponible == 0) {
      ui.notifications.warn("Vous n'avez pas assez de Karma disponible utiliser la régénération !");
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

  _onZoneDeploimentAura(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let auraId = element.dataset.itemId;
    const aura = this.actor.items.get(auraId);
    let zone = element.dataset.zone;

    if (aura.system.deploiement == "") {
      ui.notifications.warn("Vous devez déployer l'aura avant de changer sa zone d'effet !");
      return;
    }

    let auraActive = false;
    if (zone != "cosme") {
      let auras = this.actor.items.filter(function (item) {
        return item.type == "aura" && item.id != auraId;
      });
      auraActive = auras.some((autreAura) => {
        if (autreAura.system.deploiement != "" && autreAura.system.deploiement != "cosme") {
          return true;
        }
      });
    }

    if (auraActive) {
      ui.notifications.warn("Vous avez une autre aura déployée au delà du Cosme !");
      return;
    }

    if (aura.system.deploiement == "cosme" && zone == "cosme") {
      aura.update({ "system.deploiement": "" });
    } else {
      aura.update({ "system.deploiement": zone });
    }
  }

  _onSupprimerItem(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let itemId = element.dataset.itemId;
    const item = this.actor.items.get(itemId);

    let content = `<p>Objet : ${item.data.name}<br>Etes-vous certain de vouloir supprimer cet objet ?<p>`;
    let dlg = Dialog.confirm({
      title: "Confirmation de suppression",
      content: content,
      yes: () => item.delete(),
      // No: () =>, On ne fait rien sur le 'Non'
      defaultYes: false
    });
  }

  _onEditerItem(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let itemId = element.dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }

  _onJetCompetence(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Roll.jetCompetence({
      actor: this.actor,
      signe: dataset.signe,
      competence: dataset.competence
    });
  }

  _onJetRessource(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Roll.jetRessource({
      actor: this.actor,
      ressource: dataset.ressource
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
      type: this.actor.type === "trinite" ? "lameSoeur" : "lameNoire"
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

  _onCarteVerset(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Chat.carteVerset({
      actor: this.actor,
      versetId: dataset.itemId,
      whisper: !event.shiftKey
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
