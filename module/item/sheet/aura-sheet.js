import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesAuraSheet extends TrinitesItemSheet {
  
  getData() {
    const data = super.getData();

    const myItemData = data.data.system;

    if (this.actor) {
      // Aura liée à un personnage, donc modifiable
      myItemData.edit = true;
    } else {
      myItemData.edit = false;
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Changer la zone de déploiement d'une aura
    html.find(".zone-deploiement").click(this._onZoneDeploimentAura.bind(this));
  }

  _onZoneDeploimentAura(event) {
    event.preventDefault();
    const element = event.currentTarget;

    let auraId = element.closest(".aura").dataset.itemId;
    const aura = this.actor.items.get(auraId);
    let zone = element.dataset.zone;

    if (aura.system.deploiement == "") {
      ui.notifications.warn("Vous devez déployer l'aura avant de changer sa zone d'effet !");
      return;
    }

    // Pour une trinité, contrôle du nombre d'aura, sauf pour une affinité du Zodiaque de décan 2 ou 3
    if (this.actor.isTrinite && this.actor.voieLvl("zodiaque") > 1) {
      // Ne rien faire
    } else {
      let auraActive = false;
      if (zone != "cosme") {
        let auras = this.actor.items.filter(function (item) {
          return item.type === "aura" && item.id !== auraId;
        });
        auraActive = auras.some((autreAura) => {
          if (autreAura.system.deploiement != "cosme") {
            return true;
          }
        });
      }
  
      if (auraActive) {
        ui.notifications.warn("Vous avez une autre aura déployée au delà du Cosme !");
        return;
      }
    }

    let auraActive = false;
    if (zone != "cosme") {
      let auras = this.actor.items.filter(function (item) {
        return item.type == "aura" && item.id != auraId;
      });
      auraActive = auras.some((autreAura) => {
        if (autreAura.system.deploiement != "" && autreAura.system.deploiement != "cosme") {
          return true;
        }
      });
    }

    if (auraActive) {
      ui.notifications.warn("Vous avez une autre aura déployée au delà du Cosme !");
      return;
    }

    if (aura.system.deploiement == "cosme" && zone == "cosme") {
      aura.update({ "system.deploiement": "" });
    } else {
      aura.update({ "system.deploiement": zone });
    }
  }
}
