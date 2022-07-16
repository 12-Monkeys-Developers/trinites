export default class TrinitesActor extends Actor {

    prepareData() {
        super.prepareData();
        let data = this.data.data;

    if(this.type == "trinite")
    {
        /*-------------------------------------------
        ---- Calculs des valeurs des compétences ----
        -------------------------------------------*/
        
        for(let[keySigne, compsSigne] of Object.entries(data.competences)) {
            for(let[keyComp, competence] of Object.entries(compsSigne)) {
                if(data.competences[keySigne][keyComp].ouverte == 1) {
                    data.competences[keySigne][keyComp].valeur = data.competences[keySigne][keyComp].base + data.signes[keySigne].valeur;
                }
                else {
                    if(data.competences[keySigne][keyComp].base > 0) {
                        data.competences[keySigne][keyComp].valeur = data.competences[keySigne][keyComp].base + data.signes[keySigne].valeur;
                    }
                    else {
                        data.competences[keySigne][keyComp].valeur = 0;
                    }
                }
            }
        }
    }

    console.log(data);

    }
}