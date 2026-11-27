import React, { useId } from 'react';
import KEYS from '/imports/utils/keys';
import Styles from './styles';

interface ExternalVideoOverlayProps {
  label: string;
  keyboardHint: string;
  // ArrowUp/ArrowDown only lead somewhere when the volume slider is rendered,
  // so the hint is announced only then.
  hasVolumeControl: boolean;
  onVerticalArrow?: () => void;
}

const ExternalVideoOverlay: React.FC<ExternalVideoOverlayProps> = (props) => {
  const {
    label,
    keyboardHint,
    hasVolumeControl,
    onVerticalArrow,
  } = props;
  const hintId = useId();

  return (
    <>
      <Styles.ExternalVideoOverlay
        id="external-video-overlay"
        role="group"
        aria-label={label}
        aria-describedby={hasVolumeControl ? hintId : undefined}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;

          if ([KEYS.ARROW_DOWN, KEYS.ARROW_UP].includes(e.key)) {
            onVerticalArrow?.();
          }
        }}
      />
      {hasVolumeControl && (
        <Styles.KeyboardHint id={hintId}>{keyboardHint}</Styles.KeyboardHint>
      )}
    </>
  );
};

export default ExternalVideoOverlay;
