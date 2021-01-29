# strictdom [![Build Status](https://travis-ci.org/wilsonpage/strictdom.svg?branch=master)](https://travis-ci.org/wilsonpage/strictdom)

> Throws errors when performance sensitive DOM APIs are called out of 'phase'.

```js
strictdom.phase('measure');
element.clientWidth; // does not throw
strictdom.phase('mutate');
element.innerHTML = 'foo'; // does not throw
```

```js
strictdom.phase('measure');
element.innerHTML = 'foo'; // throws
strictdom.phase('mutate');
element.clientWidth; // throws
```

## How should I use it?

`strictdom` is a low-level tool for higher-level libraries to digest. Libraries such as `fastdom` are designed to make writing performant (DOM) JavaScript easier. `fastdom` can use `strictdom` to inform when DOM APIs are being called at the wrong time, catching costly mistakes.

## APIs observed

- `document.execCommand()`
- `document.elementFromPoint()`
- `document.elementsFromPoint()`
- `document.scrollingElement()`
- `Node#appendChild()`
- `Node#insertBefore()`
- `Node#removeChild()`
- `Node#textContent`
- `Element#scrollIntoView()`
- `Element#scrollBy()`
- `Element#scrollTo()`
- `Element#getClientRects()`
- `Element#getBoundingClientRect()`
- `Element#clientLeft`
- `Element#clientWidth`
- `Element#clientHeight`
- `Element#scrollLeft`
- `Element#scrollTop`
- `Element#scrollWidth`
- `Element#scrollHeight`
- `Element#innerHTML`
- `Element#outerHTML`
- `Element#insertAdjacentHTML`
- `Element#remove()`
- `Element#setAttribute()`
- `Element#removeAttribute()`
- `Element#className`
- `Element#classList`
- `HTMLElement.offsetLeft`
- `HTMLElement.offsetTop`
- `HTMLElement.offsetWidth`
- `HTMLElement.offsetHeight`
- `HTMLElement.offsetParent`
- `HTMLElement.innerText`
- `HTMLElement.outerText`
- `HTMLElement.focus()`
- `HTMLElement.blur()`
- `HTMLElement.style`
- `CharacterData#remove()`
- `CharacterData#data`
- `Range#getClientRects()`
- `Range#getBoundingClientRect()`
- `MouseEvent#layerX`
- `MouseEvent#layerY`
- `MouseEvent#offsetX
- `MouseEvent#offsetY`
- `HTMLButtonElement#reportValidity()`
- `HTMLDialogElement#showModal()`
- `HTMLFieldSetElement#reportValidity()
- `HTMLImageElement#width`
- `HTMLImageElement#height`
- `HTMLImageElement#x`
- `HTMLImageElement#y`
- `HTMLInputElement#reportValidity()`
- `HTMLKeygenElement#reportValidity()`
- `SVGSVGElement#currentScale()`
- `window#getComputedStyle()`
- `window#innerWidth`
- `window#innerHeight`
- `window#scrollX`
- `window#scrollY`
- `window#scrollBy()`
- `window#scrollTo()`
- `window#scroll()`

## Known issues

- No support for `element#dataset`. Need cross-browser technique of observing `element.dataset.foo = ...`. [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) could work, but only available in Gecko.
- Detection for strange blink/webkit 'value' getters (eg. `window.scrollY`) is lame. Need something that is more robust (no sniffing), that doesn't cause reflow like `Object.getOwnPropertyDescriptor()` does.

## Credits

This project was forked from `esprehn/fx-framework`.

## License

(The MIT License)

Copyright (c) 2013 Wilson Page <wilsonpage@me.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
