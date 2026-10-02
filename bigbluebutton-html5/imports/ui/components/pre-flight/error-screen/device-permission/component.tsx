import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import LockPersonIcon from '@mui/icons-material/LockPersonOutlined';
import HeadphonesIcon from '@mui/icons-material/HeadphonesOutlined';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import {
  PreFlightErrorAction,
  PreFlightErrorActions,
  PreFlightErrorHeader,
} from '../component';

const intlMessages = defineMessages({
  badge: {
    id: 'app.preFlight.devicePermissionBadge',
    description: 'Condition stated above the device permission error message',
  },
  title: {
    id: 'app.preFlight.devicePermissionTitle',
    description: 'Heading of the device permission error screen',
  },
  description: {
    id: 'app.preFlight.devicePermissionDescription',
    description: 'What a user who denied a device can do about it',
  },
  helpLabel: {
    id: 'app.preFlight.devicePermissionHelp',
    description: 'Link to the help page from the device permission error screen',
  },
  listenOnlyLabel: {
    id: 'app.audioModal.listenOnlyLabel',
    description: 'Label of the button that drops the microphone for listen only',
  },
  withoutMicrophoneLabel: {
    id: 'app.preFlight.continueWithoutMicrophoneLabel',
    description: 'Label of the button that joins without audio past the denied microphone',
  },
  withoutCameraLabel: {
    id: 'app.preFlight.continueWithoutCameraLabel',
    description: 'Label of the button that turns the denied camera off',
  },
  retryLabel: {
    id: 'app.preFlight.retryLabel',
    description: 'Label of the button that asks for the device permissions again',
  },
});

export const DevicePermissionHeader: React.FC = () => {
  const intl = useIntl();
  const { helpLink } = window.meetingClientSettings.public.app;

  return (
    <PreFlightErrorHeader
      badge={intl.formatMessage(intlMessages.badge)}
      badgeIcon={<LockPersonIcon />}
      title={intl.formatMessage(intlMessages.title)}
      wideTitle
      description={intl.formatMessage(intlMessages.description)}
      helpLink={{ label: intl.formatMessage(intlMessages.helpLabel), url: helpLink }}
      dataTest="preFlightDevicePermission"
    />
  );
};

interface DevicePermissionActionsProps {
  // Offered only where the meeting allows listen only; it drops the camera too
  // when that one is denied as well, so a single click clears the screen.
  onListenOnly?: (() => void) | null;
  // Its stand-in where listen only is off, dropping the camera the same way.
  onContinueWithoutMicrophone?: (() => void) | null;
  // Offered when only the camera is denied.
  onContinueWithoutCamera?: (() => void) | null;
  onRetry: () => void;
}

export const DevicePermissionActions: React.FC<DevicePermissionActionsProps> = ({
  onListenOnly = null,
  onContinueWithoutMicrophone = null,
  onContinueWithoutCamera = null,
  onRetry,
}) => {
  const intl = useIntl();
  const actions: PreFlightErrorAction[] = [];

  if (onListenOnly) {
    actions.push({
      label: intl.formatMessage(intlMessages.listenOnlyLabel),
      onClick: onListenOnly,
      icon: <HeadphonesIcon />,
      dataTest: 'preFlightListenOnlyButton',
    });
  } else if (onContinueWithoutMicrophone) {
    actions.push({
      label: intl.formatMessage(intlMessages.withoutMicrophoneLabel),
      onClick: onContinueWithoutMicrophone,
      icon: <MicOffIcon />,
      dataTest: 'preFlightWithoutMicrophoneButton',
    });
  } else if (onContinueWithoutCamera) {
    actions.push({
      label: intl.formatMessage(intlMessages.withoutCameraLabel),
      onClick: onContinueWithoutCamera,
      icon: <VideocamOffIcon />,
      dataTest: 'preFlightWithoutCameraButton',
    });
  }

  actions.push({
    label: intl.formatMessage(intlMessages.retryLabel),
    onClick: onRetry,
    variant: 'primary',
    dataTest: 'preFlightRetryButton',
  });

  return <PreFlightErrorActions actions={actions} />;
};
