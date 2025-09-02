import { TRINITES } from "./module/common/config.js";
import preloadTemplates from "./module/common/templates.js";
import registerHandlebarsHelpers from "./module/common/helpers.js";
import setupTextEnrichers from "./module/common/enrichers.js";
import registerSystemSettings from "./module/common/settings.js";
import registerHooks from "./module/common/hooks.js";

import TrinitesTriniteSheet from "./module/actor/sheet/trinite-sheet.js";
import TrinitesPnjSheet from "./module/actor/sheet/pnj-sheet.js";

import TrinitesItemSheet from "./module/item/sheet/item-sheet.js";
import TrinitesVieAnterieureSheet from "./module/item/sheet/vie-anterieure-sheet.js";
import TrinitesAuraSheet from "./module/item/sheet/aura-sheet.js";
import TrinitesMetierSheet from "./module/item/sheet/metier-sheet.js";
import TrinitesPouvoirSheet from "./module/item/sheet/pouvoir-sheet.js";
import { TrinitesItemProxy } from "./module/item/proxy.js";
import { TrinitesActorProxy } from "./module/actor/proxy.js";

import { Log } from "./module/common/log.js";
import { DEV_MODE } from "./module/common/constants.js";

import TrinitesCombatTracker from "./module/combat/combat-tracker.js";
import TrinitesCombatant from "./module/combat/combatant.js";
import TrinitesCombat from "./module/combat/combat.js";

Hooks.once("init", function () {
  Log.info("Initialisation du système");

  game.trinites = {
    config: TRINITES,
  };

  //CONFIG.debug.hooks = true;

  CONFIG.Actor.documentClass = TrinitesActorProxy;
  CONFIG.Item.documentClass = TrinitesItemProxy;
  CONFIG.ui.combat = TrinitesCombatTracker;
  CONFIG.Combat.documentClass = TrinitesCombat;
  CONFIG.Combatant.documentClass = TrinitesCombatant;

  Log.debug(CONFIG);

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("trinites", TrinitesTriniteSheet, { types: ["trinite"], makeDefault: true });
  foundry.documents.collections.Actors.registerSheet("trinites", TrinitesPnjSheet, { types: ["pnj"], makeDefault: true });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("trinites", TrinitesItemSheet, {
    types: ["atout", "ame", "arme", "armure", "domaine", "dragon", "jardin", "majeste", "objet", "pouvoir", "verset"],
    makeDefault: true,
  });
  foundry.documents.collections.Items.registerSheet("trinites", TrinitesVieAnterieureSheet, { types: ["vieAnterieure"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("trinites", TrinitesAuraSheet, { types: ["aura"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("trinites", TrinitesMetierSheet, { types: ["metier"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("trinites", TrinitesPouvoirSheet, { types: ["pouvoir"], makeDefault: true });

  // Preload Handlebars Templates
  preloadTemplates();

  // Register Handlebars Helpers
  registerHandlebarsHelpers();

  // Register Text Enrichers
  setupTextEnrichers();

  // Register System Settings
  registerSystemSettings();

  // Register Hooks
  registerHooks();

  Log.info("Système initialisé");
});

// Register world usage statistics
function registerWorldCount(registerKey) {
  if (game.user.isGM) {
    let worldKey = game.settings.get(registerKey, "worldKey");
    if (worldKey == undefined || worldKey == "") {
      worldKey = foundry.utils.randomID(32);
      game.settings.set(registerKey, "worldKey", worldKey);
    }

    // Simple API counter
    const worldData = {
      register_key: registerKey,
      world_key: worldKey,
      foundry_version: `${game.release.generation}.${game.release.build}`,
      system_name: game.system.id,
      system_version: game.system.version,
    };

    let apiURL = "https://worlds.qawstats.info/worlds-counter";
    $.ajax({
      url: apiURL,
      type: "POST",
      data: JSON.stringify(worldData),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      async: false,
    });
  }
}

Hooks.once("ready", async function () {
  if (!DEV_MODE) {
    registerWorldCount("trinites");
  }
  Log.info("Système prêt");
});
