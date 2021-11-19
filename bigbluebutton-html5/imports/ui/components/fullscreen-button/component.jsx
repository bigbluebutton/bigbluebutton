import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';
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
  dark: PropTypes.bool,
  bottom: PropTypes.bool,
  isIphone: PropTypes.bool,
  isFullscreen: PropTypes.bool,
  elementName: PropTypes.string,
  color: PropTypes.string,
  fullScreenStyle: PropTypes.bool,
};

const defaultProps = {
  dark: false,
  bottom: false,
  isIphone: false,
  isFullscreen: false,
  elementName: '',
  color: 'default',
  fullScreenStyle: true,
};

const FullscreenButtonComponent = ({
  intl,
  dark,
  bottom,
  elementName,
  elementId,
  elementGroup,
  isIphone,
  isFullscreen,
  layoutContextDispatch,
  currentElement,
  currentGroup,
  color,
  fullScreenStyle,
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

  const handleClick = () => {
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

  return (
    <Styled.FullscreenButtonWrapper
      theme={dark ? 'dark' : 'light'}
      position={bottom ? 'bottom' : 'top'}
    >
      <Styled.FullscreenButton
        color={color || 'default'}
        icon={!isFullscreen ? 'fullscreen' : 'exit_fullscreen'}
        size="sm"
        onClick={() => handleClick()}
        label={formattedLabel(isFullscreen)}
        hideLabel
        isStyled={fullScreenStyle}
        data-test="presentationFullscreenButton"
      />
    </Styled.FullscreenButtonWrapper>
  );
};

FullscreenButtonComponent.propTypes = propTypes;
FullscreenButtonComponent.defaultProps = defaultProps;

export default injectIntl(FullscreenButtonComponent);
