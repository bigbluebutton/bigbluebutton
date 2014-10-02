# A base class for whiteboard tools
class @WhiteboardToolModel

  initialize: (@paper) ->
    console.log "paper:" + @paper
    @gh = 0
    @gw = 0
    @obj = 0
    # the defintion of this shape, kept so we can redraw the shape whenever needed
    @definition = []

  #set the size of the paper
  # @param  {number} @gh    gh parameter
  # @param  {number} @gw    gw parameter
  setPaperSize: (@gh, @gw) ->

  setOffsets: (@xOffset, @yOffset) ->

  setPaperDimensions: (@paperWidth, @paperHeight) ->
    # TODO: can't we simply take the width and the height from `@paper`?

  getDefinition: () ->
    @definition

  hide: () ->
    @obj.hide() if @obj?
