import Storage from '/imports/ui/services/storage/session';

const DRAW_SETTINGS = 'drawSettings';

const setTextShapeValue = (text) => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (drawSettings) {
    drawSettings.textShape.textShapeValue = text;
    Storage.setItem(DRAW_SETTINGS, drawSettings);
  }
};

const resetTextShapeActiveId = () => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  if (drawSettings) {
    drawSettings.textShape.textShapeActiveId = '';
    Storage.setItem(DRAW_SETTINGS, drawSettings);
  }
};

const activeTextShapeId = () => {
  const drawSettings = Storage.getItem(DRAW_SETTINGS);
  return drawSettings ? drawSettings.textShape.textShapeActiveId : '';
};

export default {
  setTextShapeValue,
  activeTextShapeId,
  resetTextShapeActiveId,
};
