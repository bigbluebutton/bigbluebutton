import React, {
  memo,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { SidekickAreaOptionsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/enums';
import {
  RemoveGenericContentSidekickAreaBadgeCommandArguments,
  RenameGenericContentSidekickAreaCommandArguments,
  SetGenericContentSidekickAreaBadgeCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/types';
import AppItem from '/imports/ui/components/apps-gallery/app-item/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import Styled from './styles';

interface ExternalAppItemProps {
  appKey: string;
  dataTest?: string;
  name: string;
  icon: PluginIconType;
  isPinned: boolean;
  onClick?: (() => void) | undefined;
  pinnedAppsLength: number;
  maxPinned: number;
  setError: (v: boolean) => void;
  pinTooltip: string;
  unpinTooltip: string;
  isNew?: boolean;
}

const ExternalAppItem: React.FC<ExternalAppItemProps> = ({
  appKey,
  dataTest,
  name,
  icon,
  isPinned,
  onClick,
  pinnedAppsLength,
  maxPinned,
  setError,
  pinTooltip,
  unpinTooltip,
  isNew = false,
}) => {
  const [nameReplacement, setNameReplacement] = useState<string>(name);
  const [badgeContent, setBadgeContent] = useState<string | null>(null);
  const extractedId = useMemo(
    () => appKey.replace(PANELS.GENERIC_CONTENT_SIDEKICK, ''),
    [appKey],
  );

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
    <AppItem
      appKey={appKey}
      dataTest={`apps_gallery_item_${dataTest}`}
      name={nameReplacement}
      icon={icon}
      isPinned={isPinned}
      onClick={onClick}
      pinnedAppsLength={pinnedAppsLength}
      maxPinned={maxPinned}
      setError={setError}
      pinTooltip={pinTooltip}
      unpinTooltip={unpinTooltip}
      isNew={isNew}
    >
      {badgeContent && (
        <Styled.BadgeCircle>{badgeContent}</Styled.BadgeCircle>
      )}
    </AppItem>
  );
};

export default memo(ExternalAppItem);
