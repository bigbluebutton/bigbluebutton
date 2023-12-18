import React from 'react';
import NotesDropdown from './component';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { useSubscription } from '@apollo/client';
import {
  PROCESSED_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const NotesDropdownContainer = ({ ...props }) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const amIPresenter = currentUserData?.presenter;
  const isRTL = layoutSelect((i) => i.isRTL);

  const { data: presentationData } = useSubscription(PROCESSED_PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];

  return <NotesDropdown {...{ amIPresenter, isRTL, presentations, ...props }} />;
};

export default NotesDropdownContainer;
