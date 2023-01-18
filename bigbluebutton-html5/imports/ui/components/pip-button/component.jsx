import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';

const intlMessages = defineMessages({
  pictureInPictureButton: {
    id: 'app.pictureInPictureButton.label',
    description: 'Picture-in-Picture label',
  },
  pictureInPictureUndoButton: {
    id: 'app.pictureInPictureUndoButton.label',
    description: 'Undo Picture-in-Picture label',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isIphone: PropTypes.bool,
  dark: PropTypes.bool,
  bottom: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
  isInPictureInPictureMode: PropTypes.bool.isRequired,
  togglePictureInPictureMode: PropTypes.func.isRequired,
};

const defaultProps = {
  isIphone: false,
  dark: false,
  bottom: false,
  className: '',
  color: 'default',
};

const PictureInPictureButtonComponent = ({
  intl,
  dark,
  color,
  bottom,
  isIphone,
  className,
  togglePictureInPictureMode,
  isInPictureInPictureMode,
}) => {
  const formattedLabel = (isInPictureInPicture) => (isInPictureInPicture
    ? intl.formatMessage(intlMessages.pictureInPictureUndoButton)
    : intl.formatMessage(intlMessages.pictureInPictureButton)
  );

  const handleClick = () => {
    togglePictureInPictureMode();
  };

  return (
    <Styled.Wrapper
      dark={dark}
      light={!dark}
      bottom={bottom}
      top={!bottom}
      right={isIphone}
    >
      <Styled.PipButton
        icon={isInPictureInPictureMode ? 'video_off' : 'video'}
        color={color || 'default'}
        size="sm"
        onClick={() => handleClick()}
        label={formattedLabel(isInPictureInPictureMode)}
        hideLabel
        className={className}
        data-test="screensharePictureInPictureModeButton"
      />
    </Styled.Wrapper>
  );
};

PictureInPictureButtonComponent.propTypes = propTypes;
PictureInPictureButtonComponent.defaultProps = defaultProps;

export default injectIntl(PictureInPictureButtonComponent);
