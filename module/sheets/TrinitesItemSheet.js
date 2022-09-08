export default class TrinitesItemSheet extends ItemSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 650,
            height: 450,
            classes: ["trinites", "sheet", "item"],
            //tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    get template() {

        console.log(`Trinites | Chargement du template systems/trinites/templates/sheets/items/${this.item.type.toLowerCase()}-sheet.html`);
        return `systems/trinites/templates/sheets/items/${this.item.type.toLowerCase()}-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.Trinites;

        const myItemData = data.data.system;

        if(this.item.type == "aura")
        {
            if(this.actor) {
                // Aura liée à un personnage, donc modifiable
                myItemData.edit = true;
            }
            else {
                myItemData.edit = false;
            }
        }

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Changer la zone de déploiement d'une aura
        html.find('.zone-deploiement').click(this._onZoneDeploimentAura.bind(this));
    }

    _onZoneDeploimentAura(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let auraId = element.closest(".aura").dataset.itemId;
        const aura = this.actor.items.get(auraId);
        let zone = element.dataset.zone;

        if(aura.system.deploiement == "") {
            ui.notifications.warn("Vous devez déployer l'aura avant de changer sa zone d'effet !");
            return;
        }
        
        let auraActive = false;
        if(zone != "cosme") {
            let auras = this.actor.items.filter(function (item) { return item.type == "aura" && item.id != auraId});            
            auraActive = auras.some(autreAura => {
                if(autreAura.system.deploiement != "" && autreAura.system.deploiement != "cosme") {
                    return true;
                }
            });
        }

        if(auraActive) {
            ui.notifications.warn("Vous avez une autre aura déployée au delà du Cosme !");
            return;
        }

        if(aura.system.deploiement == "cosme" && zone == "cosme") {
            aura.update({"system.deploiement": ""});    
        }
        else {
            aura.update({"system.deploiement": zone});
        }    
    }
}