import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import {
  getSharingContentType,
  getBroadcastContentType,
  isScreenGloballyBroadcasting,
  isCameraAsContentGloballyBroadcasting,
  isScreenBroadcasting,
  isCameraAsContentBroadcasting,
} from './service';
import ScreenshareComponent from './component';
import { layoutSelect, layoutSelectOutput, layoutDispatch } from '../layout/context';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import { shouldEnableVolumeControl } from './service';
import MediaService from '/imports/ui/components/media/service';
import { defineMessages } from 'react-intl';

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
  }
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

  const { element } = fullscreen;
  const fullscreenElementId = 'Screenshare';
  const fullscreenContext = (element === fullscreenElementId);

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const isPresenter = currentUser.presenter;

  const info = {
    screenshare: {
      icon: "desktop",
      locales: screenshareIntlMessages,
      startPreviewSizeBig: false,
      showSwitchPreviewSizeButton: true,
    },
    camera: {
      icon: "video",
      locales: cameraAsContentIntlMessages,
      startPreviewSizeBig: true,
      showSwitchPreviewSizeButton: false,
    },
  };

  const getContentType = () => {
    return isPresenter ? getSharingContentType() : getBroadcastContentType();
  }
  const contentTypeInfo = info[getContentType()];
  const defaultInfo = info.camera;
  const selectedInfo = contentTypeInfo ? contentTypeInfo : defaultInfo;

  if (isScreenBroadcasting() || isCameraAsContentBroadcasting()) {
    return (
      <ScreenshareComponent
        {
        ...{
          layoutContextDispatch,
          ...props,
          ...screenShare,
          fullscreenContext,
          fullscreenElementId,
          isPresenter,
          ...selectedInfo,
        }
        }
      />
    );
  }
  return null;
};

const LAYOUT_CONFIG = Meteor.settings.public.layout;

export default withTracker(() => {
  return {
    isGloballyBroadcasting: isScreenGloballyBroadcasting() || isCameraAsContentGloballyBroadcasting(),
    toggleSwapLayout: MediaService.toggleSwapLayout,
    hidePresentationOnJoin: getFromUserSettings('bbb_hide_presentation_on_join', LAYOUT_CONFIG.hidePresentationOnJoin),
    enableVolumeControl: shouldEnableVolumeControl(),
  };
})(ScreenshareContainer);
