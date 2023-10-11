import React from 'react';
import PropTypes from 'prop-types';
import PresentationContainer from '../container';

const PresentationArea = ({
  width,
  height,
  presentationIsOpen,
  darkTheme,
  layoutType,
  setPresentationFitToWidth,
  fitToWidth,
}) => {
  const presentationAreaSize = {
    presentationAreaWidth: width,
    presentationAreaHeight: height,
  };
  return (
    <PresentationContainer
      podId="DEFAULT_PRESENTATION_POD"
      {
      ...{
        presentationAreaSize,
        presentationIsOpen,
        darkTheme,
        layoutType,
        setPresentationFitToWidth,
        fitToWidth,
      }
      } />
  );
};

export default PresentationArea;

PresentationArea.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  presentationIsOpen: PropTypes.bool.isRequired,
  darkTheme: PropTypes.bool.isRequired,
};
