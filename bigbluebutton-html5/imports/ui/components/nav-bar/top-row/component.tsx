import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { defineMessages, IntlShape } from 'react-intl';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import Styled from '../styles';
import RecordingIndicator from '../nav-bar-graphql/recording-indicator/component';
import ConnectionStatusButton from '/imports/ui/components/connection-status/button/container';
import ConnectionStatus from '/imports/ui/components/connection-status/component';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import OptionsDropdownContainer from '../options-dropdown/container';
import NavBarPluginItem from '../plugin-item/component';
import LeaveMeetingButtonContainer from '../leave-meeting-button/container';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { useBarPriority } from '/imports/ui/core/hooks/useBarPriority';
import { RegisterBarPriorityEntries } from '/imports/ui/core/hooks/useBarPriorityEntries';
import { useTitleReservedWidth, useTitleRoom } from '/imports/ui/core/hooks/useNavBarTitleSpace';
import { isFocusLost, useFocusWithin } from '/imports/ui/core/hooks/useFocusWithin';
import {
  BAR_PRIORITY_WEIGHTS,
  isBarsOverflowEnabled,
} from '/imports/ui/core/singletons/barPriorityController';
import OverflowItem from '/imports/ui/components/common/bar-overflow/overflow-item/component';
import {
  getPluginSlotId,
  isBarItemDescriptor,
  itemsSignature,
} from '/imports/ui/components/common/bar-overflow/service';
import {
  BarItemDescriptor,
  BarItemPriority,
  UnorderedBarItemDescriptor,
} from '/imports/ui/components/common/bar-overflow/types';
import {
  getNavBarPluginDescriptor,
  getNavBarPluginOverflowEntries,
} from '../service';

const intlMessages = defineMessages({
  openDetailsTooltip: {
    id: 'app.navBar.openDetailsTooltip',
    description: 'Open details tooltip',
  },
  sessionControlLabel: {
    id: 'app.navBar.sessionControlLabel',
    description: 'label for screen reader to jump to leave button and options menu',
  },
});

interface NavBarTopRowProps {
  intl: IntlShape;
  presentationTitle?: string;
  onTitleClick: () => void;
  sessionDetailsModal: React.ReactNode;
  leftPluginItems: PluginSdk.NavBarInterface[];
  centerPluginItems: PluginSdk.NavBarInterface[];
  rightPluginItems: PluginSdk.NavBarInterface[];
  amIModerator?: boolean;
  isDirectLeaveButtonEnabled?: boolean;
  isConnected?: boolean;
}

