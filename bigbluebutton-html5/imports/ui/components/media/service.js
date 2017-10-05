import React from 'react';
import Presentations from '/imports/api/2.0/presentations';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import iosService from '/imports/ui/services/ios-handler/index';
import PresentationAreaContainer from '../presentation/container';
import VideoDockContainer from '../video-dock/container';
import ScreenshareContainer from '../screenshare/container';
import DefaultContent from '../presentation/default-content/component';

const getPresentationInfo = () => {
  const currentPresentation = Presentations.findOne({
    current: true,
  });

  return {
    current_presentation: (currentPresentation != null),

  };
};

function shouldShowWhiteboard() {
  return true;
}

function shouldShowScreenshare() {
  return isVideoBroadcasting();
}

function shouldShowOverlay() {
  return iosService.isIos();
}

function buildDefaultData() {
  const buildData = {};

  buildData.currentPresentation = getPresentationInfo();
  buildData.content = <DefaultContent />;

  if (shouldShowWhiteboard()) {
    buildData.content = <PresentationAreaContainer />;
  }

  if (shouldShowScreenshare()) {
    buildData.content = <ScreenshareContainer />;
  }

  if (shouldShowOverlay()) {
    buildData.overlay = <VideoDockContainer updateData={updateData} />;
  }

  buildData.overlayFocus = false;

  return buildData;
}

let data = buildDefaultData();

const dataDep = new Tracker.Dependency();

const getData = () => {
  dataDep.depend();
  return data;
};

const setData = (d) => {
  data = Object.assign(data, d);
  dataDep.changed();
};

const updateData = () => {
  if (!data.overlayFocus) {
    setData({
      overlay: <PresentationAreaContainer updateData={updateData} />,
      content: <VideoDockContainer />,
      overlayFocus: !data.overlayFocus,
    });
  } else {
    setData({
      content: <PresentationAreaContainer />,
      overlay: <VideoDockContainer updateData={updateData} />,
      overlayFocus: !data.overlayFocus,
    });
  }
};

export default {
  getData,
};
