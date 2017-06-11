import Storage from '/imports/ui/services/storage/session';

const setTextShapeValue = (text) => {
  Storage.setItem('whiteboardTextShapeValue', text);
};

export default {
  setTextShapeValue,
};
