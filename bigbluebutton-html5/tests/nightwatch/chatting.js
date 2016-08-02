module.exports = {
  'Welcome message title in the public chat of Demo Meeting is correct': function (browser) {
    browser
      .url('http://192.168.244.140:4000')
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', ['Maxim', browser.Keys.ENTER])
      .waitForElementVisible('#chatbody .chat li:last-of-type', 10000)
      .verify.containsText('#chatbody .chat li:last-of-type div', 'Welcome to Demo Meeting')
      .deleteCookies()
      .closeWindow()
      .end();
  },

  'Public chat`s welcome message title in the non-default meeting is correct': function (browser) {
    browser
      .url('http://192.168.244.140:4000')
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', 'Maxim')
      .assert.visible('input[ng-model=meetingName]')
      .setValue('input[ng-model=meetingName]', ['Meeting1', browser.Keys.ENTER])
      .waitForElementVisible('#chatbody .chat li:last-of-type', 10000)
      .verify.containsText('#chatbody .chat li:last-of-type div', 'Welcome to Meeting1')
      .deleteCookies()
      .closeWindow()
      .end();
  },

  'Sending a message in a public chat using Enter': function (browser) {
    browser
      .url('http://192.168.244.140:4000')
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', ['Maxim', browser.Keys.ENTER])
      .waitForElementVisible('#newMessageInput', 10000)
      .setValue(
        '#newMessageInput',
        ['this message is to be sent via Enter key', browser.Keys.ENTER]
      )
      .pause(500)
      .verify.containsText(
        '#chatbody .chat li:last-of-type div',
        'this message is to be sent via Enter key'
      )
      .verify.containsText('#chatbody .chat li:nth-last-of-type(2) div', 'Welcome to Demo Meeting')
      .deleteCookies()
      .closeWindow()
      .end();
  },

  'Sending a message in a public chat using Send button': function (browser) {
    browser
      .url('http://192.168.244.140:4000')
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', ['Maxim', browser.Keys.ENTER])
      .waitForElementVisible('#newMessageInput', 10000)
      .setValue('#newMessageInput', 'this message is to be sent via Send button')
      .click('#sendMessageButton')
      .pause(500)
      .verify.containsText(
        '#chatbody .chat li:last-of-type div',
        'this message is to be sent via Send button'
      )
      .verify.containsText('#chatbody .chat li:nth-last-of-type(2) div', 'Welcome to Demo Meeting')
      .deleteCookies()
      .closeWindow()
      .end();
  },
};
