import { Trinites } from "./config.js";
import { registerSystemSettings } from "./settings.js";
import TrinitesActorSheet from "./sheets/TrinitesActorSheet.js";
import TrinitesItemSheet from "./sheets/TrinitesItemSheet.js";
import TrinitesActor from "./TrinitesActor.js";
import TrinitesItem from "./TrinitesItem.js";
import * as Chat from "./chat.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/trinites/templates/partials/actor/bloc-profane-personnage.hbs",
        "systems/trinites/templates/partials/actor/bloc-info-personnage.hbs",
        "systems/trinites/templates/partials/actor/bloc-themeAstral-personnage.hbs",
        "systems/trinites/templates/partials/actor/bloc-karma-trinite.hbs",
        "systems/trinites/templates/partials/actor/bloc-grandLivre-trinite.hbs",
        "systems/trinites/templates/partials/actor/bloc-zodiaque-personnage.hbs",
        "systems/trinites/templates/partials/actor/bloc-lameSoeur-trinite.hbs",
        "systems/trinites/templates/partials/actor/bloc-grandLivre-archonte.hbs",
        "systems/trinites/templates/partials/actor/bloc-lameNoire-archonte.hbs"
    ];

    return loadTemplates(templatePaths);
}

Hooks.once("init", function() {
    console.log("Trinités | Initialisation du système Trinités (non officiel))");

    game.Trinites = {
        TrinitesActor,
        TrinitesItem
    };

    //CONFIG.debug.hooks = true;

    CONFIG.Trinites = Trinites;
    CONFIG.Actor.documentClass = TrinitesActor;
    CONFIG.Item.documentClass = TrinitesItem;

    console.log(CONFIG);

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("trinites", TrinitesActorSheet, {makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("trinites", TrinitesItemSheet, {makeDefault: true});

    registerSystemSettings();

    preloadHandlebarsTemplates();

    Handlebars.registerHelper("configVal", function(liste, val) {
        return Trinites[liste][val];
    });

    Handlebars.registerHelper("configLabel", function(liste, val) {
        return Trinites[liste][val].label;
    });

    Handlebars.registerHelper('times', function(n, block) {
        var accum = '';
        for(var i = 1; i <= n; ++i) {
            block.data.index = i;
            block.data.first = i === 0;
            block.data.last = i === (n - 1);
            accum += block.fn(this);
        }
        return accum;
    });
})

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));

