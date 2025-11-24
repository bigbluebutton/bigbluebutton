import React from 'react';
import KEY_CODES from '/imports/utils/keyCodes';
import Styles from './styles';

interface ExternalVideoOverlayProps {
  onVerticalArrow?: () => void;
}

const ExternalVideoOverlay: React.FC<ExternalVideoOverlayProps> = (props) => {
  const { onVerticalArrow } = props;

  return (
    <Styles.ExternalVideoOverlay
      id="external-video-overlay"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;

        if ([KEY_CODES.ARROW_DOWN, KEY_CODES.ARROW_UP].includes(e.keyCode)) {
          onVerticalArrow?.();
        }
      }}
    />
  );
};

export default ExternalVideoOverlay;
