import { UnsentAnnotations } from '/imports/ui/components/whiteboard/service';

const getAnnotationById = _id => UnsentAnnotations.findOne({
  _id,
});

export default {
  getAnnotationById,
};
