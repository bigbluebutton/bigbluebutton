var LandingPage = require('../pageobjects/landing.page');
var chai = require('chai');

describe('Landing page', function() {
    it('should have correct title', function() {
        LandingPage.open();
        chai.expect(browser.getTitle()).to.equal('Join Meeting via HTML5 Client');
    });
});

