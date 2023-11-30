import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/captions/service';
import WriterMenu from './component';
import { layoutDispatch } from '../../layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const WriterMenuContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  return amIModerator && <WriterMenu {...{ layoutContextDispatch, ...props }} />;
};

export default withTracker(({ setIsOpen }) => ({
  closeModal: () => setIsOpen(false),
  availableLocales: Service.getAvailableLocales(),
}))(WriterMenuContainer);
