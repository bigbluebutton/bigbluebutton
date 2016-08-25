import Slides from '/imports/api/slides';

export function displayThisSlide(meetingId, newSlideId, slideObject) {

  // grab the presentationId part of the slideId
  const presentationId = newSlideId.split('/')[0];

  let currentSlide = Slides.findOne({
    presentationId: presentationId,
    'slide.current': true,
  });

  let newSlide = Slides.findOne({
    presentationId: presentationId,
    'slide.id': newSlideId,
  });

  // first update the new slide as current and update its ratios/offsets
  if (newSlide != undefined) {
    Slides.update(newSlide._id, {
      $set: {
        'slide.current': true,
        'slide.height_ratio': slideObject.height_ratio,
        'slide.width_ratio': slideObject.width_ratio,
        'slide.x_offset': slideObject.x_offset,
        'slide.y_offset': slideObject.y_offset,
      },
    });
  }

  // change current to false for the old slide after update the new one
  if (currentSlide != undefined) {
    Slides.update(currentSlide._id, {
      $set: {
        'slide.current': false,
      },
    });
  }
};
