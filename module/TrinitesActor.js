export default class TrinitesActor extends Actor {

    prepareData() {
        super.prepareData();
        let data = this.data.data;

        if(this.type == "trinite" || this.type == "archonteRoi")
        {
            /*----------------------------------
            ---- Calcul des bonus de Signes ----
            ----------------------------------*/

            for(let[keySigne, signe] of Object.entries(data.signes)) {
                if(data.themeAstral.archetype == keySigne) {
                    signe.valeur = 6;
                }
                else if(data.themeAstral.ascendant1 == keySigne || data.themeAstral.ascendant2 == keySigne) {
                    signe.valeur = 4;
                }
                else if(data.themeAstral.descendant1 == keySigne || data.themeAstral.descendant2 == keySigne || data.themeAstral.descendant3 == keySigne) {
                    signe.valeur = 2;
                }
                else {
                    signe.valeur = 0;
                }
            }

            /*------------------------------------------
            ---- Calcul des valeurs des compétences ----
            ------------------------------------------*/
        
            for(let[keySigne, compsSigne] of Object.entries(data.competences)) {
                for(let[keyComp, competence] of Object.entries(compsSigne)) {
                    if(data.competences[keySigne][keyComp].ouverte == 1) {
                        data.competences[keySigne][keyComp].valeur = data.competences[keySigne][keyComp].base + data.signes[keySigne].valeur;
                    }
                    else {
                        if(data.competences[keySigne][keyComp].base > 0) {
                            data.competences[keySigne][keyComp].valeur = data.competences[keySigne][keyComp].base + data.signes[keySigne].valeur;
                        }
                        else {
                            data.competences[keySigne][keyComp].valeur = 0;
                        }
                    }
                }
            }
        }

        if(this.type == "trinite") {
            /*-----------------------------------
            ---- Calcul des valeurs de Karma ----
            -----------------------------------*/

            //recalcul des valeurs de karma afin qu'elles ne dépasent pas le max
            if(data.trinite.deva.karma.value > data.trinite.deva.karma.max) { data.trinite.deva.karma.value = data.trinite.deva.karma.max; }
            if(data.trinite.archonte.karma.value > data.trinite.archonte.karma.max) { data.trinite.archonte.karma.value = data.trinite.archonte.karma.max; }

            // La valeur de Karma de l'adam est calculée en fonction des valeurs du Deva et de l'Archonte
            data.trinite.adam.karma.max = Math.abs(data.trinite.deva.karma.max - data.trinite.archonte.karma.max);
            if(data.trinite.adam.karma.value > data.trinite.adam.karma.max) { data.trinite.adam.karma.value = data.trinite.adam.karma.max; }

            // Son type dépend du plus fort des deux
            if(data.trinite.adam.karma.max == 0) {
                data.trinite.adam.karma.type = "";
            }
            else {
                data.trinite.adam.karma.type = data.trinite.deva.karma.max > data.trinite.archonte.karma.max ? "lumiere" : "tenebre";
            }

            /*--------------
            ---- Divers ----
            --------------*/

            if(data.experience.disponible > data.experience.totale) {
                data.experience.disponible = data.experience.totale;
            }
        }

        if(this.type == "archonteRoi") {
            /*------------------------------------
            ---- Calcul de la valeur de Karma ----
            ------------------------------------*/

            //recalcul des valeurs de karma afin qu'elles ne dépasent pas le max            
            if(data.archonteRoi.karma.value > data.archonteRoi.karma.max) { data.archonteRoi.karma.value = data.archonteRoi.karma.max; }
        }

        /*----------------------------------------
        ---- Calcul des valeurs de ressources ----
        ----------------------------------------*/

        // L'influence ne peut dépasser la valeur de réseau
        if(data.ressources.influence.valeur > data.ressources.reseau.valeur) {
            data.ressources.influence.valeur = data.ressources.reseau.valeur;
        }

        // Les diminutions ne peuvent dépasser le score de ressource
        if(data.ressources.richesse.diminution > data.ressources.richesse.valeur) {
            data.ressources.richesse.diminution = data.ressources.richesse.valeur;
        }

        if(data.ressources.influence.diminution > data.ressources.influence.valeur) {
            data.ressources.influence.diminution = data.ressources.influence.valeur;
        }

        if(data.ressources.reseau.diminution > data.ressources.reseau.valeur) {
            data.ressources.reseau.diminution = data.ressources.reseau.valeur;
        }

        /*-----------------------------------
        ---- Calcul des valeurs de sante ----
        -----------------------------------*/

        // Points de vie maxi
        data.ligneVie1 = data.pointsLigneVie;
        data.ligneVie2 = data.pointsLigneVie * 2;
        data.nbPointsVieMax = data.pointsLigneVie * 3;

        //Etat de santé
        if(data.nbBlessure == 0) {
            data.etatSante = "indemne";
        }
        else if (data.nbBlessure <= data.ligneVie1) {
            data.etatSante = "endolori";
        }
        else if(data.nbBlessure <= data.ligneVie2) {
            data.etatSante = "blesse";
        }
        else {
            data.etatSante = "inconscient";
        }
    }

    // Nombre de points de Karma disponible du type donné (Lumière ou Ténèbre)
    karmaDisponible(typeKarma) {
        let data = this.data.data;
        let karmaDisponible = 0;

        if(typeKarma == "neutre") {
            karmaDisponible += data.trinite.deva.karma.value;
            karmaDisponible += data.trinite.archonte.karma.value;
            karmaDisponible += data.trinite.adam.karma.value;
        }
        else {
            if(typeKarma == "lumiere") {
                karmaDisponible += data.trinite.deva.karma.value;
            } 
            else if (typeKarma == "tenebre") {
                karmaDisponible += data.trinite.archonte.karma.value;
            }
    
            if(typeKarma == data.trinite.adam.karma.type) {
                karmaDisponible += data.trinite.adam.karma.value;
            }
        }

        return karmaDisponible;
    }

    // Cout du pouvoir selon l'Affinité du personnage
    coutPouvoir(typePouvoir) {
        let data = this.data.data;
        
        if(data.themeAstral.affinite == typePouvoir) { return 1; } else { return 2; } 
    }

    // Vide toutes les sources de Karma (Esprit et Adam) du type donné
    viderKarma(typeKarma) {
        let data = this.data.data;

        if(typeKarma == "lumiere") {
            this.update({"data.trinite.deva.karma.value": 0});
        }
        else if (typeKarma == "tenebre") {
            this.update({"data.trinite.archonte.karma.value": 0});
        }

        if(typeKarma == data.trinite.adam.karma.type) {
            this.update({"data.trinite.adam.karma.value": 0});
        }
    }

    // Consomme un nombre de points de Karma (Esprit) du type donné
    consommerKarma(typeKarma, coutPouvoir) {
        let data = this.data.data;

        if(typeKarma == "lumiere") {
            this.update({"data.trinite.deva.karma.value": data.trinite.deva.karma.value - coutPouvoir});
        }
        else if (typeKarma == "tenebre") {
            this.update({"data.trinite.archonte.karma.value": data.trinite.archonte.karma.value - coutPouvoir});
        }
    }

    // Mise à jour de la réserve de karma du type donné à la valeur cible
    majKarma(reserve, valeur) {
        let reserveData = `data.trinite.${reserve}.karma.value`;
        this.update({[reserveData]: valeur});
    }
}