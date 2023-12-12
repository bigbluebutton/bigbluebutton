import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { injectIntl } from 'react-intl';
import ReactionsButton from './component';
import UserReactionService from '/imports/ui/components/user-reaction/service';
import { SMALL_VIEWPORT_BREAKPOINT } from '/imports/ui/components/layout/enums';
import SettingsService from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const ReactionsButtonContainer = ({ ...props }) => {
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;

  const { data: currentUserData } = useCurrentUser((user) => ({
    emoji: user.emoji,
    raiseHand: user.raiseHand,
  }));
  const currentUser = {
    userId: Auth.userID,
    emoji: currentUserData?.emoji,
    raiseHand: currentUserData?.raiseHand,
  };

  return (
    <ReactionsButton {...{
      layoutContextDispatch, sidebarContentPanel, isMobile, ...currentUser, ...props,
    }}
    />
  );
};

export default injectIntl(withTracker(() => {
  const currentUserReaction = UserReactionService.getUserReaction(Auth.userID);

  return {
    currentUserReaction: currentUserReaction.reaction,
    autoCloseReactionsBar: SettingsService?.application?.autoCloseReactionsBar,
  };
})(ReactionsButtonContainer));

