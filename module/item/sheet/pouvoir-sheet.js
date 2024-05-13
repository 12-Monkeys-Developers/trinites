import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesPouvoirSheet extends TrinitesItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 620,
      height: 380
    });
  }

  async getData() {
    const data = await super.getData();
    data.origine= data.config.savoirsOccultes[this.item.system.savoirOcculte].origine;
    data.isLocked = this.item.actor?.isLocked;
    return data;
  }
}
