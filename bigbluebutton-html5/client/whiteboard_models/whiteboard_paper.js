// "Paper" which is the Raphael term for the entire SVG object on the webpage.
// This class deals with this SVG component only.
Meteor.WhiteboardPaperModel = (function () {
  class WhiteboardPaperModel {

    // Container must be a DOM element
    constructor(container) {
      this.container = container;

      // a WhiteboardCursorModel
      this.cursor = null;

      // all slides in the presentation indexed by url
      this.slides = {};
      this.panX = null;
      this.panY = null;
      this.current = {};

      // the slide being shown
      this.current.slide = null;

      // a raphaeljs set with all the shapes in the current slide
      this.current.shapes = null;

      // a list of shapes as passed to this client when it receives `all_slides`
      // (se we are able to redraw the shapes whenever needed)
      this.current.shapeDefinitions = [];
      this.zoomLevel = 1;
      this.shiftPressed = false;
      this.currentPathCount = 0;
      this._updateContainerDimensions();
      this.zoomObserver = null;
      this.adjustedWidth = 0;
      this.adjustedHeight = 0;
      this.widthRatio = 100;
      this.heightRatio = 100;
    }

    // Initializes the paper in the page.
    // Can't do these things in initialize() because by then some elements
    // are not yet created in the page.
    create() {
      // paper is embedded within the div#slide of the page.
      // @raphaelObj ?= ScaleRaphael(@container, "900", "500")

      let h, w;
      h = $(`#${this.container}`).height();
      w = $(`#${this.container}`).width();
      if (this.raphaelObj == null) {
        this.raphaelObj = ScaleRaphael(this.container, w, h);
      }

      if (this.raphaelObj == null) {
        this.raphaelObj = ScaleRaphael(this.container, $container.innerHeight(), $container.innerWidth());
      }

      this.raphaelObj.canvas.setAttribute('preserveAspectRatio', 'xMinYMin slice');
      this.createCursor();
      if (this.slides) {
        this.rebuild();
      } else {
        this.slides = {}; // if previously loaded
      }

      if (navigator.userAgent.indexOf('Firefox') !== -1) {
        this.raphaelObj.renderfix();
      }

      return this.raphaelObj;
    }

    // Re-add the images to the paper that are found
    // in the slides array (an object of urls and dimensions).
    rebuild() {
      let results, url;
      this.current.slide = null;
      results = [];
      for (url in this.slides) {
        if (this.slides.hasOwnProperty(url)) {
          results.push(
            this.addImageToPaper(url, this.slides[url].getWidth(), this.slides[url].getHeight())
          );
        } else {
          results.push(void 0);
        }
      }

      return results;
    }

    scale(width, height) {
      let ref;
      return (ref = this.raphaelObj) != null ? ref.changeSize(width, height) : void 0;
    }

    // Add an image to the paper.
    // @param {string} url the URL of the image to add to the paper
    // @param {number} width   the width of the image (in pixels)
    // @param {number} height   the height of the image (in pixels)
    // @return {Raphael.image} the image object added to the whiteboard
    addImageToPaper(url, width, height) {
      let cx, cy, img, max, sh, sw;
      this._updateContainerDimensions();

      // solve for the ratio of what length is going to fit more than the other
      max = Math.max(width / this.containerWidth, height / this.containerHeight);

      // fit it all in appropriately
      url = this._slideUrl(url);
      sw = width / max;
      sh = height / max;

      //cx = (@containerWidth / 2) - (width / 2)
      //cy = (@containerHeight / 2) - (height / 2)
      img = this.raphaelObj.image(url, cx = 0, cy = 0, width, height);

      // sw slide width as percentage of original width of paper
      // sh slide height as a percentage of original height of paper
      // x-offset from top left corner as percentage of original width of paper
      // y-offset from top left corner as percentage of original height of paper
      this.slides[url] = new WhiteboardSlideModel(img.id, url, img, width, height, sw, sh, cx, cy);
      if (this.current.slide == null) {
        img.toBack();
        this.current.slide = this.slides[url];
      } else if (this.current.slide.url === url) {
        img.toBack();
      } else {
        img.hide();
      }

      // TODO: other places might also required an update in these dimensions
      this._updateContainerDimensions();

      this._updateZoomRatios();
      if (this.raphaelObj.w === 100) { // on first load: Raphael object is initially tiny
        this.cursor.setRadius(0.65 * this.widthRatio / 100);
      } else {
        this.cursor.setRadius(6 * this.widthRatio / 100);
      }

      return img;
    }

    // Removes all the images from the Raphael paper.
    removeAllImagesFromPaper() {
      let ref, ref1, url;
      for (url in this.slides) {
        if (this.slides.hasOwnProperty(url)) {
          if ((ref = this.raphaelObj.getById((ref1 = this.slides[url]) != null ? ref1.getId() : void 0)) != null) {
            ref.remove();
          }

          //@trigger('paper:image:removed', @slides[url].getId()) # Removes the previous image preventing images from being redrawn over each other repeatedly
        }
      }

      this.slides = {};
      return this.current.slide = null;
    }

    // Switches the tool and thus the functions that get
    // called when certain events are fired from Raphael.
    // @param  {string} tool the tool to turn on
    // @return {undefined}
    setCurrentTool(tool) {
      this.currentTool = tool;
      console.log('setting current tool to', tool);
      switch (tool) {
        case 'line':
          this.cursor.undrag();
          this.current.line = this._createTool(tool);
          return this.cursor.drag(this.current.line.dragOnMove, this.current.line.dragOnStart, this.current.line.dragOnEnd);
        case 'rectangle':
          this.cursor.undrag();
          this.current.rectangle = this._createTool(tool);
          return this.cursor.drag(this.current.rectangle.dragOnMove, this.current.rectangle.dragOnStart, this.current.rectangle.dragOnEnd);
        default:
          return console.log('ERROR: Cannot set invalid tool:', tool);
      }
    }

    // Clear all shapes from this paper.
    clearShapes() {
      if (this.current.shapes != null) {
        this.current.shapes.forEach(element => {
          return element.remove();
        });
        this.current.shapeDefinitions = [];
        this.current.shapes.clear();
      }

      this.clearCursor();
      return this.createCursor();
    }

    clearCursor() {
      let ref;
      return (ref = this.cursor) != null ? ref.remove() : void 0;
    }

    createCursor() {
      if (this.raphaelObj.w === 100) { // on first load: Raphael object is initially tiny
        this.cursor = new WhiteboardCursorModel(this.raphaelObj, 0.65);
        this.cursor.setRadius(0.65 * this.widthRatio / 100);
      } else {
        this.cursor = new WhiteboardCursorModel(this.raphaelObj);
        this.cursor.setRadius(6 * this.widthRatio / 100);
      }

      return this.cursor.draw();
    }

    // Updated a shape `shape` with the data in `data`.
    // TODO: check if the objects exist before calling update, if they don't they should be created
    updateShape(shape, data) {
      return this.current[shape].update(data);
    }

    // Make a shape `shape` with the data in `data`.
    makeShape(shape, data) {
      let base, base1, i, len, obj, tool, toolModel;
      data.thickness *= this.adjustedWidth / 1000;
      tool = null;
      this.current[shape] = this._createTool(shape);
      toolModel = this.current[shape];
      tool = this.current[shape].make(data);
      if ((tool != null) && shape !== 'poll_result') {
        if ((base = this.current).shapes == null) {
          base.shapes = this.raphaelObj.set();
        }

        this.current.shapes.push(tool);
        this.current.shapeDefinitions.push(toolModel.getDefinition());
      }

      //We have a separate case for Poll as it returns an array instead of just one object
      if ((tool != null) && shape === 'poll_result') {
        if ((base1 = this.current).shapes == null) {
          base1.shapes = this.raphaelObj.set();
        }

        for (i = 0, len = tool.length; i < len; i++) {
          obj = tool[i];
          this.current.shapes.push(obj);
        }

        return this.current.shapeDefinitions.push(toolModel.getDefinition());
      }
    }

    // Update the cursor position on screen
    // @param  {number} x the x value of the cursor as a percentage of the width
    // @param  {number} y the y value of the cursor as a percentage of the height
    moveCursor(x, y) {
      let cx, cy, ref, ref1, slideHeight, slideWidth;
      ref = this._currentSlideOffsets(), cx = ref[0], cy = ref[1];
      ref1 = this._currentSlideOriginalDimensions(), slideWidth = ref1[0], slideHeight = ref1[1];
      this.cursor.setPosition(x * slideWidth + cx, y * slideHeight + cy);

      //if the slide is zoomed in then move the cursor based on where the viewBox is looking
      if ((this.viewBoxXpos != null) && (this.viewBoxYPos != null) && (this.viewBoxWidth != null) && (this.viewBoxHeight != null)) {
        return this.cursor.setPosition(this.viewBoxXpos + x * this.viewBoxWidth, this.viewBoxYPos + y * this.viewBoxHeight);
      }
    }

    zoomAndPan(widthRatio, heightRatio, xOffset, yOffset) {
      // console.log "zoomAndPan #{widthRatio} #{heightRatio} #{xOffset} #{yOffset}"
      let newHeight, newWidth, newX, newY;
      newX = -xOffset * 2 * this.adjustedWidth / 100;
      newY = -yOffset * 2 * this.adjustedHeight / 100;
      newWidth = this.adjustedWidth * widthRatio / 100;
      newHeight = this.adjustedHeight * heightRatio / 100;
      return this.raphaelObj.setViewBox(newX, newY, newWidth, newHeight);
    }

    setAdjustedDimensions(width, height) {
      this.adjustedWidth = width;
      return this.adjustedHeight = height;
    }

    // Update the dimensions of the container.
    _updateContainerDimensions() {
      let $container, containerDimensions, ref, ref1;
      $container = $('#whiteboard-paper');
      containerDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'));
      if ($container.innerWidth() === 0) {
        this.containerWidth = containerDimensions.boardWidth;
      } else {
        this.containerWidth = $container.innerWidth();
      }

      if ($container.innerHeight() === 0) {
        this.containerHeight = containerDimensions.boardHeight;
      } else {
        this.containerHeight = $container.innerHeight();
      }

      this.containerOffsetLeft = (ref = $container.offset()) != null ? ref.left : void 0;
      return this.containerOffsetTop = (ref1 = $container.offset()) != null ? ref1.top : void 0;
    }

    _updateZoomRatios() {
      let currentSlideDoc;
      currentSlideDoc = BBB.getCurrentSlide();
      this.widthRatio = (currentSlideDoc != null ? currentSlideDoc.slide.width_ratio : void 0) || 100;
      return this.heightRatio = currentSlideDoc != null ? currentSlideDoc.slide.height_ratio : void 0;
    }

    // Retrieves an image element from the paper.
    // The url must be in the slides array.
    // @param  {string} url        the url of the image (must be in slides array)
    // @return {Raphael.image}     return the image or null if not found
    _getImageFromPaper(url) {
      let id;
      if (this.slides[url]) {
        id = this.slides[url].getId();
        if (id != null) {
          return this.raphaelObj.getById(id);
        }
      }

      return null;
    }

    _currentSlideDimensions() {
      if (this.current.slide != null) {
        return this.current.slide.getDimensions();
      } else {
        return [0, 0];
      }
    }

    _currentSlideOriginalDimensions() {
      if (this.current.slide != null) {
        return this.current.slide.getOriginalDimensions();
      } else {
        return [0, 0];
      }
    }

    _currentSlideOffsets() {
      if (this.current.slide != null) {
        return this.current.slide.getOffsets();
      } else {
        return [0, 0];
      }
    }

    // Wrapper method to create a tool for the whiteboard
    _createTool(type) {
      let height, model, ref, ref1, ref2, slideHeight, slideWidth, tool, width, xOffset, yOffset;
      switch (type) {
        case 'pencil':
          model = WhiteboardLineModel;
          break;
        case 'path':
        case 'line':
          model = WhiteboardLineModel;
          break;
        case 'rectangle':
          model = WhiteboardRectModel;
          break;
        case 'ellipse':
          model = WhiteboardEllipseModel;
          break;
        case 'triangle':
          model = WhiteboardTriangleModel;
          break;
        case 'text':
          model = WhiteboardTextModel;
          break;
        case 'poll_result':
          model = WhiteboardPollModel;
      }
      if (model != null) {
        ref = this._currentSlideOriginalDimensions(), slideWidth = ref[0], slideHeight = ref[1];
        ref1 = this._currentSlideOffsets(), xOffset = ref1[0], yOffset = ref1[1];
        ref2 = this._currentSlideDimensions(), width = ref2[0], height = ref2[1];
        tool = new model(this.raphaelObj);

        // TODO: why are the parameters inverted and it works?
        tool.setPaperSize(slideHeight, slideWidth);
        tool.setOffsets(xOffset, yOffset);
        tool.setPaperDimensions(width, height);
        return tool;
      } else {
        return null;
      }
    }

    // Adds the base url (the protocol+server part) to `url` if needed.
    _slideUrl(url) {
      if (url != null ? url.match(/http[s]?:/) : void 0) {
        return url;
      } else {
        return console.log(`The url '${url}' did not match the expected format of: http/s`);

        //globals.presentationServer + url
      }
    }

    //Changes the currently displayed page/slide (if any) with this one
    //@param {data} message object containing the "presentation" object
    _displayPage(data, originalWidth, originalHeight) {
      let _this, boardHeight, boardWidth, currentPresentation, currentSlide, currentSlideCursor, presentationId, ref;
      this.removeAllImagesFromPaper();
      this._updateContainerDimensions();
      boardWidth = this.containerWidth;
      boardHeight = this.containerHeight;
      currentSlide = BBB.getCurrentSlide();
      currentPresentation = Meteor.Presentations.findOne({
        'presentation.current': true,
      });
      presentationId = currentPresentation != null ? (ref = currentPresentation.presentation) != null ? ref.id : void 0 : void 0;
      currentSlideCursor = Meteor.Slides.find({
        presentationId: presentationId,
        'slide.current': true,
      });
      if (this.zoomObserver !== null) {
        this.zoomObserver.stop();
      }

      _this = this;
      this.zoomObserver = currentSlideCursor.observe({ // watching the current slide changes
        changed(newDoc, oldDoc) {
          let newRatio, oldRatio, ref1, ref2;
          if (originalWidth <= originalHeight) {
            this.adjustedWidth = boardHeight * originalWidth / originalHeight;
            this.adjustedHeight = boardHeight;
          } else {
            this.adjustedHeight = boardWidth * originalHeight / originalWidth;
            this.adjustedWidth = boardWidth;
          }

          _this.zoomAndPan(
            newDoc.slide.width_ratio,
            newDoc.slide.height_ratio,
            newDoc.slide.x_offset,
            newDoc.slide.y_offset
          );
          oldRatio = (oldDoc.slide.width_ratio + oldDoc.slide.height_ratio) / 2;
          newRatio = (newDoc.slide.width_ratio + newDoc.slide.height_ratio) / 2;
          if (_this != null) {
            if ((ref1 = _this.current) != null) {
              if ((ref2 = ref1.shapes) != null) {
                ref2.forEach(shape => {
                  return shape.attr('stroke-width', shape.attr('stroke-width') * oldRatio / newRatio);
                });
              }
            }
          }

          if (_this.raphaelObj === 100) { // on first load: Raphael object is initially tiny
            return _this.cursor.setRadius(0.65 * newDoc.slide.width_ratio / 100);
          } else {
            return _this.cursor.setRadius(6 * newDoc.slide.width_ratio / 100);
          }
        },
      });
      if (originalWidth <= originalHeight) {
        // square => boardHeight is the shortest side
        this.adjustedWidth = boardHeight * originalWidth / originalHeight;
        $('#whiteboard-paper').width(this.adjustedWidth);
        this.addImageToPaper(data, this.adjustedWidth, boardHeight);
        this.adjustedHeight = boardHeight;
      } else {
        this.adjustedHeight = boardWidth * originalHeight / originalWidth;
        $('#whiteboard-paper').height(this.adjustedHeight);
        this.addImageToPaper(data, boardWidth, this.adjustedHeight);
        this.adjustedWidth = boardWidth;
      }

      if (currentSlide != null) {
        return this.zoomAndPan(currentSlide.slide.width_ratio, currentSlide.slide.height_ratio, currentSlide.slide.x_offset, currentSlide.slide.y_offset);
      }
    }
  }

  return WhiteboardPaperModel;
})();
