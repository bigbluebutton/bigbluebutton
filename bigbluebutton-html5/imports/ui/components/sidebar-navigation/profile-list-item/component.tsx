import React from 'react';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import { PANELS, ACTIONS } from '../../layout/enums';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import Styled from '../styles';

const intlMessages = defineMessages({
  profileLabel: {
    id: 'app.userList.profileTitle',
    description: 'Title for the profile panel',
  },
});

const ProfileListItem = () => {
  const CURRENT_PANEL = PANELS.PROFILE;
  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  const toggleProfilePanel = () => {
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

  const label = intl.formatMessage(intlMessages.profileLabel);

  return (
    <TooltipContainer
      title={label}
      position="right"
    >
      <Styled.ListItem
        id="profile-toggle-button"
        aria-label={label}
        aria-describedby="profile"
        active={sidebarContentPanel === CURRENT_PANEL}
        role="button"
        tabIndex={0}
        data-test="profileSidebarButton"
        onClick={toggleProfilePanel}
        // @ts-ignore
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleProfilePanel();
          }
        }}
      >
        <Icon iconName="user" />
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default ProfileListItem;
