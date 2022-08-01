import { Trinites } from "./config.js";
import TrinitesActorSheet from "./sheets/TrinitesActorSheet.js";
import TrinitesItemSheet from "./sheets/TrinitesItemSheet.js";
import TrinitesActor from "./TrinitesActor.js";
import TrinitesItem from "./TrinitesItem.js";
import * as Chat from "./chat.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/trinites/templates/partials/dice/jet-competence.hbs"
    ];
}

function registerSystemSettings() {
    // Suggestions des échecs ctitiques envoyées à l'EG
    game.settings.register("trinites","limEndettementCampagne", {
        config: true,
        scope: "world",
        name: "Limite d'endettement 'Campagne'",
        hint: "Si cette option est cochée, la limite d'endettement sera celle du mode 'Campagne' (+6). Sinon, elle sera celle du mode 'Partie isolée' (+3).",
        type: Boolean,
        default: true
    });
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

