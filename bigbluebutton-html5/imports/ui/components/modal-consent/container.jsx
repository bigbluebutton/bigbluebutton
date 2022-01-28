import { withTracker } from 'meteor/react-meteor-data';
import ModalConsent from './component';
import { RecordMeetings } from '/imports/api/meetings';
import Meetings from '../../../api/meetings/index';

export default withTracker(() => {
  const recMeetingsCollection = RecordMeetings.find().fetch();
  const meetingsCollection = Meetings.find().fetch();
  return {
    recMeetingsCollection,
    meetingsCollection,
  };
})(ModalConsent);
