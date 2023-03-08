import { TRINITES } from "./module/common/config.js";
import preloadTemplates from "./module/common/templates.js";
import registerHandlebarsHelpers from "./module/common/helpers.js"
import registerSystemSettings from './module/common/settings.js';
import * as Chat from "./module/common/chat.js";

import TrinitesActorSheet from "./module/actor/sheet/TrinitesActorSheet.js";
import TrinitesItemSheet from "./module/item/sheet/TrinitesItemSheet.js";
import TrinitesActor from "./module/actor/TrinitesActor.js";
import TrinitesItem from "./module/item/TrinitesItem.js";

import { Log } from "./module/common/log.js";
import { LOG_HEAD } from "./module/common/constants.js";
import registerHooks from "./module/common/hooks.js";

Hooks.once("init", function() {
    Log.info("Initialisation du système)");

    game.trinites = {
        TrinitesActor,
        TrinitesItem,
        config: TRINITES
    };

    //CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = TrinitesActor;
    CONFIG.Item.documentClass = TrinitesItem;

    Log.info(CONFIG);

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("trinites", TrinitesActorSheet, {makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("trinites", TrinitesItemSheet, {makeDefault: true});

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



