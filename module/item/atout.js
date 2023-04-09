import TrinitesItem from "./item.js";

export default class TrinitesAtout extends TrinitesItem {
  /** @override */
  prepareData() {
    super.prepareData();

    let data = this.system;
    if (data.messager != "") {
      data.karma = data.config.epeesFeu[data.messager].karma;
    }
  }
}
