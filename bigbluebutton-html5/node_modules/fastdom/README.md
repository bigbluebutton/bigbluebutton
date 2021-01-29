# fastdom [![Build Status](https://travis-ci.org/wilsonpage/fastdom.svg?branch=master)](https://travis-ci.org/wilsonpage/fastdom) [![NPM version](https://badge.fury.io/js/fastdom.svg)](http://badge.fury.io/js/fastdom) [![npm](https://img.shields.io/npm/dm/fastdom.svg?maxAge=2592000)]() [![Coverage Status](https://coveralls.io/repos/wilsonpage/fastdom/badge.svg?branch=master&service=github)](https://coveralls.io/github/wilsonpage/fastdom?branch=master) ![gzip size](http://img.badgesize.io/https://unpkg.com/fastdom/fastdom.min.js?compression=gzip)


Eliminates layout thrashing by batching DOM read/write operations (~600 bytes minified gzipped).

```js
fastdom.measure(() => {
  console.log('measure');
});

fastdom.mutate(() => {
  console.log('mutate');
});

fastdom.measure(() => {
  console.log('measure');
});

fastdom.mutate(() => {
  console.log('mutate');
});
```

Outputs:

```
measure
measure
mutate
mutate
```

## Examples

- [Animation example](http://wilsonpage.github.io/fastdom/examples/animation.html)
- [Aspect ratio example](http://wilsonpage.github.io/fastdom/examples/aspect-ratio.html)

## Installation

FastDom is CommonJS and AMD compatible, you can install it in one of the following ways:

```sh
$ npm install fastdom --save
```

or [download](http://github.com/wilsonpage/fastdom/raw/master/fastdom.js).

## How it works

FastDom works as a regulatory layer between your app/library and the DOM. By batching DOM access we **avoid unnecessary document reflows** and dramatically **speed up layout performance**.

Each measure/mutate job is added to a corresponding measure/mutate queue. The queues are emptied (reads, then writes) at the turn of the next frame using [`window.requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame).

FastDom aims to behave like a singleton across *all* modules in your app. When any module requires `'fastdom'` they  get the same instance back, meaning FastDom can harmonize DOM access app-wide.

Potentially a third-party library could depend on FastDom, and better integrate within an app that itself uses it.

## API

### FastDom#measure(callback[, context])

Schedules a job for the 'measure' queue. Returns a unique ID that can be used to clear the scheduled job.

```js
fastdom.measure(() => {
  const width = element.clientWidth;
});
```

### FastDom#mutate(callback[, context])

Schedules a job for the 'mutate' queue. Returns a unique ID that can be used to clear the scheduled job.

```js
fastdom.mutate(() => {
  element.style.width = width + 'px';
});
```

### FastDom#clear(id)

Clears **any** scheduled job.

```js
const read = fastdom.measure(() => {});
const write = fastdom.mutate(() => {});

fastdom.clear(read);
fastdom.clear(write);
```

## Strict mode

It's very important that all DOM mutations or measurements go through `fastdom` to ensure good performance; to help you with this we wrote `fastdom-strict`. When `fastdom-strict.js` is loaded, it will throw errors when sensitive DOM APIs are called at the wrong time.

This is useful when working with a large team who might not all be aware of `fastdom` or its benefits. It can also prove useful for catching 'un-fastdom-ed' code when migrating an app to `fastdom`.

```html
<script src="fastdom.js"></script>
<script src="fastdom-strict.js"></script>
```

```js
element.clientWidth; // throws
fastdom.mutate(function() { element.clientWidth; }); // throws
fastdom.measure(function() { element.clientWidth; }); // does not throw
```

```js
"Error: Can only get .clientWidth during 'measure' phase"
```

- `fastdom-strict` will not throw if nodes are not attached to the document.
- You should use `fastdom-strict` in development to catch rendering performance issues before they hit production.
- It is not advisable to use `fastdom-strict` in production.

## Exceptions

FastDom is async, this can therefore mean that when a job comes around to being executed, the node you were working with may no longer be there. These errors are usually not critical, but they can cripple your app.

FastDom allows you to register a `catch` handler. If `fastdom.catch` has been registered, FastDom will catch any errors that occur in your jobs, and run the handler instead.

```js
fastdom.catch = (error) => {
  // Do something if you want
};

```

## Extensions

The core `fastdom` library is designed to be as light as possible. Additional functionality can be bolted on in the form of 'extensions'. It's worth noting that `fastdom` is a 'singleton' by design, so all tasks (even those scheduled by extensions) will reach the same global task queue.

**Fastdom ships with some extensions:**

- [`fastdom-promised`](extensions/fastdom-promised.js) - Adds Promise based API
- [`fastdom-sandbox`](extensions/fastdom-sandbox.js) - Adds task grouping concepts

### Using an extension

Use the `.extend()` method to extend the current `fastdom` to create a new object.

```html
<script src="fastdom.js"></script>
<script src="extensions/fastdom-promised.js"></script>
```

```js
// extend fastdom
const myFastdom = fastdom.extend(fastdomPromised);

// use new api
myFastdom.mutate(...).then(...);
```

Extensions can be chained to construct a fully customised `fastdom`.

```js
const myFastdom = fastdom
  .extend(fastdomPromised)
  .extend(fastdomSandbox);
```

### Writing an extension

```js
const myFastdom = fastdom.extend({
  measure(fn, ctx) {
    // do custom stuff ...

    // then call the parent method
    return this.fastdom.measure(fn, ctx);
  },

  mutate: ...
});
```

You'll notice `this.fastdom` references the parent `fastdom`. If you're extending a core API and aren't calling the parent method, you're doing something wrong.

When distributing an extension only export a plain object to allow users to compose their own `fastdom`.

```js
module.exports = {
  measure: ...,
  mutate: ...,
  clear: ...
};
```

## Tests

```sh
$ npm install
$ npm test
```

## Author

- **Wilson Page** - [@wilsonpage](http://twitter.com/wilsonpage)

## Contributors

- **Wilson Page** - [@wilsonpage](http://twitter.com/wilsonpage)
- **Paul Irish** - [@paulirish](http://github.com/paulirish)
- **Kornel Lesinski** - [@pornel](http://github.com/pornel)
- **George Crawford** - [@georgecrawford](http://github.com/georgecrawford)

## License

(The MIT License)

Copyright (c) 2016 Wilson Page <wilsonpage@me.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
