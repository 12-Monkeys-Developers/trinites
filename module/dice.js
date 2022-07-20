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

        afficherDialog = false;

        // Affichage de la fenêtre de dialogue (vrai par défaut)
        if(afficherDialog) {
            //let dialogOptions = await getJetCompetenceOptions({cfgData: CONFIG.Trinites});

            // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
            if(dialogOptions.annule) {
                return null;
            }

            // Récupération des données de la fenêtre de dialogue pour ce jet 
            difficulte = dialogOptions.difficulte;
        }

        // Définition de la formule de base du jet
        let rollFormula = "1d12 + @valeur";

        // Données de base du jet
        let rollData = {
            valeur: valeur
        };

        // Somme des modificateurs d'art magique
        if(difficulte) {
            rollData.difficulte = difficulte;
            rollFormula += " + @difficulte";
        }

        //let rollFormula = `{${baseFormula}, ${baseFormula}}`;

        let rollResultDeva = await new Roll(rollFormula, rollData).roll({async: true});
        let rollResultArchonte = await new Roll(rollFormula, rollData).roll({async: true});

        //console.log(rollResult);

        console.log(rollResultDeva.dice[0].results[0]);
        console.log(rollResultDeva.result);
        console.log(rollResultDeva.total);

        console.log(rollResultArchonte.dice[0].results[0]);
        console.log(rollResultArchonte.result);
        console.log(rollResultArchonte.total);

        if(envoiMessage) {
            // Construction du jeu de données pour alimenter le template
            let rollStats = {
                ...rollData
            }

            // Recupération du template
            const messageTemplate = "systems/trinites/templates/partials/dice/jet-competence.hbs"; 
            let renderedRollDeva = await rollResultDeva.render();
            let renderedRollArchonte = await rollResultArchonte.render();

            // Assignation des données au template
            let templateContext = {
                stats : rollStats,
                rollDeva: renderedRollDeva,
                rollArchonte: renderedRollArchonte
            }

            // Construction du message
            let chatData = {
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                roll: rollResultDeva,
                content: await renderTemplate(messageTemplate, templateContext),
                sound: CONFIG.sounds.dice,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL
            }

            // Affichage du message
            await ChatMessage.create(chatData);
        }
        /*
        var diceResults = [];
        diceResults.push(roll.dice[0].total);
        diceResults.push(roll.dice[1].total);

        <div class="dice-tooltip"><div class="dice-rolls" style="display:flex">
            <div class="roll die d12" style="float:none; margin:3px;">${diceResults[0]}</div>
            <div class="roll die d10" style="float:none; margin:3px;">${diceResults[1]}</div>
        </div>
        */

    }