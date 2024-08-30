import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import { useMutation } from '@apollo/client';
import Styled from './styles';
import ScreenshareBridgeService from '/imports/api/screenshare/client/bridge/service';
import {
  shareScreen,
  screenshareHasEnded,
  useIsCameraAsContentBroadcasting,
  useShowButtonForNonPresenters,
} from '/imports/ui/components/screenshare/service';
import { SCREENSHARING_ERRORS } from '/imports/api/screenshare/client/bridge/errors';
import Button from '/imports/ui/components/common/button/component';
import { EXTERNAL_VIDEO_STOP } from '../../external-video-player/mutations';

const { isMobile } = deviceInfo;
const { isSafari, isTabletApp } = browserInfo;

const propTypes = {
  intl: PropTypes.objectOf(Object).isRequired,
  enabled: PropTypes.bool.isRequired,
  amIPresenter: PropTypes.bool,
  isScreenBroadcasting: PropTypes.bool.isRequired,
  isScreenGloballyBroadcasting: PropTypes.bool.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  desktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.desktopShareLabel',
    description: 'Desktop Share option label',
  },
  stopDesktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareLabel',
    description: 'Stop Desktop Share option label',
  },
  desktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.desktopShareDesc',
    description: 'adds context to desktop share option',
  },
  stopDesktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareDesc',
    description: 'adds context to stop desktop share option',
  },
  lockedDesktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.lockedDesktopShareDesc',
    description: 'Desktop locked Share option desc',
  },
  notPresenterDesktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.notPresenterDesktopShareLabel',
    description: 'You are not the presenter label',
  },
  notPresenterDesktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.notPresenterDesktopShareDesc',
    description: 'You are not the presenter desc',
  },
  screenShareNotSupported: {
    id: 'app.media.screenshare.notSupported',
    descriptions: 'error message when trying share screen on unsupported browsers',
  },
  screenShareUnavailable: {
    id: 'app.media.screenshare.unavailable',
    descriptions: 'title for unavailable screen share modal',
  },
  finalError: {
    id: 'app.screenshare.screenshareFinalError',
    description: 'Screen sharing failures with no recovery procedure',
  },
  retryError: {
    id: 'app.screenshare.screenshareRetryError',
    description: 'Screen sharing failures where a retry is recommended',
  },
  retryOtherEnvError: {
    id: 'app.screenshare.screenshareRetryOtherEnvError',
    description: 'Screen sharing failures where a retry in another environment is recommended',
  },
  unsupportedEnvError: {
    id: 'app.screenshare.screenshareUnsupportedEnv',
    description: 'Screen sharing is not supported, changing browser or device is recommended',
  },
  permissionError: {
    id: 'app.screenshare.screensharePermissionError',
    description: 'Screen sharing failure due to lack of permission',
  },
});

const getErrorLocale = (errorCode) => {
  switch (errorCode) {
    // Denied getDisplayMedia permission error
    case SCREENSHARING_ERRORS.NotAllowedError.errorCode:
      return intlMessages.permissionError;
    // Browser is supposed to be supported, but a browser-related error happening.
    // Suggest retrying in another device/browser/env
    case SCREENSHARING_ERRORS.AbortError.errorCode:
    case SCREENSHARING_ERRORS.InvalidStateError.errorCode:
    case SCREENSHARING_ERRORS.OverconstrainedError.errorCode:
    case SCREENSHARING_ERRORS.TypeError.errorCode:
    case SCREENSHARING_ERRORS.NotFoundError.errorCode:
    case SCREENSHARING_ERRORS.NotReadableError.errorCode:
    case SCREENSHARING_ERRORS.PEER_NEGOTIATION_FAILED.errorCode:
    case SCREENSHARING_ERRORS.SCREENSHARE_PLAY_FAILED.errorCode:
    case SCREENSHARING_ERRORS.MEDIA_NO_AVAILABLE_CODEC.errorCode:
    case SCREENSHARING_ERRORS.MEDIA_INVALID_SDP.errorCode:
      return intlMessages.retryOtherEnvError;
    // Fatal errors where a retry isn't warranted. This probably means the server
    // is misconfigured somehow or the provider is utterly botched, so nothing
    // the end user can do besides requesting support
    case SCREENSHARING_ERRORS.SIGNALLING_TRANSPORT_CONNECTION_FAILED.errorCode:
    case SCREENSHARING_ERRORS.MEDIA_SERVER_CONNECTION_ERROR.errorCode:
    case SCREENSHARING_ERRORS.SFU_INVALID_REQUEST.errorCode:
      return intlMessages.finalError;
    // Unsupported errors
    case SCREENSHARING_ERRORS.NotSupportedError.errorCode:
      return intlMessages.unsupportedEnvError;
    // Errors that should be silent/ignored. They WILL NOT be LOGGED nor NOTIFIED via toasts.
    case SCREENSHARING_ERRORS.ENDED_WHILE_STARTING.errorCode:
      return null;
    // Fall through: everything else is an error which might be solved with a retry
    default:
      return intlMessages.retryError;
  }
};

