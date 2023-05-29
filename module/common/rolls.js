import { TrinitesChat } from "./chat.js";

/** Jet de Compétence */
export async function jetCompetence({
  nbDes = null,
  actor = null,
  signe = null,
  competence = null,
  difficulte = null,
  sansDomaine = null,
  type = null,
  aura = null,
  arme = null,
  afficherDialog = true,
  envoiMessage = true,
} = {}) {
  // Récupération des données de l'acteur
  let actorData = actor.system;

  let valeur = actorData.competences[signe][competence].valeur;
  let ouverte = actorData.competences[signe][competence].ouverte;

  // Si la compétence a une base de 0, on gènere le message d'erreur et on annule le jet
  if (valeur == 0 && !ouverte) {
    ui.notifications.warn(`Le jet n'est pas autorisé pour une compétence fermée dont la base est à zéro.`);
    return null;
  }

  // Informations nécessaires à la fenêtre de dialogue
  // ID du journal de description des primes et pénalités
  let infoPrimesID = game.settings.get("trinites", "lienJournalPrimesPenalites");
  // Competence de combat
  let compCombat = competence === "tir" || competence === "melee" || competence === "corpsACorps";
  // Compétence qui autorise les actions libres
  let compLibre = actorData.competences[signe][competence].libre;

  // Valeurs récupérées par la fenêtre de dialogue
  let actionLibre = null;
  let modificateurs = {
    acceleration: 0,
    circonspection: 0,
    efficacite: 0,
    debordement: 0,
    prudence: 0,
    consommation: 0,
    danger: 0,
    penaliteDifficulte: 0,
    facilite: 0,
    ralentissement: 0,
    risque: 0,
    attaquesMultiples: 0,
    blessureGrave: 0,
    blessureGrave: 0,
    blessureNonLetale: 0,
    blessurePrecise: 0,
    blessureLegere: 0,
  };

  // Affichage de la fenêtre de dialogue (vrai par défaut)
  if (afficherDialog) {
    const jetArme = type === "arme" || type === "lameSoeur" ? true : false;
    let dialogOptions = await getJetCompetenceOptions({ cfgData: game.trinites.config, compCombat: compCombat, compLibre: compLibre, infoPrimesID: infoPrimesID, jetArme });

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if (dialogOptions.annule) {
      return null;
    }

    // Récupération des données de la fenêtre de dialogue pour ce jet
    difficulte = dialogOptions.difficulte;
    sansDomaine = dialogOptions.sansDomaine;
    actionLibre = dialogOptions.actionLibre;

    updateModificateurs(dialogOptions, modificateurs);
  }

  if (sansDomaine) {
    if (ouverte) {
      valeur = actorData.signes[signe].valeur;
    } else {
      ui.notifications.warn(`Le jet n'est pas autorisé pour une compétence fermée dont la valeur est à zéro.`);
      return null;
    }
  }

  // Définition de la formule de base du jet
  let modFormula = " + @valeur";

  if (modificateurs.efficacite > 0) {
    modFormula += " + 3";
  }

  if (modificateurs.penaliteDifficulte > 0) {
    modFormula += " - 3";
  }

  // Données de base du jet
  let label = game.i18n.localize(`TRINITES.label.competences.${signe}.${competence}`);
  let karmaAdam = actor.isTrinite ? actorData.trinite.adam.karma.type : "tenebre";

  let rollData = {
    type: type,
    nomPersonnage: actor.name,
    competence: label,
    valeur: valeur,
    karmaAdam: karmaAdam,
    typeActor: actor.sousType,
    actorId: actor.id,
  };

  if (type === "arme" || type === "lameSoeur") {
    (rollData.arme = arme), (rollData.degats = arme.degats);
  }

  // Bonus de difficulte en cas de jet d'Emprise - Souffle
  if (type == "souffle") {
    if (aura.system.signe == actorData.themeAstral.archetype) {
      difficulte += 6;
    } else if (aura.system.signe == actorData.themeAstral.ascendant1 || aura.system.signe == actorData.themeAstral.ascendant2) {
      difficulte += 3;
    }

    rollData.deploieInit = aura.system.deploiement;
    rollData.aura = aura;
  }

  // Modificateur de difficulté du jet
  if (difficulte) {
    rollData.difficulte = difficulte;
    rollData.modifsJet = true;
    modFormula += " + @difficulte";
  }

  // Malus lié au nombre d'actions libres consécutives
  if (actionLibre > 1) {
    let malusActionLibre = (actionLibre - 1) * -3;

    rollData.actionLibre = actionLibre;
    rollData.malusActionLibre = malusActionLibre;
    rollData.modifsJet = true;
    modFormula += " + @malusActionLibre";
  }

  nbDes = actor.nbDes ?? nbDes;
  let rollFormula = _getFormula(nbDes, actor, modFormula);

  let rollResult = await new Roll(rollFormula, rollData).roll({ async: true });

  let { resultDeva, resultArchonte } = _getDicesResult(nbDes, rollResult);
  rollData.resultDeva = resultDeva;
  rollData.resultArchonte = resultArchonte;

  // Gestion de la réussite selon le Karma
  let resultatJet = _getResult(nbDes, actor, karmaAdam, resultDeva, resultArchonte);

  let resultModificateurs = await handleModificateurs(actor, modificateurs);
  let flags = { world: Object.assign({}, resultModificateurs !== {} ? { modificateurs: true } : { modificateurs: false }, resultModificateurs, resultatJet) };

  // Primes et pénalités
  rollData.modificateurs = modificateurs;

  if (type === "arme" || type === "lameSoeur") {
    // Prime Attaques multiples : dégâts divisés par 2
    if (modificateurs.attaquesMultiples > 0) {
      rollData.degats = Math.round(rollData.degats / 2);
    }

    // Prime Blessure grave : dégâts multipliés par 1,5
    if (modificateurs.blessureGrave > 0) {
      rollData.degats = Math.round(rollData.degats * 1.5);
    }

    // Pénalité Blessure légère : dégâts divisés par 2
    if (modificateurs.blessureLegere > 0) {
      rollData.degats = Math.round(rollData.degats / 2);
    }
  }

  rollData.resultatJet = resultatJet;
  rollData.nbDes = nbDes;

  if (envoiMessage) {
    // Construction du jeu de données pour alimenter le template
    let rollStats = {
      ...rollData,
    };

    let messageTemplate;
    // Recupération du template
    switch (type) {
      case "competence":
      case "arme":
      case "lameSoeur":
        if (nbDes == 1) messageTemplate = "systems/trinites/templates/partials/dice/jet-competence-unde.hbs";
        else messageTemplate = "systems/trinites/templates/partials/dice/jet-competence-deuxdes.hbs";
        break;
      case "souffle":
        messageTemplate = "systems/trinites/templates/partials/dice/jet-souffle.hbs";
        break;
    }

    let renderedRoll = await rollResult.render();

    // Assignation des données au template
    let templateContext = {
      actorId: actor.id,
      stats: rollStats,
      roll: renderedRoll,
      jetArme: type === "arme" || type === "lameSoeur",
    };

    if (actor.type === "pnj" && game.user.isGM) templateContext.rollMode = "gmroll";

    let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(templateContext).withRoll(rollResult).withFlags(flags).create();
    await chat.display();
  }
}

