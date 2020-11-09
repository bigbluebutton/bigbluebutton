import { UPLOAD_FILE_COLLECTION } from '/imports/api/presentations/constants';

export const getFileType = (name) => {
  if (!name) {
    return '';
  }

  const extention = name.split('.').pop().toUpperCase();

  const collection = _.find(UPLOAD_FILE_COLLECTION, ({ values }) => values.indexOf(extention) >= 0);

  if (!collection) {
    return null;
  }

  return collection.type;
};

export default null;
