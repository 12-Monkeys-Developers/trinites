import TrinitesActor from "./actor.js";

export default class TrinitesHumain extends TrinitesActor {
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

  get isHumain() {
    return true;
  }

  /**
   * Nombre de points de Karma disponible du type donné (Lumière ou Ténèbre)
   * @param {*} typeKarma
   * @returns
   */
  karmaDisponible(typeKarma) {
    return 0;
  }

  // Cout du pouvoir selon l'Affinité du personnage
  coutPouvoir(typePouvoir) {
    return null;
  }

  // renvoi le code de la source de Karma si elle est la seule à contenir des points, sinon null
  sourceUnique(typeKarma) {
    return null;
  }

  // Vide toutes les sources de Karma (Esprit et Adam) du type donné
  viderKarma(typeKarma) {
    return null;
  }

  consommerSourceKarma(typeSource, coutPouvoir) {
    return null;
  }

  // Mise à jour de la réserve de karma du type donné à la valeur cible
  majKarma(reserve, valeur) {
    return null;
  }

}
