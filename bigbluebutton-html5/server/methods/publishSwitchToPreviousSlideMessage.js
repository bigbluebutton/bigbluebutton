import { publish } from '/server/redispubsub';
import { isAllowedTo } from '/server/user_permissions';
import { appendMessageHeader } from '/server/helpers';
import { Presentations, Slides } from '/collections/collections';


Meteor.methods({
  publishSwitchToPreviousSlideMessage(meetingId, userId, authToken) {
    let currentPresentationDoc, currentSlideDoc, message, previousSlideDoc;
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
        previousSlideDoc = Slides.findOne({
          meetingId: meetingId,
          presentationId: currentPresentationDoc.presentation.id,
          'slide.num': currentSlideDoc.slide.num - 1,
        });
        if ((previousSlideDoc != null) && isAllowedTo('switchSlide', meetingId, userId, authToken)) {
          message = {
            payload: {
              page: previousSlideDoc.slide.id,
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
