import Shapes from '/imports/api/shapes';
import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';

let getWhiteboardData = () => {
  let currentPresentation, currentSlide, presentationId, shapes, ref;
  currentPresentation = Presentations.findOne({
      'presentation.current': true,
    });
  presentationId = currentPresentation != null ? (ref = currentPresentation.presentation) != null ? ref.id : void 0 : void 0;
  currentSlide = Slides.findOne({
    presentationId: presentationId,
    'slide.current': true,
  });
  if (currentSlide != null) {
    shapes = Shapes.find({
        whiteboardId: currentSlide.slide.id,
      }).fetch();
  }

  return {
    current_slide: currentSlide,
    shapes: shapes,
  };
};

export default {
  getWhiteboardData,
};
