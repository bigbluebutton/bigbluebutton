import React from 'react';
import Styled from './styles';
import { useIntl } from 'react-intl';

interface MultiScreensharePermissionsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onRequestClose: () => void;
  priority: string;

}

const MultiScreensharePermissionsModal: React.FunctionComponent<MultiScreensharePermissionsModalProps> = ({
isOpen,
setIsOpen,
onRequestClose,
priority,
}) => {
  const intl = useIntl();
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

        </Styled.Description>
        <Styled.Content>
        </Styled.Content>
      </Styled.Container>
    </Styled.MultiScreenSharePermissionsModal>
  );
};

export default MultiScreensharePermissionsModal;
