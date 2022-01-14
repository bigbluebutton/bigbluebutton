import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserPolls from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';

const UserPollsContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  return (
    <UserPolls
      {...{
        sidebarContentPanel,
        layoutContextDispatch,
        ...props,
      }}
    />
  );
};

export default withTracker(({ isPresenter }) => ({
  pollIsOpen: Session.equals('isPollOpen', true),
  forcePollOpen: Session.equals('forcePollOpen', true),
}))(UserPollsContainer);
