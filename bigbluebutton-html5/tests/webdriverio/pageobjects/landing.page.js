var page = require('./page');

var landingPage = Object.create(page, {
    open: {
        value: function() {
            return page.open.call(this, 'demo/demoHTML5.jsp');
        }
    },
    title: {
        value: 'Join Meeting via HTML5 Client'
    }
});

module.exports = landingPage;

