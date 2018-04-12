import Annotations from '/imports/api/annotations';

window.Annotations = Annotations;

const getAnnotationById = _id => Annotations.findOne({
  _id,
});

export default {
  getAnnotationById,
};
