import React, { memo, ReactNode } from 'react';
import Icon from '/imports/ui/components/common/icon/component';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { defineMessages, useIntl } from 'react-intl';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import Styled from '../styles';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

interface AppItemProps {
  appKey: string;
  dataTest?: string;
  name: string;
  icon: PluginIconType;
  isPinned: boolean;
  isNew?: boolean;
  onClick?: (() => void) | undefined;
  pinnedAppsLength: number;
  maxPinned: number;
  setError: (v: boolean) => void;
  pinTooltip: string;
  unpinTooltip: string;
  children?: ReactNode;
}

const intlMessages = defineMessages({
  newAppLabel: {
    id: 'app.appsGallery.newAppLabel',
    description: 'Label for inidicate new apps in gallery panel title',
  },
});

const AppItem: React.FC<AppItemProps> = ({
  appKey,
  dataTest,
  name,
  icon,
  isPinned,
  isNew = false,
  onClick,
  pinnedAppsLength,
  maxPinned,
  setError,
  pinTooltip,
  unpinTooltip,
  children = null,
}) => {
  const layoutContextDispatch = layoutDispatch();
  const intl = useIntl();

  const togglePinApp = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!isPinned && pinnedAppsLength >= maxPinned) {
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

  const handleClickableAreaKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      functionToBeCalled();
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePinApp(e);
    }
  };

  return (
    <Styled.RegisteredAppContent key={`${appKey}${isPinned}`} data-test={dataTest}>
      <Styled.ClickableArea
        role="button"
        tabIndex={0}
        aria-label={name}
        onClick={functionToBeCalled}
        onKeyDown={handleClickableAreaKeyDown}
      >
        <Styled.OpenButton
          key={`OPEN${appKey}`}
          color="primary"
          type="button"
          icon={icon}
          $pinned={isPinned}
          label=""
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => {}}
        />
        <Styled.AppTitle>{name}</Styled.AppTitle>
        {isNew && <Styled.NewLabel>{intl.formatMessage(intlMessages.newAppLabel)}</Styled.NewLabel>}
        {children}
      </Styled.ClickableArea>
      <TooltipContainer title={isPinned ? unpinTooltip : pinTooltip}>
        <Styled.PinApp
          role="button"
          aria-label={isPinned ? unpinTooltip : pinTooltip}
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
