import * as React from 'react';
import { useEffect } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import Icon from '/imports/ui/components/common/icon/component';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import Styled from '../styles';

interface GenericContentSidekickAreaMenuItemProps{
  sidebarContentPanel: string;
  genericSidekickContentId: string;
  genericContentSidekickAreaObject: PluginSdk.GenericContentSidekickArea;
  layoutContextDispatch: (...args: unknown[]) => void;
}

const GenericContentSidekickAreaMenuItem = ({
  sidebarContentPanel,
  genericSidekickContentId,
  genericContentSidekickAreaObject,
  layoutContextDispatch,
}: GenericContentSidekickAreaMenuItemProps) => {
  useEffect(() => {
    if (genericContentSidekickAreaObject.open) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: genericSidekickContentId,
      });
    }
  }, []);
  return (
    <Styled.ScrollableList>
      <Styled.List>
        <Styled.ListItem
          role="button"
          tabIndex={0}
          active={sidebarContentPanel === genericSidekickContentId}
          onClick={() => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: sidebarContentPanel !== genericSidekickContentId,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: sidebarContentPanel === genericSidekickContentId
                ? PANELS.NONE
                : genericSidekickContentId,
            });
          }}
        >
          <Icon iconName={genericContentSidekickAreaObject.buttonIcon} />
          <span>
            {genericContentSidekickAreaObject.name}
          </span>
        </Styled.ListItem>
      </Styled.List>
    </Styled.ScrollableList>
  );
};

export default GenericContentSidekickAreaMenuItem;
