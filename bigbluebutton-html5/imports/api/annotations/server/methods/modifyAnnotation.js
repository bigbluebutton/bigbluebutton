import AnnotationsStreamer from '../streamer';
import removeAnnotation from '../modifiers/removeAnnotation';

export default function deleteAnnotation(meetingId, whiteboardId, annotationId) {
  AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, annotationId });
  removeAnnotation(meetingId, whiteboardId, annotationId);
}
