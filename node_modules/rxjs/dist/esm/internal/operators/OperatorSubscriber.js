import { Subscriber } from '../Subscriber';
export class OperatorSubscriber extends Subscriber {
    constructor(destination, onNext, onComplete, onError, onFinalize) {
        super(destination);
        this.onFinalize = onFinalize;
        this._next = onNext
            ? function (value) {
                try {
                    onNext(value);
                }
                catch (err) {
                    destination.error(err);
                }
            }
            : super._next;
        this._error = onError
            ? function (err) {
                try {
                    onError(err);
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : super._error;
        this._complete = onComplete
            ? function () {
                try {
                    onComplete();
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : super._complete;
    }
    unsubscribe() {
        var _a;
        const { closed } = this;
        super.unsubscribe();
        !closed && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
    }
}
//# sourceMappingURL=OperatorSubscriber.js.map