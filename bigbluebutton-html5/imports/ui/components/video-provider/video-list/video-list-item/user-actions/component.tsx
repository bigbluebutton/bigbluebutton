import React, { MutableRefObject, useContext, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Session from '/imports/ui/services/storage/in-memory';
import { UserCameraDropdownInterface, UserCameraDropdownOption } from 'bigbluebutton-html-plugin-sdk';
import browserInfo from '/imports/utils/browserInfo';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { UserCameraDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-camera-dropdown-item/enums';
import Styled from './styles';
import Auth from '/imports/ui/services/auth';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { notify } from '/imports/ui/services/notification';
import { SET_CAMERA_PINNED } from '/imports/ui/core/graphql/mutations/userMutations';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import { useIsVideoPinEnabledForCurrentUser } from '/imports/ui/components/video-provider/hooks';
import { VIDEO_TYPES } from '/imports/ui/components/video-provider/enums';

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
  disableMirrorLabel: {
    id: 'app.videoDock.webcamDisableMirrorLabel',
  },
  disableMirrorDesc: {
    id: 'app.videoDock.webcamDisableMirrorDesc',
  },
  fullscreenLabel: {
    id: 'app.videoDock.webcamFullscreenLabel',
    description: 'Make fullscreen option label',
  },
  exitFullscreenLabel: {
    id: 'app.videoDock.webcamExitFullscreenLabel',
    description: 'Make exit fullscreen option label',
  },
  squeezedLabel: {
    id: 'app.videoDock.webcamSqueezedButtonLabel',
    description: 'User selected webcam squeezed options',
  },
  disableDesc: {
    id: 'app.videoDock.webcamDisableDesc',
  },
  disableWarning: {
    id: 'app.videoDock.webcamDisableWarning',
  },
});

interface UserActionProps {
  name: string;
  stream: VideoItem;
  cameraId: string;
  numOfStreams: number;
  onHandleVideoFocus: ((id: string) => void) | null;
  focused: boolean;
  onHandleMirror: () => void;
  isMirrored: boolean;
  isRTL: boolean;
  isStream: boolean;
  onHandleDisableCam: () => void;
  isSelfViewDisabled: boolean;
  amIModerator: boolean;
  isVideoSqueezed?: boolean,
  videoContainer?: MutableRefObject<HTMLDivElement | null>,
  isFullscreenContext: boolean;
  layoutContextDispatch: (...args: unknown[]) => void;
}

