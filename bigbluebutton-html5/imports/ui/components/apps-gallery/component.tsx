import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { AppsGalleryProps } from './types';
import { PANELS } from '/imports/ui/components/layout/enums';
import { InjectedAppGalleryItem } from '/imports/ui/components/layout/layoutTypes';
import Styled from './styles';
import AppItem from './app-item/component';
import ExternalAppItem from './external-app-item/component';
import { isPluginNew } from './service';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';
import PanelHeader from '/imports/ui/components/common/panel-header/component';
import Icon from '/imports/ui/components/common/icon/component';

const intlMessages = defineMessages({
  appsGalleryTitle: {
    id: 'app.appsGallery.title',
    description: 'Label for the apps gallery panel title',
  },
  minimize: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Label for the minimize apps gallery button',
  },
  pinnedApps: {
    id: 'app.appsGallery.maxpinnedApps',
    description: 'Apps panel text that informs users about max current pinned apps and maximum allowed pinned apps',
  },
  pinnedAppsContinue: {
    id: 'app.appsGallery.maxpinnedAppsContinue',
    description: 'Last part of warning about pinned apps',
  },
  pinTooltip: {
    id: 'app.appsGallery.pinTooltip',
    description: 'Tooltip of the pin button',
  },
  unpinTooltip: {
    id: 'app.appsGallery.unpinTooltip',
    description: 'Tooltip of the unpin buuton',
  },
  searchPlaceholder: {
    id: 'app.appsGallery.searchPlaceholder',
    description: 'Placeholder text for the apps gallery search input',
  },
});

const AppsGallery: React.FC<AppsGalleryProps> = ({ registeredApps, pinnedApps }) => {
  const MAX_PINNED_APPS_GALLERY = window.meetingClientSettings.public.app.appsGallery.maxPinnedApps;
  const intl = useIntl();
  const title = intl.formatMessage(intlMessages.appsGalleryTitle);
  const [searchQuery, setSearchQuery] = useState('');
  const [meetingSettings] = useMeetingSettings();
  const appsToLabelAsNew = meetingSettings?.public?.sidebarNavigation?.appsToLabelAsNew || [];
  const shouldAddIsNewLabel = useCallback((id: string) => appsToLabelAsNew.includes(id), [appsToLabelAsNew]);

  const pinTooltip = intl.formatMessage(intlMessages.pinTooltip);
  const unpinTooltip = intl.formatMessage(intlMessages.unpinTooltip);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const renderAppItem = (appKey: string, isPinned: boolean) => {
    const {
      name,
      icon,
      dataTest,
      pluginName,
    } = registeredApps[appKey];

    const isNew = isPluginNew(pluginName) || shouldAddIsNewLabel(appKey);
    const { onClick } = registeredApps[appKey] as InjectedAppGalleryItem;
    const isPluginInjectedApp = appKey.startsWith(PANELS.GENERIC_CONTENT_SIDEKICK);
    const Component = isPluginInjectedApp ? ExternalAppItem : AppItem;

    return (
      <Component
        key={`${appKey}${isPinned}`}
        dataTest={dataTest}
        appKey={appKey}
        name={name}
        icon={icon}
        isPinned={isPinned}
        isNew={isNew}
        onClick={onClick}
        pinTooltip={pinTooltip}
        unpinTooltip={unpinTooltip}
      />
    );
  };

  const renderedPinnedApps = useMemo(() => (
    [...pinnedApps]
      .sort((a, b) => registeredApps[a].name.localeCompare(registeredApps[b].name))
      .filter((key) => !normalizedQuery || registeredApps[key].name.toLowerCase().includes(normalizedQuery))
      .map((key) => renderAppItem(key, true))
  ), [registeredApps, pinnedApps, normalizedQuery, pinTooltip, unpinTooltip, shouldAddIsNewLabel]);

  const renderedUnpinnedApps = useMemo(() => {
    const unpinnedKeys = Object.keys(registeredApps)
      .filter((key) => !pinnedApps.includes(key))
      .filter((key) => !normalizedQuery || registeredApps[key].name.toLowerCase().includes(normalizedQuery));

    const isNewApp = (key: string) => isPluginNew(registeredApps[key].pluginName) || shouldAddIsNewLabel(key);

    const newApps = unpinnedKeys
      .filter((key) => isNewApp(key))
      .sort((a, b) => registeredApps[a].name.localeCompare(registeredApps[b].name));

    const regularApps = unpinnedKeys
      .filter((key) => !isNewApp(key))
      .sort((a, b) => registeredApps[a].name.localeCompare(registeredApps[b].name));

    return [...newApps, ...regularApps].map((key) => renderAppItem(key, false));
  }, [registeredApps, pinnedApps, normalizedQuery, pinTooltip, unpinTooltip, shouldAddIsNewLabel]);

  return (
    <>
      <PanelHeader
        panelId={PANELS.APPS_GALLERY}
        title={title}
        dataTest="appsGalleryTitle"
        closeButtonDataTest="hideAppsGallery"
      />
      <Styled.Separator />

      <Styled.SearchWrapper>
        <Icon iconName="search" />
        <Styled.SearchInput
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={intl.formatMessage(intlMessages.searchPlaceholder)}
          aria-label={intl.formatMessage(intlMessages.searchPlaceholder)}
        />
      </Styled.SearchWrapper>

      <Styled.DescWrapper>
        <Styled.BoldText>
          {intl.formatMessage(
            intlMessages.pinnedApps,
            { pinnedCount: pinnedApps.length, maxPinned: MAX_PINNED_APPS_GALLERY },
          )}
        </Styled.BoldText>
        {intl.formatMessage(intlMessages.pinnedAppsContinue)}
      </Styled.DescWrapper>
      <Styled.Wrapper id="scroll-box">
        {renderedPinnedApps.length > 0 && (
          <Styled.PinnedAppsWrapper>
            {renderedPinnedApps}
          </Styled.PinnedAppsWrapper>
        )}
        {renderedPinnedApps.length > 0 && renderedUnpinnedApps.length > 0 && (
          <Styled.SectionSeparator />
        )}
        {renderedUnpinnedApps.length > 0 && (
          <Styled.UnpinnedAppsWrapper>
            {renderedUnpinnedApps}
          </Styled.UnpinnedAppsWrapper>
        )}
      </Styled.Wrapper>
    </>
  );
};

export default memo(AppsGallery);
