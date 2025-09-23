import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  RemoveGenericContentSidekickAreaBadgeCommandArguments,
  RenameGenericContentSidekickAreaCommandArguments,
  SetGenericContentSidekickAreaBadgeCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/types';
import { SidekickAreaOptionsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/enums';
import { PinnedAppProps } from '../types';
import PinnedAppBase from '../pinned-app-list-item/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import Styled from '../../styles';

const ExternalPinnedApp: React.FC<PinnedAppProps> = (props) => {
  const {
    appKey,
    appInfo,
    active,
    onActivate,
  } = props;
  const { name } = appInfo;
  const [nameReplacement, setNameReplacement] = useState<string>(name);
  const [badgeContent, setBadgeContent] = useState<string | null>(null);
  const extractedId = useMemo(() => (appKey.replace(PANELS.GENERIC_CONTENT_SIDEKICK, '')), [appKey]);
  const modifiedAppInfo = useMemo(() => ({
    ...appInfo,
    name: nameReplacement,
  }), [appInfo, nameReplacement]);

  const handleGenericContentSetBadge = ((ev: CustomEvent<SetGenericContentSidekickAreaBadgeCommandArguments>) => {
    const {
      id: genericContentId,
      badgeContent,
    } = ev.detail;
    if (genericContentId === extractedId) {
      setBadgeContent(badgeContent);
    }
  }) as EventListener;

  const handleGenericContentRemoveBadge = ((ev: CustomEvent<RemoveGenericContentSidekickAreaBadgeCommandArguments>) => {
    const {
      id: genericContentId,
    } = ev.detail;
    if (genericContentId === extractedId) {
      setBadgeContent(null);
    }
  }) as EventListener;

  const handleGenericContentRename = ((ev: CustomEvent<RenameGenericContentSidekickAreaCommandArguments>) => {
    const {
      id: genericContentId,
      newName,
    } = ev.detail;
    if (genericContentId === extractedId) {
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
  }, [handleGenericContentRename, handleGenericContentSetBadge, handleGenericContentRemoveBadge]);

  return (
    <PinnedAppBase
      appKey={appKey}
      appInfo={modifiedAppInfo}
      active={active}
      onActivate={onActivate}
    >
      {badgeContent && (
        <Styled.BadgeCircle data-test={`${appKey}Badge`}>
          {badgeContent}
        </Styled.BadgeCircle>
      )}
    </PinnedAppBase>
  );
};

export default memo(ExternalPinnedApp);
