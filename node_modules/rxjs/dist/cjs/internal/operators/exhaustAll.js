"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exhaustAll = void 0;
var lift_1 = require("../util/lift");
var from_1 = require("../observable/from");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function exhaustAll() {
    return lift_1.operate(function (source, subscriber) {
        var isComplete = false;
        var innerSub = null;
        source.subscribe(new OperatorSubscriber_1.OperatorSubscriber(subscriber, function (inner) {
            if (!innerSub) {
                innerSub = from_1.innerFrom(inner).subscribe(new OperatorSubscriber_1.OperatorSubscriber(subscriber, undefined, function () {
                    innerSub = null;
                    isComplete && subscriber.complete();
                }));
            }
        }, function () {
            isComplete = true;
            !innerSub && subscriber.complete();
        }));
    });
}
exports.exhaustAll = exhaustAll;
//# sourceMappingURL=exhaustAll.js.map