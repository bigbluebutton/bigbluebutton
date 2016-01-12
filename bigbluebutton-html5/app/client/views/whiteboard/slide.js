Template.slide.rendered = function() {
  return reactOnSlideChange(this);
};

this.reactOnSlideChange = (_this => {
  return function() {
    let currentSlide, pic, ref;
    currentSlide = BBB.getCurrentSlide("slide.rendered");
    pic = new Image();
    pic.onload = function() {
      let ref;
      setInSession('slideOriginalWidth', this.width);
      setInSession('slideOriginalHeight', this.height);
      $(window).resize(() => {
        if(!$('.panel-footer').hasClass('ui-resizable-resizing')) {
          return scaleWhiteboard();
        }
      });
      if((currentSlide != null ? (ref = currentSlide.slide) != null ? ref.img_uri : void 0 : void 0) != null) {
        return createWhiteboardPaper(wpm => {
          return displaySlide(wpm);
        });
      }
    };
    pic.src = currentSlide != null ? (ref = currentSlide.slide) != null ? ref.img_uri : void 0 : void 0;
    return "";
  };
})(this);

this.createWhiteboardPaper = (_this => {
  return function(callback) {
    _this.whiteboardPaperModel = new Meteor.WhiteboardPaperModel('whiteboard-paper');
    return callback(_this.whiteboardPaperModel);
  };
})(this);

this.displaySlide = function(wpm) {
  let adjustedDimensions, currentSlide, ref;
  currentSlide = BBB.getCurrentSlide("displaySlide");
  wpm.create();
  adjustedDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'));
  wpm._displayPage(
    currentSlide != null ? (ref = currentSlide.slide) != null ? ref.img_uri : void 0 : void 0,
    getInSession('slideOriginalWidth'),
    getInSession('slideOriginalHeight')
  );
  manuallyDisplayShapes();
  return wpm.scale(adjustedDimensions.width, adjustedDimensions.height);
};

this.manuallyDisplayShapes = function() {
  let currentSlide, i, j, len, len1, num, ref, ref1, ref2, results, s, shapeInfo, shapeType, shapes, wpm;
  if(Meteor.WhiteboardCleanStatus.findOne({
    in_progress: true
  }) != null) {
    return;
  }
  currentSlide = BBB.getCurrentSlide("manuallyDisplayShapes");
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
      for(num = j = 0, ref2 = len; 0 <= ref2 ? j <= ref2 : j >= ref2; num = 0 <= ref2 ? ++j : --j) {
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
};

this.scaleSlide = function(originalWidth, originalHeight) {
  let adjustedHeight, adjustedWidth, boardHeight, boardWidth;
  if(window.matchMedia('(orientation: landscape)').matches) {
    boardWidth = $("#whiteboard-container").width();
    boardHeight = $("#whiteboard-container").height();
  } else {
    boardWidth = $("#whiteboard-container").width();
    boardHeight = 1.4 * $("#whiteboard-container").width();
  }
  adjustedWidth = null;
  adjustedHeight = null;
  if(originalWidth <= originalHeight) {
    adjustedWidth = boardHeight * originalWidth / originalHeight;
    if (boardWidth < adjustedWidth) {
      adjustedHeight = boardHeight * boardWidth / adjustedWidth;
      adjustedWidth = boardWidth;
    } else {
      adjustedHeight = boardHeight;
    }
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

Template.slide.helpers({
  updatePointerLocation(pointer) {
    return typeof whiteboardPaperModel !== "undefined" && whiteboardPaperModel !== null ? whiteboardPaperModel.moveCursor(pointer.x, pointer.y) : void 0;
  }
});

Template.shape.rendered = function() {
  let i, len, num, ref, ref1, shapeInfo, shapeType, wpm;
  shapeInfo = ((ref = this.data.shape) != null ? ref.shape : void 0) || this.data.shape;
  shapeType = shapeInfo != null ? shapeInfo.type : void 0;
  if(shapeType !== "text") {
    len = shapeInfo.points.length;
    for (num = i = 0, ref1 = len; 0 <= ref1 ? i <= ref1 : i >= ref1; num = 0 <= ref1 ? ++i : --i) {
      shapeInfo.points[num] = shapeInfo.points[num] / 100;
    }
  }
  if(typeof whiteboardPaperModel !== "undefined" && whiteboardPaperModel !== null) {
    wpm = whiteboardPaperModel;
    if(wpm != null) {
      wpm.makeShape(shapeType, shapeInfo);
    }
    return wpm != null ? wpm.updateShape(shapeType, shapeInfo) : void 0;
  }
};

Template.shape.destroyed = function() {
  let wpm;
  if(typeof whiteboardPaperModel !== "undefined" && whiteboardPaperModel !== null) {
    wpm = whiteboardPaperModel;
    wpm.clearShapes();
    return manuallyDisplayShapes();
  }
};
