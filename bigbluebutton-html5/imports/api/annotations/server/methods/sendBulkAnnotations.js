import { check } from 'meteor/check';
import sendAnnotation from './sendAnnotation';

export default function sendBulkAnnotations(credentials, payload) {
  check(credentials, Object);
  check(payload, [Object]);

  payload.forEach(annotation => sendAnnotation(credentials, annotation));
}
