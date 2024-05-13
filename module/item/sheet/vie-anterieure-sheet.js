import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesVieAnterieureSheet extends TrinitesItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 720,
      height: 1020
    });
  }

  async getData() {
    const data = await super.getData();

    data.isLocked = this.item.actor?.isLocked;
    return data;
  }
}
