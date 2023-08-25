import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { defineMessages, useIntl } from 'react-intl';
import { layoutSelect, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import browserInfo from '/imports/utils/browserInfo';
import Auth from '/imports/ui/services/auth';
import Styled from './styles';
import { handleVideoFocus, toggleFullscreen, toggleVideoPin } from './service';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { setSelfViewDisable } from '/imports/ui/core/local-states/useSelfViewDisable';

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
  mirrorLabel: {
    id: 'app.videoDock.webcamMirrorLabel',
  },
  mirrorDesc: {
    id: 'app.videoDock.webcamMirrorDesc',
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
  onHandleMirror: Function;
  name: string;
  numOfStreams: number;
  isModerator: boolean;
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
}) => {
  const intl = useIntl();
  const enableVideoMenu = Meteor.settings.public.kurento.enableVideoMenu || false;
  const { isFirefox } = browserInfo;

  const getAvailableActions = () => {
    const isPinnedIntlKey = !pinned ? 'pin' : 'unpin';
    const isFocusedIntlKey = !focused ? 'focus' : 'unfocus';
    const enableSelfCamIntlKey = !isSelfViewDisabled ? 'disable' : 'enable';

    const menuItems = [];

    const toggleDisableCam = () => {
      const disabledCams = Session.get('disabledCams') || [];
      const isDisabled = disabledCams && disabledCams?.includes(cameraId);
      if (!isDisabled) {
        Session.set('disabledCams', [...disabledCams, cameraId]);
        setSelfViewDisable([...disabledCams, cameraId]);
      } else {
        Session.set('disabledCams', disabledCams.filter((cId: string) => cId !== cameraId));
        setSelfViewDisable(disabledCams.filter((cId: string) => cId !== cameraId));
      }
    };

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
            onClick: () => toggleFullscreen(videoContainer.current),
          },
        );
      }
    }
    if (userId === Auth.userID && isStream && !isSelfViewDisabled) {
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
        label: intl.formatMessage(intlMessages.mirrorLabel),
        description: intl.formatMessage(intlMessages.mirrorDesc),
        onClick: () => onHandleMirror(cameraId),
        dataTest: 'mirrorWebcamBtn',
      });
    }

    if (numOfStreams > 2 && isStream) {
      menuItems.push({
        key: `${cameraId}-focus`,
        label: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Desc`]),
        onClick: () => handleVideoFocus(cameraId, focusedId),
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
}) => {
  const focusedId = layoutSelectInput((i: Input) => i.cameraDock.focusedId);
  const meeting = useMeeting((m) => ({
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
    />
  );
};

export default UserActionContainer;
