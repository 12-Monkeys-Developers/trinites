/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export default async function preloadTemplates() {
  return loadTemplates([
    "systems/trinites/templates/application/dep-karma-form-app.hbs",    
    "systems/trinites/templates/sheets/actors/trinite-sheet.html",  
    "systems/trinites/templates/sheets/actors/pnj-sheet.html",
    "systems/trinites/templates/sheets/items/ame-sheet.html",
    "systems/trinites/templates/sheets/items/aura-sheet.html",
    "systems/trinites/templates/sheets/items/arme-sheet.html",
    "systems/trinites/templates/sheets/items/armure-sheet.html",
    "systems/trinites/templates/sheets/items/atout-sheet.html",
    "systems/trinites/templates/sheets/items/domaine-sheet.html",    
    "systems/trinites/templates/sheets/items/metier-sheet.html",
    "systems/trinites/templates/sheets/items/objet-sheet.html",
    "systems/trinites/templates/sheets/items/pouvoir-sheet.html",
    "systems/trinites/templates/sheets/items/dragon-sheet.html",
    "systems/trinites/templates/sheets/items/verset-sheet.html",
    "systems/trinites/templates/sheets/items/jardin-sheet.html",
    "systems/trinites/templates/sheets/items/majeste-sheet.html",
    "systems/trinites/templates/partials/actor/trinite-bloc-info.hbs",
    "systems/trinites/templates/partials/actor/bloc-theme-astral.hbs",
    "systems/trinites/templates/partials/actor/bloc-equipement.hbs",
    "systems/trinites/templates/partials/actor/trinite-bloc-zodiaque.hbs",
    "systems/trinites/templates/partials/actor/trinite-bloc-grand-livre.hbs",
    "systems/trinites/templates/partials/actor/trinite-bloc-karma.hbs",
    "systems/trinites/templates/partials/actor/trinite-bloc-karma-unlocked.hbs",
    "systems/trinites/templates/partials/actor/trinite-bloc-lame-soeur.hbs",
    "systems/trinites/templates/partials/actor/trinite-bloc-profane.hbs",
    "systems/trinites/templates/partials/actor/trinite-bloc-profane-unlocked.hbs",    
    "systems/trinites/templates/partials/actor/trinite-bloc-description.hbs", 
    "systems/trinites/templates/partials/actor/pnj-bloc-occulte.hbs",
    "systems/trinites/templates/partials/actor/pnj-bloc-versets.hbs",
    "systems/trinites/templates/partials/actor/pnj-bloc-auras.hbs",
    "systems/trinites/templates/partials/actor/pnj-bloc-pouvoirs.hbs",    
    "systems/trinites/templates/partials/actor/pnj-bloc-atouts.hbs",    
    "systems/trinites/templates/partials/actor/pnj-bloc-info.hbs",
    "systems/trinites/templates/partials/actor/pnj-bloc-profane.hbs",
    "systems/trinites/templates/partials/actor/pnj-part-competence.hbs",
    "systems/trinites/templates/partials/actor/bloc-atouts.hbs",
    "systems/trinites/templates/partials/chat/carte-dragon.hbs",
    "systems/trinites/templates/partials/chat/carte-dragon-active.hbs",
    "systems/trinites/templates/partials/actor/part-competence-locked.hbs",    
    "systems/trinites/templates/partials/actor/part-competence-unlocked.hbs",
    "systems/trinites/templates/partials/chat/carte-atout.hbs",
    "systems/trinites/templates/partials/chat/carte-atout-active.hbs",
    "systems/trinites/templates/partials/chat/carte-aura.hbs",
    "systems/trinites/templates/partials/chat/carte-majeste.hbs",
    "systems/trinites/templates/partials/chat/carte-majeste-active.hbs",
    "systems/trinites/templates/partials/chat/carte-verset.hbs",
    "systems/trinites/templates/partials/chat/carte-verset-active.hbs",    
    "systems/trinites/templates/partials/dice/dialog-jet-arme.hbs",
    "systems/trinites/templates/partials/dice/dialog-jet-competence.hbs",    
    "systems/trinites/templates/partials/dice/dialog-jet-ressource.hbs",
    "systems/trinites/templates/partials/dice/jet-competence-unde.hbs",
    "systems/trinites/templates/partials/dice/jet-competence-deuxdes.hbs",
    "systems/trinites/templates/partials/dice/jet-ressource.hbs",
    "systems/trinites/templates/partials/dice/jet-souffle.hbs",
    "systems/trinites/templates/partials/dice/jet-initiative.hbs"
  ]);
}
