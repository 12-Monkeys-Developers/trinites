export default class TrinitesCombatTracker extends CombatTracker {
  get template() {
    return "systems/trinites/templates/combat/combat-tracker.html";
  }

  /** @inheritdoc */
  async getData(options = {}) {
    let context = await super.getData(options);

    if (!context.hasCombat) {
      return context;
    }

    for (let [i, combatant] of context.combat.turns.entries()) {
      const position = combatant.getFlag("world", "position");
      context.turns[i].position = position;
      context.turns[i].isRetrait = position === "retrait";
      context.turns[i].isGarde = position === "garde";
      context.turns[i].isAction = position === "action";
    }

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".action").click(this._onAction.bind(this));
    html.find(".garde").click(this._onGarde.bind(this));
    html.find(".retrait").click(this._onRetrait.bind(this));
  }

  /**
   * @description
   * @param {*} event
   */
  async _onAction(event) {
    event.preventDefault();
    event.stopPropagation();
    const btn = event.currentTarget;
    const li = btn.closest(".combatant");
    const combat = this.viewed;
    const combatant = combat.combatants.get(li.dataset.combatantId);

    if (!combatant.flags.world.position) await combatant.setFlag("world", "position", "action");
    else await combatant.setFlag("world", "position", "action");
  }

  /**
   * @description
   * @param {*} event
   */
  async _onGarde(event) {
    event.preventDefault();
    event.stopPropagation();
    const btn = event.currentTarget;
    const li = btn.closest(".combatant");
    const combat = this.viewed;
    const combatant = combat.combatants.get(li.dataset.combatantId);

    if (!combatant.flags.world.position) await combatant.setFlag("world", "position", "garde");
    else await combatant.setFlag("world", "position", "garde");
  }

  /**
   * @description
   * @param {*} event
   */
  async _onRetrait(event) {
    event.preventDefault();
    event.stopPropagation();
    const btn = event.currentTarget;
    const li = btn.closest(".combatant");
    const combat = this.viewed;
    const combatant = combat.combatants.get(li.dataset.combatantId);

    if (!combatant.flags.world.position) await combatant.setFlag("world", "position", "retrait");
    else await combatant.setFlag("world", "position", "retrait");
  }
}
