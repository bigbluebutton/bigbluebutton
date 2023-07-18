import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { injectIntl } from 'react-intl';
import ReactionsButton from './component';
import actionsBarService from '../service';
import { SMALL_VIEWPORT_BREAKPOINT } from '/imports/ui/components/layout/enums';

const ReactionsButtonContainer = ({ ...props }) => {
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;

  return (
    <ReactionsButton {...{
      layoutContextDispatch, sidebarContentPanel, isMobile, ...props,
    }}
    />
  );
};

export default injectIntl(withTracker(() => {
  const currentUser = actionsBarService.currentUser();

  return {
    userId: currentUser.userId,
    emoji: currentUser.emoji,
    raiseHand: currentUser.raiseHand,
  };
})(ReactionsButtonContainer));

