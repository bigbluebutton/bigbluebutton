import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import browserInfo from '/imports/utils/browserInfo';
import VideoService from '/imports/ui/components/video-provider/service';
import BBBMenu from '/imports/ui/components/common/menu/component';
import PropTypes from 'prop-types';
import Styled from './styles';

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
});

const UserActions = (props) => {
  const {
    name, cameraId, numOfStreams, onHandleVideoFocus,
    user, focused, onHandleMirror, isRTL,
  } = props;

  const intl = useIntl();
  const enableVideoMenu = Meteor.settings.public.kurento.enableVideoMenu || false;
  const { isFirefox } = browserInfo;

  const getAvailableActions = () => {
    const pinned = user?.pin;
    const userId = user?.userId;
    const isPinnedIntlKey = !pinned ? 'pin' : 'unpin';
    const isFocusedIntlKey = !focused ? 'focus' : 'unfocus';

    const menuItems = [{
      key: `${cameraId}-mirror`,
      label: intl.formatMessage(intlMessages.mirrorLabel),
      description: intl.formatMessage(intlMessages.mirrorDesc),
      onClick: () => onHandleMirror(),
    }];

    if (numOfStreams > 2) {
      menuItems.push({
        key: `${cameraId}-focus`,
        label: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Desc`]),
        onClick: () => onHandleVideoFocus(cameraId),
      });
    }

    if (VideoService.isVideoPinEnabledForCurrentUser()) {
      menuItems.push({
        key: `${cameraId}-pin`,
        label: intl.formatMessage(intlMessages[`${isPinnedIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isPinnedIntlKey}Desc`]),
        onClick: () => VideoService.toggleVideoPin(userId, pinned),
      });
    }

    return menuItems;
  };

  return (
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
              id: 'default-dropdown-menu',
              keepMounted: true,
              transitionDuration: 0,
              elevation: 3,
              getContentAnchorEl: null,
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
};

export default UserActions;

UserActions.defaultProps = {
  focused: false,
};

UserActions.propTypes = {
  name: PropTypes.string.isRequired,
  cameraId: PropTypes.string.isRequired,
  numOfStreams: PropTypes.number.isRequired,
  onHandleVideoFocus: PropTypes.func.isRequired,
  user: PropTypes.shape({
    pin: PropTypes.bool.isRequired,
    userId: PropTypes.string.isRequired,
  }).isRequired,
  focused: PropTypes.bool,
  onHandleMirror: PropTypes.func.isRequired,
};
