import React, { useContext, useEffect, useState, useCallback } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import { CustomVirtualBackgroundsContext } from '/imports/ui/components/video-preview/virtual-background/context';
import { EFFECT_TYPES } from '/imports/ui/services/virtual-background/service';
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
  const { children, intl, readFile, onVirtualBgDrop: onAction, isStream } = props;

  const [dragging, setDragging] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [isConfirmModalOpen, setConfirmModalIsOpen] = useState(false);
  const [file, setFile] = useState(false);
  const { dispatch: dispatchCustomBackground } = useContext(CustomVirtualBackgroundsContext);

  let callback;
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

  const handleStartAndSaveVirtualBackground = (file) => {
    const onSuccess = (background) => {
      const { filename, data } = background;
      if (onAction) {
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
      } else dispatchCustomBackground({
        type: 'new',
        background: {
          ...background,
          custom: true,
          lastActivityDate: Date.now(),
        },
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

  callback = (checked) => {
    handleStartAndSaveVirtualBackground(file);
    Session.set('skipBackgroundDropConfirmation', checked);
  };

  const makeDragOperations = useCallback((userId) => {
    if (!userId || Auth.userID !== userId || !ENABLE_WEBCAM_BACKGROUND_UPLOAD || !isStream) return {};

    const startAndSaveVirtualBackground = (file) => handleStartAndSaveVirtualBackground(file);

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

      setFile(file);
      setConfirmModalIsOpen(true);
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

  return <>
    {React.cloneElement(children, { ...props, dragging, draggingOver, makeDragOperations })}
    {isConfirmModalOpen ? <ConfirmationModal
        intl={intl}
        onConfirm={callback}
        title={intl.formatMessage(intlMessages.confirmationTitle)}
        description={intl.formatMessage(intlMessages.confirmationDescription, { 0: file.name })}
        checkboxMessageId="app.confirmation.skipConfirm" 
        {...{
          onRequestClose: () => setConfirmModalIsOpen(false),
          priority: "low",
          setIsOpen: setConfirmModalIsOpen,
          isOpen: isConfirmModalOpen
        }}
      /> : null}
  </>;
};

const Wrapper = (Component) => (props) => (
  <DragAndDrop {...props} >
    <Component />
  </DragAndDrop>
);

export const withDragAndDrop = (Component) =>
  injectIntl(withFileReader(Wrapper(Component), MIME_TYPES_ALLOWED, MAX_FILE_SIZE));
