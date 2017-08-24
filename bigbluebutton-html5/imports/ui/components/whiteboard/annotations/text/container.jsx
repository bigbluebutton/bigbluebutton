import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import TextShapeService from './service';
import TextDrawComponent from './component';

const TextDrawContainer = ({ ...props }) => (
  <TextDrawComponent {...props} />
);

export default createContainer((params) => {
  const isPresenter = TextShapeService.isPresenter();
  const activeTextShapeId = TextShapeService.activeTextShapeId();
  let isActive = false;

  if (isPresenter && activeTextShapeId === params.annotation.id) {
    isActive = true;
  }
  return {
    isActive,
    setTextShapeValue: TextShapeService.setTextShapeValue,
    resetTextShapeActiveId: TextShapeService.resetTextShapeActiveId,
  };
}, TextDrawContainer);
