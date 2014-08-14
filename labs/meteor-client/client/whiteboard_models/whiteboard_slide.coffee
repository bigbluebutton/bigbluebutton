# A slide in the whiteboard
class @WhiteboardSlideModel

  # TODO: check if we really need original and display width and heights separate or if they can be the same
  constructor: (@id, @url, @img, @originalWidth, @originalHeight, @displayWidth, @displayHeight, @xOffset=0, @yOffset=0) ->

  getWidth: -> @displayWidth

  getHeight: -> @displayHeight

  getOriginalWidth: -> @originalWidth

  getOriginalHeight: -> @originalHeight

  getId: -> @id

  getDimensions: -> [@getWidth(), @getHeight()]

  getOriginalDimensions: -> [@getOriginalWidth(), @getOriginalHeight()]

  getOffsets: -> [@xOffset, @yOffset]
