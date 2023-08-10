import React from 'react';
import PropTypes from 'prop-types';
import { layoutSelectOutput } from '../../layout/context';
import PresentationArea from './component';

const PresentationAreaContainer = ({ presentationIsOpen, darkTheme, setPresentationFitToWidth, fitToWidth }) => {
  const presentation = layoutSelectOutput((i) => i.presentation);

  return <PresentationArea {...{ ...presentation, presentationIsOpen, darkTheme, setPresentationFitToWidth, fitToWidth }} />;
};

export default PresentationAreaContainer;

PresentationAreaContainer.propTypes = {
  presentationIsOpen: PropTypes.bool.isRequired,
  darkTheme: PropTypes.bool.isRequired,
};
