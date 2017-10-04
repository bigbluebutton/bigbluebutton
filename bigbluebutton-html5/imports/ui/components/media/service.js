import Presentations from '/imports/api/2.0/presentations';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import React from 'react';
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
  return true;
}


const buildDefaultData = () => {
  const data = {};

  data.currentPresentation = getPresentationInfo();
  data.content = <DefaultContent />;

  if (shouldShowWhiteboard()) {
    data.content = <PresentationAreaContainer />;
  }

  if (shouldShowScreenshare()) {
    data.content = <ScreenshareContainer />;
  }

  if (shouldShowOverlay()) {
    data.overlay = <VideoDockContainer updateData={updateData} />;
  }

  data.overlayFocus = false;

  return data;
};

const updateData = (updatedData) => {
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

export default {
  getData,
};
