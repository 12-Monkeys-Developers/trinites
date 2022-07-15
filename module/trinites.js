import { Trinites } from "./config.js";
import TrinitesActorSheet from "./sheets/TrinitesActorSheet.js";
import TrinitesActor from "./TrinitesActor.js";

Hooks.once("init", function(){
    console.log("Trinités | Initialisation du système Trinités (non officiel))");

    game.Trinites = {
        TrinitesActor
        //TrinitesItem
    };

    //CONFIG.debug.hooks = true;

    CONFIG.Trinites = Trinites;
    CONFIG.Actor.documentClass = TrinitesActor;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("trinites", TrinitesActorSheet, {makeDefault: true});

    //preloadHandlebarsTemplates();
})