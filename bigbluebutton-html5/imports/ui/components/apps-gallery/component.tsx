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
import TooManyPinnedAppsModal from './modal/component';
import AppItem from './app-item/component';
import ExternalAppItem from './external-app-item/component';
import { isPluginNew } from './service';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';
import PanelHeader from '/imports/ui/components/common/panel-header/component';

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
});

const AppsGallery: React.FC<AppsGalleryProps> = ({ registeredApps, pinnedApps }) => {
  const MAX_PINNED_APPS_GALLERY = window.meetingClientSettings.public.app.appsGallery.maxPinnedApps;
  const intl = useIntl();
  const title = intl.formatMessage(intlMessages.appsGalleryTitle);
  const [error, setError] = useState(false);
  const [meetingSettings] = useMeetingSettings();
  const appsToLabelAsNew = meetingSettings?.public?.sidebarNavigation?.appsToLabelAsNew || [];
  const shouldAddIsNewLabel = useCallback((id: string) => appsToLabelAsNew.includes(id), [appsToLabelAsNew]);

  const renderedPinnedApps = useMemo(() => (
    pinnedApps.map((pinnedAppKey) => {
      const {
        name,
        icon,
        dataTest,
        pluginName,
      } = registeredApps[pinnedAppKey];

      const isNew = isPluginNew(pluginName) || shouldAddIsNewLabel(pinnedAppKey);

      // type guard
      const { onClick } = registeredApps[pinnedAppKey] as InjectedAppGalleryItem;
      const isPluginInjectedApp = pinnedAppKey.startsWith(PANELS.GENERIC_CONTENT_SIDEKICK);
      const Component = isPluginInjectedApp ? ExternalAppItem : AppItem;
      return (
        <Component
          key={`${pinnedAppKey}true`}
          dataTest={dataTest}
          appKey={pinnedAppKey}
          name={name}
          icon={icon}
          isPinned
          isNew={isNew}
          onClick={onClick}
          pinnedAppsLength={pinnedApps.length}
          maxPinned={MAX_PINNED_APPS_GALLERY}
          setError={setError}
          pinTooltip={intl.formatMessage(intlMessages.pinTooltip)}
          unpinTooltip={intl.formatMessage(intlMessages.unpinTooltip)}
        />
      );
    })
  ), [registeredApps, pinnedApps, shouldAddIsNewLabel]);

  const renderedUnpinnedApps = useMemo(() => (
    Object.keys(registeredApps)
      .filter((registeredObjectKey) => !pinnedApps.includes(registeredObjectKey))
      .map((unpinnedAppKey) => {
        const {
          name,
          icon,
          dataTest,
          pluginName,
        } = registeredApps[unpinnedAppKey];

        const isNew = isPluginNew(pluginName) || shouldAddIsNewLabel(unpinnedAppKey);

        // type guard
        const { onClick } = registeredApps[unpinnedAppKey] as InjectedAppGalleryItem;
        const isPluginInjectedApp = unpinnedAppKey.startsWith(PANELS.GENERIC_CONTENT_SIDEKICK);
        const Component = isPluginInjectedApp ? ExternalAppItem : AppItem;
        return (
          <Component
            key={`${unpinnedAppKey}false`}
            dataTest={dataTest}
            appKey={unpinnedAppKey}
            name={name}
            icon={icon}
            isPinned={false}
            isNew={isNew}
            onClick={onClick}
            pinnedAppsLength={pinnedApps.length}
            maxPinned={MAX_PINNED_APPS_GALLERY}
            setError={setError}
            pinTooltip={intl.formatMessage(intlMessages.pinTooltip)}
            unpinTooltip={intl.formatMessage(intlMessages.unpinTooltip)}
          />
        );
      })
  ), [registeredApps, pinnedApps, shouldAddIsNewLabel]);

  return (
    <>
      { error && (
        <TooManyPinnedAppsModal
          setError={setError}
          pinnedAppsNumber={pinnedApps.length}
        />
      )}
      <PanelHeader
        panelId={PANELS.APPS_GALLERY}
        title={title}
        dataTest="appsGalleryTitle"
        closeButtonDataTest="hideAppsGallery"
      />
      <Styled.Separator />

      <Styled.DescWrapper>
        <Styled.BoldText>
          {intl.formatMessage(
            intlMessages.pinnedApps,
            { pinnedCount: pinnedApps.length, maxPinned: MAX_PINNED_APPS_GALLERY },
          )}
        </Styled.BoldText>
        {intl.formatMessage(intlMessages.pinnedAppsContinue)}
      </Styled.DescWrapper>
      <Styled.Wrapper
        id="scroll-box"
      >
        {renderedPinnedApps.length > 0 && (
          <Styled.PinnedAppsWrapper>
            {renderedPinnedApps}
          </Styled.PinnedAppsWrapper>
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
