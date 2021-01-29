"use strict";

exports.__esModule = true;
exports.resetIdCounter = exports.TabPanel = exports.Tab = exports.TabList = exports.Tabs = void 0;

var _Tabs = _interopRequireDefault(require("./components/Tabs"));

exports.Tabs = _Tabs.default;

var _TabList = _interopRequireDefault(require("./components/TabList"));

exports.TabList = _TabList.default;

var _Tab = _interopRequireDefault(require("./components/Tab"));

exports.Tab = _Tab.default;

var _TabPanel = _interopRequireDefault(require("./components/TabPanel"));

exports.TabPanel = _TabPanel.default;

var _uuid = require("./helpers/uuid");

exports.resetIdCounter = _uuid.reset;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }