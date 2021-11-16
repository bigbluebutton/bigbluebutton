const elements = require('../elements');

async function setStatus(page, status) {
    await page.waitForSelector(elements.firstUser);
    await page.click(elements.firstUser);
    await page.waitForSelector(elements.setStatus);
    await page.click(elements.setStatus);
    await page.waitForSelector(status);
    await page.click(status);
}

exports.setStatus = setStatus;
