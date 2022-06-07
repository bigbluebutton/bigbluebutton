import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Auth from '/imports/ui/services/auth';
import PresentationService from '/imports/ui/components/presentation/service';
import Presentations from '/imports/api/presentations';
import { UsersContext } from '../components-data/users-context/context';
import ActionsBar from './component';
import Service from './service';
import UserListService from '/imports/ui/components/user-list/service';
import ExternalVideoService from '/imports/ui/components/external-video-player/service';
import CaptionsService from '/imports/ui/components/captions/service';
import LayoutContext from '../layout/context';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';

import MediaService, {
  getSwapLayout,
  shouldEnableSwapLayout,
} from '../media/service';

const ActionsBarContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { output } = layoutContextState;
  const { actionBar: actionsBarStyle } = output;

  const currentUser = { userId: Auth.userID, emoji: users[Auth.meetingID][Auth.userID].emoji };

  return (
    <ActionsBar {
      ...{
        ...props,
        currentUser,
        layoutContextDispatch,
        actionsBarStyle,
      }
    }
    />
  );
};

const POLLING_ENABLED = Meteor.settings.public.poll.enabled;
const PRESENTATION_DISABLED = Meteor.settings.public.layout.hidePresentation;
const SELECT_RANDOM_USER_ENABLED = Meteor.settings.public.selectRandomUser.enabled;
const RAISE_HAND_BUTTON_ENABLED = Meteor.settings.public.app.raiseHandActionButton.enabled;
const OLD_MINIMIZE_BUTTON_ENABLED = Meteor.settings.public.presentation.oldMinimizeButton;

export default withTracker(() => ({
  amIPresenter: Service.amIPresenter(),
  amIModerator: Service.amIModerator(),
  stopExternalVideoShare: ExternalVideoService.stopWatching,
  enableVideo: getFromUserSettings('bbb_enable_video', Meteor.settings.public.kurento.enableVideo),
  isLayoutSwapped: getSwapLayout()&& shouldEnableSwapLayout(),
  toggleSwapLayout: MediaService.toggleSwapLayout,
  handleTakePresenter: Service.takePresenterRole,
  currentSlidHasContent: PresentationService.currentSlidHasContent(),
  parseCurrentSlideContent: PresentationService.parseCurrentSlideContent,
  isSharingVideo: Service.isSharingVideo(),
  hasScreenshare: isVideoBroadcasting(),
  isCaptionsAvailable: CaptionsService.isCaptionsAvailable(),
  isMeteorConnected: Meteor.status().connected,
  isPollingEnabled: POLLING_ENABLED,
  isPresentationDisabled: PRESENTATION_DISABLED,
  isSelectRandomUserEnabled: SELECT_RANDOM_USER_ENABLED,
  isRaiseHandButtonEnabled: RAISE_HAND_BUTTON_ENABLED,
  isOldMinimizeButtonEnabled: OLD_MINIMIZE_BUTTON_ENABLED,
  isThereCurrentPresentation: Presentations.findOne({ meetingId: Auth.meetingID, current: true },
    { fields: {} }),
  allowExternalVideo: Meteor.settings.public.externalVideoPlayer.enabled,
  setEmojiStatus: UserListService.setEmojiStatus,
}))(injectIntl(ActionsBarContainer));
