import TrinitesActor from "./actor.js";
import TrinitesTrinite from "./trinite.js";
import TrinitesPnj from "./pnj.js";

const handler = {
  construct(_, args) {
    switch (args[0]?.type) {
      case "trinite":
        return new TrinitesTrinite(...args);
      case "pnj":
        return new TrinitesPnj(...args);
    }
  },
};

export const TrinitesActorProxy = new Proxy(TrinitesActor, handler);
