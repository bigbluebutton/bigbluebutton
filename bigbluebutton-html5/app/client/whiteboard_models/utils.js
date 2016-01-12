Meteor.methods({
  postToUrl(path, params, method="post") {
    let $hiddenField, form, key;
    form = $("<form></form>");
    form.attr({
      "method": method,
      "action": path
    });
    for(key in params) {
      if(params.hasOwnProperty(key)) {
        $hiddenField = $("input");
        $hiddenField.attr({
          "type": "hidden",
          "name": key,
          "value": params[key]
        });
        form.append($hiddenField);
      }
    }
    $('body').append(form);
    return form.submit();
  }
});

this.formatThickness = function(thickness) {
  if(thickness == null) {
    thickness = "1";
  }
  if(!thickness.toString().match(/.*px$/)) {
    `#${thickness}px`;
  }
  return thickness;
};

this.zoomStroke = function(thickness) {
  let currentSlide, ratio;
  currentSlide = BBB.getCurrentSlide("zoomStroke");
  ratio = ((currentSlide != null ? currentSlide.slide.width_ratio : void 0) + (currentSlide != null ? currentSlide.slide.height_ratio : void 0)) / 2;
  return thickness * 100 / ratio;
};
