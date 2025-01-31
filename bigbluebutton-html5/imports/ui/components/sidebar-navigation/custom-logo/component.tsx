import React, { useEffect, useState } from 'react';
import Styled from './styles';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import { isDarkThemeEnabled } from '/imports/ui/components/app/service';

const CustomLogo = () => {
  const customLogoUrl = useStorageKey('CustomLogoUrl', 'session');
  const customDarkLogoUrl = useStorageKey('CustomDarkLogoUrl', 'session');
  const [darkModeIsEnabled, setDarkModeIsEnabled] = useState(isDarkThemeEnabled());
  const logoUrl = darkModeIsEnabled ? customDarkLogoUrl : customLogoUrl;

  useEffect(() => {
    const handleDarkModeChange = (event: CustomEvent<{
      enabled: boolean,
    }>) => {
      setDarkModeIsEnabled(event.detail.enabled);
    };

    window.addEventListener('darkmodechange', handleDarkModeChange as EventListener);

    return () => {
      window.removeEventListener('darkmodechange', handleDarkModeChange as EventListener);
    };
  }, []);

  if (!logoUrl || typeof logoUrl !== 'string') return null;

  return (
    <div>
      <Styled.Branding data-test="brandingArea">
        <img src={logoUrl} alt="custom branding logo" />
      </Styled.Branding>
    </div>
  );
};

export default CustomLogo;
