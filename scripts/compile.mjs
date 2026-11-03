import { Compiler } from "inkjs/full";
import { readFileSync, writeFileSync } from "node:fs";
const compiler = new Compiler(readFileSync("story/museum.ink", "utf8"));
let story;
try {
  story = compiler.Compile();
} catch (error) {
  for (const message of compiler.errors) process.stderr.write(message + "\n");
  process.exit(1);
}
if (compiler.errors.length || compiler.warnings.length) {
  throw Error([...compiler.errors, ...compiler.warnings].join("\n"));
}
writeFileSync("src/story.json", story.ToJson() + "\n");
console.log("Ink: compiled museum.ink");
