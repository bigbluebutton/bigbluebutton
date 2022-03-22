import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import Auth from "/imports/ui/services/auth";
import Meetings from "/imports/api/meetings";
import Users from "/imports/api/users";
import CursorService from "./service";
import Cursor from "./component";

class CursorContainer extends Component {
  render() {
    const { cursorX, cursorY } = this.props;
    if (cursorX > 0 && cursorY > 0) {
      return (
        <Cursor
          cursorX={cursorX}
          cursorY={cursorY}
          setLabelBoxDimensions={this.setLabelBoxDimensions}
          {...this.props}
        />
      );
    }
    return null;
  }
}

export default withTracker((params) => {
  const { cursorId } = params;
  const cursor = CursorService.getCurrentCursor(cursorId);
  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { "lockSettingsProps.hideViewersCursor": 1 } }
  );
  const curUser = Users.findOne(
    { meetingId: Auth.meetingID, userId: Auth.userID },
    { fields: { role: 1, userId: 1 } }
  );

  if (cursor) {
    const { xPercent: cursorX, yPercent: cursorY, userName, userId } = cursor;
    const isRTL = document.documentElement.getAttribute("dir") === "rtl";
    const userCursor = Users.findOne(
      { meetingId: Auth.meetingID, userId },
      { fields: { presenter: 1, userId: 1 } }
    );
    const visibleCursor =
      curUser?.role === "MODERATOR" ||
      userCursor.presenter ||
      userCursor.userId === curUser.userId;
    const hideViewersCursor = meeting?.lockSettingsProps?.hideViewersCursor;

    if (!hideViewersCursor || (hideViewersCursor && visibleCursor)) {
      return {
        cursorX,
        cursorY,
        userName,
        isRTL,
      };
    }
  }

  return {
    cursorX: -1,
    cursorY: -1,
    userName: "",
  };
})(CursorContainer);

CursorContainer.propTypes = {
  // Defines the 'x' coordinate for the cursor, in percentages of the slide's width
  cursorX: PropTypes.number.isRequired,

  // Defines the 'y' coordinate for the cursor, in percentages of the slide's height
  cursorY: PropTypes.number.isRequired,
};
