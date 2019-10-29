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
  fullscreenRef: PropTypes.instanceOf(Element),
  dark: PropTypes.bool,
  bottom: PropTypes.bool,
  isIphone: PropTypes.bool,
  isFullscreen: PropTypes.bool,
  elementName: PropTypes.string,
  className: PropTypes.string,
  handleToggleFullScreen: PropTypes.func.isRequired,
  tooltipDistance: PropTypes.number,
};

const defaultProps = {
  dark: false,
  bottom: false,
  isIphone: false,
  isFullscreen: false,
  elementName: '',
  className: '',
  fullscreenRef: null,
  tooltipDistance: -1,
};

const FullscreenButtonComponent = ({
  intl,
  dark,
  bottom,
  elementName,
  tooltipDistance,
  className,
  fullscreenRef,
  handleToggleFullScreen,
  isIphone,
  isFullscreen,
}) => {
  if (isIphone) return null;

  const formattedLabel = intl.formatMessage(
    intlMessages.fullscreenButton,
    ({ 0: elementName || '' }),
  );

  const wrapperClassName = cx({
    [styles.wrapper]: true,
    [styles.dark]: dark,
    [styles.light]: !dark,
    [styles.top]: !bottom,
    [styles.bottom]: bottom,
  });

  return (
    <div className={wrapperClassName}>
      <Button
        color="default"
        icon={!isFullscreen ? 'fullscreen' : 'exit_fullscreen'}
        size="sm"
        onClick={() => handleToggleFullScreen(fullscreenRef)}
        label={formattedLabel}
        hideLabel
        className={cx(styles.button, styles.fullScreenButton, className)}
        tooltipDistance={tooltipDistance}
        data-test="presentationFullscreenButton"
      />
    </div>
  );
};

FullscreenButtonComponent.propTypes = propTypes;
FullscreenButtonComponent.defaultProps = defaultProps;

export default injectIntl(FullscreenButtonComponent);
