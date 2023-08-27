import { withTracker } from 'meteor/react-meteor-data';
import RecordingNotifyModal from './component';

export default withTracker((props) => {
  const { toggleShouldNotify, setIsOpen } = props;
  return {
    closeModal: () => {
      toggleShouldNotify();
      setIsOpen(false);
    },
    ...props,
  };
})(RecordingNotifyModal);
