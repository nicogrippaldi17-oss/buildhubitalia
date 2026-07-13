const htmlmin = require("html-minifier-terser");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/gestione");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");

  eleventyConfig.addCollection("services_it", function (coll) {
    return coll.getFilteredByGlob("src/services_it/*.md").sort((a, b) => a.data.order - b.data.order);
  });
  eleventyConfig.addCollection("services_en", function (coll) {
    return coll.getFilteredByGlob("src/services_en/*.md").sort((a, b) => a.data.order - b.data.order);
  });
  eleventyConfig.addCollection("projects_it", function (coll) {
    return coll.getFilteredByGlob("src/projects_it/*.md").filter(p => p.data.published !== false).sort((a, b) => a.data.order - b.data.order);
  });
  eleventyConfig.addCollection("projects_en", function (coll) {
    return coll.getFilteredByGlob("src/projects_en/*.md").filter(p => p.data.published !== false).sort((a, b) => a.data.order - b.data.order);
  });

  eleventyConfig.addTransform("htmlmin", function (content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      });
    }
    return content;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
