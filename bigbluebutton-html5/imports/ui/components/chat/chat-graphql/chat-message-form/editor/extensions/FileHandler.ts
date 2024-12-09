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
          handleDrop(view, event, slice, moved) {
            console.log(view, event, slice, moved);

            if (event.dataTransfer) {
              const { files } = event.dataTransfer;
              const file = files[0];
              readFileAsDataURL(file, (e) => {
                const data = e.target?.result;
                if (!data || typeof data !== 'string') return;
                uploadImage(data).then((url) => {
                  // view?.chain().focus().setImage({ src: url, title: file.name }).run();
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
