import React from 'react';
import BBB from '/imports/api/bbb';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '/imports/startup/client/routes';

Meteor.startup(() => {
  render(renderRoutes(), document.getElementById('app'));
});
