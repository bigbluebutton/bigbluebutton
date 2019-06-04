

class Utils {
  configureViewport() {
    browser.setViewportSize({
      width: 1366,
      height: 768,
    });
  }
}

module.exports = new Utils();
