export async function jetCompetence({actor = null,
    signe = null,
    competence = null,
    difficulte = null,
    sansDomaine = null,
    type = null,
    aura = null,
    afficherDialog = true,
    envoiMessage = true} = {}) {

        // Récupération des données de l'acteur
        let actorData = actor.data.data;

        let valeur = actorData.competences[signe][competence].valeur;
        let label = actorData.competences[signe][competence].label
        let compOuverte = actorData.competences[signe][competence].ouverte;
        let karmaAdam = actorData.trinite.adam.karma.type;

        // Si la compétence à une valeur de 0, on gènere le message d'erreur et on annule le jet
        if(valeur == 0 && !compOuverte) {
            ui.notifications.warn(`Le jet n'est pas autorisé pour une compétence fermée dont la valeur est à zéro.`)
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
            sansDomaine = dialogOptions.sansDomaine;
        }

        if(sansDomaine) {
            if(compOuverte) {
                valeur = actorData.signes[signe].valeur;
            }
            else {
                ui.notifications.warn(`Le jet n'est pas autorisé pour une compétence fermée dont la valeur est à zéro.`)
                return null;
            }
        }        

        // Définition de la formule de base du jet
        let baseFormula = "1d12x + @valeur";

        // Données de base du jet
        let rollData = {
            nomPersonnage : actor.data.name,
            competence: label,
            valeur: valeur,
            karmaAdam: karmaAdam
        };

        if(type == "souffle") {
            console.log(aura);

            if(aura.data.signe == actorData.themeAstral.archetype) {
                difficulte = 6;
            }
            else if(aura.data.signe == actorData.themeAstral.ascendant1 || aura.data.signe == actorData.themeAstral.ascendant2) {
                difficulte = 3;
            }
            
            rollData.deploieInit = aura.data.deploiement;
            rollData.aura = aura;
        }

        // Modificateur de difficulté du jet
        if(difficulte) {
            rollData.difficulte = difficulte;
            baseFormula += " + @difficulte";
        }

        let rollFormula = `{${baseFormula}, ${baseFormula}}`;

        let rollResult = await new Roll(rollFormula, rollData).roll({async: true});
        
        let resultDeva = {
            dieResult: rollResult.terms[0].rolls[0].dice[0].total,
            rollTotal: rollResult.terms[0].rolls[0].total,
            reussite: rollResult.terms[0].rolls[0].total >= 12
        }
        rollData.resultDeva = resultDeva;

        let resultArchonte = {
            dieResult: rollResult.terms[0].rolls[1].dice[0].total,
            rollTotal: rollResult.terms[0].rolls[1].total,
            reussite: rollResult.terms[0].rolls[1].total >= 12
        }
        rollData.resultArchonte = resultArchonte;
        
        // Gestion de la réussite selon le Karma
        let resultatJet = "echec";
        if(karmaAdam == "lumiere") {
            if(resultDeva.reussite) {
                resultatJet = "reussite";    
            }
            else if(resultArchonte.reussite) {
                resultatJet = "detteArchonte";
            }
        }
        else if(karmaAdam == "tenebre") {
            if(resultArchonte.reussite) {
                resultatJet = "reussite";    
            }
            else if(resultDeva.reussite) {
                resultatJet = "detteDeva";
            }
        }
        else {
            if(resultDeva.reussite || resultArchonte.reussite) {
                resultatJet = "reussite";
            }
        }
        rollData.resultatJet = resultatJet;

        if(envoiMessage) {
            // Construction du jeu de données pour alimenter le template
            let rollStats = {
                ...rollData
            }

            let messageTemplate;
            // Recupération du template
            if(type == "souffle") {
                messageTemplate = "systems/trinites/templates/partials/dice/jet-souffle.hbs"; 
            }
            else {
                messageTemplate = "systems/trinites/templates/partials/dice/jet-competence.hbs"; 
            }
            
            let renderedRoll = await rollResult.render();

            // Assignation des données au template
            let templateContext = {
                actorId : actor.id,
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

    // Fonction de construction de la boite de dialogue de jet de compétence
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
                        label: "Jeter les dés",
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
        let sansDomaine = false;
        if(form.sansDomaine) {
            sansDomaine = form.sansDomaine.checked;
        }

        return {
            difficulte: form.difficulte.value != 0 ? parseInt(form.difficulte.value) : "",
            sansDomaine: sansDomaine
        }
    }

export async function jetRessource({actor = null,
    ressource = null,
    coutAcquisition = null,
    domaineId = null,
    afficherDialog = true,
    envoiMessage = true} = {}) {

        // Récupération des données de l'acteur
        let actorData = actor.data.data;

        let valeur = actorData.ressources[ressource].valeur - actorData.ressources[ressource].diminution;
        let ressEpuisee = actorData.ressources[ressource].epuisee
        let label = actorData.ressources[ressource].label;
        let domaines = actor.items.filter(function (item) { return item.type == "domaine" && !item.data.data.epuise});

        // Pas de jet si Richesse est épuisée ou tous les dommaines épuisés
        if(ressource == "richesse" && ressEpuisee) {
            ui.notifications.warn("Votre Richesse est épuisée. Le jet de dés n'est pas autorisé.")
            return;
        }
        else {
            if(domaines.length == 0) {
                ui.notifications.warn("Tous vos Domaines sont épuisés. Le jet de dés n'est pas autorisé.")
            return;
            }
        }

        // Affichage de la fenêtre de dialogue (vrai par défaut)
        if(afficherDialog) {
            let dialogOptions = await getJetRessourceOptions({cfgData: CONFIG.Trinites, useDomaine: ressource != "richesse", domaines: domaines});
            
            // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'    
            if(dialogOptions.annule) {
                return null;
            }

            // Récupération des données de la fenêtre de dialogue pour ce jet 
            coutAcquisition = dialogOptions.coutAcquisition;
            domaineId = dialogOptions.domaine;
        }

        // Calcul des paramètres selon le cout d'acquisition
        let typeTest = typeTestRessource(valeur, coutAcquisition, game.settings.get("trinites","limEndettementCampagne"));
        console.log(typeTest);

        if(typeTest.type == "anodin") {
            ui.notifications.info("Cette acquisition est anodine. Elle ne nécessite pas de jet de dés.");
            return;
        }
        else if(typeTest.type == "impossible") {
            ui.notifications.warn("Cette acquisition est au-dessus de vos moyens. Le jet de dés n'est pas autorisé.")
            return;
        }
        else if(typeTest.type == "dette impossible") {
            ui.notifications.warn("Votre niveau de ressource ne vous permet pas de vous endetter à ce niveau. Le jet de dés n'est pas autorisé.")
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
        if(coutAcquisition) {
            rollData.coutAcquisition = coutAcquisition;
            rollData.difficulte = 7 - coutAcquisition;
            rollFormula += " + @difficulte";
        }

        // Domaine
        if(domaineId) {
            rollData.domaine = actor.items.get(domaineId);
        }

        // Dette 
        if(typeTest.type == "dette") {
            rollData.dette = CONFIG.Trinites.dettes[typeTest.dette];      
        }

        let rollResult = await new Roll(rollFormula, rollData).roll({async: true});

        rollData.dieResult = rollResult.dice[0].total;
        rollData.rollTotal = rollResult.total;
        rollData.reussite = rollResult.total >= 12;

        if(envoiMessage) {
            // Construction du jeu de données pour alimenter le template
            let rollStats = {
                ...rollData
            }

            // Recupération du template
            const messageTemplate = "systems/trinites/templates/partials/dice/jet-ressource.hbs"; 
            let renderedRoll = await rollResult.render();

            // Assignation des données au template
            let templateContext = {
                actorId : actor.id,
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

        if(rollData.reussite) {
            // Gestion endettement
        }
        else {
            if(ressource == "richesse") {
                actor.update({"data.ressources.richesse.epuisee": true});
            }
            else if (rollData.domaine){
                rollData.domaine.update({"data.epuise": true});
            }
        }
    }

    // Fonction de construction de la boite de dialogue de jet de ressource
    async function getJetRessourceOptions({cfgData = null, useDomaine = false, domaines = null}) {
        // Recupération du template
        const template = "systems/trinites/templates/partials/dice/dialog-jet-ressource.hbs";
        const html = await renderTemplate(template, {data: cfgData, useDomaine: useDomaine, domaines: domaines});

        return new Promise( resolve => {
            const data = {
                title: "Jet de ressource",
                content: html,
                buttons: {
                    jet: { // Bouton qui lance le jet de dé
                        icon: '<i class="fas fa-dice"></i>',
                        label: "Jeter les dés",
                        callback: html => resolve(_processJetRessourceOptions(html[0].querySelector("form")))
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

    // Gestion des données renseignées dans la boite de dialogue de jet de ressource
    function _processJetRessourceOptions(form) {
        return {
            coutAcquisition: form.coutAcquisition.value != 0 ? parseInt(form.coutAcquisition.value) : "",
            domaine: form.domaine ? form.domaine.value : ""
        }
    }

    function typeTestRessource(valRessource, coutAcquisition, endetteCampagne) {
        if(coutAcquisition <= valRessource - 3) {
            return {
                type: "anodin",
                dette: null
            }
        }
        else if(coutAcquisition <= valRessource) {
            return {
                type: "normal",
                dette: null
            }
        }
        else if(coutAcquisition <= valRessource + endetteCampagne ? 6 : 3) {
            let depassement = coutAcquisition - valRessource;
            if(depassement > valRessource) {
                return {
                    type: "dette impossible",
                    dette: null
                }
            }
            else {
                return {
                    type: "dette",
                    dette: depassement
                }
            }
        }
        else { 
            return {
                type: "impossible",
                dette: null
            }
        }
    }