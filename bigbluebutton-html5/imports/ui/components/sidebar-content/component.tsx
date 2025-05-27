import React, { useState, useEffect } from 'react';
import Resizable from 're-resizable';
import { ACTIONS, DEVICE_TYPE, PANELS } from '../layout/enums';
import ChatContainer from '/imports/ui/components/chat/chat-graphql/component';
import ProfileSettings from '/imports/ui/components/profile-settings/component';
import NotesContainer from '/imports/ui/components/notes/component';
import PollContainer from '/imports/ui/components/poll/container';
import UserListComponent from '/imports/ui/components/user-list/component';
import BreakoutRoomContainer from '../breakout-room/breakout-room/component';
import TimerContainer from '/imports/ui/components/timer/panel/component';
import Styled from './styles';
import ErrorBoundary from '/imports/ui/components/common/error-boundary/component';
import FallbackView from '/imports/ui/components/common/fallback-errors/fallback-view/component';
import AppsGallery from '../apps-gallery/container';
import GenericContentSidekickContainer from '/imports/ui/components/generic-content/generic-sidekick-content/container';
import browserInfo from '/imports/utils/browserInfo';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { SidebarContentProps } from './types';
import {
  SIDEBAR_CONTENT_MARGIN_TO_MEDIA_PERCENTAGE_WIDTH,
  SIDEBAR_CONTENT_VERTICAL_MARGIN_PERCENTAGE_HEIGHT,
} from '/imports/ui/components/layout/defaultValues';
import AudioCaptionsPanel from '../audio-captions/panel/component';

const SidebarContent = (props: SidebarContentProps) => {
  const {
    top,
    left = undefined,
    right = undefined,
    zIndex,
    minWidth,
    width,
    maxWidth,
    minHeight,
    height,
    maxHeight,
    isResizable,
    resizableEdge,
    contextDispatch,
    sidebarContentPanel,
    isSharedNotesPinned,
  } = props;

  const [resizableWidth, setResizableWidth] = useState(width);
  const [resizableHeight, setResizableHeight] = useState(height);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const isMobile = deviceType === DEVICE_TYPE.MOBILE;

  useEffect(() => {
    if (!isResizing) {
      setResizableWidth(width);
      setResizableHeight(height);
    }
  }, [width, height]);

  const setSidebarContentSize = (dWidth: number, dHeight: number) => {
    const newWidth = resizeStartWidth + dWidth;
    const newHeight = resizeStartHeight + dHeight;

    setResizableWidth(newWidth);
    setResizableHeight(newHeight);

    contextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_SIZE,
      value: {
        width: newWidth,
        height: newHeight,
        browserWidth: window.innerWidth,
        browserHeight: window.innerHeight,
      },
    });
  };

  const { isChrome } = browserInfo;

  if (sidebarContentPanel === PANELS.NONE) return null;

  const sidebarContentMarginToMedia = window.innerWidth * SIDEBAR_CONTENT_MARGIN_TO_MEDIA_PERCENTAGE_WIDTH;
  const sidebarContentVerticalMargin = window.innerHeight * SIDEBAR_CONTENT_VERTICAL_MARGIN_PERCENTAGE_HEIGHT;

  const innerPanel = !isMobile ? {
    minWidth: minWidth - sidebarContentMarginToMedia,
    maxWidth: maxWidth - sidebarContentMarginToMedia,
    minHeight: minHeight - (2 * sidebarContentVerticalMargin),
    maxHeight: maxHeight - (2 * sidebarContentVerticalMargin),
    width: width - sidebarContentMarginToMedia,
    height: height - (2 * sidebarContentVerticalMargin),
  } : {
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    width,
    height,
  };

  return (
    <Styled.SidebarContentBackdrop
      isMobile={isMobile}
      isRTL={isRTL}
      style={{
        top,
        left,
        right,
        width,
        height,
        maxWidth,
        minHeight,
      }}
    >
      <Resizable
        minWidth={innerPanel.minWidth}
        maxWidth={innerPanel.maxWidth}
        minHeight={innerPanel.minHeight}
        maxHeight={innerPanel.maxHeight}
        size={{
          width: innerPanel.width,
          height: innerPanel.height,
        }}
        enable={{
          top: isResizable && resizableEdge?.top,
          left: isResizable && resizableEdge?.left,
          bottom: isResizable && resizableEdge?.bottom,
          right: isResizable && resizableEdge?.right,
        }}
        handleWrapperClass="resizeSidebarContentWrapper"
        onResizeStart={() => {
          setIsResizing(true);
          setResizeStartWidth(resizableWidth);
          setResizeStartHeight(resizableHeight);
        }}
        onResize={(...[, , , delta]) => setSidebarContentSize(delta.width, delta.height)}
        onResizeStop={() => {
          setIsResizing(false);
          setResizeStartWidth(0);
          setResizeStartHeight(0);
        }}
        style={{
          position: 'absolute',
          display: 'flex',
          zIndex,
        }}
        handleStyles={{
          left: {
            width: '4px',
            height: '100%',
            left: '-2px',
            cursor: 'ew-resize',
          },
          right: {
            width: '12px',
            height: '100%',
            right: '-12px',
            cursor: 'ew-resize',
          },
        }}
      >
        <Styled.SidebarContentPanel isRTL={isRTL} isChrome={isChrome}>
          {sidebarContentPanel === PANELS.CHAT
            && (
              <ErrorBoundary
                Fallback={FallbackView}
              >
                <ChatContainer />
              </ErrorBoundary>
            )}
          {!isSharedNotesPinned && (
            <NotesContainer
              isToSharedNotesBeShow={sidebarContentPanel === PANELS.SHARED_NOTES}
            />
          )}
          {sidebarContentPanel === PANELS.PROFILE && <ProfileSettings />}
          {sidebarContentPanel === PANELS.USERLIST && <UserListComponent />}
          {sidebarContentPanel === PANELS.BREAKOUT && <BreakoutRoomContainer />}
          {sidebarContentPanel === PANELS.TIMER && <TimerContainer />}
          {sidebarContentPanel === PANELS.POLL && <PollContainer />}
          {sidebarContentPanel === PANELS.APPS_GALLERY && <AppsGallery />}
          {sidebarContentPanel === PANELS.AUDIO_CAPTIONS && <AudioCaptionsPanel />}
          {sidebarContentPanel.includes(PANELS.GENERIC_CONTENT_SIDEKICK) && (
            <GenericContentSidekickContainer
              genericSidekickContentId={sidebarContentPanel}
            />
          )}
        </Styled.SidebarContentPanel>
      </Resizable>
    </Styled.SidebarContentBackdrop>
  );
};

export default SidebarContent;
