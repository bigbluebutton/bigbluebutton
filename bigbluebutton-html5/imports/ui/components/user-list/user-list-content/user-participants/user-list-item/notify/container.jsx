import { withTracker } from 'meteor/react-meteor-data';
import AwayNotifyModal from './component';

export default withTracker((props) => {
  const { setIsOpen, muteAway } = props;
  return {
    closeModal: () => {
      setIsOpen(false);
      muteAway();
    },
    ...props,
  };
})(AwayNotifyModal);
