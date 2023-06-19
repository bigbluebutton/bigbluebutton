import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import deviceInfo from '/imports/utils/deviceInfo';
import { injectIntl } from 'react-intl';
import InteractionsButton from './component';
import actionsBarService from '../service';
import { layoutSelect } from '../../layout/context';

const InteractionsButtonContainer = ({ ...props }) => {
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const { isMobile } = deviceInfo;
  const isRTL = layoutSelect((i) => i.isRTL);
  return (
    <InteractionsButton {...{
      layoutContextDispatch, sidebarContentPanel, isMobile, isRTL, ...props,
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

