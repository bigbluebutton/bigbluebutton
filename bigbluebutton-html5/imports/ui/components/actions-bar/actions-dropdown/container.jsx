import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PresentationPodService from '/imports/ui/components/presentation-pod/service';
import ActionsDropdown from './component';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';

export default withTracker(() => {
  const Meeting = Meetings.findOne({
    meetingId: Auth.meetingID,
  });
  const presentations = Presentations.find({ 'conversion.done': true }).fetch();
  return ({
    presentations,
    setPresentation: PresentationUploaderService.setPresentation,
    podIds: PresentationPodService.getPresentationPodIds(),
    allowViewersToTakePresenter: Meeting.usersProp.allowViewersToTakePresenter,
  });
})(ActionsDropdown);
