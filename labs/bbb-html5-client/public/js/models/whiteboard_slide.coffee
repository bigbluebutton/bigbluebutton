define [
  'jquery',
  'underscore',
  'backbone',
  'globals'
], ($, _, Backbone, globals) ->

  # A slide in the whiteboard
  WhiteboardSlideModel = Backbone.Model.extend

    initialize: (@id, @url, @img, @width, @height, @xOffset=0, @yOffset=0) ->

    getWidth: -> @width

    getHeight: -> @height

    getId: -> @id

    getDimensions: -> [@width, @height]

    getOffsets: -> [@xOffset, @yOffset]

  WhiteboardSlideModel
