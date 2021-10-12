import { __extends } from "tslib";
import { AsyncScheduler } from './AsyncScheduler';
var AsapScheduler = (function (_super) {
    __extends(AsapScheduler, _super);
    function AsapScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AsapScheduler.prototype.flush = function (action) {
        this._active = true;
        this._scheduled = undefined;
        var actions = this.actions;
        var error;
        var index = -1;
        action = action || actions.shift();
        var count = actions.length;
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this._active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsapScheduler;
}(AsyncScheduler));
export { AsapScheduler };
//# sourceMappingURL=AsapScheduler.js.map