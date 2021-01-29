v3.6.1 - Tue, 25 Sep 2018 11:47:45 UTC
--------------------------------------

- [a2c38cc](../../commit/a2c38cc) [fixed] set default role for accessibility
- [921358e](../../commit/921358e) Add explicit comments as suggested in PR review
- [3d74c1b](../../commit/3d74c1b) Update doc to inform v3 users about close transition
- [1e349c0](../../commit/1e349c0) [fixed] remove aria-modal attr to prevent browser bugs


v3.5.1 - Wed, 04 Jul 2018 10:22:38 UTC
--------------------------------------

- [c3e06ab](../../commit/c3e06ab) [added] additional data attributes.
- [e5a80d6](../../commit/e5a80d6) [fixed] portal node will be reparented if necessary on props change


v3.4.5 - Fri, 01 Jun 2018 11:11:21 UTC
--------------------------------------

- [2bf2dd2](../../commit/2bf2dd2) chore: update Makefile.
- [73893a2](../../commit/73893a2) [fixed]  Safety check for SSR (#668)
- [5f92df7](../../commit/5f92df7) very small spelling correction in comment
- [92cae36](../../commit/92cae36) [chore] don't allow publish if branch is not master.


v3.4.4 - Mon, 23 Apr 2018 23:08:59 UTC
--------------------------------------

-


v3.4.2 - Thu, 19 Apr 2018 09:16:47 UTC
--------------------------------------

- [529ca33](../../commit/529ca33) Add `testId` prop for use as a test hook
- [e294dc7](../../commit/e294dc7) [added] Add module field to package json
- [d8fe0dd](../../commit/d8fe0dd) Added default prop for defaultStyles property


v3.4.1 - Tue, 17 Apr 2018 09:49:06 UTC
--------------------------------------

- [2132488](../../commit/2132488) Add eslint rule to disallow importing devDependencies in lib sources
- [4887c69](../../commit/4887c69) Move react-lifecycles-compat to `dependencies` and upgrade it to v3
- [f748406](../../commit/f748406) Remove cWRP usage in ModalPortal
- [e91d59a](../../commit/e91d59a) Fix lifecycle method usages in Modal
- [0dd7805](../../commit/0dd7805) [chore] update the pull request template...
- [fa8e33c](../../commit/fa8e33c) removed un-safe lifecycle methods componentWillMount and componentWillUpdate. Implemented getDerivedStateFromProps and getSnapshotBeforeUpdate lifecycle methods using react-lifecycles-compat polyfill.
- [d8c3dad](../../commit/d8c3dad) [fixed] mouse up event on overlay triggered the closing of the modal
- [d6f3463](../../commit/d6f3463) [chore] Update transitions.md (#635)
- [fa87046](../../commit/fa87046) [Chore] update README.md: added description for setting app element


v3.3.2 - Mon, 12 Mar 2018 22:16:32 UTC
--------------------------------------

- [eb1ac25](../../commit/eb1ac25) [chore] update list of files that shouldn't be packed.
- [d8051f9](../../commit/d8051f9) [chore] improve documentation for shouldCloseOnOverlayClick.
- [9012d81](../../commit/9012d81) [chore] add to docs the default value of the html class option.


v3.3.1 - Wed, 21 Feb 2018 09:53:44 UTC
--------------------------------------

- [0c6d966](../../commit/0c6d966) [added] htmlOpenClassName will follow the same rules like... bodyOpenClassName.
- [088e68e](../../commit/088e68e) [added] add class to html when modal is open
- [e6159b6](../../commit/e6159b6) [chore] Fix README table of contents
- [241b8a6](../../commit/241b8a6) [chore] Move API documentation from README to gitbook
- [4c1e590](../../commit/4c1e590) Expand documentation


v3.2.1 - Thu, 15 Feb 2018 09:07:28 UTC
--------------------------------------

- [0809958](../../commit/0809958) [added] ref for overlay and content
- [61b141d](../../commit/61b141d) Fix minor typos in spec


v3.1.13 - Fri, 09 Feb 2018 10:27:15 UTC
---------------------------------------

- [700a28a](../../commit/700a28a) [fixed] Tab focus escapes modal on shift + tab after opening


v3.1.12 - Mon, 05 Feb 2018 08:34:57 UTC
---------------------------------------

- [6c4d4ad](../../commit/6c4d4ad) [fixed] management of aria-hidden attribute decoupled from the management of the body open class
- [93b2c05](../../commit/93b2c05) [chore] Bump bootstrap example to use 4.0 release
- [0bd1505](../../commit/0bd1505) [chore] edits style doc
- [c7c928c](../../commit/c7c928c) [chore] updates style page
- [f5b9c11](../../commit/f5b9c11) [chore] updates README - styles


v3.1.11 - Tue, 16 Jan 2018 12:45:05 UTC
---------------------------------------

- [3256671](../../commit/3256671) [fixed] when ModalPortal is clicked, shouldClose is true if shouldCloseOnOverlayClick is true.


v3.1.10 - Tue, 19 Dec 2017 17:42:03 UTC
---------------------------------------

- [9a3542a](../../commit/9a3542a) [fixed] stop propagating ESC key event.


v3.1.8 - Tue, 12 Dec 2017 20:43:25 UTC
--------------------------------------

-


v3.1.7 - Mon, 04 Dec 2017 14:22:29 UTC
--------------------------------------

- [22e8b23](../../commit/22e8b23) [fixed] ignore .babelrc when publishing to npm.
- [5693a40](../../commit/5693a40) [chore] typo on word (#574)


v3.1.6 - Thu, 30 Nov 2017 10:24:00 UTC
--------------------------------------

- [0122238](../../commit/0122238) [chore] added badge to react-modal gitter channel.
- [c925763](../../commit/c925763) remove code climate badge from readme.
- [38dc8f9](../../commit/38dc8f9) [fixes] don't set aria-hidden if appElement is not defined.


v3.1.5 - Mon, 27 Nov 2017 19:56:19 UTC
--------------------------------------

- [cae99d9](../../commit/cae99d9) [fixed] shouldCloseOnOverlayClick conflict with text inputs.


v3.1.4 - Fri, 24 Nov 2017 14:26:59 UTC
--------------------------------------

- [c1e535f](../../commit/c1e535f) [chore] changelog writer.
- [a296627](../../commit/a296627) fix: prevent mouse event when shouldCloseOnOverlayClick = false.
- [cba31dd](../../commit/cba31dd) Update on_request_close.md


v3.1.3 - Wed, 22 Nov 2017 16:38:06 UTC
--------------------------------------

- [c434e84](../../commit/c434e84) [fixed] Respect overflow css property when determining whether or not a tabbable node is hidden


v3.1.2 - Mon, 06 Nov 2017 19:56:00 UTC
--------------------------------------

- [3c86e2d](../../commit/3c86e2d) [fixed] shouldFocusAfterRender and shouldReturnFocusAfterClose flags.
- [0f2bf9e](../../commit/0f2bf9e) [fixed] corretly walk when using TAB.
- [5cf9326](../../commit/5cf9326) Update README.md
- [cdcc1cb](../../commit/cdcc1cb) [chore]: fixed changelog generator.


v3.1.0 - Wed, 25 Oct 2017 14:26:17 UTC
--------------------------------------

- [42d724c](../../commit/42d724c) [added] shouldReturnFocusAfterClose to control focus.
- [400ac13](../../commit/400ac13) [chore] make sure all tests meet line-length requirement.
- [18a15eb](../../commit/18a15eb) [fixed] correct property name shouldFocusAfterRender.


v3.0.4 - Wed, 18 Oct 2017 19:55:15 UTC
--------------------------------------

- [5ec0f7f](../../commit/5ec0f7f) [fixed] Removes body classNames after the modal is closed.
- [1fb33d9](../../commit/1fb33d9) [chore] run tests only on node 8.
- [59fbdb3](../../commit/59fbdb3) [chore] specifiy the object when overriding class names.


v3.0.3 - Sat, 14 Oct 2017 17:38:38 UTC
--------------------------------------

- [32441c3](../../commit/32441c3) [fixed] Issue #526 Import PropTypes as default import.


v3.0.2 - Sat, 14 Oct 2017 12:04:40 UTC
--------------------------------------

- [1d495a6](../../commit/1d495a6) [fixed] Add shouldCloseOnEsc prop
- [d98f091](../../commit/d98f091) [chore] update CHANGELOG.md
- [95f628a](../../commit/95f628a) [chore] fix prettier linting after merge issue
- [47d0d87](../../commit/47d0d87) [chore] prettier all the things
- [c0620e0](../../commit/c0620e0) [chore] Use babel-preset-env instead of babel-preset-es2015
- [2a05bd8](../../commit/2a05bd8) [chore] Updated eslint and a few related deps
- [b3701f6](../../commit/b3701f6) [fixed] Issue #526 Import PropTypes as default import.


v3.0.0 - Fri, 06 Oct 2017 13:29:20 UTC
--------------------------------------

- [d0f242b](../../commit/d0f242b) Merged next into master.
- [de3c039](../../commit/de3c039) [chore] remove warning about injectCSS.
- [f77b53e](../../commit/f77b53e) [chore] use canUseDOM from exenv.
- [cc4577c](../../commit/cc4577c) Release 3.0.0-rc2.
- [1260850](../../commit/1260850) [fixed] backward compatibility with previous react versions.
- [d25563c](../../commit/d25563c) [fixed] check for both window and document.createElement.
- [2b835d6](../../commit/2b835d6) [fixed] typeof returns a string (canUseDOM).
- [b942504](../../commit/b942504) [feature] initial support for react 16.


v2.4.1 - Fri, 06 Oct 2017 12:09:11 UTC
--------------------------------------

- [4fa5628](../../commit/4fa5628) [fixed] Drag stop (mouseup) on Overlay closes Modal
- [a712d88](../../commit/a712d88) [chore] update README.md installation for react 16 support.
- [f9a2f3f](../../commit/f9a2f3f) [chore] update README.md.


v2.3.3 - Wed, 04 Oct 2017 01:59:57 UTC
--------------------------------------

- [ace2bf0](../../commit/ace2bf0) [chore] added babel-cli to compile and fix dist configuration.
- [876972b](../../commit/876972b) [chore] removed depencendy 'react-dom-factory'.
- [73db6dd](../../commit/73db6dd) [chore] improve examples style.
- [8970956](../../commit/8970956) [chore] remove code climate yml.
- [d896241](../../commit/d896241) [chore] fix multiple modal example.
- [ce2b34e](../../commit/ce2b34e) [chore] added example with react-router.
- [16c3dce](../../commit/16c3dce) [chore] update dependencies, lint rules and refactor tests.
- [13dfc4e](../../commit/13dfc4e) [chore] update tests.
- [ba81894](../../commit/ba81894) Remove required flag from contentLabel propType in Modal
- [f007aeb](../../commit/f007aeb) [chore] Update description for onRequestClose.


v2.3.2 - Wed, 06 Sep 2017 16:10:27 UTC
--------------------------------------

- [54c59c5](../../commit/54c59c5) Export default property in CommonJS and global object
- [ba526cf](../../commit/ba526cf) [chore] fix changelog generator.


v2.3.1 - Tue, 05 Sep 2017 16:18:41 UTC
--------------------------------------

- [93256e9](../../commit/93256e9) [added] Don't focus after render if we don't want to
- [2adb45d](../../commit/2adb45d) [chore] update readme syntax flavour to jsx


v2.2.4 - Mon, 14 Aug 2017 09:41:39 UTC
--------------------------------------

- [fafa127](../../commit/fafa127) typo fix
- [fe1983b](../../commit/fe1983b) fix #466: Dragging inside modal and release outside of modal closes the modal


v2.2.3 - Thu, 10 Aug 2017 19:27:47 UTC
--------------------------------------

- [1caabed](../../commit/1caabed) [fixed] `Uncaught TypeError: Cannot read property 'state' of null` when unmouting
- [92c23b5](../../commit/92c23b5) [chore] Mention shouldCloseOnOverlayClick dependency
- [a2d5c4e](../../commit/a2d5c4e) [chore] allow latest version for exenv dependency


v2.2.2 - Tue, 11 Jul 2017 14:20:29 UTC
--------------------------------------

- [9076eb7](../../commit/9076eb7) [added] Support using multiple document.body classes
- [581be77](../../commit/581be77) [chore] added test for default parentSelector.
- [e56c414](../../commit/e56c414) [chore] Return null for portal when modal is closed


v2.2.1 - Fri, 30 Jun 2017 09:22:10 UTC
--------------------------------------

- [7301aa7](../../commit/7301aa7) [chore] Change 'a11y' to 'accessibility' in README.md
- [f47e79d](../../commit/f47e79d) [fixed] Modal.removePortal not called when using closeTimeoutMS
- [f386aa4](../../commit/f386aa4) [chore] added more examples.


v2.2.0 - Wed, 28 Jun 2017 18:56:24 UTC
--------------------------------------

- [67ee9f5](../../commit/67ee9f5) [added] allow users to pass aria-* attribute.
- [6f73764](../../commit/6f73764) [chore] update installation documentation.


v2.1.0 - Mon, 26 Jun 2017 22:11:54 UTC
--------------------------------------

- [1baebf4](../../commit/1baebf4) [change] Track open body className appropriately


v2.0.7 - Sun, 25 Jun 2017 17:44:29 UTC
--------------------------------------

- [d1fe05e](../../commit/d1fe05e) [chore] use local babel instead of requiring a global installation.
- [bb69a91](../../commit/bb69a91) [chore] improvements on readme testing section.
- [c2f582f](../../commit/c2f582f) [chore] fix typo.
- [f8edc2b](../../commit/f8edc2b) [fixed] improvements on setAppElement...
- [5641f40](../../commit/5641f40) [chore] update installation section.
- [ae258ec](../../commit/ae258ec) [chore] removing active development section.
- [f5d95e2](../../commit/f5d95e2) Add codesandbox link to the ISSUE_TEMPLATE


v2.0.6 - Tue, 20 Jun 2017 11:23:30 UTC
--------------------------------------

- [1676259](../../commit/1676259) removing trailing space. (#2)
- [07a2753](../../commit/07a2753) [fixed] check if the modal content is available when async update... (#1)
- [cb6504c](../../commit/cb6504c) [fixed] Use bound ref functions
- [7da6ec8](../../commit/7da6ec8) [fix] Unnecessary renders when modal is closed
- [648cc2f](../../commit/648cc2f) [fixed] update script path on bootstrap example.
- [6c780ae](../../commit/6c780ae) Update react-addons-test-utils to react-dom/test-utils
- [385a8eb](../../commit/385a8eb) Update react dependencies
- [8480042](../../commit/8480042) [chore] cache yarn when running on travis-ci.
- [8d87599](../../commit/8d87599) [chore] added documentation for development.
- [aaeb310](../../commit/aaeb310) [chore] added patterns on .gitignore.
- [4ec7184](../../commit/4ec7184) [chode] Add table of contents
- [96fdb90](../../commit/96fdb90) [chore] don't test on node versions < 6.x.y.
- [20fcdc3](../../commit/20fcdc3) [chore] update README.md.
- [4b57b2a](../../commit/4b57b2a) [chore] added script to regenerate all the changelog.
- [21dc212](../../commit/21dc212) [chore] ask before publishing...
- [2af9b89](../../commit/2af9b89) chore] improve publish docs commands.


v2.0.2 - Fri, 16 Jun 2017 13:10:06 UTC
--------------------------------------

- [c1dc7fd](../../commit/c1dc7fd) change PropTypes.String to PropTypes.string


v2.0.1 - Fri, 16 Jun 2017 11:30:58 UTC
--------------------------------------

- [435ab91](../../commit/435ab91) Update eslint config so it should pass
- [b1a28a4](../../commit/b1a28a4) remove yarn.lock per comment
- [389a8fa](../../commit/389a8fa) Address review comments
- [ab11c36](../../commit/ab11c36) [fixed] removing 'es' for now.
- [2f0a1a9](../../commit/2f0a1a9) [fixed] added rules to compile on Makefile.
- [e921de8](../../commit/e921de8) [fixed] use the correct babel presets combination.
- [92ccf1d](../../commit/92ccf1d) Additional changes to support move from src to lib
- [138f8ef](../../commit/138f8ef) Remove unnecessary comma
- [e36336a](../../commit/e36336a) Update yarn.lock
- [d08b96e](../../commit/d08b96e) Create es and commonjs separate build steps
- [d024d3a](../../commit/d024d3a) Transform based on env
- [4704fa7](../../commit/4704fa7) Remove unnecessary react-create-class dependency
- [a6422f6](../../commit/a6422f6) Use ES module for top level export
- [c05e88d](../../commit/c05e88d) Move lib to src so we can use lib for build output


v2.0.0 - Thu, 15 Jun 2017 18:16:21 UTC
--------------------------------------

- [0374b6b](../../commit/0374b6b) [chore] update makefile to run coverage.
- [ba2c124](../../commit/ba2c124) [chore] passing lint...
- [a5cc01b](../../commit/a5cc01b) Use callback ref in readme
- [933f3a4](../../commit/933f3a4) Modify the sample code to es2015 syntax in README.md (#295)
- [8059ded](../../commit/8059ded) Updates License (#303)
- [315d1e1](../../commit/315d1e1) Add code climate and code coverage
- [1c326a1](../../commit/1c326a1) Add Linting (#293)
- [d2fbe55](../../commit/d2fbe55) [chore] added babel stage-2 preset.


v1.9.7 - Thu, 15 Jun 2017 13:28:17 UTC
--------------------------------------

- [df14528](../../commit/df14528) Added cross-env to run tests on windows


v1.9.6 - Thu, 15 Jun 2017 00:57:18 UTC
--------------------------------------

- [91e1a67](../../commit/91e1a67) Remove deprecation warning in react 15.6.0 about React.DOM.noscript
- [937f835](../../commit/937f835) [chore] removing unnecessary file.


v1.9.5 - Wed, 14 Jun 2017 22:57:03 UTC
--------------------------------------

- [3139e85](../../commit/3139e85) [added] refresh portalClassName on componentWillUpdate


v1.9.4 - Tue, 13 Jun 2017 10:12:34 UTC
--------------------------------------

- [0510f62](../../commit/0510f62) Add gzip size badge


v1.9.3 - Tue, 13 Jun 2017 09:21:26 UTC
--------------------------------------

- [28ecc0b](../../commit/28ecc0b) [fixed] compatibility with unstable_handleError.


v1.9.2 - Mon, 12 Jun 2017 21:05:11 UTC
--------------------------------------

- [a61f73c](../../commit/a61f73c) fix react proptypes warning


v1.9.1 - Mon, 12 Jun 2017 16:27:34 UTC
--------------------------------------

- [a12246e](../../commit/a12246e) [changed] use object className and overlayClassName prop to override...


v1.8.1 - Mon, 12 Jun 2017 12:37:12 UTC
--------------------------------------

- [e5bb415](../../commit/e5bb415) [change] allow to customize the react-modal document.body open class.


v1.7.13 - Mon, 12 Jun 2017 10:26:34 UTC
---------------------------------------

- [3bc4719](../../commit/3bc4719) [chore] refactoring tests...


v1.7.12 - Fri, 09 Jun 2017 22:27:37 UTC
---------------------------------------

- [4b69478](../../commit/4b69478) [chore] clean publish resources before start...
- [00ea6fe](../../commit/00ea6fe) [chore] refactor and clean up build system.


v1.7.11 - Thu, 08 Jun 2017 16:47:56 UTC
---------------------------------------

- [a3f69d5](../../commit/a3f69d5) [chore] add travis ci build status on README.md.


v1.7.10 - Thu, 08 Jun 2017 16:43:41 UTC
---------------------------------------

- [651ce99](../../commit/651ce99) [chore] prevent publish if an error occur.


v1.7.9 - Thu, 08 Jun 2017 12:59:39 UTC
--------------------------------------

- [99c7e32](../../commit/99c7e32) [fixed] use Object.assign for now.


v1.7.8 - Thu, 08 Jun 2017 01:45:46 UTC
--------------------------------------

- [14a2fd0](../../commit/14a2fd0) [chore] improving build and publish pipeline.


v1.7.7 - Tue, 18 Apr 2017 07:40:29 UTC
--------------------------------------

- [889ffde](../../commit/889ffde) [fixed] Removed additional es2015 causing problems


v1.7.6 - Thu, 13 Apr 2017 08:41:16 UTC
--------------------------------------

- [048ef2d](../../commit/048ef2d) [fixed] remove additional es2015 from refCount


v1.7.5 - Thu, 13 Apr 2017 08:20:34 UTC
--------------------------------------

- [1db0ee1](../../commit/1db0ee1) [fixed] remove es2015 from v1 branch


v1.7.4 - Thu, 13 Apr 2017 07:37:19 UTC
--------------------------------------

- [86987d5](../../commit/86987d5) Use create-react-class to avoid React.createClass deprecations
- [16efd72](../../commit/16efd72) Use prop-types
- [e579a0d](../../commit/e579a0d) [fix] keep references of modals.


v1.7.3 - Mon, 13 Mar 2017 19:22:00 UTC
--------------------------------------

- [e1df119](../../commit/e1df119) [fixed] remove portal context in timeout (#353)


v1.7.2 - Wed, 08 Mar 2017 20:59:52 UTC
--------------------------------------

- [185f2b0](../../commit/185f2b0) Remove .bind(this) from removePortal call


v1.7.1 - Thu, 02 Mar 2017 07:49:30 UTC
--------------------------------------

- [a1d29c6](../../commit/a1d29c6) [fixed] rewrite removePortal as es5 function


v1.7.0 - Wed, 01 Mar 2017 20:54:08 UTC
--------------------------------------

- [fb3eb5e](../../commit/fb3eb5e) [chore] use afterEach to cleanup modals automatically.
- [ea4f37a](../../commit/ea4f37a) [fixed] respect closeTimeoutMS during unmount
- [f6768b7](../../commit/f6768b7) [change] improve reliability on focus management.
- [4232477](../../commit/4232477) [fixed] Enable click to close in iOS (#301) (#304) (#313)


v1.6.5 - Sat, 31 Dec 2016 10:14:28 UTC
--------------------------------------

- [c50f19a](../../commit/c50f19a) [fixed] Add file extention to entry point (#294)
- [f22c206](../../commit/f22c206) Add v2 development info
- [426f5e4](../../commit/426f5e4) Update testing setup
- [945919d](../../commit/945919d) Ignore the _book directory
- [ff23603](../../commit/ff23603) Move documentation site to GitBook
- [08bf920](../../commit/08bf920) [fixed] closeTimeoutMS doesn't work without onRequestClose (#278)
- [6c68e95](../../commit/6c68e95) Update CHANGELOG.md


v1.6.4 - Wed, 14 Dec 2016 22:48:59 UTC
--------------------------------------

- [ad0b071](../../commit/ad0b071) Bumps lodash.assign to 4.2.0 (#277)
- [694cb87](../../commit/694cb87) [fixed] updated references from rackt to reactjs. (#244)
- [1dea51d](../../commit/1dea51d) Update travis build matrix
- [e50dc70](../../commit/e50dc70) Update CHANGELOG.md


v1.6.3 - Mon, 12 Dec 2016 07:03:43 UTC
--------------------------------------

- [a2e5952](../../commit/a2e5952) [docs] added required props info to README (#274)
- [f460c10](../../commit/f460c10) Update CHANGELOG.md


v1.6.2 - Sun, 11 Dec 2016 10:32:03 UTC
--------------------------------------

-


v1.6.1 - Tue, 06 Dec 2016 10:16:10 UTC
--------------------------------------

- [62d87e1](../../commit/62d87e1) [fixed] Remove arrow function from ES5 source


v1.6.0 - Tue, 06 Dec 2016 08:09:25 UTC
--------------------------------------

- [de14816](../../commit/de14816) [added] Ability for modal to be appended to arbitrary elements (#183)
- [3fdc672](../../commit/3fdc672) Ensure aria-hidden on appElement is reset on unmount
- [e9fd43d](../../commit/e9fd43d) Document ReactModal__Body--open so people dare to use it
- [3d8e5a0](../../commit/3d8e5a0) [added] Add contentLabel prop to put aria-label on modal content


v1.5.2 - Sat, 08 Oct 2016 08:29:09 UTC
--------------------------------------

- [d78428b](../../commit/d78428b) [fixed] Remove remaining reference to role dialog
- [b09cdf9](../../commit/b09cdf9) Update CHANGELOG.md


v1.5.1 - Fri, 07 Oct 2016 22:11:39 UTC
--------------------------------------

-


v1.5.0 - Fri, 07 Oct 2016 20:18:52 UTC
--------------------------------------

- [919daa3](../../commit/919daa3) [fixed] Remove the default aria role dialog
- [c8106f2](../../commit/c8106f2) Update ModalPortal.js (#228)
- [2e806c7](../../commit/2e806c7) [added] Make modal portal have the dialog role (#223)
- [abe88a8](../../commit/abe88a8) installation instructions (#227)
- [5429f7c](../../commit/5429f7c) [fixed] Don't steal focus from a descendent when rendering (#222)
- [8e767e9](../../commit/8e767e9) [fixed] Add react-dom as a peer dependency
- [ff09b49](../../commit/ff09b49) [fixed] Close modal when mouseDown and MouseUp happen only on the overlay (#217)
- [6550b87](../../commit/6550b87) Revert "[fixed] Dont change body class if isOpen not change (#201)"
- [8e5f5b7](../../commit/8e5f5b7) [fixed] Fix incorrect details in the README
- [e5b0181](../../commit/e5b0181) [added] ability to change default 'ReactModalPortal' class (#208)
- [1e29e4f](../../commit/1e29e4f) [fixed] Dont change body class if isOpen not change (#201)
- [d347547](../../commit/d347547) [fixed] Updates webpack distribution config to reference the correct externals (#210)
- [f0933fd](../../commit/f0933fd) [doc] fix onRequestClose callback in Usage (#195)


v1.4.0 - Thu, 30 Jun 2016 13:12:02 UTC
--------------------------------------

- [13bd46e](../../commit/13bd46e) [fixed] clear the delayed close timer when modal opens again. (#189)
- [70d91eb](../../commit/70d91eb) [fixed] Add missing envify npm dependency. Closes #193 (#194)


v1.3.0 - Tue, 17 May 2016 10:04:50 UTC
--------------------------------------

- [9089a2d](../../commit/9089a2d) [fixed] Make the modal portal render into body again (#176)
- [e9aff7a](../../commit/e9aff7a) Update PULL_REQUEST_TEMPLATE.md


v1.2.1 - Sat, 23 Apr 2016 13:09:46 UTC
--------------------------------------

- [aa66819](../../commit/aa66819) [fixed] Removes unneeded sanitizeProps function (#169)


v1.2.0 - Thu, 21 Apr 2016 16:02:02 UTC
--------------------------------------

- [18f5eae](../../commit/18f5eae) fix typo in README :memo: (#168)
- [a10683a](../../commit/a10683a) [fixed] Make the non-minified dist build present again (#164)
- [04db149](../../commit/04db149) [added] Propagate event on close request (#91)


v1.1.2 - Mon, 18 Apr 2016 20:36:05 UTC
--------------------------------------

- [4509133](../../commit/4509133) [fixed] moved sanitizeProps out of the render calls. (#162)
- [25c1dad](../../commit/25c1dad) Update changelog for 1.1.1


v1.1.1 - Thu, 14 Apr 2016 23:30:45 UTC
--------------------------------------

- [f1555d9](../../commit/f1555d9) Merge branch 'development-improvements'
- [9823bc5](../../commit/9823bc5) Use -p flag in webpack for minification and exclude externals react and react-dom (#159)
- [72c8498](../../commit/72c8498) Move to using webpack for building the library


v1.1.0 - Tue, 12 Apr 2016 07:03:08 UTC
--------------------------------------

- [6c03d17](../../commit/6c03d17) [added] trigger onAfterOpen callback when available. (#154)
- [7cf8463](../../commit/7cf8463) [doc] Update docs to include details about CSS classes


v1.0.0 - Fri, 08 Apr 2016 23:03:25 UTC
--------------------------------------

- [7af8ee5](../../commit/7af8ee5) Update README.md to include testing gotchas (#136)
- [e4be332](../../commit/e4be332) Add extra information for contributors (#143)
- [4e2447a](../../commit/4e2447a) [changed] Updated to add support for React 15  (#152)
- [0d4e600](../../commit/0d4e600) [added] module for default style
- [cf70338](../../commit/cf70338) Avoid stopPropagation
- [f9871c6](../../commit/f9871c6) Merge pull request #94 from apprennet/remove-body-class-unmount
- [cb53bca](../../commit/cb53bca) [fixed] Remove ReactModal__Body--open class when unmounting Modal
- [fe46c63](../../commit/fe46c63) Merge pull request #108 from evoyy/pr/override-anchor-to-document-body
- [b5e38cf](../../commit/b5e38cf) Merge pull request #141 from everdimension/fix-no-tabbable-focus
- [c844719](../../commit/c844719) keep focus on modal if no tabbable elements are within it
- [e8749dd](../../commit/e8749dd) Merge pull request #128 from dorsha/master
- [93c73f3](../../commit/93c73f3) Merge pull request #140 from everdimension/add_missing_webpack_dependency
- [d732041](../../commit/d732041) add missing webpack devDependency
- [6282c3e](../../commit/6282c3e) Added the ability to decide whether the modal should be closed when clicking the overlay area. This is an important ability since in some cases we don't want the modal to be closed when users are clicking outside. Added tests and README instructions.
- [23eee3b](../../commit/23eee3b) Merge pull request #120 from evoyy/pr/bugfix_empty_tabbable_array
- [471ef4c](../../commit/471ef4c) Handle case when no tabbable element exists
- [c13fed9](../../commit/c13fed9) Restore Modal.setAppElement() functionality
- [06ebde2](../../commit/06ebde2) Merge pull request #121 from evoyy/pr/listen-on-all-interfaces
- [597882d](../../commit/597882d) Merge pull request #123 from evoyy/pr/fix_example_css_for_firefox
- [980ad5d](../../commit/980ad5d) Merge pull request #132 from shunjikonishi/shunjikonishi-patch-1
- [bc58b9c](../../commit/bc58b9c) Merge pull request #100 from claydiffrient/bugfix/classes-take-precedence
- [ef02e29](../../commit/ef02e29) Prevent default behavior of ESC key
- [7f631bd](../../commit/7f631bd) Update README.md
- [aac1841](../../commit/aac1841) CSS transform for non-Webkit browsers
- [3e89412](../../commit/3e89412) dev server listens on all interfaces
- [63bee72](../../commit/63bee72) [fixed] Custom classnames override default styles


v0.6.1 - Fri, 23 Oct 2015 12:03:54 UTC
--------------------------------------

- [e20595e](../../commit/e20595e) Merge pull request #87 from flskif/master
- [5705b85](../../commit/5705b85) Ignore react-dom in build


v0.6.0 - Wed, 21 Oct 2015 15:39:48 UTC
--------------------------------------

- [cd4dd21](../../commit/cd4dd21) Merge pull request #85 from miracle2k/master
- [5c59b9f](../../commit/5c59b9f) Use renderSubtreeIntoContainer to keep context.
- [c7153d1](../../commit/c7153d1) Merge pull request #84 from existentialism/typos
- [78fa9bd](../../commit/78fa9bd) fix a couple typos
- [acdcb7c](../../commit/acdcb7c) Merge pull request #83 from roth1002/feature/react-14
- [4b3b885](../../commit/4b3b885) move exenv to dependencies
- [c107d02](../../commit/c107d02) Merge pull request #81 from roth1002/feature/react-14
- [7e12d8a](../../commit/7e12d8a) Modify spec Readme.md example to use ReactDOM.render to replace React.render
- [496bb0b](../../commit/496bb0b) upgrade react 0.14
- [920d421](../../commit/920d421) Merge pull request #70 from dinodsaurus/master
- [4c8ed91](../../commit/4c8ed91) imporved env check
- [33d47db](../../commit/33d47db) added suport for isomorphic rendering


v0.5.0 - Tue, 22 Sep 2015 13:19:44 UTC
--------------------------------------

- [408329f](../../commit/408329f) Updating dependencies
- [b24bc4b](../../commit/b24bc4b) Merge pull request #65 from web2style/master
- [6b50f7b](../../commit/6b50f7b) Merge pull request #58 from jackofseattle/fix/NoMoreInjectCSS
- [4d25989](../../commit/4d25989) [added] Inline CSS for modal and overlay as well as props to override. [changed] injectCSS has been changed to a warning message in preperation for a future removal. lib/components/Modal.js [changed] setAppElement method is now optional. Defaults to document.body and now allows for a css selector to be passed in rather than the whole element.
- [acd3c65](../../commit/acd3c65) Merge pull request #53 from ewiner/master
- [9e092ae](../../commit/9e092ae) Merge pull request #52 from DelvarWorld/noscript
- [8ccf23a](../../commit/8ccf23a) Merge pull request #63 from basarat/patch-1
- [9bd8f68](../../commit/9bd8f68) Update peerDependencies
- [9545427](../../commit/9545427) :memo: link to demos
- [02cf2c3](../../commit/02cf2c3) [fixed] Clear the closeWithTimeout timer before unmounting
- [85a13b8](../../commit/85a13b8) Returning noscript tag instead of null
- [0d5e76a](../../commit/0d5e76a) Updating README


v0.3.0 - Wed, 15 Jul 2015 00:17:24 UTC
--------------------------------------

- [adecf62](../../commit/adecf62) [added] Class name on body when modal is open
- [0e94233](../../commit/0e94233) Updating dependencies
- [3938e55](../../commit/3938e55) Merge pull request #42 from claydiffrient/patch-1
- [669f3a8](../../commit/669f3a8) Merge pull request #39 from wisely0515/ie8-support
- [fbb07d4](../../commit/fbb07d4) Moves classnames to dependencies
- [278b9ba](../../commit/278b9ba) fixed 'unknow runtime error' ie IE8


v0.2.0 - Fri, 08 May 2015 23:16:40 UTC
--------------------------------------

- [1a51bf8](../../commit/1a51bf8) Merge pull request #31 from maisano/patch-1
- [494d7d2](../../commit/494d7d2) Merge pull request #28 from peterjmag/use-classnames-module
- [e06e801](../../commit/e06e801) Merge pull request #22 from misuba/bugfix/server-clean
- [1829f43](../../commit/1829f43) Merge pull request #27 from claydiffrient/master
- [e898b6b](../../commit/e898b6b) Check if modalElement exists in handleFocus.
- [930c4ca](../../commit/930c4ca) Use classnames instead of react/lib/cx.
- [f5fe537](../../commit/f5fe537) [added] Ability to specify style for the modal contents
- [6887b00](../../commit/6887b00) Shim the possibly-absent HTMLElement


v0.1.1 - Tue, 31 Mar 2015 09:56:47 UTC
--------------------------------------

- [bb57045](../../commit/bb57045) Merge pull request #19 from amccloud/patch-2
- [10e9582](../../commit/10e9582) Merge pull request #18 from amccloud/patch-1
- [f86de0a](../../commit/f86de0a) [fixed] shift+tab closes #23
- [bb218ca](../../commit/bb218ca) ignore node_modules
- [c464368](../../commit/c464368) Check for addEventListener before tying to use to support IE 8
- [63b6828](../../commit/63b6828) Remove trailing commas for IE8 support


v0.1.0 - Thu, 26 Feb 2015 10:14:27 UTC
--------------------------------------

- [db8b725](../../commit/db8b725) Merge pull request #16 from arasmussen/master
- [1b8e2d0](../../commit/1b8e2d0) [fixed] ModalPortal's componentWillReceiveProps


v0.0.7 - Fri, 02 Jan 2015 23:44:47 UTC
--------------------------------------

- [ea31beb](../../commit/ea31beb) Using shared stylesheet
- [8e01b27](../../commit/8e01b27) Renaming example
- [399b386](../../commit/399b386) Merge pull request #8 from leoasis/update_react_version
- [a8faa92](../../commit/a8faa92) Fixing paths so they work on gh-pages
- [1024026](../../commit/1024026) Fixing paths so they work on gh-pages
- [2d62f51](../../commit/2d62f51) Adding default example
- [4a85cd2](../../commit/4a85cd2) Update to React 0.12. Fix warnings.


v0.0.6 - Wed, 03 Dec 2014 14:24:45 UTC
--------------------------------------

- [2f1973b](../../commit/2f1973b) Merge branch 'master' of https://github.com/rackt/react-modal
- [28dbc63](../../commit/28dbc63) [added] Supporting custom overlay className closes #14
- [1038e3b](../../commit/1038e3b) Merge pull request #13 from knomedia/kill-extra-alias-in-build
- [6626dae](../../commit/6626dae) [fixed] erroneous alias in webpack build


v0.0.5 - Thu, 13 Nov 2014 11:55:47 UTC
--------------------------------------

- [edd0dc7](../../commit/edd0dc7) Merge pull request #12 from cavneb/example-bootstrap
- [e5cb4e2](../../commit/e5cb4e2) Bootstrap-style modal example
- [b15aa82](../../commit/b15aa82) [added] Supporting custom className
- [b7a38de](../../commit/b7a38de) [fixed] Warning caused by trying to focus null element closes #11
- [2ac5290](../../commit/2ac5290) Better solution for applying focus


v0.0.4 - Tue, 11 Nov 2014 09:08:14 UTC
--------------------------------------

- [ebcc11f](../../commit/ebcc11f) s/script/scripts/
- [278cfbc](../../commit/278cfbc) Merge pull request #10 from rackt/bug-9
- [9616a8c](../../commit/9616a8c) Removing console.log
- [e57bab5](../../commit/e57bab5) [fixed] Issue with focus being lost - closes #9
- [07541b3](../../commit/07541b3) example displaying bug
- [31c160d](../../commit/31c160d) switch to web pack dev server for examples


v0.0.3 - Fri, 31 Oct 2014 13:25:20 UTC
--------------------------------------

- [cf3e57a](../../commit/cf3e57a) Merge pull request #5 from leoasis/fix_main_package_json
- [5ea6651](../../commit/5ea6651) Fix main entry point in package.json
- [2277726](../../commit/2277726) Merge pull request #1 from claydiffrient/master
- [8f7cefd](../../commit/8f7cefd) Updates keyboard handling to use keyCode
- [de0b661](../../commit/de0b661) slightly less junky README
- [cde1572](../../commit/cde1572) hang on people, just hang on.


v0.0.2 - Wed, 24 Sep 2014 20:36:47 UTC
--------------------------------------

-


v0.0.1 - Wed, 24 Sep 2014 16:26:40 UTC
--------------------------------------

- [f0727db](../../commit/f0727db) add built files



