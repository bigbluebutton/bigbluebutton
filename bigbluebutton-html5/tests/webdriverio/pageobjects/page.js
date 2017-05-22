function Page() {}

Page.prototype.open = function(path) {
    browser.url(path);
};

Page.prototype.pressEnter = function() {
    browser.keys('Enter');
};

module.exports = new Page();

