export default class TrinitesItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
    this.system.config = game.trinites.config;
  }
}