// Fonction de construction de la boite de dialogue de jet de compétence
async function getJetCompetenceOptions({ cfgData = null, compCombat = false, compLibre = false, infoPrimesID = null, jetArme = null }) {
  // Recupération du template

  let html;
  if (compCombat) {
    const template = "systems/trinites/templates/partials/dice/dialog-jet-arme.hbs";
    html = await renderTemplate(template, { cfgData: cfgData, compCombat: true, infoPrimesID: infoPrimesID });
  } else {
    const template = "systems/trinites/templates/partials/dice/dialog-jet-competence.hbs";
    html = await renderTemplate(template, { cfgData: cfgData, compCombat: compCombat, compLibre: compLibre, infoPrimesID: infoPrimesID });
  }

  return new Promise((resolve) => {
    const data = {
      title: "Jet de compétence",
      content: html,
      buttons: {
        jet: {
          icon: '<i class="fas fa-dice"></i>',
          label: "Jeter les dés",
          callback: (html) => resolve(_processJetCompetenceOptions(html[0].querySelector("form"), jetArme)),
        },
        annuler: {
          label: "Annuler",
          callback: (html) => resolve({ annule: true }),
        },
      },
      default: "jet",
      close: () => resolve({ annule: true }), // Annulation sur fermeture de la boite de dialogue
    };

    // Affichage de la boite de dialogue
    new Dialog(data, null).render(true);
  });
}

