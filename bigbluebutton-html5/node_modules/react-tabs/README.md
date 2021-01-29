# react-tabs [![Build Status](https://travis-ci.org/reactjs/react-tabs.svg?branch=master)](https://travis-ci.org/reactjs/react-tabs) [![npm version](https://img.shields.io/npm/v/react-tabs.svg)](https://www.npmjs.com/package/react-tabs)

An accessible and easy tab component for ReactJS.

http://reactcommunity.org/react-tabs/

> Supports React 0.14.9+, 15.3+ and 16+

<ins><blockquote class="rich-diff-level-zero"> <p class="rich-diff-level-one">react-tabs was tested on real mobile devices and browsers with<br>
  <img src="http://reactcommunity.org/react-tabs/7215e21fc3d710d2257900135d6fc03c.svg" height="50" alt="Browserstack">

</p> </blockquote></ins>

## Installing

```bash
yarn add react-tabs
```
or
```bash
npm install --save react-tabs
```

You can also use react-tabs directly as UMD build in an HTML document by adding

```html
<script src="https://unpkg.com/react-tabs@2/dist/react-tabs.development.js" />
<!-- or -->
<script src="https://unpkg.com/react-tabs@2/dist/react-tabs.production.min.js" />
```

For example usages of the UMD builds have a look at the [`old_examples/umd`](./old_examples/umd/) folder.
The development UMD build also needs the package `prop-types` being loaded besides `react`.

## Basic Example

```js
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

export default () => (
  <Tabs>
    <TabList>
      <Tab>Title 1</Tab>
      <Tab>Title 2</Tab>
    </TabList>

    <TabPanel>
      <h2>Any content 1</h2>
    </TabPanel>
    <TabPanel>
      <h2>Any content 2</h2>
    </TabPanel>
  </Tabs>
);
```

## API

### resetIdCounter(): void

Allows reseting the internal id counter which is used to generate unique id's for tabs and tab panels.

You should never need to use this in the browser. Only if you are running an isomorphic react app that is rendered on the server you should call `resetIdCounter()` before every render so that the ids that get generated on the server match the ids generated in the browser.

```js
import { resetIdCounter } from 'react-tabs';

resetIdCounter();
ReactDOMServer.renderToString(...);
```

## Components

react-tabs consists of 4 components which all need to be used together.

### &lt;Tabs /&gt;

If you specify additional props on the `<Tabs />` component they will be forwarded to the rendered `<div />`.

#### className: `string | Array<string> | { [string]: boolean }`

> default: `"react-tabs"`

Provide a custom class name for the outer `<div />` of the tabs.

