import React, { memo, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { AppsGalleryProps } from './types';
import Icon from '/imports/ui/components/common/icon/component';
import { layoutDispatch, layoutSelect } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import Styled from './styles';
import TooManypinnedAppsModal from './modal/component';

const intlMessages = defineMessages({
  appsGalleryTitle: {
    id: 'app.appsGallery.title',
    description: 'Label for the apps gallery panel title',
  },
  closeAppsGalleryLabel: {
    id: 'app.appsGallery.close',
    description: 'Label for the close apps gallery button',
  },
  pinnedApps: {
    id: 'app.appsGallery.maxpinnedApps',
    description: 'Apps panel text that informs users about max current pinned apps and maximum allowed pinned apps',
  },
  pinnedAppsContinue: {
    id: 'app.appsGallery.maxpinnedAppsContinue',
    description: 'Last part of warning about pinned apps',
  },
});

const AppsGallery: React.FC<AppsGalleryProps> = ({ registeredApps, pinnedApps }) => {
  const MAX_PINNED_APPS_GALLERY = window.meetingClientSettings.public.app.appsGallery.maxPinnedApps;
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const intl = useIntl();
  const title = intl.formatMessage(intlMessages.appsGalleryTitle);
  const [error, setError] = useState(false);

  const renderApp = (appKey: string, name: string, icon: string, isPinned: boolean) => {
    const togglePinApp = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (!isPinned && pinnedApps.length >= MAX_PINNED_APPS_GALLERY) {
        setError(true);
        return;
      }
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_APP,
        value: {
          panel: appKey,
          pin: !isPinned,
        },
      });
    };
    const openAppPanel = () => {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: appKey,
      });
    };
    return (
      <Styled.RegisteredAppWrapper
        onClick={openAppPanel}
      >
        <Styled.OpenButton
          key={`OPEN${appKey}`}
          color="primary"
          type="button"
          onClick={openAppPanel}
          icon={icon}
          pinned={isPinned}
        />
        <Styled.RegisteredAppContent>
          <Styled.AppTitle>
            {name}
          </Styled.AppTitle>
          <Styled.PinApp
            key={`PIN${appKey}`}
            role="button"
            onClick={togglePinApp}
            onKeyDown={togglePinApp}
            tabIndex={0}
            pinned={isPinned}
          >
            <Icon iconName={isPinned ? 'pin-video_on' : 'pin-video_off'} />
          </Styled.PinApp>
        </Styled.RegisteredAppContent>
      </Styled.RegisteredAppWrapper>
    );
  };

  const renderedpinnedApps = useMemo(() => (
    pinnedApps.map((pinnedAppKey) => {
      const { name, icon } = registeredApps[pinnedAppKey];
      return renderApp(pinnedAppKey, name, icon, true);
    })
  ), [registeredApps, pinnedApps]);

  const renderedUnpinnedApps = useMemo(() => (
    Object.keys(registeredApps)
      .filter((registeredObjectKey) => !pinnedApps.includes(registeredObjectKey))
      .map((unpinnedAppKey) => {
        const { name, icon } = registeredApps[unpinnedAppKey];
        return renderApp(unpinnedAppKey, name, icon, false);
      })
  ), [registeredApps, pinnedApps]);

  return (
    <Styled.PanelContent>
      { error && (
        <TooManypinnedAppsModal
          setError={setError}
          pinnedAppsNumber={pinnedApps.length}
        />
      )}
      <Styled.HeaderContainer
        isRTL={isRTL}
        data-test="appsGalleryTitle"
        title={title}
        leftButtonProps={{}}
        rightButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.closeAppsGalleryLabel),
          'data-test': 'hideAppsGallery',
          icon: 'close',
          label: intl.formatMessage(intlMessages.closeAppsGalleryLabel),
          onClick: () => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.NONE,
            });
          },
        }}
        customRightButton={null}
      />
      <Styled.Separator />

      <Styled.Wrapper>
        <Styled.PinnedAppsWrapper>
          <div>
            <Styled.BoldText>
              {intl.formatMessage(intlMessages.pinnedApps, { 0: pinnedApps.length, 1: MAX_PINNED_APPS_GALLERY })}
            </Styled.BoldText>
            {intl.formatMessage(intlMessages.pinnedAppsContinue)}
          </div>
          {renderedpinnedApps}
        </Styled.PinnedAppsWrapper>
        <Styled.UnpinnedAppsWrapper>
          {renderedUnpinnedApps}
        </Styled.UnpinnedAppsWrapper>
      </Styled.Wrapper>
    </Styled.PanelContent>
  );
};

export default memo(AppsGallery);
