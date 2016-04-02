this.scaleSlide = function(originalWidth, originalHeight) {
  let adjustedHeight, adjustedWidth, boardHeight, boardWidth;

  // set the size of the whiteboard space (frame) where the slide will be displayed
  if(window.matchMedia('(orientation: landscape)').matches) {
    // for landscape orientation we want "fit to height" so that we can
    // minimize the empty space above and below the slide (for best readability)
    boardWidth = $("#whiteboard-container").width();
    boardHeight = $("#whiteboard-container").height();
  } else {
    // for portrait orientation we want "fit to width" so that we can
    // minimize the empty space on the sides of the slide (for best readability)
    boardWidth = $("#whiteboard-container").width();
    boardHeight = 1.4 * $("#whiteboard-container").width();
  }

  // this is the best fitting pair
  adjustedWidth = null;
  adjustedHeight = null;

  // the slide image is in portrait orientation
  if(originalWidth <= originalHeight) {
    adjustedWidth = boardHeight * originalWidth / originalHeight;
    if (boardWidth < adjustedWidth) {
      adjustedHeight = boardHeight * boardWidth / adjustedWidth;
      adjustedWidth = boardWidth;
    } else {
      adjustedHeight = boardHeight;
    }

  // ths slide image is in landscape orientation
  } else {
    adjustedHeight = boardWidth * originalHeight / originalWidth;
    if (boardHeight < adjustedHeight) {
      adjustedWidth = boardWidth * boardHeight / adjustedHeight;
      adjustedHeight = boardHeight;
    } else {
      adjustedWidth = boardWidth;
    }
  }
  return {
    width: adjustedWidth,
    height: adjustedHeight,
    boardWidth: boardWidth,
    boardHeight: boardHeight
  };
};

