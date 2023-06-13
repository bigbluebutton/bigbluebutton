import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { injectIntl } from 'react-intl';
import InteractionsButton from './component';
import actionsBarService from '../service';

const InteractionsButtonContainer = ({ ...props }) => {
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  return (
    <InteractionsButton {...{
      layoutContextDispatch, sidebarContentPanel, ...props,
    }}
    />
  );
};

export default injectIntl(withTracker(() => {
  const currentUser = actionsBarService.currentUser();

  return {
    userId: currentUser.userId,
    emoji: currentUser.emoji,
  };
})(InteractionsButtonContainer));

