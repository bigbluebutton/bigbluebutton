let getCurrentSlide = () => {
  let currentPresentation, currentSlide, presentationId, shapes, ref;
  currentPresentation = Meteor.Presentations.findOne({
      'presentation.current': true,
    });
  presentationId = currentPresentation != null ? (ref = currentPresentation.presentation) != null ? ref.id : void 0 : void 0;
  currentSlide = Meteor.Slides.findOne({
      presentationId: presentationId,
      'slide.current': true,
    });
  if (currentSlide != null) {
    currentSlide.shapes = Meteor.Shapes.find({
        whiteboardId: currentSlide.slide.id,
      }).fetch();
  }

  return currentSlide;
};

export default {
  getCurrentSlide,
};
