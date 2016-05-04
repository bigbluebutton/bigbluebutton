import { publish } from '/imports/startup/server/redispubsub';
import { isAllowedTo } from '/imports/startup/server/user_permissions';
import { appendMessageHeader } from '/imports/startup/server/helpers';
import { Presentations, Slides } from '/collections/collections';
import { redisConfig } from '/config';


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
          return publish(redisConfig.channels.toBBBApps.presentation, message);
        }
      }
    }
  }
});
