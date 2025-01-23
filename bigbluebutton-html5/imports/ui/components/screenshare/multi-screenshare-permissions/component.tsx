import React, { useRef } from 'react';
import Styled from './styles';
import { useIntl } from 'react-intl';
import { useSubscription } from '@apollo/client';
import { meetingMultiScreensharePermissions } from './queries';

interface MultiScreensharePermissionsModalContainerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onRequestClose: () => void;
  priority: string;
}

interface MultiScreensharePermissionsModalProps extends MultiScreensharePermissionsModalContainerProps {
  screenShareBroadcastAllowedFor: string;
  viewerScreenShareViewAllowedFor: string;
}

const MultiScreensharePermissionsModal: React.FunctionComponent<MultiScreensharePermissionsModalProps> = ({
isOpen,
setIsOpen,
onRequestClose,
priority,
screenShareBroadcastAllowedFor,
viewerScreenShareViewAllowedFor,
}) => {
  const intl = useIntl();

  const screenSharePermissions = useRef([
    {
      key: 'PRESENTER',
      text: 'Presenter',
    },
    {
      key: 'MODERATORS',
      text: 'Moderators',
    },
    {
      key: 'VIEWERS',
      text: 'Viewers',
    },
  ]);

  const viewerPermissions = useRef([]);

  return (
    <Styled.MultiScreenSharePermissionsModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      priority={priority}
      contentLabel={"Multi-Screenshare Permissions"}
      title={"Multi-Screenshare Permissions"} 
    >
      <Styled.Container
        data-test="multi-screenshare-permissions-modal"
      >
        <Styled.Description>
          Multi screenshare Permissions
        </Styled.Description>
        <Styled.Content>
        </Styled.Content>
      </Styled.Container>
    </Styled.MultiScreenSharePermissionsModal>
  );
};

const MultiScreensharePermissionsModalContainer: React.FunctionComponent<MultiScreensharePermissionsModalContainerProps> = ({
  isOpen,
  setIsOpen,
  onRequestClose,
  priority,
}) => {
  const {
    data: permissionsData,
    loading: permissionsLoading,
    error: permissionsError,
  } = useSubscription(meetingMultiScreensharePermissions);

  if (permissionsError) {
    console.error(permissionsError);
    return null;
  }

  if (permissionsLoading) return null;
  if (!permissionsData) return null;

  const { screenShareBroadcastAllowedFor, viewerScreenShareViewAllowedFor } = permissionsData.meeting[0];
  return (
    <MultiScreensharePermissionsModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onRequestClose={onRequestClose}
      priority={priority}
      screenShareBroadcastAllowedFor={screenShareBroadcastAllowedFor}
      viewerScreenShareViewAllowedFor={viewerScreenShareViewAllowedFor}
    />
  );
};

export default MultiScreensharePermissionsModalContainer;
