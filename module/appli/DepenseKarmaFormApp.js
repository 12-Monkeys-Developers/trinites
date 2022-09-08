import * as Chat from "../chat.js";

export default class DepenseKarmaFormApplication extends FormApplication {
    constructor(actor, trinite, typeKarma, typePouvoir, coutPouvoir, idPouvoir) {
        super();
        this.actor = actor;
        this.trinite = trinite;
        this.typeKarma = typeKarma;
        this.typePouvoir = typePouvoir
        this.coutPouvoir = coutPouvoir;
        this.idPouvoir = idPouvoir;
        this.karmaAttribue = 0;
        this.btnVisible = false;
      }
    
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ['form'],
          popOut: true,
          template: "systems/trinites/templates/application/dep-karma-form-app.hbs",
          id: "dep-karma-app",
          classes: ["trinites", "dialog"],
          title: game.i18n.localize("Source de Karma"),
          height: 260,
          width: 400,
          resizable: false
        });
      }
    
      getData() {

        // Send data to the template
        let templateData = {
            typeKarma: this.typeKarma,
            coutPouvoir: this.coutPouvoir,
            typePouvoir: this.typePouvoir,
            karmaAttribue: this.karmaAttribue,
            btnVisible: this.btnVisible,
            configData: CONFIG.Trinites
        };

        let karmaDeva = {
          valeurInit: this.trinite.deva.karma.value,
          valeur: this.trinite.deva.karma.value
        };
        if(!this.karmaDeva) {this.karmaDeva = karmaDeva;} 

        let karmaArchonte = {
          valeurInit: this.trinite.archonte.karma.value,
          valeur: this.trinite.archonte.karma.value
        };
        if(!this.karmaArchonte) {this.karmaArchonte = karmaArchonte;}

        let karmaAdam = {
          type: this.trinite.adam.karma.type,
          valeurInit: this.trinite.adam.karma.value,
          valeur: this.trinite.adam.karma.value
        };
        if(!this.karmaAdam) {this.karmaAdam = karmaAdam;}

        if(this.typeKarma == "lumiere") {
          templateData.karmaDeva = this.karmaDeva;
          templateData.karmaAdam = this.typeKarma == this.karmaAdam.type ? this.karmaAdam : "";
        }
        else if(this.typeKarma == "tenebre") {
          templateData.karmaArchonte = this.karmaArchonte;
          templateData.karmaAdam = this.typeKarma == this.karmaAdam.type ? this.karmaAdam : "";
        }
        else {
          templateData.typeKarma = "neutre";
          templateData.karmaDeva = this.karmaDeva;
          templateData.karmaArchonte = this.karmaArchonte;
          templateData.karmaAdam = this.karmaAdam;
        }
        
        return templateData;
      }
    
      activateListeners(html) {
        super.activateListeners(html);

        $(html).find('a.select').on('click', this.onSelectKarma.bind(this));
        $(html).find('a.deselect').on('click', this.onDeselectKarma.bind(this));
      }

      onSelectKarma(event) {
        event.preventDefault();
        const element = event.currentTarget;

        if (this.karmaAttribue < this.coutPouvoir) {
          if (element.classList.contains("deva") && this.karmaDeva.valeur > 0) {
            this.karmaDeva.valeur -= 1;
            this.karmaAttribue += 1;
          }
          if (element.classList.contains("archonte") && this.karmaArchonte.valeur > 0) {
            this.karmaArchonte.valeur -= 1;
            this.karmaAttribue += 1;
          }
          if(element.classList.contains("adam") && this.karmaAdam.valeur > 0) {
            this.karmaAdam.valeur -= 1;
            this.karmaAttribue += 1;
          }
        }
        
        this.btnVisible = this.karmaAttribue == this.coutPouvoir;
        this.position.height = this.btnVisible ? 295 : 260;

        this.render(true);
      }

      onDeselectKarma(event) {
        event.preventDefault();
        const element = event.currentTarget;

        if (this.karmaAttribue > 0) {
          if (element.classList.contains("deva") && this.karmaDeva.valeur < this.karmaDeva.valeurInit) {
            this.karmaDeva.valeur += 1;
            this.karmaAttribue -= 1;
          }
          if (element.classList.contains("archonte") && this.karmaArchonte.valeur < this.karmaArchonte.valeurInit) {
            this.karmaArchonte.valeur += 1;
            this.karmaAttribue -= 1;
          }
          if(element.classList.contains("adam") && this.karmaAdam.valeur < this.karmaAdam.valeurInit) {
            this.karmaAdam.valeur += 1;
            this.karmaAttribue -= 1;
          }
        }
        
        this.btnVisible = this.karmaAttribue == this.coutPouvoir;
        this.position.height = this.btnVisible ? 295 : 260;

        this.render(true);
      }

      async _updateObject(event, formData) {
        this.render();

        if(this.karmaDeva.valeur != this.karmaDeva.valeurInit) {
          this.actor.majKarma("deva", this.karmaDeva.valeur);
        }

        if(this.karmaAdam.valeur != this.karmaAdam.valeurInit) {
          this.actor.majKarma("adam", this.karmaAdam.valeur);
        }

        if(this.karmaArchonte.valeur != this.karmaArchonte.valeurInit) {
          this.actor.majKarma("archonte", this.karmaArchonte.valeur);
        }

        /*console.log("Update Object form Karma", event, formData, this);

        for (const [key, value] of Object.entries(formData)) {
          
          console.log(key, value);

          if(key.startsWith("karmaDeva")) {
            this.actor.majKarma("deva", value);
          }
          if(key.startsWith("karmaAdam")) {
            this.actor.majKarma("adam", value);
          }
          if(key.startsWith("karmaArchonte")) {
            this.actor.majKarma("archonte", value);
          }
        }*/

        if(this.typePouvoir == "aura") {
          let aura = this.actor.items.get(this.idPouvoir);
          aura.update({"system.deploiement": "cosme"});
        }

        if(this.typePouvoir == "atout") {
          Chat.carteAtoutActive({
            actor: this.actor,
            atoutId: this.idPouvoir});
        }

        if(this.typePouvoir == "verset") {
          Chat.carteVersetActive({
            actor: this.actor,
            versetId: this.idPouvoir});
        }
        
        if(this.typePouvoir == "regen") {
          this.actor.regeneration();
        }
      }
  }
    
  window.DepenseKarmaFormApplication = DepenseKarmaFormApplication;