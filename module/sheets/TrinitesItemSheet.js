export default class TrinitesItemSheet extends ItemSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 550,
            height: 450,
            classes: ["trinites", "sheet", "item"],
            //tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    get template() {

        console.log(`Trinites | Chargement du template systems/trinites/templates/sheets/items/${this.item.data.type.toLowerCase()}-sheet.html`);
        return `systems/trinites/templates/sheets/items/${this.item.data.type.toLowerCase()}-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.Trinites;
        const myItemData = data.data;

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

        aura.update({"data.deploiement": zone});
    }
}