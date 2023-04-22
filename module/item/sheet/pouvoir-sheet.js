import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./item-sheet.js";

export default class TrinitesPouvoirSheet extends TrinitesItemSheet {

  getData() {
    const data = super.getData();
    
    data.origine= data.config.savoirsOccultes[this.item.system.savoirOcculte].origine;
    console.log("data.origine",data.origine);
    data.isLocked = this.item.actor?.isLocked;
    return data;
  }
}
