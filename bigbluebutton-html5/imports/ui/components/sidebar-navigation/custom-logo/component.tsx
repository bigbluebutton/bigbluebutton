import React, { memo } from 'react';
import Styled from './styles';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';

const CustomLogo = () => {
  const customLogoUrl = useStorageKey('CustomLogoUrl', 'session');
  const customDarkLogoUrl = useStorageKey('CustomDarkLogoUrl', 'session');
  const { darkTheme } = useSettings(SETTINGS.APPLICATION) as { darkTheme?: boolean };
  const logoUrl = darkTheme ? customDarkLogoUrl : customLogoUrl;

  if (!logoUrl || typeof logoUrl !== 'string') return null;

  return (
    <div>
      <Styled.Branding data-test="brandingArea">
        <img src={logoUrl} alt="custom branding logo" />
      </Styled.Branding>
    </div>
  );
};

export default memo(CustomLogo);
