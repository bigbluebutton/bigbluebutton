import React, { useEffect, useRef } from 'react';
import {
  SidekickContentCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-content/enums';
import Styled from './styles';
import { ACTIONS, PANELS } from '../../../../layout/enums';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { SidekickContentMenuItemProps } from './types';

const SidekickContentMenuItem = (props: SidekickContentMenuItemProps) => {
  const {
    sidebarContentPanel,
    layoutContextDispatch,
    contentMessage,
    iconName,
    sidekickContentId,
    open,
    currentSidekickContent,
  } = props;
  const unmountVariables = useRef<{ currentSidekickContent: string, sidebarContentPanel: string }>({
    currentSidekickContent: '',
    sidebarContentPanel: '',
  });

  const handleMinimizeContent = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  };

  unmountVariables.current = { currentSidekickContent, sidebarContentPanel };
  const unmountFunction = () => {
    const {
      currentSidekickContent: refCurrentSidekickContent,
      sidebarContentPanel: refSidebarContentPanel,
    } = unmountVariables.current;
    window.removeEventListener(SidekickContentCommandsEnum.MINIMIZE_CURRENT_PANEL, handleMinimizeContent);
    const closeGenericComponentSidekickContent = refCurrentSidekickContent === sidekickContentId
      && refSidebarContentPanel === PANELS.GENERIC_COMPONENT_SIDEKICK_CONTENT;
    if (closeGenericComponentSidekickContent) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.NONE,
      });
    }
  };

  useEffect(() => {
    window.addEventListener(SidekickContentCommandsEnum.MINIMIZE_CURRENT_PANEL, handleMinimizeContent);
    if (open) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.GENERIC_COMPONENT_SIDEKICK_CONTENT,
        genericComponentSidekickContentId: sidekickContentId,
      });
    }
    return unmountFunction;
  }, []);

  return (
    <Styled.MenuItemsWrapper>
      <Styled.ScrollableList>
        <Styled.List>
          <Styled.ListItem
            role="button"
            tabIndex={0}
            onClick={() => {
              let sidebarContentIsOpenValue = true;
              let sidebarContentPannelValue = PANELS.GENERIC_COMPONENT_SIDEKICK_CONTENT;
              let sideBarContentId: string | undefined = sidekickContentId;
              if (currentSidekickContent === sidekickContentId
                && sidebarContentPanel === PANELS.GENERIC_COMPONENT_SIDEKICK_CONTENT) {
                sidebarContentIsOpenValue = false;
                sidebarContentPannelValue = PANELS.NONE;
                sideBarContentId = undefined;
              }
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: sidebarContentIsOpenValue,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: sidebarContentPannelValue,
                genericComponentSidekickContentId: sideBarContentId,
              });
            }}
          >
            <Icon iconName={iconName} />
            <span>
              {contentMessage}
            </span>
          </Styled.ListItem>
        </Styled.List>
      </Styled.ScrollableList>
    </Styled.MenuItemsWrapper>
  );
};

export default SidekickContentMenuItem;
