import { Slides } from '/imports/api/slides';
import PresentationPods from '/imports/api/presentation-pods';

export default function isPodPresenter(meetingId, whiteboardId, userId) {
  const slide = Slides.findOne({ meetingId, id: whiteboardId });
  const pod = PresentationPods.findOne({ meetingId, podId: slide.podId });

  return pod.currentPresenterId === userId;
}
