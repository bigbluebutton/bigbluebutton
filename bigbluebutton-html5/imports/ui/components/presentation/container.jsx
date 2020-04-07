import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
import { notify } from '/imports/ui/services/notification';
import PresentationAreaService from './service';
import { Slides } from '/imports/api/slides';
import PresentationArea from './component';
import PresentationToolbarService from './presentation-toolbar/service';

const PresentationAreaContainer = ({ presentationPodIds, mountPresentationArea, ...props }) => (
  mountPresentationArea && <PresentationArea {...props} />
);

const APP_CONFIG = Meteor.settings.public.app;
const PRELOAD_NEXT_SLIDE = APP_CONFIG.preloadNextSlides;
const fetchedpresentation = {};
let canFetch = true;
window.test = fetchedpresentation;
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
    if (!fetchedpresentation[presentationId]) {
      fetchedpresentation[presentationId] = {
        fetchedSlide: {},
      };
    }
    const currentSlideNum = currentSlide.num;
    const presentation = fetchedpresentation[presentationId];
    if (!presentation.fetchedSlide[currentSlide.num + PRELOAD_NEXT_SLIDE] && canFetch) {
      const slidesToFetch = Slides.find({
        podId,
        presentationId,
        num: {
          $in: Array(PRELOAD_NEXT_SLIDE).fill(1).map((v, idx) => currentSlideNum + (idx + 1)),
        },
      }).fetch();

      const promiseImageGet = slidesToFetch
        .filter(s => !fetchedpresentation[presentationId].fetchedSlide[s.num])
        .map(async (slide) => {
          if (canFetch) canFetch = false;
          const image = await fetch(slide.imageUri);
          if (image.ok) {
            presentation.fetchedSlide[slide.num] = true;
          }
        });
      Promise.all(promiseImageGet).then(() => canFetch = true);
    }
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
