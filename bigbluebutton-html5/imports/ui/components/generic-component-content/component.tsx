import React from 'react';
import * as Styled from './styles';
import { GenericComponentProps } from './types';
import GenericComponentItem from './generic-component-item/component';

const GenericComponentContent: React.FC<GenericComponentProps> = ({
  isResizing,
  genericComponentMainContentLayoutInformation,
  renderFunctionComponents,
  genericComponentMainContentId,
}) => {
  const {
    height,
    width,
    top,
    left,
    right,
  } = genericComponentMainContentLayoutInformation;

  const isMinimized = width === 0 && height === 0;

  const componentToRender = renderFunctionComponents.filter((g) => genericComponentMainContentId === g.id);
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
