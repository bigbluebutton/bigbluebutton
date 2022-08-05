import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import RecordingNotifyModal from './component';

export default withModalMounter(withTracker(({ mountModal, toggleShouldNotify}) => {
  return {
    closeModal: () => {
      toggleShouldNotify();
      mountModal(null);
    },
  };
})(RecordingNotifyModal));
