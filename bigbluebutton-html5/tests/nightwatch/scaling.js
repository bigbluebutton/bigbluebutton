module.exports = {
  'Checking navbar`s height while scaling if there is a long meeting name ': function (browser) {
    var longMeetingName = new Array(101).join('x'); // 100-element array of 'x'
    browser
      .url('http://192.168.244.140:4000')
      .resizeWindow(1920, 1080)
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', 'Maxim')
      .assert.visible('input[ng-model=meetingName]')
      .setValue('input[ng-model=meetingName]', [longMeetingName, browser.Keys.ENTER])
      .waitForElementVisible('#navbar', 10000)
      .getElementSize('#navbar', function (result1) {
        _this = this;
        for (var w = 1900; w >= 100; w -= 100) {
          _this = _this
            .resizeWindow(w, 1080)
            .getElementSize('#navbar', function (result2) {
              this.verify.equal(result2.value.height, result1.value.height);
            });
        }

        for (var w = 100; w <= 1900; w += 100) {
          _this = _this
            .resizeWindow(w, 1080)
            .getElementSize('#navbar', function (result2) {
              this.verify.equal(result2.value.height, result1.value.height);
            });
        }
      })
      .deleteCookies()
      .closeWindow()
      .end();
  },

  'Checking the margin between the navbar and the top while scaling horizont': function (browser) {
    var longMeetingName = new Array(101).join('x'); // 100-element array of 'x'
    browser
      .url('http://192.168.244.140:4000')
      .resizeWindow(1920, 1080)
      .waitForElementVisible('body', 1000)
      .assert.visible('input[ng-model=username]')
      .setValue('input[ng-model=username]', 'Maxim')
      .assert.visible('input[ng-model=meetingName]')
      .setValue('input[ng-model=meetingName]', [longMeetingName, browser.Keys.ENTER])
      .waitForElementVisible('#navbar', 10000)
      .getLocation('#whiteboard-navbar', function (result1) {
        _this = this;
        for (var w = 1000; w >= 100; w -= 100) {
          _this = _this
            .resizeWindow(w, 1080)
            .getLocation('#whiteboard-navbar', function (result2) {
              this.verify.equal(result2.value.y, result1.value.y);
            });
        }

        for (var w = 100; w <= 100; w += 100) {
          _this = _this
            .resizeWindow(w, 1080)
            .getLocation('#whiteboard-navbar', function (result2) {
              this.verify.equal(result2.value.y, result1.value.y);
            });
        }
      })
      .deleteCookies()
      .closeWindow()
      .end();
  },
};
