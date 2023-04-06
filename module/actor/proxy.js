import TrinitesActor from "./actor.js";
import TrinitesTrinite from "./trinite.js";
import TrinitesArchonteRoi from "./archonte-roi.js";

const handler = {    
    construct(_, args) {
        switch (args[0]?.type) {
            case "trinite":
                    return new TrinitesTrinite(...args);
            case "archonteRoi":
                    return new TrinitesArchonteRoi(...args);
            default:
                    return new TrinitesActor(...args);
        }
    }
};

export const TrinitesActorProxy = new Proxy(TrinitesActor, handler);