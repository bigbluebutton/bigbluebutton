import Annotations from '/imports/api/annotations';

const getAnnotationById = _id => Annotations.findOne({
  _id,
});

export default {
  getAnnotationById,
};
