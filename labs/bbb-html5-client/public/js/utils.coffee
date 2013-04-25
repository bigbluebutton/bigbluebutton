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

  Utils
