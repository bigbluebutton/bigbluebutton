import logger from '/imports/startup/client/logger';

const MIME_TYPES_ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 5000; // KBytes

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
  message,
  callback,
) => (e) => {
  logger.warn({
    logCode: code,
    extraInfo: {
      errorName: e.name,
      errorMessage: e.message,
    },
  }, `${message}: ${e.message}`);

  if (callback) callback(e);
};

const load = (onError, onSuccess) => {
  withObjectStore({
    onError: genericErrorHandlerBuilder(
      'IndexedDB_access',
      'Error on load custom backgrounds from IndexedDB',
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

const save = (background, onError) => {
  withObjectStore({
    onError: genericErrorHandlerBuilder(
      'IndexedDB_access',
      'Error on save custom background to IndexedDB',
      onError,
    ),
    onSuccess: (objectStore) => {
      objectStore.add(background);
    },
  });
};

const del = (key, onError) => {
  withObjectStore({
    onError: genericErrorHandlerBuilder(
      'IndexedDB_access',
      'Error on delete custom background from IndexedDB',
      onError,
    ),
    onSuccess: (objectStore) => {
      objectStore.delete(key);
    },
  });
};

const update = (background) => {
  withObjectStore({
    onError: genericErrorHandlerBuilder(
      'IndexedDB_access',
      'Error on update custom background in IndexedDB',
      'Something wrong while updating custom background',
    ),
    onSuccess: (objectStore) => {
      objectStore.put(background);
    },
  });
};

// Function to convert image URL to a File object
async function getFileFromUrl(url) {
  try {
    const response = await fetch(url, {
      credentials: 'omit',
      mode: 'cors',
      headers: {
        Accept: 'image/*',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const file = new File([blob], 'fetchedWebcamBackground', { type: blob.type });
    return file;
  } catch (error) {
    logger.error({
      logCode: 'image_fetch_error',
      extraInfo: {
        errorMessage: error?.message,
        errorName: error?.name,
        errorStack: error?.stack,
      },
    }, `Fetching image from ${url} failed.`);
    return null;
  }
}

export default {
  load,
  save,
  del,
  update,
  MIME_TYPES_ALLOWED,
  MAX_FILE_SIZE,
  getFileFromUrl,
};
