define [
  'underscore',
  'backbone',
  'raphael'
], (_, Backbone, Raphael) ->

  # TODO: temporary solution
  PRESENTATION_SERVER = window.location.protocol + "//" + window.location.host
  PRESENTATION_SERVER = PRESENTATION_SERVER.replace(/:\d+/, "/") # remove :port

  # "Paper" which is the Raphael term for the entire SVG object on the webpage.
  # This class deals with this SVG component only.
  WhiteboardPaperModel = Backbone.Model.extend

    # Container must be a DOM element
    initialize: (@container, @paperWidth, @paperHeight) ->
      @gw = null
      @gh = null
      @cur = null
      @slides = null
      @currentUrl = null
      @dcr = 3
      @fitToPage = true

    # Initializes the paper in the page.
    create: ->
      # paper is embedded within the div#slide of the page.
      @raphaelObj ?= Raphael(@container, @gw, @gh)
      @raphaelObj.canvas.setAttribute "preserveAspectRatio", "xMinYMin slice"
      @cur = @raphaelObj.circle(0, 0, @dcr)
      @cur.attr "fill", "red"
      # TODO $(@cur.node).bind "mousewheel", zoomSlide
      if @slides
        @rebuild()
      else
        @slides = {} # if previously loaded
      unless navigator.userAgent.indexOf("Firefox") is -1
        @raphaelObj.renderfix()

    # Re-add the images to the paper that are found
    # in the slides array (an object of urls and dimensions).
    rebuild: ->
      @currentUrl = null
      for url of @slides
        if @slides.hasOwnProperty(url)
          @addImageToPaper url, @slides[url].w, @slides[url].h

    # Add an image to the paper.
    # @param {string} url the URL of the image to add to the paper
    # @param {number} width   the width of the image (in pixels)
    # @param {number} height   the height of the image (in pixels)
    # @return {Raphael.image} the image object added to the whiteboard
    addImageToPaper: (url, width, height) ->
      console.log "adding image to paper", url, width, height
      if @fitToPage
        # solve for the ratio of what length is going to fit more than the other
        max = Math.max(width / @paperWidth, height / @paperHeight)
        # fit it all in appropriately
        # TODO: temporary solution
        url = PRESENTATION_SERVER + url
        img = @raphaelObj.image(url, cx = 0, cy = 0, gw = width, gh = height)

        # update the global variables we will need to use
        sw = width / max #?
        sh = height / max #?
        # sw_orig = sw
        # sh_orig = sh
      else
        # fit to width
        # assume it will fit width ways
        wr = width / @paperWidth
        img = @raphaelObj.image(url, cx = 0, cy = 0, width / wr, height / wr)
        sw = width / wr #?
        sh = height / wr #?
        # sw_orig = sw
        # sh_orig = sh
        # gw = sw
        # gh = sh
      @slides[url] =
        id: img.id
        w: width
        h: height

      unless @currentUrl
        img.toBack()
        @currentUrl = url
      else if @currentUrl is url
        img.toBack()
      else
        img.hide()
      # TODO img.mousemove onCursorMove
      # TODO $(img.node).bind "mousewheel", zoomSlide
      @trigger('paper:image:added', img)
      img

    # Removes all the images from the Raphael paper.
    removeAllImagesFromPaper: ->
      for url of @slides
        if @slides.hasOwnProperty(url)
          @raphaelObj.getById(@slides[url].id).remove()
          @trigger('paper:image:removed', @slides[url].id)
      @slides = {}
      @currentUrl = null

    # zoomSlide: ->
    #   ???
    # onCursorMove: ->
      # ??


  WhiteboardPaperModel
