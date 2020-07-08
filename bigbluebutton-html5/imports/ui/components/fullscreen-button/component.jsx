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
  color: PropTypes.string,
  fullScreenStyle: PropTypes.bool,
};

const defaultProps = {
  dark: false,
  bottom: false,
  isIphone: false,
  isFullscreen: false,
  elementName: '',
  className: '',
  fullscreenRef: null,
  color: 'default',
  fullScreenStyle: true,
};

const FullscreenButtonComponent = ({
  intl,
  dark,
  bottom,
  elementName,
  className,
  fullscreenRef,
  handleToggleFullScreen,
  isIphone,
  isFullscreen,
  color,
  fullScreenStyle,
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

  const buttonClassName = cx({
    [styles.button]: fullScreenStyle,
    [styles.fullScreenButton]: fullScreenStyle,
    [className]: true,
  });

  return (
    <div className={wrapperClassName}>
      <Button
        color={color || 'default'}
        icon={!isFullscreen ? 'fullscreen' : 'exit_fullscreen'}
        size="sm"
        onClick={() => handleToggleFullScreen(fullscreenRef)}
        label={formattedLabel}
        hideLabel
        className={buttonClassName}
        data-test="presentationFullscreenButton"
      />
    </div>
  );
};

FullscreenButtonComponent.propTypes = propTypes;
FullscreenButtonComponent.defaultProps = defaultProps;

export default injectIntl(FullscreenButtonComponent);
