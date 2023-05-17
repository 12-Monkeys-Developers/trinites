export default class TrinitesCombatant extends Combatant {

    _onCreate(data, options, userID) {
        super._onCreate(data, options, userID);
        if (game.user.isGM) {
            console.log('Combatant created', data);
            this.setFlag("world", "position", "garde");
            this.setFlag("world", "acceleration", 0);
            this.setFlag("world", "ralentissement", 0);
            this.setFlag("world", "played", false);
            this.setFlag("world", "nbPlayed", 0);
        }
    }

    get isAction() {
        return this.getFlag("world", "position") === "action";
    }

    get isGarde() {
        return this.getFlag("world", "position") === "garde";
    }

    get isRetrait() {
        return this.getFlag("world", "position") === "retrait";
    }

    get hasPlayed() {
        return this.getFlag("world", "played") === true;
    }

    get canPlay() {
        if (!this.hasPlayed) {
            return true;
        }
        else {
            if (this.getFlag("world","nbPlayed") < 2) return true;
        }
        return false;
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

    async resetFlags() {
        await this.unsetFlag("world", "acceleration");
        await this.unsetFlag("world", "ralentissement");
    }

    async setPlayed() {
        await this.setFlag("world", "played", true);
        let nbPlay = this.getFlag("world", "nbPlayed");
        await this.setFlag("world", "nbPlayed", nbPlay++);
    }

    
}