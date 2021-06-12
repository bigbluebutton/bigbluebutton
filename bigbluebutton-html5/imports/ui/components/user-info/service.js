import { makeCall } from '/imports/ui/services/api';

export default {
  handleCloseUserInfo: () => {
    makeCall('removeUserInformation');
  },
};
