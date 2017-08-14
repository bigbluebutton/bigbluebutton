import { makeCall } from '/imports/ui/services/api/index.js';
import Auth from '/imports/ui/services/auth';

const endMeeting = () => {
  makeCall('endMeeting', Auth.credentials); 
};

export default {
  endMeeting,
};