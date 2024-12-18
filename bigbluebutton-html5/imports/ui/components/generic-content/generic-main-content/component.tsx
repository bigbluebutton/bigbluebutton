import React from 'react';
import * as Styled from '../styles';
import { GenericContentMainAreaProps } from '../types';
import GenericContentItem from '../generic-content-item/component';

const GenericMainContent: React.FC<GenericContentMainAreaProps> = ({
  isResizing,
  genericContentLayoutInformation,
  renderFunctionComponents,
  genericContentId,
}) => {
  const {
    height,
    width,
    top,
    left,
    right,
  } = genericContentLayoutInformation;

  const isMinimized = width === 0 && height === 0;

  const componentToRender = renderFunctionComponents.filter((g) => genericContentId === g.id);
  return (
    <Styled.Container
      style={{
        height,
        width,
        top,
        left,
        right,
      }}
      isResizing={isResizing}
      isMinimized={isMinimized}
    >
      <GenericContentItem
        key={componentToRender[0]?.id}
        renderFunction={componentToRender[0]?.contentFunction}
      />
    </Styled.Container>
  );
};

export default GenericMainContent;
