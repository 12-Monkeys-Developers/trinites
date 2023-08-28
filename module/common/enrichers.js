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
        }
    ]);
}