import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { defineMessages, IntlShape } from 'react-intl';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { ActionsBarPosition } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/actions-bar-item/enums';
import Styled from './styles';
import MediaAreaContainer from './media-area/container';
import ActionsBarPluginItem from './plugin-item/component';
import OverflowTriggerButton from './overflow-trigger-button/component';
import OverflowTriggerStyled from './overflow-trigger-button/styles';
import AudioCaptionsButtonContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/button/component';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import AudioControlsContainer from '../audio/audio-graphql/audio-controls/component';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';
import SwapPresentationButton from './swap-presentation/component';
import { LAYOUT_TYPE } from '../layout/enums';
import { DispatcherFunction, Output } from '../layout/layoutTypes';
import ReactionsButtonContainer from '/imports/ui/components/actions-bar/reactions-button/container';
import RaiseHandButtonContainer from '/imports/ui/components/actions-bar/raise-hand-button/container';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { useBarPriority } from '/imports/ui/core/hooks/useBarPriority';
import { RegisterBarPriorityEntries } from '/imports/ui/core/hooks/useBarPriorityEntries';
import { isFocusLost, useFocusWithin } from '/imports/ui/core/hooks/useFocusWithin';
import {
  BAR_PRIORITY_WEIGHTS,
  isBarsOverflowEnabled,
} from '/imports/ui/core/singletons/barPriorityController';
import OverflowItem from '/imports/ui/components/common/bar-overflow/overflow-item/component';
import OverflowMenuButton from '/imports/ui/components/common/bar-overflow/overflow-menu-button/component';
import {
  findOverflowSlot,
  focusFirstIn,
  focusFirstVisibleIn,
  getPluginSlotId,
  isActionableEntry,
  isActiveEntry,
  isBarItemDescriptor,
  OVERFLOWED_ATTRIBUTE,
} from '/imports/ui/components/common/bar-overflow/service';
import {
  BarItemKind,
  BarItemPriority,
  OverflowMenuEntry,
  UnorderedBarItemDescriptor,
} from '/imports/ui/components/common/bar-overflow/types';
import {
  ACTIONS_BAR_FOCUSABLE_SELECTOR,
  ACTIONS_BAR_OVERFLOW_BUTTON_ID,
  ACTIONS_BAR_OVERFLOW_MENU_OPTS,
  getActionsBarPluginDescriptor,
  getActionsBarPluginOverflowEntries,
  isActionsBarIconSeparator,
} from './service';

const intlMessages = defineMessages({
  actionsBarLabel: {
    id: 'app.actionsBar.label',
    description: 'Aria-label for ActionsBar Section',
  },
  overflowButtonLabel: {
    id: 'app.actionsBar.overflowButtonLabel',
    description: 'Label of the button that groups the actions bar items that do not fit',
  },
  overflowExpandLabel: {
    id: 'app.actionsBar.overflowExpandLabel',
    description: 'Option that swaps the actions bar items for the plugin tools that do not fit',
  },
  overflowCollapseLabel: {
    id: 'app.actionsBar.overflowCollapseLabel',
    description: 'Button that brings the regular actions bar items back from the plugin tools',
  },
});

interface ActionsBarProps {
  amIPresenter?: boolean;
  amIModerator?: boolean;
  enableVideo: boolean;
  presentationIsOpen: boolean;
  setPresentationIsOpen: (layoutContextDispatch: DispatcherFunction, value: boolean) => void;
  intl: IntlShape;
  isSharingVideo: boolean;
  isSharedNotesPinned?: boolean;
  hasScreenshare: boolean;
  hasGenericContent: boolean;
  hasCameraAsContent?: boolean;
  stopExternalVideoShare: () => void;
  isTimerActive?: boolean;
  isTimerEnabled: boolean;
  isConnected: boolean;
  isPollingEnabled: boolean;
  isThereCurrentPresentation: boolean;
  allowExternalVideo: boolean;
  layoutContextDispatch: DispatcherFunction;
  actionsBarStyle: Output['actionBar'];
  setPresentationFitToWidth?: (fitToWidth: boolean) => void;
  isPresentationEnabled: boolean;
  ariaHidden: boolean;
  isDarkThemeEnabled: boolean;
  isMobile: boolean;
  showScreenshareQuickSwapButton: boolean;
  isReactionsButtonEnabled: boolean;
  isRaiseHandEnabled: boolean;
  selectedLayout: string;
  actionBarItems: PluginSdk.ActionsBarInterface[];
}

