"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partition = void 0;
var not_1 = require("../util/not");
var filter_1 = require("../operators/filter");
var from_1 = require("./from");
function partition(source, predicate, thisArg) {
    return [filter_1.filter(predicate, thisArg)(from_1.innerFrom(source)), filter_1.filter(not_1.not(predicate, thisArg))(from_1.innerFrom(source))];
}
exports.partition = partition;
//# sourceMappingURL=partition.js.map