/** Jet de Ressource */
export async function jetRessource({ actor = null, ressource = null, coutAcquisition = null, domaineId = null, afficherDialog = true, envoiMessage = true } = {}) {
  // Récupération des données de l'acteur
  let actorData = actor.system;

  let valeur = actorData.ressources[ressource].valeur - actorData.ressources[ressource].diminution;
  let ressEpuisee = actorData.ressources[ressource].epuisee;
  let label = game.i18n.localize(`TRINITES.label.ressources.${ressource}`);
  let domaines = actor.items.filter(function (item) {
    return item.type === "domaine" && !item.system.epuise;
  });

  // Pas de jet si Richesse est épuisée ou tous les dommaines épuisés pour une Trinité
  if (ressource === "richesse" && ressEpuisee) {
    ui.notifications.warn("Votre Richesse est épuisée. Le jet de dés n'est pas autorisé.");
    return;
  } else {
    if (actor.isTrinite && domaines.length === 0) {
      ui.notifications.warn("Tous vos Domaines sont épuisés. Le jet de dés n'est pas autorisé.");
      return;
    }
  }

  // Affichage de la fenêtre de dialogue (vrai par défaut)
  if (afficherDialog) {
    let dialogOptions = await getJetRessourceOptions({ cfgData: game.trinites.config, useDomaine: ressource != "richesse", domaines: domaines, isTrinite: actor.isTrinite });

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if (dialogOptions.annule) {
      return null;
    }

    // Récupération des données de la fenêtre de dialogue pour ce jet
    coutAcquisition = dialogOptions.coutAcquisition;
    domaineId = dialogOptions.domaine;
  }

  // Calcul des paramètres selon le cout d'acquisition
  let typeTest = typeTestRessource(valeur, coutAcquisition, game.settings.get("trinites", "limEndettementCampagne"));

  if (typeTest.type == "anodin") {
    ui.notifications.info("Cette acquisition est anodine. Elle ne nécessite pas de jet de dés.");
    return;
  } else if (typeTest.type == "impossible") {
    ui.notifications.warn("Cette acquisition est au-dessus de vos moyens. Le jet de dés n'est pas autorisé.");
    return;
  } else if (typeTest.type == "dette impossible") {
    ui.notifications.warn("Votre niveau de ressource ne vous permet pas de vous endetter à ce niveau. Le jet de dés n'est pas autorisé.");
    return;
  }

  // Définition de la formule de base du jet
  let rollFormula = "1d12x + @valeur";

  // Données de base du jet
  let rollData = {
    ressource: label,
    valeur: valeur,
  };

  // Modificateur de difficulté du jet
  if (coutAcquisition) {
    rollData.coutAcquisition = coutAcquisition;
    rollData.difficulte = 7 - coutAcquisition;
    rollFormula += " + @difficulte";
  }

  // Domaine
  if (domaineId) {
    rollData.domaine = actor.items.get(domaineId);
  }

  // Dette
  if (typeTest.type === "dette") {
    rollData.dette = game.trinites.config.dettes[typeTest.dette];
  }

  let rollResult = await new Roll(rollFormula, rollData).roll({ async: true });

  rollData.dieResult = rollResult.dice[0].total;
  rollData.rollTotal = rollResult.total;
  rollData.reussite = rollResult.total >= 12;

  if (envoiMessage) {
    // Construction du jeu de données pour alimenter le template
    let rollStats = {
      ...rollData,
    };

    // Recupération du template
    const messageTemplate = "systems/trinites/templates/partials/dice/jet-ressource.hbs";
    let renderedRoll = await rollResult.render();

    // Assignation des données au template
    let templateContext = {
      actorId: actor.id,
      isTrinite: actor.isTrinite,
      stats: rollStats,
      roll: renderedRoll,
    };

    let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(templateContext).withRoll(rollResult).create();
    await chat.display();
  }

  if (actor.isTrinite) {
    if (rollData.reussite) {
      // Gestion endettement : rollData.dette {diminution, duree}
      if (typeTest.type === "dette") {
        //TODO Ne pas modifier l'acteur s'il y a déjà une diminution en cours
        const updateObj = {};
        updateObj[`system.ressources.${ressource}.diminution`] = rollData.dette.diminution;
        updateObj[`system.ressources.${ressource}.duree`] = rollData.dette.duree;
        actor.update(updateObj);
      }
    } else {
      if (ressource === "richesse") {
        actor.update({ "system.ressources.richesse.epuisee": true });
      } else if (rollData.domaine) {
        rollData.domaine.update({ "system.epuise": true });
      }
    }
  }
}

