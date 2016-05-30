import Slides from '/imports/api/slides';
import Presentations from '/imports/api/presentations';

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
