import React from 'react';
import LayoutModalComponent from './component';
import useUserChangedLocalSettings from '/imports/ui/services/settings/hooks/useUserChangedLocalSettings';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelect } from '../context';
import { suportedLayouts, layoutAllowedInSettings } from '/imports/ui/components/layout/utils';
import { useLayoutUpdater } from '../push-layout/hooks';

const LayoutModalContainer = (props) => {
  const {
    intl, setIsOpen, onRequestClose, isOpen,
  } = props;
  const setLocalSettings = useUserChangedLocalSettings();
  const layoutSettings = useSettings(SETTINGS.LAYOUT);
  const { data: currentUser } = useCurrentUser((u) => ({
    presenter: u.presenter,
    isModerator: u.isModerator,
  }));
  const updateLayout = useLayoutUpdater(true);
  return (
    <LayoutModalComponent {...{
      intl,
      setIsOpen,
      isModerator: currentUser?.isModerator ?? false,
      isPresenter: currentUser?.presenter ?? false,
      layoutSettings,
      onRequestClose,
      isOpen,
      setLocalSettings,
      deviceType: layoutSelect((i) => i.deviceType),
      availableLayouts: suportedLayouts.filter(
        (layout) => layoutAllowedInSettings(layout.layoutKey),
      ),
      updateLayout,
    }}
    />
  );
};

export default LayoutModalContainer;
