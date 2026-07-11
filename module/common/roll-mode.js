/**
 * Compatibilité des modes de visibilité des messages.
 *
 * Foundry V14 a renommé le réglage `core.rollMode` en `core.messageMode` et
 * remplacé les anciennes clés (`publicroll`/`gmroll`/`blindroll`/`selfroll`)
 * par `public`/`gm`/`blind`/`self` (+ `ic`).
 *
 * Ce shim convertit d'éventuelles valeurs héritées (macros, anciens appels)
 * vers les clés V14. Inspiré de cof/module/utils/roll-mode-utils.js.
 */
const LEGACY_ROLL_MODES = {
  publicroll: "public",
  gmroll: "gm",
  blindroll: "blind",
  selfroll: "self",
};

/**
 * Normalise un mode de visibilité vers les clés V14.
 * @param {string} mode Le mode (clé V14 ou valeur héritée).
 * @returns {string} La clé V14 correspondante (inchangée si déjà à jour).
 */
export function toMessageMode(mode) {
  return LEGACY_ROLL_MODES[mode] ?? mode;
}
