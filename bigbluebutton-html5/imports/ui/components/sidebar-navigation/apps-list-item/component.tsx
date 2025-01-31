import React from 'react';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import { PANELS, ACTIONS } from '../../layout/enums';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import Styled from '../styles';

const intlMessages = defineMessages({
  wigetsLabel: {
    id: 'app.userList.appsTitle',
    description: 'Title for the apps panel',
  },
});

const AppsListItem = () => {
  const CURRENT_PANEL = PANELS.APPS_GALLERY;
  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  const toggleAppsGalleryPanel = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== CURRENT_PANEL,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === CURRENT_PANEL
        ? PANELS.NONE
        : CURRENT_PANEL,
    });
  };

  const label = intl.formatMessage(intlMessages.wigetsLabel);

  return (
    <TooltipContainer
      title={label}
      position="right"
    >
      <Styled.ListItem
        id="apps-gallery-toggle-button"
        aria-label={label}
        aria-describedby="appsGallery"
        active={sidebarContentPanel === CURRENT_PANEL}
        role="button"
        tabIndex={0}
        data-test="appsGallerySidebarButton"
        onClick={toggleAppsGalleryPanel}
        // @ts-ignore
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleAppsGalleryPanel();
          }
        }}
      >
        <Icon iconName="widgets" />
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default AppsListItem;
