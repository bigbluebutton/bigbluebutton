import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  RenameGenericContentSidekickAreaCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/types';
import { SidekickAreaOptionsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/enums';
import { PinnedAppProps } from '../types';
import PinnedAppBase from '../pinned-app-list-item/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import NotificationBadgeStyled from '/imports/ui/components/common/notification-badge/styles';
import { useGenericContentBadge } from '/imports/ui/core/local-states/useGenericContentBadges';

const ExternalPinnedApp: React.FC<PinnedAppProps> = (props) => {
  const {
    appKey,
    appInfo,
    isOpened,
  } = props;
  const { name } = appInfo;
  const [nameReplacement, setNameReplacement] = useState<string>(name);
  const extractedId = useMemo(() => (appKey.replace(PANELS.GENERIC_CONTENT_SIDEKICK, '')), [appKey]);
  const badgeContent = useGenericContentBadge(extractedId);
  const modifiedAppInfo = useMemo(() => ({
    ...appInfo,
    name: nameReplacement,
  }), [appInfo, nameReplacement]);

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

    return () => {
      window.removeEventListener(
        SidekickAreaOptionsEnum.RENAME_GENERIC_CONTENT_MENU,
        handleGenericContentRename,
      );
    };
  }, [handleGenericContentRename]);

  return (
    <PinnedAppBase
      appKey={appKey}
      appInfo={modifiedAppInfo}
      isOpened={isOpened}
    >
      {badgeContent && (
        <NotificationBadgeStyled.NotificationBadge $anchored data-test={`${appKey}Badge`}>
          {badgeContent}
        </NotificationBadgeStyled.NotificationBadge>
      )}
    </PinnedAppBase>
  );
};

export default memo(ExternalPinnedApp);
