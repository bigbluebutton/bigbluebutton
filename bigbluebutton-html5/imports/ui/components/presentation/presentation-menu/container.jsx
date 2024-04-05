import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import PresentationMenu from './component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import { isSnapshotOfCurrentSlideEnabled } from '/imports/ui/services/features';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import {
  persistShape,
} from '/imports/ui/components/whiteboard/service';

const PresentationMenuContainer = (props) => {
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element: currentElement, group: currentGroup } = fullscreen;
  const layoutContextDispatch = layoutDispatch();
  const { elementId } = props;
  const isFullscreen = currentElement === elementId;
  const isRTL = layoutSelect((i) => i.isRTL);
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let presentationDropdownItems = [];
  if (pluginsExtensibleAreasAggregatedState.presentationDropdownItems) {
    presentationDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.presentationDropdownItems,
    ];
  }

  const meetingInfo = useMeeting((meeting) => ({
    name: meeting?.name,
  }));

  const handleToggleFullscreen = (ref) => FullscreenService.toggleFullScreen(ref);
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));

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
        meetingName: meetingInfo?.name,
        handleToggleFullscreen,
        isIphone,
        allowSnapshotOfCurrentSlide: isSnapshotOfCurrentSlideEnabled(),
        persistShape,
      }}
    />
  );
};

export default PresentationMenuContainer;

PresentationMenuContainer.propTypes = {
  elementId: PropTypes.string.isRequired,
};
