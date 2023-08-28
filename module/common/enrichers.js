export default function setupTextEnrichers() {
    CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
        {
            pattern: /\@awesomefont\[(.+?)\]/gm,
            enricher: async (match, options) => {
                const awdoc = document.createElement("span");
                awdoc.className = "no-indent";
                awdoc.innerHTML = `<i class="fa ${match[1]}"></i>`;
                return awdoc;
            }
        },
        {
            pattern: /\@trinitesvie\[(.+?)\]{(.+?)}/gm,
            enricher: async (match, options) => {
                const viedoc = document.createElement("span");
                let nbcases = parseInt(match[1]);
                let nblignes = parseInt(match[2]);
                let bulle = `<i class="far fa-circle"></i>`;
                viedoc.className = "no-indent";
                for(let i = 0; i < nblignes;i++){
                    for(let i = 0; i < nbcases;i++){
                        viedoc.innerHTML += bulle;
                    }
                    if(i+1<nblignes){viedoc.innerHTML += "<br />"};
                }
                return viedoc;
            }
        }
    ]);
}