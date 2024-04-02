import React from 'react';
import * as Styled from './styles';
import { GenericComponentProps } from './types';
import GenericComponentItem from './generic-component-item/component';

const GenericComponentContent: React.FC<GenericComponentProps> = ({
  isResizing,
  genericComponentLayoutInformation,
  renderFunctionComponents,
  genericComponentId,
}) => {
  const {
    height,
    width,
    top,
    left,
    right,
  } = genericComponentLayoutInformation;

  const isMinimized = width === 0 && height === 0;

  const componentToRender = renderFunctionComponents.filter((g) => genericComponentId === g.id);
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
      <GenericComponentItem
        key={componentToRender[0]?.id}
        renderFunction={componentToRender[0]?.contentFunction}
      />
    </Styled.Container>
  );
};

export default GenericComponentContent;
