# makeup-screenreader-trap

<p>
    <a href="https://travis-ci.org/makeup-js/makeup-screenreader-trap"><img src="https://api.travis-ci.org/makeup-js/makeup-screenreader-trap.svg?branch=master" alt="Build Status" /></a>
    <a href='https://coveralls.io/github/makeup-js/jquery-screenreader-trap?branch=master'><img src='https://coveralls.io/repos/makeup-js/makeup-screenreader-trap/badge.svg?branch=master&service=github' alt='Coverage Status' /></a>
    <a href="https://david-dm.org/makeup-js/makeup-screenreader-trap"><img src="https://david-dm.org/makeup-js/makeup-screenreader-trap.svg" alt="Dependency status" /></a>
    <a href="https://david-dm.org/makeup-js/makeup-screenreader-trap#info=devDependencies"><img src="https://david-dm.org/makeup-js/makeup-screenreader-trap/dev-status.svg" alt="devDependency status" /></a>
</p>

A vanilla JavaScript port of <a href="https://github.com/ianmcburnie/jquery-screenreader-trap">jquery-screenreader-trap</a>.

This module restricts screen reader virtual cursor to a single subtree in the DOM. This behaviour is useful when implementing a modal interface (e.g. a modal dialog).

```js
const screenreaderTrap = require('makeup-screenreader-trap');

// trap an element
screenreaderTrap.trap(document.querySelector('el'));

// untrap the current trapped element
screenreaderTrap.untrap();
```

## Experimental

This module is still in an experimental state, until it reaches v1.0.0 you must consider all minor releases as breaking changes. Patch releases may introduce new features, but will be backwards compatible.

## Install

```js
// via npm
npm install makeup-screenreader-trap

// via yarn
yarn add makeup-screenreader-trap
```

## Events

* screenreaderTrap : fired by trapped element when screenreader trap is activated
* screenreaderUntrap : fired by trapped element when screenreader trap is deactivated

## Dependencies

* None

## Development

* `npm start`
* `npm test`
* `npm run lint`
* `npm run fix`
* `npm run build`
* `npm run clean`

The following hooks exist, and do not need to be invoked manually:

* `npm prepublish` cleans, lints, tests and builds on every `npm publish` command
* `pre-commit` cleans, lints, tests and builds on every `git commit` command

## Test Reports

Each test run will generate the following reports:

* `/reports/coverage` contains Istanbul code coverage report
* `/reports/html` contains HTML test report

## CI Build

https://travis-ci.org/makeup-js/makeup-screenreader-trap

## Code Coverage

https://coveralls.io/github/makeup-js/makeup-screenreader-trap?branch=master
