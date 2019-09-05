/*
  The purpose of this wrapper is to fetch an array of active cursor iDs only
  and map them to the CursorContainer.
  The reason for this is that Meteor tracks only the properties defined inside withTracker
  and if we fetch the whole array of Cursors right away (let's say in the multi-user mode),
  then the whole array would be re-rendered every time one of the Cursors is changed.

  To work around this we map only an array of cursor iDs to CursorContainer.
  This list will be updated in cases when new users join/leave the meeting.
  And then each separate Cursorcontainer will keep
  track of that particular Cursor properties, thus all of them will be updated independently.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import CursorWrapperService from './service';
import CursorContainer from '../container';


const CursorWrapperContainer = ({ presenterCursorId, multiUserCursorIds, ...rest }) => (
  <g>
    {Object.keys(presenterCursorId).length > 0
      ? (
        <CursorContainer
          key={presenterCursorId._id}
          presenter
          cursorId={presenterCursorId._id}
          {...rest}
        />
      )
      : null }

    {multiUserCursorIds.map(cursorId => (
      <CursorContainer
        key={cursorId._id}
        cursorId={cursorId._id}
        presenter={false}
        {...rest}
      />
    ))}
  </g>
);

export default withTracker((params) => {
  const { podId, whiteboardId } = params;
  const cursorIds = CursorWrapperService.getCurrentCursorIds(podId, whiteboardId);
  const { presenterCursorId, multiUserCursorIds } = cursorIds;

  const isMultiUser = CursorWrapperService.getMultiUserStatus(whiteboardId);

  return {
    presenterCursorId,
    multiUserCursorIds,
    isMultiUser,
  };
})(CursorWrapperContainer);


CursorWrapperContainer.propTypes = {
  // Defines the object which contains the id of the presenter's cursor
  presenterCursorId: PropTypes.shape({
    _id: PropTypes.string,
  }),
  // Defines an optional array of cursors when multu-user whiteboard is on
  multiUserCursorIds: PropTypes.arrayOf(PropTypes.object),
};

CursorWrapperContainer.defaultProps = {
  presenterCursorId: {},
  multiUserCursorIds: [],
};
