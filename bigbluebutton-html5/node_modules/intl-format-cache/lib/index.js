/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/
var RelativeTimeFormat;
// -- Utilities ----------------------------------------------------------------
function getCacheId(inputs) {
    return JSON.stringify(inputs.map(function (input) {
        return input && typeof input === 'object' ? orderedProps(input) : input;
    }));
}
function orderedProps(obj) {
    return Object.keys(obj)
        .sort()
        .map(function (k) {
        var _a;
        return (_a = {}, _a[k] = obj[k], _a);
    });
}
var memoizeFormatConstructor = function (FormatConstructor, cache) {
    if (cache === void 0) { cache = {}; }
    return function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var cacheId = getCacheId(args);
        var format = cacheId && cache[cacheId];
        if (!format) {
            format = new ((_a = FormatConstructor).bind.apply(_a, [void 0].concat(args)))();
            if (cacheId) {
                cache[cacheId] = format;
            }
        }
        return format;
    };
};
export default memoizeFormatConstructor;
//# sourceMappingURL=index.js.map