Slide = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    let currentSlide, shapes, pointer;
    currentSlide = BBB.getCurrentSlide();

    if(currentSlide != null) {
      shapes = Meteor.Shapes.find({
        whiteboardId: currentSlide.slide.id
      }).fetch();

      pointer = Meteor.Cursor.findOne();
      pointer.x = (-currentSlide.slide.x_offset * 2 + currentSlide.slide.width_ratio * pointer.x) / 100;
      pointer.y = (-currentSlide.slide.y_offset * 2 + currentSlide.slide.height_ratio * pointer.y) / 100;
    }

    return {
      current_slide: currentSlide,
      shapes: shapes,
      pointer: pointer
    };
  },

  componentDidMount: function() {
    console.log('componentDidMount');
    this.reactOnSlideChange();
  },

  shouldComponentUpdate: function() {
    console.log('shouldComponentUpdate');
  },

  componentWillUpdate: function() {
    if(typeof this.whiteboardPaperModel !== "undefined" && this.whiteboardPaperModel !== null) {
      wpm = this.whiteboardPaperModel;
      wpm.clearShapes();
      //this.manuallyDisplayShapes();
    }
    console.log('componentWillUpdate');
  },

  componentDidUpdate: function() {
    console.log('componentDidUpdate');
    if(this.data.shapes){
      this.data.shapes.map((shape) =>
      this.renderShape(shape));
    }
    this.reactOnSlideChange();
  },

  componentWillUnmount: function() {
    console.log('componentWillUnmount');
  },

  createWhiteboardPaper: function(callback) {
    this.whiteboardPaperModel = new Meteor.WhiteboardPaperModel('whiteboard-paper');
    return callback(this.whiteboardPaperModel);
  },

  displaySlide: function(wpm) {
    let adjustedDimensions, currentSlide, ref;
    currentSlide = BBB.getCurrentSlide();
    wpm.create();
    adjustedDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'));
    wpm._displayPage(
      currentSlide != null ? (ref = currentSlide.slide) != null ? ref.img_uri : void 0 : void 0,
      getInSession('slideOriginalWidth'),
      getInSession('slideOriginalHeight')
    );
    this.manuallyDisplayShapes();
    return wpm.scale(adjustedDimensions.width, adjustedDimensions.height);
  },

  manuallyDisplayShapes: function() {
    let currentSlide, i, j, len, len1, num, ref, ref1, ref2, results, s, shapeInfo, shapeType, shapes, wpm;
    if(Meteor.WhiteboardCleanStatus.findOne({
      in_progress: true
    }) != null) {
      return;
    }
    currentSlide = BBB.getCurrentSlide();
    wpm = this.whiteboardPaperModel;
    shapes = Meteor.Shapes.find({
      whiteboardId: currentSlide != null ? (ref = currentSlide.slide) != null ? ref.id : void 0 : void 0
    }).fetch();

    results = [];
    for(i = 0, len1 = shapes.length; i < len1; i++) {
      s = shapes[i];
      shapeInfo = ((ref1 = s.shape) != null ? ref1.shape : void 0) || (s != null ? s.shape : void 0);
      shapeType = shapeInfo != null ? shapeInfo.type : void 0;
      if(shapeType !== "text") {
        len = shapeInfo.points.length;
        for(num = j = 0, ref2 = len; 0 <= ref2 ? j <= ref2 : j >= ref2; num = 0 <= ref2 ? ++j : --j) { // the coordinates must be in the range 0 to 1
          if(shapeInfo != null) {
            shapeInfo.points[num] = (shapeInfo != null ? shapeInfo.points[num] : void 0) / 100;
          }
        }
      }
      if(wpm != null) {
        wpm.makeShape(shapeType, shapeInfo);
      }
      results.push(wpm != null ? wpm.updateShape(shapeType, shapeInfo) : void 0);
    }
    return results;
  },

  reactOnSlideChange: function() {
    var _this = this;
    var currentSlide, pic, ref;
    currentSlide = BBB.getCurrentSlide("slide.rendered");
    pic = new Image();
    pic.onload = function() {
      var ref;
      setInSession('slideOriginalWidth', this.width);
      setInSession('slideOriginalHeight', this.height);
      $(window).resize(function() {
        if (!$('.panel-footer').hasClass('ui-resizable-resizing')) {
          return scaleWhiteboard();
        }
      });
      if ((currentSlide != null ? (ref = currentSlide.slide) != null ? ref.img_uri : void 0 : void 0) != null) {
        return _this.createWhiteboardPaper(function(wpm) {
          return _this.displaySlide(wpm);
        });
      }
    };
    pic.src = currentSlide != null ? (ref = currentSlide.slide) != null ? ref.img_uri : void 0 : void 0;
    return "";
  },

  updatePointerLocation(pointer) {
    if(typeof this.whiteboardPaperModel !== "undefined" && this.whiteboardPaperModel !== null) {
      this.whiteboardPaperModel.moveCursor(pointer.x, pointer.y);
    }
  },
  
  renderShape(data) {
    let i, len, num, ref, ref1, shapeInfo, shapeType, wpm;
    // @data is the shape object coming from the {{#each}} in the html file
    shapeInfo = ((ref = data.shape) != null ? ref.shape : void 0) || data.shape;
    shapeType = shapeInfo != null ? shapeInfo.type : void 0;
    if(shapeType !== "text") {
      len = shapeInfo.points.length;
      for (num = i = 0, ref1 = len; 0 <= ref1 ? i <= ref1 : i >= ref1; num = 0 <= ref1 ? ++i : --i) { // the coordinates must be in the range 0 to 1
        shapeInfo.points[num] = shapeInfo.points[num] / 100;
      }
    }
    if(typeof this.whiteboardPaperModel !== "undefined" && this.whiteboardPaperModel !== null) {
      wpm = this.whiteboardPaperModel;
      if(wpm != null) {
        wpm.makeShape(shapeType, shapeInfo);
      }
      return wpm != null ? wpm.updateShape(shapeType, shapeInfo) : void 0;
    }
  },

  render() {
    return (
      <div id="whiteboard-paper">
      </div>
    );
  }
});