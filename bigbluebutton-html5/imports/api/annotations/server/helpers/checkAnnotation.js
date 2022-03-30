import { check } from 'meteor/check';

export default function checkAnnotation(annotation) {
  check(annotation, Match.ObjectIncluding({ annotationType: String }));
  if (annotation.annotationType === 'text') {
    check(annotation, {
      id: String,
      status: String,
      annotationType: String,
      annotationInfo: {
        x: Number,
        y: Number,
        fontColor: Number,
        calcedFontSize: Number,
        textBoxWidth: Number,
        text: String,
        textBoxHeight: Number,
        id: String,
        whiteboardId: String,
        status: String,
        fontSize: Number,
        dataPoints: String,
        type: String,
      },
      wbId: String,
      userId: String,
      position: Number,
    });
  } else if (annotation.annotationType === 'rectangle' || annotation.annotationType === 'triangle' || annotation.annotationType === 'ellipse' || annotation.annotationType === 'line') {
    // line does not have the 'fill' property but this is necessary as 'fill' is anyway added at ui/components/whiteboard/whiteboard-overlay/shape-draw-listener/component.jsx
    // Any other shape excluding pencil and text (e.g., eraser) needs to be added here.
    check(annotation, {
      id: String,
      status: String,
      annotationType: String,
      annotationInfo: {
        color: Number,
        thickness: Number,
        fill: Boolean,
        points: Array,
        id: String,
        whiteboardId: String,
        status: String,
        type: String,
        dimensions: Match.Maybe([Number]),
      },
      wbId: String,
      userId: String,
      position: Number,
    });
  } else {
    check(annotation, {
      id: String,
      status: String,
      annotationType: String,
      annotationInfo: {
        color: Number,
        thickness: Number,
        points: Array,
        id: String,
        whiteboardId: String,
        status: String,
        type: String,
        dimensions: Match.Maybe([Number]),
      },
      wbId: String,
      userId: String,
      position: Number,
    });
  }
}
