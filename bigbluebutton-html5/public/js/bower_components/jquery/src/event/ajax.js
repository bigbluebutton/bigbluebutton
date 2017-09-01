define([
  '../core',
  '../event',
], (jQuery) => {
// Attach a bunch of functions for handling common AJAX events
  jQuery.each([
    'ajaxStart',
    'ajaxStop',
    'ajaxComplete',
    'ajaxError',
    'ajaxSuccess',
    'ajaxSend',
  ], (i, type) => {
    jQuery.fn[type] = function (fn) {
      return this.on(type, fn);
    };
  });
});
