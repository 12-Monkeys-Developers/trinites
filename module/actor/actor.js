export default class TrinitesActor extends Actor {
  prepareData() {
    super.prepareData();
  }

  /**
   * Nombre de points de Karma disponible du type donné (Lumière ou Ténèbre)
   * @param {*} typeKarma
   * @returns
   */
  karmaDisponible(typeKarma) {
    let data = this.system;
    let karmaDisponible = 0;

    if (this.type === "trinite") {
      if (typeKarma === "neutre") {
        karmaDisponible += data.trinite.deva.karma.value;
        karmaDisponible += data.trinite.archonte.karma.value;
        karmaDisponible += data.trinite.adam.karma.value;
      } else {
        if (typeKarma === "lumiere") {
          karmaDisponible += data.trinite.deva.karma.value;
        } else if (typeKarma === "tenebre") {
          karmaDisponible += data.trinite.archonte.karma.value;
        }

        // Si le Karma de l'Adam' correspond au type de Karma
        if (typeKarma === data.trinite.adam.karma.type) {
          karmaDisponible += data.trinite.adam.karma.value;
        }
      }
    } else if (this.type === "archonteRoi") {
      if (typeKarma != "lumiere") {
        karmaDisponible += data.archonteRoi.karma.value;
      }
    }

    return karmaDisponible;
  }

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
}
