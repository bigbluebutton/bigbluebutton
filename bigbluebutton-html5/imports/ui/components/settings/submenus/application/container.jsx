import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Application from './component';


const ApplicationContainer = ({ children, ...props }) => (
  <Application {...props}>
    {children}
  </Application>
);

export default withTracker(() => ({
  fontSizes: [
    '12px',
    '14px',
    '16px',
    '18px',
    '20px',
  ],
}))(ApplicationContainer);
