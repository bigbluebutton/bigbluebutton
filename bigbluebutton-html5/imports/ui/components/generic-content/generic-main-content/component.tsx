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

  const componentToRender = renderFunctionComponents.filter((g) => genericContentId === g.id)[0];
  const { dataTest } = componentToRender;
  return (
    <Styled.Container
      style={{
        height,
        width,
        top,
        left,
        right,
      }}
      dataTest={dataTest}
      isResizing={isResizing}
      isMinimized={isMinimized}
    >
      <GenericContentItem
        key={componentToRender?.id}
        renderFunction={componentToRender?.contentFunction}
      />
    </Styled.Container>
  );
};

export default GenericMainContent;
