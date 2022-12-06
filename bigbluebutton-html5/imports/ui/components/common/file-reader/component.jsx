import React, { useRef } from 'react';
import _ from 'lodash';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { notify } from '/imports/ui/services/notification';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';

const intlMessages = defineMessages({
  maximumSizeExceeded: {
    id: 'app.video.virtualBackground.maximumFileSizeExceeded',
    description: 'Label for the maximum file size exceeded notification',
  },
  typeNotAllowed: {
    id: 'app.video.virtualBackground.typeNotAllowed',
    description: 'Label for the file type not allowed notification',
  },
  errorOnRead: {
    id: 'app.video.virtualBackground.errorOnRead',
    description: 'Label for the error on read notification',
  },
  uploaded: {
    id: 'app.video.virtualBackground.uploaded',
    description: 'Label for when the file is uploaded',
  },
  uploading: {
    id: 'app.video.virtualBackground.uploading',
    description: 'Label for when the file is uploading',
  },
});

const STATUS = {
  LOADING: 'loading',
  DONE: 'done',
  ERROR: 'error',
};

/**
 * HOC for injecting a file reader utility.
 * @param {React.Component} Component 
 * @param {string[]} mimeTypesAllowed String array containing MIME types allowed.
 * @param {number} maxFileSize Max file size allowed in Mbytes.
 * @returns A new component which accepts the same props as the wrapped component plus
 * a function called readFile.
 */
const withFileReader = (
  Component,
  mimeTypesAllowed,
  maxFileSize,
) => (props) => {
  const { intl } = props;
  const toastId = useRef(null);

  const parseFilename = (filename = '') => {
    const substrings = filename.split('.');
    substrings.pop();
    const filenameWithoutExtension = substrings.join('');
    return filenameWithoutExtension;
  };

  const renderToastContent = (text, status) => {
    let icon;
    let statusMessage;

    switch (status) {
      case STATUS.LOADING:
        icon = 'blank';
        statusMessage = intl.formatMessage(intlMessages.uploading);
        break;
      case STATUS.DONE:
        icon = 'check';
        statusMessage = intl.formatMessage(intlMessages.uploaded);
        break;
      case STATUS.ERROR:
      default:
        icon = 'circle_close'
        statusMessage = intl.formatMessage(intlMessages.errorOnRead);
    }

    return (
      <Styled.Content>
        <Styled.FileLine>
          <Icon iconName="file" />
          <Styled.ToastFileName>{text}</Styled.ToastFileName>
          <span>
            <Styled.ToastIcon
              iconName={icon}
              loading={status === STATUS.LOADING}
              done={status === STATUS.DONE}
              error={status === STATUS.ERROR}
            />
          </span>
        </Styled.FileLine>
        <Styled.Status>
          <span>
            {statusMessage}
          </span>
        </Styled.Status>
      </Styled.Content>
    );
  };

  const renderToast = (text = '', status = STATUS.DONE, callback) => {
    if (toastId.current) {
      toast.dismiss(toastId.current);
    }

    toastId.current = toast.info(renderToastContent(text, status), {
      hideProgressBar: status === STATUS.DONE ? false : true,
      autoClose: status === STATUS.DONE ? 5000 : false,
      newestOnTop: true,
      closeOnClick: true,
      onClose: () => {
        toastId.current = null;
      },
      onOpen: () => {
        if (typeof callback === 'function') callback();
      },
    });
  };

  const readFile = (
    file,
    onSuccess = () => {},
    onError = () => {},
  ) => {
    if (!file) return;

    const { name, size, type } = file;
    const sizeInKB = size / 1024;

    if (sizeInKB > maxFileSize) {
      notify(
        intl.formatMessage(
          intlMessages.maximumSizeExceeded,
          { 0: (maxFileSize / 1000).toFixed(0) },
        ),
        'error',
      );
      return onError(new Error('Maximum file size exceeded.'));
    }

    if (!mimeTypesAllowed.includes(type)) {
      notify(
        intl.formatMessage(intlMessages.typeNotAllowed),
        'error',
      );
      return onError(new Error('File type not allowed.'));
    }

    const filenameWithoutExtension = parseFilename(name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = {
        filename: filenameWithoutExtension,
        data: e.target.result,
        uniqueId: _.uniqueId(),
      };
      renderToast(name, STATUS.DONE, () => { onSuccess(data); });
    };

    reader.onerror = () => {
      renderToast(name, STATUS.ERROR, () => {
        onError(new Error('Something went wrong when reading the file.'));
      });
    };

    reader.onloadstart = () => {
      renderToast(name, STATUS.LOADING);
    };

    reader.readAsDataURL(file);
  };

  return <Component readFile={readFile} {...props} />;
}

export default withFileReader;