const ScreenshareButton = ({
  intl,
  enabled,
  isScreenBroadcasting,
  isScreenGloballyBroadcasting,
  amIPresenter = false,
  isMeteorConnected,
  screenshareDataSavingSetting,
}) => {
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);
  const isCameraAsContentBroadcasting = useIsCameraAsContentBroadcasting();

  const [isScreenshareUnavailableModalOpen, setScreenshareUnavailableModalIsOpen] = useState(false);

  // This is the failure callback that will be passed to the /api/screenshare/kurento.js
  // script on the presenter's call
  const handleFailure = (error) => {
    const {
      errorCode = SCREENSHARING_ERRORS.UNKNOWN_ERROR.errorCode,
      errorMessage = error.message,
    } = error;

    const localizedError = getErrorLocale(errorCode);

    if (localizedError) {
      notify(intl.formatMessage(localizedError, { 0: errorCode }), 'error', 'desktop');
      logger.error({
        logCode: 'screenshare_failed',
        extraInfo: { errorCode, errorMessage },
      }, `Screenshare failed: ${errorMessage} (code=${errorCode})`);
    }

    screenshareHasEnded();
  };

  const RenderScreenshareUnavailableModal = (otherProps) => (
    <Styled.ScreenShareModal
      hideBorder
      contentLabel={intl.formatMessage(intlMessages.screenShareUnavailable)}
      {...otherProps}
    >
      <Styled.Title>
        {intl.formatMessage(intlMessages.screenShareUnavailable)}
      </Styled.Title>
      <p>{intl.formatMessage(intlMessages.screenShareNotSupported)}</p>
    </Styled.ScreenShareModal>
  );

  const amIBroadcasting = isScreenBroadcasting && amIPresenter;

  // this part handles the label/desc intl for the screenshare button
  // basically: if you are not a presenter, the label/desc will be 'the screen cannot be shared'.
  // if you are: the label/desc intl will be 'stop/start screenshare'.
  let info = screenshareDataSavingSetting ? 'desktopShare' : 'lockedDesktopShare';
  if (!amIPresenter) {
    info = 'notPresenterDesktopShare';
  } else if (isScreenBroadcasting) {
    info = 'stopDesktopShare';
  }

  const showButtonForNonPresenters = useShowButtonForNonPresenters();

  const shouldAllowScreensharing = enabled
    && (!isMobile || isTabletApp)
    && (amIPresenter || showButtonForNonPresenters);

  const dataTest = isScreenBroadcasting ? 'stopScreenShare' : 'startScreenShare';
  const loading = isScreenBroadcasting && !isScreenGloballyBroadcasting;

  return (
    <>
      {
        shouldAllowScreensharing
          ? (
            <Styled.Container>
              <Button
                disabled={(!isMeteorConnected && !isScreenBroadcasting) || !screenshareDataSavingSetting || !amIPresenter}
                icon={amIBroadcasting ? 'desktop' : 'desktop_off'}
                data-test={dataTest}
                label={intl.formatMessage(intlMessages[`${info}Label`])}
                description={intl.formatMessage(intlMessages[`${info}Desc`])}
                color={amIBroadcasting ? 'primary' : 'default'}
                ghost={!amIBroadcasting}
                hideLabel
                circle
                size="lg"
                loading={loading}
                onClick={amIBroadcasting
                  ? screenshareHasEnded
                  : () => {
                    if (isSafari && !ScreenshareBridgeService.HAS_DISPLAY_MEDIA) {
                      setScreenshareUnavailableModalIsOpen(true);
                    } else {
                      // eslint-disable-next-line max-len
                      shareScreen(isCameraAsContentBroadcasting, stopExternalVideoShare, amIPresenter, handleFailure);
                    }
                  }}
                id={amIBroadcasting ? 'unshare-screen-button' : 'share-screen-button'}
              />
            </Styled.Container>
          ) : null
      }
      {
        isScreenshareUnavailableModalOpen ? (
          <RenderScreenshareUnavailableModal
            {...{
              onRequestClose: () => setScreenshareUnavailableModalIsOpen(false),
              priority: 'low',
              setIsOpen: setScreenshareUnavailableModalIsOpen,
              isOpen: isScreenshareUnavailableModalOpen,
            }}
          />
        ) : null
      }
    </>
  );
};

ScreenshareButton.propTypes = propTypes;
export default injectIntl(memo(ScreenshareButton));
