import React, { memo, ReactNode } from 'react';
import Icon from '/imports/ui/components/common/icon/component';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import Styled from '../styles';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

interface AppItemProps {
  appKey: string;
  name: string;
  icon: string;
  isPinned: boolean;
  onClick?: (() => void) | undefined;
  pinnedAppsLength: number;
  maxPinned: number;
  setError: (v: boolean) => void;
  pinTooltip: string;
  unpinTooltip: string;
  children?: ReactNode;
}

const AppItem: React.FC<AppItemProps> = ({
  appKey,
  name,
  icon,
  isPinned,
  onClick,
  pinnedAppsLength,
  maxPinned,
  setError,
  pinTooltip,
  unpinTooltip,
  children = null,
}) => {
  const layoutContextDispatch = layoutDispatch();

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

  return (
    <Styled.RegisteredAppContent key={`${appKey}${isPinned}`}>
      <Styled.ClickableArea onClick={functionToBeCalled}>
        <Styled.OpenButton
          key={`OPEN${appKey}`}
          color="primary"
          type="button"
          icon={icon}
          $pinned={isPinned}
          label=""
          onClick={() => {}}
        />
        <Styled.AppTitle>{name}</Styled.AppTitle>
        {children}
      </Styled.ClickableArea>
      <TooltipContainer title={isPinned ? unpinTooltip : pinTooltip}>
        <Styled.PinApp role="button" onClick={togglePinApp} tabIndex={0} pinned={isPinned}>
          <Icon iconName={isPinned ? 'pin-video_on' : 'pin-video_off'} />
        </Styled.PinApp>
      </TooltipContainer>
    </Styled.RegisteredAppContent>
  );
};

export default memo(AppItem);
