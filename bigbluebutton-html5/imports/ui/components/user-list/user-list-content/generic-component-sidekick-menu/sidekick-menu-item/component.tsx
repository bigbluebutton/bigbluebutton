import React, { useEffect, useRef } from 'react';
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
    sidebarContentPanelIsOpen,
  } = props;
  const unmountVariables = useRef<{ currentSidekickContent: string, sidebarContentPanel: string }>({
    currentSidekickContent: '',
    sidebarContentPanel: '',
  });
  unmountVariables.current = { currentSidekickContent, sidebarContentPanel };
  const unmountFunction = () => {
    const {
      currentSidekickContent: refCurrentSidekickContent,
      sidebarContentPanel: refSidebarContentPanel,
    } = unmountVariables.current;
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
    if (open && sidebarContentPanelIsOpen) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: sidebarContentPanel !== PANELS.GENERIC_COMPONENT_SIDEKICK_CONTENT,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: sidebarContentPanel === PANELS.GENERIC_COMPONENT_SIDEKICK_CONTENT
          ? PANELS.NONE
          : PANELS.GENERIC_COMPONENT_SIDEKICK_CONTENT,
        genericComponentSidekickContentId: sidekickContentId,
      });
    }
    return unmountFunction;
  }, []);

  return (
    <Styled.Messages>
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
    </Styled.Messages>
  );
};

export default SidekickContentMenuItem;