// Fonction de construction de la boite de dialogue de jet de ressource
async function getJetRessourceOptions({ cfgData = null, useDomaine = false, domaines = null, isTrinite = null }) {
  // Recupération du template
  const template = "systems/trinites/templates/partials/dice/dialog-jet-ressource.hbs";
  const html = await renderTemplate(template, { cfgData: cfgData, useDomaine: useDomaine, domaines: domaines, isTrinite: isTrinite });

  return new Promise((resolve) => {
    const data = {
      title: "Jet de ressource",
      content: html,
      buttons: {
        jet: {
          // Bouton qui lance le jet de dé
          icon: '<i class="fas fa-dice"></i>',
          label: "Jeter les dés",
          callback: (html) => resolve(_processJetRessourceOptions(html[0].querySelector("form"))),
        },
        annuler: {
          // Bouton d'annulation
          label: "Annuler",
          callback: (html) => resolve({ annule: true }),
        },
      },
      default: "jet",
      close: () => resolve({ annule: true }), // Annulation sur fermeture de la boite de dialogue
    };

    // Affichage de la boite de dialogue
    new Dialog(data, null).render(true);
  });
}

// Gestion des données renseignées dans la boite de dialogue de jet de ressource
function _processJetRessourceOptions(form) {
  return {
    coutAcquisition: form.coutAcquisition.value != 0 ? parseInt(form.coutAcquisition.value) : "",
    domaine: form.domaine ? form.domaine.value : "",
  };
}

/**
 *
 * @param {*} valRessource
 * @param {*} coutAcquisition
 * @param {*} endettementCampagne
 * @returns {Object} {type, dette} type : anodin, normal, dette impossibl, dette, impossible ; dette : null ou la valeur du dépassement
 */
function typeTestRessource(valRessource, coutAcquisition, endettementCampagne) {
  const anodin = valRessource - 3;
  const limiteAcquisition = valRessource;
  const limiteEndettement = valRessource + (endettementCampagne ? 6 : 3);

  if (coutAcquisition <= anodin) {
    return {
      type: "anodin",
      dette: null,
    };
  } else if (coutAcquisition <= limiteAcquisition) {
    return {
      type: "normal",
      dette: null,
    };
  } else if (coutAcquisition <= limiteEndettement) {
    let depassement = coutAcquisition - valRessource;

    // Valeur minimum requis dans la ressource du même montant que le dépassement
    if (depassement > valRessource) {
      return {
        type: "dette impossible",
        dette: null,
      };
    } else {
      return {
        type: "dette",
        dette: depassement,
      };
    }
  } else {
    return {
      type: "impossible",
      dette: null,
    };
  }
}

