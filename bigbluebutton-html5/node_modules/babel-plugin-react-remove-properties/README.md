# babel-plugin-react-remove-properties

> Babel plugin for removing React properties.

[![npm version](https://img.shields.io/npm/v/babel-plugin-react-remove-properties.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-react-remove-properties)
[![npm downloads](https://img.shields.io/npm/dm/babel-plugin-react-remove-properties.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-react-remove-properties)
[![Build Status](https://travis-ci.org/oliviertassinari/babel-plugin-react-remove-properties.svg?branch=master)](https://travis-ci.org/oliviertassinari/babel-plugin-react-remove-properties)

[![Dependencies](https://img.shields.io/david/oliviertassinari/babel-plugin-react-remove-properties.svg?style=flat-square)](https://david-dm.org/oliviertassinari/babel-plugin-react-remove-properties)
[![DevDependencies](https://img.shields.io/david/dev/oliviertassinari/babel-plugin-react-remove-properties.svg?style=flat-square)](https://david-dm.org/oliviertassinari/babel-plugin-react-remove-properties#info=devDependencies&view=list)

## Installation

```sh
npm install --save-dev babel-plugin-react-remove-properties
```

## The problem solved

This is useful when using selectors like data-test to run selenium test. Those properties are useless when running the code in production. You can **save bandwidth** by removing them.

## Example

**In**
```js
class Foo extends React.Component {
  render() {
    return (
      <div className="bar" data-test="thisIsASelectorForSelenium">
        Hello Wold!
      </div>
    );
  }
}
```

**Out**
```js
class Foo extends React.Component {
  render() {
    return (
      <div className="bar">
        Hello Wold!
      </div>
    );
  }
}
```

## Usage

#### Via `.babelrc` (Recommended)

**.babelrc**

without options:
```json
{
  "env": {
    "production": {
      "plugins": [
        "react-remove-properties"
      ]
    }
  }
}
```

with options. We accepts an array of property names:
```json
{
  "env": {
    "production": {
      "plugins": [
        ["react-remove-properties", {"properties": ["data-test", "data-foo"]}]
      ]
    }
  }
}
```

#### Via CLI

```sh
babel --plugins react-remove-properties script.js
```

#### Via Node API

without options:
```js
require('babel-core').transform('code', {
  plugins: [
    'react-remove-properties',
  ],
});
```

with options:
```js
require('babel-core').transform('code', {
  plugins: [
    ['react-remove-properties', {properties: ['data-test', 'data-foo']}],
  ],
});
```

## License

MIT
