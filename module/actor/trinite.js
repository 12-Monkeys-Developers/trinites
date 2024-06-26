import TrinitesActor from "./actor.js";
import DepenseKarmaFormApplication from "../appli/DepenseKarmaFormApp.js";

export default class TrinitesTrinite extends TrinitesActor {
  prepareData() {
    super.prepareData();
    let system = this.system;

    let pointsCreDepenses = 0;

    /*
     *  Calcul des bonus de Signes
     */

    for (let [keySigne, signe] of Object.entries(system.signes)) {
      if (system.themeAstral.archetype == keySigne) {
        signe.valeur = 6;
      } else if (system.themeAstral.ascendant1 == keySigne || system.themeAstral.ascendant2 == keySigne) {
        signe.valeur = 4;
      } else if (system.themeAstral.descendant1 == keySigne || system.themeAstral.descendant2 == keySigne || system.themeAstral.descendant3 == keySigne) {
        signe.valeur = 2;
      } else {
        signe.valeur = 0;
      }
    }

    /*
     * Vérification du max des points de création
     */

    for (let [keySigne, compsSigne] of Object.entries(system.competences)) {
      for (let [keyComp, competence] of Object.entries(compsSigne)) {
        // Compétence de métier
        if (system.competences[keySigne][keyComp].baseMetier === 6) {
          if (system.competences[keySigne][keyComp].pointsCrea > 0) system.competences[keySigne][keyComp].pointsCrea = 0;
        }
        // Les autres
        else {
          // Competence par défaut
          const max = ["clairvoyance", "emprise", "meditation", "langues", "base"].includes(keyComp) ? 4 : 5;
          if (system.competences[keySigne][keyComp].pointsCrea > max) system.competences[keySigne][keyComp].pointsCrea = max;
        }
        if (system.competences[keySigne][keyComp].pointsCrea < 0) system.competences[keySigne][keyComp].pointsCrea = 0;
      }
    }

    /*
     * Calcul de la base des compétences : base = baseMetier + points de Création du métier + bonus de la Vie Antérieure + niveau obtenu par l'expérience
     * Bonus de 1 pour les 3 compétences de la vierge et dans Langues
     */
    for (let [keySigne, compsSigne] of Object.entries(system.competences)) {
      for (let [keyComp, competence] of Object.entries(compsSigne)) {
        system.competences[keySigne][keyComp].base =
          (["clairvoyance","emprise","meditation","langues"].includes(keyComp) ? 1 : 0) +
          system.competences[keySigne][keyComp].baseMetier +
          system.competences[keySigne][keyComp].pointsCrea +
          system.competences[keySigne][keyComp].bonusVA +
          system.competences[keySigne][keyComp].pointsExp;
      }
    }

    /*
     * Calcul des points de création dépensés pour les compétences
     */

    for (let [keySigne, compsSigne] of Object.entries(system.competences)) {
      for (let [keyComp, competence] of Object.entries(compsSigne)) {
        pointsCreDepenses += system.competences[keySigne][keyComp].pointsCrea;
      }
    }
    // if (system.creation.totale > 0) system.creation.disponible = system.creation.totale - pointsCreDepenses;

    /*
     * Calcul de la valeur de la compétence : valeur = base + bonus zodiacal
     */
    for (let [keySigne, compsSigne] of Object.entries(system.competences)) {
      for (let [keyComp, competence] of Object.entries(compsSigne)) {
        if (system.competences[keySigne][keyComp].ouverte) {
          system.competences[keySigne][keyComp].valeur = system.competences[keySigne][keyComp].base + system.signes[keySigne].valeur;
        } else {
          if (system.competences[keySigne][keyComp].base > 0) {
            system.competences[keySigne][keyComp].valeur = system.competences[keySigne][keyComp].base + system.signes[keySigne].valeur;
          } else {
            system.competences[keySigne][keyComp].valeur = 0;
          }
        }
      }
    }

    /* Calcul des valeurs de Karma */

    // Calcul du max
    system.trinite.deva.karma.max = system.trinite.deva.karma.base + system.trinite.deva.karma.bonusVA;
    system.trinite.archonte.karma.max = system.trinite.archonte.karma.base + system.trinite.archonte.karma.bonusVA;

    // Recalcul des valeurs de karma afin qu'elles ne dépasent pas le max
    if (system.trinite.deva.karma.value > system.trinite.deva.karma.max) {
      system.trinite.deva.karma.value = system.trinite.deva.karma.max;
    }
    if (system.trinite.archonte.karma.value > system.trinite.archonte.karma.max) {
      system.trinite.archonte.karma.value = system.trinite.archonte.karma.max;
    }

    // La valeur de Karma de l'adam est calculée en fonction des valeurs du Deva et de l'Archonte
    system.trinite.adam.karma.max = Math.abs(system.trinite.deva.karma.max - system.trinite.archonte.karma.max);
    if (system.trinite.adam.karma.value > system.trinite.adam.karma.max) {
      system.trinite.adam.karma.value = system.trinite.adam.karma.max;
    }

    // Son type dépend du plus fort des deux
    if (system.trinite.adam.karma.max == 0) {
      system.trinite.adam.karma.type = "";
    } else {
      system.trinite.adam.karma.type = system.trinite.deva.karma.max > system.trinite.archonte.karma.max ? "lumiere" : "tenebre";
    }

    /* Divers */

    if (system.experience.disponible > system.experience.totale) {
      system.experience.disponible = system.experience.totale;
    }

    /*
     * Calcul des valeurs de ressources : valeur = baseMetier + points de Création du métier + points obtenus par l'expérience
     */
    if (system.ressources.richesse.pointsCrea < 0) system.ressources.richesse.pointsCrea = 0;
    if (system.ressources.reseau.pointsCrea < 0) system.ressources.reseau.pointsCrea = 0;
    if (system.ressources.influence.pointsCrea < 0) system.ressources.influence.pointsCrea = 0;

    system.ressources.richesse.valeur =
      parseInt(system.ressources.richesse.baseMetier) + system.ressources.richesse.pointsCrea + system.ressources.richesse.bonusVA + system.ressources.richesse.pointsExp;
    system.ressources.reseau.valeur =
      parseInt(system.ressources.reseau.baseMetier) + system.ressources.reseau.pointsCrea + system.ressources.reseau.bonusVA + system.ressources.reseau.pointsExp;
    system.ressources.influence.valeur =
      parseInt(system.ressources.influence.baseMetier) + system.ressources.influence.pointsCrea + system.ressources.influence.bonusVA + system.ressources.influence.pointsExp;

    /*
     * Calcul des points de création dépensés pour les ressources
     */
    pointsCreDepenses += 2 * system.ressources.richesse.pointsCrea;
    pointsCreDepenses += 2 * system.ressources.reseau.pointsCrea;
    pointsCreDepenses += 2 * system.ressources.influence.pointsCrea;
    if (system.creation.totale > 0) system.creation.disponible = system.creation.totale - pointsCreDepenses;

    // L'influence ne peut dépasser la valeur de réseau
    if (system.ressources.influence.valeur > system.ressources.reseau.valeur) {
      system.ressources.influence.valeur = system.ressources.reseau.valeur;
    }

    // Les diminutions ne peuvent dépasser le score de ressource
    if (system.ressources.richesse.diminution > system.ressources.richesse.valeur) {
      system.ressources.richesse.diminution = system.ressources.richesse.valeur;
    }

    if (system.ressources.influence.diminution > system.ressources.influence.valeur) {
      system.ressources.influence.diminution = system.ressources.influence.valeur;
    }

    if (system.ressources.reseau.diminution > system.ressources.reseau.valeur) {
      system.ressources.reseau.diminution = system.ressources.reseau.valeur;
    }
  }

