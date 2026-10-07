import React, {
  memo,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { SidekickAreaOptionsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/enums';
import {
  RenameGenericContentSidekickAreaCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/types';
import AppItem from '/imports/ui/components/apps-gallery/app-item/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import Styled from './styles';
import { useGenericContentBadge } from '/imports/ui/core/local-states/useGenericContentBadges';
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
  const [nameReplacement, setNameReplacement] = useState<string>(name);
  const extractedId = useMemo(
    () => appKey.replace(PANELS.GENERIC_CONTENT_SIDEKICK, ''),
    [appKey],
  );
  const badgeContent = useGenericContentBadge(extractedId);

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
        <Styled.BadgeCircle>{badgeContent}</Styled.BadgeCircle>
      )}
    </AppItem>
  );
};

export default memo(ExternalAppItem);
