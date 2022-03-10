import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import Service from '/imports/ui/components/captions/service';
import WriterMenu from './component';
import { layoutDispatch } from '../../layout/context';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const WriterMenuContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const amIModerator = currentUser.role === ROLE_MODERATOR;

  return amIModerator && <WriterMenu {...{ layoutContextDispatch, ...props }} />;
};

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => mountModal(null),
  availableLocales: Service.getAvailableLocales(),
}))(WriterMenuContainer));