  get hasMetier() {
    if (this.items.find((i) => i.type === "metier")) return true;
    return false;
  }

  get hasVieAnterieure() {
    if (this.items.find((i) => i.type === "vieAnterieure")) return true;
    return false;
  }

  get metierId() {
    return this.hasMetier ? this.items.find((i) => i.type === "metier")._id : null;
  }

  get vieAnterieureId() {
    return this.hasVieAnterieure ? this.items.find((i) => i.type === "vieAnterieure")._id : null;
  }

  get isTrinite() {
    return true;
  }

  get canRegenerate() {
    return true;
  }

  get sousType() {
    return "trinite";
  }

  get canUseSouffle() {
    return this.system.themeAstral.affinite === "zodiaque";
  }

  get adamTypeKarma() {
    return this.system.trinite.adam.karma.type;
  }

  affLvl(affinite) {
    if (this.system.themeAstral.affinite === affinite) return parseInt(this.system.themeAstral.affiniteDecan);
    else if (this.system.themeAstral.affinite2 === affinite) return parseInt(this.system.themeAstral.affinite2Decan);
    else if (this.system.themeAstral.affinite3 === affinite) return parseInt(this.system.themeAstral.affinite3Decan);
    return 0;
  }

  /**
   * Nombre de points de Karma disponible du type donné (Lumière ou Ténèbre)
   * @param {*} typeKarma
   * @returns
   */
  karmaDisponible(typeKarma) {
    let data = this.system;
    let karmaDisponible = 0;

    if (typeKarma === "dragon") {
      karmaDisponible += data.lameSoeur.dragon.karmaLumiere.value;
    } 
    else {
      if (typeKarma === "neutre") {
        karmaDisponible += data.trinite.deva.karma.value + data.trinite.archonte.karma.value + data.trinite.adam.karma.value;
      } 
      else {
        if (typeKarma === "lumiere") {
          karmaDisponible += data.trinite.deva.karma.value;
        } 
        else if (typeKarma === "tenebre") {
          karmaDisponible += data.trinite.archonte.karma.value;
        }
        // Si le Karma de l'Adam' correspond au type de Karma
        if (typeKarma === data.trinite.adam.karma.type) {
          karmaDisponible += data.trinite.adam.karma.value;
        }        
      }
      // Karma Elohim
      if (this.affLvl("zodiaque") >= 3) {
        karmaDisponible += data.zodiaque.karmaElohim.value;
      }
    }
    return karmaDisponible;
  }

