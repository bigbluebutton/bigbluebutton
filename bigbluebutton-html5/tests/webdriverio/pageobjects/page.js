var wdio = require('webdriverio');

var options = {
    desiredCapabilities: {
        browserName: "firefox"
    }
};
var client = wdio.remote(options).init();

function Page() {}

Page.prototype.open = function(path) {
    client.url(path);
    return client;
};

module.exports = new Page();

