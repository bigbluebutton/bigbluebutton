import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { getSwapLayout } from '/imports/ui/components/media/service';
import PresentationAreaService from './service';
import PresentationArea from './component';

const PresentationAreaContainer = ({ presentationPodIds, mountPresentationArea, ...props }) => (
  mountPresentationArea && <PresentationArea {...props} />
);

export default withTracker(({ podId }) => {
  const currentSlide = PresentationAreaService.getCurrentSlide(podId);
  const presentationIsDownloadable = PresentationAreaService.isPresentationDownloadable(podId);
  const isFullscreen = Session.get('isFullscreen');
  return {
    currentSlide,
    downloadPresentationUri: PresentationAreaService.downloadPresentationUri(podId),
    userIsPresenter: PresentationAreaService.isPresenter(podId) && !getSwapLayout(),
    multiUser: PresentationAreaService.getMultiUserStatus(currentSlide && currentSlide.id)
      && !getSwapLayout(),
    presentationIsDownloadable,
    isFullscreen,
    mountPresentationArea: !!currentSlide,
  };
})(PresentationAreaContainer);
