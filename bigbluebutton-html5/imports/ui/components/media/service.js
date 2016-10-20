import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';

let getPresentationInfo = () => {
  let currentPresentation;
  currentPresentation = Presentations.findOne({
      'presentation.current': true,
    });

  return {
    current_presentation: (currentPresentation != null ? true : false),

  };
};

export default {
  getPresentationInfo,
};
