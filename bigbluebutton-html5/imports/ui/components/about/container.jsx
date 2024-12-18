import React from 'react';

import AboutComponent from './component';

const AboutContainer = (props) => {
  const { children, ...rest } = props;
  return (
    <AboutComponent {...rest} settings={window.meetingClientSettings.public.app}>
      {children}
    </AboutComponent>
  );
};

export default AboutContainer;
