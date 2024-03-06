import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { defineMessages, useIntl } from 'react-intl';
import { layoutDispatch, layoutSelect, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import browserInfo from '/imports/utils/browserInfo';
import Auth from '/imports/ui/services/auth';
import Styled from './styles';
import { handleVideoFocus, toggleFullscreen, toggleVideoPin } from './service';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import BBBMenu from '/imports/ui/components/common/menu/component';
import useSelfViewDisable from '/imports/ui/core/local-states/useSelfViewDisable';
import Settings from '/imports/ui/services/settings';

const PIN_WEBCAM = Meteor.settings.public.kurento.enableVideoPin;

const intlMessages = defineMessages({
  focusLabel: {
    id: 'app.videoDock.webcamFocusLabel',
  },
  focusDesc: {
    id: 'app.videoDock.webcamFocusDesc',
  },
  unfocusLabel: {
    id: 'app.videoDock.webcamUnfocusLabel',
  },
  unfocusDesc: {
    id: 'app.videoDock.webcamUnfocusDesc',
  },
  pinLabel: {
    id: 'app.videoDock.webcamPinLabel',
  },
  unpinLabel: {
    id: 'app.videoDock.webcamUnpinLabel',
  },
  disableLabel: {
    id: 'app.videoDock.webcamDisableLabel',
  },
  enableLabel: {
    id: 'app.videoDock.webcamEnableLabel',
  },
  pinDesc: {
    id: 'app.videoDock.webcamPinDesc',
  },
  unpinDesc: {
    id: 'app.videoDock.webcamUnpinDesc',
  },
  enableMirrorLabel: {
    id: 'app.videoDock.webcamEnableMirrorLabel',
  },
  enableMirrorDesc: {
    id: 'app.videoDock.webcamEnableMirrorDesc',
  },
  disableMirrorDesc: {
    id: 'app.videoDock.webcamDisableMirrorDesc',
  },
  fullscreenLabel: {
    id: 'app.videoDock.webcamFullscreenLabel',
    description: 'Make fullscreen option label',
  },
  squeezedLabel: {
    id: 'app.videoDock.webcamSqueezedButtonLabel',
    description: 'User selected webcam squeezed options',
  },
  disableDesc: {
    id: 'app.videoDock.webcamDisableDesc',
  },
  disableMirrorLabel: {
    id: 'app.videoDock.webcamDisableMirrorLabel',
  },
});

interface UserActionContainerProps {
  userId: string;
  pinned: boolean;
  cameraId: string;
  isSelfViewDisabled: boolean;
  focused: boolean;
  isVideoSqueezed: boolean;
  isStream: boolean;
  videoContainer: React.RefObject<HTMLDivElement> | null;
  onHandleMirror: (cameraId: string)=> void;
  name: string;
  numOfStreams: number;
  isModerator: boolean;
  setIsSelfViewDisabled: (isSelfViewDisabled: boolean) => void;
  isMirrored: boolean;
}

interface UserActionProps extends UserActionContainerProps {
  focusedId: string;
  isBreakout: boolean;
  isRTL: boolean;
}

const UserAction: React.FC<UserActionProps> = ({
  userId,
  pinned,
  cameraId,
  isSelfViewDisabled,
  focused,
  isVideoSqueezed,
  isStream,
  videoContainer,
  onHandleMirror,
  name,
  numOfStreams,
  focusedId,
  isModerator,
  isBreakout,
  isRTL,
  setIsSelfViewDisabled,
  isMirrored,
}) => {
  const intl = useIntl();
  const dispatch = layoutDispatch();
  const enableVideoMenu = Meteor.settings.public.kurento.enableVideoMenu || false;
  const { isFirefox } = browserInfo;
  const [selfviewDisabled, setSelfViewDisable] = useSelfViewDisable();

  const toggleDisableCam = () => {
    const disabledCams = Session.get('disabledCams') || selfviewDisabled || [];
    const isDisabled = selfviewDisabled.length > 0 || isSelfViewDisabled;
    if (!isDisabled) {
      Session.set('disabledCams', [...disabledCams, userId]);
      setSelfViewDisable([...disabledCams, userId]);
      setIsSelfViewDisabled(true);
      // @ts-ignore - auto generated field
      Settings.application.selfViewDisable = true;
      Settings.save();
    } else {
      Session.set('disabledCams', disabledCams.filter((cId: string) => cId !== userId));
      setSelfViewDisable(disabledCams.filter((cId: string) => cId !== userId));
      setIsSelfViewDisabled(false);
      // @ts-ignore - auto generated field
      Settings.application.selfViewDisable = false;
      Settings.save();
    }
  };

  const getAvailableActions = () => {
    const isPinnedIntlKey = !pinned ? 'pin' : 'unpin';
    const isFocusedIntlKey = !focused ? 'focus' : 'unfocus';
    const enableSelfCamIntlKey = !(selfviewDisabled.length > 0 || isSelfViewDisabled) ? 'disable' : 'enable';
    const isMirroredIntlKey = !isMirrored ? 'enableMirror' : 'disableMirror';
    const menuItems = [];

    if (isVideoSqueezed) {
      menuItems.push({
        key: `${cameraId}-name`,
        label: name,
        description: name,
        onClick: () => { },
        disabled: true,
      });

      if (isStream) {
        menuItems.push(
          {
            key: `${cameraId}-fullscreen`,
            label: intl.formatMessage(intlMessages.fullscreenLabel),
            description: intl.formatMessage(intlMessages.fullscreenLabel),
            onClick: () => toggleFullscreen(videoContainer),
          },
        );
      }
    }
    if (userId === Auth.userID && isStream) {
      menuItems.push({
        key: `${cameraId}-disable`,
        label: intl.formatMessage(intlMessages[`${enableSelfCamIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${enableSelfCamIntlKey}Label`]),
        onClick: () => toggleDisableCam(),
        dataTest: 'selfViewDisableBtn',
      });
    }

    if (isStream) {
      menuItems.push({
        key: `${cameraId}-mirror`,
        label: intl.formatMessage(intlMessages[`${isMirroredIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isMirroredIntlKey}Desc`]),
        onClick: () => onHandleMirror(cameraId),
        dataTest: 'mirrorWebcamBtn',
      });
    }

    if (numOfStreams > 2 && isStream) {
      menuItems.push({
        key: `${cameraId}-focus`,
        label: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Desc`]),
        onClick: () => handleVideoFocus(cameraId, focusedId, dispatch),
        dataTest: 'FocusWebcamBtn',
      });
    }

    if ((isModerator && !isBreakout && PIN_WEBCAM) && isStream) {
      menuItems.push({
        key: `${cameraId}-pin`,
        label: intl.formatMessage(intlMessages[`${isPinnedIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isPinnedIntlKey}Desc`]),
        onClick: () => toggleVideoPin(userId, pinned),
        dataTest: 'pinWebcamBtn',
      });
    }

    return menuItems;
  };

  const renderSqueezedButton = () => (
    <Styled.MenuWrapperSqueezed>
      <BBBMenu
        trigger={(
          <Styled.OptionsButton
            label={intl.formatMessage(intlMessages.squeezedLabel)}
            aria-label={`${name} ${intl.formatMessage(intlMessages.squeezedLabel)}`}
            data-test="webcamOptionsMenuSqueezed"
            icon="device_list_selector"
            ghost
            color="primary"
            hideLabel
            size="sm"
            onClick={() => null}
          />
        )}
        actions={getAvailableActions()}
      />
    </Styled.MenuWrapperSqueezed>
  );

  const renderDefaultButton = () => (
    <Styled.MenuWrapper>
      {enableVideoMenu && getAvailableActions().length >= 1
        ? (
          <BBBMenu
            trigger={(
              <Styled.DropdownTrigger
                tabIndex={0}
                data-test="dropdownWebcamButton"
              >
                {name}
              </Styled.DropdownTrigger>
            )}
            actions={getAvailableActions()}
            opts={{
              id: `webcam-${userId}-dropdown-menu`,
              keepMounted: true,
              transitionDuration: 0,
              elevation: 3,
              getcontentanchorel: null,
              fullwidth: 'true',
              anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
              transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
            }}
          />
        )
        : (
          <Styled.Dropdown isFirefox={isFirefox}>
            <Styled.UserName noMenu={numOfStreams < 3}>
              {name}
            </Styled.UserName>
          </Styled.Dropdown>
        )}
    </Styled.MenuWrapper>
  );

  return (
    isVideoSqueezed
      ? renderSqueezedButton()
      : renderDefaultButton()
  );
};

const UserActionContainer: React.FC<UserActionContainerProps> = ({
  userId,
  pinned,
  cameraId,
  isSelfViewDisabled,
  focused,
  isVideoSqueezed,
  isStream,
  videoContainer,
  onHandleMirror,
  name,
  numOfStreams,
  isModerator,
  setIsSelfViewDisabled,
  isMirrored,
}) => {
  const focusedId = layoutSelectInput((i: Input) => i.cameraDock.focusedId);
  const {
    data: meeting,
  } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
  }));

  const isRTL = layoutSelect((i: Layout) => i.isRTL);

  return (
    <UserAction
      focusedId={focusedId}
      isBreakout={meeting?.isBreakout ?? false}
      userId={userId}
      pinned={pinned}
      cameraId={cameraId}
      isSelfViewDisabled={isSelfViewDisabled}
      focused={focused}
      isVideoSqueezed={isVideoSqueezed}
      isStream={isStream}
      videoContainer={videoContainer}
      onHandleMirror={onHandleMirror}
      name={name}
      numOfStreams={numOfStreams}
      isModerator={isModerator}
      isRTL={isRTL}
      setIsSelfViewDisabled={setIsSelfViewDisabled}
      isMirrored={isMirrored}
    />
  );
};

export default UserActionContainer;
