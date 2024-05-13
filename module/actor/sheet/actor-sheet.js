import * as Roll from "../../common/rolls.js";
import * as Chat from "../../common/chat.js";
import { Log } from "../../common/log.js";
import DepenseKarmaFormApplication from "../../appli/DepenseKarmaFormApp.js";

export default class TrinitesActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 744,
      height: 958,
      classes: ["trinites", "sheet", "actor"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "profane" }],
    });
  }

  async getData() {
    const data = await super.getData();
    data.config = game.trinites.config;

    data.armes = data.items.filter((item) => item.type === "arme");
    data.armures = data.items.filter((item) => item.type === "armure");
    data.objets = data.items.filter((item) => item.type === "objet");
    data.domaines = data.items.filter((item) => item.type === "domaine");

    data.versets = data.items.filter((item) => item.type === "verset");
    data.versetsLumiere = data.items.filter((item) => item.type === "verset" && item.system.karma === "lumiere");
    data.versetsTenebres = data.items.filter((item) => item.type === "verset" && item.system.karma === "tenebre");

    data.auras = data.items.filter((item) => item.type === "aura");
    data.jardins = data.items.filter((item) => item.type === "jardin");
    data.majestes = data.items.filter((item) => item.type === "majeste");

    data.atouts = data.items.filter((item) => item.type === "atout");
    data.dragons = data.items.filter((item) => item.type === "dragon");
    data.pouvoirs = data.items.filter((item) => item.type === "pouvoir");

    data.descriptionHtml = await TextEditor.enrichHTML(this.actor.system.description, { async: false });
    data.notesHtml = await TextEditor.enrichHTML(this.actor.system.notes, { async: false });

    data.peutRegenerer = this.actor.system.etatSante !== "indemne" && this.actor.canRegenerate;

    data.isArchonteRoi = this.actor.isArchonteRoi;
    data.isLige = this.actor.isLige;
    data.isHumain = this.actor.isHumain;

    data.unlocked = this.actor.isUnlocked;

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

    // Lock/Unlock la fiche
    html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

    // Régénérer des cases de vie en dépensant du Karma
    html.find(".regen").click(this._onRegenerationSante.bind(this));

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

    // Carte - Atout
    html.find(".roll-atout").click(this._onCarteAtout.bind(this));
    // Carte - Dragon
    html.find(".roll-dragon").click(this._onCarteDragon.bind(this));

    // Carte - Aura
    html.find(".roll-aura").click(this._onCarteAura.bind(this));

    // Carte - Majesté
    html.find(".roll-majeste").click(this._onCarteMajeste.bind(this));

    // Carte - Verset
    html.find(".roll-verset").click(this._onCarteVerset.bind(this));

    // Changer la zone de déploiement d'une aura
    html.find(".zone-deploiement").click(this._onZoneDeploimentAura.bind(this));

    // Permet d'afficher la description
    html.find(".grid-atout .nom-atout").click(this._onItemSummary.bind(this));
    html.find(".grid-zodiaque .nom-aura").click(this._onItemSummary.bind(this));
    html.find(".grid-verset .nom-verset").click(this._onItemSummary.bind(this));
    html.find(".grid-pouvoir .nom-pouvoir").click(this._onItemSummary.bind(this));
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

  async _onCocherCaseDeVie(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let indexVie = element.dataset.index;
    const blessureValInitial = parseInt(this.actor.system.nbBlessure);
    let blessureVal;
    blessureVal = parseInt(this.actor.system.nbBlessure != indexVie ? indexVie : indexVie - 1);

    await this.actor.update({ "system.nbBlessure": blessureVal });

    // Gestion de la douleur pour une nouvelle blessure
    if (blessureVal > blessureValInitial && this.actor.system.etatSante === "blesse") {
      // Recherche des combats éventuels
      for (const combat of game.combats) {
        let combatant = combat.turns.find((c) => c.actorId === this.actor.id && c.initiative !== null);
        if (combatant !== undefined) {
          const newInitiative = Math.max((combatant.initiative -= 3), 0);
          combatant.update({ initiative: newInitiative });
        }
      }
    }
  }

  async _onRegenerationSante(event) {
    event.preventDefault();

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
    } else if (this.actor.type === "pnj") {
      if (this.actor.system.sousType === "archonteRoi" || this.actor.system.sousType === "lige") {
        typeKarma = "tenebre";
      } else return;
    }

    let karmaDisponible = this.actor.karmaDisponible(typeKarma);
    let activationOk = false;

    // Pas assez de Karma
    if (karmaDisponible == 0) {
      ui.notifications.warn("Vous n'avez pas assez de Karma disponible pour utiliser la régénération !");
      return;
    }

    // Elohim du 3ieme décan du zodiaque
    if (this.actor.isTrinite && this.actor.affLvl("zodiaque") >= 3) {
      await DepenseKarmaFormApplication.open(this.actor, this.actor.system.trinite, typeKarma, "regen", 1, null);
      activationOk = true;
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
      await DepenseKarmaFormApplication.open(this.actor, this.actor.system.trinite, typeKarma, "regen", 1, null);
      activationOk = true;
    }

    if (activationOk) {
      this.actor.regeneration();
    }
  }

  async _onZoneDeploimentAura(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = event.currentTarget.dataset;

    let auraId = dataset.itemId;
    const aura = this.actor.items.get(auraId);
    let zone = dataset.zone;

    if (aura.system.deploiement === "cosme" && zone === "cosme") {
      return;
    }

    // Exception pour le MJ qui clic avec Shift : pas de contôle, pas de dépense de Karma
    if (event.shiftKey && game.user.isGM) {
      if (aura) {
        return await aura.update({ "system.deploiement": zone });
      }
    }

    // Pour une trinité, contrôle du nombre d'aura, sauf pour une affinité du Zodiaque de décan 2 ou 3
    if (this.actor.isTrinite && this.actor.affLvl("zodiaque") > 1) {
      // Ne rien faire
    } else {
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
      type: "competence",
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

  _onCarteDragon(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Chat.carteDragon({
      actor: this.actor,
      dragonId: dataset.itemId,
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

  _onCarteMajeste(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;

    Chat.carteMajeste({
      actor: this.actor,
      majesteId: dataset.itemId,
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
      name: item.name,
      competence: item.system.competence,
      degats: item.system.degats,
      portee: item.system.portee,
      particularites: item.system.particularites,
      epee: item.system.epee,
    };

    const signe = item.system.competence === "tir" ? "sagittaire" : "belier";

    Roll.jetCompetence({
      actor: this.actor,
      signe: signe,
      competence: arme.competence,
      arme: arme,
      type: "arme",
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
        let div;
        if (item.type === "majeste") {
          div = $(`<div class="item-summary">${item.system.manifestation}<br />${item.system.effet}</div>`);
        } else {
          div = $(`<div class="item-summary">${item.system.description}</div>`);
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
