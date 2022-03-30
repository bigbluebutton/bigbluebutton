import { Annotations, UnsentAnnotations } from '/imports/ui/components/whiteboard/service';

const getAnnotationById = _id => Annotations.findOne({
  _id,
});

const getUnsentAnnotationById = _id => UnsentAnnotations.findOne({
  _id,
});

export default {
  getAnnotationById,
  getUnsentAnnotationById,
};
