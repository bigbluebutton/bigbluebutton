import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Resizable from 're-resizable';
import { ACTIONS, PANELS } from '../layout/enums';
import ChatContainer from '/imports/ui/components/chat/container';
import NoteContainer from '/imports/ui/components/note/container';
import PollContainer from '/imports/ui/components/poll/container';
import CaptionsContainer from '/imports/ui/components/captions/pad/container';
import BreakoutRoomContainer from '/imports/ui/components/breakout-room/container';
import WaitingUsersPanel from '/imports/ui/components/waiting-users/container';
import { styles } from '/imports/ui/components/app/styles';

const propTypes = {
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  zIndex: PropTypes.number.isRequired,
  minWidth: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  maxWidth: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  isResizable: PropTypes.bool.isRequired,
  resizableEdge: PropTypes.objectOf(PropTypes.bool).isRequired,
  contextDispatch: PropTypes.func.isRequired,
};

const SidebarContent = (props) => {
  const {
    // display,
    top,
    left,
    zIndex,
    minWidth,
    width,
    maxWidth,
    height,
    isResizable,
    resizableEdge,
    contextDispatch,
    sidebarContentPanel,
  } = props;

  const [resizableWidth, setResizableWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  useEffect(() => {
    if (!isResizing) setResizableWidth(width);
  }, [width]);

  useEffect(() => {
  }, [resizeStartWidth]);

  const setSidebarContentWidth = (dWidth) => {
    const newWidth = resizeStartWidth + dWidth;

    setResizableWidth(newWidth);

    contextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_SIZE,
      value: {
        width: newWidth,
        browserWidth: window.innerWidth,
        browserHeight: window.innerHeight,
      },
    });
  };

  return (
    <Resizable
      minWidth={minWidth}
      maxWidth={maxWidth}
      size={{
        width,
        height,
      }}
      enable={{
        top: isResizable && resizableEdge.top,
        left: isResizable && resizableEdge.left,
        bottom: isResizable && resizableEdge.bottom,
        right: isResizable && resizableEdge.right,
      }}
      handleWrapperClass="resizeSidebarContentWrapper"
      onResizeStart={() => {
        setIsResizing(true);
        setResizeStartWidth(resizableWidth);
      }}
      onResize={(...[, , , delta]) => setSidebarContentWidth(delta.width)}
      onResizeStop={() => {
        setIsResizing(false);
        setResizeStartWidth(0);
      }}
      style={{
        position: 'absolute',
        top,
        left,
        zIndex,
        width,
        height,
      }}
    >
      {sidebarContentPanel === PANELS.CHAT && <ChatContainer />}
      {sidebarContentPanel === PANELS.SHARED_NOTES && <NoteContainer />}
      {sidebarContentPanel === PANELS.CAPTIONS && <CaptionsContainer />}
      {sidebarContentPanel === PANELS.POLL
        && (
          <div className={styles.poll} style={{ minWidth, top: '0' }} id="pollPanel">
            <PollContainer />
          </div>
        )}
      {sidebarContentPanel === PANELS.BREAKOUT && <BreakoutRoomContainer />}
      {sidebarContentPanel === PANELS.WAITING_USERS && <WaitingUsersPanel />}
    </Resizable>
  );
};

SidebarContent.propTypes = propTypes;
export default SidebarContent;
