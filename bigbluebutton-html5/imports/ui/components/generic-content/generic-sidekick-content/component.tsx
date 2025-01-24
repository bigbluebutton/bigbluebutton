import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import Styled from './styles';
import { GenericSidekickContentProps } from '../types';
import GenericContentItem from '../generic-content-item/component';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';

const intlMessages = defineMessages({
  hidePanelLabel: {
    id: 'app.sidebarContent.hidePanelLabel',
    description: 'Generic label of hide panel',
  },
});

const GenericSidekickContent: React.FC<GenericSidekickContentProps> = ({
  renderFunction,
  layoutContextDispatch,
  genericContentId,
  genericContentLabel,
}) => {
  const intl = useIntl();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  return (
    <Styled.PanelContent
      data-test={genericContentId}
    >
      <Styled.HeaderContainer
        isRTL={isRTL}
        data-test={genericContentId}
        title={genericContentLabel}
        rightButtonProps={{
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
          icon: 'minus',
          label: intl.formatMessage(intlMessages.hidePanelLabel, { 0: genericContentLabel }),
        }}
      />
      <Styled.Separator />
      <Styled.Container>
        <GenericContentItem
          key={genericContentId}
          renderFunction={renderFunction}
        />
      </Styled.Container>
    </Styled.PanelContent>
  );
};

export default GenericSidekickContent;
