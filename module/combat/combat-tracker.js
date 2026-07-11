/**
 * CombatTracker Trinités (Foundry V14 — ApplicationV2).
 *
 * Ajoute la notion de position de combat (action / garde / retrait) stockée
 * dans le flag `world.position` de chaque combattant, et regroupe les
 * combattants par position dans le suivi.
 */
export default class TrinitesCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  /** @override Ajoute l'action des boutons de position (fusionnée avec celles du cœur). */
  static DEFAULT_OPTIONS = {
    actions: {
      trinitesPosition: TrinitesCombatTracker.#onSetPosition,
    },
  };

  /** @override Remplace la part "tracker" par le template Trinités (les parts ne sont pas fusionnées). */
  static PARTS = {
    header: { template: "templates/sidebar/tabs/combat/header.hbs" },
    tracker: { template: "systems/trinites/templates/combat/combat-tracker.hbs", scrollable: [""] },
    footer: { template: "templates/sidebar/tabs/combat/footer.hbs" },
  };

  /* -------------------------------------------- */

  /** @inheritDoc Enrichit chaque tour avec sa position de combat. */
  async _prepareTurnContext(combat, combatant, index) {
    const turn = await super._prepareTurnContext(combat, combatant, index);
    const position = combatant.getFlag("world", "position");
    turn.position = position;
    turn.isAction = position === "action";
    turn.isGarde = position === "garde";
    turn.isRetrait = position === "retrait";
    return turn;
  }

  /* -------------------------------------------- */

  /**
   * Positionne un combattant sur une phase (action / garde / retrait).
   * @this {TrinitesCombatTracker}
   * @param {PointerEvent} event   L'événement déclencheur.
   * @param {HTMLElement} target   L'élément portant data-action/data-position.
   */
  static async #onSetPosition(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const li = target.closest("[data-combatant-id]");
    const combatant = this.viewed?.combatants.get(li?.dataset.combatantId);
    if (!combatant) return;
    await combatant.setFlag("world", "position", target.dataset.position);
  }

  /* -------------------------------------------- */

  /** @inheritDoc Un combattant vaincu passe automatiquement en retrait. */
  async _onToggleDefeatedStatus(combatant) {
    await super._onToggleDefeatedStatus(combatant);
    await combatant.setFlag("world", "position", "retrait");
  }
}
