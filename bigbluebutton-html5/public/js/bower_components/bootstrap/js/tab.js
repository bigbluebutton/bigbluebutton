/* ========================================================================
 * Bootstrap: tab.js v3.3.6
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+(function ($) {
  // TAB CLASS DEFINITION
  // ====================

  const Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element);
    // jscs:enable requireDollarBeforejQueryAssignment
  };

  Tab.VERSION = '3.3.6';

  Tab.TRANSITION_DURATION = 150;

  Tab.prototype.show = function () {
    const $this = this.element;
    const $ul = $this.closest('ul:not(.dropdown-menu)');
    let selector = $this.data('target');

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return;

    const $previous = $ul.find('.active:last a');
    const hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0],
    });
    const showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0],
    });

    $previous.trigger(hideEvent);
    $this.trigger(showEvent);

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return;

    const $target = $(selector);

    this.activate($this.closest('li'), $ul);
    this.activate($target, $target.parent(), () => {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0],
      });
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0],
      });
    });
  };

  Tab.prototype.activate = function (element, container, callback) {
    const $active = container.find('> .active');
    const transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false);

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true);

      if (transition) {
        element[0].offsetWidth; // reflow for transition
        element.addClass('in');
      } else {
        element.removeClass('fade');
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true);
      }

      callback && callback();
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next();

    $active.removeClass('in');
  };


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      const $this = $(this);
      let data = $this.data('bs.tab');

      if (!data) $this.data('bs.tab', (data = new Tab(this)));
      if (typeof option === 'string') data[option]();
    });
  }

  const old = $.fn.tab;

  $.fn.tab = Plugin;
  $.fn.tab.Constructor = Tab;


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old;
    return this;
  };


  // TAB DATA-API
  // ============

  const clickHandler = function (e) {
    e.preventDefault();
    Plugin.call($(this), 'show');
  };

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);
}(jQuery));
