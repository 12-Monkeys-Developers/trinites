export async function jetCompetence({actor = null,
    valeur = null,
    label = null,
    difficulte = null,
    modificateurs = null,
    afficherDialog = true,
    envoiMessage = true} = {}) {

    // Si la compétence à une valeur de 0, on gènere le message d'erreur et on annule le jet
    if(valeur == 0) {
        ui.notifications.warn(`Le jet n'est pas autorisé pour une compétence dont la valeur est à zéro.`)
        return null;
    }

    // Affichage de la fenêtre de dialogue (vrai par défaut)
    if(afficherDialog) {
        let dialogOptions = await getJetCompetenceOptions({cfgData: CONFIG.Trinites});
            
        // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'    
        if(dialogOptions.annule) {
            return null;
        }

        // Récupération des données de la fenêtre de dialogue pour ce jet 
        difficulte = dialogOptions.difficulte;
    }

    // Définition de la formule de base du jet
    let baseFormula = "1d12x + @valeur";

    // Données de base du jet
    let rollData = {
        competence: label,
        valeur: valeur
    };

    // Modificateur de difficulté du jet
    if(difficulte) {
        rollData.difficulte = difficulte;
        baseFormula += " + @difficulte";
    }

    let rollFormula = `{${baseFormula}, ${baseFormula}}`;

    let rollResult = await new Roll(rollFormula, rollData).roll({async: true});
    //console.log(rollResult);
        
    let resultDeva = {
        rollFormula: rollResult.terms[0].rolls[0].formula,
        dieResult: rollResult.terms[0].rolls[0].dice[0].total,
        rollResult: rollResult.terms[0].rolls[0].result,
        rollTotal: rollResult.terms[0].rolls[0].total
    }
    rollData.resultDeva = resultDeva;

    let resultArchonte = {
        rollFormula: rollResult.terms[0].rolls[1].formula,
        dieResult: rollResult.terms[0].rolls[1].dice[0].total,
        rollResult: rollResult.terms[0].rolls[1].result,
        rollTotal: rollResult.terms[0].rolls[1].total
    }
    rollData.resultArchonte = resultArchonte;

    //console.log(rollData.resultDeva);
        
    if(envoiMessage) {
        // Construction du jeu de données pour alimenter le template
        let rollStats = {
            ...rollData
        }

        // Recupération du template
        const messageTemplate = "systems/trinites/templates/partials/dice/jet-competence.hbs"; 
        let renderedRoll = await rollResult.render();

        // Assignation des données au template
        let templateContext = {
            stats : rollStats,
            roll: renderedRoll
        }

        // Construction du message
        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            roll: rollResult,
            content: await renderTemplate(messageTemplate, templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        }

        // Affichage du message
        await ChatMessage.create(chatData);
    }
}

// Fonction de contsruction de la boite de dialogue de jet de compétence
async function getJetCompetenceOptions({cfgData = null}) {
    // Recupération du template
    const template = "systems/trinites/templates/partials/dice/dialog-jet-competence.hbs";
    const html = await renderTemplate(template, {data: cfgData});

    return new Promise( resolve => {
        const data = {
            title: "Jet de compétence",
            content: html,
            buttons: {
                jet: { // Bouton qui lance le jet de dé
                    icon: '<i class="fas fa-dice"></i>',
                    label: "Jet",
                    callback: html => resolve(_processJetCompetenceOptions(html[0].querySelector("form")))
                },
                annuler: { // Bouton d'annulation
                    label: "Annuler",
                    callback: html => resolve({annule: true})
                }
            },
            default: "jet",
            close: () => resolve({annule: true}) // Annulation sur fermeture de la boite de dialogue
        }

        // Affichage de la boite de dialogue
        new Dialog(data, null).render(true);
    });        
}

    // Gestion des données renseignées dans la boite de dialogue de jet de compétence
function _processJetCompetenceOptions(form) {
    
    return {
        difficulte: form.difficulte.value != 0 ? parseInt(form.difficulte.value) : ""
    }
}

