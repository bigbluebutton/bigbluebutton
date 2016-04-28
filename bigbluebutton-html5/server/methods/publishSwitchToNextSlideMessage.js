import { publish } from '/server/redispubsub';
import { isAllowedTo } from '/server/user_permissions';
import { appendMessageHeader } from '/server/helpers';
import { Presentations, Slides } from '/collections/collections';


Meteor.methods({
  publishSwitchToNextSlideMessage(meetingId, userId, authToken) {
    let currentPresentationDoc, currentSlideDoc, message, nextSlideDoc;
    currentPresentationDoc = Presentations.findOne({
      meetingId: meetingId,
      'presentation.current': true,
    });
    if (currentPresentationDoc != null) {
      currentSlideDoc = Slides.findOne({
        meetingId: meetingId,
        presentationId: currentPresentationDoc.presentation.id,
        'slide.current': true,
      });
      if (currentSlideDoc != null) {
        nextSlideDoc = Slides.findOne({
          meetingId: meetingId,
          presentationId: currentPresentationDoc.presentation.id,
          'slide.num': currentSlideDoc.slide.num + 1,
        });
        if ((nextSlideDoc != null) && isAllowedTo('switchSlide', meetingId, userId, authToken)) {
          message = {
            payload: {
              page: nextSlideDoc.slide.id,
              meeting_id: meetingId,
            }
          };
          message = appendMessageHeader('go_to_slide', message);
          return publish(Meteor.config.redis.channels.toBBBApps.presentation, message);
        }
      }
    }
  }
});
