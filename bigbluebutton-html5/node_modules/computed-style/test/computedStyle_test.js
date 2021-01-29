/* global computedStyle: true */
describe('computedStyle', function () {
  // Localize head and body
  var head = document.getElementsByTagName('head')[0];
  var body = document.body;

  // Create assertion methods (at the time of writing Chai does not work in <=IE8)
  function assert(a) {
    if (!a) {
      throw new Error('Assertion error: ' + a + ' is falsy');
    }
  }

  function assertEqual(a, b) {
    if (a !== b) {
      throw new Error('Assertion error: ' + a + ' !== ' + b);
    }
  }

  function assertMatches(a, b) {
    if (!a.match(b)) {
      throw new Error('Assertion error: ' + a + ' does not match ' + b);
    }
  }

  describe('querying an inline styled DOM element', function () {
    before(function () {
      // Create and style an element
      var el = document.createElement('div');
      el.style.cssText = 'color: #FF0000;';

      // Save the element for later
      this.el = el;

      // Append it to the DOM
      body.appendChild(el);

      // Query the element for its styles
      var color = computedStyle(el, 'color');
      this.color = color;
    });

    after(function () {
      // Clean up the element
      body.removeChild(this.el);
    });

    it('can find the styles', function () {
      // Color varies from browser to browser. jQuery doesn't tweak it
      //   and if we are keeping this single purpose, neither will I.
      var color = this.color;
      assert(color);
      assertMatches(color, /^#FF0000|rgb\(255, 0, 0\)$/i);
    });
  });

  describe('querying an stylesheet styled DOM element', function () {
    before(function () {
      // Create an element
      var el = document.createElement('div');
      el.setAttribute('id', 'test-el');

      // Save the element for later
      this.el = el;

      // Append it to the DOM
      body.appendChild(el);

      try {
        // Create a stylesheet and append it to the DOM
        var stylesheet = document.createElement('style');
        stylesheet.innerHTML = '#test-el { color: #00FF00; }';

        // Save it for later
        this.stylesheet = stylesheet;

        // Append the stylesheet to the DOM
        head.appendChild(stylesheet);
      } catch (e) {
        // If the previous attempt failed, we are in IE8 or lower
        // Use native IE methods
        // Reference: http://www.quirksmode.org/dom/w3c_css.html
        var stylesheet = document.createStyleSheet();
        stylesheet.addRule('#test-el', 'color: #00FF00;');
      }

      // Query the element for its styles
      var color = computedStyle(el, 'color');
      this.color = color;
    });

    after(function () {
      // Clean up the element and stylesheet
      body.removeChild(this.el);

      var stylesheet = this.stylesheet;
      if (stylesheet) {
        head.removeChild(this.stylesheet);
      }
    });

    it('can find the styles', function () {
      var color = this.color;
      assert(color);
      assertMatches(color, /^#00FF00|rgb\(0, 255, 0\)$/i);
    });
  });

  describe('querying text-decoration of an element', function () {
    before(function () {
      // Create and style an element
      var el = document.createElement('div');
      // It's over 9000
      el.style.cssText = 'text-decoration: underline;';

      // Save the element for later
      this.el = el;

      // Append it to the DOM
      body.appendChild(el);

      // Query the element for its styles
      var textDecoration = computedStyle(el, 'text-decoration');
      this.textDecoration = textDecoration;
    });

    after(function () {
      // Clean up the element
      body.removeChild(this.el);
    });

    it('return the element\'s text-decoration', function () {
      var textDecoration = this.textDecoration;
      assertEqual(textDecoration, 'underline');
    });
  });
});
