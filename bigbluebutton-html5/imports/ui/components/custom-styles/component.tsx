import React from 'react';
import useUserSettings from '/imports/ui/core/local-states/useUserSettings';

interface CustomStylesProps {
  children: React.ReactNode;
}

const CustomStyles: React.FC<CustomStylesProps> = (props) => {
  const { children } = props;

  const [userSettings] = useUserSettings();

  const customStyleUrl = userSettings.bbb_custom_style_url
    || window.meetingClientSettings.public.app.customStyleUrl;
  const customStyle = userSettings.bbb_custom_style;

  return (
    <>
      {customStyleUrl && typeof customStyleUrl === 'string' ? <link rel="stylesheet" type="text/css" href={customStyleUrl} /> : null}
      {customStyle && typeof customStyle === 'string' ? <link rel="stylesheet" type="text/css" href={`data:text/css;charset=UTF-8,${encodeURIComponent(customStyle)}`} /> : null}
      {children}
    </>
  );
};

export default CustomStyles;
