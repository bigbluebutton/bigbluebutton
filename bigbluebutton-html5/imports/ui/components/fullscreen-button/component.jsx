import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { styles } from './styles';
import { ACTIONS } from '../layout/enums';

const intlMessages = defineMessages({
  fullscreenButton: {
    id: 'app.fullscreenButton.label',
    description: 'Fullscreen label',
  },
  fullscreenUndoButton: {
    id: 'app.fullscreenUndoButton.label',
    description: 'Undo fullscreen label',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
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
  color: 'default',
  fullScreenStyle: true,
  fullscreenRef: null,
};

const FullscreenButtonComponent = ({
  intl,
  dark,
  bottom,
  elementName,
  elementId,
  elementGroup,
  className,
  isIphone,
  isFullscreen,
  layoutContextDispatch,
  currentElement,
  currentGroup,
  color,
  fullScreenStyle,
  fullscreenRef,
  handleToggleFullScreen,
}) => {
  if (isIphone) return null;

  const formattedLabel = (fullscreen) => (fullscreen
    ? intl.formatMessage(
      intlMessages.fullscreenUndoButton,
      ({ 0: elementName || '' }),
    )
    : intl.formatMessage(
      intlMessages.fullscreenButton,
      ({ 0: elementName || '' }),
    )
  );

  const wrapperClassName = cx({
    [styles.wrapper]: true,
    [styles.dark]: dark,
    [styles.light]: !dark,
    [styles.top]: !bottom,
    [styles.bottom]: bottom,
  });

  const handleClick = () => {
    handleToggleFullScreen(fullscreenRef);
    const newElement = (elementId === currentElement) ? '' : elementId;
    const newGroup = (elementGroup === currentGroup) ? '' : elementGroup;

    layoutContextDispatch({
      type: ACTIONS.SET_FULLSCREEN_ELEMENT,
      value: {
        element: newElement,
        group: newGroup,
      },
    });
  };

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
        onClick={() => handleClick()}
        label={formattedLabel(isFullscreen)}
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