  // Cout du pouvoir selon l'Affinité du personnage
  coutPouvoir(typePouvoir) {
    if (this.system.themeAstral.affinite === typePouvoir) return 1;
    return 2;
  }

  // renvoi le code de la source de Karma si elle est la seule à contenir des points, sinon null
  sourceUnique(typeKarma) {
    let data = this.system;
    let source = null;

    if (typeKarma === "lumiere") {
      if (typeKarma != data.trinite.adam.karma.type) {
        source = "deva";
      } else {
        if (data.trinite.adam.karma.value == 0) {
          source = "deva";
        }
        if (data.trinite.deva.karma.value == 0) {
          source = "adam";
        }
      }
    } else if (typeKarma === "tenebre") {
      if (typeKarma != data.trinite.adam.karma.type) {
        source = "archonte";
      } else {
        if (data.trinite.adam.karma.value === 0) {
          source = "archonte";
        }
        if (data.trinite.archonte.karma.value == 0) {
          source = "adam";
        }
      }
    } else if (typeKarma === "neutre") {
      if (data.trinite.deva.karma.value != 0 && data.trinite.adam.karma.value == 0 && data.trinite.archonte.karma.value == 0) {
        source = "deva";
      } else if (data.trinite.adam.karma.value != 0 && data.trinite.archonte.karma.value == 0 && data.trinite.deva.karma.value == 0) {
        source = "adam";
      } else if (data.trinite.archonte.karma.value != 0 && data.trinite.deva.karma.value == 0 && data.trinite.adam.karma.value == 0) {
        source = "archonte";
      }
    }

    return source;
  }

