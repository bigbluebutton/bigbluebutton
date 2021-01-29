# React Render In Browser Component

[![Build Status](https://travis-ci.org/flexdinesh/react-render-in-browser.svg?branch=master)](https://travis-ci.org/flexdinesh/react-render-in-browser)
[![npm version](https://badge.fury.io/js/react-render-in-browser.svg)](https://www.npmjs.com/package/react-render-in-browser)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A React component that helps you render browser specific content.

## Why? [![start with why](https://img.shields.io/badge/start%20with-why%3F-brightgreen.svg?style=flat)](http://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action)

Ever wanted to put up a banner for all your IE users and ask them to try your site in Chrome/Firefox?

With **RenderInBrowser** component you can render content specific to browsers. 🎉

```jsx
<RenderInBrowser ie only>
  <div>All the magic tricks in this site work best in Chrome/Firefox!</div>
</RenderInBrowser>
```

## Install

```
$ npm install --save react-render-in-browser
```

## Usage

```jsx
import RenderInBrowser from 'react-render-in-browser';

const Example = () => {
  return (
    <div>
      <RenderInBrowser ie only>
        <div>Ugh, our super duper animation won't work in IE</div>
      </RenderInBrowser>
      <RenderInBrowser except firefox safari>
        <div>Why don't you use Firefox or Safari?</div>
      </RenderInBrowser>
      <RenderInBrowser chrome firefox only>
        <div>I like Chrome and Firefox</div>
      </RenderInBrowser>
    </div>
  );
};
```

The div `Ugh, our super duper animation won't work in IE` will be rendered only in IE.

The div `Why don't you use Firefox or Safari?` will be rendered in all browsers except Firefox and Safari.

The div `I like Chrome and Firefox` will be rendered only in Chrome or Firefox.

## API

- [Browsers](#browsers)
- [Conditions](#conditions)

### Browsers

The following browsers are supported as prop types and they are **case-sensitive**.

1. chrome
2. firefox
3. safari
4. opera
5. ie
6. edge
7. mobile

Note that `mobile` is a type of browser. Desktop chrome and mobile chrome are not the same although they share the same name. They are built independent of each other and what necessarily works in Desktop Chrome might not necessarily work in mobile Chrome. Most mobile browsers behave the same and identifying them apart is a bit tricky and thus we're grouping all mobile browsers into one.

### Conditions

The following conditions are supported as prop types and they are **case-sensitive**.

#### only

When **only** is used, the children will render only in browsers passed as props.

```jsx
<RenderInBrowser ie edge only>
  <div>Renderded only in IE and Edge</div>
</RenderInBrowser>
```

#### except

When **except** is used, the children will render in all browsers except those that are passed as props.

```jsx
<RenderInBrowser except safari>
  <div>Rendered in all except safari</div>
</RenderInBrowser>
```

## License

MIT © Dinesh Pandiyan
