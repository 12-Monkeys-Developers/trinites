import { carteVersetActive } from "../common/chat.js";
import DepenseKarmaFormApplication from "../appli/DepenseKarmaFormApp.js";
export default class TrinitesActor extends Actor {
  prepareData() {
    super.prepareData();

    let system = this.system;
     /*--- Calcul des valeurs de sante ---*/

    // Points de vie max
    system.ligneVie1 = system.pointsLigneVie;   
    if (this.system.nbLigneVie === 1) system.nbPointsVieMax = system.ligneVie1;
    
    if (this.system.nbLigneVie > 1) system.ligneVie2 = system.pointsLigneVie * 2;
    if (this.system.nbLigneVie === 2) system.nbPointsVieMax = system.ligneVie2;

    if (this.system.nbLigneVie > 2) system.nbPointsVieMax = system.pointsLigneVie * 3;

    // Etat de santé
    if (system.nbBlessure === 0) {
      system.etatSante = "indemne";
    } else if (system.nbBlessure <= system.ligneVie1) {
      system.etatSante = "endolori";
    } else if (system.nbBlessure <= system.ligneVie2) {
      system.etatSante = "blesse";
    } else {
      system.etatSante = "inconscient";
    }
  }

  get hasMetier() {
    return false;
  }

  get hasVieAnterieure() {
    return false;
  }

  get isTrinite() {
    return false;
  }

  get isArchonteRoi() {
    return false;
  }

  get isLige() {
    return false;
  }

  get isHumain() {
    return false;
  }

  get canRegenerate() {
    return false;
  }

  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
    return false;
  }

  get nbDes() {
    return this.system.nbDes ?? 2;
  }

  get canUseSouffle() {
    return false;
  }

  /**
   * Nombre de points de Karma disponible du type donné (Lumière ou Ténèbre)
   * @param {*} typeKarma
   * @returns
   */
  karmaDisponible(typeKarma) { }

  // Cout du pouvoir selon l'Affinité du personnage
  coutPouvoir(typePouvoir) {
    return 2;
  }

  // renvoi le code de la source de Karma si elle est la seule à contenir des points, sinon null
  sourceUnique(typeKarma) {}

  // Vide toutes les sources de Karma (Esprit et Adam) du type donné
  viderKarma(typeKarma) {}

  consommerSourceKarma(typeSource, coutPouvoir) {}

  // Mise à jour de la réserve de karma du type donné à la valeur cible
  majKarma(reserve, valeur) {}

  regeneration() {
    let blessureVal = Math.max(this.system.nbBlessure - 4, 0);
    this.update({ "system.nbBlessure": blessureVal });
  }

  changeDomaineEtatEpuise(domaineId, statut) {
    const domaine = this.items.get(domaineId);
    if (domaine) domaine.update({ "system.epuise": statut });
  }

    /**
   * 
   * @param {*} versetId 
   * @param {Object} options 
   * murmure = true si le verset a été murmuré : le coût augmente de 1
   * @returns 
   */
    async reciterVerset(versetId, options) {
      const verset = this.items.get(versetId);
      const typeKarma = verset.system.karma;
  
      const karmaDisponible = this.karmaDisponible(typeKarma);
      const coutPouvoir = this.coutPouvoir("grandLivre");
      // Verset récité à voix basse
      if (options?.murmure) coutPouvoir += 1;
  
      let activable = false;
  
      // Pas assez de Karma
      if (karmaDisponible < coutPouvoir) {
        if (options?.murmure) ui.notifications.warn("Vous n'avez pas assez de Karma disponible pour réciter ce verset à voix basse !");
        else ui.notifications.warn("Vous n'avez pas assez de Karma disponible pour réciter ce verset !");
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
      } else {
        await new DepenseKarmaFormApplication.open(this, this.system.trinite, typeKarma, "verset", coutPouvoir, versetId);
      }
  
      if (activable) {
        carteVersetActive({
          actor: this,
          versetId: versetId,
        });
      }
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
