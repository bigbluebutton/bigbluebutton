import Presentations from '/imports/api/presentations';
import { Slides, SlidePositions } from '/imports/api/slides';

const APP = Meteor.settings.public.app;

const getCurrentPresentation = (podId) => Presentations.findOne({
  podId,
  current: true,
});

const downloadPresentationUri = (podId) => {
  const currentPresentation = getCurrentPresentation(podId);
  if (!currentPresentation) {
    return null;
  }

  const { originalFileURI: uri } = currentPresentation;
  return `${APP.bbbWebBase}/${uri}`;
};

const isPresentationDownloadable = (podId) => {
  const currentPresentation = getCurrentPresentation(podId);
  if (!currentPresentation) {
    return null;
  }

  return currentPresentation.downloadable;
};

const getCurrentSlide = (podId) => {
  const currentPresentation = getCurrentPresentation(podId);

  if (!currentPresentation) {
    return null;
  }

  return Slides.findOne({
    podId,
    presentationId: currentPresentation.id,
    current: true,
  }, {
    fields: {
      meetingId: 0,
      thumbUri: 0,
      txtUri: 0,
    },
  });
};

const getSlidesLength = (podId) => getCurrentPresentation(podId)?.pages?.length || 0;

const getSlidePosition = (podId, presentationId, slideId) => SlidePositions.findOne({
  podId,
  presentationId,
  id: slideId,
});

const currentSlidHasContent = () => {
  const currentSlide = getCurrentSlide('DEFAULT_PRESENTATION_POD');
  if (!currentSlide) return false;

  const {
    content,
  } = currentSlide;

  return !!content.length;
};

export default {
  getCurrentSlide,
  getSlidePosition,
  isPresentationDownloadable,
  downloadPresentationUri,
  currentSlidHasContent,
  getCurrentPresentation,
  getSlidesLength,
};
