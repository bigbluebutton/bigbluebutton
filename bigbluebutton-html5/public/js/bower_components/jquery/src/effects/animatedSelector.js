define([
  '../core',
  '../selector',
  '../effects',
], (jQuery) => {
  jQuery.expr.filters.animated = function (elem) {
    return jQuery.grep(jQuery.timers, fn => elem === fn.elem).length;
  };
});
