import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Styled from './styles';

const COLORS = [
  'default', 'primary', 'danger', 'success',
];

const propTypes = {
  color: PropTypes.string,
};

const intlMessages = defineMessages({
  reloadPage: {
    id: 'app.errorBoundary.reloadPage',
    defaultMessage: 'Reload Page',
  },
});

const NotificationsBar = ({
  color = 'default',
  children,
  alert,
  showReloadButton,
}) => {
  const hasColor = COLORS.includes(color);
  const intl = useIntl();
  const reloadButton = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <Styled.NotificationsBar
      data-test="notificationBannerBar"
      role={alert ? 'alert' : ''}
      aria-live="off"
      style={
        !hasColor ? {
          backgroundColor: `${color}`,
        } : {}
      }
      color={color}
    >
      <>
        {children}
        {
          showReloadButton && (
            <Styled.ReloadButton
              onClick={reloadButton}
              data-test="notificationBannerReloadButton"
              color="primary"
              label={intl.formatMessage(intlMessages.reloadPage)}
              aria-label={intl.formatMessage(intlMessages.reloadPage)}
              aria-describedby="notificationBannerReloadButton"
            />
          )
        }
      </>
    </Styled.NotificationsBar>
  );
};

NotificationsBar.propTypes = propTypes;

export default injectWbResizeEvent(NotificationsBar);