const NavBarTopRow = ({
  intl,
  presentationTitle,
  onTitleClick,
  sessionDetailsModal,
  leftPluginItems,
  centerPluginItems,
  rightPluginItems,
  amIModerator = false,
  isDirectLeaveButtonEnabled = false,
  isConnected = false,
}: NavBarTopRowProps) => {
  const overflowEnabled = isBarsOverflowEnabled();
  const topRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const showConnectionStatus = ConnectionStatusService.isEnabled();
  const showLeaveButton = isDirectLeaveButtonEnabled && isConnected;

  const nativeDescriptor = (id: string, priority: BarItemPriority): UnorderedBarItemDescriptor => ({
    id,
    priority,
  });
  const items: BarItemDescriptor[] = [
    ...leftPluginItems.map(getNavBarPluginDescriptor),
    ...centerPluginItems.map(getNavBarPluginDescriptor),
    nativeDescriptor('recording', BAR_PRIORITY_WEIGHTS.NORMAL),
    ...rightPluginItems.map(getNavBarPluginDescriptor),
    showConnectionStatus && nativeDescriptor('connectionStatus', BAR_PRIORITY_WEIGHTS.NORMAL),
    showLeaveButton && nativeDescriptor('leave', BAR_PRIORITY_WEIGHTS.ESSENTIAL),
    nativeDescriptor('options', BAR_PRIORITY_WEIGHTS.ESSENTIAL),
  ].filter(isBarItemDescriptor).map((item, order) => ({ ...item, order }));

  const reservedWidth = useTitleReservedWidth(
    titleRef,
    titleTextRef,
    overflowEnabled,
    presentationTitle,
  );

  const {
    overflowIds,
    menuIds,
    isHidden,
    registerItem,
    entriesById,
  } = useBarPriority({
    bar: 'navBar',
    containerRef: topRef,
    items,
    reservedWidth,
    excludedRef: titleRef,
  });

  const titleRoom = useTitleRoom(
    overflowEnabled,
    topRef,
    titleRef,
    overflowIds,
    itemsSignature(items),
  );

  const overflowEntries = useMemo(
    () => menuIds.flatMap((id) => entriesById.get(id) ?? []),
    [menuIds, entriesById],
  );

  // The options button turns into its only option and back, a different element each time, so a
  // change of the collapsed entries can remove the element that holds the focus.
  const getOptionsSlot = useCallback(
    () => topRef.current?.querySelector('[data-overflow-item="options"]'),
    [],
  );
  const focusInOptionsRef = useFocusWithin(getOptionsSlot);
  useEffect(() => {
    if (!focusInOptionsRef.current || !isFocusLost()) return;
    getOptionsSlot()?.querySelector<HTMLElement>('button:not([disabled])')?.focus();
  }, [overflowEntries, getOptionsSlot, focusInOptionsRef]);

  const renderSlot = (id: string, children: React.ReactNode) => (
    <OverflowItem
      key={id}
      id={id}
      enabled={overflowEnabled}
      hidden={isHidden(id)}
      registerItem={registerItem}
    >
      {children}
    </OverflowItem>
  );

  const renderPluginSlots = (pluginItems: PluginSdk.NavBarInterface[]) => pluginItems.map((pluginItem) => {
    const id = getPluginSlotId(pluginItem);
    return renderSlot(id, (
      <>
        <RegisterBarPriorityEntries
          bar="navBar"
          id={id}
          entries={getNavBarPluginOverflowEntries(pluginItem)}
        />
        <NavBarPluginItem item={pluginItem} />
      </>
    ));
  });

  const titleRoomStyle = titleRoom === null
    ? undefined
    : { '--nav-bar-title-room': `${titleRoom}px` } as React.CSSProperties;

  return (
    <Styled.Top
      ref={topRef}
      // @ts-expect-error -- styles.js is untyped, so its styled components accept no custom props.
      $overflowEnabled={overflowEnabled}
    >
      <Styled.Left className="bbb-navbar__left">
        {renderPluginSlots(leftPluginItems)}
      </Styled.Left>
      <Styled.Center
        className="bbb-navbar__center"
        // @ts-expect-error -- styles.js is untyped, so its styled components accept no custom props.
        $hasOverflow={overflowIds.size > 0}
      >
        <Styled.PresentationTitle
          className="bbb-navbar__title"
          ref={titleRef}
          // @ts-expect-error -- styles.js is untyped, so its styled components accept no custom props.
          $overflowEnabled={overflowEnabled}
          style={titleRoomStyle}
          data-test="presentationTitle"
          id="presentationTitle"
        >
          <Tooltip title={intl.formatMessage(intlMessages.openDetailsTooltip)}>
            <Styled.TitleButton
              aria-haspopup="dialog"
              onClick={onTitleClick}
            >
              <Styled.TitleText ref={titleTextRef}>{presentationTitle}</Styled.TitleText>
              <Icon iconName="device_list_selector" rotate />
            </Styled.TitleButton>
          </Tooltip>
        </Styled.PresentationTitle>
        {sessionDetailsModal}
        {renderPluginSlots(centerPluginItems)}
      </Styled.Center>
      <Styled.Right className="bbb-navbar__right">
        <h2 className="sr-only">{intl.formatMessage(intlMessages.sessionControlLabel)}</h2>
        {renderSlot('recording', <RecordingIndicator />)}
        {renderPluginSlots(rightPluginItems)}
        {showConnectionStatus ? renderSlot('connectionStatus', <ConnectionStatusButton />) : null}
        {showConnectionStatus ? <ConnectionStatus /> : null}
        {showLeaveButton
          ? renderSlot('leave', <LeaveMeetingButtonContainer amIModerator={amIModerator} />)
          : null}
        {renderSlot('options', (
          <OptionsDropdownContainer
            amIModerator={amIModerator}
            isDirectLeaveButtonEnabled={isDirectLeaveButtonEnabled}
            overflowEntries={overflowEntries}
          />
        ))}
      </Styled.Right>
    </Styled.Top>
  );
};

export default NavBarTopRow;
