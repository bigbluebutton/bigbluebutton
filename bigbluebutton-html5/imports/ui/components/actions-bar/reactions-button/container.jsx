import React from 'react';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { injectIntl } from 'react-intl';
import ReactionsButton from './component';
import { SMALL_VIEWPORT_BREAKPOINT } from '/imports/ui/components/layout/enums';
import Auth from '/imports/ui/services/auth';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';

const ReactionsButtonContainer = ({ ...props }) => {
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;

  const { data: currentUserData } = useCurrentUser((user) => ({
    emoji: user.emoji,
    raiseHand: user.raiseHand,
    away: user.away,
    voice: user.voice,
    reactionEmoji: user.reactionEmoji,
  }));
  const { data: unmutedUsers } = useWhoIsUnmuted();

  const currentUser = {
    userId: Auth.userID,
    emoji: currentUserData?.emoji,
    raiseHand: currentUserData?.raiseHand,
    away: currentUserData?.away,
    muted: !unmutedUsers[Auth.userID],
  };

  const { autoCloseReactionsBar } = useSettings(SETTINGS.APPLICATION);

  return (
    <ReactionsButton {...{
      currentUserReaction: currentUserData?.reactionEmoji ?? 'none',
      layoutContextDispatch,
      sidebarContentPanel,
      isMobile,
      autoCloseReactionsBar,
      ...currentUser,
      ...props,
    }}
    />
  );
};

export default injectIntl(ReactionsButtonContainer);
