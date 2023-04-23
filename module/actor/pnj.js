import TrinitesActor from "./actor.js";
import DepenseKarmaFormApplication from "../appli/DepenseKarmaFormApp.js";

export default class TrinitesPnj extends TrinitesActor {
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

    //recalcul des valeurs de karma afin qu'elles ne dépasent pas le max
    if (system.karmaLumiere.value > system.karmaLumiere.max) {
      system.karmaLumiere.value = system.karmaLumiere.max;
    }

    if (system.karmaTenebres.value > system.karmaTenebres.max) {
      system.karmaTenebres.value = system.karmaTenebres.max;
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

  get isArchonteRoi() {
    return this.system.sousType === "archonteRoi";
  }

  get isLige() {
    return this.system.sousType === "lige";
  }

  get isHumain() {
    return this.system.sousType === "humain";
  }

  get isAutre() {
    return this.system.sousType === "autre";
  }

  get nbDes() {
    return parseInt(this.system.nbDes) ?? 1;
  }

  get canRegenerate() {
    if (this.isArchonteRoi) return true;
    if (this.isLige) {
      if (this.system.etatSante === "endolori" || this.system.etatSante === "inconscient") return true;
    }    
    return false;
  }

  get sousType() {
    return this.system.sousType;
  }

  get canUseSouffle() {
    if (this.isArchonteRoi) return true;
  }

  /**
   * Nombre de points de Karma disponible du type donné (Lumière ou Ténèbre)
   * @param {*} typeKarma
   * @returns
   */
  karmaDisponible(typeKarma) {
    let karmaDisponible = 0;
    if (typeKarma === "neutre") {
      karmaDisponible += this.system.karmaLumiere.value + this.system.karmaTenebres.value;
    }
    if (typeKarma === "lumiere") {
      karmaDisponible += this.system.karmaLumiere.value;
    }
    if (typeKarma === "tenebre") {
      karmaDisponible += this.system.karmaTenebres.value;
    }
    return karmaDisponible;
  }

  // Coût du pouvoir
  coutPouvoir(typePouvoir) {
    // Aura
    if (typePouvoir === "zodiaque") {
      if (this.isArchonteRoi || this.isLige) {
        return 1;
      }
      if (this.isAutre) {
        return parseInt(this.system.cout.aura);
      }
      return 2;
    }

    // Verset
    if (typePouvoir === "grandLivre") {
      if (this.isArchonteRoi || this.isLige) {
        return 1;
      }
      if (this.isAutre) {
        return parseInt(this.system.cout.verset);
      }
      return 2;
    }
    
    return 2;
  }

  // Renvoie le code de la source de Karma si elle est la seule à contenir des points, sinon null
  sourceUnique(typeKarma) {
    let source = null;

    if (typeKarma === "lumiere") source = "deva";
    if (typeKarma === "tenebre") source = "archonte";
    
    return source;
  }

  // Vide toutes les sources de Karma (Esprit et Adam) du type donné
  viderKarma(typeKarma) {
    if (typeKarma === "lumiere") this.update({ "system.karmaLumiere.value": 0 });
    if (typeKarma === "tenebre") this.update({ "system.karmaTenebres.value": 0 });
  }

  consommerSourceKarma(typeSource, coutPouvoir) {
    if (typeSource === "deva") this.update({ "system.karmaLumiere.value": this.system.karmaLumiere.value - coutPouvoir });
    if (typeSource === "archonte") this.update({ "system.karmaTenebres.value": this.system.karmaTenebres.value - coutPouvoir });    
  }

  // Mise à jour de la réserve de karma du type donné à la valeur cible
  majKarma(reserve, valeur) {
    let reserveData = null;
    if (reserve === "deva") reserveData = `system.karmaLumiere.value`;
    if (reserve === "archonte") reserveData = `system.karmaTenebres.value`;
    if (reserveData !== null) this.update({ [reserveData]: valeur });
  }
  
}
