import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesMetierSheet extends TrinitesItemSheet {

  async getData() {
    const data = await super.getData();

    data.isLocked = this.item.actor?.isLocked;
    return data;
  }
}
