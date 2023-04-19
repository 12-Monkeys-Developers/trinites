import { TRINITES } from "./config.js";

export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper("configVal", function (liste, val) {
    return TRINITES[liste][val];
  });

  Handlebars.registerHelper("configLabel", function (liste, val) {
    return TRINITES[liste][val].label;
  });

  Handlebars.registerHelper("times", function (n, block) {
    var accum = "";
    for (var i = 1; i <= n; ++i) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === n - 1;
      accum += block.fn(this);
    }
    return accum;
  });

  Handlebars.registerHelper("uppercase", function (val) {
    return val.toUpperCase();
  });

  Handlebars.registerHelper("getCompetence", function (actor, signe, competence, champ) {
    return eval(`actor.system.competences.${signe}.${competence}.${champ}`);
  });

  Handlebars.registerHelper("getCompetenceLabel", function (signe, competence) {
    const key = `TRINITES.label.competences.${signe}.${competence}`;
    return game.i18n.localize(key);
  });  

  Handlebars.registerHelper("getArmeParticularites", function (particularites) {
    let text = "";
    if (particularites.rechargement) text += 'Se recharge avec une action libre. ';
    if (particularites.multiples) text += 'Attaques multiples. ';
    if (particularites.chargeur) {
      text += `Chargeur de ${particularites.balles} balles. `;
    }
    if (particularites.retardement) text += 'A retardement';
    if (particularites.zone) {
      text += `Zone (${particularites.rayon} m). `;
    }
    if (particularites.allonge) text += 'Allonge. ';
    if (particularites.desarmer) text += 'Désarmer. ';
    if (particularites.maitriser) text += 'Maîtriser. ';
    if (particularites.charge) text += 'Charge. ';
    if (particularites.nonLetal) text += 'Non létale. ';
    if (particularites.perforante) text += 'Perforante. ';
    return text;
  }); 

  Handlebars.registerHelper("getArmureParticularites", function (particularites) {
    let text = "";
    if (particularites.encombrant) {
      text += `Encombrant (Force ${particularites.force}). `;
    }
    if (particularites.deuxMains) text += 'Incompatible avec une arme à deux mains. '  
    return text;
  }); 
}