/**
 * Retourne la formule en fonction du nombre de dés
 * @param {*} nbDes
 * @param {*} actor
 * @param {*} modFormula
 * @returns
 */
function _getFormula(nbDes, actor, modFormula) {
  let rollFormula = null;
  if (nbDes == 2) {
    let basePremierDe = (actor.isTrinite ? "1d12x[white]" : "1d12x[black]") + modFormula;
    let baseDeuxiemeDe = "1d12x[black]" + modFormula;
    rollFormula = `{${basePremierDe}, ${baseDeuxiemeDe}}`;
  } else {
    rollFormula = "1d12x" + modFormula;
  }
  return rollFormula;
}

/**
 * Retourne les résultats pour les dés Deva et Archonte
 * @param {*} nbDes
 * @param {*} rollResult
 */
function _getDicesResult(nbDes, rollResult) {
  if (nbDes === 2) {
    const resultDeva = {
      dieResult: rollResult.terms[0].rolls[0].dice[0].total,
      rollTotal: rollResult.terms[0].rolls[0].total,
      reussite: rollResult.terms[0].rolls[0].total >= 12,
    };

    const resultArchonte = {
      dieResult: rollResult.terms[0].rolls[1].dice[0].total,
      rollTotal: rollResult.terms[0].rolls[1].total,
      reussite: rollResult.terms[0].rolls[1].total >= 12,
    };

    return { resultDeva, resultArchonte };
  } else {
    const resultDeva = {
      dieResult: rollResult.terms[0].total,
      rollTotal: rollResult.total,
      reussite: rollResult.total >= 12,
    };
    return { resultDeva };
  }
}

/**
 *
 * @param {*} nbDes
 * @param {*} actor
 * @param {"lumiere","tenebre"} karmaAdam
 * @param {Object{dieResult, rollTotal, reussite}} resultDeva
 * @param {Object{dieResult, rollTotal, reussite}} resultArchonte
 * @returns {Object{deva, archonte}} "echec", "reussite", "detteDeva", "detteArchonte"
 */
function _getResult(nbDes, actor, karmaAdam, resultDeva, resultArchonte) {
  let resultatDeva = "echec";
  let resultatArchonte = "echec";

  if (nbDes == 2) {
    if (actor.isTrinite) {
      if (karmaAdam == "lumiere") {
        if (resultDeva.reussite) {
          resultatDeva = "reussite";
        }
        if (resultArchonte.reussite) {
          resultatArchonte = "detteArchonte";
        }
      } else if (karmaAdam == "tenebre") {
        if (resultArchonte.reussite) {
          resultatArchonte = "reussite";
        }
        if (resultDeva.reussite) {
          resultatDeva = "detteDeva";
        }
      } else {
        if (resultDeva.reussite) {
          resultatDeva = "reussite";
        }
        if (resultArchonte.reussite) {
          resultatArchonte = "reussite";
        }
      }
    }

    if (actor.isArchonteRoi || actor.isLige) {
      if (resultDeva.reussite) {
        resultatDeva = "reussite";
      }
      if (resultArchonte.reussite) {
        resultatArchonte = "reussite";
      }
    }
  }

  if (nbDes == 1) {
    if (resultDeva.reussite) {
      resultatDeva = "reussite";
      resultArchonte = null;
    }
  }

  return { resultatDeva, resultatArchonte };
}

/**
 * Met à jour l'objet modificateur avec toutes les valeurs de dialogOptions
 * @param {*} dialogOptions
 * @param {*} modificateurs
 */
function updateModificateurs(dialogOptions, modificateurs) {
  for (const key in modificateurs) {
    if (modificateurs.hasOwnProperty(key) && dialogOptions.modificateurs.hasOwnProperty(key)) {
      modificateurs[key] = dialogOptions.modificateurs[key];
    }
  }
}

