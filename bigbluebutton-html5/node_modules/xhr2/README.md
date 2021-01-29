# XMLHttpRequest Emulation for node.js

This is an [npm](https://npmjs.org/) package that implements the
[W3C XMLHttpRequest](http://www.w3.org/TR/XMLHttpRequest/) specification on top
of the [node.js](http://nodejs.org/) APIs.


## Supported Platforms

This library is tested against the following platforms.

* [node.js](http://nodejs.org/) 0.6
* [node.js](http://nodejs.org/) 0.8
* [node.js](http://nodejs.org/) 0.10
* [node.js](http://nodejs.org/) 0.11

Keep in mind that the versions above are not hard requirements.


## Installation and Usage

The preferred installation method is to add the library to the `dependencies`
section in your `package.json`.

```json
{
  "dependencies": {
    "xhr2": "*"
  }
}
```

Alternatively, `npm` can be used to install the library directly.

```bash
npm install xhr2
```

Once the library is installed, `require`-ing it returns the `XMLHttpRequest`
constructor.

```javascript
var XMLHttpRequest = require('xhr2');
```

The other objects that are usually defined in an XHR environment are hanging
off of `XMLHttpRequest`.

```javascript
var XMLHttpRequestUpload = XMLHttpRequest.XMLHttpRequestUpload;
```

MDN (the Mozilla Developer Network) has a
[great intro to XMLHttpRequest](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Using_XMLHttpRequest).

This library's [CoffeeDocs](http://coffeedoc.info/github/pwnall/node-xhr2/) can
be used as quick reference to the XMLHttpRequest specification parts that were
implemented.


## Features

The following standard features are implemented.

* `http` and `https` URI protocols
* Basic authentication according to the XMLHttpRequest specification
* request and response header management
* `send()` accepts the following data types: String, ArrayBufferView,
  ArrayBuffer (deprecated in the standard)
* `responseType` values: `text`, `json`, `arraybuffer`
* `readystatechange` and download progress events
* `overrideMimeType()`
* `abort()`
* `timeout`
* automated redirection following

The following node.js extensions are implemented.

* `send()` accepts a node.js Buffer
* Setting `responseType` to `buffer` produces a node.js Buffer
* `nodejsSet` does XHR network configuration that is not exposed in browsers,
  for security reasons

The following standard features are not implemented.

* FormData
* Blob
* `file://` URIs
* `data:` URIs
* upload progress events
* synchronous operation
* Same-origin policy checks and CORS
* cookie processing


## Versioning

The library aims to implement the
[W3C XMLHttpRequest](http://www.w3.org/TR/XMLHttpRequest/) specification, so
the library's API will always be a (hopefully growing) subset of the API in the
specification.


## Development

The following commands will get the source tree in a `node-xhr2/` directory and
build the library.

```bash
git clone git://github.com/pwnall/node-xhr2.git
cd node-xhr2
npm install
npm pack
```

Installing CoffeeScript globally will let you type `cake` instead of
`node_modules/.bin/cake`

```bash
npm install -g coffeescript
```

The library comes with unit tests that exercise the XMLHttpRequest API.

```bash
cake test
```

The tests themselves can be tested by running them in a browser environment,
where a different XMLHttpRequest implementation is available. Both Google
Chrome and Firefox deviate from the specification in small ways, so it's best
to run the tests in both browsers and mentally compute an intersection of the
failing tests.

```bash
cake webtest
BROWSER=firefox cake webtest
```


## Copyright and License

The library is Copyright (c) 2013 Victor Costan, and distributed under the MIT
License.
