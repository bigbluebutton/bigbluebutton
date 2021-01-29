'use strict';

var strictdom = require('strictdom');
var fastdom = require('../fastdom');

/**
 * Mini logger
 *
 * @return {Function}
 */
var debug = 0 ? console.log.bind(console, '[fastdom-strict]') : function() {};

/**
 * Enabled state
 *
 * @type {Boolean}
 */
var enabled = false;

window.fastdom = module.exports = fastdom.extend({
  measure: function(fn, ctx) {
    debug('measure');
    var task = !ctx ? fn : fn.bind(ctx);
    return this.fastdom.measure(function() {
      if (!enabled) return task();
      return strictdom.phase('measure', task);
    }, ctx);
  },

  mutate: function(fn, ctx) {
    debug('mutate');
    var task = !ctx ? fn : fn.bind(ctx);
    return this.fastdom.mutate(function() {
      if (!enabled) return task();
      return strictdom.phase('mutate', task);
    }, ctx);
  },

  strict: function(value) {
    if (value) {
      enabled = true;
      strictdom.enable();
    } else {
      enabled = false;
      strictdom.disable();
    }
  }
});

// turn on strict-mode
window.fastdom.strict(true);
