export default class DepenseKarmaFormApplication extends FormApplication {
    constructor(actor, trinite, typeKarma, typePouvoir, coutPouvoir) {
        super();
        this.actor = actor;
        this.trinite = trinite;
        this.typeKarma = typeKarma;
        this.typePouvoir = typePouvoir
        this.coutPouvoir = coutPouvoir;
      }
    
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ['form'],
          popOut: true,
          template: "systems/trinites/templates/application/dep-karma-form-app.hbs",
          id: "dep-karma-app",
          title: game.i18n.localize("Sélection de la source de Karma"),
          height: 200,
          width: 400,
          resizable: true
        });
      }
    
      getData() {
        // Send data to the template
        console.log(this.trinite);

        let templateData = {
            typeKarma: this.typeKarma,
            coutPouvoir: this.coutPouvoir,
            typePouvoir: this.typePouvoir,
            configData: CONFIG.Trinites
        };

        let karmaDeva = {
          valeurInit: this.trinite.deva.karma.value,
          valeur: this.trinite.deva.karma.value
        };

        let karmaArchonte = {
          valeurInit: this.trinite.archonte.karma.value,
          valeur: this.trinite.archonte.karma.value
        };

        let karmaAdam = {
          type: this.trinite.adam.karma.type,
          valeurInit: this.trinite.adam.karma.value,
          valeur: this.trinite.adam.karma.value
        };
      
        if(this.typeKarma == "lumiere") {
          templateData.karmaDeva = karmaDeva;
          templateData.karmaAdam = this.typeKarma == karmaAdam.type ? karmaAdam : "";
        }
        else if(this.typeKarma == "tenebre") {
          templateData.karmaArchonte = karmaArchonte;
          templateData.karmaAdam = this.typeKarma == karmaAdam.type ? karmaAdam : "";
        }
        else {
          templateData.karmaDeva = karmaDeva;
          templateData.karmaArchonte = karmaArchonte;
          templateData.karmaAdam = karmaAdam;
        }
        
        return templateData;
      }
    
      activateListeners(html) {
        super.activateListeners(html);
      }
    
      async _updateObject(event, formData) {
            this.render();

            console.log(Object.entries(formData));

          /* for (const [key, value] of Object.entries(formData)) { 
             let splitArray = key.split('.');
            if(splitArray[1] == "domaines") {
              if(value != "aucun") {
                this.familleComp.competences[splitArray[0]].domaines[splitArray[2]][splitArray[3]] = value;
              }
              else {
                this.familleComp.competences[splitArray[0]].domaines[splitArray[2]][splitArray[3]] = "";
              }
            } 
            else {
              if(value != "aucun") {
                this.familleComp.competences[splitArray[0]][splitArray[1]] = value;
              }
              else {
                this.familleComp.competences[splitArray[0]][splitArray[1]] = "";
              }
            } 
          }
  
          this.actor.updateFamilleComps(this.famille, this.familleComp); */
      }
  }
    
    window.DepenseKarmaFormApplication = DepenseKarmaFormApplication;