import { carteVersetActive } from "../common/chat.js";
export default class TrinitesActor extends Actor {
  prepareData() {
    super.prepareData();
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

  regeneration() {}

  get isUnlocked() {
    if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
    return false;
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
    reciterVerset(versetId, options) {
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
        new DepenseKarmaFormApplication(this, this.system.trinite, typeKarma, "verset", coutPouvoir, versetId).render(true);
      }
  
      if (activable) {
        carteVersetActive({
          actor: this,
          versetId: versetId,
        });
      }
    }
}
