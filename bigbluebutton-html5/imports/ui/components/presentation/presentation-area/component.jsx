import React from 'react';
import PropTypes from 'prop-types';
import PresentationPodsContainer from '../../presentation-pod/container';

const PresentationArea = ({
  width,
  height,
  presentationIsOpen,
  darkTheme,
  setPresentationFitToWidth,
  fitToWidth,
}) => {
  const presentationAreaSize = {
    presentationAreaWidth: width,
    presentationAreaHeight: height,
  };
  return (
    <PresentationPodsContainer {...{ presentationAreaSize, presentationIsOpen, darkTheme, setPresentationFitToWidth, fitToWidth }} />
  );
};

export default PresentationArea;

PresentationArea.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  presentationIsOpen: PropTypes.bool.isRequired,
  darkTheme: PropTypes.bool.isRequired,
};
