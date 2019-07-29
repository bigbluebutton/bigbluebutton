import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { getSwapLayout } from '/imports/ui/components/media/service';
import { notify } from '/imports/ui/services/notification';
import PresentationAreaService from './service';
import PresentationArea from './component';
import PresentationToolbarService from './presentation-toolbar/service';

const PresentationAreaContainer = ({ presentationPodIds, mountPresentationArea, ...props }) => (
  mountPresentationArea && <PresentationArea {...props} />
);

export default withTracker(({ podId }) => {
  const currentSlide = PresentationAreaService.getCurrentSlide(podId);
  const presentationIsDownloadable = PresentationAreaService.isPresentationDownloadable(podId);
  return {
    currentSlide,
    downloadPresentationUri: PresentationAreaService.downloadPresentationUri(podId),
    userIsPresenter: PresentationAreaService.isPresenter(podId) && !getSwapLayout(),
    multiUser: PresentationAreaService.getMultiUserStatus(currentSlide && currentSlide.id)
      && !getSwapLayout(),
    presentationIsDownloadable,
    mountPresentationArea: !!currentSlide,
    currentPresentation: PresentationAreaService.getCurrentPresentation(podId),
    notify,
    zoomSlide: PresentationToolbarService.zoomSlide,
  };
})(PresentationAreaContainer);
