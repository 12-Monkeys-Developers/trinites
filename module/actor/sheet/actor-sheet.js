import * as Roll from "../../common/rolls.js";
import * as Chat from "../../common/chat.js";
import { Log } from "../../common/log.js";
import DepenseKarmaFormApplication from "../../appli/DepenseKarmaFormApp.js";

export default class TrinitesActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 744,
      height: 958,
      classes: ["trinites", "sheet", "actor"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "profane" }],
    });
  }

  getData() {
    const data = super.getData();
    data.config = game.trinites.config;

    data.armes = data.items.filter((item) => item.type === "arme");
    data.armures = data.items.filter((item) => item.type === "armure");
    data.objets = data.items.filter((item) => item.type === "objet");

    data.descriptionHtml = TextEditor.enrichHTML(this.actor.system.description, { async: false });
    data.notesHtml = TextEditor.enrichHTML(this.actor.system.notes, { async: false });

    data.peutRegenerer = this.actor.system.etatSante !== "indemne" && this.actor.canRegenerate;

    data.isArchonteRoi = this.actor.isArchonteRoi;
    data.isLige = this.actor.isLige;
    data.isHumain = this.actor.isHumain;
    data.isAutre = this.actor.isAutre;

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
  async _onDropItem(event, data) {
    return super._onDropItem(event, data);
  }

  activateListeners(html) {
    super.activateListeners(html);

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

    // Editer un item
    html.find(".edit-item").click(this._onEditerItem.bind(this));

    // Supprimer un item
    html.find(".suppr-item").click(this._onSupprimerItem.bind(this));

    // Jet d'attaque avec une arme
    html.find(".roll-arme").click(this._onJetArme.bind(this));

    // Jet de compétence
    html.find(".roll-comp").click(this._onJetCompetence.bind(this));

    // Jet de ressources
    html.find(".roll-ress").click(this._onJetRessource.bind(this));
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

  async _onRegenerationSante(event) {
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
    } else if (this.actor.type === "archonteRoi" || this.actor.type === "lige") {
      typeKarma = "tenebre";
    }

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
      await new DepenseKarmaFormApplication.open(this.actor, this.actor.data.data.trinite, typeKarma, "regen", 1, null);
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

    if (aura.system.deploiement === "cosme" && zone === "cosme") {
      return;
    }

    let auraActive = false;
    if (zone != "cosme") {
      let auras = this.actor.items.filter(function (item) {
        return item.type === "aura" && item.id !== auraId;
      });
      auraActive = auras.some((autreAura) => {
        if (autreAura.system.deploiement != "cosme") {
          return true;
        }
      });
    }

    if (auraActive) {
      ui.notifications.warn("Vous avez une autre aura déployée au delà du Cosme !");
      return;
    }

    if (aura.system.deploiement === "cosme") {
      ui.notifications.warn("Vous devez déployer l'aura avant de changer sa zone d'effet !");
      return;
    }

    aura.update({ "system.deploiement": zone });
  }

  _onSupprimerItem(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let itemId = element.dataset.itemId;
    const item = this.actor.items.get(itemId);

    let content = `<p>Objet : ${item.name}<br>Etes-vous certain de vouloir supprimer cet objet ?<p>`;
    let dlg = Dialog.confirm({
      title: "Confirmation de suppression",
      content: content,
      yes: () => item.delete(),
      // No: () =>, On ne fait rien sur le 'Non'
      defaultYes: false,
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
      competence: dataset.competence,
    });
  }

  _onJetRessource(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Roll.jetRessource({
      actor: this.actor,
      ressource: dataset.ressource,
    });
  }

  _onCarteAtout(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Chat.carteAtout({
      actor: this.actor,
      atoutId: dataset.itemId,
      whisper: !event.shiftKey,
    });
  }

  _onCarteAura(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Chat.carteAura({
      actor: this.actor,
      auraId: dataset.itemId,
      whisper: !event.shiftKey,
    });
  }

  _onCarteVerset(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Chat.carteVerset({
      actor: this.actor,
      versetId: dataset.itemId,
      whisper: !event.shiftKey,
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

  _onJetArme(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);

    let arme = {
      competence: item.system.competence,
      degats: item.system.degats,
      portee: item.system.portee,
      particularites: item.system.particularites,
      epee: item.system.epee,
    };

    const signe = item.system.competence === "tir" ? "sagittaire" : "belier";

    Roll.jetArme({
      actor: this.actor,
      signe: signe,
      competence: arme.competence,
      arme: arme,
      type: item.name
    });
  }

  /**
   * Handle toggling of an item from the Actor sheet
   * @private
   */
  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget);
    const item = this.actor.items.get(li.data("item-id"));
    // Toggle summary
    if (item?.system.description) {
      if (li.hasClass("expanded")) {
        let summary = li.children(".item-summary");
        summary.slideUp(200, () => summary.remove());
      } else {
        if (item.type === "majeste") {
          let div = $(`<div class="item-summary">${item.system.manifestation}<br />${item.system.effet}</div>`);
        } else {
          let div = $(`<div class="item-summary">${item.system.description}</div>`);
        }
        li.append(div.hide());
        div.slideDown(200);
      }
      li.toggleClass("expanded");
    } else if (item.type === "majeste") {
      if (li.hasClass("expanded")) {
        let summary = li.children(".item-summary");
        summary.slideUp(200, () => summary.remove());
      } else {
        let div = $(`<div class="item-summary">${item.system.manifestation}<br />${item.system.effet}</div>`);
        li.append(div.hide());
        div.slideDown(200);
      }
      li.toggleClass("expanded");
    }
  }
}
