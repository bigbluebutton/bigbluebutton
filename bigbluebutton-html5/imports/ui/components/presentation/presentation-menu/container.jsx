import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import PresentationMenu from './component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import Auth from '/imports/ui/services/auth';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import { useIsSnapshotOfCurrentSlideEnabled, useIsPopupPresentationEnabled } from '/imports/ui/services/features';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import {
  CURRENT_PAGE_WRITERS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

import {
  persistShape,
} from '/imports/ui/components/whiteboard/service';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

const PresentationMenuContainer = (props) => {
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element: currentElement, group: currentGroup } = fullscreen;
  const layoutContextDispatch = layoutDispatch();
  const { elementId, whiteboardId } = props;
  const isFullscreen = currentElement === elementId;
  const Settings = getSettingsSingletonInstance();
  const { isRTL } = Settings.application;
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let presentationDropdownItems = [];
  if (pluginsExtensibleAreasAggregatedState.presentationDropdownItems) {
    presentationDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.presentationDropdownItems,
    ];
  }

  const { data: whiteboardWritersData } = useDeduplicatedSubscription(
    CURRENT_PAGE_WRITERS_SUBSCRIPTION,
    {
      skip: !whiteboardId,
    },
  );
  const whiteboardWriters = whiteboardWritersData?.pres_page_writers || [];
  const hasWBAccess = whiteboardWriters?.some((writer) => writer.userId === Auth.userID);

  const meetingInfo = useMeeting((meeting) => ({
    name: meeting?.name,
  }));

  const handleToggleFullscreen = (ref, isdetached, popup) => FullscreenService.toggleFullScreen(ref, isdetached, popup);
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));
  const allowSnapshotOfCurrentSlide = useIsSnapshotOfCurrentSlideEnabled();
  const allowPopupPresentation = useIsPopupPresentationEnabled();

  return (
    <PresentationMenu
      {...props}
      {...{
        currentElement,
        currentGroup,
        isFullscreen,
        layoutContextDispatch,
        isRTL,
        presentationDropdownItems,
        hasWBAccess,
        meetingName: meetingInfo?.name,
        handleToggleFullscreen,
        isIphone,
        allowSnapshotOfCurrentSlide,
        allowPopupPresentation,
        persistShape,
        whiteboardWriters,
      }}
    />
  );
};

export default PresentationMenuContainer;

PresentationMenuContainer.propTypes = {
  whiteboardId: PropTypes.string.isRequired,
  elementId: PropTypes.string.isRequired,
};
