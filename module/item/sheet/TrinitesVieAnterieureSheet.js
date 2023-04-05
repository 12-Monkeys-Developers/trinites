import { Log } from "../../common/log.js";
import TrinitesItemSheet from "./TrinitesItemSheet.js";

export default class TrinitesVieAnterieureSheet extends TrinitesItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 720,
      height: 1020,
      classes: ["trinites", "sheet", "item"]
    });
  }
}
