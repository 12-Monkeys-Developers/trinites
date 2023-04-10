import { TRINITES } from "./module/common/config.js";
import preloadTemplates from "./module/common/templates.js";
import registerHandlebarsHelpers from "./module/common/helpers.js"
import registerSystemSettings from './module/common/settings.js';

import TrinitesActorSheet from "./module/actor/sheet/actor-sheet.js";
import TrinitesTriniteSheet from "./module/actor/sheet/trinite-sheet.js";
import TrinitesArchonteRoiSheet from "./module/actor/sheet/archonte-roi-sheet.js";
import TrinitesItemSheet from "./module/item/sheet/item-sheet.js";
import TrinitesVieAnterieureSheet from "./module/item/sheet/vie-anterieure-sheet.js";
import TrinitesAuraSheet from "./module/item/sheet/aura-sheet.js";
import { TrinitesItemProxy } from "./module/item/proxy.js";
import { TrinitesActorProxy } from "./module/actor/proxy.js";

import { Log } from "./module/common/log.js";
import { LOG_HEAD } from "./module/common/constants.js";
import registerHooks from "./module/common/hooks.js";


Hooks.once("init", function() {
    Log.info("Initialisation du système");

    game.trinites = {
        config: TRINITES
    };

    //CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = TrinitesActorProxy;
    CONFIG.Item.documentClass = TrinitesItemProxy;

    Log.info(CONFIG);

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("trinites", TrinitesActorSheet, { types: ["lige", "humain"], makeDefault: true});  
    Actors.registerSheet("trinites", TrinitesTriniteSheet, { types: ["trinite"], makeDefault: true});
    Actors.registerSheet("trinites", TrinitesArchonteRoiSheet, { types: ["archonteRoi"], makeDefault: true});  

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("trinites", TrinitesItemSheet, {types: ["atout", "ame","arme","domaine","jardin","majeste","metier","objet","pouvoir","verset"], makeDefault: true});
    Items.registerSheet("trinites", TrinitesVieAnterieureSheet, { types: ["vieAnterieure"], makeDefault: true});  
    Items.registerSheet("trinites", TrinitesAuraSheet, { types: ["aura"], makeDefault: true});

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



