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
};

const defaultProps = {
  dark: false,
  bottom: false,
  isIphone: false,
  isFullscreen: false,
  elementName: '',
  className: '',
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
  fullscreenRef,
  handleToggleFullScreen,
  isIphone,
  isFullscreen,
  layoutManagerLoaded,
  newLayoutContextDispatch,
  currentElement,
  currentGroup,
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
    if (layoutManagerLoaded === 'legacy') {
      handleToggleFullScreen(fullscreenRef);
    } else {
      const newElement = (elementId === currentElement) ? '' : elementId;
      const newGroup = (elementGroup === currentGroup) ? '' : elementGroup;

      newLayoutContextDispatch({
        type: ACTIONS.SET_FULLSCREEN_ELEMENT,
        value: {
          element: newElement,
          group: newGroup,
        },
      });
    }
  };

  return (
    <div className={wrapperClassName}>
      <Button
        color="default"
        icon={!isFullscreen ? 'fullscreen' : 'exit_fullscreen'}
        size="sm"
        onClick={() => handleClick()}
        label={formattedLabel(isFullscreen)}
        hideLabel
        className={cx(styles.button, styles.fullScreenButton, className)}
        data-test="presentationFullscreenButton"
      />
    </div>
  );
};

FullscreenButtonComponent.propTypes = propTypes;
FullscreenButtonComponent.defaultProps = defaultProps;

export default injectIntl(FullscreenButtonComponent);
