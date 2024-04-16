import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import WriterMenu from './component';
import { layoutDispatch } from '../../layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useSubscription } from '@apollo/client';
import { getActiveCaptions } from '../queries';
import logger from '/imports/startup/client/logger';

const knownLocales = window.meetingClientSettings.public.captions.locales;
const WriterMenuContainer = (props) => {
  const {
    loading: captionsLoading,
    error: captionsError,
    data: captionsData,
  } = useSubscription(getActiveCaptions);

  const layoutContextDispatch = layoutDispatch();

  const {
    data: currentUserData,
    loading: currentUserLoading,
  } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  if (captionsLoading || currentUserLoading) return null;
  if (captionsError) {
    logger.error('Error while fetching captions', captionsError);
    return (
      <div>
        {JSON.stringify(captionsError)}
      </div>
    );
  }
  const amIModerator = currentUserData.isModerator;
  const activeCaptions = (captionsData?.caption_typed_activeLocales || [])
    .map((caption) => caption.lang);
  const availableLocales = knownLocales.filter((locale) => !activeCaptions.includes(locale.locale));

  return amIModerator
    && (
    <WriterMenu {...{
      availableLocales,
      layoutContextDispatch,
      ...props,
    }}
    />
    );
};

export default withTracker(({ setIsOpen }) => ({
  closeModal: () => setIsOpen(false),
}))(WriterMenuContainer);
