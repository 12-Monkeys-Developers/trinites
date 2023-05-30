import { TRINITES } from "./module/common/config.js";
import preloadTemplates from "./module/common/templates.js";
import registerHandlebarsHelpers from "./module/common/helpers.js"
import registerSystemSettings from './module/common/settings.js';
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
import { LOG_HEAD } from "./module/common/constants.js";

import TrinitesCombatTracker from "./module/combat/combat-tracker.js";
import TrinitesCombatant from "./module/combat/combatant.js";
import TrinitesCombat from "./module/combat/combat.js";


Hooks.once("init", function() {
    Log.info("Initialisation du système");

    game.trinites = {
        config: TRINITES
    };

    //CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = TrinitesActorProxy;
    CONFIG.Item.documentClass = TrinitesItemProxy;
    CONFIG.ui.combat = TrinitesCombatTracker;
    CONFIG.Combat.documentClass = TrinitesCombat;
    CONFIG.Combatant.documentClass = TrinitesCombatant;

    Log.debug(CONFIG);

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("trinites", TrinitesTriniteSheet, { types: ["trinite"], makeDefault: true});
    Actors.registerSheet("trinites", TrinitesPnjSheet, { types: ["pnj"], makeDefault: true});  
    

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("trinites", TrinitesItemSheet, {types: ["atout", "ame","arme", "armure", "domaine","jardin","majeste","objet","pouvoir","dragon","verset"], makeDefault: true});
    Items.registerSheet("trinites", TrinitesVieAnterieureSheet, { types: ["vieAnterieure"], makeDefault: true});  
    Items.registerSheet("trinites", TrinitesAuraSheet, { types: ["aura"], makeDefault: true});
    Items.registerSheet("trinites", TrinitesMetierSheet, { types: ["metier"], makeDefault: true});
    Items.registerSheet("trinites", TrinitesPouvoirSheet, { types: ["pouvoir"], makeDefault: true});

	// Preload Handlebars Templates
	preloadTemplates();

    // Register Handlebars Helpers
	registerHandlebarsHelpers();

    // Register System Settings
	registerSystemSettings();

	// Register Hooks
	registerHooks();    

    Log.info("Système initialisé");
})



