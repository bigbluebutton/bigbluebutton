import React,  { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Note from './component';
import NoteService from './service';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const NoteContainer = ({ children, ...props }) => {
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const amIModerator = currentUser.role === ROLE_MODERATOR;

  return (
    <Note {...{ amIModerator, layoutContextDispatch, isResizing, ...props }}>
      {children}
    </Note>
  );
};

export default withTracker(() => {
  const isLocked = NoteService.isLocked();
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return {
    isLocked,
    isRTL,
  };
})(NoteContainer);
