import { Log } from "../../common/log.js";
export default class TrinitesItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 650,
      height: 500,
      classes: ["trinites", "sheet", "item"]
    });
  }

  get template() {
    Log.debug(`Chargement du template systems/trinites/templates/sheets/items/${this.item.type.toLowerCase()}-sheet.html`);
    return `systems/trinites/templates/sheets/items/${this.item.type.toLowerCase()}-sheet.html`;
  }

  getData() {
    const data = super.getData();
    data.config = game.trinites.config;

    const sortedCompetencesArray = Object.entries(game.trinites.config.competences).sort((a, b) => a[1].localeCompare(b[1]));
    const competencesTriees = Object.fromEntries(sortedCompetencesArray);
    data.config.competencesTriees = competencesTriees; 

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

}
