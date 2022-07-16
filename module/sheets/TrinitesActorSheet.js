export default class TrinitesActorSheet extends ActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 744,
            height: 958,
            classes: ["trinites", "sheet", "actor"],
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "profane" }]
        });
    }

    get template() {
        //if(this.actor.data.type == "pj" || this.actor.data.type == "pnj") {
            console.log(`Trinites | type : ${this.actor.data.type} | chargement du template systems/trinites/templates/sheets/actors/personnage-sheet.html`);
            return `systems/trinites/templates/sheets/actors/personnage-sheet.html`;
        //} 
        //else {
        //    console.log(`Trinites | chargement du template systems/trinites/templates/sheets/actors/${this.actor.data.type}-sheet.html`);
        //    return `systems/trinites/templates/sheets/actors/${this.actor.data.type}-sheet.html`
        //}
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.Trinites;
        //const actorData = data.data.data;

       /* ----------------------------------------------------
        ---- Création des listes d'items filtrées par type ----
        -----------------------------------------------------*/

        data.domaines = data.items.filter(function (item) { return item.type == "domaine"});

        console.log(data);

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Tout ce qui suit nécessite que la feuille soit éditable
        if (!this.options.editable) return;

        
        if(this.actor) {
            if(this.actor.isOwner) {

                html.find('.suppr-domaine').click(this._onSupprimerDomaine.bind(this));
                
                // Ajouter au domaine son statut épuisé
                html.find('.check-domaine').click(this._onAjoutDomaineEtatEpuise.bind(this));

                // Enlever au domaine son statut épuisé
                html.find('.uncheck-domaine').click(this._onSupprDomaineEtatEpuise.bind(this));
            }
        }
    }

    _onSupprimerDomaine(event) {
        event.preventDefault();
        const element = event.currentTarget;
        
        //let itemId = element.closest(".item").dataset.itemId;
        let domaineId = element.closest(".domaine").dataset.itemId;
        const domaine = this.actor.items.get(domaineId);

        let content = `<p>Domaine : ${domaine.data.name}<br>Etes-vous certain de vouloir supprimer cet objet ?<p>`
        let dlg = Dialog.confirm({
            title: "Confirmation de suppression",
            content: content,
            yes: () => domaine.delete(),
            //no: () =>, On ne fait rien sur le 'Non'
            defaultYes: false
        });
    }

    _onAjoutDomaineEtatEpuise(event) {
        event.preventDefault();
        const element = event.currentTarget;
        
        let domaineId = element.closest(".domaine").dataset.itemId;
        const domaine = this.actor.items.get(domaineId);
        console.log(this.actor.items);
        console.log(domaineId);
        console.log(domaine);
        domaine.update({"data.epuise": true});
    }

    _onSupprDomaineEtatEpuise(event) {
        event.preventDefault();
        const element = event.currentTarget;
        
        let domaineId = element.closest(".domaine").dataset.itemId;
        const domaine = this.actor.items.get(domaineId);
        domaine.update({"data.epuise": false});
    }
}