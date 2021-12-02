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
        customIcon={(
          isInPictureInPictureMode
            ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M21 3a1 1 0 0 1 1 1v7h-2V5H4v14h6v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zm0 10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h8zm-9.5-6L9.457 9.043l2.25 2.25-1.414 1.414-2.25-2.25L6 12.5V7h5.5z" fill="rgba(255,255,255,1)" />
              </svg>
            )
            : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M21 3a1 1 0 0 1 1 1v7h-2V5H4v14h6v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zm0 10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h8zM6.707 6.293l2.25 2.25L11 6.5V12H5.5l2.043-2.043-2.25-2.25 1.414-1.414z" fill="rgba(255,255,255,1)" />
              </svg>
            )
        )}
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
