import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';
import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';
import { redisConfig } from '/config';

Meteor.methods({
  publishSwitchToNextSlideMessage(credentials) {
    const { meetingId, requesterUserId, requesterToken } = credentials;

    const currentPresentationDoc = Presentations.findOne({
      meetingId: meetingId,
      'presentation.current': true,
    });
    if (currentPresentationDoc != null) {
      const currentSlideDoc = Slides.findOne({
        meetingId: meetingId,
        presentationId: currentPresentationDoc.presentation.id,
        'slide.current': true,
      });
      if (currentSlideDoc != null) {
        const nextSlideDoc = Slides.findOne({
          meetingId: meetingId,
          presentationId: currentPresentationDoc.presentation.id,
          'slide.num': currentSlideDoc.slide.num + 1,
        });
        if ((nextSlideDoc != null) && isAllowedTo('switchSlide', credentials)) {
          let message = {
            payload: {
              page: nextSlideDoc.slide.id,
              meeting_id: meetingId,
            },
          };
          message = appendMessageHeader('go_to_slide', message);
          return publish(redisConfig.channels.toBBBApps.presentation, message);
        }
      }
    }
  },
});
