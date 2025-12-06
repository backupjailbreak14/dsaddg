const fs = require("fs");
const path = require("path");

// Root van je project (waar index.js ook staat)
const ROOT = __dirname;

// Dit zijn de mappen/bestanden die we willen dumpen
const INCLUDE = [
  "index.js",
  "package.json",
  "commands",
  "events",
  "handlers"
];

// Recursief een map inlezen
function readRecursive(relPath) {
  const full = path.join(ROOT, relPath);
  const stat = fs.statSync(full);

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(full);
    return entries.flatMap((name) =>
      readRecursive(path.join(relPath, name))
    );
  } else if (stat.isFile()) {
    const content = fs.readFileSync(full, "utf8");
    return [
      {
        path: relPath.replace(/\\/g, "/"),
        content
      }
    ];
  }
  return [];
}

// Bouw de lijst met files
const files = INCLUDE.flatMap((p) => {
  const full = path.join(ROOT, p);
  if (fs.existsSync(full)) {
    return readRecursive(p);
  }
  return [];
});

// Print alles als nette JSON naar stdout
console.log(JSON.stringify(files, null, 2));
