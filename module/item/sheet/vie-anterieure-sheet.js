import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesVieAnterieureSheet extends TrinitesItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 720,
      height: 1020,
      classes: ["trinites", "sheet", "item"]
    });
  }

  getData() {
    const data = super.getData();

    data.isLocked = this.item.actor?.isLocked;
    return data;
  }
}
