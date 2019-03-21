import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { styles } from './styles';

const intlMessages = defineMessages({
  fullscreenButton: {
    id: 'app.fullscreenButton.label',
    description: 'Fullscreen label',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  dark: PropTypes.bool,
  elementName: PropTypes.string,
};

const defaultProps = {
  dark: false,
  elementName: '',
};

const FullscreenButtonComponent = ({
  intl,
  dark,
  elementName,
  tooltipDistance,
  isFullscreen,
  elementRef,
  isWebcam,
  isScreenShare,
}) => {
  const formattedLabel = intl.formatMessage(
    intlMessages.fullscreenButton,
    ({ 0: elementName || '' }),
  );

  const wrapperClassName = cx({
    [styles.wrapper]: true,
    [styles.top]: isWebcam,
    [styles.bottom]: !isWebcam || isScreenShare,
    [styles.dark]: dark || isFullscreen,
    [styles.light]: !dark && !isFullscreen,
    [styles.bg_dark]: (isWebcam || isScreenShare) && !isFullscreen,
    [styles.bg_light]: (isWebcam || isScreenShare) && isFullscreen,
  });

  const toggleFullScreen = () => {
    const element = elementRef;

    if (!element) return;

    if (document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }

      // If the page is not currently fullscreen, make fullscreen
    } else if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
      element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  return (
    <div className={wrapperClassName}>
      <Button
        color="default"
        icon={!isFullscreen ? 'fullscreen' : 'exit_fullscreen'}
        size="sm"
        onClick={toggleFullScreen}
        label={formattedLabel}
        hideLabel
        className={cx(styles.button, styles.fullScreenButton)}
        tooltipDistance={tooltipDistance}
      />
    </div>
  );
};

FullscreenButtonComponent.propTypes = propTypes;
FullscreenButtonComponent.defaultProps = defaultProps;

export default injectIntl(FullscreenButtonComponent);
