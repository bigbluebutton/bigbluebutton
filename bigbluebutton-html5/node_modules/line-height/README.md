# line-height [![Build status](https://travis-ci.org/twolfson/line-height.svg?branch=master)](https://travis-ci.org/twolfson/line-height)

Calculate line-height of an HTML element (IE6 compatible)

This was created for provide a well-tested module for calculating [line-height][] in pixels for [trunkata][], a line-based truncation library for HTML.

[line-height]: https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
[trunkata]: https://github.com/twolfson/trunkata

## Getting Started
`line-height` is available via the following:

- [npm][npm], `npm install line-height`
- [bower][bower], `bower install line-height`
- [component][component], `component install line-height`
- [Download via HTTP][download]

[npm]: http://npmjs.org/
[bower]: http://bower.io/
[component]: http://component.io/
[download]: https://raw.github.com/twolfson/line-height/master/dist/line-height.js

For `npm` and `component`, you can load it in as follows:

```js
var lineHeight = require('line-height');
```

For `bower` and `http`, you can use vanilla JS
```html
<script src="components/line-height.js"></script>
window.lineHeight; // `line-height` is defined on `window` in camelCase
```

or you can use [AMD][amd]

[amd]: http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition

```js
require(['line-height'], funtion (lineHeight) { /* code */ });
```

or [CommonJS][commonjs] syntax (see `npm`/`component` section).

[commonjs]: http://wiki.commonjs.org/wiki/Modules/1.0

Once you have the module loaded, you can get the `line-height` of any node in the DOM.

```js
// Calculate the `line-height` of the body
lineHeight(document.body); // 19

// Calculate the `line-height` of an h2
var h2 = document.createElement('h2');
document.body.appendChild(h2);
lineHeight(h2); // 29

// Calculate how many lines tall an element is
var div = document.createElement('div');
div.innerHTML = '<p>1</p><p>2</p>';
(lineHeight(div) / div.offsetHeight); // 2, how trunkata performs its calculations
```

## Donations
Support this project and [others by twolfson][projects] via [donations][support-me]

[projects]: http://twolfson.com/projects
[support-me]: http://twolfson.com/support-me

## Documentation
`line-height` provides a single function.

```js
lineHeight(node);
/**
 * Calculate the `line-height` of a given node
 * @param {HTMLElement} node Element to calculate line height of. Must be in the DOM.
 * @returns {Number} `line-height` of the element in pixels
 */
```

## Solved problems
### `line-height: normal`
In a large amount of browsers, the [computed style][computed-style] for an element's `line-height` is `normal` by default.

If it is specified by any other means (e.g. ancestor has a `line-height` or the element has a `line-height` specified), it is either a [CSS length][css-length].

To solve this problem, we create a vanilla element of the same `nodeName` (e.g. `h2` if it is an `h2`), apply the original element's `font-size`, and return the element `offsetHeight`. This is the `height` of `1 line` of the element (i.e. `line-height`).

[computed-style]: https://developer.mozilla.org/en-US/docs/Web/API/window.getComputedStyle
[css-length]: https://developer.mozilla.org/en-US/docs/Web/CSS/length

### Converting `pt`, `pc`, `in`, `cm`, `mm` to `px`
In most browsers, when the `line-height` is specified in `pt`, `pc`, `in`, `cm` or `mm`, the `computedStyle` value is in the same unit.

To solve this problem, we use the [standard ratios of conversion to pixels][css-length] to make a conversion to pixels.

- 3pt to 4px
- 1pc to 16px
- 1in to 96px
- 2.54cm to 96px
- 25.4mm to 96px

### `numeric` font-size in IE6
In IE6, `numeric` `font-size`s (e.g. `font-size: 2.3`) are returned without a unit.

To solve this problem, we treat this number as an `em` since it is relative as well. To do that, we set the element's style to `"numeric value" + "em"`, compute and save the `font-size`, remove the temporary style. This conversion gives us the unit in `pt` which we know how to deal with from before.

## Development
### Testing
Tests can be run once via:

```bash
npm test
# Or with Karma directly via
# npm run test-karma-single
```

Tests can also be run continuously via:

```bash
npm run test-karma-single
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via `npm run lint` and test via `npm test`.

## License
Copyright (c) 2013 Todd Wolfson

Licensed under the MIT license.
