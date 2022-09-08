export default class TrinitesItem extends Item {

    prepareData() {
        super.prepareData();
        this.system.config = CONFIG.Trinites;
        let data = this.system;

        if(this.type == "atout") {
            if(data.messager != "") {
                data.karma = data.config.epeesFeu[data.messager].karma;
            }
        }
    }
}