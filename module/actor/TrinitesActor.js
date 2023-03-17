export default class TrinitesActor extends Actor {
  prepareData() {
    super.prepareData();
    let system = this.system;

    let pointsCreDepenses = 0;

    if (this.type == "trinite") {
      /*
       * Bonus de 1 pour les 3 compétences de la vierge et dans Langues
       */
      system.competences.vierge.clairvoyance.base = 1;
      system.competences.vierge.emprise.base = 1;
      system.competences.vierge.meditation.base = 1;
      system.competences.poisson.langues.base = 1;
    }

    if (this.type == "trinite" || this.type == "archonteRoi") {
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
      if (this.type == "trinite") {
        for (let [keySigne, compsSigne] of Object.entries(system.competences)) {
          for (let [keyComp, competence] of Object.entries(compsSigne)) {
            // Compétence de métier
            if (system.competences[keySigne][keyComp].baseMetier == 6) {
              if (system.competences[keySigne][keyComp].pointsCrea > 0) system.competences[keySigne][keyComp].pointsCrea = 0;
            }
            // Les autres
            else {
              // Competence par défaut
              if (["clairvoyance", "emprise", "meditation", "base"].includes(keyComp)) {
                if (system.competences[keySigne][keyComp].pointsCrea > 4) system.competences[keySigne][keyComp].pointsCrea = 4;
              } else if (system.competences[keySigne][keyComp].pointsCrea > 5) system.competences[keySigne][keyComp].pointsCrea = 5;
            }
            if (system.competences[keySigne][keyComp].pointsCrea < 0) system.competences[keySigne][keyComp].pointsCrea = 0;
          }
          
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

      if (this.type == "trinite") {
        /*
         * Calcul des points de création dépensés pour les compétences
         */

        for (let [keySigne, compsSigne] of Object.entries(system.competences)) {
          for (let [keyComp, competence] of Object.entries(compsSigne)) {
            pointsCreDepenses += system.competences[keySigne][keyComp].pointsCrea;
          }
        }
        // if (system.creation.totale > 0) system.creation.disponible = system.creation.totale - pointsCreDepenses;
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
    }

    if (this.type == "trinite") {
      /* Calcul des valeurs de Karma */

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
    }

    if (this.type == "archonteRoi") {
      /* Calcul de la valeur de Karma */

      //recalcul des valeurs de karma afin qu'elles ne dépasent pas le max
      if (system.archonteRoi.karma.value > system.archonteRoi.karma.max) {
        system.archonteRoi.karma.value = system.archonteRoi.karma.max;
      }
    }

    /*
     * Calcul des valeurs de ressources : valeur = baseMetier + points de Création du métier + points obtenus par l'expérience
     */
    if (system.ressources.richesse.pointsCrea < 0) system.ressources.richesse.pointsCrea = 0;
    if (system.ressources.reseau.pointsCrea < 0) system.ressources.reseau.pointsCrea = 0;
    if (system.ressources.influence.pointsCrea < 0) system.ressources.influence.pointsCrea = 0;

    system.ressources.richesse.valeur = parseInt(system.ressources.richesse.baseMetier) + system.ressources.richesse.pointsCrea + system.ressources.richesse.pointsExp;
    system.ressources.reseau.valeur = parseInt(system.ressources.reseau.baseMetier) + system.ressources.reseau.pointsCrea + system.ressources.reseau.pointsExp;
    system.ressources.influence.valeur = parseInt(system.ressources.influence.baseMetier) + system.ressources.influence.pointsCrea + system.ressources.influence.pointsExp;

    if (this.type == "trinite") {
      /*
       * Calcul des points de création dépensés pour les ressources
       */
      pointsCreDepenses += 2 * system.ressources.richesse.pointsCrea;
      pointsCreDepenses += 2 * system.ressources.reseau.pointsCrea;
      pointsCreDepenses += 2 * system.ressources.influence.pointsCrea;
      if (system.creation.totale > 0) system.creation.disponible = system.creation.totale - pointsCreDepenses;
    }

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

  // Nombre de points de Karma disponible du type donné (Lumière ou Ténèbre)
  karmaDisponible(typeKarma) {
    let data = this.system;
    let karmaDisponible = 0;

    if (this.type == "trinite") {
      if (typeKarma == "neutre") {
        karmaDisponible += data.trinite.deva.karma.value;
        karmaDisponible += data.trinite.archonte.karma.value;
        karmaDisponible += data.trinite.adam.karma.value;
      } else {
        if (typeKarma == "lumiere") {
          karmaDisponible += data.trinite.deva.karma.value;
        } else if (typeKarma == "tenebre") {
          karmaDisponible += data.trinite.archonte.karma.value;
        }

        if (typeKarma == data.trinite.adam.karma.type) {
          karmaDisponible += data.trinite.adam.karma.value;
        }
      }
    } else if (this.type == "archonteRoi") {
      if (typeKarma != "lumiere") {
        karmaDisponible += data.archonteRoi.karma.value;
      }
    }

    return karmaDisponible;
  }

  // Cout du pouvoir selon l'Affinité du personnage
  coutPouvoir(typePouvoir) {
    let data = this.system;
    if (this.type == "archonteRoi") {
      return 1;
    } else if (this.type == "trinite") {
      if (data.themeAstral.affinite == typePouvoir) {
        return 1;
      } else {
        return 2;
      }
    } else {
      return 2;
    }
  }

  // renvoi le code de la source de Karma si elle est la seule à contenir des points, sinon null
  sourceUnique(typeKarma) {
    let data = this.system;
    let source = null;

    if (this.type == "trinite") {
      if (typeKarma == "lumiere") {
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
      } else if (typeKarma == "tenebre") {
        if (typeKarma != data.trinite.adam.karma.type) {
          source = "archonte";
        } else {
          if (data.trinite.adam.karma.value == 0) {
            source = "archonte";
          }
          if (data.trinite.archonte.karma.value == 0) {
            source = "adam";
          }
        }
      } else if (typeKarma == "neutre") {
        if (data.trinite.deva.karma.value != 0 && data.trinite.adam.karma.value == 0 && data.trinite.archonte.karma.value == 0) {
          source = "deva";
        } else if (data.trinite.adam.karma.value != 0 && data.trinite.archonte.karma.value == 0 && data.trinite.deva.karma.value == 0) {
          source = "adam";
        } else if (data.trinite.archonte.karma.value != 0 && data.trinite.deva.karma.value == 0 && data.trinite.adam.karma.value == 0) {
          source = "archonte";
        }
      }
    } else if (this.type == "archonteRoi") {
      source = "archonteRoi";
    }

    return source;
  }

  // Vide toutes les sources de Karma (Esprit et Adam) du type donné
  viderKarma(typeKarma) {
    let data = this.system;

    if (this.type == "trinite") {
      if (typeKarma == "neutre") {
        this.update({ "system.trinite.deva.karma.value": 0 });
        this.update({ "system.trinite.archonte.karma.value": 0 });
        this.update({ "system.trinite.adam.karma.value": 0 });
      }
      if (typeKarma == "lumiere") {
        this.update({ "system.trinite.deva.karma.value": 0 });
      } else if (typeKarma == "tenebre") {
        this.update({ "system.trinite.archonte.karma.value": 0 });
      }

      if (typeKarma == data.trinite.adam.karma.type) {
        this.update({ "system.trinite.adam.karma.value": 0 });
      }
    } else if (this.type == "archonteRoi") {
      this.update({ "system.archonteRoi.karma.value": 0 });
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
      case "archonteRoi":
        this.update({ "system.archonteRoi.karma.value": data.archonteRoi.karma.value - coutPouvoir });
        break;
    }
  }

  // Mise à jour de la réserve de karma du type donné à la valeur cible
  majKarma(reserve, valeur) {
    if (this.type == "trinite") {
      let reserveData = `system.trinite.${reserve}.karma.value`;
      this.update({ [reserveData]: valeur });
    } else if (this.type == "archonteRoi") {
      this.update({ "system.archonteRoi.karma.value": valeur });
    }
  }

  regeneration() {
    let data = this.system;

    let blessureVal = Math.max(data.nbBlessure - 4, 0);
    this.update({ "system.nbBlessure": blessureVal });
  }

  get hasMetier() {
    if (this.type == "trinite") {
      if (this.items.find((i) => i.type == "metier")) return true;
    }
    return false;
  }

  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
    return false;
  }
}
