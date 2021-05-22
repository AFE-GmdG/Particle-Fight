const process = require("process");
const path = require("path");
const fsPromises = require("fs").promises;

const cwd = process.cwd();

async function cleanNodeModules() {
  console.log(`Clean up Project: ${cwd}`);
  await fsPromises.rm(path.join(cwd, "packages", "client", "node_modules"), { recursive: true, force: true });
  await fsPromises.rm(path.join(cwd, "packages", "server", "node_modules"), { recursive: true, force: true });
  await fsPromises.rm(path.join(cwd, "packages", "server", "dist"), { recursive: true, force: true });
  await fsPromises.rm(path.join(cwd, "node_modules"), { recursive: true, force: true });
  await fsPromises.rm(path.join(cwd, "yarn.lock"), { force: true });
}

cleanNodeModules().catch(console.error);
