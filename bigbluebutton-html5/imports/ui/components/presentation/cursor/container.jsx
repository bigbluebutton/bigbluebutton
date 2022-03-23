import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import CursorService from './service';
import Cursor from './component';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

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

export default lockContextContainer(withTracker((params) => {
  const { cursorId, userLocks } = params;
  const isViewersCursorLocked = userLocks?.hideViewersCursor;
  const cursor = CursorService.getCurrentCursor(cursorId);
  const user = Users.findOne(
    { meetingId: Auth.meetingID, userId: Auth.userID },
    { fields: { role: 1, userId: 1 } },
  );
  if (cursor) {
    const {
      xPercent: cursorX, yPercent: cursorY, userName, userId,
    } = cursor;
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    const showCursor = user.role === ROLE_MODERATOR || cursor.presenter
      || (!cursor.presenter && cursor.userId === user.userId);

    if (!isViewersCursorLocked || (isViewersCursorLocked && showCursor)) {
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
    userName: '',
  };
})(CursorContainer));

CursorContainer.propTypes = {
  // Defines the 'x' coordinate for the cursor, in percentages of the slide's width
  cursorX: PropTypes.number.isRequired,

  // Defines the 'y' coordinate for the cursor, in percentages of the slide's height
  cursorY: PropTypes.number.isRequired,
};
