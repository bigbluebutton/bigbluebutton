import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import PanelHeader from '/imports/ui/components/common/panel-header/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import Styled from './styles';

const intlMessages = defineMessages({
  appsGalleryTitle: {
    id: 'app.appsGallery.title',
    description: 'Label for the apps gallery panel title',
  },
  multifunctionalPanelTitle: {
    id: 'app.emptyPanel.multifunctionalPanelTitle',
    description: 'Title for the empty multifunctional panel',
  },
  multifunctionalTitle: {
    id: 'app.emptyPanel.multifunctionalTitle',
    description: 'Title shown in the empty panel body',
  },
  multifunctionalDescription: {
    id: 'app.emptyPanel.multifunctionalDescription',
    description: 'Description shown in the empty panel body',
  },
  minimize: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Generic minimize label for panels',
  },
});

const EmptyPanel: React.FC = () => {
  const intl = useIntl();

  return (
    <>
      <PanelHeader
        title=""
        panelId={PANELS.NONE}
        dataTest="emptyPanelTitle"
        closeButtonDataTest="emptyPanelCloseButton"
        closeButtonLabel={
          intl.formatMessage(
            intlMessages.minimize,
            { panelName: intl.formatMessage(intlMessages.multifunctionalPanelTitle) },
          )
        }
      />
      <Styled.PanelContent>
        <Styled.Icon iconName="add_column" />
        <Styled.WrapText>
          <Styled.BodyTitle>
            {intl.formatMessage(intlMessages.multifunctionalTitle)}
          </Styled.BodyTitle>
          <Styled.BodyDescription>
            {intl.formatMessage(intlMessages.multifunctionalDescription)}
          </Styled.BodyDescription>
        </Styled.WrapText>
      </Styled.PanelContent>
    </>
  );
};

export default memo(EmptyPanel);
