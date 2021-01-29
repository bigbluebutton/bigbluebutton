# path-browserify change log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## 1.0.0
This release updates to the Node v10.3.0 API. **This change is breaking**,
because path methods now throw errors when called with arguments that are not
strings.

* Add `path.parse` and `path.format`.
* Add `path.posix` as an alias to `path`.
* Port tests from Node.js.
