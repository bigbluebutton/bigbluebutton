import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { useSubscription } from '@apollo/client';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '../components-data/users-context/context';
import ActionsBar from './component';
import Service from './service';
import UserListService from '/imports/ui/components/user-list/service';
import ExternalVideoService from '/imports/ui/components/external-video-player/service';
import CaptionsService from '/imports/ui/components/captions/service';
import TimerService from '/imports/ui/components/timer/service';
import { layoutSelectOutput, layoutDispatch } from '../layout/context';
import { isExternalVideoEnabled, isPollingEnabled, isPresentationEnabled } from '/imports/ui/services/features';
import { isScreenBroadcasting, isCameraAsContentBroadcasting } from '/imports/ui/components/screenshare/service';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import MediaService from '../media/service';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

const ActionsBarContainer = (props) => {
  const actionsBarStyle = layoutSelectOutput((i) => i.actionBar);
  const layoutContextDispatch = layoutDispatch();

  const { data: presentationPageData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationPageData?.pres_page_curr[0] || {};
  const isThereCurrentPresentation = !!presentationPage?.presentationId;

  const usingUsersContext = useContext(UsersContext);
  const {
    pluginsProvidedAggregatedState,
  } = useContext(PluginsContext);
  let actionBarItems = [];
  if (pluginsProvidedAggregatedState.actionsBarItems) {
    actionBarItems = [
      ...pluginsProvidedAggregatedState.actionsBarItems,
    ];
  }

  const { users } = usingUsersContext;

  const currentUser = { userId: Auth.userID, emoji: users[Auth.meetingID][Auth.userID].emoji };

  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;

  if (actionsBarStyle.display === false) return null;

  return (
    <ActionsBar {
      ...{
        ...props,
        currentUser,
        layoutContextDispatch,
        actionsBarStyle,
        amIPresenter,
        actionBarItems,
        isThereCurrentPresentation,
      }
    }
    />
  );
};

const isReactionsButtonEnabled = () => {
  const USER_REACTIONS_ENABLED = Meteor.settings.public.userReaction.enabled;
  const REACTIONS_BUTTON_ENABLED = Meteor.settings.public.app.reactionsButton.enabled;

  return USER_REACTIONS_ENABLED && REACTIONS_BUTTON_ENABLED;
};

export default withTracker(() => {
  const [MeetingSettings] = useMeetingSettings();
  const appConfig = MeetingSettings.public.app;
  const publicConfig = MeetingSettings.public;
  const selectRandomUserEnabled = publicConfig.selectRandomUser.enabled;
  const raiseHandButtonEnabled = appConfig.raiseHandActionButton.enabled;
  const raiseHandButtonCentered = appConfig.raiseHandActionButton.centered;

  return {
    amIModerator: Service.amIModerator(),
    stopExternalVideoShare: ExternalVideoService.stopWatching,
    enableVideo: getFromUserSettings('bbb_enable_video', publicConfig.kurento.enableVideo),
    setPresentationIsOpen: MediaService.setPresentationIsOpen,
    handleTakePresenter: Service.takePresenterRole,
    isSharingVideo: Service.isSharingVideo(),
    isSharedNotesPinned: Service.isSharedNotesPinned(),
    hasScreenshare: isScreenBroadcasting(),
    hasCameraAsContent: isCameraAsContentBroadcasting(),
    isCaptionsAvailable: CaptionsService.isCaptionsAvailable(),
    isTimerActive: TimerService.isActive(),
    isTimerEnabled: TimerService.isEnabled(),
    isMeteorConnected: Meteor.status().connected,
    isPollingEnabled: isPollingEnabled() && isPresentationEnabled(),
    isSelectRandomUserEnabled: selectRandomUserEnabled,
    isRaiseHandButtonEnabled: raiseHandButtonEnabled,
    isRaiseHandButtonCentered: raiseHandButtonCentered,
    isReactionsButtonEnabled: isReactionsButtonEnabled(),
    allowExternalVideo: isExternalVideoEnabled(),
    setEmojiStatus: UserListService.setEmojiStatus,
  };
})(injectIntl(ActionsBarContainer));
