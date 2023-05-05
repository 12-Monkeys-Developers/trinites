export default class TrinitesCombatant extends Combatant {

    _onCreate(data, options, userID) {
        super._onCreate(data, options, userID);
        if(game.user.isGM) console.log('Combatant created', data);
        if(game.user.isGM) this.setFlag("world", "position", "garde");
    }

    get isAction() {
        return this.flags.world.position === "action";
    }

    get isGarde() {
        return this.flags.world.position === "garde";
    }

    get isRetrait() {
        return this.flags.world.position === "retrait";
    }

    async setAction() {
        await this.setFlag("world", "position", "action");
    }

    async setGarde() {
        await this.setFlag("world", "position", "garde");
    }

    async setRetrait() {
        await this.setFlag("world", "position", "retrait");
    }
}