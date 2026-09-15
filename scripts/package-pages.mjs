import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
if (!existsSync("dist/index.html")) throw Error("Run npm run build first.");
writeFileSync("dist/.nojekyll", "");
mkdirSync("artifacts", { recursive: true });
execFileSync("tar", [
  "-czf",
  "artifacts/pages-static.tar.gz",
  "-C",
  "dist",
  ".",
]);
console.log(
  "Packaged artifacts/pages-static.tar.gz. Publish its contents as the Pages branch root.",
);
