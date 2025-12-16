import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { UserCameraHelperButton } from 'bigbluebutton-html-plugin-sdk';
import Styled from './styles';
import BBBMenu from '/imports/ui/components/common/menu/component';

const intlMessages = defineMessages({
  seeMoreItems: {
    id: 'app.videoDock.plugin.helpers.seeMoreItems',
  },
});

interface PluginMenuActionsProps {
  pluginCameraHelperItems: UserCameraHelperButton[];
  userId: string;
  streamId: string;
  isRTL: boolean;
}

interface ActionItem {
  key: string;
  label: string;
  icon: string;
  description: string;
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const PluginMenuActions: React.FC<PluginMenuActionsProps> = (props) => {
  const {
    pluginCameraHelperItems,
    streamId, userId, isRTL,
  } = props;

  const intl = useIntl();

  const getAvailableActions = () => {
    const menuItems: ActionItem[] = [];

    pluginCameraHelperItems.filter((pluginItem) => {
      return pluginItem.displayFunction ? pluginItem.displayFunction({
        streamId, userId,
      }) : true;
    }).forEach((pluginItem) => {
      menuItems.push({
        key: pluginItem.id,
        label: pluginItem.label,
        icon: pluginItem.icon,
        description: pluginItem.tooltip,
        disabled: pluginItem.disabled,
        onClick: (event: React.MouseEvent<HTMLElement>) => pluginItem.onClick({
          userId,
          streamId,
          browserClickEvent: event,
        }),
      });
    });
    return menuItems;
  };

  return (
    <Styled.MenuWrapper
      dark
    >
      <BBBMenu
        actions={getAvailableActions()}
        trigger={(
          <Styled.OptionsButton
            label={intl.formatMessage(intlMessages.seeMoreItems)}
            aria-label={intl.formatMessage(intlMessages.seeMoreItems)}
            icon="more"
            hideLabel
            size="sm"
          />
        )}
        opts={{
          id: `webcam-${userId}-dropdown-menu`,
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getContentAnchorEl: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
          transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
        }}
      />
    </Styled.MenuWrapper>
  );
};

export default PluginMenuActions;
