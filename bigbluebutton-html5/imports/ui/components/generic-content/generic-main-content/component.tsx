import React from 'react';
import * as Styled from '../styles';
import { GenericContentMainAreaProps } from '../types';
import GenericContentItem from '../generic-content-item/component';

const GenericMainContent: React.FC<GenericContentMainAreaProps> = ({
  isResizing,
  isLocalChange,
  isMinimized,
  renderFunctionComponents,
  genericContentId,
}) => {
  const componentToRender = renderFunctionComponents.filter((g) => genericContentId === g.id)[0];
  let dataTest: string = genericContentId;
  if (componentToRender) {
    dataTest = componentToRender.dataTest;
  }
  return (
    <Styled.Container
      data-layout-region="generic-content"
      preventInteraction={isResizing && isLocalChange}
      data-test={`container-${dataTest}`}
      isMinimized={isMinimized}
    >
      <GenericContentItem
        dataTest={dataTest}
        key={componentToRender?.id}
        renderFunction={componentToRender?.contentFunction}
      />
    </Styled.Container>
  );
};

export default GenericMainContent;