> You can also supply an array of class names or an object where the class names are the key and the value is a boolean indicating if the name should be added. See the docs of [classnames](https://github.com/JedWatson/classnames#usage) on how to supply different class names.

#### defaultFocus: `boolean`

> default: `false`

If set to `true` the tabs will be focused on initial render. This allows immediate use of keyboard keys to switch tabs after the first render.

#### defaultIndex: `number`

> default: `0`

This allows changing the tab that should be open on initial render. This is a zero-based index, so first tab is `0`, second tab is `1`, ...

> This can only be used in uncontrolled mode when react-tabs handles the current selected tab internally and for this reason cannot be used together with `selectedIndex`. See [here](#controlled-vs-uncontrolled-mode) for more info on modes.

#### disabledTabClassName: `string`

> default: `"react-tabs__tab--disabled"`

Provide a custom class name for disabled tabs.

> This option can also be set directly at the `<Tab />` component.

#### domRef: `(node: ?HTMLElement) => void`

> default: `null`

Register a callback that will receive the underlying DOM node for every mount. It will also receive null on unmount.

#### forceRenderTabPanel: `boolean`

> default: `false`

By default only the current active tab will be rendered to DOM. If set to `true` all tabs will be rendered to the DOM always.

> This can also be enabled for each individual `<TabPanel />` component with its prop `forceRender`.

#### onSelect: `(index: number, lastIndex: number, event: Event) => ?boolean`

> default: `undefined`

This event handler is called every time a tab is about to change. It will be called with the `index` that it will be changed to, the `lastIndex` which was selected before and the underlying `event` which is usually either a `keydown` or `click` event. When `index` and `lastIndex` are equal it means the user clicked on the currently active tab.

The callback can optionally return `true` to cancel the change to the new tab.

> Returning `true` when the change to the new tab should be canceled is also important in controlled mode, as react-tabs still internally handles the focus of the tabs.

> In controlled mode the `onSelect` handler is a required prop.

#### selectedIndex: `number`

> default: `null`

Set the currently selected tab. This is a zero-based index, so first tab is `0`, second tab is `1`, ...

This enables controlled mode, which also requires `onSelect` to be set. See [here](#controlled-vs-uncontrolled-mode) for more info on modes.

#### selectedTabClassName: `string`

> default: `"react-tabs__tab--selected"`

Provide a custom class name for the active tab.

> This option can also be set directly at the `<Tab />` component.

#### selectedTabPanelClassName: `string`

> default: `"react-tabs__tab-panel--selected"`

Provide a custom class name for the active tab panel.

> This option can also be set directly at the `<TabPanel />` component.

### &lt;TabList /&gt;

If you specify additional props on the `<TabList />` component they will be forwarded to the rendered `<ul />`.

#### className: `string | Array<string> | { [string]: boolean }`

> default: `"react-tabs__tab-list"`

Provide a custom class name for the `<ul />`.

> You can also supply an array of class names or an object where the class names are the key and the value is a boolean indicating if the name should be added. See the docs of [classnames](https://github.com/JedWatson/classnames#usage) on how to supply different class names.

### &lt;Tab /&gt;

If you specify additional props on the `<Tab />` component they will be forwarded to the rendered `<li />`.

#### className: `string | Array<string> | { [string]: boolean }`

> default: `"react-tabs__tab"`

Provide a custom class name for the `<li />`.

> You can also supply an array of class names or an object where the class names are the key and the value is a boolean indicating if the name should be added. See the docs of [classnames](https://github.com/JedWatson/classnames#usage) on how to supply different class names.

#### disabled: `boolean`

> default: `false`

Disable this tab which will make it not do anything when clicked. Also a disabled class name will be added (see `disabledClassName`)

#### disabledClassName: `string`

> default: `"react-tabs__tab--disabled"`

Provide a custom class name for disabled tabs.

> This option can also be set for all `<Tab />` components with the prop `disabledTabClassName` on `<Tabs />`.

#### selectedClassName: `string`

> default: `"react-tabs__tab--selected"`

Provide a custom class name for the active tab.

> This option can also be set for all `<Tab />` components with the prop `selectedTabClassName` on `<Tabs />`.

#### tabIndex: `string`

> default: if selected `"0"` otherwise `null`

Overrides the tabIndex to enabled tabbing between tabs.

### &lt;TabPanel /&gt;

If you specify additional props on the `<TabPanel />` component they will be forwarded to the rendered `<div />`.

#### className: `string | Array<string> | { [string]: boolean }`

> default: `"react-tabs__tab-panel"`

Provide a custom class name for the `<div />` containing the tab content.

> You can also supply an array of class names or an object where the class names are the key and the value is a boolean indicating if the name should be added. See the docs of [classnames](https://github.com/JedWatson/classnames#usage) on how to supply different class names.

#### forceRender: `boolean`

> default: `false`

By default the tab content will only be rendered when the tab is active. If set to `true` the tab will also be rendered if inactive.

> This can also be enabled for all `<TabPanel />` components with the prop `forceRenderTabPanel` on `<Tabs />`.

#### selectedClassName: `string`

> default: `"react-tabs__tab-panel--selected"`

Provide a custom class name for the active tab panel.

> This option can also be set for all `<TabPanel />` components with the prop `selectedTabPanelClassName` on `<Tabs />`.

## Controlled vs Uncontrolled mode

React tabs has two different modes it can operate in, which change the way how much you need to take care about the state yourself.

### Uncontrolled mode

This is the default mode of react-tabs and makes the react-tabs components handle its state internally. You can change the starting tab with `defaultIndex` and you can listen for changes with `onSelect`.

In this mode you cannot force a tab change during runtime.

```js
<Tabs defaultIndex={1} onSelect={index => console.log(index)}>
  <TabList>
    <Tab>Title 1</Tab>
    <Tab>Title 2</Tab>
  </TabList>
  <TabPanel></TabPanel>
  <TabPanel></TabPanel>
</Tabs>
```

### Controlled mode

This mode has to be enabled by supplying `selectedIndex` to the `<Tabs />` component.

In this mode react-tabs does not handle any tab selection state internally and leaves all the state management up to the outer application.

This mode also enforces you to set a handler for `onSelect`. `defaultIndex` does not have any effect and will therefore throw an error.

```js
class App extends Component {
  constructor() {
    super();
    this.state = { tabIndex: 0 };
  }
  render() {
    return (
      <Tabs selectedIndex={this.state.tabIndex} onSelect={tabIndex => this.setState({ tabIndex })}>
        <TabList>
          <Tab>Title 1</Tab>
          <Tab>Title 2</Tab>
        </TabList>
        <TabPanel></TabPanel>
        <TabPanel></TabPanel>
      </Tabs>
    );
  }
}
```

## Styling

react-tabs does not include any style loading by default. Default stylesheets are provided and can be included in your application if desired.

### Webpack

When using webpack and a appropriate loader (`css-loader`, `sass-loader`, `less-loader` or `style-loader`) you can simply import the default stylesheet.

```js
import 'react-tabs/style/react-tabs.css';
// or
import 'react-tabs/style/react-tabs.scss';
// or
import 'react-tabs/style/react-tabs.less';
```

### SASS

When using SASS you can easily import the default styles

```scss
@import '../../path/to/node_modules/react-tabs/style/react-tabs.scss';
```

### LESS

When using LESS you can easily import the default styles

```scss
@import '../../path/to/node_modules/react-tabs/style/react-tabs.less';
```

### UMD

When using the UMD version of react-tabs you can easily use the default styles by adding

```html
<html>
  <head>
    ...
    <link rel="stylesheet" href="https://unpkg.com/react-tabs@2/style/react-tabs.css">
  </head>
  ...
</html>
```


### Custom Style

You can also always just simply copy the default style to your own css/scss/less and modify it to your own needs. The changelog will always tell you when classes change and we also consider changes that break the styling as semver major.

### Custom Components

In case you want to create your own component wrapping the ones that the library provides, you have to set its `tabsRole`. This value is used inside react-tabs to check the role of a component inside `<Tabs />`.

Possible values for tabsRole are:
 * Tab
 * TabPanel
 * TabList

``` javascript
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';

const CustomTab = ({ children }) => (
  <Tab>
    <h1>{children}</h1>
  </Tab>
);

CustomTab.tabsRole = 'Tab'; // Required field to use your custom Tab

const App = () => (
  <Tabs>
    <TabList>
      <CustomTab>Custom Tab 1</CustomTab>
      <CustomTab>Custom Tab 2</CustomTab>
    </TabList>
    <TabPanel>Panel 1</TabPanel>
    <TabPanel>Panel 2</TabPanel>
  </Tabs>
);
```

## License

MIT
