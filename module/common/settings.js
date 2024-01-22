export default function registerSystemSettings() {
  game.settings.register("trinites", "limEndettementCampagne", {
    config: true,
    scope: "world",
    name: "Limite d'endettement 'Campagne'",
    hint: "Si cette option est cochée, la limite d'endettement sera celle du mode 'Campagne' (+6). Sinon, elle sera celle du mode 'Partie isolée' (+3).",
    type: Boolean,
    default: true,
  });

  game.settings.register("trinites", "lienJournalPrimesPenalites", {
    config: true,
    scope: "world",
    name: "Journal descriptif des Primes et Pénalités",
    hint: "Renseignez l'ID de l'article de journal pour afficher un lien d'information sur les Primes et Pénalités dans le dialogue de jet de dés.",
    type: String,
    default: "",
  });

  game.settings.register("trinites", "worldKey", {
    name: "Unique world key",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });
}
