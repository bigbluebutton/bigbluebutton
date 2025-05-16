import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { readFileAsDataURL, uploadImage } from '../../service';
import logger from '/imports/startup/client/logger';

const FileHandler = Extension.create({
  name: 'FileHandler',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('FileHandler'),
        props: {
          handleDrop(view, event, _slice, moved) {
            if (moved) return;

            if (event.dataTransfer) {
              const { files } = event.dataTransfer;
              const file = files[0];
              if (!file) return;
              readFileAsDataURL(file, (e) => {
                const data = e.target?.result;
                if (!data || typeof data !== 'string') return;
                uploadImage(data).then((url) => {
                  view.dispatch(view.state.tr.insert(
                    view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? -1,
                    view.state.schema.nodes.image.create({ src: url }),
                  ));
                }).catch(() => {
                  logger.error({
                    logCode: 'file_reading_error',
                  }, 'File upload error');
                });
              }, (error) => {
                logger.error({
                  logCode: 'file_reading_error',
                  extraInfo: {
                    errorName: error?.name,
                    errorMessage: error?.message,
                  },
                }, `File reading error: ${error?.message}`);
              });
            }
          },
        },
      }),
    ];
  },
});

export default FileHandler;
