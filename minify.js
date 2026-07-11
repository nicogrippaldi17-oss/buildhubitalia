const fs = require("fs");
const path = require("path");
const csso = require("csso");
const terser = require("terser");

const siteDir = path.join(__dirname, "_site");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.name.endsWith(".css")) {
      const before = fs.statSync(full).size;
      const minified = csso.minify(fs.readFileSync(full, "utf8")).css;
      fs.writeFileSync(full, minified);
      const after = fs.statSync(full).size;
      const saved = ((1 - after / before) * 100).toFixed(1);
      if (saved > 0) console.log(`  css ${path.relative(siteDir, full)}  (${before} B \u2192 ${after} B, -${saved}%)`);
    } else if (e.name.endsWith(".js")) {
      const before = fs.statSync(full).size;
      terser.minify(fs.readFileSync(full, "utf8"), { output: { comments: false } }).then(result => {
        if (result.code) {
          fs.writeFileSync(full, result.code);
          const after = fs.statSync(full).size;
          const saved = ((1 - after / before) * 100).toFixed(1);
          if (saved > 0) console.log(`  js  ${path.relative(siteDir, full)}  (${before} B \u2192 ${after} B, -${saved}%)`);
        }
      });
    }
  }
}

(async () => {
  console.log("Minifying assets...");
  await Promise.all([walk(siteDir)]);
  console.log("Done.");
})();
