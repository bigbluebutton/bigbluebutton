var LandingPage = require('../pageobjects/landing.page');
var chai = require('chai');

describe('Landing page', function() {
    it('should have correct title', function() {
        chai.expect(LandingPage.title).to.contain('Join Meeting via HTML5 Client'); // TODO: change to a real test
    });
});

