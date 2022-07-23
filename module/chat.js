import * as Dice from "./dice.js";

export function addChatListeners(html) {
    html.on('click', 'button.dette', onDetteEsprit);
}

function onDetteEsprit(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.classList.contains("used"))
    {
        ui.notifications.warn('Vous avez déjà payé cette dette de Karma !');    
        return;
    }

    const esprit = element.dataset.esprit;
    const actorId = element.dataset.actorId;

    let actor = game.actors.get(actorId);
    if(esprit == "deva") {
        console.log(actor.data.data.trinite.deva.dettes);
        actor.update({"data.trinite.deva.dettes": actor.data.data.trinite.deva.dettes + 1});
    }

    if(esprit == 'archonte')
    {
        console.log(actor.data.data.trinite.archonte.dettes);
        actor.update({"data.trinite.archonte.dettes": actor.data.data.trinite.archonte.dettes + 1});
    }

    element.classList.add("used");
    element.innerHTML = "Dette de Karma payée";
}