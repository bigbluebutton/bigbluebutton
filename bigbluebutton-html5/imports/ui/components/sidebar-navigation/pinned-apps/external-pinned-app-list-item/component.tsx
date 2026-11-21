import React, { memo, useMemo } from 'react';
import { PinnedAppProps } from '../types';
import PinnedAppBase from '../pinned-app-list-item/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import NotificationBadgeStyled from '/imports/ui/components/common/notification-badge/styles';
import { useGenericContentBadge } from '/imports/ui/core/local-states/useGenericContentBadges';
import { useGenericContentMenuName } from '/imports/ui/core/local-states/useGenericContentMenuNames';

const ExternalPinnedApp: React.FC<PinnedAppProps> = (props) => {
  const {
    appKey,
    appInfo,
    isOpened,
  } = props;
  const { name } = appInfo;
  const extractedId = appKey.replace(PANELS.GENERIC_CONTENT_SIDEKICK, '');
  const badgeContent = useGenericContentBadge(extractedId);
  const nameReplacement = useGenericContentMenuName(extractedId) ?? name;
  const modifiedAppInfo = useMemo(() => ({
    ...appInfo,
    name: nameReplacement,
  }), [appInfo, nameReplacement]);

  return (
    <PinnedAppBase
      appKey={appKey}
      appInfo={modifiedAppInfo}
      isOpened={isOpened}
    >
      {badgeContent && (
        <NotificationBadgeStyled.NotificationBadge $anchored data-test={`${appKey}Badge`}>
          <NotificationBadgeStyled.NotificationBadgeLabel>
            {badgeContent}
          </NotificationBadgeStyled.NotificationBadgeLabel>
        </NotificationBadgeStyled.NotificationBadge>
      )}
    </PinnedAppBase>
  );
};

export default memo(ExternalPinnedApp);
