const { test } = require('@playwright/test');
const { About } = require('./about');


  test('Open about modal', async({browser, page}) => {
    const about = new About(browser, page);
  
    await about.init(true, true);
    await about.openedAboutModal();
  });
