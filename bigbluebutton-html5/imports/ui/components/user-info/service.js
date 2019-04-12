import { makeCall } from '/imports/ui/services/api';

export default {
  handleCloseUserInfo: (meetingId, requesterUserId) => {
    makeCall('removeUserInformation', meetingId, requesterUserId);
  },
};
