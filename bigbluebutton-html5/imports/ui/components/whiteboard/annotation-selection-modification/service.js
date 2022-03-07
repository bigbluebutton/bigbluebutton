import { Tracker } from 'meteor/tracker';

let selectedAnnotations = [];
const selectionDep = new Tracker.Dependency();

const selectAnnotations = (annotations) => {
  selectedAnnotations = annotations;
  selectionDep.changed();
};

const getSelectedAnnotations = () => {
  selectionDep.depend();
  return selectedAnnotations;
};

const deselect = (annotationsToDeselect) => {
  selectedAnnotations = selectedAnnotations
    .filter((annotation) => !(annotationsToDeselect.constructor === Array
      ? annotationsToDeselect.includes(annotation.id)
      : annotationsToDeselect === annotation.id));
  selectionDep.changed();
};

export default {
  deselect,
  getSelectedAnnotations,
  selectAnnotations,
};
