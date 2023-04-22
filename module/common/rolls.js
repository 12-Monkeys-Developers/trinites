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
  let prime = null;
  let penalite = null;

  // Affichage de la fenêtre de dialogue (vrai par défaut)
  if (afficherDialog) {
    let dialogOptions = await getJetCompetenceOptions({ cfgData: game.trinites.config, compCombat: compCombat, compLibre: compLibre, infoPrimesID: infoPrimesID });

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if (dialogOptions.annule) {
      return null;
    }

    // Récupération des données de la fenêtre de dialogue pour ce jet
    difficulte = dialogOptions.difficulte;
    sansDomaine = dialogOptions.sansDomaine;
    actionLibre = dialogOptions.actionLibre;
    prime = dialogOptions.prime;
    penalite = dialogOptions.penalite;
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
  // Données de base du jet
  let label = game.i18n.localize(`TRINITES.label.competences.${signe}.${competence}`);
  let karmaAdam = actor.isTrinite ? actorData.trinite.adam.karma.type : "tenebre";

  let rollData = {
    nomPersonnage: actor.name,
    competence: label,
    valeur: valeur,
    karmaAdam: karmaAdam,
    typeActor: actor.sousType
  };

  // Bonus de difficulte en cas de jet d'Emprise - Souffle
  if (type == "souffle") {
    if (aura.system.signe == actorData.themeAstral.archetype) {
      difficulte = 6;
    } else if (aura.system.signe == actorData.themeAstral.ascendant1 || aura.system.signe == actorData.themeAstral.ascendant2) {
      difficulte = 3;
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

  let rollFormula = null;

  nbDes = actor.nbDes ?? nbDes;

  if (nbDes == 2) {
    let basePremierDe = (actor.isTrinite ? "1d12x[white]" : "1d12x[black]") + modFormula;
    let baseDeuxiemeDe = "1d12x[black]" + modFormula;
    rollFormula = `{${basePremierDe}, ${baseDeuxiemeDe}}`;
  } else {
    rollFormula = "1d12x" + modFormula;
  }

  let rollResult = await new Roll(rollFormula, rollData).roll({ async: true });

  let resultDeva;
  let resultArchonte;

  if (nbDes === 2) {
    resultDeva = {
      dieResult: rollResult.terms[0].rolls[0].dice[0].total,
      rollTotal: rollResult.terms[0].rolls[0].total,
      reussite: rollResult.terms[0].rolls[0].total >= 12,
    };
    rollData.resultDeva = resultDeva;

    resultArchonte = {
      dieResult: rollResult.terms[0].rolls[1].dice[0].total,
      rollTotal: rollResult.terms[0].rolls[1].total,
      reussite: rollResult.terms[0].rolls[1].total >= 12,
    };
    rollData.resultArchonte = resultArchonte;
  } else {
    resultDeva = {
      dieResult: rollResult.terms[0].total,
      rollTotal: rollResult.total,
      reussite: rollResult.total >= 12,
    };
    rollData.resultDeva = resultDeva;
  }

  // Gestion de la réussite selon le Karma
  let resultatJet = "echec";

  if (nbDes == 2) {
    if (actor.isTrinite) {
      if (karmaAdam == "lumiere") {
        if (resultDeva.reussite) {
          resultatJet = "reussite";
        } else if (resultArchonte.reussite) {
          resultatJet = "detteArchonte";
        }
      } else if (karmaAdam == "tenebre") {
        if (resultArchonte.reussite) {
          resultatJet = "reussite";
        } else if (resultDeva.reussite) {
          resultatJet = "detteDeva";
        }
      } else {
        if (resultDeva.reussite || resultArchonte.reussite) {
          resultatJet = "reussite";
        }
      }
    }
  
    if (actor.isArchonteRoi || actor.isLige) {
      if (resultDeva.reussite || resultArchonte.reussite) {
        resultatJet = "reussite";
      }
    }
  }
  else {
    if (resultDeva.reussite) {
      resultatJet = "reussite";
    }
  }

  rollData.resultatJet = resultatJet;
  rollData.nbDes = nbDes;

  if (envoiMessage) {
    // Construction du jeu de données pour alimenter le template
    let rollStats = {
      ...rollData
    };

    let messageTemplate;
    // Recupération du template
    if (type == "souffle") {
      messageTemplate = "systems/trinites/templates/partials/dice/jet-souffle.hbs";
    } else {
      messageTemplate = "systems/trinites/templates/partials/dice/jet-competence.hbs";
    }

    let renderedRoll = await rollResult.render();

    // Assignation des données au template
    let templateContext = {
      actorId: actor.id,
      stats: rollStats,
      roll: renderedRoll
    };

    await new TrinitesChat(actor).withTemplate(messageTemplate).withData(templateContext).withRoll(rollResult).create();
  }
}

// Fonction de construction de la boite de dialogue de jet de compétence
async function getJetCompetenceOptions({ cfgData = null, compCombat = false, compLibre = false, infoPrimesID = null }) {
  // Recupération du template
  const template = "systems/trinites/templates/partials/dice/dialog-jet-competence.hbs";
  const html = await renderTemplate(template, { cfgData: cfgData, compCombat: compCombat, compLibre: compLibre, infoPrimesID: infoPrimesID });

  return new Promise((resolve) => {
    const data = {
      title: "Jet de compétence",
      content: html,
      buttons: {
        jet: {
          // Bouton qui lance le jet de dé
          icon: '<i class="fas fa-dice"></i>',
          label: "Jeter les dés",
          callback: (html) => resolve(_processJetCompetenceOptions(html[0].querySelector("form"))),
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

// Gestion des données renseignées dans la boite de dialogue de jet de compétence
function _processJetCompetenceOptions(form) {
  let sansDomaine = false;
  if (form.sansDomaine) {
    sansDomaine = form.sansDomaine.checked;
  }

  let actionLibre = null;
  if (form.actionLibre) {
    actionLibre = parseInt(form.actionLibre.value);
  }

  return {
    difficulte: form.difficulte.value != 0 ? parseInt(form.difficulte.value) : null,
    sansDomaine: sansDomaine,
    actionLibre: actionLibre,
    prime: form.prime.value != "aucun" ? form.prime.value : null,
    penalite: form.penalite.value != "aucun" ? form.penalite.value : null,
  };
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
    valeur: valeur
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
      ...rollData
    };

    // Recupération du template
    const messageTemplate = "systems/trinites/templates/partials/dice/jet-ressource.hbs";
    let renderedRoll = await rollResult.render();

    // Assignation des données au template
    let templateContext = {
      actorId: actor.id,
      isTrinite: actor.isTrinite,
      stats: rollStats,
      roll: renderedRoll
    };

    await new TrinitesChat(actor).withTemplate(messageTemplate).withData(templateContext).withRoll(rollResult).create();
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
          callback: (html) => resolve(_processJetRessourceOptions(html[0].querySelector("form")))
        },
        annuler: {
          // Bouton d'annulation
          label: "Annuler",
          callback: (html) => resolve({ annule: true })
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

/** Jet d'Arme' */
export async function jetArme({
  nbDes = null,
  actor = null,
  signe = null,
  competence = null,
  arme = null,
  type = null,
  difficulte = null,
  afficherDialog = true,
  envoiMessage = true,
} = {}) {
  // Récupération des données de l'acteur
  let actorData = actor.system;

  // Informations nécessaires à la fenêtre de dialogue
  // ID du journal de description des primes et pénalités
  let infoPrimesID = game.settings.get("trinites", "lienJournalPrimesPenalites");

  // Valeurs récupérées par la fenêtre de dialogue
  let actionLibre = null;
  let prime = null;
  let penalite = null;

  // Affichage de la fenêtre de dialogue (vrai par défaut)
  if (afficherDialog) {
    let dialogOptions = await getJetArmeOptions({ cfgData: game.trinites.config, infoPrimesID: infoPrimesID });

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if (dialogOptions.annule) {
      return null;
    }

    // Récupération des données de la fenêtre de dialogue pour ce jet
    difficulte = dialogOptions.difficulte;
    actionLibre = dialogOptions.actionLibre;
    prime = dialogOptions.prime;
    penalite = dialogOptions.penalite;
  }

  let modFormula = " + @valeur";

  // Données de base du jet
  let valeur = actorData.competences[signe][competence].valeur;
  let label = game.i18n.localize(`TRINITES.label.competences.${signe}.${competence}`);
  let karmaAdam = actor.isTrinite ? actorData.trinite.adam.karma.type : "tenebre";

  let rollData = {
    nomPersonnage: actor.name,
    competence: label,
    valeur: valeur,
    karmaAdam: karmaAdam,
    typeActor: actor.sousType,
    typeArme: type,
    arme: arme
  };

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

  let rollFormula = null;

  nbDes = actor.nbDes ?? nbDes;

  if (nbDes == 2) {
    let basePremierDe = (actor.isTrinite ? "1d12x[white]" : "1d12x[black]") + modFormula;
    let baseDeuxiemeDe = "1d12x[black]" + modFormula;
    rollFormula = `{${basePremierDe}, ${baseDeuxiemeDe}}`;
  } else {
    rollFormula = "1d12x" + modFormula;
  }

  let rollResult = await new Roll(rollFormula, rollData).roll({ async: true });
  let resultDeva;
  let resultArchonte;

  if (nbDes === 2) {
    resultDeva = {
      dieResult: rollResult.terms[0].rolls[0].dice[0].total,
      rollTotal: rollResult.terms[0].rolls[0].total,
      reussite: rollResult.terms[0].rolls[0].total >= 12,
    };
    rollData.resultDeva = resultDeva;

    resultArchonte = {
      dieResult: rollResult.terms[0].rolls[1].dice[0].total,
      rollTotal: rollResult.terms[0].rolls[1].total,
      reussite: rollResult.terms[0].rolls[1].total >= 12,
    };
    rollData.resultArchonte = resultArchonte;
  } else {
    resultDeva = {
      dieResult: rollResult.terms[0].total,
      rollTotal: rollResult.total,
      reussite: rollResult.total >= 12,
    };
    rollData.resultDeva = resultDeva;
  }

  // Gestion de la réussite selon le Karma
  let resultatJet = "echec";

  if (nbDes == 2) {
    if (actor.isTrinite) {
      if (karmaAdam == "lumiere") {
        if (resultDeva.reussite) {
          resultatJet = "reussite";
        } else if (resultArchonte.reussite) {
          resultatJet = "detteArchonte";
        }
      } else if (karmaAdam == "tenebre") {
        if (resultArchonte.reussite) {
          resultatJet = "reussite";
        } else if (resultDeva.reussite) {
          resultatJet = "detteDeva";
        }
      } else {
        if (resultDeva.reussite || resultArchonte.reussite) {
          resultatJet = "reussite";
        }
      }
    }
  
    if (actor.isArchonteRoi || actor.isLige) {
      if (resultDeva.reussite || resultArchonte.reussite) {
        resultatJet = "reussite";
      }
    }
  }
  else {
    if (resultDeva.reussite) {
      resultatJet = "reussite";
    }
  }

  rollData.resultatJet = resultatJet;
  rollData.nbDes = nbDes;

  if (envoiMessage) {
    // Construction du jeu de données pour alimenter le template
    let rollStats = {
      ...rollData
    };

    // Recupération du template
    let messageTemplate = "systems/trinites/templates/partials/dice/jet-arme.hbs";
    let renderedRoll = await rollResult.render();

    // Assignation des données au template
    let templateContext = {
      actorId: actor.id,
      stats: rollStats,
      roll: renderedRoll
    };

    await new TrinitesChat(actor).withTemplate(messageTemplate).withData(templateContext).withRoll(rollResult).create();
  }
}

// Fonction de construction de la boite de dialogue de jet de compétence
async function getJetArmeOptions({ cfgData = null, infoPrimesID = null }) {
  // Recupération du template
  const template = "systems/trinites/templates/partials/dice/dialog-jet-arme.hbs";
  const html = await renderTemplate(template, { cfgData: cfgData, compCombat:true, infoPrimesID: infoPrimesID });

  return new Promise((resolve) => {
    const data = {
      title: "Jet de combat",
      content: html,
      buttons: {
        jet: {
          // Bouton qui lance le jet de dé
          icon: '<i class="fas fa-dice"></i>',
          label: "Jeter les dés",
          callback: (html) => resolve(_processJetArmeOptions(html[0].querySelector("form")))
        },
        annuler: {
          // Bouton d'annulation
          label: "Annuler",
          callback: (html) => resolve({ annule: true })
        },
      },
      default: "jet",
      close: () => resolve({ annule: true }), // Annulation sur fermeture de la boite de dialogue
    };

    // Affichage de la boite de dialogue
    new Dialog(data, null).render(true);
  });
}

// Gestion des données renseignées dans la boite de dialogue de jet de compétence
function _processJetArmeOptions(form) {
  let actionLibre = null;
  if (form.actionLibre) {
    actionLibre = parseInt(form.actionLibre.value);
  }

  return {
    difficulte: form.difficulte.value != 0 ? parseInt(form.difficulte.value) : null,
    actionLibre: actionLibre,
    prime: form.prime.value != "aucun" ? form.prime.value : null,
    penalite: form.penalite.value != "aucun" ? form.penalite.value : null,
  };
}
