const selectors = require('../selectors');

async function setStatus(page, status) {
    await page.waitForSelector(selectors.firstUser);
    await page.click(selectors.firstUser);
    await page.waitForSelector(selectors.setStatus);
    await page.click(selectors.setStatus);
    await page.waitForSelector(status);
    await page.click(status);
}

exports.setStatus = setStatus;