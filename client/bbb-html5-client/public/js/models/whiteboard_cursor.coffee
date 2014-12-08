define [
  'jquery',
  'underscore',
  'backbone',
  'globals'
], ($, _, Backbone, globals) ->

  # The cursor/pointer in the whiteboard
  WhiteboardCursorModel = Backbone.Model.extend

    initialize: (@paper, radius=null, color=null) ->
      @radius = radius or 3
      @color = color or "#ff6666" # a pinkish red
      @cursor = null

    draw: () ->
      @cursor = @paper.circle(0, 0, @radius)
      @cursor.attr
        "fill": @color
        "stroke": @color
        "opacity": "0.8"
      $(@cursor.node).on "mousewheel", _.bind(@_onMouseWheel, @)

    toFront: () ->
      @cursor.toFront() if @cursor?

    setRadius: (value) ->
      if @cursor?
        @cursor.attr r: value

    setPosition: (x, y) ->
      if @cursor?
        @cursor.attr
          cx: x
          cy: y

    undrag: () ->
      @cursor.undrag() if @cursor?

    drag: (onMove, onStart, onEnd, target=null) ->
      if @cursor?
        target or= @
        @cursor.drag _.bind(onMove, target), _.bind(onStart, target), _.bind(onEnd, target)

    _onMouseWheel: (e, delta) ->
      @trigger("cursor:mousewheel", e, delta)

  WhiteboardCursorModel
