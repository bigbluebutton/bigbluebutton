import Slides from '/imports/api/slides';
import Presentations from '/imports/api/presentations';

let getPresentationInfo = () => {
  let currentPresentation, currentSlide;
  currentPresentation = Presentations.findOne({
      'presentation.current': true,
    });
  if(currentPresentation != null) {
    currentSlide = Slides.findOne({
      presentationId: currentPresentation.presentation.id,
      'slide.current': true,
    });
  }

  return {
    current_slide: (currentSlide != null ? true : false),

  };
};

export default {
  getPresentationInfo,
};
