const purgeImport = require("@fullhuman/postcss-purgecss");
const purgeCSSPlugin = purgeImport.purgeCSSPlugin || purgeImport.default || purgeImport;
const combineDuplicatedSelectors = require("postcss-combine-duplicated-selectors");
const cssNano = require("cssnano");

module.exports = {
  syntax: "postcss-scss",
  plugins: [
    combineDuplicatedSelectors({
      removeDuplicatedProperties: true,
    }),
    purgeCSSPlugin({
      content: ["./assets/css/*.scss", "./layouts/**/*.html", "./hugo_stats.json"],
      extractors: [
        {
          extractor: (content) => {
            const els = JSON.parse(content).htmlElements;
            return [...(els.tags || []), ...(els.classes || []), ...(els.ids || [])];
          },
          extensions: ["json"],
        },
      ],
      safelist: [/focus-visible/]
    }),
    cssNano({
      preset: [
        "advanced",
        {
          autoprefixer: {
            add: true,
          },
          convertValues: {
            length: true,
          },
          discardUnused: {
            fontFace: false,
          },
          discardComments: {
            removeAll: true,
          },
          normalizeCharset: {
            add: true,
          },
        },
      ],
    }),
  ],
};
