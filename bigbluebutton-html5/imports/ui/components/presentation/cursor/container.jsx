import React, { Component, useContext } from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import Auth from "/imports/ui/services/auth";
import lockContextContainer from "/imports/ui/components/lock-viewers/context/container";
import { UsersContext } from "/imports/ui/components/components-data/users-context/context";
import CursorService from "./service";
import Cursor from "./component";
import WhiteboardService from "/imports/ui/components/whiteboard/service";

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const CursorContainer = (props) => {
  const { cursorX, cursorY, presenter, uid, isViewersCursorLocked } = props;
  if (cursorX > 0 && cursorY > 0) {
    const usingUsersContext = useContext(UsersContext);
    const { users } = usingUsersContext;
    const role = users[Auth.meetingID][Auth.userID].role;
    const userId = users[Auth.meetingID][Auth.userID].userId;
    const showCursor =
      role === ROLE_MODERATOR || presenter || (!presenter && uid === userId);
    if (!isViewersCursorLocked || (isViewersCursorLocked && showCursor)) {
      return (
        <Cursor
          cursorX={cursorX}
          cursorY={cursorY}
          setLabelBoxDimensions={this.setLabelBoxDimensions}
          {...props}
        />
      );
    }
  }
  return null;
};

export default lockContextContainer(
  withTracker((params) => {
    const { cursorId, userLocks, whiteboardId, presenter } = params;
    const isViewersCursorLocked = userLocks?.hideViewersCursor;
    const cursor = CursorService.getCurrentCursor(cursorId);
    const hasPermission = presenter || WhiteboardService.hasMultiUserAccess(whiteboardId, cursor.userId);

    if (cursor&& hasPermission) {
      const {
        xPercent: cursorX,
        yPercent: cursorY,
        userName,
        userId,
        presenter,
      } = cursor;
      const isRTL = document.documentElement.getAttribute("dir") === "rtl";

      return {
        cursorX,
        cursorY,
        userName,
        presenter: presenter,
        uid: userId,
        isRTL,
        isViewersCursorLocked,
      };
    }

    return {
      cursorX: -1,
      cursorY: -1,
      userName: "",
    };
  })(CursorContainer)
);

CursorContainer.propTypes = {
  // Defines the 'x' coordinate for the cursor, in percentages of the slide's width
  cursorX: PropTypes.number.isRequired,

  // Defines the 'y' coordinate for the cursor, in percentages of the slide's height
  cursorY: PropTypes.number.isRequired,
};
