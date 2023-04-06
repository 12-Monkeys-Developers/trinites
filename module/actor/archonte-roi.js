import TrinitesActor from "./actor.js";

export default class TrinitesArchonteRoi extends TrinitesActor {
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
     * Calcul de la base des compétences : base = baseMetier + points de Création du métier + bonus de la Vie Antérieure + niveau obtenu par l'expérience
     */
    for (let [keySigne, compsSigne] of Object.entries(system.competences)) {
      for (let [keyComp, competence] of Object.entries(compsSigne)) {
        system.competences[keySigne][keyComp].base +=
          system.competences[keySigne][keyComp].baseMetier +
          system.competences[keySigne][keyComp].pointsCrea +
          system.competences[keySigne][keyComp].bonusVA +
          system.competences[keySigne][keyComp].pointsExp;
      }
    }

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

    /* Calcul de la valeur de Karma */

    //recalcul des valeurs de karma afin qu'elles ne dépasent pas le max
    if (system.archonteRoi.karma.value > system.archonteRoi.karma.max) {
      system.archonteRoi.karma.value = system.archonteRoi.karma.max;
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

    /*-----------------------------------
            ---- Calcul des valeurs de sante ----
            -----------------------------------*/

    // Points de vie maxi
    system.ligneVie1 = system.pointsLigneVie;
    system.ligneVie2 = system.pointsLigneVie * 2;
    system.nbPointsVieMax = system.pointsLigneVie * 3;

    //Etat de santé
    if (system.nbBlessure == 0) {
      system.etatSante = "indemne";
    } else if (system.nbBlessure <= system.ligneVie1) {
      system.etatSante = "endolori";
    } else if (system.nbBlessure <= system.ligneVie2) {
      system.etatSante = "blesse";
    } else {
      system.etatSante = "inconscient";
    }
  }

  /**
   * Nombre de points de Karma disponible du type donné (Lumière ou Ténèbre)
   * @param {*} typeKarma
   * @returns
   */
  karmaDisponible(typeKarma) {
    let data = this.system;
    let karmaDisponible = 0;
    if (typeKarma != "lumiere") {
      karmaDisponible += data.archonteRoi.karma.value;
    }
    return karmaDisponible;
  }

  // Cout du pouvoir selon l'Affinité du personnage
  coutPouvoir(typePouvoir) {
    return 1;
  }

  // renvoi le code de la source de Karma si elle est la seule à contenir des points, sinon null
  sourceUnique(typeKarma) {
    return "archonteRoi";
  }

  // Vide toutes les sources de Karma (Esprit et Adam) du type donné
  viderKarma(typeKarma) {
    this.update({ "system.archonteRoi.karma.value": 0 });
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
      case "archonteRoi":
        this.update({ "system.archonteRoi.karma.value": data.archonteRoi.karma.value - coutPouvoir });
        break;
    }
  }

  // Mise à jour de la réserve de karma du type donné à la valeur cible
  majKarma(reserve, valeur) {
    this.update({ "system.archonteRoi.karma.value": valeur });
  }

  regeneration() {
    let data = this.system;

    let blessureVal = Math.max(data.nbBlessure - 4, 0);
    this.update({ "system.nbBlessure": blessureVal });
  }

  get hasMetier() {
    return false;
  }

  get hasVieAnterieure() {
    return false;
  }

  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
    return false;
  }

  changeDomaineEtatEpuise(domaineId, statut) {
    const domaine = this.items.get(domaineId);
    if (domaine) domaine.update({ "system.epuise": statut });
  }
}