/**
 *
 * @param {*} actor
 * @param {*} modificateurs acceleration et ralentissement
 * @returns
 */
async function handleModificateurs(actor, modificateurs) {
  const effects = [
    { key: "acceleration", multiplier: 3 },
    { key: "ralentissement", multiplier: 3 },
  ];

  let result = {};

  for (const effect of effects) {
    if (modificateurs[effect.key] > 0) {
      const mod = effect.multiplier * modificateurs[effect.key];
      result[effect.key] = mod;
    }
  }

  return result;
}

// Gestion des données renseignées dans la boite de dialogue de jet de compétence ou d'arme
function _processJetCompetenceOptions(form, jetArme) {
  let sansDomaine = false;
  if (form.sansDomaine) {
    sansDomaine = form.sansDomaine.checked;
  }

  let actionLibre = null;
  if (form.actionLibre) {
    actionLibre = parseInt(form.actionLibre.value);
  }

  // Primes et pénalités
  let modificateurKeys = [
    "acceleration",
    "circonspection",
    "efficacite",
    "debordement",
    "prudence",
    "consommation",
    "danger",
    "penaliteDifficulte",
    "facilite",
    "ralentissement",
    "risque",
  ];

  if (jetArme) {
    let modificateursArme = ["attaquesMultiples", "blessureGrave", "blessureNonLetale", "blessurePrecise", "blessureLegere"];
    modificateurKeys.push(...modificateursArme);
  }

  let modificateurs = {};

  for (const key of modificateurKeys) {
    modificateurs[key] = form[key].value !== "0" ? parseInt(form[key].value) : 0;
  }

  return {
    difficulte: form.difficulte.value != 0 ? parseInt(form.difficulte.value) : null,
    sansDomaine: sansDomaine,
    actionLibre: actionLibre,
    modificateurs: modificateurs,
  };
}

/** Jet de Compétence */
export async function jetInitiative({ actor = null } = {}) {
  // Récupération des données de l'acteur
  let actorData = actor.system;

  let valeur = actorData.competences["capricorne"]["rapidite"].valeur;

  // Définition de la formule de base du jet
  let modFormula = " + @valeur";

  // Données de base du jet
  let label = game.i18n.localize(`TRINITES.label.competences.capricorne.rapidite`);

  let rollData = {
    type: "initiative",
    nomPersonnage: actor.name,
    competence: label,
    valeur: valeur,
    typeActor: actor.sousType,
    actorId: actor.id
  };

  let nbDes = actor.nbDes ?? nbDes;
  let rollFormula = _getFormula(nbDes, actor, modFormula);

  let rollResult = await new Roll(rollFormula, rollData).roll({ async: true });

  let { resultDeva, resultArchonte } = _getDicesResult(nbDes, rollResult);

  rollData.resultDeva = resultDeva;
  rollData.initiativeDeva = Math.min(Math.round(resultDeva.rollTotal/2), 12);

  rollData.resultArchonte = resultArchonte;
  rollData.initiativeArchonte = nbDes == 1 ? 0 : Math.min(Math.round(resultArchonte.rollTotal/2), 12);
  rollData.nbDes = nbDes;

  // Construction du jeu de données pour alimenter le template
  let rollStats = {
    ...rollData
  };

  let messageTemplate = "systems/trinites/templates/partials/dice/jet-initiative.hbs";

  let renderedRoll = await rollResult.render();

  // Assignation des données au template
  let templateContext = {
    actorId: actor.id,
    stats: rollStats,
    roll: renderedRoll
  };

  if (actor.type === "pnj" && game.user.isGM) templateContext.rollMode = "gmroll";

  let chat = await new TrinitesChat(actor).withTemplate(messageTemplate).withData(templateContext).withRoll(rollResult).create();
  await chat.display();

  // Retourne la valeur d'initiative
  let initiative = Math.max(rollData.initiativeDeva,rollData.initiativeArchonte);
  return initiative;
}
