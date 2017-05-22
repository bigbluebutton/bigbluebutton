var page = require('./page');

var landingPage = Object.create(page, {
    open: {
        value: function() {
            return page.open.call(this, 'demo/demoHTML5.jsp');
        }
    },
    title: {
        value: 'Join Meeting via HTML5 Client'
    },
    username: {
        get: function() {
            return $('input[name=username]');
        }
    },
    joinButton: {
        get: function() {
            return $('input[type=submit]');
        }
    },
    joinWithButtonClick: {
        value: function() {
            this.joinButton.click();
        }
    },
    joinWithEnterKey: {
        value: function() {
            page.pressEnter();
        }
    },
    loadedHomePage: {
        get: function() {
            return $('#app');
        }
    }
});

module.exports = landingPage;

