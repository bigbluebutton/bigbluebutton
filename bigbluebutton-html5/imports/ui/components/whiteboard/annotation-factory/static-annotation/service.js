import Annotations from '/imports/api/2.0/annotations';

const getAnnotationById = _id => Annotations.findOne({
  _id,
});

export default {
  getAnnotationById,
};
