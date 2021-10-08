import React from 'react';

/*
  To enable a detailed log of why a specific component is rendering,
  execute this code in your browser's console:

  require('/imports/ui/components/nav-bar/component.jsx').default.whyDidYouRender = {
    logOnDifferentValues: true,
    customName: 'Navbar',
  }

*/

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: false,
  });
}
