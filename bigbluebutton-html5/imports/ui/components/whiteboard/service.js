import Presentations from '/imports/api/presentations';
import Shapes from '/imports/api/shapes';
import Slides from '/imports/api/slides';
import Cursor from '/imports/api/cursor';

let getWhiteboardData = () => {
  let currentSlide;
  let shapes;
  let cursor;
  let currentPresentation = Presentations.findOne({
      'presentation.current': true,
    });

  if (currentPresentation != null) {
    currentSlide = Slides.findOne({
      presentationId: currentPresentation.presentation.id,
      'slide.current': true,
    });
  }

  if (currentSlide != null) {
    shapes = Shapes.find({
        whiteboardId: currentSlide.slide.id,
      }).fetch();

    cursor = Cursor.find({
      meetingId: currentSlide.meetingId,
    }).fetch();
  }

  return {
    currentSlide: currentSlide,
    shapes: shapes,
    cursor: cursor,
  };
};

export default {
  getWhiteboardData,
};
