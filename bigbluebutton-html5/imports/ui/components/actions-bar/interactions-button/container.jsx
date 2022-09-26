import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import LayoutContext from '/imports/ui/components/layout/context';
import { injectIntl } from 'react-intl';
import InteractionsButton from './component';
import actionsBarService from '../service';
import { layoutSelect } from '../../layout/context';

const InteractionsButtonContainer = ({ ...props }) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { input } = layoutContextState;
  const { sidebarContent } = input;
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

export default injectIntl(withModalMounter(withTracker(() => {
  const currentUser = actionsBarService.currentUser();

  return {
    userId: currentUser.userId,
    emoji: currentUser.emoji,
  };
})(InteractionsButtonContainer)));
