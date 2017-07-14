import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import TextShapeService from './service.js';
import TextDrawComponent from './component';

class TextDrawContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TextDrawComponent {...this.props} />
    );
  }
}

export default createContainer((params) => {
  const isPresenter = TextShapeService.isPresenter();
  const activeTextShapeId = TextShapeService.activeTextShapeId();
  let isActive = false;

  if(isPresenter && activeTextShapeId == params.shape.id) {
    isActive = true;
  }
  return {
    isActive: isActive,
    setTextShapeValue: TextShapeService.setTextShapeValue,
  }
}, TextDrawContainer);
