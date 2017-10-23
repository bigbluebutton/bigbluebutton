import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Application from './component';


const ApplicationContainer = props => (
  <Application {...props}>
    {props.children}
  </Application>
    );

export default createContainer(() => ({
  fontSizes: [
    '12px',
    '14px',
    '16px',
    '18px',
    '20px',
  ],
}), ApplicationContainer);
