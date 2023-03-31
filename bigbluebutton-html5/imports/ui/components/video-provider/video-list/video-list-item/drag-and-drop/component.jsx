import React, { useContext, useEffect, useState, useCallback } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import { CustomVirtualBackgroundsContext } from '/imports/ui/components/video-preview/virtual-background/context';
import { EFFECT_TYPES } from '/imports/ui/services/virtual-background/service';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import VirtualBgService from '/imports/ui/components/video-preview/virtual-background/service';
import logger from '/imports/startup/client/logger';
import withFileReader from '/imports/ui/components/common/file-reader/component';

const { MIME_TYPES_ALLOWED, MAX_FILE_SIZE } = VirtualBgService;

const intlMessages = defineMessages({
  confirmationTitle: {
    id: 'app.confirmation.virtualBackground.title',
    description: 'Confirmation modal title',
  },
  confirmationDescription: {
    id: 'app.confirmation.virtualBackground.description',
    description: 'Confirmation modal description',
  },
});

const ENABLE_WEBCAM_BACKGROUND_UPLOAD = Meteor.settings.public.virtualBackgrounds.enableVirtualBackgroundUpload;

const DragAndDrop = (props) => {
  const { children, mountModal, intl, readFile } = props;

  const [dragging, setDragging] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const { dispatch: dispatchCustomBackground } = useContext(CustomVirtualBackgroundsContext);

  const resetEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  useEffect(() => {
    const onDragOver = (e) => {
      resetEvent(e);
      setDragging(true);
    };
    const onDragLeave = (e) => {
      resetEvent(e);
      setDragging(false);
    };
    const onDrop = (e) => {
      resetEvent(e);
      setDragging(false);
    };

    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  const makeDragOperations = useCallback((onAction, userId) => {
    if (!userId || Auth.userID !== userId || !ENABLE_WEBCAM_BACKGROUND_UPLOAD) return {};

    const startAndSaveVirtualBackground = (file) => {
      const onSuccess = (background) => {
        const { filename, data } = background;
        onAction(EFFECT_TYPES.IMAGE_TYPE, filename, data).then(() => {
          dispatchCustomBackground({
            type: 'new',
            background: {
              ...background,
              custom: true,
              lastActivityDate: Date.now(),
            },
          });
        });
      };

      const onError = (error) => {
        logger.warn({
          logCode: 'read_file_error',
          extraInfo: {
            errorName: error.name,
            errorMessage: error.message,
          },
        }, error.message);
      };

      readFile(file, onSuccess, onError);
    };

    const onDragOverHandler = (e) => {
      resetEvent(e);
      setDraggingOver(true);
      setDragging(false);
    };

    const onDropHandler = (e) => {
      resetEvent(e);
      setDraggingOver(false);
      setDragging(false);

      const { files } = e.dataTransfer;
      const file = files[0];

      if (Session.get('skipBackgroundDropConfirmation')) {
        return startAndSaveVirtualBackground(file);
      }

      const onConfirm = (confirmParam, checked) => {
        startAndSaveVirtualBackground(file);
        Session.set('skipBackgroundDropConfirmation', checked);
      };

      mountModal(
        <ConfirmationModal
          intl={intl}
          onConfirm={onConfirm}
          title={intl.formatMessage(intlMessages.confirmationTitle)}
          description={intl.formatMessage(intlMessages.confirmationDescription, { 0: file.name })}
          checkboxMessageId="app.confirmation.skipConfirm"
        />
      );
    };

    const onDragLeaveHandler = (e) => {
      resetEvent(e);
      setDragging(false);
      setDraggingOver(false);
    };

    return {
      onDragOver: onDragOverHandler,
      onDrop: onDropHandler,
      onDragLeave: onDragLeaveHandler,
    };
  }, [Auth.userID]);

  return React.cloneElement(children, { ...props, dragging, draggingOver, makeDragOperations });
};

const Wrapper = (Component) => (props) => (
  <DragAndDrop {...props} >
    <Component />
  </DragAndDrop>
);

export const withDragAndDrop = (Component) =>
  withModalMounter(injectIntl(withFileReader(Wrapper(Component), MIME_TYPES_ALLOWED, MAX_FILE_SIZE)));
