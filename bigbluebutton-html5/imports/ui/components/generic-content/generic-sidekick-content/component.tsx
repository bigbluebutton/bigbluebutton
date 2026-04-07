import React from 'react';
import Styled from './styles';
import { GenericSidekickContentProps } from '../types';
import GenericContentItem from '../generic-content-item/component';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';

const GenericSidekickContent: React.FC<GenericSidekickContentProps> = ({
  renderFunction,
  layoutContextDispatch,
  genericContentId,
  genericContentLabel,
  dataTest,
}) => (
  <Styled.Container>
    <Styled.Header
      data-test={`sidekick_header_${dataTest}`}
      leftButtonProps={{
        onClick: () => {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: false,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.NONE,
          });
        },
        'data-test': `hide_${genericContentId}`,
        'aria-label': genericContentLabel,
        label: genericContentLabel,
      }}
      customRightButton={null}
    />
    <GenericContentItem
      dataTest={dataTest}
      key={genericContentId}
      renderFunction={renderFunction}
    />
  </Styled.Container>
);

export default GenericSidekickContent;
