import React, {
  useContext, useEffect, useState, useCallback,
} from 'react';
import { injectIntl, defineMessages, IntlShape } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import { CustomVirtualBackgroundsContext } from '/imports/ui/components/video-preview/virtual-background/context';
import { EFFECT_TYPES } from '/imports/ui/services/virtual-background/service';
import VirtualBgService from '/imports/ui/components/video-preview/virtual-background/service';
import logger from '/imports/startup/client/logger';
import withFileReader from '/imports/ui/components/common/file-reader/component';
import Session from '/imports/ui/services/storage/in-memory';

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

interface DragAndDropProps {
  readFile: (
    file: File,
    onSuccess: (data: {
      filename: string,
      data: string,
      uniqueId: string,
    }) => void,
    onError: (error: Error) => void
  ) => void;
  children: React.ReactElement;
  intl: IntlShape;
  isStream: boolean;
  onVirtualBgDrop: (type: string, name: string, data: string) => Promise<void>;
}

const DragAndDrop: React.FC<DragAndDropProps> = (props) => {
  const {
    children, intl, readFile, onVirtualBgDrop: onAction, isStream,
  } = props;

  const [dragging, setDragging] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { dispatch: dispatchCustomBackground } = useContext(CustomVirtualBackgroundsContext);

  const resetEvent = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      resetEvent(e);
      setDragging(true);
    };
    const onDragLeave = (e: DragEvent) => {
      resetEvent(e);
      setDragging(false);
    };
    const onDrop = (e: DragEvent) => {
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

  const handleStartAndSaveVirtualBackground = (file: File) => {
    const onSuccess = (background: {
      filename: string,
      data: string,
      uniqueId: string,
    }) => {
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
      } else {
        dispatchCustomBackground({
          type: 'new',
          background: {
            ...background,
            custom: true,
            lastActivityDate: Date.now(),
          },
        });
      }
    };

    const onError = (error: Error) => {
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

  const callback = (checked: boolean) => {
    if (!file) return;
    handleStartAndSaveVirtualBackground(file);
    Session.setItem('skipBackgroundDropConfirmation', checked);
  };

  const makeDragOperations = useCallback((userId: string) => {
    const PUBLIC_CONFIG = window.meetingClientSettings.public;
    const ENABLE_WEBCAM_BACKGROUND_UPLOAD = PUBLIC_CONFIG.virtualBackgrounds.enableVirtualBackgroundUpload;

    if (!userId || Auth.userID !== userId || !ENABLE_WEBCAM_BACKGROUND_UPLOAD || !isStream) return {};

    const startAndSaveVirtualBackground = (file: File) => handleStartAndSaveVirtualBackground(file);

    const onDragOverHandler = (e: DragEvent) => {
      resetEvent(e);
      setDraggingOver(true);
      setDragging(false);
    };

    const onDropHandler = (e: DragEvent) => {
      resetEvent(e);
      setDraggingOver(false);
      setDragging(false);

      if (e.dataTransfer) {
        const { files } = e.dataTransfer;
        const file = files[0];

        if (Session.getItem('skipBackgroundDropConfirmation')) {
          return startAndSaveVirtualBackground(file);
        }

        setFile(file);
        setIsConfirmModalOpen(true);
      }
      return null;
    };

    const onDragLeaveHandler = (e: DragEvent) => {
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

  return (
    <>
      {React.cloneElement(
        children,
        {
          ...props, dragging, draggingOver, makeDragOperations,
        },
      )}
      {isConfirmModalOpen ? (
        <ConfirmationModal
          intl={intl}
          onConfirm={callback}
          title={intl.formatMessage(intlMessages.confirmationTitle)}
          description={intl.formatMessage(intlMessages.confirmationDescription, { fileName: file?.name })}
          checkboxMessageId="app.confirmation.skipConfirm"
          {...{
            onRequestClose: () => setIsConfirmModalOpen(false),
            priority: 'low',
            setIsOpen: setIsConfirmModalOpen,
            isOpen: isConfirmModalOpen,
          }}
        />
      ) : null}
    </>
  );
};

const Wrapper = (Component: (props: object) => JSX.Element) => (props: DragAndDropProps) => (
  <DragAndDrop
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    <Component />
  </DragAndDrop>
);

const withDragAndDrop = (Component: (props: object) => JSX.Element) => injectIntl(
  withFileReader(
    Wrapper(Component),
    MIME_TYPES_ALLOWED, MAX_FILE_SIZE,
  ),
);

export default withDragAndDrop;
