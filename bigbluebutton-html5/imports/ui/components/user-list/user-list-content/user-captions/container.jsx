import React from 'react';
import UserCaptionsItem from './component';
import Service from '/imports/ui/components/user-list/service';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import { useSubscription } from '@apollo/client';
import { getActiveCaptions } from '../../../captions/queries';
import logger from '/imports/startup/client/logger';

const knownLocales = window.meetingClientSettings.public.captions.locales;
const Container = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const {
    data: activeCaptionsData,
    loading: activeCaptionsLoading,
    errors: activeCaptionsErrors,
  } = useSubscription(getActiveCaptions);

  if (activeCaptionsLoading) return null;
  if (activeCaptionsErrors) {
    logger.info('Error while fetching current user', activeCaptionsErrors);
    return (
      <div>
        {JSON.stringify(activeCaptionsErrors)}
      </div>
    );
  }
  if (!activeCaptionsData || activeCaptionsData.length > 0) return null;
  const ownedLocales = activeCaptionsData
    .caption_typed_activeLocales
    .map((caption) => {
      const localeName = knownLocales.find((l) => l.locale === caption.lang).name;
      return {
        locale: caption.lang,
        name: localeName,
        ownerId: caption.userOwner.userId,
      };
    });
  const { roving } = Service;
  return (
    <UserCaptionsItem
      {
      ...{
        ownedLocales,
        sidebarContentPanel,
        layoutContextDispatch,
        roving,
        ...props,
      }
      }
    />
  );
};

export default Container;
