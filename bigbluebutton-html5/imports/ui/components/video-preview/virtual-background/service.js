import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';

const withObjectStore = ({
  onError,
  onSuccess,
}) => {
  const request = window.indexedDB.open('BBB', 1);

  request.onerror = onError;

  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    db.createObjectStore('CustomBackgrounds', { keyPath: 'uniqueId' });
  };

  request.onsuccess = (e) => {
    const db = e.target.result;
    const transaction = db.transaction(['CustomBackgrounds'], 'readwrite');
    const objectStore = transaction.objectStore('CustomBackgrounds');

    onSuccess(objectStore);
  };
};

const genericErrorHandlerBuilder = (
  code,
  errorMessage,
  notifyMessage,
  callback,
) => (e) => {
  notify(notifyMessage, 'error', 'warning');
  logger.warn({
    logCode: code,
    extraInfo: {
      errorName: e.name,
      errorMessage: e.message,
    },
  }, `${errorMessage}: ${e.message}`);

  if (callback) callback(e);
};

const load = (onError, onSuccess) => {
  withObjectStore({
    onError: genericErrorHandlerBuilder(
      'IndexedDB_access',
      'Error on load custom backgrounds to IndexedDB',
      'Something wrong while loading custom backgrounds',
      onError,
    ),
    onSuccess: (objectStore) => {
      const backgrounds = [];

      objectStore.openCursor().onsuccess = (e) => {
        const cursor = e.target.result;

        if (cursor) {
          backgrounds.push(cursor.value);
          cursor.continue();
        } else {
          onSuccess(backgrounds);
        }
      };
    },
  });
};

const save = (background) => {
  withObjectStore({
    onError: genericErrorHandlerBuilder(
      'IndexedDB_access',
      'Error on save custom background to IndexedDB',
      'Something wrong while saving custom background',
    ),
    onSuccess: (objectStore) => {
      objectStore.add(background);
    },
  });
};

const del = (key) => {
  withObjectStore({
    onError: genericErrorHandlerBuilder(
      'IndexedDB_access',
      'Error on delete custom background to IndexedDB',
      'Something wrong while deleting custom background',
    ),
    onSuccess: (objectStore) => {
      objectStore.delete(key);
    },
  });
};

export default {
  load,
  save,
  del,
};
