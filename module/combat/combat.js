export default class TrinitesCombat extends Combat {
  /**
   * @description Tri des combattants
   * D'abord ceux Dans le feu de l'action (action)
   * Puis ceux en garde (garde)
   * Puis ceux en retrait (retrait)
   * Dans chaque groupe, par ordre d'initiative
   * En cas d'égalité, classé par nom
   * @param {*} a Combatant
   * @param {*} b Combatant
   * @returns -1 if a is before b, elsewhere 1
   * @override
   */
  _sortCombatants(a, b) {
    const positionA = a.getFlag("world", "position");
    const positionB = a.getFlag("world", "position");

    if (positionA === "action" && positionB !== "action") return -1;

    if (positionA === "garde") {
      if (positionB === "action") return 1;
      if (positionB === "retrait") return -1;
    }

    if (positionA === "retrait" && positionB !== "retrait") return 1;

    const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;
    return ib - ia || (a.id > b.id ? 1 : -1);
  }

  /**
   * Begin the combat encounter, advancing to round 1 and turn 1
   * @returns {Promise<Combat>}
   */
  async startCombat() {
    this._playCombatSound("startEncounter");

    // Déplacement des combattants
    for (const combatant of this.turns) {
      if (combatant.isGarde) await combatant.setAction();
      if (combatant.isRetrait) await combatant.setGarde();
    }

    // Détermination du premier joueur
    let turn = 0;
    let next = null;
    for (let [i, t] of this.turns.entries()) {
      if (t.isGarde || t.isRetrait) continue;
      next = i;
      break;
    }

    const updateData = { round: 1, turn: next };
    Hooks.callAll("combatStart", this, updateData);
    return this.update(updateData);
  }

  /**
   * Advance the combat to the next turn
   * @returns {Promise<Combat>}
   */
  async nextTurn() {
    let currentTurn = this.turn ?? -1;
    let turn = this.turn ?? -1;
    let skip = this.settings.skipDefeated;

    // Determine the next turn number
    let next = null;
    if (skip) {
      for (let [i, t] of this.turns.entries()) {
        if (i <= turn) continue;
        if (t.isDefeated) continue;
        if (t.isGarde || t.isRetrait) continue;
        next = i;
        break;
      }
    } else {
      // Ignore En garde or En retrait
      for (let [i, t] of this.turns.entries()) {
        if (i <= turn) continue;
        if (t.isGarde || t.isRetrait) continue;
        next = i;
        break;
      }
    }

    // Update the combatant
    if (currentTurn !== -1) {
      let combatant = this.turns[currentTurn];
      await combatant.setGarde();
    }

    // Maybe advance to the next round
    let round = this.round;
    if (this.round === 0 || next === null || next >= this.turns.length) {
      return this.nextRound();
    }

    // Update the document, passing data through a hook first
    const updateData = { round, turn: next };
    const updateOptions = { advanceTime: CONFIG.time.turnTime, direction: 1 };
    Hooks.callAll("combatTurn", this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }

  /**
   * Advance the combat to the next round
   * @returns {Promise<Combat>}
   */
  async nextRound() {
    let turn = this.turn === null ? null : 0; // Preserve the fact that it's no-one's turn currently.
    if (this.settings.skipDefeated && turn !== null) {
      turn = this.turns.findIndex((t) => !t.isDefeated);
      if (turn === -1) {
        ui.notifications.warn("COMBAT.NoneRemaining", { localize: true });
        turn = 0;
      }
    }
    let advanceTime = Math.max(this.turns.length - this.turn, 0) * CONFIG.time.turnTime;
    advanceTime += CONFIG.time.roundTime;
    let nextRound = this.round + 1;

    // Déplacement des combattants
    for (const combatant of this.turns) {
      if (combatant.isGarde) await combatant.setAction();
      if (combatant.isRetrait) await combatant.setGarde();
    }

    // Update the document, passing data through a hook first
    const updateData = { round: nextRound, turn };
    const updateOptions = { advanceTime, direction: 1 };
    Hooks.callAll("combatRound", this, updateData, updateOptions);
    return this.update(updateData, updateOptions);
  }
}
