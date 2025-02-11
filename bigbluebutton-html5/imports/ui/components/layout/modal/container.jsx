import React from 'react';
import LayoutModalComponent from './component';
import { updateSettings } from '/imports/ui/components/settings/service';
import useUserChangedLocalSettings from '/imports/ui/services/settings/hooks/useUserChangedLocalSettings';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const LayoutModalContainer = (props) => {
  const {
    intl, setIsOpen, onRequestClose, isOpen,
  } = props;
  const setLocalSettings = useUserChangedLocalSettings();
  const application = useSettings(SETTINGS.APPLICATION);
  const { data: currentUser } = useCurrentUser((u) => ({
    presenter: u.presenter,
    isModerator: u.isModerator,
  }));
  return (
    <LayoutModalComponent {...{
      intl,
      setIsOpen,
      isModerator: currentUser?.isModerator ?? false,
      isPresenter: currentUser?.presenter ?? false,
      application,
      updateSettings,
      onRequestClose,
      isOpen,
      setLocalSettings,
    }}
    />
  );
};

export default LayoutModalContainer;
