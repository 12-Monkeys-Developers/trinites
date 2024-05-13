import * as Chat from "../common/chat.js";

export default class DepenseKarmaFormApplication extends FormApplication {
  constructor(actor, trinite, typeKarma, typePouvoir, coutPouvoir, idPouvoir, options) {
    super();
    this.actor = actor;
    this.trinite = trinite;
    this.typeKarma = typeKarma;
    this.typePouvoir = typePouvoir;
    this.coutPouvoir = coutPouvoir;
    this.idPouvoir = idPouvoir;
    this.karmaAttribue = 0;
    this.btnVisible = false;
    this.pouvoirUtilise = false;
  
    this.resolve = options.resolve;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize("Source de Karma"),
      id: "dep-karma-app",
      template: "systems/trinites/templates/application/dep-karma-form-app.hbs",
      classes: ["trinites", "dialog"],            
      height: 260,
      width: 400,
      popOut: true,         
      resizable: false
    });
  }

  async getData() {
    // Send data to the template
    let templateData = {
      typeKarma: this.typeKarma,
      coutPouvoir: this.coutPouvoir,
      typePouvoir: this.typePouvoir,
      karmaAttribue: this.karmaAttribue,
      btnVisible: this.btnVisible,
      configData: game.trinites.config
    };

    let karmaDeva = {
      valeurInit: this.actor.isTrinite ? this.trinite.deva.karma.value : this.actor.system.karmaLumiere.value,
      valeur: this.actor.isTrinite ? this.trinite.deva.karma.value : this.actor.system.karmaLumiere.value
    };
    if (!this.karmaDeva) {
      this.karmaDeva = karmaDeva;
    }

    let karmaArchonte = {
      valeurInit: this.actor.isTrinite ? this.trinite.archonte.karma.value : this.actor.system.karmaTenebres.value,
      valeur: this.actor.isTrinite ? this.trinite.archonte.karma.value : this.actor.system.karmaTenebres.value
    };

    if (!this.karmaArchonte) {
      this.karmaArchonte = karmaArchonte;
    }

    let karmaAdam = {};

    if (this.actor.isTrinite) {
      karmaAdam = {
            type: this.trinite.adam.karma.type,
            valeurInit: this.trinite.adam.karma.value,
            valeur: this.trinite.adam.karma.value
          };
    }
    
    if (!this.karmaAdam) {
      this.karmaAdam = karmaAdam;
    }

    let karmaElohim = {
      valeurInit: this.actor.system.zodiaque.karmaElohim.value,
      valeur: this.actor.system.zodiaque.karmaElohim.value
    };

    if (!this.karmaElohim) {
      this.karmaElohim = karmaElohim;
    }

    if (this.typeKarma == "lumiere") {
      templateData.karmaDeva = this.karmaDeva;
      templateData.karmaAdam = this.typeKarma === this.karmaAdam.type ? this.karmaAdam : "";
    } else if (this.typeKarma == "tenebre") {
      templateData.karmaArchonte = this.karmaArchonte;
      templateData.karmaAdam = this.typeKarma === this.karmaAdam.type ? this.karmaAdam : "";
    } else {
      templateData.typeKarma = "neutre";
      templateData.karmaDeva = this.karmaDeva;
      templateData.karmaArchonte = this.karmaArchonte;
      templateData.karmaAdam = this.karmaAdam;
    }

    templateData.isElohim = this.actor.affLvl("zodiaque") >= 3 ? true : false;

    if (templateData.isElohim) {
      templateData.karmaElohim = this.karmaElohim;
    }

    return templateData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    $(html).find("a.select").on("click", this.onSelectKarma.bind(this));
    $(html).find("a.deselect").on("click", this.onDeselectKarma.bind(this));
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
      if (element.classList.contains("adam") && this.karmaAdam.valeur > 0) {
        this.karmaAdam.valeur -= 1;
        this.karmaAttribue += 1;
      }
      if (element.classList.contains("elohim") && this.karmaElohim.valeur > 0) {
        this.karmaElohim.valeur -= 1;
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
      if (element.classList.contains("adam") && this.karmaAdam.valeur < this.karmaAdam.valeurInit) {
        this.karmaAdam.valeur += 1;
        this.karmaAttribue -= 1;
      }
      if (element.classList.contains("elohim") && this.karmaElohim.valeur < this.karmaElohim.valeurInit) {
        this.karmaElohim.valeur += 1;
        this.karmaAttribue -= 1;
      }
    }

    this.btnVisible = this.karmaAttribue == this.coutPouvoir;
    this.position.height = this.btnVisible ? 295 : 260;

    this.render(true);
  }

  async _updateObject(event, formData) {

    this.pouvoirUtilise = true;

    if (this.karmaDeva.valeur != this.karmaDeva.valeurInit) {
      this.actor.majKarma("deva", this.karmaDeva.valeur);
    }

    if (this.karmaAdam.valeur != this.karmaAdam.valeurInit) {
      this.actor.majKarma("adam", this.karmaAdam.valeur);
    }

    if (this.karmaArchonte.valeur != this.karmaArchonte.valeurInit) {
      this.actor.majKarma("archonte", this.karmaArchonte.valeur);
    }

    if (this.karmaElohim.valeur != this.karmaElohim.valeurInit) {
      this.actor.majKarma("elohim", this.karmaElohim.valeur);
    }

    if (this.typePouvoir == "aura") {
      let aura = this.actor.items.get(this.idPouvoir);
      aura.update({ "system.deploiement": "cosme" });
    }

    if (this.typePouvoir == "atout") {
      Chat.carteAtoutActive({
        actor: this.actor,
        atoutId: this.idPouvoir,
      });
    }

    if (this.typePouvoir == "majeste") {
      Chat.carteMajesteActive({
        actor: this.actor,
        majesteId: this.idPouvoir,
      });
    }

    if (this.typePouvoir == "verset") {
      await Chat.carteVersetActive({
        actor: this.actor,
        versetId: this.idPouvoir,
      });
    }

    if (this.typePouvoir == "regen") {
      this.actor.regeneration();
    }
  }

  close(options) {
		super.close(options);
    if (this.pouvoirUtilise) this.resolve(true);
    else this.resolve(false);
	}

  static open(actor, trinite, typeKarma, typePouvoir, coutPouvoir, idPouvoir, options) {
    return new Promise(resolve => {
      const dialog = new this(actor, trinite, typeKarma, typePouvoir, coutPouvoir, idPouvoir, { resolve });
      dialog.render(true);
    });
  }

}

