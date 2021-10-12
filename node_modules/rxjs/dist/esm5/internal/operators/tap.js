import { isFunction } from '../util/isFunction';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { identity } from '../util/identity';
export function tap(observerOrNext, error, complete) {
    var tapObserver = isFunction(observerOrNext) || error || complete ? { next: observerOrNext, error: error, complete: complete } : observerOrNext;
    return tapObserver
        ? operate(function (source, subscriber) {
            source.subscribe(new OperatorSubscriber(subscriber, function (value) {
                var _a;
                (_a = tapObserver.next) === null || _a === void 0 ? void 0 : _a.call(tapObserver, value);
                subscriber.next(value);
            }, function () {
                var _a;
                (_a = tapObserver.complete) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                subscriber.complete();
            }, function (err) {
                var _a;
                (_a = tapObserver.error) === null || _a === void 0 ? void 0 : _a.call(tapObserver, err);
                subscriber.error(err);
            }));
        })
        :
            identity;
}
//# sourceMappingURL=tap.js.map