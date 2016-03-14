// General utility methods

Meteor.methods({
  // POST request using javascript
  // @param  {string} path   path of submission
  // @param  {string} params parameters to submit
  // @param  {string} method method of submission ("post" is default)
  // @return {undefined}
  postToUrl(path, params, method='post') {
    let $hiddenField, form, key;
    form = $('<form></form>');
    form.attr({
      method: method,
      action: path,
    });
    for (key in params) {
      if (params.hasOwnProperty(key)) {
        $hiddenField = $('input');
        $hiddenField.attr({
          type: 'hidden',
          name: key,
          value: params[key],
        });
        form.append($hiddenField);
      }
    }

    $('body').append(form);
    return form.submit();
  },
});

// thickness can be a number (e.g. "2") or a string (e.g. "2px")
this.formatThickness = function (thickness) {
  if (thickness == null) {
    thickness = '1'; // default value
  }

  if (!thickness.toString().match(/.*px$/)) {
    `#${thickness}px`; // leading "#" - to be compatible with Firefox
  }

  return thickness;
};

// applies zooming to the stroke thickness
this.zoomStroke = function (thickness) {
  let currentSlide, ratio;
  currentSlide = BBB.getCurrentSlide();
  ratio = ((currentSlide != null ? currentSlide.slide.width_ratio : void 0) + (currentSlide != null ? currentSlide.slide.height_ratio : void 0)) / 2;
  return thickness * 100 / ratio;
};
