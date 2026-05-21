import React, { memo, ReactNode, useCallback } from 'react';
import Icon from '/imports/ui/components/common/icon/component';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { defineMessages, useIntl } from 'react-intl';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import Styled from '../styles';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import KEYS from '/imports/utils/keys';

interface AppItemProps {
  appKey: string;
  dataTest?: string;
  name: string;
  icon: PluginIconType;
  isPinned: boolean;
  isNew?: boolean;
  onClick?: (() => void) | undefined;
  pinTooltip: string;
  unpinTooltip: string;
  children?: ReactNode;
  viewMode?: 'list' | 'grid';
}

const intlMessages = defineMessages({
  newAppLabel: {
    id: 'app.appsGallery.newAppLabel',
    description: 'Label for inidicate new apps in gallery panel title',
  },
});

const resolveIcon = (iconProp: PluginIconType): React.ReactNode => {
  if (typeof iconProp === 'string') return <Icon iconName={iconProp} />;
  if (iconProp && 'iconName' in iconProp) return <Icon iconName={iconProp.iconName} />;
  if (iconProp && 'svgContent' in iconProp) return iconProp.svgContent as React.ReactNode;
  return null;
};

const AppItem: React.FC<AppItemProps> = ({
  appKey,
  dataTest,
  name,
  icon,
  isPinned,
  isNew = false,
  onClick,
  pinTooltip,
  unpinTooltip,
  children = null,
  viewMode = 'list',
}) => {
  const layoutContextDispatch = layoutDispatch();
  const intl = useIntl();

  const togglePinApp = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
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

  const handleClickableAreaKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
      e.preventDefault();
      functionToBeCalled();
    }
  }, [functionToBeCalled]);

  const handlePinKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
      e.preventDefault();
      togglePinApp(e);
    }
  }, [togglePinApp]);

  if (viewMode === 'grid') {
    return (
      <Styled.TileItem key={`${appKey}${isPinned}`} data-test={dataTest}>
        <TooltipContainer title={isPinned ? unpinTooltip : pinTooltip}>
          <Styled.TilePinApp
            role="button"
            aria-label={isPinned ? unpinTooltip : pinTooltip}
            aria-pressed={isPinned}
            onClick={togglePinApp}
            onKeyDown={handlePinKeyDown}
            tabIndex={0}
            pinned={isPinned}
          >
            <Icon iconName={isPinned ? 'pin-video_on' : 'pin-video_off'} />
          </Styled.TilePinApp>
        </TooltipContainer>
        <Styled.TileClickableArea
          role="button"
          tabIndex={0}
          aria-label={name}
          onClick={functionToBeCalled}
          onKeyDown={handleClickableAreaKeyDown}
        >
          {isNew && <Styled.NewLabel>{intl.formatMessage(intlMessages.newAppLabel)}</Styled.NewLabel>}
          <Styled.TileOpenButton $pinned={isPinned} aria-hidden="true">
            {resolveIcon(icon)}
          </Styled.TileOpenButton>
          <Styled.TileTitle>{name}</Styled.TileTitle>
          {children}
        </Styled.TileClickableArea>
      </Styled.TileItem>
    );
  }

  return (
    <Styled.RegisteredAppContent key={`${appKey}${isPinned}`} data-test={dataTest}>
      <Styled.ClickableArea
        role="button"
        tabIndex={0}
        aria-label={name}
        onClick={functionToBeCalled}
        onKeyDown={handleClickableAreaKeyDown}
      >
        <Styled.OpenButton $pinned={isPinned} aria-hidden="true">
          {resolveIcon(icon)}
        </Styled.OpenButton>
        <Styled.AppTitle>{name}</Styled.AppTitle>
        {isNew && <Styled.NewLabel>{intl.formatMessage(intlMessages.newAppLabel)}</Styled.NewLabel>}
        {children}
      </Styled.ClickableArea>
      <TooltipContainer title={isPinned ? unpinTooltip : pinTooltip}>
        <Styled.PinApp
          role="button"
          aria-label={isPinned ? unpinTooltip : pinTooltip}
          aria-pressed={isPinned}
          onClick={togglePinApp}
          onKeyDown={handlePinKeyDown}
          tabIndex={0}
          pinned={isPinned}
        >
          <Icon iconName={isPinned ? 'pin-video_on' : 'pin-video_off'} />
        </Styled.PinApp>
      </TooltipContainer>
    </Styled.RegisteredAppContent>
  );
};

export default memo(AppItem);
