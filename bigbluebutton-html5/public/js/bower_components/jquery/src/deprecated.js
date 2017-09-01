define([
  './core',
], (jQuery) => {
  jQuery.fn.extend({

    bind(types, data, fn) {
      return this.on(types, null, data, fn);
    },
    unbind(types, fn) {
      return this.off(types, null, fn);
    },

    delegate(selector, types, data, fn) {
      return this.on(types, selector, data, fn);
    },
    undelegate(selector, types, fn) {
		// ( namespace ) or ( selector, types [, fn] )
      return arguments.length === 1 ?
			this.off(selector, '**') :
			this.off(types, selector || '**', fn);
    },
    size() {
      return this.length;
    },
  });

  jQuery.fn.andSelf = jQuery.fn.addBack;
});