const noop = () => {};

const ActionsBar = ({
  amIPresenter,
  amIModerator,
  enableVideo,
  presentationIsOpen,
  setPresentationIsOpen,
  intl,
  isSharingVideo,
  isSharedNotesPinned,
  hasScreenshare,
  hasGenericContent,
  hasCameraAsContent,
  stopExternalVideoShare,
  isTimerActive,
  isTimerEnabled,
  isConnected,
  isPollingEnabled,
  isThereCurrentPresentation,
  allowExternalVideo,
  layoutContextDispatch,
  actionsBarStyle,
  setPresentationFitToWidth,
  isPresentationEnabled,
  ariaHidden,
  isDarkThemeEnabled,
  isMobile,
  showScreenshareQuickSwapButton,
  isReactionsButtonEnabled,
  isRaiseHandEnabled,
  selectedLayout,
  actionBarItems,
}: ActionsBarProps) => {
  const overflowEnabled = isBarsOverflowEnabled();
  const actionsBarWrapperRef = useRef<HTMLElement>(null);
  const actionsBarRef = useRef<HTMLDivElement>(null);
  const overflowButtonRef = useRef<HTMLElement | null>(null);
  const setOverflowButtonElement = useCallback((element: HTMLElement | null) => {
    overflowButtonRef.current = element;
  }, []);
  const registerOverflowButton = useCallback(
    () => setOverflowButtonElement,
    [setOverflowButtonElement],
  );
  const shouldShowPresentationButton = selectedLayout !== LAYOUT_TYPE.CAMERAS_ONLY
    && selectedLayout !== LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY;
  const shouldShowVideoButton = selectedLayout !== LAYOUT_TYPE.PRESENTATION_ONLY
    && selectedLayout !== LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY;
  const shouldRenderActionBar = selectedLayout !== LAYOUT_TYPE.PLUGINS_ONLY;

  const shouldShowOptionsButton = (isPresentationEnabled && isThereCurrentPresentation)
    || isSharingVideo || hasScreenshare || isSharedNotesPinned;

  const showVideoButton = shouldShowVideoButton && enableVideo;
  const showPresentationOptions = shouldShowPresentationButton && shouldShowOptionsButton;

  const leftPluginItems = actionBarItems
    .filter((plugin) => plugin.position === ActionsBarPosition.LEFT);
  const rightPluginItems = actionBarItems
    .filter((plugin) => plugin.position === ActionsBarPosition.RIGHT);

  const nativeDescriptor = (
    id: string,
    priority: BarItemPriority,
    kind?: BarItemKind,
  ): UnorderedBarItemDescriptor => ({ id, priority, kind });
  const items = [
    ...leftPluginItems.map(getActionsBarPluginDescriptor),
    nativeDescriptor('audioCaptions', BAR_PRIORITY_WEIGHTS.NORMAL),
    nativeDescriptor('audio', BAR_PRIORITY_WEIGHTS.ESSENTIAL),
    showVideoButton && nativeDescriptor('video', BAR_PRIORITY_WEIGHTS.ESSENTIAL),
    // The media area (+) also starts a screen share, so the button just hides.
    shouldShowPresentationButton && nativeDescriptor('screenshare', BAR_PRIORITY_WEIGHTS.NORMAL, 'hide'),
    isReactionsButtonEnabled && nativeDescriptor('reactions', BAR_PRIORITY_WEIGHTS.NORMAL),
    isRaiseHandEnabled && nativeDescriptor('raiseHand', BAR_PRIORITY_WEIGHTS.NORMAL),
    ...rightPluginItems.map(getActionsBarPluginDescriptor),
    showPresentationOptions && nativeDescriptor('presentationOptions', BAR_PRIORITY_WEIGHTS.ESSENTIAL),
    nativeDescriptor('mediaArea', BAR_PRIORITY_WEIGHTS.ESSENTIAL),
    showScreenshareQuickSwapButton && nativeDescriptor('swapPresentation', BAR_PRIORITY_WEIGHTS.NORMAL),
  ].filter(isBarItemDescriptor).map((item, order) => ({ ...item, order }));

  const {
    menuIds,
    expandIds,
    expanded,
    setExpanded,
    isHidden,
    registerItem,
    entriesById,
  } = useBarPriority({
    bar: 'actionsBar',
    containerRef: actionsBarRef,
    items,
    overflowButtonRef,
  });

  // An icon alone in the expanded mode labels nothing, so only the tools themselves open it.
  const expandToolIds = useMemo(() => {
    const iconSeparatorIds = new Set(
      actionBarItems.filter(isActionsBarIconSeparator).map(getPluginSlotId),
    );
    return expandIds.filter((id) => !iconSeparatorIds.has(id));
  }, [actionBarItems, expandIds]);

  const expandLabel = intl.formatMessage(intlMessages.overflowExpandLabel);
  const overflowEntries = useMemo<OverflowMenuEntry[]>(() => {
    const entries = menuIds.flatMap((id) => entriesById.get(id) ?? []);
    if (expandToolIds.length === 0) return entries;
    return [...entries, {
      key: 'expand',
      label: expandLabel,
      icon: 'more',
      dataTest: 'actionsBarOverflowExpand',
      onClick: () => setExpanded(true),
    }];
  }, [menuIds, expandToolIds, entriesById, expandLabel, setExpanded]);
  const hasOverflowMenu = overflowEntries.some(isActionableEntry);
  const hasActiveItemBehindBackButton = expanded && items.some(
    ({ id }) => isHidden(id) && (entriesById.get(id) ?? []).some(isActiveEntry),
  );

  const expandedIdsRef = useRef(expandToolIds);
  // Kept from the last expanded render: on exit, focus goes back to where those items were.
  useLayoutEffect(() => {
    if (expanded) expandedIdsRef.current = expandToolIds;
  }, [expanded, expandToolIds]);
  const wasExpandedRef = useRef(expanded);
  const getOverflowButtonSlot = useCallback(() => overflowButtonRef.current, []);
  const focusInOverflowButtonRef = useFocusWithin(getOverflowButtonSlot);

  useEffect(() => {
    const expandedChanged = wasExpandedRef.current !== expanded;
    wasExpandedRef.current = expanded;
    const bar = actionsBarRef.current;
    if (!bar) return;

    // The overflow button is a different element in each form (direct button, menu, placeholder),
    // so a change of its entries can remove the element that holds the focus.
    if (!expandedChanged) {
      if (!focusInOverflowButtonRef.current || !isFocusLost()) return;
      if (!overflowButtonRef.current?.hasAttribute(OVERFLOWED_ATTRIBUTE)
        && focusFirstIn(overflowButtonRef.current, ACTIONS_BAR_FOCUSABLE_SELECTOR)) return;
      focusFirstVisibleIn(bar, ACTIONS_BAR_FOCUSABLE_SELECTOR);
      return;
    }

    const firstExpandedSlot = findOverflowSlot(bar, expandedIdsRef.current[0]);
    if (expanded) {
      focusFirstIn(firstExpandedSlot, ACTIONS_BAR_FOCUSABLE_SELECTOR);
      return;
    }

    // Exiting can also happen on its own (the bar widened), so focus is only brought back when it
    // was in the bar and got lost with the element that held it.
    const { activeElement } = document;
    const focusLost = !activeElement || activeElement === document.body;
    const focusInBar = !!activeElement && bar.contains(activeElement);
    if (!focusLost && !focusInBar) return;
    if (focusInBar && !activeElement.closest(`[${OVERFLOWED_ATTRIBUTE}]`)
      && !overflowButtonRef.current?.contains(activeElement)) return;
    if (!overflowButtonRef.current?.hasAttribute(OVERFLOWED_ATTRIBUTE)
      && focusFirstIn(overflowButtonRef.current, ACTIONS_BAR_FOCUSABLE_SELECTOR)) return;
    if (!firstExpandedSlot?.hasAttribute(OVERFLOWED_ATTRIBUTE)
      && focusFirstIn(firstExpandedSlot, ACTIONS_BAR_FOCUSABLE_SELECTOR)) return;
    // The expanded items may be gone altogether (the plugin removed them).
    focusFirstVisibleIn(bar, ACTIONS_BAR_FOCUSABLE_SELECTOR);
  }, [expanded, overflowEntries, focusInOverflowButtonRef]);

  useEffect(() => {
    const bar = actionsBarRef.current;
    if (!expanded || !bar) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      setExpanded(false);
    };
    // Access keys still click the triggers hidden by the expanded mode (audio, media area...), so
    // the bar goes back to normal and the action lands on a control the user can see.
    const handleHiddenItemClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(`[${OVERFLOWED_ATTRIBUTE}]`)) {
        setExpanded(false);
      }
    };
    bar.addEventListener('keydown', handleKeyDown);
    bar.addEventListener('click', handleHiddenItemClick, true);
    return () => {
      bar.removeEventListener('keydown', handleKeyDown);
      bar.removeEventListener('click', handleHiddenItemClick, true);
    };
  }, [expanded, setExpanded]);

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

  const renderPluginSlots = (
    pluginItems: PluginSdk.ActionsBarInterface[],
  ) => pluginItems.map((plugin) => {
    const id = getPluginSlotId(plugin);
    return renderSlot(id, (
      <>
        <RegisterBarPriorityEntries
          bar="actionsBar"
          id={id}
          entries={getActionsBarPluginOverflowEntries(plugin)}
        />
        <ActionsBarPluginItem item={plugin} />
      </>
    ));
  });

  const renderOverflowButton = () => {
    if (!overflowEnabled) return null;

    const overflowButtonLabel = intl.formatMessage(intlMessages.overflowButtonLabel);
    const collapseLabel = intl.formatMessage(intlMessages.overflowCollapseLabel);

    let content: React.ReactNode;
    if (expanded) {
      content = (
        <OverflowTriggerStyled.OverflowBackButton
          layout="circle"
          icon={<Icon iconName="left_arrow" />}
          label={collapseLabel}
          tooltipLabel={collapseLabel}
          onClick={() => setExpanded(false)}
          dataTest="actionsBarOverflowCollapse"
          $hasActiveEntry={hasActiveItemBehindBackButton}
        />
      );
    } else if (hasOverflowMenu) {
      content = (
        <OverflowMenuButton
          entries={overflowEntries}
          trigger={{
            label: overflowButtonLabel,
            dataTest: 'actionsBarOverflowButton',
            component: OverflowTriggerButton,
            indicateActiveEntry: true,
          }}
          menuOpts={ACTIONS_BAR_OVERFLOW_MENU_OPTS}
        />
      );
    } else {
      // Kept mounted (and hidden) only so the bar knows how much room the button needs.
      content = (
        <OverflowTriggerButton
          icon="more"
          label={overflowButtonLabel}
          onClick={noop}
        />
      );
    }

    return (
      <OverflowItem
        id={ACTIONS_BAR_OVERFLOW_BUTTON_ID}
        hidden={!expanded && !hasOverflowMenu}
        registerItem={registerOverflowButton}
      >
        {content}
      </OverflowItem>
    );
  };

  const showPresentationDivider = (amIPresenter || amIModerator) && shouldShowOptionsButton
    && !isHidden('mediaArea');

  return shouldRenderActionBar && (
    <Styled.ActionsBarWrapper
      className="bbb-actions-bar"
      ref={actionsBarWrapperRef}
      id="ActionsBar"
      role="region"
      aria-label={intl.formatMessage(intlMessages.actionsBarLabel)}
      aria-hidden={ariaHidden}
      style={
        {
          position: 'absolute',
          top: actionsBarStyle.top,
          left: actionsBarStyle.left,
          height: actionsBarStyle.height,
          width: actionsBarStyle.width,
          padding: actionsBarStyle.padding,
          ...(isMobile && { overflowX: 'auto' }),
          ...(isMobile && { overflowY: 'hidden' }),
        }
      }
    >
      <h2 className="sr-only">{intl.formatMessage(intlMessages.actionsBarLabel)}</h2>
      <Styled.ActionsBar
        ref={actionsBarRef}
        // @ts-expect-error -- styles.js is untyped, so its styled components accept no custom props.
        $overflowEnabled={overflowEnabled}
        style={
          {
            height: actionsBarStyle.innerHeight,
          }
        }
      >
        <Styled.Left className="bbb-actions-bar__left">
          {renderPluginSlots(leftPluginItems)}
          {renderSlot('audioCaptions', <AudioCaptionsButtonContainer />)}
        </Styled.Left>
        <Styled.Center className="bbb-actions-bar__center">
          {renderOverflowButton()}
          {renderSlot('audio', <AudioControlsContainer />)}
          {showVideoButton
            ? renderSlot('video', <JoinVideoOptionsContainer />)
            : null}
          {shouldShowPresentationButton && renderSlot('screenshare', (
            <ScreenshareButtonContainer {...{
              amIPresenter,
              isConnected,
            }}
            />
          ))}
          {isReactionsButtonEnabled && renderSlot('reactions', (
            <ReactionsButtonContainer
              // @ts-expect-error -- JS container: injectIntl only infers the intl props.
              actionsBarRef={actionsBarRef}
              actionsBarWrapperRef={actionsBarWrapperRef}
              isOverflowed={isHidden('reactions')}
            />
          ))}
          {isRaiseHandEnabled && renderSlot('raiseHand', (
            // @ts-expect-error -- JS container: injectIntl only infers the intl props.
            <RaiseHandButtonContainer isOverflowed={isHidden('raiseHand')} />
          ))}
          {renderPluginSlots(rightPluginItems)}
        </Styled.Center>
        <Styled.Right className="bbb-actions-bar__right">
          <Styled.PresentationButtonsWrapper className="bbb-actions-bar__media-buttons">
            {showPresentationOptions && renderSlot('presentationOptions', (
              <PresentationOptionsContainer
                presentationIsOpen={presentationIsOpen}
                setPresentationIsOpen={setPresentationIsOpen}
                layoutContextDispatch={layoutContextDispatch}
                hasPresentation={isThereCurrentPresentation}
                hasExternalVideo={isSharingVideo}
                hasScreenshare={hasScreenshare}
                hasPinnedSharedNotes={isSharedNotesPinned}
                hasGenericContent={hasGenericContent}
                hasCameraAsContent={hasCameraAsContent}
                isDarkThemeEnabled={isDarkThemeEnabled}
              />
            ))}
            {showPresentationDivider && (<Styled.Divider />)}
            {renderSlot('mediaArea', (
              <MediaAreaContainer {...{
                amIPresenter,
                amIModerator,
                isPollingEnabled,
                allowExternalVideo,
                intl,
                isSharingVideo,
                stopExternalVideoShare,
                isTimerActive,
                isTimerEnabled,
                isConnected,
                presentationIsOpen,
                hasCameraAsContent,
                setPresentationFitToWidth,
                hasPresentation: isThereCurrentPresentation,
              }}
              />
            ))}
          </Styled.PresentationButtonsWrapper>
          <Styled.Gap>
            {
              showScreenshareQuickSwapButton && renderSlot('swapPresentation', <SwapPresentationButton />)
            }
          </Styled.Gap>
        </Styled.Right>
      </Styled.ActionsBar>
    </Styled.ActionsBarWrapper>
  );
};

export default memo(ActionsBar);