const UserActions: React.FC<UserActionProps> = (props) => {
  const {
    name, cameraId, numOfStreams, onHandleVideoFocus, stream, focused, onHandleMirror,
    isVideoSqueezed = false, videoContainer, isRTL, isStream, isSelfViewDisabled, isMirrored,
    amIModerator, isFullscreenContext, layoutContextDispatch,
  } = props;

  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);

  let userCameraDropdownItems: UserCameraDropdownInterface[] = [];
  if (pluginsExtensibleAreasAggregatedState.userCameraDropdownItems) {
    userCameraDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.userCameraDropdownItems,
    ];
  }

  const intl = useIntl();
  const enableVideoMenu = window.meetingClientSettings.public.kurento.enableVideoMenu || false;
  const { isFirefox } = browserInfo;
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

  const [setCameraPinned] = useMutation(SET_CAMERA_PINNED);
  const pinEnabledForCurrentUser = useIsVideoPinEnabledForCurrentUser(amIModerator);

  useEffect(() => () => {
    if (isFullscreenContext) {
      layoutContextDispatch({
        type: ACTIONS.SET_FULLSCREEN_ELEMENT,
        value: {
          element: '',
          group: '',
        },
      });
    }
  }, []);

  const getAvailableActions = () => {
    const pinned = stream.type === VIDEO_TYPES.STREAM && stream.user.pinned;
    const { userId } = stream;
    const isPinnedIntlKey = !pinned ? 'pin' : 'unpin';
    const isFocusedIntlKey = !focused ? 'focus' : 'unfocus';
    const isMirroredIntlKey = !isMirrored ? 'enableMirror' : 'disableMirror';
    const disabledCams = (Session.getItem('disabledCams') || []) as string[];
    const isCameraDisabled = Array.isArray(disabledCams) && disabledCams?.includes(cameraId);
    const enableSelfCamIntlKey = !isCameraDisabled ? 'disable' : 'enable';
    const ALLOW_FULLSCREEN = !isIphone ? window.meetingClientSettings.public.app.allowFullscreen : false;

    const menuItems = [];

    const toggleDisableCam = () => {
      if (!isCameraDisabled) {
        Session.setItem('disabledCams', [...disabledCams, cameraId]);
        notify(intl.formatMessage(intlMessages.disableWarning), 'info', 'warning');
      } else {
        Session.setItem('disabledCams', disabledCams.filter((cId: string) => cId !== cameraId));
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
        label: intl.formatMessage(intlMessages[`${isMirroredIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isMirroredIntlKey}Desc`]),
        onClick: () => onHandleMirror(),
        dataTest: 'mirrorWebcamBtn',
      });
    }

    if (numOfStreams > 2 && isStream) {
      menuItems.push({
        key: `${cameraId}-focus`,
        label: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Desc`]),
        onClick: () => onHandleVideoFocus?.(cameraId),
        dataTest: !focused ? 'focusWebcamBtn' : 'unfocusWebcamBtn',
      });
    }

    if (pinEnabledForCurrentUser && isStream) {
      menuItems.push({
        key: `${cameraId}-pin`,
        label: intl.formatMessage(intlMessages[`${isPinnedIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isPinnedIntlKey}Desc`]),
        onClick: () => {
          setCameraPinned({
            variables: {
              userId,
              pinned: !pinned,
            },
          });
        },
        dataTest: 'pinWebcamBtn',
      });
    }

    if (isStream && ALLOW_FULLSCREEN) {
      menuItems.push(
        {
          key: `${cameraId}-fullscreen`,
          label: isFullscreenContext
            ? intl.formatMessage(intlMessages.exitFullscreenLabel)
            : intl.formatMessage(intlMessages.fullscreenLabel),
          description: isFullscreenContext
            ? intl.formatMessage(intlMessages.exitFullscreenLabel)
            : intl.formatMessage(intlMessages.fullscreenLabel),
          dataTest: 'webcamsFullscreenButton',
          onClick: () => {
            setTimeout(() => {
              layoutContextDispatch({
                type: ACTIONS.SET_FULLSCREEN_ELEMENT,
                value: {
                  element: isFullscreenContext ? '' : cameraId,
                  group: isFullscreenContext ? '' : 'webcams',
                },
              });

              // @ts-ignore JS code
              FullscreenService.toggleFullScreen(videoContainer?.current);
            }, 100);
          },
        },
      );
    }

    userCameraDropdownItems.filter(
      (pluginItem) => (pluginItem.displayFunction?.({ userId, streamId: cameraId }) ?? true),
    ).forEach((pluginItem) => {
      switch (pluginItem.type) {
        case UserCameraDropdownItemType.OPTION: {
          const optionItem = pluginItem as UserCameraDropdownOption;
          menuItems.push({
            key: optionItem.id,
            label: optionItem.label,
            onClick: (event: React.MouseEvent<HTMLElement>) => optionItem.onClick({
              streamId: cameraId,
              userId,
              browserClickEvent: event,
            }),
            icon: optionItem.icon,
          });
          break;
        }
        case UserCameraDropdownItemType.SEPARATOR:
          menuItems.push({
            key: pluginItem.id,
            isSeparator: true,
          });
          break;
        default:
          break;
      }
    });

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
        opts={{
          container: isFullscreenContext ? videoContainer?.current : document.body,
        }}
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
                $isRTL={isRTL}
                role="button"
              >
                {name}
              </Styled.DropdownTrigger>
            )}
            actions={getAvailableActions()}
            opts={{
              id: `webcam-${stream.userId}-dropdown-menu`,
              keepMounted: true,
              transitionDuration: 0,
              elevation: 3,
              getcontentanchorel: null,
              fullwidth: 'true',
              anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
              transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
              container: isFullscreenContext ? videoContainer?.current : document.body,
            }}
          />
        )
        : (
          <Styled.Dropdown $isFirefox={isFirefox}>
            <Styled.UserName $noMenu={numOfStreams < 3}>
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

export default UserActions;
