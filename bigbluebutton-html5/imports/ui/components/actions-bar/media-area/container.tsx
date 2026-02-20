import React, {
  useCallback, useContext,
} from 'react';
import { useMutation } from '@apollo/client';
import { MediaAreaContainerProps, MediaButtonPluginItem } from './types';
import MediaArea from './component';
import { layoutSelectInput, layoutSelect } from '../../layout/context';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';
import {
  useIsCameraAsContentEnabled,
  useIsPresentationEnabled,
} from '/imports/ui/services/features';
import { useIsCameraAsContentBroadcasting } from '/imports/ui/components/screenshare/service';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { SET_PRESENTER } from '/imports/ui/core/graphql/mutations/userMutations';
import Auth from '/imports/ui/services/auth';
import { useMeetingIsBreakout } from '/imports/ui/components/app/service';
import { USER_SET_PRESENTER_REQUEST } from '/imports/ui/components/request-presenter/mutations';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const MediaAreaContainer = (props: MediaAreaContainerProps) => {
  const {
    amIPresenter,
    amIModerator,
    allowExternalVideo,
    intl,
    isSharingVideo,
    stopExternalVideoShare,
    isConnected,
    hasPresentation,
  } = props;

  const { width: browserWidth } = layoutSelectInput((i: Input) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const meetingIsBreakout = useMeetingIsBreakout();
  const hasCameraAsContent = useIsCameraAsContentBroadcasting();

  const { data: currentUserData } = useCurrentUser((u) => ({
    requestedPresenter: u.requestedPresenter,
    locked: u.locked,
  }));

  const isRequestingPresenter = currentUserData?.requestedPresenter ?? false;

  const { data: meetingData } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));

  const isLockedUser = currentUserData?.locked ?? false;
  const disablePresenterRequest = isLockedUser
    && (meetingData?.lockSettings?.disablePresenterRequest ?? false);

  let mediaAreaItems: MediaButtonPluginItem[] = [];
  if (pluginsExtensibleAreasAggregatedState.mediaAreaItems) {
    mediaAreaItems = [
      ...(pluginsExtensibleAreasAggregatedState.mediaAreaItems as unknown as MediaButtonPluginItem[]),
    ];
  }

  const { allowPresentationManagementInBreakouts } = window.meetingClientSettings.public.app.breakouts;

  const isPresentationManagementDisabled = meetingIsBreakout
    && !allowPresentationManagementInBreakouts;

  const [setPresenter] = useMutation(SET_PRESENTER);
  const [setPresenterRequest] = useMutation(USER_SET_PRESENTER_REQUEST);

  const handleTakePresenter = useCallback(() => {
    setPresenter({ variables: { userId: Auth.userID } });
  }, [setPresenter]);

  const handleRequestPresenter = useCallback(() => {
    setPresenterRequest({
      variables: {
        requestedPresenter: true,
      },
    });
  }, [setPresenterRequest]);

  const isPresentationEnabled = useIsPresentationEnabled();
  const isCameraAsContentEnabled = useIsCameraAsContentEnabled();

  return (
    <MediaArea
      isMobile={isMobile}
      isRTL={isRTL}
      mediaAreaItems={mediaAreaItems}
      isCameraAsContentEnabled={isCameraAsContentEnabled}
      hasCameraAsContent={hasCameraAsContent}
      handleRequestPresenter={handleRequestPresenter}
      handleTakePresenter={handleTakePresenter}
      isPresentationEnabled={isPresentationEnabled}
      isPresentationManagementDisabled={isPresentationManagementDisabled}
      amIPresenter={amIPresenter}
      amIModerator={amIModerator}
      allowExternalVideo={allowExternalVideo}
      intl={intl}
      isSharingVideo={isSharingVideo}
      stopExternalVideoShare={stopExternalVideoShare}
      isConnected={isConnected}
      hasPresentation={hasPresentation}
      isRequestingPresenter={isRequestingPresenter}
      disablePresenterRequest={disablePresenterRequest}
    />
  );
};

export default MediaAreaContainer;
