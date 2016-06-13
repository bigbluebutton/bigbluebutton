import Captions from '/imports/api/captions';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('captions', function (credentials) {
  if (isAllowedTo('subscribeCaptions', credentials)) {
    const { meetingId, requesterUserId, requesterToken } = credentials;
    logger.info(`publishing captions for ${meetingId} ${requesterUserId} ${requesterToken}`);

    return Captions.find({
      meetingId: meetingId,
    });
  } else {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'captions'"));
  }
});
