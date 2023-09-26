import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import { Meteor } from 'meteor/meteor';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import { CustomVirtualBackgroundsContext } from '/imports/ui/components/video-preview/virtual-background/context';
import { EFFECT_TYPES } from '/imports/ui/services/virtual-background/service';
import VirtualBgService from '/imports/ui/components/video-preview/virtual-background/service';
import logger from '/imports/startup/client/logger';
import withFileReader from '/imports/ui/components/common/file-reader/component';
import { VideoListItemContainerProps } from '../component';

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

interface DragAndDropProps {
  readFile: (file: File, onSuccess: (background: {
    filename: string, data: string | ArrayBuffer
  }) => void,
    onError: (error: ReturnType<typeof Error>) => void) => void;
  onVirtualBgDrop: (
    tream: string,
    type: string,
    name: string,
    data: string | ArrayBuffer,
  ) => Promise<void>;
  isStream: boolean;
}

interface ExtendedDragAndDropProps extends DragAndDropProps {
  children: React.ReactNode;
}

const DragAndDrop: React.FC<ExtendedDragAndDropProps> = (props) => {
  const {
    // @ts-ignore children is a JS component
    children,
    readFile,
    onVirtualBgDrop: onAction,
    isStream,
  } = props;
  const intl = useIntl();
  const [dragging, setDragging] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [isConfirmModalOpen, setConfirmModalIsOpen] = useState(false);
  const [file, setFile] = useState<File>();
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

  const handleStartAndSaveVirtualBackground = (fileItem: File) => {
    const onSuccess = (background: { filename: string, data: string | ArrayBuffer}) => {
      const { filename, data } = background;
      if (onAction) {
        onAction('', EFFECT_TYPES.IMAGE_TYPE, filename, data).then(() => {
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

    const onError = (error: ReturnType<typeof Error>) => {
      logger.warn({
        logCode: 'read_file_error',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, error.message);
    };

    readFile(fileItem, onSuccess, onError);
  };

  const callback = (checked: boolean) => {
    handleStartAndSaveVirtualBackground(file as File);
    Session.set('skipBackgroundDropConfirmation', checked);
  };

  const makeDragOperations = useCallback((userId: string) => {
    if (
      !userId
      || Auth.userID !== userId
      || !ENABLE_WEBCAM_BACKGROUND_UPLOAD
      || !isStream
    ) return {};

    const startAndSaveVirtualBackground = (fileItem: File) => {
      handleStartAndSaveVirtualBackground(fileItem);
    };

    const onDragOverHandler = (e: DragEvent) => {
      resetEvent(e);
      setDraggingOver(true);
      setDragging(false);
    };

    const onDropHandler = (e: DragEvent) => {
      resetEvent(e);
      setDraggingOver(false);
      setDragging(false);

      const fileItem = e.dataTransfer?.files[0];

      if (Session.get('skipBackgroundDropConfirmation')) {
        return startAndSaveVirtualBackground(fileItem as File);
      }

      setFile(file);
      return setConfirmModalIsOpen(true);
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
      {/* @ts-ignore */}
      {React.cloneElement(children, {
        ...props,
        dragging,
        draggingOver,
        makeDragOperations,
      })}
      {isConfirmModalOpen ? (
        <ConfirmationModal
          intl={intl}
          onConfirm={callback}
          title={intl.formatMessage(intlMessages.confirmationTitle)}
          description={intl.formatMessage(intlMessages.confirmationDescription, { 0: file?.name })}
          checkboxMessageId="app.confirmation.skipConfirm"
          {...{
            onRequestClose: () => setConfirmModalIsOpen(false),
            priority: 'low',
            setIsOpen: setConfirmModalIsOpen,
            isOpen: isConfirmModalOpen,
          }}
        />
      ) : null}
    </>
  );
};

const Wrapper = (Component: React.FC<VideoListItemContainerProps>) => {
  const WrapComponent: React.FC<DragAndDropProps> = (props) => {
    const {
      readFile,
      onVirtualBgDrop,
      isStream,
    } = props;
    return (
      <DragAndDrop
        readFile={readFile}
        onVirtualBgDrop={onVirtualBgDrop}
        isStream={isStream}
      >
        {/* eslint react/jsx-props-no-spreading: 0 */}
        {/* @ts-ignore wrapper should die */}
        <Component {...props} />
      </DragAndDrop>
    );
  };

  return WrapComponent;
};
export const withDragAndDrop = (Component: React.FC<VideoListItemContainerProps>) => {
  /* @ts-ignore wrapper should die */
  return withFileReader(Wrapper(Component), MIME_TYPES_ALLOWED, MAX_FILE_SIZE);
};

export default withDragAndDrop;
