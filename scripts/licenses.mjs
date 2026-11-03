import { readFileSync, writeFileSync } from "node:fs";
const p = JSON.parse(readFileSync("node_modules/inkjs/package.json", "utf8"));
writeFileSync(
  "public/third-party.txt",
  (
    "Salao 17 - third-party notices\n\ninkjs " +
    p.version +
    "\n" +
    readFileSync("node_modules/inkjs/LICENSE.md", "utf8")
  )
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd() + "\n",
);
