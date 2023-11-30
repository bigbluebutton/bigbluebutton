import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/captions/service';
import WriterMenu from './component';
import { layoutDispatch } from '../../layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const WriterMenuContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  const { data: currentUserData } = useCurrentUser((user) => ({
    role: user.role,
  }));
  const amIModerator = currentUserData?.role === ROLE_MODERATOR;

  return amIModerator && <WriterMenu {...{ layoutContextDispatch, ...props }} />;
};

export default withTracker(({ setIsOpen }) => ({
  closeModal: () => setIsOpen(false),
  availableLocales: Service.getAvailableLocales(),
}))(WriterMenuContainer);
