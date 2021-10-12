import { __read, __spreadArray } from "tslib";
import { operate } from '../util/lift';
import { concatAll } from './concatAll';
import { internalFromArray } from '../observable/fromArray';
import { popScheduler } from '../util/args';
export function concat() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = popScheduler(args);
    return operate(function (source, subscriber) {
        concatAll()(internalFromArray(__spreadArray([source], __read(args)), scheduler)).subscribe(subscriber);
    });
}
//# sourceMappingURL=concat.js.map