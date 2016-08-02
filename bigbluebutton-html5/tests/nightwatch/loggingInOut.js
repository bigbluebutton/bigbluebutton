module.exports = {
  'Logging into Demo Meeting using Enter key': function (browser) {
    browser
      .url('http://192.168.244.140:4000')
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', ['Maxim', browser.Keys.ENTER])
      .waitForElementVisible('body #main', 10000)
      .verify.urlEquals('http://192.168.244.140:3000/')
      .waitForElementVisible('.navbarTitle span', 1000)
      .verify.containsText('.navbarTitle span', 'Demo Meeting')
      .deleteCookies()
      .closeWindow()
      .end();
  },

  'Logging into Demo Meeting using Send button': function (browser) {
    browser
      .url('http://192.168.244.140:4000')
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', 'Maxim')
      .click('input.success')
      .waitForElementVisible('body #main', 10000)
      .verify.urlEquals('http://192.168.244.140:3000/')
      .waitForElementVisible('.navbarTitle span', 1000)
      .verify.containsText('.navbarTitle span', 'Demo Meeting')
      .deleteCookies()
      .closeWindow()
      .end();
  },

  'Logging into a meeting with non-default name': function (browser) {
    browser
      .url('http://192.168.244.140:4000')
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', 'Maxim')
      .assert.visible('input[ng-model=meetingName]')
      .setValue('input[ng-model=meetingName]', ['Meeting1', browser.Keys.ENTER])
      .waitForElementVisible('.navbarTitle span', 10000)
      .verify.containsText('.navbarTitle span', 'Meeting1')
      .deleteCookies()
      .closeWindow()
      .end();
  },

  'Loading the presentation': function (browser) {
    browser
      .url('http://192.168.244.140:4000')
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', ['Maxim', browser.Keys.ENTER])
      .waitForElementVisible('#whiteboard-paper', 10000)
      .waitForElementVisible('#whiteboard-paper > #svggroup', 30000)
      .deleteCookies()
      .closeWindow()
      .end();
  },
};
