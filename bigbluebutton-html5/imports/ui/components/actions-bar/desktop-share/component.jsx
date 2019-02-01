import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import browser from 'browser-detect';
import Button from '/imports/ui/components/button/component';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import cx from 'classnames';
import { styles } from '../styles';

const propTypes = {
  intl: intlShape.isRequired,
  isUserPresenter: PropTypes.bool.isRequired,
  handleShareScreen: PropTypes.func.isRequired,
  handleUnshareScreen: PropTypes.func.isRequired,
  isVideoBroadcasting: PropTypes.bool.isRequired,
  screenSharingCheck: PropTypes.bool.isRequired,
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
  iceConnectionStateError: {
    id: 'app.deskshare.iceConnectionStateError',
    description: 'Error message for ice connection state failure',
  },
});

const BROWSER_RESULTS = browser();
const isMobileBrowser = (BROWSER_RESULTS ? BROWSER_RESULTS.mobile : false) ||
  (BROWSER_RESULTS && BROWSER_RESULTS.os ?
    BROWSER_RESULTS.os.includes('Android') : // mobile flag doesn't always work
    false);

const ICE_CONNECTION_FAILED = 'ICE connection failed';

const DesktopShare = ({
  intl,
  handleShareScreen,
  handleUnshareScreen,
  isVideoBroadcasting,
  isUserPresenter,
  screenSharingCheck,
}) => {
  const onFail = (error) => {
    switch (error) {
      case ICE_CONNECTION_FAILED:
        kurentoExitScreenShare();
        logger.error({ logCode: 'desktopshare_iceconnectionstate_error' }, 'ICE connection state error');
        notify(intl.formatMessage(intlMessages.iceConnectionStateError), 'error', 'desktop');
        break;
      default:
        logger.error({ logCode: 'desktopshare_default_error' }, error || 'Default error handler');
    }
  };
  return (screenSharingCheck && !isMobileBrowser && isUserPresenter ?
    <Button
      className={cx(styles.button, isVideoBroadcasting || styles.btn)}
      icon={isVideoBroadcasting ? 'desktop' : 'desktop_off'}
      label={intl.formatMessage(isVideoBroadcasting ?
          intlMessages.stopDesktopShareLabel : intlMessages.desktopShareLabel)}
      description={intl.formatMessage(isVideoBroadcasting ?
          intlMessages.stopDesktopShareDesc : intlMessages.desktopShareDesc)}
      color={isVideoBroadcasting ? 'primary' : 'default'}
      ghost={!isVideoBroadcasting}
      hideLabel
      circle
      size="lg"
      onClick={isVideoBroadcasting ? handleUnshareScreen : () => handleShareScreen(onFail)}
      id={isVideoBroadcasting ? 'unshare-screen-button' : 'share-screen-button'}
    />
    : null);
};

DesktopShare.propTypes = propTypes;
export default injectIntl(DesktopShare);
