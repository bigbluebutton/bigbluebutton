import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
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
  const layoutSwapped = getSwapLayout() && shouldEnableSwapLayout();

  let slidePosition;
  if (currentSlide) {
    const {
      presentationId,
      id: slideId,
    } = currentSlide;
    slidePosition = PresentationAreaService.getSlidePosition(podId, presentationId, slideId);
  }
  return {
    currentSlide,
    slidePosition,
    downloadPresentationUri: PresentationAreaService.downloadPresentationUri(podId),
    userIsPresenter: PresentationAreaService.isPresenter(podId) && !layoutSwapped,
    multiUser: PresentationAreaService.getMultiUserStatus(currentSlide && currentSlide.id)
      && !layoutSwapped,
    presentationIsDownloadable,
    mountPresentationArea: !!currentSlide,
    currentPresentation: PresentationAreaService.getCurrentPresentation(podId),
    notify,
    zoomSlide: PresentationToolbarService.zoomSlide,
    podId,
  };
})(PresentationAreaContainer);
