# General utility methods

Meteor.methods
  # POST request using javascript
  # @param  {string} path   path of submission
  # @param  {string} params parameters to submit
  # @param  {string} method method of submission ("post" is default)
  # @return {undefined}
  postToUrl: (path, params, method) ->
    method = method or "post"
    form = $("<form></form>")
    form.attr
      "method" : method,
      "action" : path
    for key of params
      if params.hasOwnProperty(key)
        $hiddenField = $ "input"
        $hiddenField.attr
          "type" : "hidden",
          "name" : key,
          "value" : params[key]
        form.append $hiddenField

    $('body').append form
    form.submit()

# thickness can be a number (e.g. "2") or a string (e.g. "2px")
@formatThickness = (thickness) ->
  thickness ?= "1" # default value
  if !thickness.toString().match(/.*px$/)
    "#" + thickness + "px" # leading "#" - to be compatible with Firefox
  thickness

# applies zooming to the stroke thickness
@zoomStroke = (thickness) ->
  currentSlide = BBB.getCurrentSlide("zoomStroke")
  ratio = (currentSlide?.slide.width_ratio + currentSlide?.slide.height_ratio) / 2
  thickness * 100 / ratio
