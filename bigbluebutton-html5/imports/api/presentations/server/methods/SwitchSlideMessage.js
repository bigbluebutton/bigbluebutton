import { publish } from '/imports/api/common/server/helpers';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { appendMessageHeader } from '/imports/api/common/server/helpers';
import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';
import { redisConfig } from '/config';

Meteor.methods({
  SwitchSlideMessage(credentials, requestedSlideNum) {
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
        const requestedSlideDoc = Slides.findOne({
          meetingId: meetingId,
          presentationId: currentPresentationDoc.presentation.id,
          'slide.num': parseInt(requestedSlideNum),
        });

        if ((requestedSlideDoc != null) && isAllowedTo('switchSlide', credentials)) {
          let message = {
            payload: {
              page: requestedSlideDoc.slide.id,
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
