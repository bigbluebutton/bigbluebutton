import React from 'react';
import NotesDropdown from './component';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { useSubscription, useMutation } from '@apollo/client';
import {
  PROCESSED_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { PRESENTATION_SET_CURRENT, PRESENTATION_REMOVE } from '../../presentation/mutations';
import { EXTERNAL_VIDEO_STOP } from '../../external-video-player/mutations';

const NotesDropdownContainer = ({ ...props }) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const amIPresenter = currentUserData?.presenter;
  const isRTL = layoutSelect((i) => i.isRTL);

  const { data: presentationData } = useSubscription(PROCESSED_PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];

  const [presentationSetCurrent] = useMutation(PRESENTATION_SET_CURRENT);
  const [presentationRemove] = useMutation(PRESENTATION_REMOVE);
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);

  const setPresentation = (presentationId) => {
    presentationSetCurrent({ variables: { presentationId } });
  };

  const removePresentation = (presentationId) => {
    presentationRemove({ variables: { presentationId } });
  };

  return (
    <NotesDropdown
      {
      ...{
        amIPresenter,
        isRTL,
        presentations,
        setPresentation,
        removePresentation,
        stopExternalVideoShare,
        ...props,
      }
      }
    />
  );
};

export default NotesDropdownContainer;
