import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const clientDir = join(process.cwd(), "dist", "client");
const generatedHtml = join(clientDir, "index.mobile.html");
const capacitorHtml = join(clientDir, "index.html");

mkdirSync(clientDir, { recursive: true });

if (existsSync(generatedHtml)) {
  renameSync(generatedHtml, capacitorHtml);
}

if (!existsSync(capacitorHtml)) {
  throw new Error("Capacitor webDir is missing dist/client/index.html");
}

console.log("Capacitor webDir ready: dist/client/index.html");