  // Vide toutes les sources de Karma (Esprit et Adam) du type donné
  /**
   *
   * @param {*} typeKarma
   */
  viderKarma(typeKarma) {
    let data = this.system;

    if (typeKarma === "neutre") {
      this.update({ "system.trinite.deva.karma.value": 0 });
      this.update({ "system.trinite.archonte.karma.value": 0 });
      this.update({ "system.trinite.adam.karma.value": 0 });
    } else if (typeKarma === "lumiere") {
      this.update({ "system.trinite.deva.karma.value": 0 });
    } else if (typeKarma === "tenebre") {
      this.update({ "system.trinite.archonte.karma.value": 0 });
    } else if (typeKarma === "dragon") {
      this.update({ "system.lameSoeur.dragon.karmaLumiere.value": 0 });
    } else if (typeKarma === "elohim") {
      this.update({ "system.zodiaque.karmaElohim.value": 0 });
    }

    if (typeKarma === data.trinite.adam.karma.type) {
      this.update({ "system.trinite.adam.karma.value": 0 });
    }
  }

  consommerSourceKarma(typeSource, coutPouvoir) {
    let data = this.system;

    switch (typeSource) {
      case "adam":
        this.update({ "system.trinite.adam.karma.value": data.trinite.adam.karma.value - coutPouvoir });
        break;
      case "deva":
        this.update({ "system.trinite.deva.karma.value": data.trinite.deva.karma.value - coutPouvoir });
        break;
      case "archonte":
        this.update({ "system.trinite.archonte.karma.value": data.trinite.archonte.karma.value - coutPouvoir });
        break;
      case "dragon":
        this.update({ "system.lameSoeur.dragon.karmaLumiere.value": data.lameSoeur.dragon.karmaLumiere.value - coutPouvoir });
        break;
      case "elohim":
        this.update({ "system.zodiaque.karmaElohim.value": data.zodiaque.karmaElohim.value - coutPouvoir });
        break;
    }
  }

  // Mise à jour de la réserve de karma du type donné à la valeur cible
  majKarma(reserve, valeur) {
    if (reserve === "elohim") {
      this.update({ "system.zodiaque.karmaElohim.value": valeur });
    } else {
      let reserveData = `system.trinite.${reserve}.karma.value`;
      this.update({ [reserveData]: valeur });
    }
  }

  /**
   * Ajoute le nom et les bonus d'une vie antérieure
   * @param {Object*} va itemData from Drag n Drop
   */
  async ajouterVieAnterieure(va) {
    const updateObj = {};

    updateObj["system.vieAnterieure"] = va.name;

    this._updateBonus(va.system.bonus1, updateObj);
    this._updateBonus(va.system.bonus2, updateObj);
    this._updateBonus(va.system.bonus3, updateObj);

    this.update(updateObj);

    await this.createEmbeddedDocuments("Item", [va]);
  }

  /**
   * Supprime le nom et les bonus de la vie antérieure
   */
  async supprimerVieAnterieure() {
    const va = this.items.find((i) => i.type === "vieAnterieure");

    const updateObj = {};
    updateObj["system.vieAnterieure"] = "";

    this._updateBonus(va.system.bonus1, updateObj, true);
    this._updateBonus(va.system.bonus2, updateObj, true);
    this._updateBonus(va.system.bonus3, updateObj, true);

    this.update(updateObj);

    await this.deleteEmbeddedDocuments("Item", [va._id]);
  }

