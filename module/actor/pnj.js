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

  get nbDes() {
    return this.system.nbDes ?? 1;
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
    return 1;
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
