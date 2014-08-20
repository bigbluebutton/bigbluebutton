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

  # @param {string,int} stroke    stroke color, can be a number (a hex converted to int) or a
  #                               string (e.g. "#ffff00")
  # @param {string,ing} thickness thickness as a number or string (e.g. "2" or "2px")
  strokeAndThickness: (stroke, thickness) ->
    stroke ?= "0"
    thickness ?= "1"
    r =
      stroke: if stroke.toString().match(/\#.*/) then stroke else  colourToHex(stroke)
      "stroke-width": if thickness.toString().match(/.*px$/) then thickness else "#{thickness}px"
    r

  # Convert a color `value` as integer to a hex color (e.g. 255 to #0000ff)
  colourToHex = (value) ->
    hex = value.toString(16)
    hex = "0" + hex while hex.length < 6
    "##{hex}"
