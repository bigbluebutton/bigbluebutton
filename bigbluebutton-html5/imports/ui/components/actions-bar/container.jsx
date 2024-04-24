import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { useSubscription, useMutation } from '@apollo/client';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Auth from '/imports/ui/services/auth';
import ActionsBar from './component';
import Service from './service';
import TimerService from '/imports/ui/components/timer/service';
import { layoutSelectOutput, layoutDispatch } from '../layout/context';
import { isExternalVideoEnabled, isPollingEnabled, isPresentationEnabled } from '/imports/ui/services/features';
import { isScreenBroadcasting, isCameraAsContentBroadcasting } from '/imports/ui/components/screenshare/service';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import MediaService from '../media/service';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import { PINNED_PAD_SUBSCRIPTION } from '../notes/notes-graphql/queries';

const NOTES_CONFIG = window.meetingClientSettings.public.notes;

const ActionsBarContainer = (props) => {
  const actionsBarStyle = layoutSelectOutput((i) => i.actionBar);
  const layoutContextDispatch = layoutDispatch();

  const { data: presentationPageData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationPageData?.pres_page_curr[0] || {};
  const isThereCurrentPresentation = !!presentationPage?.presentationId;

  const { data: currentMeeting } = useMeeting((m) => ({
    externalVideo: m.externalVideo,
    componentsFlags: m.componentsFlags,
  }));

  const isSharingVideo = !!currentMeeting?.externalVideo?.externalVideoUrl;

  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let actionBarItems = [];
  if (pluginsExtensibleAreasAggregatedState.actionsBarItems) {
    actionBarItems = [
      ...pluginsExtensibleAreasAggregatedState.actionsBarItems,
    ];
  }

  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
    emoji: user.emoji,
    isModerator: user.isModerator,
  }));

  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);
  const currentUser = { userId: Auth.userID, emoji: currentUserData?.emoji };
  const amIPresenter = currentUserData?.presenter;
  const amIModerator = currentUserData?.isModerator;

  const { data: pinnedPadData } = useSubscription(PINNED_PAD_SUBSCRIPTION);
  const isSharedNotesPinnedFromGraphql = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;

  const isSharedNotesPinned = isSharedNotesPinnedFromGraphql;

  if (actionsBarStyle.display === false) return null;
  if (!currentMeeting) return null;

  return (
    <ActionsBar {
      ...{
        ...props,
        currentUser,
        amIModerator,
        layoutContextDispatch,
        actionsBarStyle,
        amIPresenter,
        actionBarItems,
        isThereCurrentPresentation,
        isSharingVideo,
        stopExternalVideoShare,
        isSharedNotesPinned,
      }
    }
    />
  );
};

const RAISE_HAND_BUTTON_ENABLED = window.meetingClientSettings
  .public.app.raiseHandActionButton.enabled;
const RAISE_HAND_BUTTON_CENTERED = window.meetingClientSettings
  .public.app.raiseHandActionButton.centered;

const isReactionsButtonEnabled = () => {
  const USER_REACTIONS_ENABLED = window.meetingClientSettings.public.userReaction.enabled;
  const REACTIONS_BUTTON_ENABLED = window.meetingClientSettings.public.app.reactionsButton.enabled;

  return USER_REACTIONS_ENABLED && REACTIONS_BUTTON_ENABLED;
};

export default withTracker(() => ({
  enableVideo: getFromUserSettings('bbb_enable_video', window.meetingClientSettings.public.kurento.enableVideo),
  setPresentationIsOpen: MediaService.setPresentationIsOpen,
  hasScreenshare: isScreenBroadcasting(),
  hasCameraAsContent: isCameraAsContentBroadcasting(),
  isTimerActive: TimerService.isActive(),
  isTimerEnabled: TimerService.isEnabled(),
  isMeteorConnected: Meteor.status().connected,
  isPollingEnabled: isPollingEnabled() && isPresentationEnabled(),
  isRaiseHandButtonEnabled: RAISE_HAND_BUTTON_ENABLED,
  isRaiseHandButtonCentered: RAISE_HAND_BUTTON_CENTERED,
  isReactionsButtonEnabled: isReactionsButtonEnabled(),
  allowExternalVideo: isExternalVideoEnabled(),
}))(injectIntl(ActionsBarContainer));
