import * as React from 'react';
import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import Icon from '/imports/ui/components/common/icon/component';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { SidekickAreaOptionsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/enums';
import { RemoveGenericContentSidekickAreaBadgeCommandArguments, RenameGenericContentSidekickAreaCommandArguments, SetGenericContentSidekickAreaBadgeCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/types';
import Styled from './styles';

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
  const [nameReplacement, setNameReplacement] = useState(genericContentSidekickAreaObject.name);
  const [badgeContent, setBadgeContent] = useState<string | null>(null);

  useEffect(() => {
    if (genericContentSidekickAreaObject.name !== nameReplacement) {
      setNameReplacement(genericContentSidekickAreaObject.name);
    }
  }, [genericContentSidekickAreaObject]);

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

  const handleGenericContentSetBadge = ((ev: CustomEvent<SetGenericContentSidekickAreaBadgeCommandArguments>) => {
    const {
      id: genericContentId,
      badgeContent,
    } = ev.detail;
    if (genericContentId === genericContentSidekickAreaObject.id) {
      setBadgeContent(badgeContent);
    }
  }) as EventListener;

  const handleGenericContentRemoveBadge = ((ev: CustomEvent<RemoveGenericContentSidekickAreaBadgeCommandArguments>) => {
    const {
      id: genericContentId,
    } = ev.detail;
    if (genericContentId === genericContentSidekickAreaObject.id) {
      setBadgeContent(null);
    }
  }) as EventListener;

  const handleGenericContentRename = ((ev: CustomEvent<RenameGenericContentSidekickAreaCommandArguments>) => {
    const {
      id: genericContentId,
      newName,
    } = ev.detail;
    if (genericContentId === genericContentSidekickAreaObject.id) {
      setNameReplacement(newName);
    }
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(
      SidekickAreaOptionsEnum.RENAME_GENERIC_CONTENT_MENU,
      handleGenericContentRename,
    );
    window.addEventListener(
      SidekickAreaOptionsEnum.SET_GENERIC_CONTENT_BADGE,
      handleGenericContentSetBadge,
    );
    window.addEventListener(
      SidekickAreaOptionsEnum.REMOVE_GENERIC_CONTENT_BADGE,
      handleGenericContentRemoveBadge,
    );

    return () => {
      window.removeEventListener(
        SidekickAreaOptionsEnum.RENAME_GENERIC_CONTENT_MENU,
        handleGenericContentRename,
      );
      window.removeEventListener(
        SidekickAreaOptionsEnum.SET_GENERIC_CONTENT_BADGE,
        handleGenericContentSetBadge,
      );
      window.removeEventListener(
        SidekickAreaOptionsEnum.REMOVE_GENERIC_CONTENT_BADGE,
        handleGenericContentRemoveBadge,
      );
    };
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
            {nameReplacement}
          </span>
          {
            badgeContent
              && (
                <Styled.GenericContentBadge>
                  <Styled.GenericContentBadgeText>
                    {badgeContent}
                  </Styled.GenericContentBadgeText>
                </Styled.GenericContentBadge>
              )
          }
        </Styled.ListItem>
      </Styled.List>
    </Styled.ScrollableList>
  );
};

export default GenericContentSidekickAreaMenuItem;
