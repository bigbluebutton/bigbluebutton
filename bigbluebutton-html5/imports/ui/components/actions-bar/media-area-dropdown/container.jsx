import React, { useContext } from 'react';
import { useMutation } from '@apollo/client';
import MediaAreaDropdown from './component';
import { layoutSelectInput, layoutDispatch, layoutSelect } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';
import {
  useIsCameraAsContentEnabled,
  useIsPresentationEnabled,
} from '/imports/ui/services/features';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import {
  PROCESSED_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { SET_PRESENTER } from '/imports/ui/core/graphql/mutations/userMutations';
import Auth from '/imports/ui/services/auth';
import { PRESENTATION_SET_CURRENT } from '../../presentation/mutations';
import { useMeetingIsBreakout } from '/imports/ui/components/app/service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const MediaAreaDropdownContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i) => i.isRTL);
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const meetingIsBreakout = useMeetingIsBreakout();

  let actionButtonDropdownItems = [];
  if (pluginsExtensibleAreasAggregatedState.actionButtonDropdownItems) {
    actionButtonDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.actionButtonDropdownItems,
    ];
  }

  const openActions = useShortcut('openActions');

  const { data: presentationData } = useDeduplicatedSubscription(
    PROCESSED_PRESENTATIONS_SUBSCRIPTION,
  );
  const presentations = presentationData?.pres_presentation || [];

  const {
    allowPresentationManagementInBreakouts,
  } = window.meetingClientSettings.public.app.breakouts;

  const isPresentationManagementDisabled = meetingIsBreakout
    && !allowPresentationManagementInBreakouts;

  const [setPresenter] = useMutation(SET_PRESENTER);
  const [presentationSetCurrent] = useMutation(PRESENTATION_SET_CURRENT);

  const handleTakePresenter = () => {
    setPresenter({ variables: { userId: Auth.userID } });
  };

  const setPresentation = (presentationId) => {
    presentationSetCurrent({ variables: { presentationId } });
  };

  const isPresentationEnabled = useIsPresentationEnabled();
  const isCameraAsContentEnabled = useIsCameraAsContentEnabled();
  const { data: currentUser } = useCurrentUser((u) => ({
    locked: u.locked,
  }));
  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));
  const isPresentationUploadDisabled = currentUser?.locked
    && meeting?.lockSettings?.disablePresentationUpload;

  return (
    <MediaAreaDropdown
      {...{
        layoutContextDispatch,
        sidebarContent,
        sidebarNavigation,
        isMobile,
        isRTL,
        actionButtonDropdownItems,
        presentations,
        setPresentation,
        isCameraAsContentEnabled,
        handleTakePresenter,
        shortcuts: openActions,
        isPresentationEnabled,
        isPresentationManagementDisabled,
        isPresentationUploadDisabled,
        ...props,
      }}
    />
  );
};

export default MediaAreaDropdownContainer;
