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

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("trinites", TrinitesActorSheet, {makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("trinites", TrinitesItemSheet, {makeDefault: true});

    preloadHandlebarsTemplates();

    Handlebars.registerHelper("configVal", function(liste, val) {
        return Trinites[liste][val];
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

