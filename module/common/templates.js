/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export default async function preloadTemplates() {
  return loadTemplates([
    "systems/trinites/templates/application/dep-karma-form-app.hbs",    
    "systems/trinites/templates/sheets/actors/trinite-sheet.html",  
    "systems/trinites/templates/sheets/actors/archonteRoi-sheet.html",
    "systems/trinites/templates/sheets/actors/lige-sheet.html",    
    "systems/trinites/templates/sheets/actors/humain-sheet.html",
    "systems/trinites/templates/sheets/items/aura-sheet.html",
    "systems/trinites/templates/sheets/items/arme-sheet.html",
    "systems/trinites/templates/sheets/items/armure-sheet.html",
    "systems/trinites/templates/sheets/items/atout-sheet.html",
    "systems/trinites/templates/sheets/items/domaine-sheet.html",    
    "systems/trinites/templates/sheets/items/metier-sheet.html",
    "systems/trinites/templates/sheets/items/objet-sheet.html",
    "systems/trinites/templates/sheets/items/pouvoir-sheet.html",
    "systems/trinites/templates/sheets/items/verset-sheet.html",
    "systems/trinites/templates/partials/actor/bloc-grandLivre-archonte.hbs",
    "systems/trinites/templates/partials/actor/bloc-grandLivre-trinite.hbs",
    "systems/trinites/templates/partials/actor/bloc-info-personnage.hbs",
    "systems/trinites/templates/partials/actor/bloc-karma-trinite.hbs",
    "systems/trinites/templates/partials/actor/bloc-karma-trinite-unlocked.hbs",
    "systems/trinites/templates/partials/actor/bloc-lameNoire-archonte.hbs",
    "systems/trinites/templates/partials/actor/bloc-lameSoeur-trinite.hbs",
    "systems/trinites/templates/partials/actor/bloc-profane-personnage.hbs",
    "systems/trinites/templates/partials/actor/bloc-profane-personnage-unlocked.hbs",
    "systems/trinites/templates/partials/actor/bloc-profane-archonte-roi.hbs",
    "systems/trinites/templates/partials/actor/bloc-themeAstral-personnage.hbs",
    "systems/trinites/templates/partials/actor/bloc-zodiaque-personnage.hbs",
    "systems/trinites/templates/partials/actor/bloc-equipement.hbs",
    "systems/trinites/templates/partials/actor/part-competence-locked.hbs",
    "systems/trinites/templates/partials/actor/part-competence-unlocked.hbs",
    "systems/trinites/templates/partials/actor/part-competence-archonte-roi.hbs",
    "systems/trinites/templates/partials/chat/carte-atout.hbs",
    "systems/trinites/templates/partials/chat/carte-atout-active.hbs",
    "systems/trinites/templates/partials/chat/carte-aura.hbs",
    "systems/trinites/templates/partials/chat/carte-verset.hbs",
    "systems/trinites/templates/partials/chat/carte-verset-active.hbs",
    "systems/trinites/templates/partials/dice/dialog-jet-arme.hbs",
    "systems/trinites/templates/partials/dice/dialog-jet-competence.hbs",
    "systems/trinites/templates/partials/dice/dialog-jet-ressource.hbs",
    "systems/trinites/templates/partials/dice/jet-arme.hbs",
    "systems/trinites/templates/partials/dice/jet-competence.hbs",
    "systems/trinites/templates/partials/dice/jet-ressource.hbs",
    "systems/trinites/templates/partials/dice/jet-souffle.hbs",
  ]);
}
