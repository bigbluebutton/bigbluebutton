import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Styled from './styles';
import { layoutSelectInput } from '../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../layout/enums';

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
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
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
      isMobile={isMobile}
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
