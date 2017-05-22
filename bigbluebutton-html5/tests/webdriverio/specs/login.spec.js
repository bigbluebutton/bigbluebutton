var LandingPage = require('../pageobjects/landing.page');
var chai = require('chai');

describe('Landing page', function() {
    it('should have correct title', function() {
        LandingPage.open();
        chai.expect(browser.getTitle()).to.equal('Join Meeting via HTML5 Client');
    });
    it('should allow user to login if the username is specified and the Join button is clicked', function() {
        LandingPage.open();
        LandingPage.username.waitForExist();
        LandingPage.username.setValue('Maxim');
        LandingPage.joinWithButtonClick();
        LandingPage.loadedHomePage.waitForExist(5000);
    });
    it('should allow user to login if the username is specified and then Enter key is pressed', function() {
        LandingPage.open();
        LandingPage.username.waitForExist();
        LandingPage.username.setValue('Maxim');
        LandingPage.joinWithEnterKey();
        LandingPage.loadedHomePage.waitForExist(5000);
    });
});

