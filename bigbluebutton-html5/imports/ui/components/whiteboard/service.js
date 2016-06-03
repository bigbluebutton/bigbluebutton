import Presentations from '/imports/api/presentations';
import Shapes from '/imports/api/shapes';
import Slides from '/imports/api/slides';

let getWhiteboardData = () => {
  let currentPresentation;
  let currentSlide;
  let presentationId;
  let shapes;
  let ref;
  currentPresentation = Presentations.findOne({
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
  }

  return {
    current_slide: currentSlide,
    shapes: shapes,
  };
};

export default {
  getWhiteboardData,
};
