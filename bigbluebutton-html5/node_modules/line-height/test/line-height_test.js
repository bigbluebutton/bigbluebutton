// Load in test dependencies
var lineHeight = require('../lib/line-height.js');
var assert = require('proclaim');
var domify = require('domify');
var cssControls = require('css-controls');

// Create common fixture actions
var styleSheet = cssControls.createStyleSheet();
var testUtils = {
  getLineHeight: function (html) {
    before(function () {
      // Save our line height
      this.node = domify(html);
      document.body.appendChild(this.node);
      this.lineHeight = lineHeight(this.node);

      // Sanity check line height is a number
      assert.strictEqual(typeof this.lineHeight, 'number');
      assert.notEqual(isNaN(this.lineHeight), true);
    });
    after(function cleanup () {
      document.body.removeChild(this.node);
      delete this.node;
      delete this.lineHeight;
    });
  },
  styleBody: function (css) {
    before(function styleBodyFn () {
      document.body.style.cssText = css;
    });
    after(function cleanup () {
      document.body.style.cssText = '';
    });
  },
  addGlobalCss: function (selector, rule) {
    var index;
    before(function addGlobalCssFn () {
      index = cssControls.addRule(styleSheet, selector, rule);
    });
    after(function cleanup () {
      cssControls.removeRule(styleSheet, index);
    });
  }
};

// Basic tests
var _defaultLnHeight;
describe('An unstyled div processed by line-height', function () {
  testUtils.getLineHeight('<div>abc</div>');
  // Save the line height for other tests
  before(function saveDefaultLineHeight () {
    _defaultLnHeight = this.lineHeight;
  });

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });
});

describe('A line-height styled div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 50px;">abc</div>');

  it('has the styled line-height\'s height', function () {
    assert.strictEqual(this.lineHeight, 50);
  });
});

// DEV: Tests and disproves that an element has a constant ratio for its font-size
describe('A font-size styled div processed by line-height', function () {
  testUtils.getLineHeight('<div style="font-size: 50px;">abc</div>');

  it('has the styled line-height\'s height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  it('has a line-height greater than the its font-size', function () {
    var lnHeight = this.lineHeight;
    assert.greaterThan(lnHeight, 50);
  });
});

// Intermediate tests
describe('A percentage line-height div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 150%;">abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  it('has a line-height greater than the default', function () {
    // DEV: In IE6, 150% !== default * 1.5; 24 !== 28.5 (19 * 1.5)
    var lnHeight = this.lineHeight;
    assert.greaterThan(lnHeight, _defaultLnHeight);
  });
});

describe('A relative line-height div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 3em;">abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  it('has a line-height greater than the default', function () {
    // DEV: In IE6, 1.3em !== default * 1.3; 22 !== 24.7 (19 * 1.3)
    var lnHeight = this.lineHeight;
    assert.greaterThan(lnHeight, _defaultLnHeight);
  });
});

// DEV: This is redundant but the test name is practical
describe('An absolute line-height div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 50px;">abc</div>');

  it('has a line-height equal to 50px', function () {
    assert.strictEqual(this.lineHeight, 50);
  });
});

describe('A numeric line-height div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 2.3;">abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  it('has a line-height greater than the default', function () {
    // DEV: In IE6, 2.3 !== default * 2.3; 37 !== 43.6999... (19 * 2.3)
    var lnHeight = this.lineHeight;
    assert.greaterThan(lnHeight, _defaultLnHeight);
  });
});

// Verify ancestor -> descendant works on global styling to node level
describe('An inherit line-height div processed by line-height', function () {
  testUtils.styleBody('line-height: 40px;');
  testUtils.getLineHeight('<div style="line-height: inherit;">abc</div>');

  it('has a line-height equal to the inherited amount', function () {
    assert.strictEqual(this.lineHeight, 40);
  });
});

// Verify ancestor -> descendant works on node to node level
describe('A child in a styled div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 50px;"><div id="child">abc</div></div>');

  it('has a line-height equal to the parent\'s line-height', function () {
    var childNode = document.getElementById('child');
    assert.strictEqual(lineHeight(childNode), 50);
  });
});

