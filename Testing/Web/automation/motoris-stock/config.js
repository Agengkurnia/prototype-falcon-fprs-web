"use strict";

const path = require("path");

module.exports = {
    baseUrl: process.env.MAVEN_BASE_URL || "https://mavendev.kalbenutritionals.web.id",
    dashboardPath: "/Dashboard/MotorisStock",
    loginPath: "/Account/Login",
    username: process.env.MAVEN_USER || "ageng.sugianto",
    password: process.env.MAVEN_PASS || "bypass",
    captcha: process.env.MAVEN_CAPTCHA || "bypass",
    authDir: path.join(__dirname, ".auth"),
    authStateFile: path.join(__dirname, ".auth", "maven-dev.json"),
    screenshotDir: path.join(__dirname, "screenshots"),
    resultsFile: path.join(__dirname, "results.json"),
    filterRegion: process.env.MAVEN_FILTER_REGION || "Kalimantan Barat",
    filterArea: process.env.MAVEN_FILTER_AREA || "Ketapang",
    apiTimeoutMs: Number(process.env.MAVEN_API_TIMEOUT_MS || 120000),
    headless: process.env.MAVEN_HEADLESS !== "false"
};
