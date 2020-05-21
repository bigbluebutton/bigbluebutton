import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import browser from 'browser-detect';
import Button from '/imports/ui/components/button/component';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import cx from 'classnames';
import Modal from '/imports/ui/components/modal/simple/component';
import { withModalMounter } from '../../modal/service';
import { styles } from '../styles';
import ScreenshareBridgeService from '/imports/api/screenshare/client/bridge/service';

const propTypes = {
  intl: intlShape.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  handleShareScreen: PropTypes.func.isRequired,
  handleUnshareScreen: PropTypes.func.isRequired,
  isVideoBroadcasting: PropTypes.bool.isRequired,
  screenSharingCheck: PropTypes.bool.isRequired,
  screenShareEndAlert: PropTypes.func.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
  screenshareDataSavingSetting: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  desktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.desktopShareLabel',
    description: 'Desktop Share option label',
  },
  lockedDesktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.lockedDesktopShareLabel',
    description: 'Desktop locked Share option label',
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
  genericError: {
    id: 'app.screenshare.genericError',
    description: 'error message for when screensharing fails with unknown error',
  },
  NotAllowedError: {
    id: 'app.screenshare.notAllowed',
    description: 'error message when screen access was not granted',
  },
  NotSupportedError: {
    id: 'app.screenshare.notSupportedError',
    description: 'error message when trying to share screen in unsafe environments',
  },
  screenShareNotSupported: {
    id: 'app.media.screenshare.notSupported',
    descriptions: 'error message when trying share screen on unsupported browsers',
  },
  screenShareUnavailable: {
    id: 'app.media.screenshare.unavailable',
    descriptions: 'title for unavailable screen share modal',
  },
  NotReadableError: {
    id: 'app.screenshare.notReadableError',
    description: 'error message when the browser failed to capture the screen',
  },
  1108: {
    id: 'app.deskshare.iceConnectionStateError',
    description: 'Error message for ice connection state failure',
  },
  2000: {
    id: 'app.sfu.mediaServerConnectionError2000',
    description: 'Error message fired when the SFU cannot connect to the media server',
  },
  2001: {
    id: 'app.sfu.mediaServerOffline2001',
    description: 'error message when SFU is offline',
  },
  2002: {
    id: 'app.sfu.mediaServerNoResources2002',
    description: 'Error message fired when the media server lacks disk, CPU or FDs',
  },
  2003: {
    id: 'app.sfu.mediaServerRequestTimeout2003',
    description: 'Error message fired when requests are timing out due to lack of resources',
  },
  2021: {
    id: 'app.sfu.serverIceGatheringFailed2021',
    description: 'Error message fired when the server cannot enact ICE gathering',
  },
  2022: {
    id: 'app.sfu.serverIceStateFailed2022',
    description: 'Error message fired when the server endpoint transitioned to a FAILED ICE state',
  },
  2200: {
    id: 'app.sfu.mediaGenericError2200',
    description: 'Error message fired when the SFU component generated a generic error',
  },
  2202: {
    id: 'app.sfu.invalidSdp2202',
    description: 'Error message fired when the clients provides an invalid SDP',
  },
  2203: {
    id: 'app.sfu.noAvailableCodec2203',
    description: 'Error message fired when the server has no available codec for the client',
  },
});

const BROWSER_RESULTS = browser();
const isMobileBrowser = (BROWSER_RESULTS ? BROWSER_RESULTS.mobile : false)
  || (BROWSER_RESULTS && BROWSER_RESULTS.os
    ? BROWSER_RESULTS.os.includes('Android') // mobile flag doesn't always work
    : false);
const IS_SAFARI = BROWSER_RESULTS.name === 'safari';

const DesktopShare = ({
  intl,
  handleShareScreen,
  handleUnshareScreen,
  isVideoBroadcasting,
  amIPresenter,
  screenSharingCheck,
  screenShareEndAlert,
  isMeteorConnected,
  screenshareDataSavingSetting,
  mountModal,
}) => {
  // This is the failure callback that will be passed to the /api/screenshare/kurento.js
  // script on the presenter's call
  const onFail = (normalizedError) => {
    const { errorCode, errorMessage, errorReason } = normalizedError;
    const error = errorCode || errorMessage || errorReason;
    // We have a properly mapped error for this. Exit screenshare and show  a toast notification
    if (intlMessages[error]) {
      window.kurentoExitScreenShare();
      notify(intl.formatMessage(intlMessages[error]), 'error', 'desktop');
    } else {
      // Unmapped error. Log it (so we can infer what's going on), close screenSharing
      // session and display generic error message
      logger.error({
        logCode: 'screenshare_default_error',
        extraInfo: {
          errorCode, errorMessage, errorReason,
        },
      }, 'Default error handler for screenshare');
      window.kurentoExitScreenShare();
      notify(intl.formatMessage(intlMessages.genericError), 'error', 'desktop');
    }
    // Don't trigger the screen share end alert if presenter click to cancel on screen share dialog
    if (error !== 'NotAllowedError') {
      screenShareEndAlert();
    }
  };

  const screenshareLocked = screenshareDataSavingSetting
    ? intlMessages.desktopShareLabel : intlMessages.lockedDesktopShareLabel;

  const vLabel = isVideoBroadcasting
    ? intlMessages.stopDesktopShareLabel : screenshareLocked;

  const vDescr = isVideoBroadcasting
    ? intlMessages.stopDesktopShareDesc : intlMessages.desktopShareDesc;

  const shouldAllowScreensharing = screenSharingCheck
    && !isMobileBrowser
    && amIPresenter;

  return shouldAllowScreensharing
    ? (
      <Button
        className={cx(styles.button, isVideoBroadcasting || styles.btn)}
        disabled={(!isMeteorConnected && !isVideoBroadcasting) || !screenshareDataSavingSetting}
        icon={isVideoBroadcasting ? 'desktop' : 'desktop_off'}
        label={intl.formatMessage(vLabel)}
        description={intl.formatMessage(vDescr)}
        color={isVideoBroadcasting ? 'primary' : 'default'}
        ghost={!isVideoBroadcasting}
        hideLabel
        circle
        size="lg"
        onClick={isVideoBroadcasting ? handleUnshareScreen : () => {
          if (IS_SAFARI && !ScreenshareBridgeService.hasDisplayMedia) {
            return mountModal(<Modal
              overlayClassName={styles.overlay}
              className={styles.modal}
              onRequestClose={() => mountModal(null)}
              hideBorder
              contentLabel={intl.formatMessage(intlMessages.screenShareUnavailable)}
            >
              <h3 className={styles.title}>
                {intl.formatMessage(intlMessages.screenShareUnavailable)}
              </h3>
              <p>{intl.formatMessage(intlMessages.screenShareNotSupported)}</p>
                              </Modal>);
          }
          handleShareScreen(onFail);
        }
        }
        id={isVideoBroadcasting ? 'unshare-screen-button' : 'share-screen-button'}
      />
    ) : null;
};

DesktopShare.propTypes = propTypes;
export default withModalMounter(injectIntl(memo(DesktopShare)));
