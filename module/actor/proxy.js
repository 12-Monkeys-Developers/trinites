import TrinitesActor from "./actor.js";
import TrinitesTrinite from "./trinite.js";
import TrinitesArchonteRoi from "./archonte-roi.js";
import TrinitesLige from "./lige.js";
import TrinitesHumain from "./humain.js";
import TrinitesPnj from "./pnj.js";

const handler = {
  construct(_, args) {
    switch (args[0]?.type) {
      case "trinite":
        return new TrinitesTrinite(...args);
      case "archonteRoi":
        return new TrinitesArchonteRoi(...args);
      case "lige":
        return new TrinitesLige(...args);
      case "humain":
        return new TrinitesHumain(...args);
      case "pnj":
        return new TrinitesPnj(...args);
      default:
        return new TrinitesActor(...args);
    }
  },
};

export const TrinitesActorProxy = new Proxy(TrinitesActor, handler);
