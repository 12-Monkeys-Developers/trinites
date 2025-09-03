import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesJardinSheet extends TrinitesItemSheet {
  async getData() {
    const data = await super.getData();
    data.manifestationhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.item.system.manifestation, { async: false });
    return data;
  }
}
