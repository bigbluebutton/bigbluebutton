import React from 'react';
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
import { useMeasureRegion } from '/imports/ui/components/layout/measuredRegions';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { SidebarContentProps } from './types';
import ResizeHandle from '/imports/ui/components/layout/shell/ResizeHandle';
import useSidebarResize from './useSidebarResize';
import { SIDEBAR_HANDLE_LEFT, SIDEBAR_HANDLE_RIGHT } from './handleStyles';
import AudioCaptionsPanel from '../audio-captions/panel/component';
import NotesRenderMode from '/imports/ui/components/notes/constants';

const SidebarContent = (props: SidebarContentProps) => {
  // the sidebar's rendered box, for the panels that size content from it (poll charts, crowd buttons)
  const measureSidebarContent = useMeasureRegion<HTMLDivElement>('sidebarContent');
  const {
    contextDispatch,
    sidebarContentPanel,
    isSharedNotesPinned,
  } = props;

  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const isMobile = deviceType === DEVICE_TYPE.MOBILE;
  const {
    setBackdrop, onResizeStart, onResize, onResizeEnd,
  } = useSidebarResize(ACTIONS.SET_SIDEBAR_CONTENT_SIZE, contextDispatch, measureSidebarContent);

  const { isChrome } = browserInfo;

  if (sidebarContentPanel === PANELS.NONE) return null;

  return (
    <Styled.SidebarContentBackdrop
      ref={setBackdrop}
      // its box comes from the CSS layout (layout/shell/styles.ts)
      data-layout-region="sidebar-content"
      // Generic sidekick panels carry their id in the panel name; the class keeps only the type
      className={`bbb-sidebar-content bbb-sidebar-content--${
        sidebarContentPanel.includes(PANELS.GENERIC_CONTENT_SIDEKICK)
          ? PANELS.GENERIC_CONTENT_SIDEKICK
          : sidebarContentPanel
      }`}
      isMobile={isMobile}
      isRTL={isRTL}
    >
      <div
        className="bbb-sidebar-content__panel"
        data-test="sidebarContentMain"
        data-layout-region="sidebar-panel"
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
              renderMode={NotesRenderMode.SIDEBAR}
              isVisible={sidebarContentPanel === PANELS.SHARED_NOTES}
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
        {!isMobile && (
          <ResizeHandle
            edge={isRTL ? 'left' : 'right'}
            dataTest="sidebarContentResizeHandle"
            wrapperClassName="resizeSidebarContentWrapper"
            handleStyle={isRTL ? SIDEBAR_HANDLE_LEFT : SIDEBAR_HANDLE_RIGHT}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeEnd={onResizeEnd}
          />
        )}
      </div>
    </Styled.SidebarContentBackdrop>
  );
};

export default SidebarContent;
