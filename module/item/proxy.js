
import TrinitesItem from "./item.js";
import TrinitesAtout from "./atout.js";

const handler = {
    construct(_, args) {
        switch (args[0]?.type) {
            case "atout":
                return new TrinitesAtout(...args);
            default:
                return new TrinitesItem(...args);
        }
    }
};

export const TrinitesItemProxy = new Proxy(TrinitesItem, handler);