import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/captions/service';
import Captions from './component';
import Auth from '/imports/ui/services/auth';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import useCurrentUser from '../../core/hooks/useCurrentUser';
import logger from '/imports/startup/client/logger';
import { useSubscription } from '@apollo/client';
import { getActiveCaptions } from './queries';

const Container = (props) => {
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();

  const {
    data: currentUserData,
    loading: currentUserLoading,
    errors: currentUserErrors,
  } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
    userId: u.userId,
  }));

  const {
    loading: captionsLoading,
    error: captionsError,
    data: captionsData,
  } = useSubscription(getActiveCaptions);

  if (currentUserLoading || captionsLoading) return null;
  if (currentUserErrors) {
    logger.info('Error while fetching current user', currentUserErrors);
    return (
      <div>
        {JSON.stringify(currentUserErrors)}
      </div>
    );
  }

  if (captionsError) {
    logger.info('Error while fetching captions', captionsError);
    return (
      <div>
        {JSON.stringify(captionsError)}
      </div>
    );
  }
  if (!captionsData) return null;
  const locale = Service.getCaptionsLocale();
  const ownerId = captionsData?.caption_typed_activeLocales?.userOwner?.userId
    ?? currentUserData.userId;
  const ownerName = captionsData?.caption_typed_activeLocales?.userOwner?.name
    ?? currentUserData.name;
  const dictating = true;
  const dictation = Service.canIDictateThisPad(ownerId);
  const hasPermission = ownerId === currentUserData.userId;

  if (!currentUserData.isModerator) {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
    return null;
  }

  return (
    <Captions
      {
        ...{
          ...props,
          layoutContextDispatch,
          isResizing,
          locale,
          ownerId,
          ownerName,
          dictating,
          dictation,
          hasPermission,
        }
      }
    />
  );
};

export default withTracker(() => {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return {
    currentUserId: Auth.userID,
    isRTL,
  };
})(Container);
