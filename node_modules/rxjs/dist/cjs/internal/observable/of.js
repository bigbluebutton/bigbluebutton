"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.of = void 0;
var fromArray_1 = require("./fromArray");
var scheduleArray_1 = require("../scheduled/scheduleArray");
var args_1 = require("../util/args");
function of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    return scheduler ? scheduleArray_1.scheduleArray(args, scheduler) : fromArray_1.internalFromArray(args);
}
exports.of = of;
//# sourceMappingURL=of.js.map