import { withTracker } from 'meteor/react-meteor-data';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import { formatNumber, isEasternArabic, convertToWestern } from '/imports/utils/intl-formatter';
import CreateBreakoutRoomModal from './component';

export default withTracker(() => ({
  createBreakoutRoom: ActionsBarService.createBreakoutRoom,
  getBreakouts: ActionsBarService.getBreakouts,
  getUsersNotAssigned: ActionsBarService.getUsersNotAssigned,
  sendInvitation: ActionsBarService.sendInvitation,
  users: ActionsBarService.users(),
  meetingName: ActionsBarService.meetingName(),
  formatNumber,
  isEasternArabic,
  convertToWestern,
}))(CreateBreakoutRoomModal);
