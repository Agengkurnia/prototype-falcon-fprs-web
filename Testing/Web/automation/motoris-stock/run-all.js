"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..", "..", "..", "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(script) {
    const r = spawnSync(npm, ["run", script], { cwd: root, stdio: "inherit", shell: true });
    return r.status ?? 1;
}

const testCode = run("test:motoris-stock");
run("report:motoris-stock");
process.exit(testCode);
