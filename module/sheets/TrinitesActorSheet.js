export default class TrinitesActorSheet extends ActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 744,
            height: 958,
            classes: ["trinites", "sheet", "actor"],
            /*tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "competences" },
                    { navSelector: ".magie-tabs", contentSelector: ".magie-content", initial: "emprise" },
                    { navSelector: ".historique-tabs", contentSelector: ".historique-content", initial: "pouvoirs" }]*/
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

        console.log(data);

        return data;
    }
}