define [
  'underscore',
  'backbone'
], (_, Backbone) ->

  # Module with general utility methods.
  Utils = {}

  # POST request using javascript
  # @param  {string} path   path of submission
  # @param  {string} params parameters to submit
  # @param  {string} method method of submission ("post" is default)
  # @return {undefined}
  Utils.postToUrl = (path, params, method) ->
    method = method or "post"
    # TODO: can be a lot cleaner with jQuery
    form = document.createElement("form")
    form.setAttribute "method", method
    form.setAttribute "action", path
    for key of params
      if params.hasOwnProperty(key)
        hiddenField = document.createElement("input")
        hiddenField.setAttribute "type", "hidden"
        hiddenField.setAttribute "name", key
        hiddenField.setAttribute "value", params[key]
        form.appendChild hiddenField
    document.body.appendChild form
    form.submit()

  # Scales a path string to fit within a width and height of the new paper size
  # @param  {number} w width of the shape as a percentage of the original width
  # @param  {number} h height of the shape as a percentage of the original height
  # @return {string}   the path string after being manipulated to new paper size
  Utils.stringToScaledPath = (string, w, h, xOffset=0, yOffset=0) ->
    path = null
    points = string.match(/(\d+[.]?\d*)/g)
    len = points.length
    j = 0

    # go through each point and multiply it by the new height and width
    while j < len
      if j isnt 0
        path += "L" + (points[j] * w + xOffset) + "," + (points[j + 1] * h + yOffset)
      else
        path = "M" + (points[j] * w + xOffset) + "," + (points[j + 1] * h + yOffset)
      j += 2
    path

  # @param {string,int} stroke    stroke color, can be a number (a hex converted to int) or a
  #                               string (e.g. "#ffff00")
  # @param {string,ing} thickness thickness as a number or string (e.g. "2" or "2px")
  Utils.strokeAndThickness = (stroke, thickness) ->
    stroke = "0" unless stroke?
    thickness = "1" unless thickness? and thickness
    r =
      stroke: if stroke.toString().match(/\#.*/) then stroke else  Utils.colourToHex(stroke)
      "stroke-width": if thickness.toString().match(/.*px$/) then thickness else "#{thickness}px"
    r

  # Convert a color `value` as integer to a hex color (e.g. 255 to #0000ff)
  Utils.colourToHex = (value) ->
    hex = value.toString(16)
    hex = "0" + hex while hex.length < 6
    "##{hex}"

  Utils
