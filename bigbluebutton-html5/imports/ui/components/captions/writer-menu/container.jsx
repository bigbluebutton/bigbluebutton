import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import CaptionsService from '/imports/ui/components/captions/service';
import WriterMenu from './component';
import LayoutContext from '../../layout/context';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const WriterMenuContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextDispatch } = layoutContext;
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const amIModerator = currentUser.role === ROLE_MODERATOR;

  return amIModerator && <WriterMenu {...{ layoutContextDispatch, ...props }} />;
};

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => mountModal(null),
  allLocales: CaptionsService.getAvailableLocales(),
  takeOwnership: (locale) => CaptionsService.takeOwnership(locale),
}))(WriterMenuContainer));
