import React, { memo, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { AppsGalleryProps } from './types';
import Icon from '/imports/ui/components/common/icon/component';
import { layoutDispatch, layoutSelect } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { InjectedAppGalleryItem, Layout } from '/imports/ui/components/layout/layoutTypes';
import Styled from './styles';
import TooManyPinnedAppsModal from './modal/component';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

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
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const intl = useIntl();
  const title = intl.formatMessage(intlMessages.appsGalleryTitle);
  const [error, setError] = useState(false);

  const renderApp = (
    appKey: string,
    name: string,
    icon: string,
    isPinned: boolean,
    onClick?: undefined | (() => void),
  ) => {
    const togglePinApp = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (!isPinned && pinnedApps.length >= MAX_PINNED_APPS_GALLERY) {
        setError(true);
        return;
      }
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_APP,
        value: {
          id: appKey,
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
    const functionToBeCalled = typeof onClick === 'function' ? onClick : openAppPanel;
    return (
      <Styled.RegisteredAppContent
        key={`${appKey}${isPinned}`}
      >
        <Styled.ClickableArea
          onClick={functionToBeCalled}
        >
          <Styled.OpenButton
            key={`OPEN${appKey}`}
            color="primary"
            type="button"
            icon={icon}
            $pinned={isPinned}
          />
          <Styled.AppTitle>
            {name}
          </Styled.AppTitle>
        </Styled.ClickableArea>
        <TooltipContainer
          title={isPinned
            ? intl.formatMessage(intlMessages.unpinTooltip)
            : intl.formatMessage(intlMessages.pinTooltip)}
        >
          <Styled.PinApp
            role="button"
            onClick={togglePinApp}
            tabIndex={0}
            pinned={isPinned}
          >
            <Icon iconName={isPinned ? 'pin-video_on' : 'pin-video_off'} />
          </Styled.PinApp>
        </TooltipContainer>
      </Styled.RegisteredAppContent>
    );
  };

  const renderedPinnedApps = useMemo(() => (
    pinnedApps.map((pinnedAppKey) => {
      const { name, icon } = registeredApps[pinnedAppKey];
      // type guard
      const { onClick } = registeredApps[pinnedAppKey] as InjectedAppGalleryItem;
      return renderApp(pinnedAppKey, name, icon, true, onClick);
    })
  ), [registeredApps, pinnedApps]);

  const renderedUnpinnedApps = useMemo(() => (
    Object.keys(registeredApps)
      .filter((registeredObjectKey) => !pinnedApps.includes(registeredObjectKey))
      .map((unpinnedAppKey) => {
        const { name, icon } = registeredApps[unpinnedAppKey];
        // type guard
        const { onClick } = registeredApps[unpinnedAppKey] as InjectedAppGalleryItem;
        return renderApp(unpinnedAppKey, name, icon, false, onClick);
      })
  ), [registeredApps, pinnedApps]);

  return (
    <>
      { error && (
        <TooManyPinnedAppsModal
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
          'aria-label': intl.formatMessage(intlMessages.minimize, { 0: intl.formatMessage(intlMessages.appsGalleryTitle) }),
          'data-test': 'hideAppsGallery',
          icon: 'minus',
          label: intl.formatMessage(intlMessages.minimize, { 0: intl.formatMessage(intlMessages.appsGalleryTitle) }),
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

      <Styled.DescWrapper>
        <Styled.BoldText>
          {intl.formatMessage(intlMessages.pinnedApps, { 0: pinnedApps.length, 1: MAX_PINNED_APPS_GALLERY })}
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
