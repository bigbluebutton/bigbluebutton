import React, { useContext } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { defineMessages } from 'react-intl';
import {
  getSharingContentType,
  useIsScreenGloballyBroadcasting,
  useIsCameraAsContentGloballyBroadcasting,
  useShouldEnableVolumeControl,
  useIsScreenBroadcasting,
  useIsCameraAsContentBroadcasting,
  useScreenshareHasAudio,
  useBroadcastContentType,
} from './service';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import ScreenshareComponent from './component';
import { layoutSelect, layoutSelectOutput, layoutDispatch } from '../layout/context';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import { PINNED_PAD_SUBSCRIPTION } from '../notes/queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import AudioManager from '/imports/ui/services/audio-manager';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const screenshareIntlMessages = defineMessages({
  // SCREENSHARE
  label: {
    id: 'app.screenshare.screenShareLabel',
    description: 'screen share area element label',
  },
  presenterLoadingLabel: {
    id: 'app.screenshare.presenterLoadingLabel',
  },
  viewerLoadingLabel: {
    id: 'app.screenshare.viewerLoadingLabel',
  },
  presenterSharingLabel: {
    id: 'app.screenshare.presenterSharingLabel',
  },
  autoplayBlockedDesc: {
    id: 'app.media.screenshare.autoplayBlockedDesc',
  },
  autoplayAllowLabel: {
    id: 'app.media.screenshare.autoplayAllowLabel',
  },
  started: {
    id: 'app.media.screenshare.start',
    description: 'toast to show when a screenshare has started',
  },
  ended: {
    id: 'app.media.screenshare.end',
    description: 'toast to show when a screenshare has ended',
  },
  endedDueToDataSaving: {
    id: 'app.media.screenshare.endDueToDataSaving',
    description: 'toast to show when a screenshare has ended by changing data savings option',
  },
});

const cameraAsContentIntlMessages = defineMessages({
  // CAMERA AS CONTENT
  label: {
    id: 'app.cameraAsContent.cameraAsContentLabel',
    description: 'screen share area element label',
  },
  presenterLoadingLabel: {
    id: 'app.cameraAsContent.presenterLoadingLabel',
  },
  viewerLoadingLabel: {
    id: 'app.cameraAsContent.viewerLoadingLabel',
  },
  presenterSharingLabel: {
    id: 'app.cameraAsContent.presenterSharingLabel',
  },
  autoplayBlockedDesc: {
    id: 'app.media.cameraAsContent.autoplayBlockedDesc',
  },
  autoplayAllowLabel: {
    id: 'app.media.cameraAsContent.autoplayAllowLabel',
  },
  started: {
    id: 'app.media.cameraAsContent.start',
    description: 'toast to show when camera as content has started',
  },
  ended: {
    id: 'app.media.cameraAsContent.end',
    description: 'toast to show when camera as content has ended',
  },
  endedDueToDataSaving: {
    id: 'app.media.cameraAsContent.endDueToDataSaving',
    description: 'toast to show when camera as content has ended by changing data savings option',
  },
});

const ScreenshareContainer = (props) => {
  const screenShare = layoutSelectOutput((i) => i.screenShare);
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const layoutContextDispatch = layoutDispatch();
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);

  const { element } = fullscreen;
  const fullscreenElementId = 'Screenshare';
  const fullscreenContext = (element === fullscreenElementId);
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);

  const { data: pinnedPadData } = useDeduplicatedSubscription(PINNED_PAD_SUBSCRIPTION);

  const NOTES_CONFIG = window.meetingClientSettings.public.notes;
  const LAYOUT_CONFIG = window.meetingClientSettings.public.layout;

  const isSharedNotesPinned = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;

  const {
    data: currentUserData,
  } = useCurrentUser((u) => ({
    presenter: u.presenter,
  }));
  const isPresenter = currentUserData?.presenter;

  const info = {
    screenshare: {
      icon: 'desktop',
      locales: screenshareIntlMessages,
      startPreviewSizeBig: false,
      showSwitchPreviewSizeButton: true,
    },
    camera: {
      icon: 'video',
      locales: cameraAsContentIntlMessages,
      startPreviewSizeBig: true,
      showSwitchPreviewSizeButton: false,
    },
  };

  const broadcastContentType = useBroadcastContentType();
  const getContentType = () => (isPresenter ? getSharingContentType() : broadcastContentType);
  const contentTypeInfo = info[getContentType()];
  const defaultInfo = info.camera;
  const selectedInfo = contentTypeInfo || defaultInfo;
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value);
  const screenIsGloballyBroadcasting = useIsScreenGloballyBroadcasting();
  const cameraAsContentIsGloballyBroadcasting = useIsCameraAsContentGloballyBroadcasting();
  const enableVolumeControl = useShouldEnableVolumeControl();
  const isScreenBroadcasting = useIsScreenBroadcasting();
  const isCameraAsContentBroadcasting = useIsCameraAsContentBroadcasting();
  const hasAudio = useScreenshareHasAudio();

  let pluginScreenshareHelperItems = [];
  if (pluginsExtensibleAreasAggregatedState.screenshareHelperItems) {
    pluginScreenshareHelperItems = [
      ...pluginsExtensibleAreasAggregatedState.screenshareHelperItems,
    ];
  }
  if ((isScreenBroadcasting || isCameraAsContentBroadcasting) && currentUserData) {
    return (
      <ScreenshareComponent
        {
        ...{
          pluginScreenshareHelperItems,
          layoutContextDispatch,
          ...props,
          ...screenShare,
          fullscreenContext,
          fullscreenElementId,
          isSharedNotesPinned,
          stopExternalVideoShare,
          outputDeviceId,
          enableVolumeControl,
          hasAudio,
          isGloballyBroadcasting: screenIsGloballyBroadcasting
            || cameraAsContentIsGloballyBroadcasting,
          hidePresentationOnJoin: getFromUserSettings(
            'bbb_hide_presentation_on_join',
            LAYOUT_CONFIG.hidePresentationOnJoin,
          ),
          ...selectedInfo,
          isPresenter,
        }
        }
      />
    );
  }
  return null;
};

export default ScreenshareContainer;
