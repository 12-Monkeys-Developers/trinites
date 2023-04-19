import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesMetierSheet extends TrinitesItemSheet {

  getData() {
    const data = super.getData();

    data.isLocked = this.item.actor?.isLocked;
    return data;
  }
}
