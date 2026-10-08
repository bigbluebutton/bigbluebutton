// Stands in for the shared AudioAutoplayPrompt. It keeps the one detail that
// matters to these tests: the "Play audio" control's onClick is wired straight
// to the handleAllowAutoplay prop, so whatever that prop is receives the click
// event as its first argument.
import React from 'react';

const AudioAutoplayPrompt = ({ handleAllowAutoplay, disabled }) => React.createElement(
  'button',
  { type: 'button', disabled, onClick: handleAllowAutoplay, 'data-test': 'playAudioButton' },
  'Play audio',
);

export default AudioAutoplayPrompt;
