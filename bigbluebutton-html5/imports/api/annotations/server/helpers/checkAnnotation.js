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
