import React from 'react';
import Styled from './styles';
import { GenericSidekickContentProps } from '../types';
import GenericContentItem from '../generic-content-item/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import PanelHeader from '/imports/ui/components/common/panel-header/component';

const GenericSidekickContent: React.FC<GenericSidekickContentProps> = ({
  renderFunction,
  genericContentId,
  genericContentLabel,
  dataTest,
}) => {
  return (
    <Styled.PanelContent
      data-test={genericContentId}
    >
      <PanelHeader
        panelId={PANELS.GENERIC_CONTENT_SIDEKICK + genericContentId}
        title={genericContentLabel}
        dataTest={`sidekick_header_${dataTest}`}
        closeButtonDataTest={`hide_${genericContentId}`}
      />
      <Styled.Separator />
      <Styled.Container>
        <GenericContentItem
          dataTest={dataTest}
          key={genericContentId}
          renderFunction={renderFunction}
        />
      </Styled.Container>
    </Styled.PanelContent>
  );
};

export default GenericSidekickContent;
