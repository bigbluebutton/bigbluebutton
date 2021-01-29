# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.3.1"></a>
## [2.3.1](https://github.com/reactjs/react-tabs/compare/v2.3.0...v2.3.1) (2019-07-10)


### Bug Fixes

* **tabs:** Handle nodes with parentNode set to undefined instead of null correctly ([0259616](https://github.com/reactjs/react-tabs/commit/0259616))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/reactjs/react-tabs/compare/v2.2.2...v2.3.0) (2018-08-30)


### Bug Fixes

* Fix flickering on iphone when touching tabs ([5d608aa](https://github.com/reactjs/react-tabs/commit/5d608aa)), closes [#186](https://github.com/reactjs/react-tabs/issues/186)
* **style:** Correctly fix flash on iOS ([25cfa16](https://github.com/reactjs/react-tabs/commit/25cfa16))


### Features

* Add support for home and end key on tab list ([#246](https://github.com/reactjs/react-tabs/issues/246)) ([8f5cd84](https://github.com/reactjs/react-tabs/commit/8f5cd84))



<a name="2.2.2"></a>
## [2.2.2](https://github.com/reactjs/react-tabs/compare/v2.2.1...v2.2.2) (2018-04-18)


### Bug Fixes

* **publish:** Compile with latest babel to get rid of react proptype warnings
* **publish:** Added src folder to package ([#232](https://github.com/reactjs/react-tabs/issues/232)) ([a4cc6d0](https://github.com/reactjs/react-tabs/commit/a4cc6d0))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/reactjs/react-tabs/compare/v2.2.0...v2.2.1) (2018-01-09)


### Bug Fixes

* **tabs:** click wrapper container bubbles up to document causing getAttribute() to throw ([#221](https://github.com/reactjs/react-tabs/issues/221)) ([96b163b](https://github.com/reactjs/react-tabs/commit/96b163b))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/reactjs/react-tabs/compare/v2.1.1...v2.2.0) (2018-01-09)


### Features

* **tabs:** verify click tabNode using *[role=tab] ([#220](https://github.com/reactjs/react-tabs/issues/220)) ([5bd6bfe](https://github.com/reactjs/react-tabs/commit/5bd6bfe))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/reactjs/react-tabs/compare/v2.1.0...v2.1.1) (2017-11-17)


### Bug Fixes

* **style:** Fix less and sass to correctly generate tab--disabled class ([b95891e](https://github.com/reactjs/react-tabs/commit/b95891e))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/reactjs/react-tabs/compare/v2.0.0...v2.1.0) (2017-10-05)


### Bug Fixes

* **tabs:** Correctly handle children of type string ([#211](https://github.com/reactjs/react-tabs/issues/211)) ([6fd4002](https://github.com/reactjs/react-tabs/commit/6fd4002))
* **umd:** Fix the umd builds by switching to rollup ([#212](https://github.com/reactjs/react-tabs/issues/212)) ([46c1a60](https://github.com/reactjs/react-tabs/commit/46c1a60))


### Features

* **dependencies:** Support react 16 ([94447e9](https://github.com/reactjs/react-tabs/commit/94447e9))
* **tablist:** Enable overwriting tabIndex on `<Tab>` and allow tabbing among `<Tab>`s by using tab key and enter/space. ([00a8401](https://github.com/reactjs/react-tabs/commit/00a8401))
* **tabs:** Publish also as ES2015 modules ([41415ab](https://github.com/reactjs/react-tabs/commit/41415ab))
* **tabs:** Add `domRef` prop for getting the ref to the tabs DOM node ([#213](https://github.com/reactjs/react-tabs/issues/213)) ([e989491](https://github.com/reactjs/react-tabs/commit/e989491))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/reactjs/react-tabs/compare/v1.1.0...v2.0.0) (2017-09-05)


### Bug Fixes

* **tabs:** Fix activeElement check in iframes in Internet Explorer [#193](https://github.com/reactjs/react-tabs/issues/193) ([#194](https://github.com/reactjs/react-tabs/issues/194)) ([722d52f](https://github.com/reactjs/react-tabs/commit/722d52f))


### Features

* **tabs:** Allow for higher order components. All HOC which use hoist-non-react-statics are supported out of the box ([#196](https://github.com/reactjs/react-tabs/issues/196)) ([1969e65](https://github.com/reactjs/react-tabs/commit/1969e65))
* **tabs:** Always call onSelected callback even if tab is active. ([#195](https://github.com/reactjs/react-tabs/issues/195)) ([bc1910a](https://github.com/reactjs/react-tabs/commit/bc1910a))


### BREAKING CHANGES

* **tabs:** The `onSelect` callback will now also be called when clicking on the currently active tab.



<a name="1.1.0"></a>
## [1.1.0](https://github.com/researchgate/node-package-blueprint/compare/v1.0.0...v1.1.0) (2017-06-13)

### Features

* Add nested TabList and TabPanel support ([#184](https://github.com/reactjs/react-tabs/pull/184)) (Emmet McPoland)

This allows random elements as children for the `<Tabs />` component, for example:

```jsx
<Tabs>
  <div id="tabs-nav-wrapper">
    <button>Left</button>
    <div className="tabs-container">
      <TabList>{tabs}</TabList>
    </div>
    <button>Right</button>
  </div>
  <div className="tab-panels">
    {tabPanels}
  </div>
</Tabs>
```

<a name="1.0.0"></a>
## [1.0.0](https://github.com/researchgate/node-package-blueprint/compare/v0.8.3...v1.0.0) (2017-05-10)

### Features

* New static method to reset the id counter for isomorphic apps. Call this before rendering your application on the server. ([#129](https://github.com/reactjs/react-tabs/pull/129)) (Neehar Venugopal)

```js
import { resetIdCounter } from 'react-tabs';

resetIdCounter();
```

* Allows arbitrary components anywhere inside `<TabList>` ([#139](https://github.com/reactjs/react-tabs/pull/139)) (Alexander Wallin)
* Allow random order of `<TabList />`, `<TabPanel />` and other arbitrary components. The `<TabPanel />` components are matched to the `<Tab />` components in order from top to bottom.

```js
<Tabs>
  <TabPanel />
  <div />
  <TabList>
    <Tab />
    <Tab />
  </TabList>
  <span />
  <TabPanel />
</Tabs>
```

* Introduce controlled and uncontrolled mode. This two modes allow either to control the tabs from your component from the outside or leave the control to the tabs within react-tabs components. (see [README.md](https://github.com/reactjs/react-tabs#controlled-vs-uncontrolled-mode) for more information)
* New prop `selectedTabPanelClassName` on `<Tabs />` to change the class name of the current selected tab panel.
* New prop `defaultIndex` on `<Tabs />` to allow setting the initial displayed tab.
* New prop `forceRender` on `<TabPanel />` to allow force rendering of individual tab panels.
* New prop `selectedClassName` on `<TabPanel />` to allow changing selected class name of individual tab panels.
* New prop `selectedClassName` on `<Tab />` to allow changing selected class name of individual tabs.
* New prop `disabledClassName` on `<Tab />` to allow changing disabled class name of individual tabs.
* Property `className` on all components can now officially take an array as argument.
* PropTypes are now wrapped in `if(process.env.NODE_ENV === 'production') Component.propTypes = { ... }` in order to allow removing of proptypes in production builds.

### BREAKING CHANGES


* Peer dependency for react requires now `^0.14.9` or `^15.3.0`
* `activeTabClassName` moved from `<TabList />` to `<Tabs />` and renamed to `selectedTabClassName`
* `disabledTabClassName` moved from `<TabList />` to `<Tabs />`
* `className` property on all components now overwrites the default classes instead of adding a second class name

```js
// 0.8
<Tabs className="tabs">
    <TabList className="list">
        <Tab className="tab" />
    </TabList>
    <TabPanel className="panel" />
</Tabs>

// Same effect in 1.0
<Tabs className={['tabs', 'react-tabs']}>
    <TabList className={['list', 'react-tabs__tab-list']}>
        <Tab className={['tab', 'react-tabs__tab']} />
    </TabList>
    <TabPanel className={['panel', 'react-tabs__tab-panel']} />
</Tabs>
```

* `selectedIndex` now enables controlled mode, which disables internal management of the active tab. If you were using `selectedIndex` before to set the initial displayed tab use `defaultIndex` now.
* The value `-1` for `selectedIndex` and `defaultIndex` do not activate the first tab anymore, but instead display no tab panel at all. Use `-1` if you want to display only the tabs but have non of them being selected. If you want to have the first tab selected us `0`.
* Support for bower package manager was removed.
* Removed deprecated default export of tabs:

```js
// 0.8
import ReactTabs from 'react-tabs';

<ReactTabs.Tabs></ReactTabs.Tabs>

// in 1.0
import { Tabs } from 'react-tabs';

<Tabs></Tabs>
```

* Removed jsstylesheet dependency and removed default style from javascript. If you want to use the default styles you can use one of the supported methods (see [README.md](https://github.com/reactjs/react-tabs#styling))
* The default class names were all lowercased and separated by hyphen, but still follow BEM methodology. E.g. `ReactTabs` -> `react-tabs`, `ReactTabs__TabPanel--selected` -> `react-tabs__tab-panel--selected`
* `<TabPanel />` components do not set the inline style `display: none` anymore. Hidding and showing a tab panel is now completely done via css and classnames. If you have your own style for the tabs make sure to add the following rules:

```css
.react-tabs__tab-panel {
    display: none;
}

.react-tabs__tab-panel--selected {
    display: block;
}
/* If you use custom class names obviously use the class names you set for the tab panels and selected tab panels */
```

<a name="0.8.3"></a>
## [0.8.3](https://github.com/researchgate/node-package-blueprint/compare/v0.8.2...v0.8.3) (2017-04-19)

### Bug Fixes

* Fix deprecation warnings with react 15.5

<a name="0.8.2"></a>
## [0.8.2](https://github.com/researchgate/node-package-blueprint/compare/v0.8.1...v0.8.2) (2016-10-19)

### Bug Fixes

* Fix UMD build ([#143](https://github.com/reactjs/react-tabs/pull/143))

<a name="0.8.0"></a>
## [0.8.0](https://github.com/researchgate/node-package-blueprint/compare/v0.7.0...v0.8.0) (2016-09-14)

### Features

* Allow other components inside TabList ([#123](https://github.com/reactjs/react-tabs/pull/123))

<a name="0.7.0"></a>
## [0.7.0](https://github.com/researchgate/node-package-blueprint/compare/v0.6.2...v0.7.0) (2016-07-05)

### Features

* Feature/add custom active and disabled class ([#108](https://github.com/reactjs/react-tabs/pull/108))
* Remove aria-expanded attribute ([#71](https://github.com/reactjs/react-tabs/pull/71))

### Bug Fixes

* Fix warning with react 15.2

<a name="0.6.2"></a>
## [0.6.2](https://github.com/researchgate/node-package-blueprint/compare/v0.6.1...v0.6.2) (2016-06-24)

### Bug Fixes

* Fix bower bundling ([#111](https://github.com/reactjs/react-tabs/pull/111), [#112](https://github.com/reactjs/react-tabs/pull/112))

<a name="0.6.1"></a>
## [0.6.1](https://github.com/researchgate/node-package-blueprint/compare/v0.6.0...v0.6.1) (2016-06-23)

### Bug Fixes

* Allow setState in onSelect ([#51](https://github.com/reactjs/react-tabs/pull/51), [#110](https://github.com/reactjs/react-tabs/pull/110))

<a name="0.6.0"></a>
## [0.6.0](https://github.com/researchgate/node-package-blueprint/compare/v0.5.5...v0.6.0) (2016-06-20)

### Features

* Add a cancel option to tab change event handler ([#73](https://github.com/reactjs/react-tabs/pull/73))
* Allow passing through custom attributes ([#93](https://github.com/reactjs/react-tabs/pull/93))

### Bug Fixes

* DOMNode.setAttribute() expects the second param to be string ([#75](https://github.com/reactjs/react-tabs/pull/75), [#76](https://github.com/reactjs/react-tabs/pull/76))
* Fix nesting of multiple instances of react-tabs ([#103](https://github.com/reactjs/react-tabs/pull/103))

<a name="0.5.5"></a>
## [0.5.5](https://github.com/researchgate/node-package-blueprint/compare/v0.5.4...v0.5.5) (2016-06-13)

### Bug Fixes

* Fix main exports of react tabs which were broken in 0.5.4

<a name="0.5.4"></a>
## [0.5.4](https://github.com/researchgate/node-package-blueprint/compare/v0.5.4...v0.5.4) (2016-06-10)

### Bug Fixes

* Update to support react 15 ([#94](https://github.com/reactjs/react-tabs/pull/94))

<a name="0.5.3"></a>
## [0.5.3](https://github.com/researchgate/node-package-blueprint/compare/v0.5.2...v0.5.3) (2016-02-01)

### Bug Fixes

* use correct spelling of aria-labelledby ([#67](https://github.com/reactjs/react-tabs/pull/67))

<a name="0.5.2"></a>
## [0.5.2](https://github.com/researchgate/node-package-blueprint/compare/v0.5.1...v0.5.2) (2016-01-29)

### Bug Fixes

* Server Side Rendering won't work with default styles ([#45](https://github.com/reactjs/react-tabs/pull/45))

<a name="0.5.1"></a>
## [0.5.1](https://github.com/researchgate/node-package-blueprint/compare/v0.5.0...v0.5.1) (2015-10-22)

### Bug Fixes

* Removing ReactDOM from bundle

<a name="0.5.0"></a>
## [0.5.0](https://github.com/researchgate/node-package-blueprint/compare/v0.4.1...v0.5.0) (2015-10-22)

### Features

* New configuration to disable styling via jss ([#25](https://github.com/reactjs/react-tabs/pull/25))
* Avoid white on white Tab labels ([#40](https://github.com/reactjs/react-tabs/pull/40))
* Support react 0.14 ([#43](https://github.com/reactjs/react-tabs/pull/43))

### Bug Fixes

* Fix conditional rendering of tabs ([#37](https://github.com/reactjs/react-tabs/pull/37))
* Issue when conditionally rendering Tab/TabPanel ([#37](https://github.com/reactjs/react-tabs/pull/37))

<a name="0.4.1"></a>
## [0.4.1](https://github.com/researchgate/node-package-blueprint/compare/v0.4.0...v0.4.1) (2015-09-22)

### Bug Fixes

* Do not bundle react into dist ([#26](https://github.com/reactjs/react-tabs/pull/26))

<a name="0.4.0"></a>
## [0.4.0](https://github.com/researchgate/node-package-blueprint/compare/v0.3.0...v0.4.0) (2015-08-18)

### Features

* Support rendering of hidden Tabs ([#28](https://github.com/reactjs/react-tabs/pull/28))
* Support supplying array of child nodes to Tab ([#27](https://github.com/reactjs/react-tabs/pull/27))

<a name="0.3.0"></a>
## [0.3.0](https://github.com/researchgate/node-package-blueprint/compare/v0.2.1...v0.3.0) (2015-08-11)

### Features

* Support for disabling tabs

<a name="0.2.1"></a>
## [0.2.1](https://github.com/researchgate/node-package-blueprint/compare/v0.2.0...v0.2.1) (2015-01-26)

### Bug Fixes

* Bower support ([#22](https://github.com/reactjs/react-tabs/pull/22))
* Issue with React being included twice ([#23](https://github.com/reactjs/react-tabs/pull/23))

<a name="0.2.0"></a>
## [0.2.0](https://github.com/researchgate/node-package-blueprint/compare/v0.1.2...v0.2.0) (2015-01-07)

### Features

* Allowing children of Tab to select Tab ([#9](https://github.com/reactjs/react-tabs/pull/9))
* Only render the selected TabPanel
* Upgrading to React 0.13
* Removing JSX

### Bug Fixes

* Fixing issue with focus management ([#7](https://github.com/reactjs/react-tabs/pull/7))
* Fixing issue caused by no children being provided ([#6](https://github.com/reactjs/react-tabs/pull/6))
* Fixing issue that made dynamic Tabs difficult

<a name="0.1.2"></a>
## [0.1.2](https://github.com/researchgate/node-package-blueprint/compare/v0.1.1...v0.1.2) (2014-07-23)

### Bug Fixes

* Making Tab and TabPanel to be stateless
* Throwing Error when Tab count and TabPanel count aren't equal

<a name="0.1.1"></a>
## [0.1.1](https://github.com/researchgate/node-package-blueprint/compare/v0.1.0...v0.1.1) (2014-07-19)

### Bug Fixes

* Fixing warning: Invalid access to component property
* Fixing style weirdness in Firefox

<a name="0.1.0"></a>
## 0.1.0 (2014-07-18)

### Features

* Initial release
