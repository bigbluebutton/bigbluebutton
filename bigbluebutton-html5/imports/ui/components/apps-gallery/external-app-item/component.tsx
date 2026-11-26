import React, { memo } from 'react';
import AppItem from '/imports/ui/components/apps-gallery/app-item/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import NotificationBadgeStyled from '/imports/ui/components/common/notification-badge/styles';
import { useGenericContentBadge } from '/imports/ui/core/local-states/useGenericContentBadges';
import { useGenericContentMenuName } from '/imports/ui/core/local-states/useGenericContentMenuNames';
import { APPS_GALLERY_VIEW_MODE, AppsGalleryViewModeType } from '../types';

interface ExternalAppItemProps {
  appKey: string;
  dataTest?: string;
  name: string;
  icon: PluginIconType;
  isPinned: boolean;
  onClick?: (() => void) | undefined;
  pinTooltip: string;
  unpinTooltip: string;
  isNew?: boolean;
  viewMode?: AppsGalleryViewModeType;
}

const ExternalAppItem: React.FC<ExternalAppItemProps> = ({
  appKey,
  dataTest,
  name,
  icon,
  isPinned,
  onClick,
  pinTooltip,
  unpinTooltip,
  isNew = false,
  viewMode = APPS_GALLERY_VIEW_MODE.LIST,
}) => {
  const extractedId = appKey.replace(PANELS.GENERIC_CONTENT_SIDEKICK, '');
  const badgeContent = useGenericContentBadge(extractedId);
  const nameReplacement = useGenericContentMenuName(extractedId) ?? name;

  return (
    <AppItem
      appKey={appKey}
      dataTest={`apps_gallery_item_${dataTest}`}
      name={nameReplacement}
      icon={icon}
      isPinned={isPinned}
      onClick={onClick}
      pinTooltip={pinTooltip}
      unpinTooltip={unpinTooltip}
      isNew={isNew}
      viewMode={viewMode}
    >
      {badgeContent && (
        <NotificationBadgeStyled.NotificationBadge data-test={`${appKey}GalleryBadge`}>
          <NotificationBadgeStyled.NotificationBadgeLabel>
            {badgeContent}
          </NotificationBadgeStyled.NotificationBadgeLabel>
        </NotificationBadgeStyled.NotificationBadge>
      )}
    </AppItem>
  );
};

export default memo(ExternalAppItem);
