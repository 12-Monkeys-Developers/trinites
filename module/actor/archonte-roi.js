import TrinitesActor from "./actor.js";
import DepenseKarmaFormApplication from "../appli/DepenseKarmaFormApp.js";

export default class TrinitesArchonteRoi extends TrinitesActor {
  prepareData() {
    super.prepareData();
    let system = this.system;
    /*
     * Calcul de la valeur de la compétence : valeur = base + bonus zodiacal
     */
    for (let [keySigne, compsSigne] of Object.entries(system.competences)) {
      for (let [keyComp, competence] of Object.entries(compsSigne)) {
        system.competences[keySigne][keyComp].valeur = system.competences[keySigne][keyComp].base + system.signes[keySigne].valeur;
      }
    }

    /* Calcul de la valeur de Karma */

    //recalcul des valeurs de karma afin qu'elles ne dépasent pas le max
    if (system.archonteRoi.karma.value > system.archonteRoi.karma.max) {
      system.archonteRoi.karma.value = system.archonteRoi.karma.max;
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

  get isArchonteRoi() {
    return true;
  }

  get canRegenerate() {
    return true;
  }
  
  /**
   * Nombre de points de Karma disponible du type donné (Lumière ou Ténèbre)
   * @param {*} typeKarma
   * @returns
   */
  karmaDisponible(typeKarma) {
    let karmaDisponible = 0;
    if (typeKarma != "lumiere") {
      karmaDisponible += this.system.archonteRoi.karma.value;
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
      case "archonteRoi":
        this.update({ "system.archonteRoi.karma.value": data.archonteRoi.karma.value - coutPouvoir });
        break;
    }
  }

  // Mise à jour de la réserve de karma du type donné à la valeur cible
  majKarma(reserve, valeur) {
    this.update({ "system.archonteRoi.karma.value": valeur });
  }

  /**
   * 
   * @param {*} auraId 
   * @param {Object} options 
   */
  async activerAura(auraId, options) {
    const aura = this.items.get(auraId);

    // Aura déjà déployée - test par sécurité
    if (aura.system.deploiement != "cosme") {
      ui.notifications.warn("Cette aura est déjà déployée !");
      return null;
    }

    const typeKarma = "neutre";

    const karmaDisponible = this.karmaDisponible(typeKarma);
    const coutPouvoir = this.coutPouvoir("zodiaque");
    let activable = false;

    // Pas assez de Karma
    if (karmaDisponible < coutPouvoir) {
      ui.notifications.warn("Vous n'avez pas assez de Karma disponible pour déployer cette aura !");
      return;
    }
    // Juste ce qu'il faut de Karma
    else if (karmaDisponible == coutPouvoir) {
      this.viderKarma(typeKarma);
      activable = true;
    }
    // Uniquement le Karma d'une source
    else if (this.sourceUnique(typeKarma)) {
      this.consommerSourceKarma(this.sourceUnique(typeKarma), coutPouvoir);
      activable = true;
    } 
    else {
      activable = await DepenseKarmaFormApplication.open(this, this.system.trinite, typeKarma, "aura", coutPouvoir, auraId);
    }
    
    if (activable) {
      aura.update({ "data.deploiement": "corps" });

      // MAJ de la carte
      return {
        "title": `Vous avez déployé l'aura '${aura.name}'`,
        "classList": "deployee",
        "zone": "Corps"
      }
    }
    return null;

  }
}
