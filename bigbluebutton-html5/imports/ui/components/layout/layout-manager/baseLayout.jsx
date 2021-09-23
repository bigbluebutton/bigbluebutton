import React from 'react';
import PropTypes from 'prop-types';
import { layoutSelect, layoutSelectInput } from '/imports/ui/components/layout/context';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';

import CustomLayout from '/imports/ui/components/layout/layout-manager/customLayout';
import SmartLayout from '/imports/ui/components/layout/layout-manager/smartLayout';
import PresentationFocusLayout from '/imports/ui/components/layout/layout-manager/presentationFocusLayout';
import VideoFocusLayout from '/imports/ui/components/layout/layout-manager/videoFocusLayout';

const propTypes = {
  layoutType: PropTypes.string.isRequired,
};

const BaseLayout = ({ layoutType }) => {
  const bannerBarInput = layoutSelectInput((i) => i.bannerBar);
  const notificationsBarInput = layoutSelectInput((i) => i.notificationsBar);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentationInput = layoutSelectInput((i) => i.presentation);

  const fullscreen = layoutSelect((i) => i.fullscreen);
  const isRTL = layoutSelect((i) => i.isRTL);

  const windowWidth = () => window.document.documentElement.clientWidth;
  const windowHeight = () => window.document.documentElement.clientHeight;

  const bannerAreaHeight = () => {
    const { hasNotification } = notificationsBarInput;
    const { hasBanner } = bannerBarInput;
    const bannerHeight = hasBanner ? DEFAULT_VALUES.bannerHeight : 0;
    const notificationHeight = hasNotification ? DEFAULT_VALUES.bannerHeight : 0;

    return bannerHeight + notificationHeight;
  };

  const baseCameraDockBounds = (mediaAreaBounds, sidebarSize) => {
    const { isOpen } = presentationInput;

    const cameraDockBounds = {};

    if (cameraDockInput.numCameras === 0) {
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;

      return cameraDockBounds;
    }

    if (!isOpen) {
      cameraDockBounds.width = mediaAreaBounds.width;
      cameraDockBounds.maxWidth = mediaAreaBounds.width;
      cameraDockBounds.height = mediaAreaBounds.height;
      cameraDockBounds.maxHeight = mediaAreaBounds.height;
      cameraDockBounds.top = DEFAULT_VALUES.navBarHeight;
      cameraDockBounds.left = !isRTL ? mediaAreaBounds.left : 0;
      cameraDockBounds.right = isRTL ? sidebarSize : null;
    }

    if (fullscreen.group === 'webcams') {
      cameraDockBounds.width = windowWidth();
      cameraDockBounds.minWidth = windowWidth();
      cameraDockBounds.maxWidth = windowWidth();
      cameraDockBounds.height = windowHeight();
      cameraDockBounds.minHeight = windowHeight();
      cameraDockBounds.maxHeight = windowHeight();
      cameraDockBounds.top = 0;
      cameraDockBounds.left = 0;
      cameraDockBounds.right = 0;
      cameraDockBounds.zIndex = 99;

      return cameraDockBounds;
    }

    return cameraDockBounds;
  };

  const common = {
    bannerAreaHeight,
    baseCameraDockBounds,
  };

  switch (layoutType) {
    case LAYOUT_TYPE.CUSTOM_LAYOUT:
      return <CustomLayout {...common} />;
    case LAYOUT_TYPE.SMART_LAYOUT:
      return <SmartLayout {...common} />;
    case LAYOUT_TYPE.PRESENTATION_FOCUS:
      return <PresentationFocusLayout {...common} />;
    case LAYOUT_TYPE.VIDEO_FOCUS:
      return <VideoFocusLayout {...common} />;
    default:
      return <CustomLayout {...common} />;
  }
};

BaseLayout.propTypes = propTypes;

export default BaseLayout;
