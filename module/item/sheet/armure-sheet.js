import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesArmureSheet extends TrinitesItemSheet {
  async getData() {
    const data = await super.getData();
    data.listeParticulariteshtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.item.system.listeParticularites, { async: false });
    return data;
  }
}
