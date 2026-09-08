"use strict";

const fs = require("fs");
const path = require("path");
const config = require("./config");

function authStateExists() {
    try {
        return fs.statSync(config.authStateFile).size > 10;
    } catch {
        return false;
    }
}

async function login(page) {
    const returnUrl = encodeURIComponent(config.dashboardPath);
    const loginUrl = `${config.baseUrl}${config.loginPath}?returnUrl=${returnUrl}`;

    await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

    await page.fill('input[name="TxtUserName"]', config.username);
    await page.fill('input[name="TxtPassword"]', config.password);
    await page.fill('input[name="TxtCaptcha"]', config.captcha);

    await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
        page.click("#btn-login")
    ]);
}

async function ensureAuth(browser, setupPage) {
    fs.mkdirSync(config.authDir, { recursive: true });

    const contextOptions = {
        viewport: { width: 1440, height: 900 },
        ignoreHTTPSErrors: true
    };

    if (authStateExists()) {
        contextOptions.storageState = config.authStateFile;
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    if (typeof setupPage === "function") setupPage(page);

    await page.goto(`${config.baseUrl}${config.dashboardPath}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000
    });

    const onLoginPage = /\/Account\/Login/i.test(page.url());
    if (onLoginPage) {
        await login(page);
        await page.goto(`${config.baseUrl}${config.dashboardPath}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });
        await context.storageState({ path: config.authStateFile });
    }

    return { context, page };
}

module.exports = {
    authStateExists,
    login,
    ensureAuth
};