// Advanced tests
// Verify more global styling inheritance
describe('A globally styled body and an unstyled div processed by line-height', function () {
  testUtils.styleBody('font-size: 40px;');
  testUtils.getLineHeight('<div>abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  it('has a line-height greater than the body\'s font-size', function () {
    var lnHeight = this.lineHeight;
    assert.greaterThan(lnHeight, 40);
  });
});

// Kitchen sink tests
// Testing a pt unit type explicitly
describe('A pt line-height div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 27pt;">abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  // DEV: This verifies our conversion is correct
  it('has a line-height of 36px', function () {
    assert.strictEqual(this.lineHeight, 36); // 27 * 4/3
  });
});

// Testing a mm unit type explicitly (IE6)
describe('A mm line-height div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 50.8mm;">abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  // DEV: This verifies our conversion is correct
  it('has a line-height of 192px', function () {
    assert.strictEqual(this.lineHeight, 192); // 50.8 * 96/25.4
  });
});

// Testing a cm unit type explicitly (IE6)
describe('A cm line-height div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 2.54cm;">abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  // DEV: This verifies our conversion is correct
  it('has a line-height of 96px', function () {
    assert.strictEqual(this.lineHeight, 96); // 2.54 * 96/2.54
  });
});

// Testing a in unit type explicitly (IE6)
describe('A in line-height div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 2in;">abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  // DEV: This verifies our conversion is correct
  it('has a line-height of 192px', function () {
    assert.strictEqual(this.lineHeight, 192); // 2 * 96
  });
});

// Testing a pc unit type explicitly (IE6)
describe('A pc line-height div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 2pc;">abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  // DEV: This verifies our conversion is correct
  it('has a line-height of 32px', function () {
    assert.strictEqual(this.lineHeight, 32); // 2pc * 12pt/1pc * 4px/3pt
  });
});

// Mass test all other unit types
// DEV: Units taken from https://developer.mozilla.org/en-US/docs/Web/CSS/length
function testCssLength(cssLength) {
  describe('A ' + cssLength + ' line-height div processed by line-height', function () {
    testUtils.getLineHeight('<div style="line-height: 20' + cssLength + ';">abc</div>');

    it('has a line-height equal to its height', function () {
      var height = this.node.offsetHeight;
      assert.greaterThanOrEqual(this.lineHeight, height - 1);
      assert.lessThanOrEqual(this.lineHeight, height + 1);
    });
  });
}
var cssLengths = ['em', 'ex', 'ch', 'rem', 'vh', 'vw', 'vmin', 'vmax', 'px', 'mm', 'cm', 'in', 'pt', 'pc', 'mozmm'];
for (var i = 0; i < cssLengths; i += 1) {
  testCssLength(cssLengths[i]);
}

// Verify there is no bleeding between
describe('An em line-height with a pt font div processed by line-height', function () {
  testUtils.getLineHeight('<div style="line-height: 2.5em; font-size: 33pt;">abc</div>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  it('has a line-height greater than the default', function () {
    var lnHeight = this.lineHeight;
    assert.greaterThan(lnHeight, _defaultLnHeight);
  });
});

// Verify we return a line-height specific for a the tag type (e.g. h2 over div)
describe('A div-specific font-size style and an h2 processed by line-height', function () {
  testUtils.addGlobalCss('div', 'font-size: 60px;');
  testUtils.getLineHeight('<h2>abc</h2>');

  it('has a line-height equal to its height', function () {
    var height = this.node.offsetHeight;
    assert.strictEqual(this.lineHeight, height);
  });

  it('has a line-height under the div font-size', function () {
    var lnHeight = this.lineHeight;
    assert.lessThan(lnHeight, 50);
  });
});

// Verify we properly handle textareas
// https://github.com/twolfson/line-height/issues/4
describe('A textarea processed by line-height', function () {
  testUtils.getLineHeight('<div><div id="div">abc</div><textarea id="textarea">def</textarea></div>');

  it('has a line-height equal to a div\'s line-height', function () {
    var divNode = document.getElementById('div');
    var textareaNode = document.getElementById('textarea');
    assert.strictEqual(lineHeight(divNode), lineHeight(textareaNode));
  });
});
