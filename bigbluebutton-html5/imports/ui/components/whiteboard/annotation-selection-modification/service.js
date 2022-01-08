let selectedAnnotations = [];

const selectAnnotations = (annotationIds) => {
  selectedAnnotations = annotationIds;
};

const getSelectedAnnotations = () => selectedAnnotations;

export default {
  getSelectedAnnotations,
  selectAnnotations,
};
