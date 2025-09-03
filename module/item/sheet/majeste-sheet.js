import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesMajesteSheet extends TrinitesItemSheet {
  async getData() {
    const data = await super.getData();
    data.effethtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.item.system.effet, { async: false });
    data.manifestationhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.item.system.manifestation, { async: false });
    return data;
  }
}