  /**
   *
   * @param {Object} bonusInfo {type, valeur}
   * @param {*} updateObj
   * @param {*} reset true pour remettre la valeur à 0
   */
  _updateBonus(bonusInfo, updateObj, reset = false) {
    let bonus = null;
    const bonusType = bonusInfo.type;
    if (bonusType !== "aucun") {
      if (["influence", "richesse", "reseau"].includes(bonusType)) {
        bonus = `system.ressources.${bonusType}.bonusVA`;
      } else if (bonusType === "karma-lumiere" || bonusType === "karmalumiere") {
        bonus = "system.trinite.deva.karma.bonusVA";
      } else if (bonusType === "karma-tenebres" || bonusType === "karmatenebres") {
        bonus = "system.trinite.archonte.karma.bonusVA";
      } else {
        bonus = `system.competences.${bonusType}.bonusVA`;
      }
    }
    if (bonus !== null) {
      updateObj[bonus] = reset ? 0 : bonusInfo.valeur;
    }
  }

  /**
   * Ajoute le nom et les bonus d'un métier
   * @param {Object*} metier itemData from Drag n Drop
   */
  async ajouterMetier(metier) {
    const updateObj = {};

    updateObj["system.metier"] = metier.name;

    updateObj[`system.competences.${metier.system.competence1}.baseMetier`] = 6;
    updateObj[`system.competences.${metier.system.competence2}.baseMetier`] = 6;
    updateObj[`system.competences.${metier.system.competence3}.baseMetier`] = 6;

    updateObj["system.ressources.richesse.baseMetier"] = metier.system.richesse;
    updateObj["system.ressources.reseau.baseMetier"] = metier.system.reseau;
    updateObj["system.ressources.influence.baseMetier"] = metier.system.influence;

    updateObj["system.creation.totale"] = metier.system.pc;
    updateObj["system.creation.disponible"] = metier.system.pc;

    this.update(updateObj);

    // Création des domaines
    const domaines = metier.system.listeDomaines;

    if (domaines !== "") {
      let liste = domaines.split(",");
      for (const domaine of liste) {
        await this.createEmbeddedDocuments("Item", [{ type: "domaine", name: domaine }]);
      }

      const nbDomaines = metier.system.nbDomaines;
      const domainesRestant = nbDomaines - liste.length;

      for (let index = 0; index < domainesRestant; index++) {
        await this.createEmbeddedDocuments("Item", [{ type: "domaine", name: "?" }]);
      }
    }

    await this.createEmbeddedDocuments("Item", [metier]);
  }

  /**
   * Supprime le nom et les bonus du métier
   */
  async supprimerMetier() {
    const metier = this.items.find((i) => i.type === "metier");

    const comp1 = `system.competences.${metier.system.competence1}.baseMetier`;
    const comp2 = `system.competences.${metier.system.competence2}.baseMetier`;
    const comp3 = `system.competences.${metier.system.competence3}.baseMetier`;
    const met = "system.metier";

    const updateObj = {};
    updateObj[comp1] = 0;
    updateObj[comp2] = 0;
    updateObj[comp3] = 0;
    updateObj[met] = "";

    updateObj["system.ressources.richesse.baseMetier"] = 0;
    updateObj["system.ressources.reseau.baseMetier"] = 0;
    updateObj["system.ressources.influence.baseMetier"] = 0;

    updateObj["system.creation.totale"] = 0;
    updateObj["system.creation.disponible"] = 0;
    updateObj["system.creation.finie"] = false;

    // Mise à jour des informations de l'acteur
    this.update(updateObj);

    // Suppression des domaines
    const domainesId = this.items.filter((i) => i.type === "domaine").map((i) => i._id);
    await this.deleteEmbeddedDocuments("Item", domainesId);

    // Suppression du métier
    await this.deleteEmbeddedDocuments("Item", [metier._id]);
  }

  regenereKarmaLumiere() {
    this.majKarma("deva", this.system.trinite.deva.karma.max);
    if (this.adamTypeKarma === "lumiere") this.majKarma("adam", this.system.trinite.adam.karma.max);
  }

  regenereKarmaTenebre() {
    this.majKarma("archonte", this.system.trinite.archonte.karma.max);
    if (this.adamTypeKarma === "tenebre") this.majKarma("adam", this.system.trinite.adam.karma.max);
  }
}
