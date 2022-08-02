export default class TrinitesItem extends Item {

    prepareData() {
        super.prepareData();
        this.data.config = CONFIG.Trinites;
        let data = this.data.data;

        //console.log(this);

        if(this.data.type == "atout") {
            if(data.messager != "") {
                data.karma = this.data.config.epeesFeu[data.messager].karma;
            }
        }
    }
}