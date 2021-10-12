"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = void 0;
var mergeAll_1 = require("../operators/mergeAll");
var fromArray_1 = require("./fromArray");
var from_1 = require("./from");
var empty_1 = require("./empty");
var args_1 = require("../util/args");
function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    var concurrent = args_1.popNumber(args, Infinity);
    var sources = args;
    return !sources.length
        ?
            empty_1.EMPTY
        : sources.length === 1
            ?
                from_1.innerFrom(sources[0])
            :
                mergeAll_1.mergeAll(concurrent)(fromArray_1.internalFromArray(sources, scheduler));
}
exports.merge = merge;
//# sourceMappingURL=merge.js.map