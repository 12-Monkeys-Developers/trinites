import { TRINITES } from "./config.js";

export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper("configVal", function (liste, val) {
    return TRINITES[liste][val];
  });

  Handlebars.registerHelper("configLabel", function (liste, val) {
    return TRINITES[liste][val].label;
  });

  Handlebars.registerHelper("times", function (n, block) {
    var accum = "";
    for (var i = 1; i <= n; ++i) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === n - 1;
      accum += block.fn(this);
    }
    return accum;
  });
}
